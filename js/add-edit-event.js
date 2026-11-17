let isEditMode = false;
let editingEventId = null;

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  checkFacultyAuth();
  setupImagePresetPicker();
  setupDateConstraints();
  checkEditMode();
  setupFormSubmission();
  setupLogout();
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
    window.location.href = 'login.html';
    return null;
  }
  return faculty;
}

function setupDateConstraints() {
  const dateEl = document.getElementById('eventDateInput');
  const deadEl = document.getElementById('eventDeadlineInput');
  const todayStr = new Date().toISOString().split('T')[0];

  if (dateEl) {
    dateEl.min = todayStr;
    dateEl.addEventListener('change', () => {
      if (deadEl && dateEl.value) {
        deadEl.max = dateEl.value;
      }
    });
  }
  if (deadEl) {
    deadEl.min = todayStr;
  }
}

function setupImagePresetPicker() {
  const dropzone = document.getElementById('bannerDropzone');
  const fileInput = document.getElementById('bannerFileInput');
  const hiddenInput = document.getElementById('selectedBannerImage');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          if (hiddenInput) hiddenInput.value = loadEvt.target.result;
          const label = dropzone.querySelector('.fw-semibold');
          if (label) label.textContent = 'Selected: ' + file.name;
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function checkEditMode() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) return;

  const raw = localStorage.getItem('campusfest_events');
  if (!raw) return;

  const events = JSON.parse(raw);
  const event = events.find(e => e.id === id);

  if (event) {
    isEditMode = true;
    editingEventId = id;

    const heading = document.getElementById('formPageHeading');
    const saveBtn = document.getElementById('saveEventBtn');
    if (heading) heading.textContent = 'Edit Event';
    if (saveBtn) saveBtn.textContent = 'Update Event';

    const nameEl = document.getElementById('eventNameInput');
    const catEl = document.getElementById('eventCategorySelect');
    const descEl = document.getElementById('eventDescInput');
    const timeEl = document.getElementById('eventTimeInput');
    const venueEl = document.getElementById('eventVenueInput');
    const capEl = document.getElementById('eventCapacityInput');
    const bannerEl = document.getElementById('selectedBannerImage');

    if (nameEl) nameEl.value = event.name || '';
    if (catEl && event.category) catEl.value = event.category;
    if (descEl) descEl.value = event.description || '';
    if (timeEl) timeEl.value = event.time || '';
    if (venueEl) venueEl.value = event.venue || '';
    if (capEl) capEl.value = event.maxParticipants || '';
    if (bannerEl && event.image) bannerEl.value = event.image;

    const dateEl = document.getElementById('eventDateInput');
    const deadEl = document.getElementById('eventDeadlineInput');
    if (dateEl && event.date) {
      try {
        const d = new Date(event.date);
        if (!isNaN(d.getTime())) {
          dateEl.value = d.toISOString().split('T')[0];
        }
      } catch (e) {}
    }
    if (deadEl && (event.deadline || event.date)) {
      try {
        const d = new Date(event.deadline || event.date);
        if (!isNaN(d.getTime())) {
          deadEl.value = d.toISOString().split('T')[0];
        }
      } catch (e) {}
    }
  }
}

function setupFormSubmission() {
  const form = document.getElementById('addEditEventForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showAlert('', false);

    const name = document.getElementById('eventNameInput').value.trim();
    const category = document.getElementById('eventCategorySelect').value;
    const description = document.getElementById('eventDescInput').value.trim();
    const rawDate = document.getElementById('eventDateInput').value;
    const time = document.getElementById('eventTimeInput').value.trim();
    const venue = document.getElementById('eventVenueInput').value.trim();
    const rawCapacity = document.getElementById('eventCapacityInput').value.trim();
    const rawDeadline = document.getElementById('eventDeadlineInput').value;
    const bannerImage = document.getElementById('selectedBannerImage').value;

    if (!name || !category || !description || !rawDate || !time || !venue || !rawDeadline) {
      showAlert('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const parsedDate = new Date(rawDate + 'T00:00:00');
    if (isNaN(parsedDate.getTime()) || parsedDate < todayStart) {
      showAlert('Event date cannot be in the past. Please select an upcoming date.');
      return;
    }

    const parsedDeadline = new Date(rawDeadline + 'T00:00:00');
    if (isNaN(parsedDeadline.getTime()) || parsedDeadline < todayStart) {
      showAlert('Registration deadline cannot be in the past.');
      return;
    }

    if (parsedDeadline > parsedDate) {
      showAlert('Registration deadline cannot be after the event date.');
      return;
    }

    const formattedDate = formatDateDisplay(rawDate);
    const formattedDeadline = formatDateDisplay(rawDeadline);
    const capacity = rawCapacity ? parseInt(rawCapacity, 10) : 500;

    const raw = localStorage.getItem('campusfest_events');
    let events = raw ? JSON.parse(raw) : [];

    if (isEditMode) {
      const idx = events.findIndex(e => e.id === editingEventId);
      if (idx !== -1) {
        events[idx] = {
          ...events[idx],
          name,
          category,
          description,
          date: formattedDate,
          time,
          venue,
          maxParticipants: capacity,
          deadline: formattedDeadline,
          image: bannerImage || events[idx].image || 'assets/images/tech-symposium.jpg',
          seatsLeft: Math.min(events[idx].seatsLeft || capacity, capacity)
        };
      }
    } else {
      const newEvent = {
        id: 'evt-' + Date.now(),
        name,
        category,
        description,
        date: formattedDate,
        time,
        venue,
        organizer: 'Faculty Coordinator',
        maxParticipants: capacity,
        seatsLeft: capacity,
        deadline: formattedDeadline,
        image: bannerImage || 'assets/images/tech-symposium.jpg',
        status: 'Open',
        keyHighlights: [
          'Interactive student workshops and sessions.',
          'Keynote addresses by expert speakers.',
          'Networking opportunities across campus departments.',
          'Certificates awarded to all attendees.'
        ]
      };
      events.unshift(newEvent);

      const annRaw = localStorage.getItem('campusfest_announcements');
      let annList = annRaw ? JSON.parse(annRaw) : [];
      annList.unshift({
        id: 'ann-' + Date.now(),
        title: `New Event: ${name}`,
        relatedEvent: name,
        description: `Registration is now open for ${name} scheduled for ${formattedDate} at ${venue}.`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        badge: `Related: ${name}`
      });
      localStorage.setItem('campusfest_announcements', JSON.stringify(annList));
    }

    localStorage.setItem('campusfest_events', JSON.stringify(events));
    window.location.href = 'manage-events.html';
  });
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return 'TBA';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {}
  return dateStr;
}

function showAlert(msg, show = true) {
  const alertBox = document.getElementById('eventFormAlert');
  if (!alertBox) return;

  if (show && msg) {
    alertBox.textContent = msg;
    alertBox.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    alertBox.textContent = '';
    alertBox.classList.add('d-none');
  }
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
