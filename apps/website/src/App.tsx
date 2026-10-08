import {
  ArrowUpRight,
  ScanLine,
  Github,
  Download,
  ShieldCheck,
} from "lucide-react";
import { Editor } from "../../../packages/editor/src/Editor";
import { Theme } from "../../../packages/editor/src/Theme";
import "./site.css";
const repo = "https://github.com/AlgoWolfx/EIMAGE";
export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="site-brand" href="#main" aria-label="EIMAGE home">
          <ScanLine size={24} />
          <span>EIMAGE</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#demo">Try the editor</a>
          <a href="#download">Get EIMAGE</a>
          <a href={repo}>GitHub</a>
          <Theme />
        </nav>
      </header>
      <main id="main">
        <section className="intro">
          <h1>
            A screenshot.
            <br />A clearer point.
          </h1>
          <div className="intro-copy">
            <p>
              Capture what matters. Add an arrow, write a note, or conceal a
              private detail. Then copy or save your image.
            </p>
            <div className="intro-actions">
              <a className="button primary" href="#download">
                <Download size={17} />
                Get EIMAGE
              </a>
              <a className="button" href={repo}>
                <Github size={17} />
                View source
              </a>
            </div>
            <p className="free-statement">
              Free and open source. No account. No watermark.
            </p>
          </div>
        </section>
        <section
          className="demonstration"
          id="demo"
          aria-labelledby="demo-heading"
        >
          <div className="section-line">
            <h2 id="demo-heading">Make your point. Try it here.</h2>
            <p>Interactive example · desktop capture runs in the app</p>
          </div>
          <Editor demo />
          <p className="demo-caption">
            This fictional workspace is an example. You can also open your own
            PNG, JPEG or WebP. Editing happens on your device; this page never
            uploads your images.
          </p>
        </section>
        <section className="workflow" aria-labelledby="workflow-heading">
          <h2 id="workflow-heading">
            From your screen <br />
            to someone else’s.
          </h2>
          <ol>
            <li>
              <h3>Capture</h3>
              <p>
                Choose a screen or window in the desktop app. Select a smaller
                region after capture, or open an existing image.
              </p>
            </li>
            <li>
              <h3>Make it clear</h3>
              <p>
                Draw, add an arrow, place text or crop the frame. Cover
                sensitive details with a solid, permanent cover in the exported
                image.
              </p>
            </li>
            <li>
              <h3>Share a local image</h3>
              <p>
                Copy the result to your clipboard or save it as PNG, JPEG or
                WebP. Your screenshots are never sent to an EIMAGE server.
              </p>
            </li>
          </ol>
        </section>
        <section
          id="download"
          className="download-section"
          aria-labelledby="download-heading"
        >
          <div>
            <h2 id="download-heading">
              Yours to use. <br />
              Yours to inspect.
            </h2>
            <p>
              Every feature is free. EIMAGE is MIT-licensed, with a Tauri +
              React desktop app and a public source repository.
            </p>
            <div className="intro-actions">
              <a className="button primary" href={`${repo}/releases`}>
                <Download size={17} />
                Check releases
              </a>
              <a className="button" href={`${repo}#development`}>
                <Github size={17} />
                Build from source
              </a>
            </div>
          </div>
          <div className="release-status">
            <h3>Release status</h3>
            <dl>
              <div>
                <dt>Windows</dt>
                <dd>Build target · platform validation pending</dd>
              </div>
              <div>
                <dt>macOS</dt>
                <dd>Build target · platform validation pending</dd>
              </div>
              <div>
                <dt>Linux</dt>
                <dd>Build target · see the validation report</dd>
              </div>
            </dl>
            <p>
              Public installers and signed releases are not published yet. The
              releases page will list available downloads; build instructions
              are in the repository.
            </p>
            <a href={`${repo}/blob/main/docs/VALIDATION.md`}>
              Read the validation report <ArrowUpRight size={14} />
            </a>
          </div>
        </section>
        <section className="verification" aria-labelledby="verify-heading">
          <div className="verification-heading">
            <ShieldCheck size={26} />
            <h2 id="verify-heading">Check the file you download.</h2>
          </div>
          <p>
            Open source makes the code inspectable. It does not replace checking
            a particular installer. Match the release checksum, inspect its
            signature when available, and scan the downloaded file with
            VirusTotal if you want another check.
          </p>
          <div className="verification-links">
            <a
              href="https://www.virustotal.com/gui/home/upload"
              target="_blank"
              rel="noreferrer"
            >
              Open VirusTotal <ArrowUpRight size={15} />
            </a>
            <a href={`${repo}/blob/main/SECURITY.md`}>
              Security and verification guide <ArrowUpRight size={15} />
            </a>
          </div>
          <p className="verification-note">
            EIMAGE does not upload files to VirusTotal. A scan result describes
            the file scanned; it is not a guarantee that software is risk-free.
          </p>
        </section>
        <section className="faq" aria-labelledby="faq-heading">
          <h2 id="faq-heading">A few practical answers.</h2>
          <div>
            <details>
              <summary>Is EIMAGE really free?</summary>
              <p>
                Yes. All implemented features are free, with no paid tier,
                account requirement, subscription or watermark. The source is
                available under the MIT license.
              </p>
            </details>
            <details>
              <summary>Where do my screenshots go?</summary>
              <p>
                They stay in your editor until you copy or save them. EIMAGE has
                no image upload service or telemetry. Saving writes to the
                location you choose; copying puts the flattened image on your
                system clipboard, which another app may read.
              </p>
            </details>
            <details>
              <summary>Can concealed details be recovered?</summary>
              <p>
                The exported image contains an opaque solid cover over the
                selected pixels. It contains no editable annotation layers or
                original pixels beneath that cover. Check the selected area
                before sharing. The original image, editor undo history and any
                older saved copies can still contain the details until you clear
                or remove them.
              </p>
            </details>
            <details>
              <summary>Does capture work on every Linux desktop?</summary>
              <p>
                X11 is the initial validation target. Wayland capture depends on
                the compositor and desktop portals and is not guaranteed. On
                macOS, grant Screen Recording permission. Platform-specific
                status is documented before a release is published.
              </p>
            </details>
            <details>
              <summary>Can I use it in my browser?</summary>
              <p>
                You can try the local image editor here. Desktop screen and
                window capture use the native Tauri application. The website
                demo does not capture your screen.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a className="site-brand" href="#main">
          <ScanLine size={20} />
          <span>EIMAGE</span>
        </a>
        <span>Built by Yiğit Bayrak · EGORA Digital</span>
        <a href={`${repo}/blob/main/LICENSE`}>MIT license</a>
      </footer>
    </>
  );
}
