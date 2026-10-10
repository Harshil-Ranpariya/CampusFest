

let eventsList = [];
let pendingDeleteId = null;
let searchQuery = '';
let categoryFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  checkFacultyAuth();
  loadManageEvents();
  setupSearchAndFilter();
  setupDeleteModal();
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

function loadManageEvents() {
  const raw = localStorage.getItem('campusfest_events');
  eventsList = raw ? JSON.parse(raw) : [];

if (eventsList.length === 0) {
    eventsList = [
      {
        id: 'evt-1',
        name: 'Annual Tech Symposium',
        subtext: 'Keynote speakers and workshops',
        category: 'Academic',
        date: 'Oct 24, 2024',
        time: '09:00 AM',
        venue: 'Main Auditorium',
        registrationsCount: 345,
        maxParticipants: 500
      },
      {
        id: 'evt-2',
        name: 'Fall Cultural Fest',
        subtext: 'Music, dance, and arts',
        category: 'Cultural',
        date: 'Nov 15, 2024',
        time: '05:00 PM',
        venue: 'Campus Grounds',
        registrationsCount: 890,
        maxParticipants: 1000
      },
      {
        id: 'evt-6',
        name: 'Inter-Collegiate Tournament',
        subtext: 'Basketball and Volleyball finals',
        category: 'Sports',
        date: 'Dec 02, 2024',
        time: '10:00 AM',
        venue: 'Indoor Stadium',
        registrationsCount: 120,
        maxParticipants: 200
      }
    ];
    localStorage.setItem('campusfest_events', JSON.stringify(eventsList));
  }

  updateMetrics();
  renderEventsTable();
}

function updateMetrics() {
  const statTotal = document.getElementById('statTotalEvents');
  const statRegs = document.getElementById('statActiveRegs');

  if (statTotal) statTotal.textContent = eventsList.length;
  if (statRegs) {
    const totalRegs = eventsList.reduce((acc, evt) => {
      const regCount = evt.registrationsCount || (evt.maxParticipants ? evt.maxParticipants - (evt.seatsLeft || 0) : 150);
      return acc + (typeof regCount === 'number' ? regCount : 50);
    }, 0);
    statRegs.textContent = totalRegs.toLocaleString();
  }
}

function setupSearchAndFilter() {
  const searchInput = document.getElementById('manageSearchInput');
  const catSelect = document.getElementById('categoryFilterSelect');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderEventsTable();
    });
  }

  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      categoryFilter = e.target.value;
      renderEventsTable();
    });
  }
}

function renderEventsTable() {
  const tbody = document.getElementById('manageEventsTbody');
  if (!tbody) return;

  const filtered = eventsList.filter(evt => {
    const matchesCat = categoryFilter === 'all' || 
      (evt.category && evt.category.toLowerCase() === categoryFilter.toLowerCase());
    const matchesSearch = !searchQuery ||
      (evt.name && evt.name.toLowerCase().includes(searchQuery)) ||
      (evt.venue && evt.venue.toLowerCase().includes(searchQuery)) ||
      (evt.category && evt.category.toLowerCase().includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-5 text-muted">
          <i class="bi bi-calendar-x" style="font-size: 2rem;"></i>
          <p class="mt-2 mb-0">No matching campus events found.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(evt => {
    const regCount = evt.registrationsCount !== undefined 
      ? evt.registrationsCount 
      : (typeof evt.seatsLeft === 'number' ? ((evt.maxParticipants || 200) - evt.seatsLeft) : 150);
    const maxCapacity = evt.maxParticipants || 500;

    return `
      <tr>
        <td class="event-name-cell">
          <div class="event-title-main">${escapeHtml(evt.name)}</div>
          <div class="event-sub-info">${escapeHtml(evt.subtext || evt.description ? evt.description.slice(0, 45) + '...' : 'Keynote and activities')}</div>
        </td>
        <td>
          <span class="category-badge-table">${escapeHtml(evt.category || 'General')}</span>
        </td>
        <td>
          <div class="fw-semibold text-dark">${escapeHtml(evt.date || 'TBA')}</div>
          <div class="small text-muted">${escapeHtml(evt.time || 'All Day')}</div>
        </td>
        <td>
          <i class="bi bi-geo-alt me-1 text-muted"></i>${escapeHtml(evt.venue || 'Campus Venue')}
        </td>
        <td>
          <span class="fw-semibold text-dark">${regCount}</span> <span class="text-muted">/ ${maxCapacity}</span>
        </td>
        <td class="text-end">
          <div class="d-inline-flex gap-1">
            <a href="add-edit-event.html?id=${encodeURIComponent(evt.id)}" class="action-btn-icon" title="Edit Event">
              <i class="bi bi-pencil"></i>
            </a>
            <button type="button" class="action-btn-icon delete-btn" title="Delete Event" onclick="openDeleteEventModal('${evt.id}', '${escapeHtml(evt.name)}')">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.openDeleteEventModal = function(id, name) {
  pendingDeleteId = id;
  const nameEl = document.getElementById('deleteTargetName');
  if (nameEl) nameEl.textContent = name;

  const modalEl = document.getElementById('deleteEventModal');
  if (modalEl && window.bootstrap) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
};

function setupDeleteModal() {
  const confirmBtn = document.getElementById('confirmDeleteEventBtn');
  if (!confirmBtn) return;

  confirmBtn.addEventListener('click', () => {
    if (!pendingDeleteId) return;

    eventsList = eventsList.filter(e => e.id !== pendingDeleteId);
    localStorage.setItem('campusfest_events', JSON.stringify(eventsList));

const regRaw = localStorage.getItem('campusfest_registrations');
    if (regRaw) {
      let regs = JSON.parse(regRaw);
      regs = regs.filter(r => r.eventId !== pendingDeleteId);
      localStorage.setItem('campusfest_registrations', JSON.stringify(regs));
    }

    const modalEl = document.getElementById('deleteEventModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();

    const alertBox = document.getElementById('manageAlert');
    if (alertBox) {
      alertBox.textContent = 'Event and associated records deleted successfully.';
      alertBox.classList.remove('d-none');
      setTimeout(() => alertBox.classList.add('d-none'), 3500);
    }

    updateMetrics();
    renderEventsTable();
  });
}

function setupLogout() {
  document.querySelectorAll('#facultyLogoutBtn, #facultyLogoutBtnMobile, .faculty-logout-btn').forEach(btn => {
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
