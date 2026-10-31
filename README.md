# QR Code Generator

Standalone vCard QR code generator for `qr-code-generator.kaviosoftware.com`.

## Features

- Generate a standard vCard 3.0 QR code from contact details
- Brand the QR with a centered logo (PNG, JPG, GIF or SVG, max 2 MB), six dot patterns, and custom QR/background colors
- Live preview with brand presets, a 40-color palette, free-form color picking for QR dots and background, and a low-contrast warning
- Download 1024px PNG or JPG exports that include the design
- Download the contact as a `.vcf` file
- Copy the raw vCard payload
- Client-side generation; contact data and logos stay in the browser
- Responsive landing page for Cloudflare deployment

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Cloudflare Pages

This project is configured as a static Next.js export (`out/`) for Cloudflare Pages. Deploy with:

```bash
npm run build
npx wrangler pages deploy out --project-name=qr-code-generator --branch=main
```

Then attach the custom domain `qr-code-generator.kaviosoftware.com` in Cloudflare Pages under **Custom domains**. The Cloudflare Pages project is named `qr-code-generator`.

