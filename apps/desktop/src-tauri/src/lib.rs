use image::{DynamicImage, ImageFormat, ImageReader, Limits};
use serde::Serialize;
use std::{
    borrow::Cow,
    io::{Cursor, Write},
    sync::{
        atomic::{AtomicBool, Ordering},
        Mutex,
    },
};
use tauri::{Manager, State};

const MAX_BYTES: usize = 30 * 1024 * 1024;
const MAX_PIXELS: u64 = 32_000_000;
#[derive(Default)]
struct NativeState {
    capturing: AtomicBool,
    clipboard: Mutex<Option<arboard::Clipboard>>,
}
#[derive(Serialize)]
struct Source {
    id: u32,
    kind: &'static str,
    name: String,
    width: u32,
    height: u32,
}
fn check_dimensions(width: u32, height: u32) -> Result<(), String> {
    if width == 0
        || height == 0
        || width > 16384
        || height > 16384
        || u64::from(width) * u64::from(height) > MAX_PIXELS
    {
        return Err("Use an image up to 32 megapixels and 16,384 pixels per side.".into());
    }
    Ok(())
}
fn capture_error(error: impl std::fmt::Display) -> String {
    format!("Capture failed: {error}. Check Screen Recording permission on macOS. On Linux, use X11 if your Wayland session cannot provide capture.")
}
fn list_sources() -> Result<Vec<Source>, String> {
    let mut sources = Vec::new();
    for m in xcap::Monitor::all().map_err(capture_error)? {
        let (Ok(id), Ok(width), Ok(height)) = (m.id(), m.width(), m.height()) else {
            continue;
        };
        if check_dimensions(width, height).is_ok() {
            sources.push(Source {
                id,
                kind: "screen",
                name: m.name().unwrap_or_else(|_| "Screen".into()),
                width,
                height,
            });
        }
    }
    if let Ok(windows) = xcap::Window::all() {
        for w in windows {
            if w.pid().ok() == Some(std::process::id()) || w.is_minimized().unwrap_or(false) {
                continue;
            }
            let (Ok(id), Ok(name), Ok(width), Ok(height)) =
                (w.id(), w.title(), w.width(), w.height())
            else {
                continue;
            };
            if !name.trim().is_empty() && check_dimensions(width, height).is_ok() {
                sources.push(Source {
                    id,
                    kind: "window",
                    name,
                    width,
                    height,
                });
            }
        }
    }
    Ok(sources)
}
#[tauri::command]
async fn capture_sources() -> Result<Vec<Source>, String> {
    tauri::async_runtime::spawn_blocking(list_sources)
        .await
        .map_err(|e| e.to_string())?
}
fn take_capture(kind: &str, id: u32) -> Result<Vec<u8>, String> {
    let rgba = match kind {
        "screen" => {
            let monitor = xcap::Monitor::all()
                .map_err(capture_error)?
                .into_iter()
                .find(|m| m.id().ok() == Some(id))
                .ok_or("This screen is no longer available. Choose a capture source again.")?;
            check_dimensions(
                monitor.width().map_err(capture_error)?,
                monitor.height().map_err(capture_error)?,
            )?;
            monitor.capture_image().map_err(capture_error)?
        }
        "window" => {
            let window = xcap::Window::all()
                .map_err(capture_error)?
                .into_iter()
                .find(|w| w.id().ok() == Some(id) && w.pid().ok() != Some(std::process::id()))
                .ok_or("This window is no longer available. Choose a capture source again.")?;
            check_dimensions(
                window.width().map_err(capture_error)?,
                window.height().map_err(capture_error)?,
            )?;
            window.capture_image().map_err(capture_error)?
        }
        _ => return Err("Choose a screen or window capture source.".into()),
    };
    check_dimensions(rgba.width(), rgba.height())?;
    let mut png = Cursor::new(Vec::new());
    DynamicImage::ImageRgba8(rgba)
        .write_to(&mut png, ImageFormat::Png)
        .map_err(|e| e.to_string())?;
    let bytes = png.into_inner();
    if bytes.len() > MAX_BYTES {
        return Err("This capture is too large to open safely. Choose a smaller window.".into());
    }
    Ok(bytes)
}
#[tauri::command]
async fn capture_image(
    app: tauri::AppHandle,
    state: State<'_, NativeState>,
    kind: String,
    id: u32,
) -> Result<tauri::ipc::Response, String> {
    if kind != "screen" && kind != "window" {
        return Err("Choose a screen or window capture source.".into());
    }
    if state.capturing.swap(true, Ordering::SeqCst) {
        return Err("A screenshot is already being captured.".into());
    }
    let Some(window) = app.get_webview_window("main") else {
        state.capturing.store(false, Ordering::SeqCst);
        return Err("The editor window is unavailable.".into());
    };
    if let Err(e) = window.hide() {
        state.capturing.store(false, Ordering::SeqCst);
        return Err(e.to_string());
    }
    let result = tauri::async_runtime::spawn_blocking(move || {
        std::thread::sleep(std::time::Duration::from_millis(300));
        take_capture(&kind, id)
    })
    .await
    .map_err(|e| e.to_string())
    .and_then(|r| r);
    let restored = window.show().and_then(|_| window.set_focus());
    state.capturing.store(false, Ordering::SeqCst);
    restored.map_err(|e| format!("The editor could not be restored: {e}. Reopen EIMAGE."))?;
    result.map(tauri::ipc::Response::new)
}
fn read_image(bytes: &[u8]) -> Result<(DynamicImage, ImageFormat), String> {
    if bytes.is_empty() || bytes.len() > MAX_BYTES {
        return Err("Use an image under 30 MB.".into());
    }
    let format =
        image::guess_format(bytes).map_err(|_| "Only PNG, JPEG and WebP images are supported.")?;
    if !matches!(
        format,
        ImageFormat::Png | ImageFormat::Jpeg | ImageFormat::WebP
    ) {
        return Err("Only PNG, JPEG and WebP images are supported.".into());
    }
    let dimensions = ImageReader::with_format(Cursor::new(bytes), format)
        .into_dimensions()
        .map_err(|e| e.to_string())?;
    check_dimensions(dimensions.0, dimensions.1)?;
    let mut reader = ImageReader::with_format(Cursor::new(bytes), format);
    let mut limits = Limits::default();
    limits.max_image_width = Some(16384);
    limits.max_image_height = Some(16384);
    limits.max_alloc = Some(256 * 1024 * 1024);
    reader.limits(limits);
    Ok((
        reader
            .decode()
            .map_err(|e| format!("The image could not be decoded: {e}"))?,
        format,
    ))
}
#[tauri::command]
async fn save_image(bytes: Vec<u8>, name: String) -> Result<Option<String>, String> {
    let format = tauri::async_runtime::spawn_blocking({
        let b = bytes.clone();
        move || read_image(&b).map(|(_, f)| f)
    })
    .await
    .map_err(|e| e.to_string())??;
    let extension = match format {
        ImageFormat::Png => "png",
        ImageFormat::Jpeg => "jpg",
        _ => "webp",
    };
    let safe_name: String = name
        .chars()
        .filter(|c| !c.is_control() && !"<>:\"/\\|?*".contains(*c))
        .take(100)
        .collect();
    let name = if safe_name.trim().is_empty() {
        format!("screenshot.{extension}")
    } else {
        std::path::Path::new(&safe_name)
            .with_extension(extension)
            .to_string_lossy()
            .into_owned()
    };
    let Some(file) = rfd::AsyncFileDialog::new()
        .set_title("Save screenshot")
        .set_file_name(name)
        .add_filter("Image", &[extension])
        .save_file()
        .await
    else {
        return Ok(None);
    };
    let path = file.path().to_path_buf();
    if path.extension().and_then(|s| s.to_str()).is_some_and(|s| {
        !s.eq_ignore_ascii_case(extension)
            && !(extension == "jpg" && s.eq_ignore_ascii_case("jpeg"))
    }) {
        return Err(format!(
            "Choose a file name ending in .{extension} to match the selected format."
        ));
    }
    let path = if path.extension().is_none() {
        path.with_extension(extension)
    } else {
        path
    };
    let saved_path = path.to_string_lossy().into_owned();
    tauri::async_runtime::spawn_blocking(move || atomic_save(&path, &bytes))
        .await
        .map_err(|e| e.to_string())??;
    Ok(Some(saved_path))
}
fn atomic_save(path: &std::path::Path, bytes: &[u8]) -> Result<bool, String> {
    let operation = || -> std::io::Result<()> {
        let parent = path
            .parent()
            .ok_or_else(|| std::io::Error::other("No destination folder"))?;
        let mut file = tempfile::NamedTempFile::new_in(parent)?;
        file.write_all(bytes)?;
        file.as_file().sync_all()?;
        file.persist(path).map_err(|e| e.error)?;
        Ok(())
    };
    operation()
        .map(|_| true)
        .map_err(|e| format!("The image could not be saved: {e}. Choose another folder."))
}
#[tauri::command]
async fn copy_image(state: State<'_, NativeState>, bytes: Vec<u8>) -> Result<(), String> {
    let image = tauri::async_runtime::spawn_blocking(move || {
        read_image(&bytes).map(|(image, _)| image.to_rgba8())
    })
    .await
    .map_err(|e| e.to_string())??;
    let mut guard = state
        .clipboard
        .lock()
        .map_err(|_| "Clipboard unavailable. Restart EIMAGE.")?;
    if guard.is_none() {
        *guard =
            Some(arboard::Clipboard::new().map_err(|e| {
                format!("The clipboard is unavailable: {e}. Use Save image instead.")
            })?);
    }
    guard
        .as_mut()
        .unwrap()
        .set_image(arboard::ImageData {
            width: image.width() as usize,
            height: image.height() as usize,
            bytes: Cow::Owned(image.into_raw()),
        })
        .map_err(|e| format!("The image could not be copied: {e}. Use Save image instead."))
}
pub fn run() {
    tauri::Builder::default()
        .manage(NativeState::default())
        .invoke_handler(tauri::generate_handler![
            capture_sources,
            capture_image,
            save_image,
            copy_image
        ])
        .run(tauri::generate_context!())
        .expect("EIMAGE startup failed");
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn dimensions_bound_allocation() {
        assert!(check_dimensions(1920, 1080).is_ok());
        assert!(check_dimensions(0, 1).is_err());
        assert!(check_dimensions(20000, 1).is_err());
        assert!(check_dimensions(8000, 8000).is_err());
    }
    #[test]
    fn invalid_and_non_raster_input_is_rejected() {
        assert!(read_image(b"<svg xmlns='http://www.w3.org/2000/svg'></svg>").is_err());
        assert!(read_image(&[]).is_err());
    }
    #[test]
    fn png_is_decoded_without_metadata() {
        let mut b = Cursor::new(Vec::new());
        DynamicImage::new_rgba8(8, 6)
            .write_to(&mut b, ImageFormat::Png)
            .unwrap();
        let (image, format) = read_image(b.get_ref()).unwrap();
        assert_eq!((image.width(), image.height()), (8, 6));
        assert_eq!(format, ImageFormat::Png);
    }
    #[test]
    fn invalid_capture_kind_never_captures() {
        assert_eq!(
            take_capture("shell", 0).unwrap_err(),
            "Choose a screen or window capture source."
        );
    }
}
