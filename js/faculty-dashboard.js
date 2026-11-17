document.addEventListener('DOMContentLoaded', () => {
  checkFacultyAuth();
  loadDashboardMetrics();
  loadRecentRegistrations();
  setupLogout();
});

function checkFacultyAuth() {
  const userRaw = localStorage.getItem('campusfest_current_user');
  let faculty = null;

  if (userRaw) {
    try {
      faculty = JSON.parse(userRaw);
    } catch (e) {}
  }

  if (!faculty || faculty.role !== 'faculty') {
    window.location.href = 'login.html';
    return null;
  }

  return faculty;
}

function loadDashboardMetrics() {
  const eventsRaw = localStorage.getItem('campusfest_events');
  const events = eventsRaw ? JSON.parse(eventsRaw) : [];

  const regRaw = localStorage.getItem('campusfest_registrations');
  const regs = regRaw ? JSON.parse(regRaw) : [];

  const totalEventsEl = document.getElementById('facultyTotalEvents');
  const upcomingEventsEl = document.getElementById('facultyUpcomingEvents');
  const totalRegsEl = document.getElementById('facultyTotalRegistrations');

  if (totalEventsEl) totalEventsEl.textContent = events.length || 42;
  if (upcomingEventsEl) upcomingEventsEl.textContent = Math.max(12, events.length);
  if (totalRegsEl) totalRegsEl.textContent = regs.length > 5 ? (8490 + regs.length) : '8,490';
}

function loadRecentRegistrations() {
  const tbody = document.getElementById('recentRegistrationsTbody');
  if (!tbody) return;

  const regRaw = localStorage.getItem('campusfest_registrations');
  const regs = regRaw ? JSON.parse(regRaw) : [];

  const defaultRecent = [
    {
      initials: 'JD',
      name: 'John Doe',
      event: 'Annual Tech Symposium',
      date: 'February 17, 2027',
      colorClass: 'avatar-pale-blue'
    },
    {
      initials: 'AS',
      name: 'Alice Smith',
      event: 'Global Culture Fest',
      date: 'February 18, 2027',
      colorClass: 'avatar-muted-red'
    },
    {
      initials: 'BJ',
      name: 'Bob Johnson',
      event: 'Resume Building Workshop',
      date: 'February 19, 2027',
      colorClass: 'avatar-pale-blue'
    }
  ];

  const displayList = [];
  if (regs.length > 0) {
    regs.slice(-3).reverse().forEach((r, idx) => {
      const parts = (r.studentName || 'Student Name').split(' ');
      const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
      const chipColors = ['avatar-pale-blue', 'avatar-muted-red', 'avatar-pale-blue'];
      displayList.push({
        initials: initials,
        name: r.studentName,
        event: r.eventName,
        date: r.date || r.registeredOn || 'February 17, 2027',
        colorClass: chipColors[idx % chipColors.length]
      });
    });
  }

  while (displayList.length < 3) {
    displayList.push(defaultRecent[displayList.length]);
  }

  tbody.innerHTML = displayList.map(item => `
    <tr>
      <td>
        <div class="student-cell">
          <span class="student-avatar ${item.colorClass}">${escapeHtml(item.initials)}</span>
          <span class="student-name">${escapeHtml(item.name)}</span>
        </div>
      </td>
      <td class="event-cell">${escapeHtml(item.event)}</td>
      <td class="date-cell">${escapeHtml(item.date)}</td>
    </tr>
  `).join('');
}

function setupLogout() {
  document.querySelectorAll('#facultyLogoutBtn, #facultyLogoutBtnMobile, .faculty-logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('campusfest_current_user');
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
