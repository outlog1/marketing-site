# Outlog marketing site

Static HTML site deployed on Vercel at **getoutlog.com**. Repo: `github.com/outlog1/marketing-site`.

## Session resume

Read `../org/HANDOFF.md` for current state. For brand voice and business context, read `../org/CONTEXT_BUSINESS.md`.

## Structure

| File | Purpose |
|---|---|
| `index.html` | Landing page — lead capture, early access CTA |
| `hero.jpg` | Hero image |
| `outlog-logo-primary.svg` | Full logo |
| `outlog-mark.svg` | Topo mark (favicon source) |
| `outlog-mark-favicon.png` | Favicon |
| `signup-sequence/` | Google Apps Script for signup email sequence |

## Design

Fonts: Barlow 400/600 + Inter 400/500 (Google Fonts). Colors: teal `#0A6E5A`, stone `#F0EDE6`, near-black `#1A1A18`, mist `#E8F4F0`. See `../org/DESIGN.md` for full rules. See `../org/BRAND.md` for voice and positioning.

## Domain

- Apex: `getoutlog.com` (Cloudflare DNS → Vercel)
- `www.getoutlog.com` → 308 redirect to apex
- App subdomain: `app.getoutlog.com` (separate Vercel project, `app/` repo)
