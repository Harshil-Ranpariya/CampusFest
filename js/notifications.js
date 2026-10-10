

let notificationsList = [];

document.addEventListener('DOMContentLoaded', () => {
  checkStudentAuth();
  loadNotifications();
  setupMarkAllRead();
  setupLoadMore();
  setupLogout();
});

function checkStudentAuth() {
  const userRaw = localStorage.getItem('campusfest_current_user');
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

function loadNotifications() {
  const notifRaw = localStorage.getItem('campusfest_notifications');
  if (notifRaw) {
    notificationsList = JSON.parse(notifRaw);
  } else {
    notificationsList = [
      {
        id: 'notif-1',
        title: 'Registration Confirmed: Tech Symposium 2024',
        message: 'Your spot for the Tech Symposium has been secured. Please arrive 15 minutes early for check-in.',
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
        time: 'Oct 24, 2024',
        type: 'reminder',
        read: true
      }
    ];
    localStorage.setItem('campusfest_notifications', JSON.stringify(notificationsList));
  }

  renderNotifications();
  updateBadge();
}

function renderNotifications() {
  const container = document.getElementById('notificationsFeedContainer');
  if (!container) return;

  if (notificationsList.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 bg-white border rounded-3 p-4">
        <i class="bi bi-bell-slash text-muted" style="font-size: 2.5rem;"></i>
        <h4 class="mt-3 text-dark">No Notifications</h4>
        <p class="text-muted mb-0">You're all caught up! Updates regarding events and workshops will appear here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notificationsList.map(n => {
    let iconClass = 'icon-info';
    let iconName = 'bi-info-circle-fill';

    if (n.type === 'success') {
      iconClass = 'icon-success';
      iconName = 'bi-calendar-check-fill';
    } else if (n.type === 'warning') {
      iconClass = 'icon-warning';
      iconName = 'bi-exclamation-triangle-fill';
    } else if (n.type === 'reminder') {
      iconClass = 'icon-reminder';
      iconName = 'bi-clock-fill';
    } else if (n.type === 'info') {
      iconClass = 'icon-info';
      iconName = 'bi-megaphone-fill';
    }

    return `
      <div class="notif-card ${!n.read ? 'unread' : ''}" id="${n.id}">
        <div class="notif-icon-box ${iconClass}">
          <i class="bi ${iconName}"></i>
        </div>
        <div class="notif-content">
          <h3 class="notif-title">${escapeHtml(n.title)}</h3>
          <p class="notif-desc">${escapeHtml(n.message)}</p>
          <div class="notif-time">${escapeHtml(n.time || 'Recently')}</div>
        </div>
        <div>
          <button type="button" class="notif-menu-btn" title="Dismiss" onclick="dismissNotification('${n.id}')">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.dismissNotification = function(id) {
  notificationsList = notificationsList.filter(n => n.id !== id);
  localStorage.setItem('campusfest_notifications', JSON.stringify(notificationsList));
  renderNotifications();
  updateBadge();
};

function setupMarkAllRead() {
  const btn = document.getElementById('markAllReadBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    notificationsList = notificationsList.map(n => ({ ...n, read: true }));
    localStorage.setItem('campusfest_notifications', JSON.stringify(notificationsList));
    renderNotifications();
    updateBadge();
  });
}

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

function updateBadge() {
  const unread = notificationsList.filter(n => !n.read).length;
  const badge = document.getElementById('notifBadge');
  if (badge) {
    if (unread > 0) {
      badge.textContent = unread;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

function setupLogout() {
  const btn = document.getElementById('studentLogoutBtn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('campusfest_current_user');
      window.location.href = 'index.html';
    });
  }
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
