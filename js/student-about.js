document.addEventListener('DOMContentLoaded', () => {
  checkStudentAuth();
  loadNotificationBadge();
  setupProfileDropdown();
  setupLogout();
});

function checkStudentAuth() {
  const userRaw = localStorage.getItem('campusfest_current_user') || sessionStorage.getItem('campusfest_current_user');
  let student = null;
  if (userRaw) {
    try {
      student = JSON.parse(userRaw);
    } catch (e) {}
  }
  if (!student || student.role !== 'student') {
    window.location.href = 'login.html';
    return null;
  }
  const navStudentName = document.getElementById('navStudentName');
  if (navStudentName) navStudentName.textContent = student.name;
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

function setupProfileDropdown() {
  document.querySelectorAll('.header-profile-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = btn.closest('.header-profile-dropdown');
      if (!parent) return;
      const menu = parent.querySelector('.student-profile-menu');
      if (!menu) return;
      const isOpen = menu.classList.contains('show');
      document.querySelectorAll('.student-profile-menu.show').forEach(m => {
        m.classList.remove('show');
        const sib = m.closest('.header-profile-dropdown')?.querySelector('.header-profile-btn');
        if (sib) sib.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        menu.classList.add('show');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.querySelectorAll('.student-profile-menu .profile-dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.student-profile-menu.show').forEach(menu => {
        menu.classList.remove('show');
        const btn = menu.closest('.header-profile-dropdown')?.querySelector('.header-profile-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-profile-dropdown')) {
      document.querySelectorAll('.student-profile-menu.show').forEach(menu => {
        menu.classList.remove('show');
        const btn = menu.closest('.header-profile-dropdown')?.querySelector('.header-profile-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

function setupLogout() {
  const logoutBtns = document.querySelectorAll('.student-logout-btn, #studentLogoutBtn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('campusfest_current_user');
      sessionStorage.removeItem('campusfest_current_user');
      sessionStorage.clear();
      window.location.href = 'login.html';
    });
  });
}
