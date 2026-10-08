import { Editor } from "../../../packages/editor/src/Editor";
import { Theme } from "../../../packages/editor/src/Theme";
import { bridge } from "./native";
import "./app.css";
export default function App() {
  return (
    <>
      <a className="skip-link" href="#editor">
        Skip to editor
      </a>
      <header className="desktop-top">
        <span>Free, open source. Your screenshots stay on your device.</span>
        <Theme />
      </header>
      <main id="editor" className="desktop-main">
        <Editor bridge={bridge} />
      </main>
      <footer className="desktop-bottom">
        <span>
          {bridge
            ? "Ctrl/Cmd+Shift+S capture · Ctrl/Cmd+S save · Ctrl/Cmd+C copy"
            : "Browser preview · Screen capture requires the desktop app"}
        </span>
        <span>Yiğit Bayrak · EGORA Digital</span>
      </footer>
    </>
  );
}
