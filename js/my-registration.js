

let currentStudent = null;
let allStudentRegistrations = [];
let activeFilter = 'all';
let pendingCancelId = null;

document.addEventListener('DOMContentLoaded', () => {
  currentStudent = checkStudentAuth();
  loadRegistrations();
  setupFilterDropdown();
  setupCancelModal();
  loadNotificationBadge();
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
        eventName: 'Tech Symposium 2024',
        studentName: currentStudent.name,
        studentEmail: currentStudent.email,
        enrollmentNo: currentStudent.enrollmentNo,
        department: 'Computer Science',
        date: 'Oct 15, 2024',
        time: '09:00 AM - 05:00 PM',
        venue: 'Main Auditorium',
        registeredOn: 'Sep 01, 2024',
        status: 'Confirmed'
      },
      {
        id: 'reg-demo-2',
        eventId: 'evt-4',
        eventName: 'Spring Career Fair',
        studentName: currentStudent.name,
        studentEmail: currentStudent.email,
        enrollmentNo: currentStudent.enrollmentNo,
        department: 'Computer Science',
        date: 'Mar 22, 2024',
        time: '10:00 AM - 03:00 PM',
        venue: 'Student Union Building',
        registeredOn: 'Feb 15, 2024',
        status: 'Completed'
      },
      {
        id: 'reg-demo-3',
        eventId: 'evt-1',
        eventName: 'Annual Hackathon',
        studentName: currentStudent.name,
        studentEmail: currentStudent.email,
        enrollmentNo: currentStudent.enrollmentNo,
        department: 'Computer Science',
        date: 'Nov 05, 2024',
        time: '24-Hour Event',
        venue: 'Computer Science Lab',
        registeredOn: 'Sep 10, 2024',
        status: 'Confirmed'
      }
    ];

    regs.push(...defaultData);
    localStorage.setItem('campusfest_registrations', JSON.stringify(regs));
    allStudentRegistrations = defaultData;
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
    const isCompleted = r.status === 'Completed';

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
