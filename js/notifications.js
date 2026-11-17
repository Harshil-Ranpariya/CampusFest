let notificationsList = [];

document.addEventListener('DOMContentLoaded', () => {
  setupProfileDropdown();
  setupLogout();
  checkStudentAuth();
  loadNotifications();
  setupLoadMore();
  setupDocumentClick();
});

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

function loadNotifications() {
  const defaultList = [
    {
      id: 'notif-1',
      title: 'Registration Confirmed: Annual Tech Symposium',
      message: 'Your spot for the Annual Tech Symposium has been secured. Please arrive 15 minutes early for check-in.',
      time: 'Just now',
      type: 'success',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Venue Change: Coding Bootcamp',
      message: 'The venue for tomorrow\'s Coding Bootcamp has been moved to Lab 3, Engineering Block.',
      time: '2 hours ago',
      type: 'warning',
      read: false
    },
    {
      id: 'notif-3',
      title: 'Call for Volunteers: Annual Art Fest',
      message: 'We are looking for enthusiastic volunteers for the upcoming Art Fest. Sign up now to earn credit hours.',
      time: 'Yesterday',
      type: 'info',
      read: true
    },
    {
      id: 'notif-4',
      title: 'Reminder: Guest Lecture on AI',
      message: 'Don\'t forget the guest lecture on Artificial Intelligence starts in 30 minutes in the Main Auditorium.',
      time: 'Feb 15, 2027',
      type: 'reminder',
      read: true
    }
  ];

  const notifRaw = localStorage.getItem('campusfest_notifications');
  if (notifRaw) {
    try {
      const parsed = JSON.parse(notifRaw);
      if (Array.isArray(parsed) && parsed.length >= 4) {
        notificationsList = parsed;
      } else {
        notificationsList = defaultList;
        localStorage.setItem('campusfest_notifications', JSON.stringify(notificationsList));
      }
    } catch (e) {
      notificationsList = defaultList;
      localStorage.setItem('campusfest_notifications', JSON.stringify(notificationsList));
    }
  } else {
    notificationsList = defaultList;
    localStorage.setItem('campusfest_notifications', JSON.stringify(notificationsList));
  }

  renderNotifications();
}

function renderNotifications() {
  const container = document.getElementById('notificationsFeedContainer');
  if (!container) return;

  if (notificationsList.length === 0) {
    container.innerHTML = `
      <div style="background: #ffffff; border: 1px solid #bfd0c4; border-radius: 8px; padding: 40px; text-align: center;">
        <i class="bi bi-bell-slash" style="font-size: 2.2rem; color: #596780;"></i>
        <h4 style="margin-top: 14px; color: #102238; font-size: 18px; font-weight: 700;">No Notifications</h4>
        <p style="color: #596780; font-size: 14.5px; margin-top: 4px;">You are all caught up! Updates regarding events and workshops will appear here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notificationsList.map(n => {
    let iconSvg = '';

    if (n.type === 'success') {
      iconSvg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00875a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
          <polyline points="9 15 11 17 15 13"></polyline>
        </svg>
      `;
    } else if (n.type === 'warning') {
      iconSvg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#b23b3b">
          <path d="M12 2.5L1 21.5h22L12 2.5zm0 5c.55 0 1 .45 1 1v5c0 .55-.45 1-1 1s-1-.45-1-1v-5c0-.55.45-1 1-1zm0 9c.69 0 1.25.56 1.25 1.25S12.69 19 12 19s-1.25-.56-1.25-1.25.56-1.25 1.25-1.25z"/>
        </svg>
      `;
    } else if (n.type === 'info') {
      iconSvg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#102238" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 11l14-5v12L3 13v-2z"></path>
          <path d="M7 14v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-4"></path>
          <line x1="20" y1="9" x2="20" y2="15"></line>
        </svg>
      `;
    } else if (n.type === 'reminder') {
      iconSvg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#102238" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      `;
    }

    return `
      <div class="notif-card" id="${n.id}">
        <div class="notif-main-col">
          <div class="notif-header-row">
            <div class="notif-icon-box">
              ${iconSvg}
            </div>
            <h3 class="notif-title">${escapeHtml(n.title)}</h3>
          </div>
          <p class="notif-desc">${escapeHtml(n.message)}</p>
          <div class="notif-time">${escapeHtml(n.time || 'Recently')}</div>
        </div>
        
        <div class="notif-action-col">
          <div class="notif-menu-wrapper">
            <button type="button" class="notif-menu-trigger" aria-label="Notification actions" onclick="toggleNotifMenu(event, '${n.id}')">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <div class="notif-dropdown-menu" id="menu-${n.id}">
              <button type="button" class="notif-menu-item" onclick="toggleRead('${n.id}')">
                ${n.read ? 'Mark as unread' : 'Mark as read'}
              </button>
              <button type="button" class="notif-menu-item text-danger" onclick="deleteNotification('${n.id}')">
                Delete notification
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.toggleNotifMenu = function(e, id) {
  e.stopPropagation();
  const targetMenu = document.getElementById('menu-' + id);
  if (!targetMenu) return;

  const isOpen = targetMenu.classList.contains('show');
  closeAllDropdowns();

  if (!isOpen) {
    targetMenu.classList.add('show');
  }
};

window.toggleRead = function(id) {
  closeAllDropdowns();
  const notif = notificationsList.find(n => n.id === id);
  if (notif) {
    notif.read = !notif.read;
    localStorage.setItem('campusfest_notifications', JSON.stringify(notificationsList));
    renderNotifications();
  }
};

window.deleteNotification = function(id) {
  closeAllDropdowns();
  notificationsList = notificationsList.filter(n => n.id !== id);
  localStorage.setItem('campusfest_notifications', JSON.stringify(notificationsList));
  renderNotifications();
};

function setupLoadMore() {
  const btn = document.getElementById('loadMoreBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    notificationsList.push(
      {
        id: 'notif-' + Date.now(),
        title: 'Campus Shuttle Schedule Update',
        message: 'Additional shuttle services will operate between North Campus and Central Quad for the duration of CampusFest.',
        time: '3 days ago',
        type: 'info',
        read: true
      },
      {
        id: 'notif-' + (Date.now() + 1),
        title: 'Hackathon Mentorship Signups',
        message: 'Senior industry mentors have confirmed their sessions. Reserve 1-on-1 office hours via the event portal.',
        time: '5 days ago',
        type: 'reminder',
        read: true
      }
    );
    localStorage.setItem('campusfest_notifications', JSON.stringify(notificationsList));
    renderNotifications();
    btn.textContent = 'All Notifications Loaded';
    btn.disabled = true;
  });
}

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

function setupLogout() {
  const logoutBtns = document.querySelectorAll('.student-logout-btn, #studentLogoutBtn, .studentLogoutBtn');
  logoutBtns.forEach(logoutBtn => {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.setItem('campusfest_logged_out', 'true');
      localStorage.removeItem('campusfest_current_user');
      sessionStorage.removeItem('campusfest_current_user');
      window.location.href = 'login.html';
    });
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.notif-dropdown-menu.show').forEach(m => m.classList.remove('show'));
}

function setupDocumentClick() {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.notif-action-wrapper')) {
      closeAllDropdowns();
    }
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
