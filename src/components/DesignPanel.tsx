"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useState, type DragEvent } from "react";
import { ArrowLeftRight, RotateCcw, Upload, X } from "lucide-react";
import {
  LOGO_ACCEPT, MAX_LOGO_BYTES, PALETTE, PATTERN_LIST, PRESETS, contrastRatio, isAcceptedLogoType, normalizeHex,
  type ColorTarget, type DotStyle, type LogoFile, type PlateStyle, type QrDesign,
} from "@/lib/qr-design";
import type { DesignCopy } from "@/lib/i18n";

type LogoErrorKey = "logoBadType" | "logoTooLarge" | "logoReadError";

type Props = {
  copy: DesignCopy;
  design: QrDesign;
  logo: LogoFile | null;
  onDesignChange: (patch: Partial<QrDesign>) => void;
  onLogoChange: (logo: LogoFile | null) => void;
  onReset: () => void;
};

const PLATES: PlateStyle[] = ["none", "rounded", "circle"];

const GRID = [
  [1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1],
  [0, 0, 0, 1, 0, 1, 0, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 1, 0, 0, 0, 1, 0, 1, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1],
];

function MiniPattern({ type, qrColor, bgColor }: { type: DotStyle; qrColor: string; bgColor: string }) {
  const cell = 4;
  const gap = 0.8;
  const total = GRID.length * (cell + gap) - gap;
  return (
    <span className="pattern-glyph" style={{ background: bgColor }}>
      <svg viewBox={`0 0 ${total} ${total}`} aria-hidden="true" focusable="false">
        {GRID.flatMap((row, rowIndex) => row.map((filled, columnIndex) => {
          if (!filled) return null;
          const x = columnIndex * (cell + gap);
          const y = rowIndex * (cell + gap);
          const key = `${rowIndex}-${columnIndex}`;
          if (type === "dots") return <circle key={key} cx={x + cell / 2} cy={y + cell / 2} r={cell * 0.38} fill={qrColor} />;
          if (type === "extra-rounded") return <circle key={key} cx={x + cell / 2} cy={y + cell / 2} r={cell * 0.5} fill={qrColor} />;
          const radius = type === "square" ? 0
            : type === "rounded" ? cell * 0.32
            : type === "classy" ? ((rowIndex + columnIndex) % 4 === 0 ? cell * 0.5 : 0)
            : (rowIndex % 2 === 0 ? cell * 0.5 : cell * 0.22);
          return <rect key={key} x={x} y={y} width={cell} height={cell} rx={radius} fill={qrColor} />;
        }))}
      </svg>
    </span>
  );
}

function HexInput({ value, label, onCommit }: { value: string; label: string; onCommit: (hex: string) => void }) {
  const [draft, setDraft] = useState(value.toUpperCase());
  const commit = () => {
    const next = normalizeHex(draft);
    if (next) { setDraft(next.toUpperCase()); onCommit(next); }
    else setDraft(value.toUpperCase());
  };
  return (
    <input
      className="hex-input"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commit(); } }}
      aria-label={label}
      maxLength={7}
      spellCheck={false}
      autoComplete="off"
    />
  );
}

export default function DesignPanel({ copy, design, logo, onDesignChange, onLogoChange, onReset }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [logoError, setLogoError] = useState<LogoErrorKey | null>(null);
  const [target, setTarget] = useState<ColorTarget>("qrColor");

  const readLogo = (file: File | undefined) => {
    if (!file) return;
    if (!isAcceptedLogoType(file)) { setLogoError("logoBadType"); return; }
    if (file.size > MAX_LOGO_BYTES) { setLogoError("logoTooLarge"); return; }
    setLogoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onLogoChange({ name: file.name, dataUrl: reader.result });
      else setLogoError("logoReadError");
    };
    reader.onerror = () => setLogoError("logoReadError");
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    readLogo(event.dataTransfer.files?.[0]);
  };

  const setColor = (key: ColorTarget, value: string) => onDesignChange(key === "qrColor" ? { qrColor: value } : { bgColor: value });
  const lowContrast = contrastRatio(design.qrColor, design.bgColor) < 3;
  const targetLabel = (key: ColorTarget) => key === "qrColor" ? copy.qrColor : copy.background;
  const activeLabel = targetLabel(target);

  return (
    <div className="panel design-panel">
      <div className="design-head">
        <h2>{copy.title}</h2>
        <button type="button" className="design-reset" onClick={onReset}>
          <RotateCcw size={14} /> {copy.reset}
        </button>
      </div>
      <p className="hint">{copy.hint}</p>

      <div className="design-section">
        <h3>{copy.presetsLabel}</h3>
        <div className="preset-grid">
          {PRESETS.map((preset) => {
            const active = design.pattern === preset.pattern && design.qrColor.toLowerCase() === preset.qrColor && design.bgColor.toLowerCase() === preset.bgColor;
            return (
              <button
                key={preset.id}
                type="button"
                className={`preset-tile${active ? " active" : ""}`}
                onClick={() => onDesignChange({ pattern: preset.pattern, qrColor: preset.qrColor, bgColor: preset.bgColor })}
                aria-pressed={active}
              >
                <span className="preset-dots" aria-hidden="true">
                  <i style={{ background: preset.bgColor }} />
                  <i style={{ background: preset.qrColor }} />
                </span>
                <span className="preset-name">{copy.presets[preset.id]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="design-section">
        <h3>{copy.logoLabel}</h3>
        <div
          className={`logo-upload${dragOver ? " dragging" : ""}`}
          onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileRef}
            type="file"
            accept={LOGO_ACCEPT}
            hidden
            onChange={(event) => { readLogo(event.target.files?.[0]); event.target.value = ""; }}
          />
          <button type="button" className="logo-drop" onClick={() => fileRef.current?.click()}>
            <Upload size={17} /> {logo ? copy.logoReplace : copy.logoDrop}
          </button>
          {logo && (
            <div className="logo-current">
              <img src={logo.dataUrl} alt="" />
              <span className="logo-name">{logo.name}</span>
              <button type="button" className="link-button danger" onClick={() => onLogoChange(null)}>
                <X size={14} /> {copy.logoRemove}
              </button>
            </div>
          )}
        </div>
        <p className="hint logo-hint">{copy.logoHint}</p>
        {logoError && <p className="design-warning" role="alert">{copy[logoError]}</p>}
        {logo && (
          <>
            <div className="control">
              <span>{copy.logoSize}</span>
              <output>{Math.round(design.logoSize * 100)}%</output>
            </div>
            <input
              className="size-slider"
              type="range"
              min={0.18}
              max={0.34}
              step={0.01}
              value={design.logoSize}
              onChange={(event) => onDesignChange({ logoSize: Number(event.target.value) })}
              aria-label={copy.logoSize}
            />
            <span className="color-label">{copy.logoBacking}</span>
            <div className="segmented" role="group" aria-label={copy.logoBacking}>
              {PLATES.map((plate) => (
                <button
                  key={plate}
                  type="button"
                  className={design.plate === plate ? "active" : ""}
                  onClick={() => onDesignChange({ plate })}
                  aria-pressed={design.plate === plate}
                >
                  {copy.backing[plate]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="design-section">
        <h3>{copy.patternsLabel}</h3>
        <div className="pattern-grid">
          {PATTERN_LIST.map((style) => (
            <button
              key={style}
              type="button"
              className={`pattern-tile${design.pattern === style ? " active" : ""}`}
              onClick={() => onDesignChange({ pattern: style })}
              title={copy.patterns[style]}
              aria-label={copy.patterns[style]}
              aria-pressed={design.pattern === style}
            >
              <MiniPattern type={style} qrColor={design.qrColor} bgColor={design.bgColor} />
            </button>
          ))}
        </div>
      </div>

      <div className="design-section">
        <div className="design-section-head">
          <h3>{copy.colorsLabel}</h3>
          <button
            type="button"
            className="link-button swap-button"
            onClick={() => onDesignChange({ qrColor: design.bgColor, bgColor: design.qrColor })}
          >
            <ArrowLeftRight size={13} /> {copy.swapColors}
          </button>
        </div>
        <div className="segmented color-targets" role="group" aria-label={copy.colorsLabel}>
          {(["qrColor", "bgColor"] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={target === key ? "active" : ""}
              onClick={() => setTarget(key)}
              aria-pressed={target === key}
            >
              <span className="target-chip" style={{ background: design[key] }} aria-hidden="true" />
              {targetLabel(key)}
            </button>
          ))}
        </div>
        <div className="custom-color">
          <input
            type="color"
            value={design[target]}
            onChange={(event) => setColor(target, event.target.value)}
            aria-label={`${activeLabel} — ${copy.customColor}`}
          />
          <HexInput
            key={`${target}-${design[target]}`}
            value={design[target]}
            label={`${activeLabel} — ${copy.hexLabel}`}
            onCommit={(hex) => setColor(target, hex)}
          />
        </div>
        <span className="color-label palette-label">{copy.paletteLabel}</span>
        <div className="palette" role="group" aria-label={copy.paletteLabel}>
          {PALETTE.map((color) => {
            const selected = design[target].toLowerCase() === color;
            return (
              <button
                key={color}
                type="button"
                className={`palette-swatch${selected ? " active" : ""}`}
                style={{ background: color }}
                onClick={() => setColor(target, color)}
                title={color.toUpperCase()}
                aria-label={`${activeLabel} ${color.toUpperCase()}`}
                aria-pressed={selected}
              />
            );
          })}
        </div>
        {lowContrast && <p className="design-warning" role="status">{copy.contrastWarning}</p>}
      </div>
    </div>
  );
}
