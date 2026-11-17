let currentStudent = null;
let allStudentRegistrations = [];
let activeFilter = 'all';
let pendingCancelId = null;

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  setupProfileDropdown();
  setupLogout();
  currentStudent = checkStudentAuth();
  loadRegistrations();
  setupFilterDropdown();
  setupCancelModal();
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
  if (navStudentName) navStudentName.textContent = student.name;
  return student;
}

function loadRegistrations() {
  const regRaw = localStorage.getItem('campusfest_registrations');
  let regs = regRaw ? JSON.parse(regRaw) : [];

  allStudentRegistrations = regs.filter(r => 
    (r.studentEmail && r.studentEmail.toLowerCase() === currentStudent.email.toLowerCase()) ||
    (r.enrollmentNo && r.enrollmentNo === currentStudent.enrollmentNo)
  );

  if (allStudentRegistrations.length === 0) {
    const defaultData = [
      {
        id: 'reg-demo-1',
        eventId: 'evt-1',
        eventName: 'Annual Tech Symposium',
        studentName: currentStudent.name,
        studentEmail: currentStudent.email,
        enrollmentNo: currentStudent.enrollmentNo,
        department: 'Computer Science',
        date: 'February 17, 2027',
        time: '10:00 AM - 04:00 PM',
        venue: 'Main Auditorium',
        registeredOn: 'Feb 01, 2027',
        status: 'Confirmed'
      },
      {
        id: 'reg-demo-2',
        eventId: 'evt-2',
        eventName: 'Global Culture Fest',
        studentName: currentStudent.name,
        studentEmail: currentStudent.email,
        enrollmentNo: currentStudent.enrollmentNo,
        department: 'Computer Science',
        date: 'February 18, 2027',
        time: '12:00 PM - 08:00 PM',
        venue: 'Campus Quad',
        registeredOn: 'Feb 02, 2027',
        status: 'Confirmed'
      },
      {
        id: 'reg-demo-3',
        eventId: 'evt-3',
        eventName: 'Resume Building Workshop',
        studentName: currentStudent.name,
        studentEmail: currentStudent.email,
        enrollmentNo: currentStudent.enrollmentNo,
        department: 'Computer Science',
        date: 'February 19, 2027',
        time: '02:00 PM - 05:00 PM',
        venue: 'Career Center, Room 204',
        registeredOn: 'Feb 03, 2027',
        status: 'Confirmed'
      }
    ];

    regs.push(...defaultData);
    localStorage.setItem('campusfest_registrations', JSON.stringify(regs));
    allStudentRegistrations = defaultData;
  } else {
    let changed = false;
    const dateMap = {
      'evt-1': 'February 17, 2027',
      'evt-2': 'February 18, 2027',
      'evt-3': 'February 19, 2027',
      'evt-4': 'February 17, 2027',
      'evt-5': 'February 18, 2027',
      'evt-6': 'February 19, 2027'
    };
    allStudentRegistrations.forEach(r => {
      if (dateMap[r.eventId] && r.date !== dateMap[r.eventId]) {
        r.date = dateMap[r.eventId];
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem('campusfest_registrations', JSON.stringify(regs));
    }
  }

  renderRegistrationsTable();
}

function setupFilterDropdown() {
  const dropdownItems = document.querySelectorAll('.filter-opt');
  const labelEl = document.getElementById('currentFilterLabel');

  dropdownItems.forEach(item => {
    item.addEventListener('click', () => {
      dropdownItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      activeFilter = item.getAttribute('data-filter') || 'all';
      if (labelEl) {
        labelEl.textContent = activeFilter === 'all' ? 'Filter' : activeFilter;
      }
      renderRegistrationsTable();
    });
  });
}

function renderRegistrationsTable() {
  const tbody = document.getElementById('registrationsTableBody');
  if (!tbody) return;

  const filtered = allStudentRegistrations.filter(r => {
    if (activeFilter === 'all') return true;
    return r.status && r.status.toLowerCase() === activeFilter.toLowerCase();
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-5 text-muted">
          <i class="bi bi-inbox" style="font-size: 2rem;"></i>
          <p class="mt-2 mb-0">No event registrations found for this filter.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    return `
      <tr>
        <td class="event-cell-name">
          <span class="fw-semibold text-dark">${escapeHtml(r.eventName)}</span>
        </td>
        <td class="date-time-cell">
          <div class="date-text"><i class="bi bi-calendar3 me-1 text-muted"></i>${escapeHtml(r.date || 'TBA')}</div>
          <div class="time-text text-muted small"><i class="bi bi-clock me-1"></i>${escapeHtml(r.time || 'All Day')}</div>
        </td>
        <td>
          <span>${escapeHtml(r.venue || 'Campus Venue')}</span>
        </td>
        <td>
          <span>${escapeHtml(r.registeredOn || 'Recently')}</span>
        </td>
      </tr>
    `;
  }).join('');
}

window.openCancelModal = function(regId, eventName) {
  pendingCancelId = regId;
  const nameEl = document.getElementById('modalEventName');
  if (nameEl) nameEl.textContent = eventName;

  const modalEl = document.getElementById('cancelConfirmModal');
  if (modalEl && window.bootstrap) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
};

function setupCancelModal() {
  const confirmBtn = document.getElementById('confirmCancelBtn');
  if (!confirmBtn) return;

  confirmBtn.addEventListener('click', () => {
    if (!pendingCancelId) return;

    const regRaw = localStorage.getItem('campusfest_registrations');
    if (!regRaw) return;

    let regs = JSON.parse(regRaw);
    const targetIdx = regs.findIndex(r => r.id === pendingCancelId);

    if (targetIdx !== -1) {
      const removed = regs[targetIdx];
      regs.splice(targetIdx, 1);
      localStorage.setItem('campusfest_registrations', JSON.stringify(regs));

      const evtRaw = localStorage.getItem('campusfest_events');
      if (evtRaw && removed.eventId) {
        let events = JSON.parse(evtRaw);
        const evt = events.find(e => e.id === removed.eventId);
        if (evt && typeof evt.seatsLeft === 'number') {
          evt.seatsLeft += 1;
          localStorage.setItem('campusfest_events', JSON.stringify(events));
        }
      }

      const notifRaw = localStorage.getItem('campusfest_notifications');
      let notifs = notifRaw ? JSON.parse(notifRaw) : [];
      notifs.unshift({
        id: 'notif-' + Date.now(),
        title: `Registration Cancelled: ${removed.eventName}`,
        message: `Your registration for ${removed.eventName} has been cancelled successfully.`,
        time: 'Just now',
        type: 'info',
        read: false
      });
      localStorage.setItem('campusfest_notifications', JSON.stringify(notifs));

      const modalEl = document.getElementById('cancelConfirmModal');
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();

      const alertBox = document.getElementById('cancelAlert');
      if (alertBox) {
        alertBox.textContent = `Registration for "${removed.eventName}" has been cancelled.`;
        alertBox.classList.remove('d-none');
        setTimeout(() => alertBox.classList.add('d-none'), 4000);
      }

      loadRegistrations();
      loadNotificationBadge();
    }
  });
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

// Helper Utilities
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
