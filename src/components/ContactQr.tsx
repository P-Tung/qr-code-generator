"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, QrCode, Check, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { buildVCard } from "@/lib/vcard";
import { UI_COPY, type Language } from "@/lib/i18n";

type Inputs = { firstName:string; lastName:string; phone:string; email:string; organization:string; title:string; website:string; note:string };
const EMPTY: Inputs = { firstName:"", lastName:"", phone:"", email:"", organization:"", title:"", website:"", note:"" };
const fields: Array<keyof Omit<Inputs, "note">> = ["firstName", "lastName", "phone", "email", "organization", "title", "website"];

export default function ContactQr() {
  const [inputs,setInputs] = useState<Inputs>(EMPTY); const [language,setLanguage] = useState<Language>("en"); const [qr,setQr] = useState(""); const [copied,setCopied] = useState(false); const [copyError,setCopyError] = useState(""); const [imageError,setImageError] = useState("");
  const t = UI_COPY[language];
  const qrRequest = useRef(0);
  const vcard = useMemo(() => { try { return buildVCard(inputs); } catch { return ""; } }, [inputs]);
  useEffect(() => {
    const request = ++qrRequest.current;
    let cancelled = false;
    if (!vcard) {
      Promise.resolve().then(() => { if (!cancelled && request === qrRequest.current) setQr(""); });
      return () => { cancelled = true; };
    }
    QRCode.toDataURL(vcard,{errorCorrectionLevel:"M",margin:2,width:360,color:{dark:"#09090b",light:"#ffffff"}})
      .then(data => { if (!cancelled && request === qrRequest.current) setQr(data); })
      .catch(() => { if (!cancelled && request === qrRequest.current) setQr(""); });
    return () => { cancelled = true; };
  }, [vcard]);
  const set = (key:keyof Inputs,value:string) => setInputs(current=>({...current,[key]:value}));
  const fileBase = ([inputs.firstName,inputs.lastName].filter(Boolean).join("-")||"contact").replace(/[^a-z0-9_-]+/gi,"-").replace(/^-|-$/g,"") || "contact";
  const downloadBlob = (blob: Blob, filename: string) => { const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); };
  const downloadQr = (format: "png" | "jpg") => {
    if (!qr) return;
    setImageError("");
    if (format === "png") { downloadBlob(new Blob([Uint8Array.from(atob(qr.split(",")[1]), char => char.charCodeAt(0))], {type:"image/png"}), `${fileBase}-qr.png`); return; }
    const image = new Image();
    image.onload = () => { const canvas=document.createElement("canvas"); canvas.width=image.naturalWidth; canvas.height=image.naturalHeight; const context=canvas.getContext("2d"); if (!context) { setImageError(t.jpgError); return; } context.fillStyle="#ffffff"; context.fillRect(0,0,canvas.width,canvas.height); context.drawImage(image,0,0); canvas.toBlob(blob => { if (blob) downloadBlob(blob, `${fileBase}-qr.jpg`); else setImageError(t.jpgError); }, "image/jpeg", 0.95); };
    image.onerror = () => setImageError(t.jpgError);
    image.src=qr;
  };
  const download = () => { if (!vcard) return; downloadBlob(new Blob([vcard],{type:"text/vcard;charset=utf-8"}), `${fileBase}.vcf`); };
  const copy = async () => { if (!vcard) return; setCopyError(""); try { await navigator.clipboard.writeText(vcard); setCopied(true); setTimeout(()=>setCopied(false),1800); } catch { setCopyError(t.clipboardError); } };
  return <main className="page"><header><Link className="brand" href="/">Kavio Software</Link><div className="header-actions"><button className={`language-button ${language === "en" ? "active" : ""}`} onClick={()=>setLanguage("en")}>EN</button><button className={`language-button ${language === "vi" ? "active" : ""}`} onClick={()=>setLanguage("vi")}>VI</button><span className="badge"><QrCode size={15}/> {t.freeTool}</span></div></header><section className="hero"><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p className="subtitle">{t.subtitle}</p></section><section className="workspace"><div className="panel form-panel"><h2>{t.details}</h2><p className="hint">{t.privacy}</p><div className="grid">{fields.map((key)=>{const [label,placeholder]=t.fields[key]; return <label key={key} className={key === "website" ? "wide" : ""}>{label}<input value={inputs[key]} onChange={e=>set(key,e.target.value)} placeholder={placeholder}/></label>;})}<label className="wide">{t.note}<textarea value={inputs.note} onChange={e=>set("note",e.target.value)} placeholder={t.notePlaceholder} rows={3}/></label></div></div><div className="panel preview-panel"><h2>{t.preview}</h2><div className="qr-box">{qr ? <img src={qr} alt="QR code containing the contact vCard"/> : <span>{t.emptyQr}</span>}</div><div className="download-actions"><button onClick={()=>downloadQr("png")} disabled={!qr}><Download size={17}/> {t.png}</button><button onClick={()=>downloadQr("jpg")} disabled={!qr}><Download size={17}/> {t.jpg}</button></div><details className="more-menu"><summary aria-label={t.more}><MoreHorizontal size={20}/></summary><div className="more-menu-popover"><button onClick={download} disabled={!vcard}><Download size={17}/> {t.vcf}</button><button className="secondary" onClick={copy} disabled={!vcard}>{copied ? <Check size={17}/> : <Copy size={17}/>} {copied ? t.copied : t.raw}</button></div></details>{imageError && <p className="copy-error">{imageError}</p>}{copyError && <p className="copy-error">{copyError}</p>}{vcard && <details><summary>{t.viewRaw}</summary><pre>{vcard}</pre></details>}</div></section><section className="how"><h2>{t.how}</h2><div className="steps">{t.steps.map(([step,description],index)=><div key={step}><strong>{index+1}</strong><h3>{step}</h3><p>{description}</p></div>)}</div></section><footer>Built by <a href="https://kaviosoftware.com">Kavio Software</a></footer></main>;
}
