"use client";
import { useMemo, useRef, useState } from "react";
import { Copy, Download, QrCode, Check, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { buildVCard } from "@/lib/vcard";
import { UI_COPY, type Language } from "@/lib/i18n";
import { DEFAULT_DESIGN, type LogoFile, type QrDesign } from "@/lib/qr-design";
import QrCanvas, { type QrCanvasHandle } from "@/components/QrCanvas";
import DesignPanel from "@/components/DesignPanel";

type Inputs = { firstName:string; lastName:string; phone:string; email:string; organization:string; title:string; website:string; note:string };
const EMPTY: Inputs = { firstName:"", lastName:"", phone:"", email:"", organization:"", title:"", website:"", note:"" };
const fields: Array<keyof Omit<Inputs, "note">> = ["firstName", "lastName", "phone", "email", "organization", "title", "website"];

export default function ContactQr() {
  const [inputs,setInputs] = useState<Inputs>(EMPTY);
  const [language,setLanguage] = useState<Language>("en");
  const [design,setDesign] = useState<QrDesign>(DEFAULT_DESIGN);
  const [logo,setLogo] = useState<LogoFile | null>(null);
  const [copied,setCopied] = useState(false);
  const [copyError,setCopyError] = useState("");
  const [downloadFailed,setDownloadFailed] = useState(false);
  const [renderFailed,setRenderFailed] = useState(false);
  const [busy,setBusy] = useState(false);
  const qrRef = useRef<QrCanvasHandle>(null);
  const t = UI_COPY[language];
  const vcard = useMemo(() => { try { return buildVCard(inputs); } catch { return ""; } }, [inputs]);

  const clearErrors = () => { setDownloadFailed(false); setRenderFailed(false); };
  const set = (key:keyof Inputs,value:string) => { setInputs(current=>({...current,[key]:value})); clearErrors(); };
  const changeDesign = (patch: Partial<QrDesign>) => { setDesign((current)=>({ ...current, ...patch })); clearErrors(); };
  const changeLogo = (next: LogoFile | null) => { setLogo(next); clearErrors(); };
  const fileBase = ([inputs.firstName,inputs.lastName].filter(Boolean).join("-")||"contact").replace(/[^a-z0-9_-]+/gi,"-").replace(/^-|-$/g,"") || "contact";
  const downloadBlob = (blob: Blob, filename: string) => { const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); window.setTimeout(()=>URL.revokeObjectURL(url),1000); };
  const downloadQr = async (format: "png" | "jpeg") => {
    if (!vcard || busy) return;
    setDownloadFailed(false);
    setBusy(true);
    try {
      const blob = await qrRef.current?.getBlob(format);
      if (!blob) { setDownloadFailed(true); return; }
      downloadBlob(blob, `${fileBase}-qr.${format === "png" ? "png" : "jpg"}`);
    } catch {
      setDownloadFailed(true);
    } finally {
      setBusy(false);
    }
  };
  const download = () => { if (!vcard) return; downloadBlob(new Blob([vcard],{type:"text/vcard;charset=utf-8"}), `${fileBase}.vcf`); };
  const copy = async () => { if (!vcard) return; setCopyError(""); try { await navigator.clipboard.writeText(vcard); setCopied(true); setTimeout(()=>setCopied(false),1800); } catch { setCopyError(t.clipboardError); } };
  const resetDesign = () => { setDesign(DEFAULT_DESIGN); setLogo(null); clearErrors(); };

  return <main className="page"><header><Link className="brand" href="/">Kavio Software</Link><div className="header-actions"><button className={`language-button ${language === "en" ? "active" : ""}`} onClick={()=>setLanguage("en")}>EN</button><button className={`language-button ${language === "vi" ? "active" : ""}`} onClick={()=>setLanguage("vi")}>VI</button><span className="badge"><QrCode size={15}/> {t.freeTool}</span></div></header><section className="hero"><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p className="subtitle">{t.subtitle}</p></section><section className="workspace"><div className="panel form-panel"><h2>{t.details}</h2><p className="hint">{t.privacy}</p><div className="grid">{fields.map((key)=>{const [label,placeholder]=t.fields[key]; return <label key={key} className={key === "website" ? "wide" : ""}>{label}<input value={inputs[key]} onChange={e=>set(key,e.target.value)} placeholder={placeholder}/></label>;})}<label className="wide">{t.note}<textarea value={inputs.note} onChange={e=>set("note",e.target.value)} placeholder={t.notePlaceholder} rows={3}/></label></div></div><DesignPanel copy={t.design} design={design} logo={logo} onDesignChange={changeDesign} onLogoChange={changeLogo} onReset={resetDesign}/><div className="panel preview-panel"><h2>{t.preview}</h2><div className="qr-box">{vcard ? <QrCanvas ref={qrRef} value={vcard} design={design} logo={logo} label={t.qrAlt} onError={()=>setRenderFailed(true)}/> : <span>{t.emptyQr}</span>}</div><div className="download-actions"><button onClick={()=>downloadQr("png")} disabled={!vcard || busy}><Download size={17}/> {t.png}</button><button onClick={()=>downloadQr("jpeg")} disabled={!vcard || busy}><Download size={17}/> {t.jpg}</button></div><details className="more-menu"><summary aria-label={t.more}><MoreHorizontal size={20}/></summary><div className="more-menu-popover"><button onClick={download} disabled={!vcard}><Download size={17}/> {t.vcf}</button><button className="secondary" onClick={copy} disabled={!vcard}>{copied ? <Check size={17}/> : <Copy size={17}/>} {copied ? t.copied : t.raw}</button></div></details>{(renderFailed || downloadFailed) && <p className="copy-error">{renderFailed ? t.renderError : t.downloadError}</p>}{copyError && <p className="copy-error">{copyError}</p>}{vcard && <details><summary>{t.viewRaw}</summary><pre>{vcard}</pre></details>}</div></section><section className="how"><h2>{t.how}</h2><div className="steps">{t.steps.map(([step,description],index)=><div key={step}><strong>{index+1}</strong><h3>{step}</h3><p>{description}</p></div>)}</div></section><footer>Built by <a href="https://kaviosoftware.com">Kavio Software</a></footer></main>;
}
