export async function createDemo(): Promise<Blob> {
  const c = document.createElement("canvas");
  c.width = 1100;
  c.height = 680;
  const x = c.getContext("2d")!;
  x.fillStyle = "#ffffff";
  x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = "#edf2ee";
  x.fillRect(0, 0, 240, c.height);
  x.fillStyle = "#dce2dc";
  x.fillRect(240, 0, 1, c.height);
  x.fillRect(241, 78, 859, 1);
  const text = (
    s: string,
    a: number,
    b: number,
    size = 18,
    color = "#232b27",
    weight = 400,
  ) => {
    x.fillStyle = color;
    x.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    x.fillText(s, a, b);
  };
  text("Field notes", 28, 48, 22, "#232b27", 650);
  text("Workspace", 28, 110, 14, "#59665e");
  text("Project overview", 28, 157, 17, "#22634b", 600);
  text("Meeting notes", 28, 203);
  text("Shared documents", 28, 249);
  text("Illustrative workspace", 28, 625, 13, "#59665e");
  text("Project overview", 282, 49, 18, "#232b27", 600);
  text("Updated today", 913, 49, 14, "#59665e");
  text("A clearer handoff.", 282, 163, 40, "#232b27", 650);
  text("Keep the next step easy to see.", 282, 209, 21, "#59665e");
  text("Ready to review", 282, 289, 20, "#232b27", 600);
  text("The draft is ready. Check the marked area, then share", 282, 333);
  text("a screenshot with your team.", 282, 367);
  x.fillStyle = "#22634b";
  x.beginPath();
  x.roundRect(282, 410, 182, 48, 8);
  x.fill();
  text("Review draft", 309, 441, 17, "#ffffff", 600);
  text("Contact", 282, 532, 14, "#59665e");
  text("demo@example.test", 282, 566, 18);
  text(
    "All names and content in this example are fictional.",
    282,
    632,
    14,
    "#59665e",
  );
  return new Promise((resolve, reject) =>
    c.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Example unavailable."))),
      "image/png",
    ),
  );
}
