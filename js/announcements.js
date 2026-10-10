

let announcementsList = [];
let editingAnnId = null;
let pendingDeleteAnnId = null;

document.addEventListener('DOMContentLoaded', () => {
  checkFacultyAuth();
  loadEventOptions();
  loadAnnouncements();
  setupAnnouncementForm();
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

function loadEventOptions() {
  const select = document.getElementById('annEventSelect');
  if (!select) return;

  const evtRaw = localStorage.getItem('campusfest_events');
  const events = evtRaw ? JSON.parse(evtRaw) : [];

  events.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.name;
    opt.textContent = e.name;
    select.appendChild(opt);
  });
}

function loadAnnouncements() {
  const raw = localStorage.getItem('campusfest_announcements');
  announcementsList = raw ? JSON.parse(raw) : [];

  if (announcementsList.length === 0) {
    announcementsList = [
      {
        id: 'ann-1',
        title: 'Spring Semester Registration Deadlines',
        relatedEvent: '',
        description: 'Please be advised that the final deadline for Spring 2024 course registration is approaching. Ensure all students have finalized their schedules to avoid late fees.',
        date: 'Oct 24, 2023',
        badge: 'General'
      },
      {
        id: 'ann-2',
        title: 'Venue Change: Tech Symposium Keynote',
        relatedEvent: 'Annual Tech Symposium 2024',
        description: 'Due to overwhelming response, the opening keynote for the Annual Tech Symposium has been moved to the Main Auditorium.',
        date: 'Oct 22, 2023',
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
      <div class="text-center py-5 bg-white border rounded-3 p-4">
        <i class="bi bi-chat-left-dots text-muted" style="font-size: 2rem;"></i>
        <p class="mt-2 text-muted mb-0">No announcements published yet. Create one using the form on the left.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = announcementsList.map(ann => {
    const isRelated = ann.relatedEvent && ann.relatedEvent !== 'General';
    const badgeClass = isRelated ? 'badge-ann-related' : 'badge-ann-general';
    const badgeText = ann.badge || (isRelated ? `Related: ${ann.relatedEvent}` : 'General');

    return `
      <div class="ann-item-card">
        <div class="d-flex justify-content-between align-items-start">
          <h3 class="ann-item-title">${escapeHtml(ann.title)}</h3>
          <div class="d-inline-flex gap-1">
            <button type="button" class="ann-btn-icon" title="Edit" onclick="handleEditAnnouncement('${ann.id}')">
              <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="ann-btn-icon delete-icon" title="Delete" onclick="openDeleteAnnModal('${ann.id}')">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
        <p class="ann-item-desc">${escapeHtml(ann.description)}</p>
        <div class="d-flex align-items-center gap-3">
          <span class="ann-date"><i class="bi bi-calendar3 me-1"></i>${escapeHtml(ann.date || 'Recently')}</span>
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

    const title = document.getElementById('annTitleInput').value.trim();
    const relatedEvent = document.getElementById('annEventSelect').value;
    const desc = document.getElementById('annDescInput').value.trim();

    if (!title || !desc) {
      alert('Please fill in both the title and description.');
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
      cancelBtn.classList.add('d-none');
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
      alertBox.textContent = 'Announcement processed successfully!';
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

window.handleEditAnnouncement = function(id) {
  const ann = announcementsList.find(a => a.id === id);
  if (!ann) return;

  editingAnnId = id;
  document.getElementById('annTitleInput').value = ann.title || '';
  document.getElementById('annEventSelect').value = ann.relatedEvent || '';
  document.getElementById('annDescInput').value = ann.description || '';

  document.getElementById('formCardHeading').textContent = 'Edit Announcement';
  document.getElementById('publishAnnBtn').textContent = 'Update Announcement';
  document.getElementById('cancelEditAnnBtn').classList.remove('d-none');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.openDeleteAnnModal = function(id) {
  pendingDeleteAnnId = id;
  const modalEl = document.getElementById('deleteAnnModal');
  if (modalEl && window.bootstrap) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
};

function setupDeleteModal() {
  const confirmBtn = document.getElementById('confirmDeleteAnnBtn');
  if (!confirmBtn) return;

  confirmBtn.addEventListener('click', () => {
    if (!pendingDeleteAnnId) return;

    announcementsList = announcementsList.filter(a => a.id !== pendingDeleteAnnId);
    localStorage.setItem('campusfest_announcements', JSON.stringify(announcementsList));

    const modalEl = document.getElementById('deleteAnnModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();

    renderAnnouncements();
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
