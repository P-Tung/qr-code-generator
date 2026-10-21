# QR Code Generator

Standalone vCard QR code generator for `qr-code-generator.kaviosoftware.com`.

## Features

- Generate a standard vCard 3.0 QR code from contact details
- Download the contact as a `.vcf` file
- Copy the raw vCard payload
- Client-side generation; contact data is not uploaded
- Responsive landing page for Cloudflare deployment

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Cloudflare

Deploy this Next.js app with Cloudflare Pages/Workers using the current Next-on-Pages or OpenNext adapter for your Cloudflare account. Point the custom hostname `qr-code-generator.kaviosoftware.com` at the deployed project.
