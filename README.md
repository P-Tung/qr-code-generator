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

## Cloudflare Pages

This project is configured as a static Next.js export (`out/`) for Cloudflare Pages. Deploy with:

```bash
npm run build
npx wrangler pages deploy out --project-name=qr-code-generator --branch=main
```

Then attach the custom domain `qr-code-generator.kaviosoftware.com` in Cloudflare Pages under **Custom domains**.

