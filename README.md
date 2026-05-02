# Outlog landing page (v1)

A static, single-page landing site for **getoutlog.com**. Recruits guides into the Phase 1 beta. Three sentences, one form, brand-locked.

- **Hosting:** Cloudflare Pages (free, unlimited bandwidth)
- **Form:** Tally → Google Sheets (free)
- **Deploy method:** Cloudflare Direct Upload (drag a folder — no GitHub required)

The whole stack costs $0/month. GitHub is an optional upgrade later (see end of this doc).

---

## File map

```
outlog-landing/
  index.html               ← the page
  hero.jpg                 ← hero photo (you save this — see Step 0)
  outlog-logo-primary.svg  ← full lockup (currently inlined in HTML, but here for future use)
  outlog-mark.svg          ← favicon (referenced from index.html)
  README.md                ← this file
```

---

## Step 0: Save the hero image

The page expects a file named `hero.jpg` to live in this folder. Save the river photo there before previewing or deploying — the page renders an empty placeholder block until you do.

If the photo's framing crops awkwardly on your screen, open `index.html` and find `object-position: center 42%`. Adjust the `42%` (0% = top of photo, 100% = bottom) until the figures sit where you want them.

---

## Step 1: Look at it locally

Double-click `index.html`. It opens in your browser. The form is a placeholder — submitting it does nothing yet (you'll wire it up in Step 2).

If anything feels off — copy, sizing, color — tell me and I'll fix it before we deploy.

---

## Step 2: Tally form → Google Sheets

### 2a. Create the form

1. Go to [tally.so](https://tally.so) and sign up (free). Use your `john@getoutlog.com` address once Google Workspace is set up — otherwise a personal Gmail.
2. Click **Create a new form** → **Start from scratch** → **Blank form**.
3. Title it `Outlog — early access`.
4. Delete any default fields. Add **two** fields, in this order:

   **Field 1 — Multiple choice (checkboxes):**
   - Label: `Who are you?`
   - Helper text: `Check all that apply`
   - Field type: **Multiple choice** with **Allow multiple selections** turned on
   - Options:
     - `I'm a guide`
     - `I run a guide service`
     - `I run a shop & service`
   - Required: yes

   **Field 2 — Email:**
   - Label: `Email`
   - Field type: **Email**
   - Required: yes

5. Submit button label: `Request access`.
6. (Optional) Add a thank-you screen with text like: *"Got it. We'll be in touch within a few days."* — set in the form's settings.

### 2b. Match the brand

In Tally's right sidebar, open **Theme** (or **Customize**):

| Setting | Value |
|---|---|
| Primary color | `#0A6E5A` |
| Background | Transparent (or `#F0EDE6` if transparent isn't an option) |
| Font | Inter (closest free option) |
| Border radius | Medium / 8px |

### 2c. Connect Google Sheets

1. Tally form → **Integrations** → **Google Sheets** → **Connect**.
2. Authorize the Google account where you want the leads to land.
3. Create a new sheet — name it something like `Outlog – early access leads`.
4. Map the email field to the sheet column. Save.

Test it: submit the form once with your own email. Check that a row appears in the sheet within ~10 seconds.

### 2d. Embed it in the page

In Tally: **Share** → **Embed on a website** → choose **Inline embed**. Copy the snippet (it'll look like an `<iframe>` or a small `<div>` + `<script>` pair).

Open `index.html` in a text editor (Notepad works, but [VS Code](https://code.visualstudio.com/) is free and easier). Find this block:

```html
<!-- TALLY EMBED GOES HERE. The form below is a placeholder. -->
<form class="form" id="signup" ... >
  ...
</form>
<p class="form-note" id="formNote">&nbsp;</p>
```

Replace **the whole block** (including the comment, the `<form>...</form>`, and the `<p class="form-note">...</p>`) with the Tally embed snippet you just copied.

Save the file. Open it in your browser again — the real Tally form should appear in place of the placeholder.

---

## Step 3: Deploy on Cloudflare Pages (Direct Upload)

No GitHub needed. Cloudflare lets you drag the folder straight into their dashboard.

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign in (the same account where you bought `getoutlog.com`).
2. Left sidebar → **Workers & Pages** → **Create** → **Pages** tab → choose **Upload assets** (the option *next to* "Connect to Git" — not Connect to Git).
3. Project name: `outlog-landing`. Click **Create project**.
4. Drag your entire `outlog-landing` folder onto the upload area. Cloudflare will pick up:
   - `index.html`
   - `hero.jpg`
   - `outlog-logo-primary.svg`
   - `outlog-mark.svg`
   - `outlog-O.svg`
   - `README.md` (harmless — never gets served as a page)
5. Click **Deploy site**. After ~30 seconds you'll get a URL like `outlog-landing-abc.pages.dev`. Open it — your site is live on a temporary Cloudflare subdomain.

---

## Step 4: Point getoutlog.com at it

1. In the Cloudflare Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter `getoutlog.com`. Cloudflare detects that the domain is on the same account and adds the DNS record automatically. Confirm.
3. Add a second one for `www.getoutlog.com` so both work.
4. Wait 1–2 minutes. Visit [getoutlog.com](https://getoutlog.com).

---

## Updating the page later

Direct Upload flow:

1. Edit the files on your computer (change copy in `index.html`, swap `hero.jpg`, etc.).
2. dash.cloudflare.com → your `outlog-landing` project → **Create deployment** → drag the whole `outlog-landing/` folder onto the upload area.
3. Cloudflare deploys within ~30 seconds. Refresh the live site.

If you find yourself doing this more than once a week, see the optional GitHub upgrade below — it lets you edit `index.html` in a browser and auto-deploys on save.

---

## What's intentionally not here

- No analytics. Cloudflare Pages gives you free traffic stats in its dashboard — that's enough for v1. (If you want event-level analytics later, add [Plausible](https://plausible.io) — free for low traffic, no cookies.)
- No newsletter platform. Tally → Google Sheets is the system of record. When you have something to say to the list, send it from john@getoutlog.com manually. That's on-brand and gives you signal on who replies.
- No privacy page or terms. Add later when the volume justifies it.
- No A/B testing. We're committing to Pitch A. If conversion is low after ~50 form views, we'll revisit.

---

## When the real app is ready

This static page lives at the root of `getoutlog.com`. When you build the Phase 1 Next.js app, you'll either:
1. Move this content into the Next.js app's home route, or
2. Move the marketing site to `getoutlog.com/welcome` and point root at the app.

Either way, no DNS changes needed — Cloudflare DNS keeps pointing at whatever you deploy.

---

## Optional upgrade: GitHub for one-click edits

The Direct Upload flow above is fine indefinitely. If GitHub is being a pain right now (CAPTCHA loops, signup issues), skip this whole section — the site works without it.

When you're ready to wire up GitHub later, the upside is meaningful: you can edit `index.html` directly in a browser, and Cloudflare auto-deploys on every save. No more folder dragging.

### Set it up

1. **Create the repo.** [github.com](https://github.com) → **+** → **New repository** → name it `outlog-landing`, **Private**, leave all init checkboxes unchecked. Click **Create repository**.
2. **Upload your files.** On the empty repo page → click **uploading an existing file** → drag the contents of `outlog-landing/` in → commit message: `Initial landing page` → **Commit changes**.
3. **Connect Cloudflare Pages to the repo.** Cloudflare offers two paths:
   - **Path A (clean):** Delete the existing Direct Upload project. Then **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick `outlog-landing`. Build settings: Framework preset **None**, build command blank, output directory `/`. Re-add `getoutlog.com` as a custom domain afterward.
   - **Path B (preserve current project):** In your existing `outlog-landing` Pages project → **Settings** → **Builds & deployments** → **Configure Production deployments** → connect Git source. Cloudflare's UI here changes occasionally — if Path B isn't visible in your dashboard, Path A is reliable.
4. From now on: edit `index.html` on github.com (open the file → pencil icon → edit → commit). Cloudflare deploys within ~30 seconds.

### If GitHub signup is broken right now

If you're hitting Arkose CAPTCHA loops or rate limits on GitHub signup, the fix is usually one of: turn off your VPN, try in an incognito window (extensions disabled), try a different network (phone hotspot), or use a different browser. Don't sit on this — Direct Upload works fine until you're ready.
