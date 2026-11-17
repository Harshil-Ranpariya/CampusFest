document.addEventListener('DOMContentLoaded', () => {
  const faculty = loadFacultyProfile();
  setupProfileForm(faculty);
  setupLogout();
});

function loadFacultyProfile() {
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

  const nameEl = document.getElementById('facultyFullName');
  const idEl = document.getElementById('facultyIdInput');
  const emailEl = document.getElementById('facultyEmailInput');
  const deptEl = document.getElementById('facultyDeptSelect');
  const desigEl = document.getElementById('facultyDesignationInput');

  if (nameEl) nameEl.value = faculty.name || 'Dr. Sarah Jenkins';
  if (idEl) idEl.value = faculty.facultyId || 'FAC-2023-894';
  if (emailEl) emailEl.value = faculty.email || 's.jenkins@marwadieducation.edu.in';
  if (deptEl && faculty.department) deptEl.value = faculty.department;
  if (desigEl) desigEl.value = faculty.designation || 'Associate Professor';

  return faculty;
}

function setupProfileForm(faculty) {
  const form = document.getElementById('facultyProfileForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('facultyFullName').value.trim();
    const facultyId = document.getElementById('facultyIdInput').value.trim();
    const dept = document.getElementById('facultyDeptSelect').value;
    const designation = document.getElementById('facultyDesignationInput').value.trim();

    if (!name || !facultyId || !designation) {
      alert('Please fill in all profile fields.');
      return;
    }

    const currentEmail = (faculty.email || '').trim();
    if (!/^[a-zA-Z0-9._%+-]+@marwadieducation\.edu\.in$/i.test(currentEmail)) {
      alert('Please use your official faculty email address ending with @marwadieducation.edu.in.');
      return;
    }

    faculty.name = name;
    faculty.facultyId = facultyId;
    faculty.department = dept;
    faculty.designation = designation;

    localStorage.setItem('campusfest_current_user', JSON.stringify(faculty));

    const usersRaw = localStorage.getItem('campusfest_users');
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      const idx = users.findIndex(u => u.email.toLowerCase() === faculty.email.toLowerCase());
      if (idx !== -1) {
        users[idx].name = name;
        users[idx].facultyId = facultyId;
        users[idx].department = dept;
        users[idx].designation = designation;
        localStorage.setItem('campusfest_users', JSON.stringify(users));
      }
    }

    const alertBox = document.getElementById('facultyProfileAlert');
    if (alertBox) {
      alertBox.textContent = 'Faculty credentials and profile updated successfully!';
      alertBox.classList.remove('d-none');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => alertBox.classList.add('d-none'), 4000);
    }
  });
}

function setupLogout() {
  document.querySelectorAll('#facultyLogoutBtn, #facultyLogoutBtnMobile, .faculty-logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('campusfest_current_user');
      window.location.href = 'login.html';
    });
  });
}
