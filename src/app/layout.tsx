import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Free vCard QR Code Generator | Kavio Software", description: "Create a contact QR code from a phone number and share your vCard with one scan." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
