document.addEventListener('DOMContentLoaded', () => {
  setupProfileDropdown();
  setupLogout();
  const student = loadProfileData();
  if (student) {
    setupProfileForm(student);
    loadNotificationBadge();
  }
});

function loadProfileData() {
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

  const nameInput = document.getElementById('studentFullName');
  const enrolInput = document.getElementById('studentEnrollment');
  const emailInput = document.getElementById('studentEmail');
  const deptInput = document.getElementById('studentDepartment');
  const semInput = document.getElementById('studentSemester');
  const navName = document.getElementById('navStudentName');

  if (nameInput) nameInput.value = student.name || 'Alex Mercer';
  if (enrolInput) enrolInput.value = student.enrollmentNo || 'CS2021045';
  if (emailInput) emailInput.value = student.email || 'alex.mercer@marwadiuniversity.ac.in';
  if (deptInput && student.department) deptInput.value = student.department;
  if (semInput && student.semester) semInput.value = student.semester;
  if (navName) navName.textContent = student.name || 'Student';

  return student;
}

function setupProfileForm(student) {
  const form = document.getElementById('studentProfileForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('studentFullName').value.trim();
    const enrollment = document.getElementById('studentEnrollment').value.trim();
    const dept = document.getElementById('studentDepartment').value;
    const semester = document.getElementById('studentSemester').value;

    if (!name || !enrollment) {
      alert('Name and Enrollment Number cannot be empty.');
      return;
    }

    const currentEmail = (student.email || '').trim();
    if (!/^[a-zA-Z0-9._%+-]+@marwadiuniversity\.ac\.in$/i.test(currentEmail)) {
      alert('Please use your official student email address ending with @marwadiuniversity.ac.in.');
      return;
    }

    student.name = name;
    student.enrollmentNo = enrollment;
    student.department = dept;
    student.semester = semester;

    localStorage.setItem('campusfest_current_user', JSON.stringify(student));

    const usersRaw = localStorage.getItem('campusfest_users');
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      const idx = users.findIndex(u => u.email.toLowerCase() === student.email.toLowerCase());
      if (idx !== -1) {
        users[idx].name = name;
        users[idx].enrollmentNo = enrollment;
        users[idx].department = dept;
        users[idx].semester = semester;
        localStorage.setItem('campusfest_users', JSON.stringify(users));
      }
    }

    const navName = document.getElementById('navStudentName');
    if (navName) navName.textContent = name;

    const alertBox = document.getElementById('profileAlert');
    if (alertBox) {
      alertBox.textContent = 'Profile information saved successfully!';
      alertBox.classList.remove('d-none');
      setTimeout(() => {
        alertBox.classList.add('d-none');
      }, 4000);
    }
  });
}

function loadNotificationBadge() {
  const notifRaw = localStorage.getItem('campusfest_notifications');
  if (!notifRaw) return;
  try {
    const notifs = JSON.parse(notifRaw);
    const unreadCount = notifs.filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    if (badge && unreadCount > 0) {
      badge.textContent = unreadCount;
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
