let currentEvent = null;
let currentStudent = null;

document.addEventListener('DOMContentLoaded', () => {
  setupProfileDropdown();
  setupLogout();
  currentStudent = checkStudentAuth();
  loadEventDetails();
  setupRegistrationAction();
  loadNotificationBadge();
});

function checkStudentAuth() {
  const isLoggedOut = sessionStorage.getItem('campusfest_logged_out') === 'true';
  const userRaw = localStorage.getItem('campusfest_current_user') || sessionStorage.getItem('campusfest_current_user');
  let student = null;

  if (userRaw && !isLoggedOut) {
    try {
      student = JSON.parse(userRaw);
    } catch (e) {
      console.error(e);
    }
  }

  if (isLoggedOut || (userRaw && (!student || student.role !== 'student'))) {
    window.location.href = 'login.html';
    return null;
  }

  if (!student) {
    student = {
      id: 'usr-student-1',
      name: 'Alex Mercer',
      email: 'alex.mercer@marwadiuniversity.ac.in',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      semester: '5th Semester',
      enrollmentNo: 'CS2021045',
      phone: '+91 9876543210'
    };
    localStorage.setItem('campusfest_current_user', JSON.stringify(student));
  }

  const navStudentName = document.getElementById('navStudentName');
  if (navStudentName) navStudentName.textContent = student.name;
  return student;
}

function loadEventDetails() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('id');

  const evtRaw = localStorage.getItem('campusfest_events');
  const events = evtRaw ? JSON.parse(evtRaw) : [];

  currentEvent = events.find(e => e.id === eventId) || events[0] || {
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
    image: 'assets/images/tech-symposium.jpg',
    status: 'Open'
  };

  const titleEl = document.getElementById('evtDetailTitle');
  const imgEl = document.getElementById('evtDetailImage');
  const orgEl = document.getElementById('evtOrganizer');
  const catEl = document.getElementById('evtCategory');
  const descEl = document.getElementById('evtDetailDescription');
  const highlightsEl = document.getElementById('evtDetailHighlights');

  const dtEl = document.getElementById('sidebarDateTime');
  const timeEl = document.getElementById('sidebarTime');
  const venueEl = document.getElementById('sidebarVenue');
  const seatsEl = document.getElementById('sidebarSeatsLeft');
  const deadlineEl = document.getElementById('sidebarDeadline');
  const statusBadge = document.getElementById('evtStatusBadge');

  if (titleEl) titleEl.textContent = currentEvent.name;
  if (imgEl && currentEvent.image) imgEl.src = currentEvent.image;
  if (orgEl) orgEl.textContent = currentEvent.organizer || 'Academic Affairs';
  if (catEl) catEl.textContent = `${currentEvent.category || 'General'}, CampusFest`;
  if (descEl && currentEvent.description) descEl.textContent = currentEvent.description;

  if (highlightsEl && Array.isArray(currentEvent.keyHighlights)) {
    highlightsEl.innerHTML = currentEvent.keyHighlights.map(h => `
      <li><i class="bi bi-check-circle-fill text-success me-2"></i>${escapeHtml(h)}</li>
    `).join('');
  }

  if (dtEl) dtEl.textContent = currentEvent.date || 'February 17, 2027';
  if (timeEl) timeEl.textContent = currentEvent.time || 'All Day Event';
  if (venueEl) venueEl.textContent = currentEvent.venue || 'Campus Venue';
  if (seatsEl) seatsEl.textContent = currentEvent.seatsLeft !== undefined ? currentEvent.seatsLeft : 'Available';
  if (deadlineEl) deadlineEl.textContent = currentEvent.deadline || 'Prior to Event';
  if (statusBadge) statusBadge.textContent = currentEvent.status || 'Registration Open';

  checkRegistrationStatus();
}

function checkRegistrationStatus() {
  const regBtn = document.getElementById('detailRegisterBtn');
  if (!regBtn || !currentEvent) return;

  const regRaw = localStorage.getItem('campusfest_registrations');
  const regs = regRaw ? JSON.parse(regRaw) : [];

  const alreadyRegistered = regs.some(r => 
    r.eventId === currentEvent.id && 
    r.studentEmail.toLowerCase() === currentStudent.email.toLowerCase()
  );

  if (alreadyRegistered) {
    regBtn.disabled = true;
    regBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i> Already Registered';
  } else {
    regBtn.disabled = false;
    regBtn.innerHTML = '<span>Register Now</span> <i class="bi bi-arrow-right ms-1"></i>';
  }
}

function setupRegistrationAction() {
  const regBtn = document.getElementById('detailRegisterBtn');
  if (!regBtn) return;

  regBtn.addEventListener('click', () => {
    if (!currentEvent || !currentStudent) return;

    const studentEmail = (currentStudent.email || '').trim();
    if (!/^[a-zA-Z0-9._%+-]+@marwadiuniversity\.ac\.in$/i.test(studentEmail)) {
      alert('Please use your official student email address ending with @marwadiuniversity.ac.in.');
      return;
    }

    const regRaw = localStorage.getItem('campusfest_registrations');
    let regs = regRaw ? JSON.parse(regRaw) : [];

    const alreadyRegistered = regs.some(r => 
      r.eventId === currentEvent.id && 
      r.studentEmail.toLowerCase() === currentStudent.email.toLowerCase()
    );

    if (alreadyRegistered) {
      alert(`You are already registered for ${currentEvent.name}.`);
      return;
    }

    const newReg = {
      id: 'reg-' + Date.now(),
      eventId: currentEvent.id,
      eventName: currentEvent.name,
      studentName: currentStudent.name,
      studentEmail: currentStudent.email,
      enrollmentNo: currentStudent.enrollmentNo || 'CS2021045',
      department: currentStudent.department || 'Computer Science',
      date: currentEvent.date,
      time: currentEvent.time,
      venue: currentEvent.venue,
      registeredOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Confirmed'
    };

    regs.push(newReg);
    localStorage.setItem('campusfest_registrations', JSON.stringify(regs));

    const evtRaw = localStorage.getItem('campusfest_events');
    if (evtRaw) {
      let events = JSON.parse(evtRaw);
      const target = events.find(e => e.id === currentEvent.id);
      if (target && typeof target.seatsLeft === 'number' && target.seatsLeft > 0) {
        target.seatsLeft -= 1;
        currentEvent.seatsLeft = target.seatsLeft;
        localStorage.setItem('campusfest_events', JSON.stringify(events));

        const seatsEl = document.getElementById('sidebarSeatsLeft');
        if (seatsEl) seatsEl.textContent = target.seatsLeft;
      }
    }

    const notifRaw = localStorage.getItem('campusfest_notifications');
    let notifs = notifRaw ? JSON.parse(notifRaw) : [];
    notifs.unshift({
      id: 'notif-' + Date.now(),
      title: `Registration Confirmed: ${currentEvent.name}`,
      message: `Your pass for ${currentEvent.name} has been issued. Venue: ${currentEvent.venue}. Please arrive 15 minutes before scheduled start.`,
      time: 'Just now',
      type: 'success',
      read: false
    });
    localStorage.setItem('campusfest_notifications', JSON.stringify(notifs));

    const modalMsg = document.getElementById('modalSuccessMessage');
    if (modalMsg) {
      modalMsg.textContent = `Your spot for ${currentEvent.name} on ${currentEvent.date} has been confirmed. See you there!`;
    }

    const modalEl = document.getElementById('regSuccessModal');
    if (modalEl && window.bootstrap) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }

    checkRegistrationStatus();
    loadNotificationBadge();
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

window.toggleStudentProfileMenu = function(btn, event) {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }
  const trigger = (btn && typeof btn.closest === 'function') ? btn : (event ? (event.currentTarget || event.target) : null);
  const parent = trigger ? trigger.closest('.header-profile-dropdown') : document.querySelector('.header-profile-dropdown');
  if (!parent) return;
  const menu = parent.querySelector('.student-profile-menu');
  if (!menu) return;

  const isCurrentlyOpen = menu.classList.contains('show');

  document.querySelectorAll('.student-profile-menu.show').forEach(m => {
    m.classList.remove('show');
    const toggleBtn = m.closest('.header-profile-dropdown')?.querySelector('.header-profile-btn');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.classList.remove('show');
    }
  });

  if (!isCurrentlyOpen) {
    menu.classList.add('show');
    const toggleBtn = parent.querySelector('.header-profile-btn');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.classList.add('show');
    }
  }
};

function setupProfileDropdown() {
  document.querySelectorAll('.header-profile-btn').forEach(btn => {
    btn.onclick = function(e) {
      window.toggleStudentProfileMenu(btn, e);
    };
  });

  document.querySelectorAll('.student-profile-menu .profile-dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.student-profile-menu.show').forEach(menu => {
        menu.classList.remove('show');
        const btn = menu.closest('.header-profile-dropdown')?.querySelector('.header-profile-btn');
        if (btn) {
          btn.setAttribute('aria-expanded', 'false');
          btn.classList.remove('show');
        }
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-profile-dropdown')) {
      document.querySelectorAll('.student-profile-menu.show').forEach(menu => {
        menu.classList.remove('show');
        const btn = menu.closest('.header-profile-dropdown')?.querySelector('.header-profile-btn');
        if (btn) {
          btn.setAttribute('aria-expanded', 'false');
          btn.classList.remove('show');
        }
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.student-profile-menu.show').forEach(menu => {
        menu.classList.remove('show');
        const btn = menu.closest('.header-profile-dropdown')?.querySelector('.header-profile-btn');
        if (btn) {
          btn.setAttribute('aria-expanded', 'false');
          btn.classList.remove('show');
        }
      });
    }
  });
}

function setupLogout() {
  const logoutBtns = document.querySelectorAll('.student-logout-btn, #studentLogoutBtn, .studentLogoutBtn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.setItem('campusfest_logged_out', 'true');
      localStorage.removeItem('campusfest_current_user');
      sessionStorage.removeItem('campusfest_current_user');
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
