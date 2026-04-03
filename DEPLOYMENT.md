# 🚀 Deployment Guide for EduTrack

Deploying an Express + File-Based JSON app requires a host with a **persistent filesystem** so that your `data/db.json` doesn't reset when the server goes to sleep. 

## ❌ Why Not Vercel?
While Vercel is great for the static frontend, its Serverless Functions have an **ephemeral (read-only) filesystem**. Any data written to `db.json` on Vercel will be lost immediately when the function spins down. 

## ✅ Recommended Deployment: Render

[Render](https://render.com/) is perfect for this project because it provides persistent disks and runs standard Node.js applications out-of-the-box.

### Option 1: Render Web Service (Free Tier)
*Note: The free tier spins down after inactivity. On startup, the ephemeral disk will reset. To keep `db.json` permanently, you must use a paid plan with a persistent disk.*

1. Push your repository to GitHub.
2. Sign up on [Render.com](https://render.com/).
3. Click **New +** > **Web Service**.
4. Connect your GitHub repository.
5. Setup the service:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Click **Create Web Service**. 
7. Your SPA and backend will instantly go live!

### Perfecting it with Persistent Disks (Paid Layer only)
To ensure `db.json` is never wiped on Render:
1. In your Render Dashboard, go to your Web Service > **Disks**.
2. Add a disk with the **Mount Path**: `/data`
3. Make sure your `data` folder inside your project is writing to this path. 
*Note: Currently, `server/db.js` points to `./data/db.json` which relative to the root folder works fine once the persistent disk is mounted here.*

---

## 🎨 Vercel (Frontend Only) + Render (Backend Only)
If you heavily prefer Vercel for the blazing-fast SPA frontend edge caching:

1. **Host Backend on Render**: Follow the steps above, but ensure CORS is set up in Express.
2. **Host Frontend on Vercel**: 
   - Ensure you deploy ONLY the `public/` directory.
   - Update `public/script.js` requests to point directly to your new Render backend URL instead of relative `/api/...`.
