

document.addEventListener('DOMContentLoaded', () => {
  const student = checkStudentAuth();
  loadStudentMetrics(student);
  loadRecentRegistrations(student);
  loadNotificationBadge();
  setupLogout();
});

function checkStudentAuth() {
  const userRaw = localStorage.getItem('campusfest_current_user');
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
        eventName: 'Tech Symposium 2024',
        date: 'Oct 15, 2024',
        venue: 'Main Auditorium',
        status: 'Confirmed'
      },
      {
        id: 'reg-default-2',
        eventName: 'Spring Music Festival',
        date: 'Oct 22, 2024',
        venue: 'Campus Quad',
        status: 'Confirmed'
      },
      {
        id: 'reg-default-3',
        eventName: 'Design Thinking Workshop',
        date: 'Nov 05, 2024',
        venue: 'Innovation Lab',
        status: 'Confirmed'
      }
    ];
  }

  const recent = studentRegs.slice(0, 3);

  container.innerHTML = recent.map(reg => {
    
    const matchedEvt = allEvents.find(e => e.id === reg.eventId || e.name === reg.eventName);
    const imgUrl = matchedEvt ? matchedEvt.image : 'assets/images/tech-symposium.svg';

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

function setupLogout() {
  const logoutBtns = document.querySelectorAll('#studentLogoutBtn, .studentLogoutBtn');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('campusfest_current_user');
        window.location.href = 'index.html';
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
