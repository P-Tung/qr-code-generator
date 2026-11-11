"use client";
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import type QRCodeStyling from "qr-code-styling";
import { PATTERNS, composeLogo, type LogoFile, type PlateStyle, type QrDesign } from "@/lib/qr-design";
import { toUtf8Binary } from "@/lib/vcard";

const RENDER_SIZE = 1024;
const QUIET_ZONE = 64;

export type QrCanvasHandle = {
  getBlob: (format: "png" | "jpeg") => Promise<Blob | null>;
};

type Props = {
  value: string;
  design: QrDesign;
  logo: LogoFile | null;
  label: string;
  onError: () => void;
  ref?: Ref<QrCanvasHandle>;
};

// qr-code-styling keeps only the low byte of each char (breaks Vietnamese); feed it UTF-8 bytes as chars.
function buildOptions(value: string, design: QrDesign, image: string | null) {
  const pattern = PATTERNS[design.pattern];
  return {
    data: toUtf8Binary(value),
    image: image ?? undefined,
    width: RENDER_SIZE,
    height: RENDER_SIZE,
    margin: QUIET_ZONE,
    qrOptions: { typeNumber: 0, errorCorrectionLevel: "H" as const },
    imageOptions: { imageSize: design.logoSize, hideBackgroundDots: true, margin: 0 },
    dotsOptions: { type: pattern.dots, color: design.qrColor },
    cornersSquareOptions: { type: pattern.cornerSquare, color: design.qrColor },
    cornersDotOptions: { type: pattern.cornerDot, color: design.qrColor },
    backgroundOptions: { color: design.bgColor },
  };
}

export default function QrCanvas({ value, design, logo, label, onError, ref }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<QRCodeStyling | null>(null);
  const applyRef = useRef<(() => void) | null>(null);
  const errorRef = useRef(onError);
  const [generation, setGeneration] = useState(0);
  const [composed, setComposed] = useState<{ source: string; plate: PlateStyle; dataUrl: string } | null>(null);

  useEffect(() => { errorRef.current = onError; }, [onError]);

  const logoDataUrl = logo?.dataUrl ?? "";
  useEffect(() => {
    if (!logoDataUrl) return;
    let cancelled = false;
    composeLogo(logoDataUrl, design.plate)
      .then((dataUrl) => { if (!cancelled) setComposed({ source: logoDataUrl, plate: design.plate, dataUrl }); })
      .catch(() => { if (!cancelled) errorRef.current(); });
    return () => { cancelled = true; };
  }, [logoDataUrl, design.plate]);

  const composite = composed && composed.source === logoDataUrl && composed.plate === design.plate ? composed.dataUrl : null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    (async () => {
      const loaded = await import("qr-code-styling");
      if (disposed) return;
      const Ctor = loaded.default ?? (loaded as unknown as typeof QRCodeStyling);
      const instance = new Ctor({ type: "canvas", width: RENDER_SIZE, height: RENDER_SIZE });
      instanceRef.current = instance;
      container.replaceChildren();
      instance.append(container);
      setGeneration((current) => current + 1);
    })().catch(() => { if (!disposed) errorRef.current(); });
    return () => {
      disposed = true;
      instanceRef.current = null;
      applyRef.current = null;
      container.replaceChildren();
    };
  }, []);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!generation || !instance) return;
    const apply = () => {
      try {
        instance.update(buildOptions(value, design, composite));
      } catch {
        errorRef.current();
      }
    };
    applyRef.current = apply;
    const timer = window.setTimeout(apply, 120);
    return () => window.clearTimeout(timer);
  }, [generation, value, design, composite]);

  useImperativeHandle(ref, () => ({
    async getBlob(format) {
      const instance = instanceRef.current;
      if (!instance) return null;
      try {
        applyRef.current?.();
        const data = await instance.getRawData(format);
        return data instanceof Blob ? data : null;
      } catch {
        return null;
      }
    },
  }), []);

  return <div ref={containerRef} className="qr-canvas" role="img" aria-label={label} />;
}
