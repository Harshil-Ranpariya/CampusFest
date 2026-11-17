let allEvents = [];
let currentStudent = null;
let selectedCategory = 'all';
let searchQuery = '';

const referenceEvents = [
  {
    id: 'evt-1',
    name: 'Annual Tech Symposium',
    category: 'Academic',
    date: 'February 17, 2027',
    time: '10:00 AM - 4:00 PM',
    venue: 'Main Auditorium, Building A',
    description: 'Join industry leaders and alumni for a day of networking and insights into the future of technology.',
    keyHighlights: [
      'Keynote address by leading AI researchers.',
      'Hands-on coding workshops in modern web frameworks.',
      'Career fair featuring top tech recruiters.',
      'Project showcase competition with prizes.'
    ],
    organizer: 'Computer Science Department',
    maxParticipants: 200,
    seatsLeft: 45,
    deadline: 'February 15, 2027',
    image: 'assets/images/tech-symposium-lab.jpg',
    status: 'Open'
  },
  {
    id: 'evt-2',
    name: 'Spring Club Rush & Organization Fair',
    category: 'Social',
    date: 'February 18, 2027',
    time: '12:00 PM - 3:00 PM',
    venue: 'Campus Quad',
    description: 'Discover over 50 campus clubs, student chapters, and sports organizations. Sign up and build your campus network.',
    keyHighlights: [
      'Interactive student association booths.',
      'Free campus fest merchandise and refreshments.',
      'Meet club presidents and leadership teams.',
      'Sign-up raffle giveaways.'
    ],
    organizer: 'Campus Life Committee',
    maxParticipants: 9999,
    seatsLeft: 'Unlimited',
    deadline: 'February 16, 2027',
    image: 'assets/images/club-rush-fair.jpg',
    status: 'Open'
  },
  {
    id: 'evt-3',
    name: 'Intro to Python for Data Science',
    category: 'Workshop',
    date: 'February 19, 2027',
    time: '2:00 PM - 5:00 PM',
    venue: 'Lab 3B, Science Center',
    description: 'Hands-on programming session exploring data analysis with Python, NumPy, Pandas, and exploratory charts.',
    keyHighlights: [
      'Interactive Jupyter notebook exercises.',
      'Real-world campus datasets for practice.',
      'Guidance on machine learning basics.',
      'Course completion digital certificate.'
    ],
    organizer: 'Data Science Society',
    maxParticipants: 30,
    seatsLeft: 3,
    deadline: 'February 17, 2027',
    image: 'assets/images/python-workshop.jpg',
    status: 'Almost Full'
  },
  {
    id: 'evt-4',
    name: 'Global Culture Fest',
    category: 'Culture',
    date: 'February 17, 2027',
    time: '12:00 PM - 8:00 PM',
    venue: 'Campus Quad',
    description: 'Celebrate diversity with food, music, and performances from student organizations around the world.',
    keyHighlights: [
      'International food street with 25+ cultural stalls.',
      'Traditional dance and acoustic musical acts.',
      'Live student band showcase in the evening.',
      'Cultural attire fashion walk.'
    ],
    organizer: 'Student Union',
    maxParticipants: 1000,
    seatsLeft: 520,
    deadline: 'February 15, 2027',
    image: 'assets/images/culture-fest.jpg',
    status: 'Open'
  },
  {
    id: 'evt-5',
    name: 'Resume Building Workshop',
    category: 'Workshop',
    date: 'February 18, 2027',
    time: '02:00 PM - 05:00 PM',
    venue: 'Career Center, Room 204',
    description: 'Get expert advice on crafting a standout resume that will catch the eye of top employers.',
    keyHighlights: [
      '1-on-1 resume review with certified HR recruiters.',
      'ATS optimization tips and portfolio advice.',
      'Mock technical & behavioral interview walkthroughs.',
      'Custom template pack provided to all participants.'
    ],
    organizer: 'Career Placement Cell',
    maxParticipants: 30,
    seatsLeft: 3,
    deadline: 'February 16, 2027',
    image: 'assets/images/resume-workshop.jpg',
    status: 'Almost Full'
  },
  {
    id: 'evt-6',
    name: 'Inter-Collegiate Tournament',
    category: 'Sports',
    date: 'February 19, 2027',
    time: '10:00 AM - 06:00 PM',
    venue: 'Indoor Stadium',
    description: 'Basketball and Volleyball tournament featuring competing teams from top regional engineering and degree institutes.',
    keyHighlights: [
      'Trophies and medals for podium finishers.',
      'Professional referees and live scorekeeping.',
      'Halftime performances and cheering contest.',
      'Energy drinks and nutrition kits for players.'
    ],
    organizer: 'Sports Council',
    maxParticipants: 200,
    seatsLeft: 80,
    deadline: 'February 17, 2027',
    image: 'assets/images/sports-tournament.svg',
    status: 'Open'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  currentStudent = checkStudentAuth();
  loadEventsData();
  setupFiltersAndSearch();
  loadNotificationBadge();
  setupProfileDropdown();
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
    try {
      allEvents = JSON.parse(raw);
    } catch (e) {
      allEvents = referenceEvents;
    }
  } else {
    allEvents = referenceEvents;
    localStorage.setItem('campusfest_events', JSON.stringify(referenceEvents));
  }

  let updated = false;
  const dateMap = {
    'evt-1': { date: 'February 17, 2027', deadline: 'February 15, 2027' },
    'evt-2': { date: 'February 18, 2027', deadline: 'February 16, 2027' },
    'evt-3': { date: 'February 19, 2027', deadline: 'February 17, 2027' },
    'evt-4': { date: 'February 17, 2027', deadline: 'February 15, 2027' },
    'evt-5': { date: 'February 18, 2027', deadline: 'February 16, 2027' },
    'evt-6': { date: 'February 19, 2027', deadline: 'February 17, 2027' }
  };

  if (!allEvents || allEvents.length < 6 || allEvents.some(e => e.date && !e.date.includes('2027'))) {
    allEvents.forEach(evt => {
      if (dateMap[evt.id]) {
        evt.date = dateMap[evt.id].date;
        evt.deadline = dateMap[evt.id].deadline;
        updated = true;
      }
    });
    if (!allEvents || allEvents.length < 6) {
      allEvents = referenceEvents;
      updated = true;
    }
  }

  allEvents.forEach(evt => {
    if (dateMap[evt.id] && (evt.date !== dateMap[evt.id].date || evt.deadline !== dateMap[evt.id].deadline)) {
      evt.date = dateMap[evt.id].date;
      evt.deadline = dateMap[evt.id].deadline;
      updated = true;
    }
    if (evt.id === 'evt-1' && evt.name === 'Annual Tech Symposium 2024') {
      evt.name = 'Annual Tech Symposium';
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem('campusfest_events', JSON.stringify(allEvents));
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
  const headerSearchInput = document.getElementById('headerSearchInput');

  // Check URL parameters for search query
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('search');
    if (queryParam) {
      searchQuery = queryParam.trim().toLowerCase();
      if (searchInput) searchInput.value = queryParam;
      if (headerSearchInput) headerSearchInput.value = queryParam;
    }
  } catch (err) {}

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (headerSearchInput && headerSearchInput.value !== e.target.value) {
        headerSearchInput.value = e.target.value;
      }
      renderEvents();
    });
  }

  if (headerSearchInput) {
    headerSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (searchInput && searchInput.value !== e.target.value) {
        searchInput.value = e.target.value;
      }
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
      .filter(r => (r.studentEmail && r.studentEmail.toLowerCase() === (currentStudent ? currentStudent.email.toLowerCase() : '')))
      .map(r => r.eventId)
  );

  const filtered = allEvents.filter(evt => {
    const matchesCategory = selectedCategory === 'all' || 
      (evt.category && evt.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery || 
      (evt.name && evt.name.toLowerCase().includes(searchQuery)) ||
      (evt.description && evt.description.toLowerCase().includes(searchQuery)) ||
      (evt.venue && evt.venue.toLowerCase().includes(searchQuery)) ||
      (evt.category && evt.category.toLowerCase().includes(searchQuery));

    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #ffffff; border-radius: 8px; border: 1px solid #c5d2c8;">
        <i class="bi bi-calendar-x text-muted" style="font-size: 2.5rem;"></i>
        <h4 style="margin-top: 16px; color: #102238; font-weight: 700;">No Events Found</h4>
        <p style="color: #596780; margin-bottom: 0;">Try changing your search term or selecting a different category.</p>
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
    let seatsClass = '';
    if (evt.seatsLeft === 'Unlimited') {
      seatsText = 'Open Event (Unlimited)';
      seatsClass = 'seats-unlimited';
    } else if (typeof evt.seatsLeft === 'number') {
      seatsText = `${evt.seatsLeft} / ${evt.maxParticipants || 200} Seats Available`;
      if (evt.seatsLeft <= 5) {
        seatsClass = 'seats-limited';
      } else {
        seatsClass = 'seats-available';
      }
    } else {
      seatsText = 'Registration Open';
      seatsClass = 'seats-available';
    }

    return `
      <div class="event-card">
        <div class="event-media-box">
          <img src="${evt.image || 'assets/images/tech-symposium-lab.jpg'}" alt="${escapeHtml(evt.name)}">
          <span class="card-category-badge ${catBadgeClass}">${escapeHtml(evt.category || 'Event')}</span>
          ${isAlmostFull ? '<span class="card-status-pill">Almost Full</span>' : ''}
        </div>
        <div class="event-card-body">
          <h3 class="event-title">${escapeHtml(evt.name)}</h3>
          <div class="event-details-meta">
            <div class="meta-row meta-datetime">
              <i class="bi bi-calendar"></i>
              <span>${escapeHtml(evt.date || 'TBA')}&nbsp;&nbsp;&bull;&nbsp;&nbsp;<i class="bi bi-clock"></i>&nbsp;&nbsp;${escapeHtml(evt.time || 'All Day')}</span>
            </div>
            <div class="meta-row meta-venue">
              <i class="bi bi-geo-alt"></i>
              <span>${escapeHtml(evt.venue || 'Campus')}</span>
            </div>
            <div class="meta-row meta-seats ${seatsClass}">
              <i class="bi bi-people"></i>
              <span>${escapeHtml(seatsText)}</span>
            </div>
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
    `;
  }).join('');
}

window.handleCardRegister = function(eventId) {
  const targetEvt = allEvents.find(e => e.id === eventId);
  if (!targetEvt) return;

  const regRaw = localStorage.getItem('campusfest_registrations');
  let regs = regRaw ? JSON.parse(regRaw) : [];

  const studentEmail = currentStudent ? currentStudent.email : 'alex.mercer@marwadiuniversity.ac.in';
  const studentName = currentStudent ? currentStudent.name : 'Alex Mercer';

  const cleanStudentEmail = (studentEmail || '').trim();
  // Ensure valid institutional student email
  if (!/^[a-zA-Z0-9._%+-]+@marwadiuniversity\.ac\.in$/i.test(cleanStudentEmail)) {
    showFeedback('Please use your official student email address ending with @marwadiuniversity.ac.in.', 'danger');
    return;
  }

  const already = regs.some(r => 
    r.eventId === eventId && 
    (r.studentEmail || '').trim().toLowerCase() === cleanStudentEmail.toLowerCase()
  );

  if (already) {
    showFeedback(`You are already registered for ${targetEvt.name}.`, 'warning');
    return;
  }

  const newReg = {
    id: 'reg-' + Date.now(),
    eventId: targetEvt.id,
    eventName: targetEvt.name,
    studentName: studentName,
    studentEmail: studentEmail,
    enrollmentNo: currentStudent ? currentStudent.enrollmentNo || 'CS2021045' : 'CS2021045',
    department: currentStudent ? currentStudent.department || 'Computer Science' : 'Computer Science',
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

  showFeedback(`Successfully registered for ${targetEvt.name}! Check your registrations.`, 'success');
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

function setupProfileDropdown() {
  document.querySelectorAll('.header-profile-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = btn.closest('.header-profile-dropdown');
      if (!parent) return;
      const menu = parent.querySelector('.student-profile-menu');
      if (!menu) return;
      const isOpen = menu.classList.contains('show');
      document.querySelectorAll('.student-profile-menu.show').forEach(m => {
        m.classList.remove('show');
        const sib = m.closest('.header-profile-dropdown')?.querySelector('.header-profile-btn');
        if (sib) sib.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        menu.classList.add('show');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-profile-dropdown')) {
      document.querySelectorAll('.student-profile-menu.show').forEach(menu => {
        menu.classList.remove('show');
        const btn = menu.closest('.header-profile-dropdown')?.querySelector('.header-profile-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

function setupLogout() {
  const logoutBtns = document.querySelectorAll('.student-logout-btn, #studentLogoutBtn');
  logoutBtns.forEach(btn => {
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
