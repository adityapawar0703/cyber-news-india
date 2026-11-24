# Deployment Guide — Cyber India News Platform

This guide outlines how to deploy **Cyber India News** to production across popular hosting providers (**Vercel + Render / Railway**, **Single-Server Unified**, or **Docker**).

---

## Architecture Overview

```
Split Deployment (Recommended for Serverless & Auto-Scale):
┌────────────────────────────┐        ┌────────────────────────────┐        ┌─────────────────────┐
│ Frontend (Vercel / Netlify)│  ───>  │ Backend API (Render / VPS) │  ───>  │ MongoDB Atlas       │
│ React 19 + Tailwind v4     │        │ Express.js + Node.js 22    │        │ Cloud Database      │
└────────────────────────────┘        └────────────────────────────┘        └─────────────────────┘

Unified Single-Server Deployment (Simpler, One Service):
┌──────────────────────────────────────────────────────────────────┐        ┌─────────────────────┐
│ Single Node.js Container / Host (Render / Railway / VPS / Docker) │  ───>  │ MongoDB Atlas       │
│ Serves: /api/*, /uploads/*, and client/dist static SPA           │        │ Cloud Database      │
└──────────────────────────────────────────────────────────────────┘        └─────────────────────┘
```

---

## 1. Environment Variables Reference

### Frontend (`client/.env` / Vercel / Netlify)

| Variable | Description | Example (Production) | Example (Local) |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of your backend API (no trailing slash). **Leave empty if backend serves the frontend from the same domain.** | `https://api.cyberindianews.in` or `https://cin-api.onrender.com` | `""` (uses Vite proxy) |

### Backend (`server/.env` / Render / Railway / VPS)

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `PORT` | Auto | Server port (cloud providers set this automatically) | `5000` |
| `NODE_ENV` | Yes | Set to `production` in production | `production` |
| `MONGO_URI` | Yes | MongoDB connection string (e.g. MongoDB Atlas) | `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/cyber_india_news?retryWrites=true&w=majority` |
| `JWT_SECRET` | Yes | 64+ char random string for signing admin JWT sessions | `cin_prod_e98f...` |
| `JWT_EXPIRES_IN` | No | Token lifetime (defaults to `7d`) | `7d` |
| `CLIENT_URL` | Yes | Allowed frontend origin(s) for CORS (comma-separated, no trailing slashes) | `https://cyberindianews.in,https://cyber-india-news.vercel.app` |
| `ADMIN_USERNAME`| For seed | Initial admin username used when running `seed.js` | `admin` |
| `ADMIN_EMAIL` | For seed | Initial admin email used when running `seed.js` | `editor@cyberindianews.in` |
| `ADMIN_PASSWORD`| For seed | Initial admin password used when running `seed.js` | `StrongPass#2026` |

---

## Option A: Split Deployment (Vercel Frontend + Render Backend)

### Step 1: Set up MongoDB Atlas (Free Cloud Database)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster.
2. Under **Database Access**, create a user (e.g. `cin_admin`) with a strong password.
3. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) so cloud hosts can connect.
4. Click **Connect** > **Drivers** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/cyber_india_news?retryWrites=true&w=majority
   ```

### Step 2: Deploy Backend to Render (or Railway)
1. Push your repository to GitHub / GitLab.
2. Go to [render.com](https://render.com) > **New Web Service**.
3. Connect your repository.
4. Configure settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. In **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = *(your Atlas connection string)*
   - `JWT_SECRET` = *(generate a 64-char random string)*
   - `CLIENT_URL` = `https://your-frontend.vercel.app` *(update once frontend is deployed)*
   - `ADMIN_PASSWORD` = `YourCustomAdminPassword#2026`
6. Click **Deploy**. Note your backend URL (e.g., `https://cyber-india-news-api.onrender.com`).
7. *(Optional Initial Seed)*: In Render's **Shell** tab, run:
   ```bash
   node utils/seed.js
   ```

### Step 3: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) > **Add New Project**.
2. Import your GitHub repository.
3. In project settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://cyber-india-news-api.onrender.com` *(your backend URL without trailing slash)*
5. Click **Deploy**.
6. Once deployed, copy your Vercel URL (e.g., `https://cyber-india-news.vercel.app`) and add it to `CLIENT_URL` in your Render backend environment variables!

---

## Option B: Unified Single-Server Deployment (Render / Railway / VPS)

In this mode, Express serves the API, user uploads, and the pre-built React frontend from `client/dist` on a single port!

### On Render or Railway:
- **Root Directory**: Leave blank (root of repository).
- **Build Command**:
  ```bash
  npm run install:all && npm run build
  ```
- **Start Command**:
  ```bash
  npm start
  ```
- **Environment Variables**:
  - `NODE_ENV` = `production`
  - `MONGO_URI` = *(your Atlas connection string)*
  - `JWT_SECRET` = *(your 64-char random secret)*
  - `CLIENT_URL` = `*` *(or your custom domain)*

---

## Option C: Docker / Docker Compose

A production-ready `Dockerfile` and `docker-compose.yml` are included.

To build and run locally or on a VPS:
```bash
# 1. Start all containers (App + MongoDB)
docker compose up -d --build

# 2. Seed database in the running container
docker compose exec app node utils/seed.js

# 3. Access the platform
# Frontend & API: http://localhost:5000
# Admin Login:    http://localhost:5000/admin/login
```

---

## Post-Deployment Checklist

- [ ] Check backend health endpoint: `https://your-backend.com/api/health` returns `{"status":"ok"}`.
- [ ] Sign in to Admin at `https://your-frontend.com/admin/login` using your configured credentials.
- [ ] Verify image uploads: Upload an article cover image in the Admin Editor and confirm it renders.
- [ ] Test SPA routing: Directly refresh a deep URL like `/article/...` or `/category/cybersecurity` to confirm no 404 error occurs.
- [ ] Test the theme toggle (Sun/Moon icon) persists preferences across sessions.
