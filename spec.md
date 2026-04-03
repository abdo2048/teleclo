# Telecot / Telegraph-like Publishing Platform – Spec

## Overview
- Minimal, anonymous publishing platform inspired by Telegra.ph.
- Open source, self-hostable, with an official demo instance on Netlify/Vercel.
- Text-first, extremely fast reader experience, privacy-first (no trackers, no third-party analytics by default).

## Goals
- Run fully on Netlify/Vercel free tiers (demo instance).
- Allow self-hosters to plug in their own storage (e.g., Cloudflare R2, S3, DB).
- Provide clean editor + reader UX, including LTR/RTL mixing.
- High code quality: modular, testable, easy to extend via AI assistants.

## Non-Goals
- No built-in comments or social network features in v1.
- No full-blown CMS dashboard or complex roles/permissions in v1.
- No dependency on paid services for the demo instance.

## Users and Use Cases
- Anonymous writer: quickly publish a formatted article and share a link.
- Blogger: runs their own instance to host a small blog with multiple posts.
- Power user / dev: forks the repo and integrates custom storage/auth.

## Functional Requirements
- Create post (anonymous) with title + body.
- Get shareable URL for each post (standalone view).
- List recent posts on this instance (for demo/testing).
- Edit / delete via secret edit URL (later phase).
- Optional blogs and “view post as part of blog” (later phase).
- Optional accounts to manage posts (later phase).

## Non-Functional Requirements
- Performance:
  - Reader pages should load in under ~200–300 ms on broadband and stay well under ~100KB total HTML+CSS+JS for v1.
  - Static-first / Jamstack architecture.
- Privacy:
  - No third-party trackers (no Google Analytics, etc.).
  - No third-party fonts or scripts by default.
  - Minimal logging; no IP storage in app-level code.
- Accessibility:
  - Keyboard-friendly editor.
  - Good contrast, readable typography.
- Internationalization:
  - LTR/RTL and mixed-direction posts supported.
  - Language and dir metadata per document (and optionally per block).

## Architecture
- Frontend: static HTML/CSS/JS, deployable on Netlify/Vercel.
- API: serverless functions (Netlify Functions / Vercel Functions).
- Storage:
  - v1 demo: in-memory storage (already working), then pluggable storage adapter.
  - Self-hosters: configuration-driven selection (git-based, DB, object storage).
- Editor:
  - v1: simple title + textarea.
  - Future: block-based editor with basic formatting + media embeds.

## Security & Privacy Details
- No cookies in v1, no auth; later, optional auth via external provider.
- No third-party analytics, pixels, or ad scripts.
- Use `Referrer-Policy: no-referrer` and security headers where possible.
- Document how self-hosters can *optionally* add their own analytics.

## UX & Design Principles
- Single-column, centered layout, similar to Telegra.ph/Substack “reading” view.
- Mobile-first design; smallest devices first, scale up.
- Minimal chrome: logo/title, back link, share link.
- Avoid modals/popups; use inline forms and simple pages.

## Future Enhancements
- Editor block types (headings, lists, code, images, embeds).
- Optional font themes (5–8 curated font pairs).
- Optional blogs, RSS feeds, and import/export.
- Optional account system and dashboards.