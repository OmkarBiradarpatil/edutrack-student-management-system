/**
 * script.js — EduTrack SPA Application
 * 
 * Single-page application with:
 *  - Hash-based client-side routing
 *  - Fetch API service layer
 *  - Page renderers for all views
 *  - Toast notification system
 *  - Form validation
 *  - Confirm modal
 */

// ═══════════════════════════════════════════════════════════════
// Local Storage DB helper
// ═══════════════════════════════════════════════════════════════

const DB_KEY = 'edutrack_db';

function getDB() {
  const defaultDB = { 
    users: [{ id: 1, username: 'admin', password: 'password' }], 
    students: [], 
    attendance: [], 
    marks: [], 
    subjects: [] 
  };
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
    return defaultDB;
  }
  try {
    const parsed = JSON.parse(raw);
    return { ...defaultDB, ...parsed };
  } catch (e) {
    console.error('Failed to parse DB, resetting.');
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
    return defaultDB;
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getNextId(table) {
  const db = getDB();
  const items = db[table] || [];
  if (items.length === 0) return 1;
  const max = Math.max(...items.map(i => i.id || 0));
  return max + 1;
}

// ═══════════════════════════════════════════════════════════════
// API Service Layer (Frontend Only)
// ═══════════════════════════════════════════════════════════════

const API = {
  // Auth
  async login(username, password) {
    if (!username || !password) {
      return { success: false, message: 'Please enter username and password.' };
    }
    sessionStorage.setItem('user', username);
    return { success: true, data: { username } };
  },
  async register(username, password) {
    if (!username || !password) {
      return { success: false, message: 'Please enter details.' };
    }
    // Dummy register: just log them in
    sessionStorage.setItem('user', username);
    return { success: true, data: { username } };
  },
  async logout() {
    sessionStorage.removeItem('user');
    return { success: true };
  },
  async checkAuth() {
    const username = sessionStorage.getItem('user');
    if (username) {
      return { success: true, data: { username } };
    }
    return { success: false, message: 'Not authenticated' };
  },

  // Students
  async getStudents() {
    return { success: true, data: getDB().students };
  },
  async getStudent(id) {
    const student = getDB().students.find(s => s.id === parseInt(id));
    if (student) return { success: true, data: student };
    return { success: false, message: 'Student not found.' };
  },
  async addStudent(data) {
    const db = getDB();
    const newStudent = { id: getNextId('students'), ...data };
    db.students.push(newStudent);
    saveDB(db);
    return { success: true, data: newStudent };
  },
  async updateStudent(id, data) {
    const db = getDB();
    const index = db.students.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
      db.students[index] = { ...db.students[index], ...data };
      saveDB(db);
      return { success: true, data: db.students[index] };
    }
    return { success: false, message: 'Student not found.' };
  },
  async deleteStudent(id) {
    const db = getDB();
    const initialLen = db.students.length;
    db.students = db.students.filter(s => s.id !== parseInt(id));
    if (db.students.length < initialLen) {
      // Cascade delete
      db.attendance = db.attendance.filter(a => parseInt(a.student_id) !== parseInt(id));
      db.marks = db.marks.filter(m => parseInt(m.student_id) !== parseInt(id));
      saveDB(db);
      return { success: true };
    }
    return { success: false, message: 'Student not found.' };
  },

  // Attendance
  async getAttendance() {
    return { success: true, data: getDB().attendance };
  },
  async getAttendanceById(id) {
    const record = getDB().attendance.find(a => a.id === parseInt(id));
    if (record) return { success: true, data: record };
    return { success: false, message: 'Record not found.' };
  },
  async addAttendance(data) {
    const db = getDB();
    const newRecord = { id: getNextId('attendance'), ...data };
    db.attendance.push(newRecord);
    saveDB(db);
    return { success: true, data: newRecord };
  },
  async updateAttendance(id, data) {
    const db = getDB();
    const index = db.attendance.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      db.attendance[index] = { ...db.attendance[index], ...data };
      saveDB(db);
      return { success: true, data: db.attendance[index] };
    }
    return { success: false, message: 'Record not found.' };
  },
  async deleteAttendance(id) {
    const db = getDB();
    const initialLen = db.attendance.length;
    db.attendance = db.attendance.filter(a => a.id !== parseInt(id));
    if (db.attendance.length < initialLen) {
      saveDB(db);
      return { success: true };
    }
    return { success: false, message: 'Record not found.' };
  },

  // Marks
  async getMarks() {
    return { success: true, data: getDB().marks };
  },
  async getMarksById(id) {
    const record = getDB().marks.find(m => m.id === parseInt(id));
    if (record) return { success: true, data: record };
    return { success: false, message: 'Record not found.' };
  },
  async addMarks(data) {
    const db = getDB();
    const newRecord = { id: getNextId('marks'), ...data };
    db.marks.push(newRecord);
    saveDB(db);
    return { success: true, data: newRecord };
  },
  async updateMarks(id, data) {
    const db = getDB();
    const index = db.marks.findIndex(m => m.id === parseInt(id));
    if (index !== -1) {
      db.marks[index] = { ...db.marks[index], ...data };
      saveDB(db);
      return { success: true, data: db.marks[index] };
    }
    return { success: false, message: 'Record not found.' };
  },
  async deleteMarks(id) {
    const db = getDB();
    const initialLen = db.marks.length;
    db.marks = db.marks.filter(m => m.id !== parseInt(id));
    if (db.marks.length < initialLen) {
      saveDB(db);
      return { success: true };
    }
    return { success: false, message: 'Record not found.' };
  },

  // Subjects
  async getSubjects() {
    return { success: true, data: getDB().subjects };
  },
  async getSubject(id) {
    const subject = getDB().subjects.find(s => s.id === parseInt(id));
    if (subject) return { success: true, data: subject };
    return { success: false, message: 'Subject not found.' };
  },
  async addSubject(data) {
    const db = getDB();
    const newSubject = { id: getNextId('subjects'), ...data };
    db.subjects.push(newSubject);
    saveDB(db);
    return { success: true, data: newSubject };
  },
  async updateSubject(id, data) {
    const db = getDB();
    const index = db.subjects.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
      db.subjects[index] = { ...db.subjects[index], ...data };
      saveDB(db);
      return { success: true, data: db.subjects[index] };
    }
    return { success: false, message: 'Subject not found.' };
  },
  async deleteSubject(id) {
    const db = getDB();
    const initialLen = db.subjects.length;
    db.subjects = db.subjects.filter(s => s.id !== parseInt(id));
    if (db.subjects.length < initialLen) {
      // Cascade delete
      db.marks = db.marks.filter(m => parseInt(m.subject_id) !== parseInt(id));
      saveDB(db);
      return { success: true };
    }
    return { success: false, message: 'Subject not found.' };
  }
};


// ═══════════════════════════════════════════════════════════════
// Toast Notification System
// ═══════════════════════════════════════════════════════════════

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    warning: 'fa-exclamation-circle',
    info: 'fa-info-circle'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info}"></i>
    <span>${escapeHtml(message)}</span>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
  `;

  container.appendChild(toast);

  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}


// ═══════════════════════════════════════════════════════════════
// Confirm Modal
// ═══════════════════════════════════════════════════════════════

function showConfirm(title, message) {
  return new Promise(resolve => {
    const modal = document.getElementById('confirm-modal');
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    modal.classList.remove('hidden');

    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');

    function cleanup(result) {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      modal.removeEventListener('click', onBackdrop);
      resolve(result);
    }

    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }
    function onBackdrop(e) { if (e.target === modal) cleanup(false); }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    modal.addEventListener('click', onBackdrop);
  });
}


// ═══════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════

/** Escape HTML to prevent XSS */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

/** Get the main content element */
function getMain() {
  return document.getElementById('main-content');
}

/** Navigate to a hash route */
function navigate(hash) {
  window.location.hash = hash;
}


// ═══════════════════════════════════════════════════════════════
// Global UI Features (Theme & Time)
// ═══════════════════════════════════════════════════════════════

/** Initialize the live updating clock in the top navbar */
function initClock() {
  const clockEl = document.getElementById('live-clock');
  if (!clockEl) return;
  
  function updateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB'); // HH:MM:SS format automatically
    
    clockEl.innerHTML = `<i class="far fa-clock" style="color:var(--accent-primary)"></i> ${dateStr} <span style="opacity:0.4;margin:0 4px">|</span> <strong>${timeStr}</strong>`;
  }
  
  updateTime();
  setInterval(updateTime, 1000);
}

/** Initialize the light/dark mode theme toggler */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;
  const icon = toggleBtn.querySelector('i');
  
  // Default to dark mode if no preference
  let isLight = localStorage.getItem('edutrack_theme') === 'light';
  
  function applyTheme() {
    if (isLight) {
      document.body.classList.add('light-mode');
      icon.className = 'fas fa-sun';
      icon.style.color = '#f59e0b';
    } else {
      document.body.classList.remove('light-mode');
      icon.className = 'fas fa-moon';
      icon.style.color = 'inherit';
    }
  }
  
  applyTheme();
  
  toggleBtn.addEventListener('click', () => {
    isLight = !isLight;
    localStorage.setItem('edutrack_theme', isLight ? 'light' : 'dark');
    applyTheme();
  });
}


// ═══════════════════════════════════════════════════════════════
// Sidebar
// ═══════════════════════════════════════════════════════════════

// Cached username for sidebar (set on first auth check)
let _sidebarUsername = '';

function renderSidebar(currentHash, username) {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('hidden');

  // Keep username updated if provided
  if (username) _sidebarUsername = username;
  const displayName = _sidebarUsername || 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const links = [
    { hash: '#/dashboard', icon: 'fa-house', label: 'Dashboard' },
    { section: 'Students' },
    { hash: '#/students', icon: 'fa-user-graduate', label: 'View Students' },
    { hash: '#/students/add', icon: 'fa-user-plus', label: 'Add Student' },
    { section: 'Attendance' },
    { hash: '#/attendance', icon: 'fa-calendar-check', label: 'View Attendance' },
    { hash: '#/attendance/add', icon: 'fa-calendar-plus', label: 'Add Attendance' },
    { section: 'Marks' },
    { hash: '#/marks', icon: 'fa-chart-line', label: 'View Marks' },
    { hash: '#/marks/add', icon: 'fa-plus-circle', label: 'Add Marks' },
    { section: 'Subjects' },
    { hash: '#/subjects', icon: 'fa-book', label: 'View Subjects' },
    { hash: '#/subjects/add', icon: 'fa-book-medical', label: 'Add Subject' },
  ];

  let html = `
    <div class="sidebar-brand">
      <h2>🎓 EduTrack</h2>
      <div class="brand-subtitle">Student Management</div>
    </div>
    <div class="user-chip">
      <div class="user-avatar">${avatarLetter}</div>
      <div>
        <div class="user-name">${escapeHtml(displayName)}</div>
        <div class="user-role">Administrator</div>
      </div>
    </div>
    <div class="sidebar-nav">
  `;

  for (const item of links) {
    if (item.section) {
      html += `<div class="nav-section"><div class="nav-section-title">${item.section}</div></div>`;
      continue;
    }
    const isActive = currentHash === item.hash ||
      (item.hash === '#/dashboard' && (currentHash === '' || currentHash === '#/' || currentHash === '#'));
    html += `
      <a class="nav-link ${isActive ? 'active' : ''}" href="${item.hash}">
        <i class="fas ${item.icon}"></i>
        <span>${item.label}</span>
      </a>
    `;
  }

  html += `
    </div>
    <div class="sidebar-footer">
      <a class="nav-link logout-link" href="#" id="logout-btn">
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </a>
    </div>
    <div class="credit-section">
      <div class="credit-label">Made with <span class="heart">❤️</span> by</div>
      <div class="credit-names">
        <span class="credit-name">Omkar Biradarpatil</span>
        <span class="credit-name">Sagar NM</span>
        <span class="credit-name">Prajwal Metre</span>
      </div>
    </div>
  `;

  sidebar.innerHTML = html;

  // Logout handler
  document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const res = await API.logout();
    if (res.success) {
      showToast('Logged out successfully.', 'success');
      navigate('#/login');
    }
  });
}


// ═══════════════════════════════════════════════════════════════
// Page Renderers
// ═══════════════════════════════════════════════════════════════

// ── Login Page ───────────────────────────────────────────────

function renderLoginPage() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.add('hidden');
  const main = getMain();
  main.className = 'main-content full-width';

  main.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-icon"><i class="fas fa-graduation-cap"></i></div>
          <h1>Welcome Back</h1>
          <p>Sign in to your EduTrack account</p>
        </div>
        <form id="login-form">
          <div class="form-group">
            <label for="login-username">Username</label>
            <input type="text" class="form-control" id="login-username" placeholder="Enter your username" required autocomplete="username">
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input type="password" class="form-control" id="login-password" placeholder="Enter your password" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%" id="login-submit-btn">
            <i class="fas fa-sign-in-alt"></i> Sign In
          </button>
        </form>
        <div class="auth-footer">
          Don't have an account? <a onclick="navigate('#/register')">Register here</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      showToast('Please fill in all fields.', 'warning');
      return;
    }

    const btn = document.getElementById('login-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

    const res = await API.login(username, password);

    if (res.success) {
      showToast('Login successful!', 'success');
      navigate('#/dashboard');
    } else {
      showToast(res.message || 'Invalid credentials.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }
  });
}


// ── Register Page ────────────────────────────────────────────

function renderRegisterPage() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.add('hidden');
  const main = getMain();
  main.className = 'main-content full-width';

  main.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-icon"><i class="fas fa-user-plus"></i></div>
          <h1>Create Account</h1>
          <p>Join EduTrack to manage your students</p>
        </div>
        <form id="register-form">
          <div class="form-group">
            <label for="reg-username">Username</label>
            <input type="text" class="form-control" id="reg-username" placeholder="Choose a username (min 3 chars)" required minlength="3" autocomplete="username">
          </div>
          <div class="form-group">
            <label for="reg-password">Password</label>
            <input type="password" class="form-control" id="reg-password" placeholder="Choose a password (min 4 chars)" required minlength="4" autocomplete="new-password">
          </div>
          <div class="form-group">
            <label for="reg-confirm">Confirm Password</label>
            <input type="password" class="form-control" id="reg-confirm" placeholder="Re-enter your password" required autocomplete="new-password">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%" id="reg-submit-btn">
            <i class="fas fa-user-plus"></i> Create Account
          </button>
        </form>
        <div class="auth-footer">
          Already have an account? <a onclick="navigate('#/login')">Sign in</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (!username || !password || !confirm) {
      showToast('Please fill in all fields.', 'warning');
      return;
    }

    if (password !== confirm) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (username.length < 3) {
      showToast('Username must be at least 3 characters.', 'warning');
      return;
    }

    if (password.length < 4) {
      showToast('Password must be at least 4 characters.', 'warning');
      return;
    }

    const btn = document.getElementById('reg-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    const res = await API.register(username, password);

    if (res.success) {
      showToast('Account created! Logging you in...', 'success');
      navigate('#/dashboard');
    } else {
      showToast(res.message || 'Registration failed.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
    }
  });
}


// ── Dashboard ────────────────────────────────────────────────

/** Returns a trend badge HTML string based on count. */
function trendBadge(count) {
  if (count === 0) return `<div class="stat-trend flat">─ Empty</div>`;
  if (count >= 5)  return `<div class="stat-trend up">↑ Active</div>`;
  return `<div class="stat-trend flat">→ Growing</div>`;
}

async function renderDashboard() {
  const main = getMain();
  main.className = 'main-content';
  main.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';

  // Fetch all counts in parallel
  const [studentsRes, attendanceRes, marksRes, subjectsRes, authRes] = await Promise.all([
    API.getStudents(),
    API.getAttendance(),
    API.getMarks(),
    API.getSubjects(),
    API.checkAuth()
  ]);

  const username = authRes.success ? authRes.data.username : 'User';
  // Update sidebar username chip without full re-render
  renderSidebar(window.location.hash, username);

  const studentCount    = studentsRes.success  ? studentsRes.data.length  : 0;
  const attendanceCount = attendanceRes.success ? attendanceRes.data.length : 0;
  const marksCount      = marksRes.success     ? marksRes.data.length     : 0;
  const subjectCount    = subjectsRes.success  ? subjectsRes.data.length  : 0;

  main.innerHTML = `
    <div class="welcome-banner">
      <h2>👋 Welcome back, ${escapeHtml(username)}!</h2>
      <p>Here's an overview of your student management system.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card" onclick="navigate('#/students')">
        <div class="stat-icon purple"><i class="fas fa-user-graduate"></i></div>
        <div class="stat-value">${studentCount}</div>
        <div class="stat-label">Students</div>
        ${trendBadge(studentCount)}
      </div>
      <div class="stat-card" onclick="navigate('#/attendance')">
        <div class="stat-icon blue"><i class="fas fa-calendar-check"></i></div>
        <div class="stat-value">${attendanceCount}</div>
        <div class="stat-label">Attendance Records</div>
        ${trendBadge(attendanceCount)}
      </div>
      <div class="stat-card" onclick="navigate('#/marks')">
        <div class="stat-icon green"><i class="fas fa-chart-line"></i></div>
        <div class="stat-value">${marksCount}</div>
        <div class="stat-label">Marks Records</div>
        ${trendBadge(marksCount)}
      </div>
      <div class="stat-card" onclick="navigate('#/subjects')">
        <div class="stat-icon orange"><i class="fas fa-book"></i></div>
        <div class="stat-value">${subjectCount}</div>
        <div class="stat-label">Subjects</div>
        ${trendBadge(subjectCount)}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-bolt" style="color:var(--accent-primary);margin-right:8px"></i>Quick Actions</h2>
      </div>
      <div class="quick-actions">
        <a class="quick-action-card" href="#/students/add">
          <div class="qa-icon" style="background:rgba(108,99,255,0.15);color:#6c63ff"><i class="fas fa-user-plus"></i></div>
          <div>
            <div class="qa-text">Add Student</div>
            <div class="qa-desc">Register a new student</div>
          </div>
        </a>
        <a class="quick-action-card" href="#/attendance/add">
          <div class="qa-icon" style="background:rgba(59,130,246,0.15);color:#3b82f6"><i class="fas fa-calendar-plus"></i></div>
          <div>
            <div class="qa-text">Record Attendance</div>
            <div class="qa-desc">Mark today's attendance</div>
          </div>
        </a>
        <a class="quick-action-card" href="#/marks/add">
          <div class="qa-icon" style="background:rgba(16,185,129,0.15);color:#10b981"><i class="fas fa-plus-circle"></i></div>
          <div>
            <div class="qa-text">Add Marks</div>
            <div class="qa-desc">Enter exam scores</div>
          </div>
        </a>
        <a class="quick-action-card" href="#/subjects/add">
          <div class="qa-icon" style="background:rgba(245,158,11,0.15);color:#f59e0b"><i class="fas fa-book-medical"></i></div>
          <div>
            <div class="qa-text">Add Subject</div>
            <div class="qa-desc">Create a new subject</div>
          </div>
        </a>
      </div>
    </div>
  `;
}


// ── Students List ────────────────────────────────────────────

async function renderStudentsList() {
  const main = getMain();
  main.className = 'main-content';
  main.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';

  const res = await API.getStudents();
  const students = res.success ? res.data : [];

  let rows = '';
  if (students.length === 0) {
    rows = `<tr class="empty-row"><td colspan="6"><i class="fas fa-user-graduate" style="font-size:1.8rem;display:block;margin-bottom:10px;opacity:0.4"></i>No students yet.<br><span style="font-size:0.8rem">Add your first student 😊</span></td></tr>`;
  } else {
    rows = students.map(s => `
      <tr>
        <td>${s.id}</td>
        <td><strong>${escapeHtml(s.enrollment_no)}</strong></td>
        <td>${escapeHtml(s.student_name)}</td>
        <td>${escapeHtml(s.department)}</td>
        <td>${escapeHtml(s.phone)}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-warning btn-sm" onclick="navigate('#/students/edit/${s.id}')"><i class="fas fa-pen"></i> Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id}, '${escapeHtml(s.student_name)}')"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  main.innerHTML = `
    <div class="page-header">
      <h1><i class="fas fa-user-graduate" style="color:var(--accent-primary);margin-right:10px"></i>Students</h1>
      <p>Manage all registered students</p>
    </div>
    <div class="card">
      <div class="card-header">
        <h2>All Students (${students.length})</h2>
        <a class="btn btn-primary btn-sm" href="#/students/add"><i class="fas fa-plus"></i> Add Student</a>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Enrollment No</th>
              <th>Name</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

async function deleteStudent(id, name) {
  const confirmed = await showConfirm('Delete Student', `Are you sure you want to delete "${name}"? Related attendance and marks will also be deleted.`);
  if (!confirmed) return;

  const res = await API.deleteStudent(id);
  if (res.success) {
    showToast('Student deleted successfully.', 'success');
    renderStudentsList();
  } else {
    showToast(res.message || 'Error deleting student.', 'error');
  }
}
// Make globally accessible for onclick
window.deleteStudent = deleteStudent;


// ── Add Student ──────────────────────────────────────────────

function renderAddStudent() {
  const main = getMain();
  main.className = 'main-content';

  main.innerHTML = `
    <div class="page-header">
      <h1><i class="fas fa-user-plus" style="color:var(--accent-primary);margin-right:10px"></i>Add Student</h1>
      <p>Register a new student in the system</p>
    </div>
    <div class="card" style="max-width:600px">
      <form id="add-student-form">
        <div class="form-row">
          <div class="form-group">
            <label for="s-enrollment">Enrollment No</label>
            <input type="text" class="form-control" id="s-enrollment" placeholder="e.g., EN2024001" required>
          </div>
          <div class="form-group">
            <label for="s-name">Student Name</label>
            <input type="text" class="form-control" id="s-name" placeholder="Full name" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="s-department">Department</label>
            <input type="text" class="form-control" id="s-department" placeholder="e.g., Computer Science" required>
          </div>
          <div class="form-group">
            <label for="s-phone">Phone</label>
            <input type="text" class="form-control" id="s-phone" placeholder="e.g., 9876543210" required>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="add-student-btn"><i class="fas fa-plus"></i> Add Student</button>
          <a class="btn btn-ghost" href="#/students"><i class="fas fa-arrow-left"></i> Back</a>
        </div>
      </form>
    </div>
  `;

  document.getElementById('add-student-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      enrollment_no: document.getElementById('s-enrollment').value,
      student_name: document.getElementById('s-name').value,
      department: document.getElementById('s-department').value,
      phone: document.getElementById('s-phone').value
    };

    const btn = document.getElementById('add-student-btn');
    btn.disabled = true;

    const res = await API.addStudent(data);
    if (res.success) {
      showToast('Student added successfully!', 'success');
      navigate('#/students');
    } else {
      showToast(res.message || 'Error adding student.', 'error');
      btn.disabled = false;
    }
  });
}


// ── Edit Student ─────────────────────────────────────────────

async function renderEditStudent(id) {
  const main = getMain();
  main.className = 'main-content';
  main.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';

  const res = await API.getStudent(id);
  if (!res.success) {
    showToast(res.message || 'Student not found.', 'error');
    navigate('#/students');
    return;
  }

  const s = res.data;

  main.innerHTML = `
    <div class="page-header">
      <h1><i class="fas fa-pen" style="color:var(--warning);margin-right:10px"></i>Edit Student</h1>
      <p>Update student information</p>
    </div>
    <div class="card" style="max-width:600px">
      <form id="edit-student-form">
        <div class="form-row">
          <div class="form-group">
            <label for="s-enrollment">Enrollment No</label>
            <input type="text" class="form-control" id="s-enrollment" value="${escapeHtml(s.enrollment_no)}" required>
          </div>
          <div class="form-group">
            <label for="s-name">Student Name</label>
            <input type="text" class="form-control" id="s-name" value="${escapeHtml(s.student_name)}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="s-department">Department</label>
            <input type="text" class="form-control" id="s-department" value="${escapeHtml(s.department)}" required>
          </div>
          <div class="form-group">
            <label for="s-phone">Phone</label>
            <input type="text" class="form-control" id="s-phone" value="${escapeHtml(s.phone)}" required>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="edit-student-btn"><i class="fas fa-save"></i> Update Student</button>
          <a class="btn btn-ghost" href="#/students"><i class="fas fa-arrow-left"></i> Back</a>
        </div>
      </form>
    </div>
  `;

  document.getElementById('edit-student-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      enrollment_no: document.getElementById('s-enrollment').value,
      student_name: document.getElementById('s-name').value,
      department: document.getElementById('s-department').value,
      phone: document.getElementById('s-phone').value
    };

    const btn = document.getElementById('edit-student-btn');
    btn.disabled = true;

    const result = await API.updateStudent(id, data);
    if (result.success) {
      showToast('Student updated successfully!', 'success');
      navigate('#/students');
    } else {
      showToast(result.message || 'Error updating student.', 'error');
      btn.disabled = false;
    }
  });
}


// ── Attendance List ──────────────────────────────────────────

async function renderAttendanceList() {
  const main = getMain();
  main.className = 'main-content';
  main.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';

  const [attRes, studRes] = await Promise.all([API.getAttendance(), API.getStudents()]);
  const records = attRes.success ? attRes.data : [];
  const students = studRes.success ? studRes.data : [];

  // Build student lookup
  const studentMap = {};
  students.forEach(s => { studentMap[s.id] = s.student_name; });

  let rows = '';
  if (records.length === 0) {
    rows = `<tr class="empty-row"><td colspan="6"><i class="fas fa-calendar-xmark" style="font-size:1.8rem;display:block;margin-bottom:10px;opacity:0.4"></i>No attendance records yet.<br><span style="font-size:0.8rem">Start marking attendance 📅</span></td></tr>`;
  } else {
    rows = records.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.student_id} ${studentMap[r.student_id] ? '— ' + escapeHtml(studentMap[r.student_id]) : ''}</td>
        <td>${escapeHtml(r.attendance_date)}</td>
        <td>${r.attendance === 1 ? '<span class="badge badge-success">Present</span>' : '<span class="badge badge-danger">Absent</span>'}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-warning btn-sm" onclick="navigate('#/attendance/edit/${r.id}')"><i class="fas fa-pen"></i> Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteAttendance(${r.id})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  main.innerHTML = `
    <div class="page-header">
      <h1><i class="fas fa-calendar-check" style="color:var(--info);margin-right:10px"></i>Attendance</h1>
      <p>Track student attendance records</p>
    </div>
    <div class="card">
      <div class="card-header">
        <h2>All Records (${records.length})</h2>
        <a class="btn btn-primary btn-sm" href="#/attendance/add"><i class="fas fa-plus"></i> Add Attendance</a>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

async function deleteAttendance(id) {
  const confirmed = await showConfirm('Delete Attendance', 'Are you sure you want to delete this attendance record?');
  if (!confirmed) return;

  const res = await API.deleteAttendance(id);
  if (res.success) {
    showToast('Attendance record deleted.', 'success');
    renderAttendanceList();
  } else {
    showToast(res.message || 'Error deleting record.', 'error');
  }
}
window.deleteAttendance = deleteAttendance;


// ── Add Attendance ───────────────────────────────────────────

async function renderAddAttendance() {
  const main = getMain();
  main.className = 'main-content';

  // Fetch students for dropdown
  const studRes = await API.getStudents();
  const students = studRes.success ? studRes.data : [];

  let studentOptions = '<option value="">— Select Student —</option>';
  students.forEach(s => {
    studentOptions += `<option value="${s.id}">${escapeHtml(s.enrollment_no)} — ${escapeHtml(s.student_name)}</option>`;
  });

  const today = new Date().toISOString().split('T')[0];

  main.innerHTML = `
    <div class="page-header">
      <h1><i class="fas fa-calendar-plus" style="color:var(--info);margin-right:10px"></i>Add Attendance</h1>
      <p>Record student attendance</p>
    </div>
    <div class="card" style="max-width:500px">
      <form id="add-attendance-form">
        <div class="form-group">
          <label for="a-student">Student</label>
          <select class="form-control" id="a-student" required>${studentOptions}</select>
        </div>
        <div class="form-group">
          <label for="a-date">Date</label>
          <input type="date" class="form-control" id="a-date" value="${today}" required>
        </div>
        <div class="form-group">
          <label for="a-status">Status</label>
          <select class="form-control" id="a-status" required>
            <option value="1">Present</option>
            <option value="0">Absent</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="add-att-btn"><i class="fas fa-plus"></i> Add Attendance</button>
          <a class="btn btn-ghost" href="#/attendance"><i class="fas fa-arrow-left"></i> Back</a>
        </div>
      </form>
    </div>
  `;

  document.getElementById('add-attendance-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      student_id: Number(document.getElementById('a-student').value),
      attendance_date: document.getElementById('a-date').value,
      attendance: Number(document.getElementById('a-status').value)
    };

    if (!data.student_id) {
      showToast('Please select a student.', 'warning');
      return;
    }

    const btn = document.getElementById('add-att-btn');
    btn.disabled = true;

    const res = await API.addAttendance(data);
    if (res.success) {
      showToast('Attendance recorded!', 'success');
      navigate('#/attendance');
    } else {
      showToast(res.message || 'Error adding attendance.', 'error');
      btn.disabled = false;
    }
  });
}


// ── Edit Attendance ──────────────────────────────────────────

async function renderEditAttendance(id) {
  const main = getMain();
  main.className = 'main-content';
  main.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';

  const [attRes, studRes] = await Promise.all([API.getAttendanceById(id), API.getStudents()]);

  if (!attRes.success) {
    showToast(attRes.message || 'Record not found.', 'error');
    navigate('#/attendance');
    return;
  }

  const record = attRes.data;
  const students = studRes.success ? studRes.data : [];

  let studentOptions = '';
  students.forEach(s => {
    const sel = s.id === record.student_id ? 'selected' : '';
    studentOptions += `<option value="${s.id}" ${sel}>${escapeHtml(s.enrollment_no)} — ${escapeHtml(s.student_name)}</option>`;
  });

  main.innerHTML = `
    <div class="page-header">
      <h1><i class="fas fa-pen" style="color:var(--warning);margin-right:10px"></i>Edit Attendance</h1>
      <p>Update attendance record</p>
    </div>
    <div class="card" style="max-width:500px">
      <form id="edit-attendance-form">
        <div class="form-group">
          <label for="a-student">Student</label>
          <select class="form-control" id="a-student" required>${studentOptions}</select>
        </div>
        <div class="form-group">
          <label for="a-date">Date</label>
          <input type="date" class="form-control" id="a-date" value="${record.attendance_date}" required>
        </div>
        <div class="form-group">
          <label for="a-status">Status</label>
          <select class="form-control" id="a-status" required>
            <option value="1" ${record.attendance === 1 ? 'selected' : ''}>Present</option>
            <option value="0" ${record.attendance === 0 ? 'selected' : ''}>Absent</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="edit-att-btn"><i class="fas fa-save"></i> Update</button>
          <a class="btn btn-ghost" href="#/attendance"><i class="fas fa-arrow-left"></i> Back</a>
        </div>
      </form>
    </div>
  `;

  document.getElementById('edit-attendance-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      student_id: Number(document.getElementById('a-student').value),
      attendance_date: document.getElementById('a-date').value,
      attendance: Number(document.getElementById('a-status').value)
    };

    const btn = document.getElementById('edit-att-btn');
    btn.disabled = true;

    const result = await API.updateAttendance(id, data);
    if (result.success) {
      showToast('Attendance updated!', 'success');
      navigate('#/attendance');
    } else {
      showToast(result.message || 'Error updating.', 'error');
      btn.disabled = false;
    }
  });
}


// ── Marks List ───────────────────────────────────────────────

async function renderMarksList() {
  const main = getMain();
  main.className = 'main-content';
  main.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';

  const [marksRes, studRes, subRes] = await Promise.all([
    API.getMarks(), API.getStudents(), API.getSubjects()
  ]);

  const records = marksRes.success ? marksRes.data : [];
  const students = studRes.success ? studRes.data : [];
  const subjects = subRes.success ? subRes.data : [];

  const studentMap = {};
  students.forEach(s => { studentMap[s.id] = s.student_name; });
  const subjectMap = {};
  subjects.forEach(s => { subjectMap[s.id] = s.subject_name; });

  /** Returns a coloured grade badge based on marks 0-100 */
  function marksBadge(m) {
    if (m >= 75) return `<span class="marks-badge grade-a">${m} — A</span>`;
    if (m >= 60) return `<span class="marks-badge grade-b">${m} — B</span>`;
    if (m >= 45) return `<span class="marks-badge grade-c">${m} — C</span>`;
    return `<span class="marks-badge grade-d">${m} — D</span>`;
  }

  let rows = '';
  if (records.length === 0) {
    rows = `<tr class="empty-row"><td colspan="6"><i class="fas fa-chart-simple" style="font-size:1.8rem;display:block;margin-bottom:10px;opacity:0.4"></i>No marks recorded yet.<br><span style="font-size:0.8rem">Add your first exam score 📝</span></td></tr>`;
  } else {
    rows = records.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.student_id} ${studentMap[r.student_id] ? '— ' + escapeHtml(studentMap[r.student_id]) : ''}</td>
        <td>${r.subject_id} ${subjectMap[r.subject_id] ? '— ' + escapeHtml(subjectMap[r.subject_id]) : ''}</td>
        <td>${marksBadge(r.marks)}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-warning btn-sm" onclick="navigate('#/marks/edit/${r.id}')"><i class="fas fa-pen"></i> Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteMarks(${r.id})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  main.innerHTML = `
    <div class="page-header">
      <h1><i class="fas fa-chart-line" style="color:var(--success);margin-right:10px"></i>Marks</h1>
      <p>Manage student examination scores</p>
    </div>
    <div class="card">
      <div class="card-header">
        <h2>All Records (${records.length})</h2>
        <a class="btn btn-primary btn-sm" href="#/marks/add"><i class="fas fa-plus"></i> Add Marks</a>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Subject</th>
              <th>Marks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

async function deleteMarks(id) {
  const confirmed = await showConfirm('Delete Marks', 'Are you sure you want to delete this marks record?');
  if (!confirmed) return;

  const res = await API.deleteMarks(id);
  if (res.success) {
    showToast('Marks record deleted.', 'success');
    renderMarksList();
  } else {
    showToast(res.message || 'Error deleting record.', 'error');
  }
}
window.deleteMarks = deleteMarks;


// ── Add Marks ────────────────────────────────────────────────

async function renderAddMarks() {
  const main = getMain();
  main.className = 'main-content';

  const [studRes, subRes] = await Promise.all([API.getStudents(), API.getSubjects()]);
  const students = studRes.success ? studRes.data : [];
  const subjects = subRes.success ? subRes.data : [];

  let studentOptions = '<option value="">— Select Student —</option>';
  students.forEach(s => {
    studentOptions += `<option value="${s.id}">${escapeHtml(s.enrollment_no)} — ${escapeHtml(s.student_name)}</option>`;
  });

  let subjectOptions = '<option value="">— Select Subject —</option>';
  subjects.forEach(s => {
    subjectOptions += `<option value="${s.id}">${escapeHtml(s.subject_name)}</option>`;
  });

  main.innerHTML = `
    <div class="page-header">
      <h1><i class="fas fa-plus-circle" style="color:var(--success);margin-right:10px"></i>Add Marks</h1>
      <p>Record examination scores</p>
    </div>
    <div class="card" style="max-width:500px">
      <form id="add-marks-form">
        <div class="form-group">
          <label for="m-student">Student</label>
          <select class="form-control" id="m-student" required>${studentOptions}</select>
        </div>
        <div class="form-group">
          <label for="m-subject">Subject</label>
          <select class="form-control" id="m-subject" required>${subjectOptions}</select>
        </div>
        <div class="form-group">
          <label for="m-marks">Marks (0–100)</label>
          <input type="number" class="form-control" id="m-marks" min="0" max="100" placeholder="Enter marks" required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="add-marks-btn"><i class="fas fa-plus"></i> Add Marks</button>
          <a class="btn btn-ghost" href="#/marks"><i class="fas fa-arrow-left"></i> Back</a>
        </div>
      </form>
    </div>
  `;

  document.getElementById('add-marks-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      student_id: Number(document.getElementById('m-student').value),
      subject_id: Number(document.getElementById('m-subject').value),
      marks: Number(document.getElementById('m-marks').value)
    };

    if (!data.student_id || !data.subject_id) {
      showToast('Please select both a student and a subject.', 'warning');
      return;
    }

    const btn = document.getElementById('add-marks-btn');
    btn.disabled = true;

    const res = await API.addMarks(data);
    if (res.success) {
      showToast('Marks added successfully!', 'success');
      navigate('#/marks');
    } else {
      showToast(res.message || 'Error adding marks.', 'error');
      btn.disabled = false;
    }
  });
}


// ── Edit Marks ───────────────────────────────────────────────

async function renderEditMarks(id) {
  const main = getMain();
  main.className = 'main-content';
  main.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';

  const [marksRes, studRes, subRes] = await Promise.all([
    API.getMarksById(id), API.getStudents(), API.getSubjects()
  ]);

  if (!marksRes.success) {
    showToast(marksRes.message || 'Record not found.', 'error');
    navigate('#/marks');
    return;
  }

  const record = marksRes.data;
  const students = studRes.success ? studRes.data : [];
  const subjects = subRes.success ? subRes.data : [];

  let studentOptions = '';
  students.forEach(s => {
    const sel = s.id === record.student_id ? 'selected' : '';
    studentOptions += `<option value="${s.id}" ${sel}>${escapeHtml(s.enrollment_no)} — ${escapeHtml(s.student_name)}</option>`;
  });

  let subjectOptions = '';
  subjects.forEach(s => {
    const sel = s.id === record.subject_id ? 'selected' : '';
    subjectOptions += `<option value="${s.id}" ${sel}>${escapeHtml(s.subject_name)}</option>`;
  });

  main.innerHTML = `
    <div class="page-header">
      <h1><i class="fas fa-pen" style="color:var(--warning);margin-right:10px"></i>Edit Marks</h1>
      <p>Update marks record</p>
    </div>
    <div class="card" style="max-width:500px">
      <form id="edit-marks-form">
        <div class="form-group">
          <label for="m-student">Student</label>
          <select class="form-control" id="m-student" required>${studentOptions}</select>
        </div>
        <div class="form-group">
          <label for="m-subject">Subject</label>
          <select class="form-control" id="m-subject" required>${subjectOptions}</select>
        </div>
        <div class="form-group">
          <label for="m-marks">Marks (0–100)</label>
          <input type="number" class="form-control" id="m-marks" min="0" max="100" value="${record.marks}" required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="edit-marks-btn"><i class="fas fa-save"></i> Update</button>
          <a class="btn btn-ghost" href="#/marks"><i class="fas fa-arrow-left"></i> Back</a>
        </div>
      </form>
    </div>
  `;

  document.getElementById('edit-marks-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      student_id: Number(document.getElementById('m-student').value),
      subject_id: Number(document.getElementById('m-subject').value),
      marks: Number(document.getElementById('m-marks').value)
    };

    const btn = document.getElementById('edit-marks-btn');
    btn.disabled = true;

    const result = await API.updateMarks(id, data);
    if (result.success) {
      showToast('Marks updated!', 'success');
      navigate('#/marks');
    } else {
      showToast(result.message || 'Error updating marks.', 'error');
      btn.disabled = false;
    }
  });
}


// ── Subjects List ────────────────────────────────────────────

async function renderSubjectsList() {
  const main = getMain();
  main.className = 'main-content';
  main.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';

  const res = await API.getSubjects();
  const subjects = res.success ? res.data : [];

  let rows = '';
  if (subjects.length === 0) {
    rows = `<tr class="empty-row"><td colspan="4"><i class="fas fa-book-open" style="font-size:1.8rem;display:block;margin-bottom:10px;opacity:0.4"></i>No subjects added yet.<br><span style="font-size:0.8rem">Add your first subject 📚</span></td></tr>`;
  } else {
    rows = subjects.map(s => `
      <tr>
        <td>${s.id}</td>
        <td><strong>${escapeHtml(s.subject_name)}</strong></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-warning btn-sm" onclick="navigate('#/subjects/edit/${s.id}')"><i class="fas fa-pen"></i> Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteSubject(${s.id}, '${escapeHtml(s.subject_name)}')"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  main.innerHTML = `
    <div class="page-header">
      <h1><i class="fas fa-book" style="color:var(--warning);margin-right:10px"></i>Subjects</h1>
      <p>Manage course subjects</p>
    </div>
    <div class="card">
      <div class="card-header">
        <h2>All Subjects (${subjects.length})</h2>
        <a class="btn btn-primary btn-sm" href="#/subjects/add"><i class="fas fa-plus"></i> Add Subject</a>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

async function deleteSubject(id, name) {
  const confirmed = await showConfirm('Delete Subject', `Are you sure you want to delete "${name}"? Related marks records will also be deleted.`);
  if (!confirmed) return;

  const res = await API.deleteSubject(id);
  if (res.success) {
    showToast('Subject deleted successfully.', 'success');
    renderSubjectsList();
  } else {
    showToast(res.message || 'Error deleting subject.', 'error');
  }
}
window.deleteSubject = deleteSubject;


// ── Add Subject ──────────────────────────────────────────────

function renderAddSubject() {
  const main = getMain();
  main.className = 'main-content';

  main.innerHTML = `
    <div class="page-header">
      <h1><i class="fas fa-book-medical" style="color:var(--warning);margin-right:10px"></i>Add Subject</h1>
      <p>Create a new subject in the system</p>
    </div>
    <div class="card" style="max-width:500px">
      <form id="add-subject-form">
        <div class="form-group">
          <label for="sub-name">Subject Name</label>
          <input type="text" class="form-control" id="sub-name" placeholder="e.g., Mathematics" required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="add-sub-btn"><i class="fas fa-plus"></i> Add Subject</button>
          <a class="btn btn-ghost" href="#/subjects"><i class="fas fa-arrow-left"></i> Back</a>
        </div>
      </form>
    </div>
  `;

  document.getElementById('add-subject-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { subject_name: document.getElementById('sub-name').value };

    const btn = document.getElementById('add-sub-btn');
    btn.disabled = true;

    const res = await API.addSubject(data);
    if (res.success) {
      showToast('Subject added successfully!', 'success');
      navigate('#/subjects');
    } else {
      showToast(res.message || 'Error adding subject.', 'error');
      btn.disabled = false;
    }
  });
}


// ── Edit Subject ─────────────────────────────────────────────

async function renderEditSubject(id) {
  const main = getMain();
  main.className = 'main-content';
  main.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';

  const res = await API.getSubject(id);
  if (!res.success) {
    showToast(res.message || 'Subject not found.', 'error');
    navigate('#/subjects');
    return;
  }

  const s = res.data;

  main.innerHTML = `
    <div class="page-header">
      <h1><i class="fas fa-pen" style="color:var(--warning);margin-right:10px"></i>Edit Subject</h1>
      <p>Update subject information</p>
    </div>
    <div class="card" style="max-width:500px">
      <form id="edit-subject-form">
        <div class="form-group">
          <label for="sub-name">Subject Name</label>
          <input type="text" class="form-control" id="sub-name" value="${escapeHtml(s.subject_name)}" required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="edit-sub-btn"><i class="fas fa-save"></i> Update Subject</button>
          <a class="btn btn-ghost" href="#/subjects"><i class="fas fa-arrow-left"></i> Back</a>
        </div>
      </form>
    </div>
  `;

  document.getElementById('edit-subject-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { subject_name: document.getElementById('sub-name').value };

    const btn = document.getElementById('edit-sub-btn');
    btn.disabled = true;

    const result = await API.updateSubject(id, data);
    if (result.success) {
      showToast('Subject updated!', 'success');
      navigate('#/subjects');
    } else {
      showToast(result.message || 'Error updating subject.', 'error');
      btn.disabled = false;
    }
  });
}


// ═══════════════════════════════════════════════════════════════
// Router
// ═══════════════════════════════════════════════════════════════

async function router() {
  const hash = window.location.hash || '#/';
  const path = hash.replace('#', '');

  // Public routes (no auth required)
  if (path === '/login' || path === '/') {
    renderLoginPage();
    return;
  }
  if (path === '/register') {
    renderRegisterPage();
    return;
  }

  // Check authentication for all other routes
  const authCheck = await API.checkAuth();
  if (!authCheck.success) {
    navigate('#/login');
    return;
  }

  // Render sidebar for authenticated routes
  renderSidebar(hash);

  // Route matching
  if (path === '/dashboard') {
    await renderDashboard();
  }
  // Students
  else if (path === '/students') {
    await renderStudentsList();
  }
  else if (path === '/students/add') {
    renderAddStudent();
  }
  else if (path.match(/^\/students\/edit\/(\d+)$/)) {
    const id = path.match(/^\/students\/edit\/(\d+)$/)[1];
    await renderEditStudent(id);
  }
  // Attendance
  else if (path === '/attendance') {
    await renderAttendanceList();
  }
  else if (path === '/attendance/add') {
    await renderAddAttendance();
  }
  else if (path.match(/^\/attendance\/edit\/(\d+)$/)) {
    const id = path.match(/^\/attendance\/edit\/(\d+)$/)[1];
    await renderEditAttendance(id);
  }
  // Marks
  else if (path === '/marks') {
    await renderMarksList();
  }
  else if (path === '/marks/add') {
    await renderAddMarks();
  }
  else if (path.match(/^\/marks\/edit\/(\d+)$/)) {
    const id = path.match(/^\/marks\/edit\/(\d+)$/)[1];
    await renderEditMarks(id);
  }
  // Subjects
  else if (path === '/subjects') {
    await renderSubjectsList();
  }
  else if (path === '/subjects/add') {
    renderAddSubject();
  }
  else if (path.match(/^\/subjects\/edit\/(\d+)$/)) {
    const id = path.match(/^\/subjects\/edit\/(\d+)$/)[1];
    await renderEditSubject(id);
  }
  // 404
  else {
    const main = getMain();
    main.className = 'main-content';
    main.innerHTML = `
      <div class="page-header">
        <h1>404 — Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
      </div>
      <a class="btn btn-primary" href="#/dashboard"><i class="fas fa-home"></i> Go to Dashboard</a>
    `;
  }
}

// Listen for hash changes
window.addEventListener('hashchange', router);

// Initial route on page load
window.addEventListener('DOMContentLoaded', async () => {
  // Initialize Global Extras
  initClock();
  initThemeToggle();

  // If no hash or just '#', check auth and redirect
  const hash = window.location.hash;
  if (!hash || hash === '#' || hash === '#/') {
    const auth = await API.checkAuth();
    if (auth.success) {
      navigate('#/dashboard');
    } else {
      navigate('#/login');
    }
  } else {
    router();
  }
});

// Make navigate globally accessible for onclick handlers
window.navigate = navigate;
