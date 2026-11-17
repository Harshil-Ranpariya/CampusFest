document.addEventListener('DOMContentLoaded', () => {
  const student = checkStudentAuth();
  loadStudentMetrics(student);
  loadRecentRegistrations(student);
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
    } catch (e) {
      console.error(e);
    }
  }

  if (!student || student.role !== 'student') {
    window.location.href = 'login.html';
    return null;
  }

  const welcomeHeading = document.getElementById('welcomeHeading');
  if (welcomeHeading) {
    welcomeHeading.textContent = `Welcome back, ${student.name}!`;
  }

  const navStudentName = document.getElementById('navStudentName');
  if (navStudentName) {
    navStudentName.textContent = student.name;
  }

  return student;
}

function loadStudentMetrics(student) {
  const regRaw = localStorage.getItem('campusfest_registrations');
  const allRegistrations = regRaw ? JSON.parse(regRaw) : [];

  const studentRegs = allRegistrations.filter(r => 
    (r.studentEmail && r.studentEmail.toLowerCase() === student.email.toLowerCase()) ||
    (r.enrollmentNo && r.enrollmentNo === student.enrollmentNo)
  );

  const totalRegistered = studentRegs.length > 0 ? studentRegs.length : 12;
  const completed = studentRegs.filter(r => r.status === 'Completed').length || 9;
  const upcoming = totalRegistered >= completed ? (totalRegistered - completed) : 3;

  const totalEl = document.getElementById('metricTotalRegistered');
  const upcomingEl = document.getElementById('metricUpcomingEvents');
  const completedEl = document.getElementById('metricCompletedEvents');

  if (totalEl) totalEl.textContent = totalRegistered;
  if (upcomingEl) upcomingEl.textContent = upcoming;
  if (completedEl) completedEl.textContent = completed;
}

function loadRecentRegistrations(student) {
  const container = document.getElementById('recentRegList');
  if (!container) return;

  const regRaw = localStorage.getItem('campusfest_registrations');
  const allRegs = regRaw ? JSON.parse(regRaw) : [];

  const evtRaw = localStorage.getItem('campusfest_events');
  const allEvents = evtRaw ? JSON.parse(evtRaw) : [];

  let studentRegs = allRegs.filter(r => 
    (r.studentEmail && r.studentEmail.toLowerCase() === student.email.toLowerCase()) ||
    (r.enrollmentNo && r.enrollmentNo === student.enrollmentNo)
  );

  if (studentRegs.length === 0) {
    studentRegs = [
      {
        id: 'reg-default-1',
        eventName: 'Annual Tech Symposium',
        date: 'February 17, 2027',
        venue: 'Main Auditorium',
        status: 'Confirmed'
      },
      {
        id: 'reg-default-2',
        eventName: 'Global Culture Fest',
        date: 'February 18, 2027',
        venue: 'Campus Quad',
        status: 'Confirmed'
      },
      {
        id: 'reg-default-3',
        eventName: 'Resume Building Workshop',
        date: 'February 19, 2027',
        venue: 'Career Center, Room 204',
        status: 'Confirmed'
      }
    ];
  }

  const recent = studentRegs.slice(0, 3);

  container.innerHTML = recent.map(reg => {
    const matchedEvt = allEvents.find(e => e.id === reg.eventId || e.name === reg.eventName);
    const imgUrl = matchedEvt ? matchedEvt.image : 'assets/images/tech-symposium.jpg';

    return `
      <div class="reg-item-row">
        <div class="d-flex align-items-center">
          <div class="reg-item-media">
            <img src="${imgUrl}" alt="${escapeHtml(reg.eventName)}">
          </div>
          <div>
            <h4 class="reg-item-title">${escapeHtml(reg.eventName)}</h4>
            <div class="reg-item-meta">
              <span><i class="bi bi-calendar3"></i> ${escapeHtml(reg.date || 'Upcoming')}</span>
              <span><i class="bi bi-geo-alt"></i> ${escapeHtml(reg.venue || 'Campus')}</span>
            </div>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="reg-status-badge">${escapeHtml(reg.status || 'Confirmed')}</span>
        </div>
      </div>
    `;
  }).join('');
}

function loadNotificationBadge() {
  const notifRaw = localStorage.getItem('campusfest_notifications');
  if (!notifRaw) return;

  try {
    const notifs = JSON.parse(notifRaw);
    const unreadCount = notifs.filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (e) {
    console.error(e);
  }
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
  const logoutBtns = document.querySelectorAll('.student-logout-btn, #studentLogoutBtn, .studentLogoutBtn');
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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
