# Deployment Guide — Cyber India News Platform

This guide outlines how to deploy the **Cyber India News** backend to **Render** (and frontend to **Vercel** or **Render**).

---

## 1. Quick Render Setup (Backend API)

When creating a new **Web Service** on [Render.com](https://render.com):

### Essential Service Settings on Render:
| Setting | Recommended Value | Notes |
| :--- | :--- | :--- |
| **Name** | `cyber-india-news-api` | Or any name you prefer |
| **Language / Runtime** | `Node` | Automatically uses Node 20+ via `.node-version` |
| **Root Directory** | `server` | **Important:** If left empty, root `package.json` will install server dependencies via postinstall |
| **Build Command** | `npm install` | If root directory is `server`, use `npm install`. If root directory is empty, use `npm run install:all` |
| **Start Command** | `npm start` | Or `node server.js` |
| **Health Check Path** | `/api/health` | Root `/` and `/healthz` are also supported and return `200 OK` |

---

## 2. Render Environment Variables (Crucial)

In your Render service dashboard under **Environment**:

| Key | Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` | Render sets this automatically, but you can set 10000 |
| `MONGO_URI` | `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/cyber_india_news?retryWrites=true&w=majority` | **Required.** Your MongoDB Atlas connection string |
| `JWT_SECRET` | *(64-character random string)* | Secret used to sign admin JWT sessions |
| `CLIENT_URL` | `https://your-frontend.vercel.app,http://localhost:5173` | Allowed origins for CORS (comma-separated, no trailing slash) |
| `ADMIN_PASSWORD` | `YourStrongAdminPassword#2026` | Used if running `node utils/seed.js` in Render Shell |

> **Pro Tip on MongoDB Atlas:**
> 1. In [MongoDB Atlas](https://cloud.mongodb.com) -> **Network Access**, ensure you have added IP `0.0.0.0/0` (Allow Access from Anywhere). Render uses dynamic cloud IPs; without `0.0.0.0/0`, Atlas will reject the connection.
> 2. In Atlas -> **Database Access**, verify your database user has read/write privileges and the password has no unencoded special characters (or is URL-encoded if using `@`, `:`, `#`, etc.).

---

## 3. Initializing / Seeding the Database on Render

After your Render service is deployed and MongoDB is connected:
1. In the Render Dashboard, open the **Shell** tab of your service.
2. Run:
   ```bash
   node utils/seed.js
   ```
   *(If your root directory was left at the project root, run `npm run seed`).*
3. This creates the default admin account and populates sample cybersecurity articles and visitor stats.

---

## 4. Frontend Deployment (Vercel)

1. Go to [Vercel.com](https://vercel.com) -> **Add New Project** -> import your GitHub repository.
2. In project settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://cyber-india-news-api.onrender.com` *(your Render backend URL without trailing slash)*
4. Click **Deploy**.
5. Copy your live Vercel URL (e.g. `https://cyber-india-news.vercel.app`) and paste it into `CLIENT_URL` in your Render backend settings.

---

## 5. Render Blueprint (Alternative 1-Click Deploy)

A `render.yaml` file is provided in the root of the repository. You can use Render's **Blueprints** tab to automatically provision the web service with all required settings.
