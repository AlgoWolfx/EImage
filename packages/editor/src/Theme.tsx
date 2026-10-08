import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
export function Theme() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("eimage-theme");
      return saved
        ? saved === "dark"
        : matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("eimage-theme", dark ? "dark" : "light");
    } catch {}
  }, [dark]);
  return (
    <button
      className="icon-button"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setDark((v) => !v)}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
