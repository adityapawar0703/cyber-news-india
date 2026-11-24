# Cyber India News — Cybersecurity & Technology News Platform

A production-minded, dark-editorial cybersecurity and technology news publication built with **React 19 + Vite + TypeScript + Tailwind CSS v4**, backed by **Node.js + Express + MongoDB (Mongoose)** and a full **TipTap** rich-text CMS.

## Key Capabilities

- **Editorial Public Website**: Sticky navigation masthead with `Ctrl+K` live search palette, live breaking news ticker, asymmetric magazine hero, developing threat intelligence strip, filterable 3/2/1 latest articles grid, 6 dedicated specialty coverage desks, newsletter subscription, and comprehensive footer.
- **Distraction-Free Article Reading**: Optimal reading width, scroll progress bar, auto-extracted desktop Table of Contents, vertical & inline share bars, CVE & severity metadata, syntax-highlighted code blocks with one-click copy, previous/next navigation, and related stories.
- **Search & Content Discovery**: Full-text & CVE search, category filtering, popularity/recency sorting, pagination, skeleton loaders, empty and error states.
- **Protected Admin Portal (`/admin/login`)**: Bcrypt-hashed admin credentials, rate-limited JWT login (no public registration), protected routes, responsive sidebar layout.
- **Editorial Dashboard & Visitor Telemetry**: Deduplicated site visit counter, per-article view counter, 14-day readership chart, top articles, and newsletter subscriber metrics.
- **Article Management & TipTap Rich-Text Editor**: Full CRUD, draft/publish toggles, featured/breaking flags, featured cover image uploader, inline image uploads with alignment (`left`, `center`, `right`, `full`), syntax-highlighted code blocks with language picker, hyperlinks, blockquotes, SEO metadata, and live reader preview modal.

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/cyber_india_news`)

### 1. Environment Configuration
Review `server/.env` (copy from `server/.env.example` if needed) and configure your `MONGO_URI`, `JWT_SECRET`, and initial admin credentials.

### 2. Seed Database (Admin Account + Sample Articles)
```bash
npm run seed
```
Default seeded editorial admin credentials (defined in `server/.env`):
- **Login URL**: `http://localhost:5173/admin/login`
- **Username / Email**: `admin` or `editor@cyberindianews.in`
- **Password**: `CyberIndia#2026` *(change in `server/.env` before production deployment)*

### 3. Run Development Servers (API + Frontend)
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
