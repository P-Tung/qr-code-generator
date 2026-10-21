import type { Metadata } from "next";
import ContactQr from "@/components/ContactQr";
import "./globals.css";

export const metadata: Metadata = { title: "Free vCard QR Code Generator | Kavio Software", description: "Create a contact QR code from a phone number and share your vCard with one scan.", metadataBase: new URL("https://qr-code-generator.kaviosoftware.com"), alternates: { canonical: "/" }, openGraph: { title: "Free vCard QR Code Generator", description: "Share your contact with one scan.", type: "website" } };
export default function Home() { return <ContactQr />; }
