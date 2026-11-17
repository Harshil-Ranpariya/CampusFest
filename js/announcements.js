let announcementsList = [];
let editingAnnId = null;
let pendingDeleteAnnId = null;

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  const faculty = checkFacultyAuth();
  if (faculty) {
    loadEventOptions();
    loadAnnouncements();
    setupAnnouncementForm();
    setupDeleteModal();
    setupLogout();
  }
});

// Auth Check
function checkFacultyAuth() {
  const userRaw = localStorage.getItem('campusfest_current_user');
  let faculty = null;
  if (userRaw) {
    try {
      faculty = JSON.parse(userRaw);
    } catch (e) {}
  }

  if (!faculty || faculty.role !== 'faculty') {
    const defaultFaculty = {
      id: 'usr-faculty-1',
      name: 'Dr. Sarah Jenkins',
      email: 's.jenkins@marwadieducation.edu.in',
      role: 'faculty',
      department: 'Computer Science'
    };
    localStorage.setItem('campusfest_current_user', JSON.stringify(defaultFaculty));
    faculty = defaultFaculty;
  }
  return faculty;
}

function loadEventOptions() {
  const select = document.getElementById('annEventSelect');
  if (!select) return;

  const evtRaw = localStorage.getItem('campusfest_events');
  let events = [];
  if (evtRaw) {
    try {
      events = JSON.parse(evtRaw);
    } catch (e) {}
  }

  select.innerHTML = '<option value="" selected>Select an event...</option>';

  if (Array.isArray(events) && events.length > 0) {
    events.forEach(e => {
      if (e && e.name) {
        const opt = document.createElement('option');
        opt.value = e.name;
        opt.textContent = e.name;
        select.appendChild(opt);
      }
    });
  }
}

function loadAnnouncements() {
  const raw = localStorage.getItem('campusfest_announcements');
  let loaded = null;
  if (raw) {
    try {
      loaded = JSON.parse(raw);
    } catch (e) {}
  }

  if (Array.isArray(loaded) && loaded.length > 0) {
    announcementsList = loaded;
  } else {
    announcementsList = [
      {
        id: 'ann-1',
        title: 'Spring Semester Registration Deadlines',
        relatedEvent: '',
        description: 'Please be advised that the final deadline for Spring 2027 course and event registration is approaching. Ensure all students have finalized their registrations.',
        date: 'Feb 10, 2027',
        badge: 'General'
      },
      {
        id: 'ann-2',
        title: 'Venue Change: Tech Symposium Keynote',
        relatedEvent: 'Annual Tech Symposium',
        description: 'Due to overwhelming response, the opening keynote for the Annual Tech Symposium has been moved to the Main Auditorium.',
        date: 'Feb 12, 2027',
        badge: 'Related: Annual Tech Symposium'
      }
    ];
    localStorage.setItem('campusfest_announcements', JSON.stringify(announcementsList));
  }

  renderAnnouncements();
}

function renderAnnouncements() {
  const container = document.getElementById('announcementsList');
  if (!container) return;

  if (announcementsList.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 bg-white border rounded-3 p-4" style="border-color: #c2d0c5 !important;">
        <i class="bi bi-chat-left-dots text-muted" style="font-size: 2rem;"></i>
        <p class="mt-2 mb-0" style="color: #414f49;">No announcements published yet. Create one using the form on the left.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = announcementsList.map(ann => {
    const isRelated = ann.relatedEvent && ann.relatedEvent.trim() !== '' && ann.relatedEvent !== 'General';
    const badgeClass = isRelated ? 'badge-related' : 'badge-general';
    const badgeText = isRelated ? (ann.badge || `Related: ${ann.relatedEvent}`) : 'General';

    return `
      <div class="ann-item-card" id="card-${ann.id}">
        <div class="ann-item-header">
          <h3 class="ann-item-title">${escapeHtml(ann.title)}</h3>
          <div class="ann-actions-group">
            <button type="button" class="ann-action-btn edit-btn" aria-label="Edit announcement" title="Edit announcement" onclick="handleEditAnnouncement('${ann.id}', event)">
              <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="ann-action-btn delete-btn" aria-label="Delete announcement" title="Delete announcement" onclick="openDeleteAnnModal('${ann.id}', event)">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
        <p class="ann-item-desc">${escapeHtml(ann.description)}</p>
        <div class="ann-item-footer">
          <div class="ann-date-info">
            <i class="bi bi-calendar3"></i>
            <span>${escapeHtml(ann.date || 'Feb 10, 2027')}</span>
          </div>
          <span class="${badgeClass}">${escapeHtml(badgeText)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function setupAnnouncementForm() {
  const form = document.getElementById('announcementForm');
  const cancelBtn = document.getElementById('cancelEditAnnBtn');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('annTitleInput');
    const eventSelect = document.getElementById('annEventSelect');
    const descInput = document.getElementById('annDescInput');

    const title = titleInput ? titleInput.value.trim() : '';
    const relatedEvent = eventSelect ? eventSelect.value.trim() : '';
    const desc = descInput ? descInput.value.trim() : '';

    if (!title || !desc) {
      alert('Please fill in both the Title and Description fields.');
      return;
    }

    const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const badgeLabel = relatedEvent ? `Related: ${relatedEvent}` : 'General';

    if (editingAnnId) {
      const idx = announcementsList.findIndex(a => a.id === editingAnnId);
      if (idx !== -1) {
        announcementsList[idx].title = title;
        announcementsList[idx].relatedEvent = relatedEvent;
        announcementsList[idx].description = desc;
        announcementsList[idx].badge = badgeLabel;
      }
      editingAnnId = null;
      document.getElementById('formCardHeading').textContent = 'New Announcement';
      document.getElementById('publishAnnBtn').textContent = 'Publish Announcement';
      if (cancelBtn) cancelBtn.classList.add('d-none');
    } else {
      const newAnn = {
        id: 'ann-' + Date.now(),
        title: title,
        relatedEvent: relatedEvent,
        description: desc,
        date: todayDate,
        badge: badgeLabel
      };
      announcementsList.unshift(newAnn);

      const notifRaw = localStorage.getItem('campusfest_notifications');
      let notifs = notifRaw ? JSON.parse(notifRaw) : [];
      notifs.unshift({
        id: 'notif-' + Date.now(),
        title: title,
        message: desc,
        time: 'Just now',
        type: 'info',
        read: false
      });
      localStorage.setItem('campusfest_notifications', JSON.stringify(notifs));
    }

    localStorage.setItem('campusfest_announcements', JSON.stringify(announcementsList));
    form.reset();
    renderAnnouncements();

    const alertBox = document.getElementById('announcementAlert');
    if (alertBox) {
      alertBox.textContent = 'Announcement published successfully!';
      alertBox.classList.remove('d-none');
      setTimeout(() => alertBox.classList.add('d-none'), 3500);
    }
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      editingAnnId = null;
      form.reset();
      document.getElementById('formCardHeading').textContent = 'New Announcement';
      document.getElementById('publishAnnBtn').textContent = 'Publish Announcement';
      cancelBtn.classList.add('d-none');
    });
  }
}

window.handleEditAnnouncement = function(id, event) {
  if (event) {
    event.stopPropagation();
  }

  const ann = announcementsList.find(a => a.id === id);
  if (!ann) return;

  editingAnnId = id;
  const titleInput = document.getElementById('annTitleInput');
  const eventSelect = document.getElementById('annEventSelect');
  const descInput = document.getElementById('annDescInput');
  const cancelBtn = document.getElementById('cancelEditAnnBtn');

  if (titleInput) titleInput.value = ann.title || '';
  if (eventSelect) eventSelect.value = ann.relatedEvent || '';
  if (descInput) descInput.value = ann.description || '';

  document.getElementById('formCardHeading').textContent = 'Edit Announcement';
  document.getElementById('publishAnnBtn').textContent = 'Update Announcement';
  if (cancelBtn) cancelBtn.classList.remove('d-none');

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.openDeleteAnnModal = function(id, event) {
  if (event) {
    event.stopPropagation();
  }

  pendingDeleteAnnId = id;
  const modalEl = document.getElementById('deleteAnnModal');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  } else if (confirm('Are you sure you want to delete this announcement?')) {
    executeDeleteAnnouncement(id);
  }
};

function executeDeleteAnnouncement(id) {
  announcementsList = announcementsList.filter(a => a.id !== id);
  localStorage.setItem('campusfest_announcements', JSON.stringify(announcementsList));

  if (editingAnnId === id) {
    editingAnnId = null;
    const form = document.getElementById('announcementForm');
    if (form) form.reset();
    document.getElementById('formCardHeading').textContent = 'New Announcement';
    document.getElementById('publishAnnBtn').textContent = 'Publish Announcement';
    const cancelBtn = document.getElementById('cancelEditAnnBtn');
    if (cancelBtn) cancelBtn.classList.add('d-none');
  }

  renderAnnouncements();
}

function setupDeleteModal() {
  const confirmBtn = document.getElementById('confirmDeleteAnnBtn');
  if (!confirmBtn) return;

  confirmBtn.addEventListener('click', () => {
    if (!pendingDeleteAnnId) return;

    executeDeleteAnnouncement(pendingDeleteAnnId);

    const modalEl = document.getElementById('deleteAnnModal');
    if (modalEl && window.bootstrap) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    }
    pendingDeleteAnnId = null;
  });
}

// Logout Handler
function setupLogout() {
  document.querySelectorAll('#facultyLogoutBtn, #facultyLogoutBtnMobile, .faculty-logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('campusfest_current_user');
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
