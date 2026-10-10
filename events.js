

let allEvents = [];
let currentStudent = null;
let selectedCategory = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  currentStudent = checkStudentAuth();
  loadEventsData();
  setupFiltersAndSearch();
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

function loadEventsData() {
  const raw = localStorage.getItem('campusfest_events');
  if (raw) {
    allEvents = JSON.parse(raw);
  } else {
    allEvents = [];
  }
  renderEvents();
}

function setupFiltersAndSearch() {
  
  const catDropdown = document.getElementById('categoryDropdownMenu');
  if (catDropdown) {
    catDropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (!item) return;

      catDropdown.querySelectorAll('.dropdown-item').forEach(btn => btn.classList.remove('active'));
      item.classList.add('active');

      selectedCategory = item.getAttribute('data-category') || 'all';
      renderEvents();
    });
  }

const searchInput = document.getElementById('eventSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderEvents();
    });
  }
}

function renderEvents() {
  const container = document.getElementById('eventsGridContainer');
  if (!container) return;

const regRaw = localStorage.getItem('campusfest_registrations');
  const studentRegs = regRaw ? JSON.parse(regRaw) : [];
  const registeredEventIds = new Set(
    studentRegs
      .filter(r => (r.studentEmail && r.studentEmail.toLowerCase() === currentStudent.email.toLowerCase()))
      .map(r => r.eventId)
  );

const filtered = allEvents.filter(evt => {
    const matchesCategory = selectedCategory === 'all' || 
      (evt.category && evt.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery || 
      (evt.name && evt.name.toLowerCase().includes(searchQuery)) ||
      (evt.description && evt.description.toLowerCase().includes(searchQuery)) ||
      (evt.venue && evt.venue.toLowerCase().includes(searchQuery));

    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="p-4 bg-white rounded-3 border">
          <i class="bi bi-calendar-x text-muted" style="font-size: 2.5rem;"></i>
          <h4 class="mt-3 text-dark">No Events Found</h4>
          <p class="text-muted mb-0">Try changing your search term or selecting a different category.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(evt => {
    let catBadgeClass = 'badge-academic';
    const c = (evt.category || '').toLowerCase();
    if (c.includes('soc')) catBadgeClass = 'badge-social';
    else if (c.includes('work')) catBadgeClass = 'badge-workshop';
    else if (c.includes('cult')) catBadgeClass = 'badge-cultural';
    else if (c.includes('sport')) catBadgeClass = 'badge-sports';

    const isRegistered = registeredEventIds.has(evt.id);
    const isAlmostFull = evt.status === 'Almost Full' || (typeof evt.seatsLeft === 'number' && evt.seatsLeft <= 5);

    let seatsText = '';
    if (evt.seatsLeft === 'Unlimited') {
      seatsText = 'Open Event (Unlimited)';
    } else if (typeof evt.seatsLeft === 'number') {
      seatsText = `${evt.seatsLeft} / ${evt.maxParticipants || 200} Seats Available`;
    } else {
      seatsText = 'Registration Open';
    }

    return `
      <div class="col-md-6 col-lg-4">
        <div class="event-card">
          <div class="event-media-box">
            <img src="${evt.image || 'assets/images/tech-symposium.svg'}" alt="${escapeHtml(evt.name)}">
            <span class="card-category-badge ${catBadgeClass}">${escapeHtml(evt.category || 'Event')}</span>
            ${isAlmostFull ? '<span class="card-status-pill">Almost Full</span>' : ''}
          </div>
          <div class="event-card-body">
            <h3 class="event-title">${escapeHtml(evt.name)}</h3>
            <div class="event-details-meta">
              <div>
                <i class="bi bi-calendar3"></i>
                <span>${escapeHtml(evt.date || 'TBA')} &bull; ${escapeHtml(evt.time || 'All Day')}</span>
              </div>
              <div>
                <i class="bi bi-geo-alt"></i>
                <span>${escapeHtml(evt.venue || 'Campus')}</span>
              </div>
            </div>
            <div class="seats-info">
              <i class="bi bi-people"></i>
              <span>${escapeHtml(seatsText)}</span>
            </div>
            <div class="event-actions-row">
              <a href="event-detail.html?id=${encodeURIComponent(evt.id)}" class="btn-details">Details</a>
              ${
                isRegistered 
                  ? '<span class="btn-registered-badge"><i class="bi bi-check2"></i> Registered</span>'
                  : `<button type="button" class="btn-register-card" onclick="handleCardRegister('${evt.id}')">Register</button>`
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.handleCardRegister = function(eventId) {
  const targetEvt = allEvents.find(e => e.id === eventId);
  if (!targetEvt) return;

  const regRaw = localStorage.getItem('campusfest_registrations');
  let regs = regRaw ? JSON.parse(regRaw) : [];

const already = regs.some(r => 
    r.eventId === eventId && 
    r.studentEmail.toLowerCase() === currentStudent.email.toLowerCase()
  );

  if (already) {
    showFeedback(`You are already registered for ${targetEvt.name}.`, 'warning');
    return;
  }

const newReg = {
    id: 'reg-' + Date.now(),
    eventId: targetEvt.id,
    eventName: targetEvt.name,
    studentName: currentStudent.name,
    studentEmail: currentStudent.email,
    enrollmentNo: currentStudent.enrollmentNo || 'CS2021045',
    department: currentStudent.department || 'Computer Science',
    date: targetEvt.date,
    time: targetEvt.time,
    venue: targetEvt.venue,
    registeredOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Confirmed'
  };

  regs.push(newReg);
  localStorage.setItem('campusfest_registrations', JSON.stringify(regs));

if (typeof targetEvt.seatsLeft === 'number' && targetEvt.seatsLeft > 0) {
    targetEvt.seatsLeft -= 1;
    localStorage.setItem('campusfest_events', JSON.stringify(allEvents));
  }

const notifRaw = localStorage.getItem('campusfest_notifications');
  let notifs = notifRaw ? JSON.parse(notifRaw) : [];
  notifs.unshift({
    id: 'notif-' + Date.now(),
    title: `Registration Confirmed: ${targetEvt.name}`,
    message: `Your spot for ${targetEvt.name} has been secured! Venue: ${targetEvt.venue}.`,
    time: 'Just now',
    type: 'success',
    read: false
  });
  localStorage.setItem('campusfest_notifications', JSON.stringify(notifs));

  showFeedback(`Successfully registered for ${targetEvt.name}! Check your dashboard & tickets.`, 'success');
  loadNotificationBadge();
  renderEvents();
};

function showFeedback(msg, type = 'success') {
  const alertBox = document.getElementById('registrationFeedback');
  if (!alertBox) return;

  alertBox.className = `alert alert-${type} mb-4`;
  alertBox.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${escapeHtml(msg)}`;
  alertBox.classList.remove('d-none');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(() => {
    alertBox.classList.add('d-none');
  }, 4500);
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
