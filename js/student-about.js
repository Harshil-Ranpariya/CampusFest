// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  setupProfileDropdown();
  setupLogout();
  checkStudentAuth();
  loadNotificationBadge();
});

// Auth Check
function checkStudentAuth() {
  const isLoggedOut = sessionStorage.getItem('campusfest_logged_out') === 'true';
  const userRaw = localStorage.getItem('campusfest_current_user') || sessionStorage.getItem('campusfest_current_user');
  let student = null;

  if (userRaw && !isLoggedOut) {
    try {
      student = JSON.parse(userRaw);
    } catch (e) {
      console.error(e);
    }
  }

  if (isLoggedOut || (userRaw && (!student || student.role !== 'student'))) {
    window.location.href = 'login.html';
    return null;
  }

  if (!student) {
    student = {
      id: 'usr-student-1',
      name: 'Alex Mercer',
      email: 'alex.mercer@marwadiuniversity.ac.in',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      semester: '5th Semester',
      enrollmentNo: 'CS2021045',
      phone: '+91 9876543210'
    };
    localStorage.setItem('campusfest_current_user', JSON.stringify(student));
  }

  const navStudentName = document.getElementById('navStudentName');
  if (navStudentName) {
    navStudentName.textContent = student.name;
  }

  return student;
}

function loadNotificationBadge() {
  const notifRaw = localStorage.getItem('campusfest_notifications');
  if (!notifRaw) return;
  try {
    const notifs = JSON.parse(notifRaw);
    const unread = notifs.filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    if (badge && unread > 0) {
      badge.textContent = unread;
      badge.style.display = 'inline-block';
    }
  } catch (e) {}
}

// Profile Menu
window.toggleStudentProfileMenu = function(btn, event) {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }
  const trigger = (btn && typeof btn.closest === 'function') ? btn : (event ? (event.currentTarget || event.target) : null);
  const parent = trigger ? trigger.closest('.header-profile-dropdown') : document.querySelector('.header-profile-dropdown');
  if (!parent) return;
  const menu = parent.querySelector('.student-profile-menu');
  if (!menu) return;

  const isCurrentlyOpen = menu.classList.contains('show');

  document.querySelectorAll('.student-profile-menu.show').forEach(m => {
    m.classList.remove('show');
    const toggleBtn = m.closest('.header-profile-dropdown')?.querySelector('.header-profile-btn');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.classList.remove('show');
    }
  });

  if (!isCurrentlyOpen) {
    menu.classList.add('show');
    const toggleBtn = parent.querySelector('.header-profile-btn');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.classList.add('show');
    }
  }
};

function setupProfileDropdown() {
  document.querySelectorAll('.header-profile-btn').forEach(btn => {
    btn.onclick = function(e) {
      window.toggleStudentProfileMenu(btn, e);
    };
  });

  document.querySelectorAll('.student-profile-menu .profile-dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.student-profile-menu.show').forEach(menu => {
        menu.classList.remove('show');
        const btn = menu.closest('.header-profile-dropdown')?.querySelector('.header-profile-btn');
        if (btn) {
          btn.setAttribute('aria-expanded', 'false');
          btn.classList.remove('show');
        }
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-profile-dropdown')) {
      document.querySelectorAll('.student-profile-menu.show').forEach(menu => {
        menu.classList.remove('show');
        const btn = menu.closest('.header-profile-dropdown')?.querySelector('.header-profile-btn');
        if (btn) {
          btn.setAttribute('aria-expanded', 'false');
          btn.classList.remove('show');
        }
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.student-profile-menu.show').forEach(menu => {
        menu.classList.remove('show');
        const btn = menu.closest('.header-profile-dropdown')?.querySelector('.header-profile-btn');
        if (btn) {
          btn.setAttribute('aria-expanded', 'false');
          btn.classList.remove('show');
        }
      });
    }
  });
}

// Logout Handler
function setupLogout() {
  const logoutBtns = document.querySelectorAll('.student-logout-btn, #studentLogoutBtn, .studentLogoutBtn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.setItem('campusfest_logged_out', 'true');
      localStorage.removeItem('campusfest_current_user');
      sessionStorage.removeItem('campusfest_current_user');
      window.location.href = 'login.html';
    });
  });
}
