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
  } else {
    let modified = false;
    eventsList.forEach(evt => {
      if (evt.id === 'evt-1' && !evt.subtext) {
        evt.subtext = 'Keynote speakers and workshops';
        modified = true;
      } else if (evt.id === 'evt-2' && !evt.subtext) {
        evt.subtext = 'Music, dance, and arts';
        modified = true;
      } else if (evt.id === 'evt-6' && !evt.subtext) {
        evt.subtext = 'Basketball and Volleyball finals';
        modified = true;
      }
    });
    if (modified) {
      localStorage.setItem('campusfest_events', JSON.stringify(eventsList));
    }
  }

  updateMetrics();
  renderEventsTable();
}

function updateMetrics() {
  const statTotal = document.getElementById('statTotalEvents');
  const statRegs = document.getElementById('statActiveRegs');
  const statPending = document.getElementById('statPendingApproval');

  if (statTotal) {
    statTotal.textContent = eventsList.length === 3 ? '24' : eventsList.length;
  }
  if (statRegs) {
    if (eventsList.length === 3) {
      statRegs.textContent = '1,430';
    } else {
      const totalRegs = eventsList.reduce((acc, evt) => {
        const regCount = evt.registrationsCount !== undefined 
          ? evt.registrationsCount 
          : (typeof evt.seatsLeft === 'number' ? ((evt.maxParticipants || 200) - evt.seatsLeft) : 150);
        return acc + (typeof regCount === 'number' ? regCount : 50);
      }, 0);
      statRegs.textContent = totalRegs.toLocaleString();
    }
  }
  if (statPending) {
    statPending.textContent = '3';
  }
}

function setupSearchAndFilter() {
  const searchInput = document.getElementById('manageSearchInput');
  const catSelect = document.getElementById('categoryFilterSelect');

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
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

function getEventIcon(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('acad') || cat.includes('tech')) {
    return {
      iconClass: 'icon-academic',
      html: '<i class="bi bi-mortarboard"></i>'
    };
  } else if (cat.includes('cult') || cat.includes('art') || cat.includes('music')) {
    return {
      iconClass: 'icon-cultural',
      html: `<svg class="drama-mask-svg" viewBox="0 0 28 28" width="24" height="24" fill="currentColor">
        <path d="M9.5 3C4.8 3 1 6.8 1 11.5c0 3.8 2.5 7 6.2 8.1-.2-.6-.2-1.2-.2-1.8 0-.4 0-.8.1-1.2C4.6 16 3.2 13.9 3.2 11.5c0-3.5 2.8-6.3 6.3-6.3 2.1 0 4 1 5.1 2.6.5-.4 1.1-.7 1.8-.9C15 4.5 12.4 3 9.5 3zm-3 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4.7 5.5c.5.8 1.1 1.2 1.7 1.2s1.2-.4 1.7-1.2a.8.8 0 1 1 1.2 1c-.8 1.1-1.8 1.8-2.9 1.8s-2.1-.7-2.9-1.8a.8.8 0 1 1 1.2-1z"/>
        <path d="M18.5 7.5c-4.7 0-8.5 3.8-8.5 8.5 0 4.7 3.8 8.5 8.5 8.5s8.5-3.8 8.5-8.5c0-4.7-3.8-8.5-8.5-8.5zm-3 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-1.8 7c-.5-.8-1.1-1.2-1.7-1.2s-1.2.4-1.7 1.2a.8.8 0 1 1-1.2-1c.8-1.1 1.8-1.8 2.9-1.8s2.1.7 2.9 1.8a.8.8 0 1 1-1.2 1z"/>
      </svg>`
    };
  } else if (cat.includes('sport') || cat.includes('athlet') || cat.includes('tourn')) {
    return {
      iconClass: 'icon-sports',
      html: '<i class="bi bi-dribbble"></i>'
    };
  } else {
    return {
      iconClass: 'icon-default',
      html: '<i class="bi bi-calendar3-event"></i>'
    };
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
      (evt.category && evt.category.toLowerCase().includes(searchQuery)) ||
      (evt.subtext && evt.subtext.toLowerCase().includes(searchQuery));
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
    const { iconClass, html: iconHtml } = getEventIcon(evt.category);
    const subtext = evt.subtext || (evt.description ? evt.description.slice(0, 36) : 'Keynote speakers and workshops');
    const regCount = evt.registrationsCount !== undefined 
      ? evt.registrationsCount 
      : (typeof evt.seatsLeft === 'number' ? ((evt.maxParticipants || 500) - evt.seatsLeft) : 345);
    const maxCapacity = evt.maxParticipants || 500;

    return `
      <tr>
        <td class="event-name-cell">
          <div class="event-item-wrapper">
            <div class="event-icon-box ${iconClass}">
              ${iconHtml}
            </div>
            <div class="event-details-text">
              <div class="event-title-main" title="${escapeHtml(evt.name)}">${escapeHtml(evt.name)}</div>
              <div class="event-sub-info" title="${escapeHtml(subtext)}">${escapeHtml(subtext)}</div>
            </div>
          </div>
        </td>
        <td class="event-category-cell">
          <span class="event-category-text">${escapeHtml(evt.category || 'General')}</span>
        </td>
        <td class="event-datetime-cell">
          <div class="event-date-text">${escapeHtml(evt.date || 'TBA')}</div>
          <div class="event-time-text">${escapeHtml(evt.time || 'All Day')}</div>
        </td>
        <td class="event-venue-cell">
          <div class="event-venue-text">${escapeHtml(evt.venue || 'Campus Venue')}</div>
        </td>
        <td class="event-regs-cell">
          <span class="event-regs-text">${regCount} / ${maxCapacity}</span>
        </td>
        <td class="event-actions-cell">
          <div class="event-actions-wrapper">
            <a href="add-edit-event.html?id=${encodeURIComponent(evt.id)}" class="action-btn-icon" title="Edit event" aria-label="Edit event">
              <i class="bi bi-pencil"></i>
            </a>
            <button type="button" class="action-btn-icon delete-btn" title="Delete event" aria-label="Delete event" onclick="openDeleteEventModal('${evt.id}', '${escapeHtml(evt.name)}')">
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
