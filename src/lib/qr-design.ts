export type DotStyle = "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded";
export type PlateStyle = "none" | "rounded" | "circle";
export type ColorTarget = "qrColor" | "bgColor";

export type QrDesign = {
  pattern: DotStyle;
  qrColor: string;
  bgColor: string;
  logoSize: number;
  plate: PlateStyle;
};

export type LogoFile = { name: string; dataUrl: string };

export type PatternSpec = {
  dots: DotStyle;
  cornerSquare: "square" | "extra-rounded" | "dot";
  cornerDot: "square" | "dot";
};

export const PATTERNS: Record<DotStyle, PatternSpec> = {
  square: { dots: "square", cornerSquare: "square", cornerDot: "square" },
  rounded: { dots: "rounded", cornerSquare: "extra-rounded", cornerDot: "dot" },
  dots: { dots: "dots", cornerSquare: "dot", cornerDot: "dot" },
  classy: { dots: "classy", cornerSquare: "square", cornerDot: "square" },
  "classy-rounded": { dots: "classy-rounded", cornerSquare: "extra-rounded", cornerDot: "dot" },
  "extra-rounded": { dots: "extra-rounded", cornerSquare: "extra-rounded", cornerDot: "dot" },
};

export const PATTERN_LIST = Object.keys(PATTERNS) as DotStyle[];

export const DEFAULT_DESIGN: QrDesign = {
  pattern: "rounded",
  qrColor: "#0b3d2e",
  bgColor: "#f2fbf5",
  logoSize: 0.26,
  plate: "rounded",
};

export type BrandPreset = { id: "forest" | "ink" | "ocean" | "coral"; qrColor: string; bgColor: string; pattern: DotStyle };

export const PRESETS: BrandPreset[] = [
  { id: "forest", qrColor: "#0b3d2e", bgColor: "#f2fbf5", pattern: "rounded" },
  { id: "ink", qrColor: "#111827", bgColor: "#ffffff", pattern: "square" },
  { id: "ocean", qrColor: "#0c4a6e", bgColor: "#eff8ff", pattern: "extra-rounded" },
  { id: "coral", qrColor: "#9f1239", bgColor: "#fff1f2", pattern: "dots" },
];

// Five lightness rows, light to dark. The upper rows suit backgrounds, the lower rows suit dots.
export const PALETTE: readonly string[] = [
  "#ffffff", "#f8fafc", "#f0fdf4", "#ecfdf5", "#eff8ff", "#eef2ff", "#faf5ff", "#fff1f2",
  "#f1f5f9", "#bbf7d0", "#99f6e4", "#bae6fd", "#c7d2fe", "#e9d5ff", "#fecdd3", "#fde68a",
  "#cbd5e1", "#4ade80", "#2dd4bf", "#38bdf8", "#818cf8", "#c084fc", "#fb7185", "#fbbf24",
  "#64748b", "#16a34a", "#0f766e", "#0369a1", "#4338ca", "#7e22ce", "#e11d48", "#ea580c",
  "#1e293b", "#14532d", "#134e4a", "#0c4a6e", "#312e81", "#4c1d95", "#9f1239", "#7c2d12",
];

export function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(raw)) return `#${raw.split("").map((digit) => digit + digit).join("")}`.toLowerCase();
  if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw}`.toLowerCase();
  return null;
}

export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
export const LOGO_ACCEPT = ".png,.jpg,.jpeg,.gif,.svg,image/png,image/jpeg,image/gif,image/svg+xml";
const LOGO_NAME_PATTERN = /\.(png|jpe?g|gif|svg)$/i;

export function isAcceptedLogoType(file: File): boolean {
  return LOGO_NAME_PATTERN.test(file.name) || file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/gif" || file.type === "image/svg+xml";
}

export function contrastRatio(hexA: string, hexB: string): number {
  const luminance = (hex: string) => {
    const value = parseInt(hex.replace("#", ""), 16);
    const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const [lighter, darker] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function roundedPath(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(() => reject(new Error("Image load timed out")), 8000);
    image.onload = () => { window.clearTimeout(timer); resolve(image); };
    image.onerror = () => { window.clearTimeout(timer); reject(new Error("Image could not be decoded")); };
    image.src = source;
  });
}

export async function composeLogo(dataUrl: string, plate: PlateStyle, size = 512): Promise<string> {
  const image = await loadImage(dataUrl);
  if (!image.naturalWidth || !image.naturalHeight) throw new Error("Image has no dimensions");
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  if (plate !== "none") {
    context.fillStyle = "#ffffff";
    if (plate === "circle") {
      context.beginPath();
      context.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
      context.fill();
    } else {
      roundedPath(context, 0, 0, size, size, size * 0.22);
      context.fill();
    }
  }

  const inset = plate === "none" ? 0.03 : 0.14;
  const box = size * (1 - inset * 2);
  const scale = Math.min(box / image.naturalWidth, box / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
  return canvas.toDataURL("image/png");
}
