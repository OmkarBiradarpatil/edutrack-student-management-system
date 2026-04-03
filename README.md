# 🎓 EduTrack Student Management System

A professional, fully functional Student Management System built with a **Node.js + Express** backend and a premium, vanilla JavaScript **SPA** (Single Page Application) frontend.

## ✨ Features
- **Dashboard Analytics**: Live trend indicators for total students, attendance, marks, and subjects.
- **Student Tracking**: Add, edit, and safely manage student records and enrollment numbers.
- **Attendance Management**: Mark and update specific instances of attendance natively.
- **Marks Reporting**: Store subject grades utilizing automatic grade coloring schemas (A-D).
- **Secure Authentication**: Express-session protected endpoints utilizing bcryptjs encryption.
- **Theme Support**: Persistent Light/Dark mode toggling.

## 🛠️ Tech Stack
- **Frontend**: HTML5, Vanilla JavaScript, Vanilla CSS.
- **Backend**: Node.js, Express.js.
- **Database**: Local JSON Storage Engine (with isolated thread-safe write logic).
- **Security**: express-session, bcryptjs.

## 📁 Folder Structure
```text
/public         # SPA Frontend (HTML, CSS, JS)
/server         # Backend (Express setup, APIs, Middleware)
/data           # Database storage (db.json)
.env.example    # Environment variables mock
package.json    # Dependencies & project scripts
```

## 🚀 Installation & Setup
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd student-management-system
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Make sure to edit .env with your secrets
   ```
4. **Start the server:**
   ```bash
   npm start
   ```

## 🖥 Demo Instructions
Once running, simply route to `http://localhost:3000` inside your browser. 
If starting from an entirely fresh `data/db.json` database, you can automatically create your first administrator by registering locally!

## ☁️ Deployment Notes
Because this system safely utilizes a local `data/db.json` file to store relationships entirely locally, deploying it onto a stateless Serverless framework (like **Vercel**) is **not supported.**
Vercel automatically wipes disks when waking functions up, which will erase your DB. 

**Recommended Scaling:** If you want to scale this into production permanently, please deploy the backend to an always-on VM/Platform (like **Render** or Railway) or swap the current database wrapper located in `server/db.js` with a scalable cloud DB equivalent like **MongoDB Atlas** or Supabase!

## 💎 Credits
Made with ❤️ by:
- **Omkar Biradarpatil**
- **Sagar NM**
- **Prajwal Metre**
