

document.addEventListener('DOMContentLoaded', () => {
  const student = loadProfileData();
  setupProfileForm(student);
  loadNotificationBadge();
  setupLogout();
});

function loadProfileData() {
  const userRaw = localStorage.getItem('campusfest_current_user');
  let student = null;

  if (userRaw) {
    try {
      student = JSON.parse(userRaw);
    } catch (e) {
      console.error(e);
    }
  }

  if (!student || student.role !== 'student') {
    window.location.href = 'login.html';
    return null;
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

function setupLogout() {
  const logoutBtns = document.querySelectorAll('#studentLogoutBtn, .studentLogoutBtn');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('campusfest_current_user');
        window.location.href = 'index.html';
      });
    });
}
