# Deployment Guide — Cyber India News Platform

This guide outlines how to deploy the **Cyber India News** backend to **Render** and frontend to **Vercel**.

---

## 1. Backend Deployment on Render (Web Service)

When creating a new **Web Service** on [Render.com](https://render.com):

### Essential Service Settings on Render:
| Setting | Recommended Value | Notes |
| :--- | :--- | :--- |
| **Service Type** | `Web Service` | |
| **Name** | `cyber-india-news-api` | Or your choice of name |
| **Environment / Runtime** | `Node` | Automatically uses Node 20+ via `.node-version` / `engines` |
| **Root Directory** | `server` | Points directly to backend directory |
| **Build Command** | `npm install` | Installs backend dependencies cleanly |
| **Start Command** | `npm start` | Executes `node server.js` |
| **Health Check Path** | `/api/health` | Root `/` and `/healthz` also return `200 OK` |

---

## 2. Render Environment Variables (Crucial)

In your Render service dashboard under **Environment**:

| Key | Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production security & performance |
| `PORT` | `10000` | Render sets this automatically; defaults safely to 5000/10000 |
| `MONGO_URI` | `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/cyber_india_news?retryWrites=true&w=majority` | **Required.** Your MongoDB Atlas connection string |
| `JWT_SECRET` | *(64-character random string)* | Secret used to sign admin JWT sessions |
| `CLIENT_URL` | `https://your-frontend.vercel.app,http://localhost:5173` | Allowed origins for CORS (comma-separated, no trailing slash) |
| `ADMIN_PASSWORD` | `YourStrongAdminPassword#2026` | Used if running `node utils/seed.js` to seed admin |

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
