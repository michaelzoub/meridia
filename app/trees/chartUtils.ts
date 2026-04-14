/** Download a canvas element as a PNG */
export function downloadCanvasAsPNG(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

/** Download an SVG element as a PNG via canvas */
export function downloadSVGAsPNG(svg: SVGSVGElement, filename: string, scale = 2): void {
  const { width, height } = svg.getBoundingClientRect();
  const data = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    downloadCanvasAsPNG(canvas, filename);
  };
  img.src = url;
}
