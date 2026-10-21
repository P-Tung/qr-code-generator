"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, QrCode, Check } from "lucide-react";
import Link from "next/link";
import { buildVCard } from "@/lib/vcard";

type Inputs = { firstName:string; lastName:string; phone:string; email:string; organization:string; title:string; website:string; note:string };
const EMPTY: Inputs = { firstName:"", lastName:"", phone:"", email:"", organization:"", title:"", website:"", note:"" };
const fields: Array<[keyof Inputs,string,string,boolean]> = [["firstName","First name","e.g. Ada",true],["lastName","Last name","e.g. Lovelace",false],["phone","Phone number","+1 555 123 4567",true],["email","Email","ada@example.com",false],["organization","Company / organization","Analytical Engines",false],["title","Job title","Founder",false],["website","Website","https://example.com",false]];

export default function ContactQr() {
  const [inputs,setInputs] = useState<Inputs>(EMPTY); const [qr,setQr] = useState(""); const [copied,setCopied] = useState(false);
  const vcard = useMemo(() => { try { return buildVCard(inputs); } catch { return ""; } }, [inputs]);
  useEffect(() => { localStorage.setItem("vcard-qr-inputs",JSON.stringify(inputs)); }, [inputs]);
  // QRCode is asynchronous, so its result is intentionally stored as state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!vcard) { setQr(""); return; } QRCode.toDataURL(vcard,{errorCorrectionLevel:"M",margin:2,width:360,color:{dark:"#09090b",light:"#ffffff"}}).then(setQr).catch(()=>setQr("")); }, [vcard]);
  const set = (key:keyof Inputs,value:string) => setInputs(current=>({...current,[key]:value}));
  const download = () => { if (!vcard) return; const url=URL.createObjectURL(new Blob([vcard],{type:"text/vcard;charset=utf-8"})); const a=document.createElement("a"); a.href=url; a.download=`${[inputs.firstName,inputs.lastName].filter(Boolean).join("-")||"contact"}.vcf`; a.click(); URL.revokeObjectURL(url); };
  const copy = async () => { if (!vcard) return; await navigator.clipboard.writeText(vcard); setCopied(true); setTimeout(()=>setCopied(false),1800); };
  return <main className="page"><header><Link className="brand" href="/">Kavio Software</Link><span className="badge"><QrCode size={15}/> Free tool</span></header><section className="hero"><p className="eyebrow">CONTACT QR CODE GENERATOR</p><h1>Share your contact with one scan.</h1><p className="subtitle">Create a vCard QR code from a phone number and contact details. Scan it with a modern phone to save the contact instantly.</p></section><section className="workspace"><div className="panel form-panel"><h2>Contact details</h2><p className="hint">Your data stays in this browser and is encoded directly into the QR code.</p><div className="grid">{fields.map(([key,label,placeholder,required])=><label key={key} className={key === "website" ? "wide" : ""}>{label}{required && <em>*</em>}<input value={inputs[key]} onChange={e=>set(key,e.target.value)} placeholder={placeholder}/></label>)}<label className="wide">Note<textarea value={inputs.note} onChange={e=>set("note",e.target.value)} placeholder="Optional note" rows={3}/></label></div></div><div className="panel preview-panel"><h2>Preview</h2><div className="qr-box">{qr ? <img src={qr} alt="QR code containing the contact vCard"/> : <span>Enter a name or phone number to generate your QR code.</span>}</div><div className="actions"><button onClick={download} disabled={!vcard}><Download size={17}/> Download .vcf</button><button className="secondary" onClick={copy} disabled={!vcard}>{copied ? <Check size={17}/> : <Copy size={17}/>} {copied ? "Copied" : "Copy raw vCard"}</button></div>{vcard && <details><summary>View raw vCard</summary><pre>{vcard}</pre></details>}</div></section><section className="how"><h2>How it works</h2><div className="steps"><div><strong>1</strong><h3>Enter details</h3><p>Add a phone number, name, email, and any optional information.</p></div><div><strong>2</strong><h3>Show the QR</h3><p>Put the code on a screen, business card, badge, or email signature.</p></div><div><strong>3</strong><h3>Scan and save</h3><p>Open the camera, scan the code, and save the contact card.</p></div></div></section><footer>Built by <a href="https://kaviosoftware.com">Kavio Software</a></footer></main>;
}
