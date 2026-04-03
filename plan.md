# Telecot – Plan

## Phase 0 – Netlify Prototype (DONE)
- Anonymous posting via textarea.
- In-memory storage in Netlify Function.
- Minimal reader view and index page.
- No trackers, no external assets.

## Phase 1 – Storage Adapter + Clean Architecture
- Introduce domain models (Post, Storage).
- Implement storage adapter interface.
- Add second adapter (e.g., JSON file or simple DB).
- Keep Netlify deploy working with configuration.

## Phase 2 – Better Editor + URL Improvements
- Add title + basic formatting (Markdown or simple block model).
- Improve URL scheme (/p/{id-slug}).
- Handle delete and (later) edit.

## Phase 3 – Blogs & Views
- Add optional “blog” container for posts.
- Implement “standalone view” vs “blog view”.
- Simple blog index pages.

## Phase 4 – Media & Fonts
- Add external image/video URL embeds in editor.
- Add font themes (5–8 curated sets) with strict performance budget.
- Document storage integration for object storage (R2/S3).

## Phase 5 – Optional Accounts
- Plug in lightweight auth (magic link / JWT).
- Add simple dashboard to manage posts/blogs.

## Phase 6 – Polish & OSS Community
- Improve docs, add examples.
- Provide Netlify/Vercel deploy buttons.
- Harden privacy/security defaults (headers, CSP).