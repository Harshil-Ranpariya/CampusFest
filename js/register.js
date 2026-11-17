let selectedRole = 'student';

document.addEventListener('DOMContentLoaded', () => {
  setupRoleToggle();
  setupRegisterForm();
});

function setupRoleToggle() {
  const studentBtn = document.getElementById('roleBtnStudent');
  const facultyBtn = document.getElementById('roleBtnFaculty');

  const idLabel = document.getElementById('idLabel');
  const idInput = document.getElementById('idNumber');
  const semLabel = document.getElementById('semLabel');
  const semInput = document.getElementById('semesterOrDesignation');
  const emailInput = document.getElementById('regEmail');

  function setRole(role) {
    selectedRole = role;
    showAlert('', false);

    if (role === 'faculty') {
      if (studentBtn) studentBtn.classList.remove('active');
      if (facultyBtn) facultyBtn.classList.add('active');

      if (idLabel) idLabel.textContent = 'Faculty ID';
      if (idInput) idInput.placeholder = 'Faculty ID (e.g. FAC-2023-894)';
      if (semLabel) semLabel.textContent = 'Designation';
      if (semInput) semInput.placeholder = 'e.g., Associate Professor';
      if (emailInput) emailInput.placeholder = 'faculty.name@marwadieducation.edu.in';
    } else {
      if (facultyBtn) facultyBtn.classList.remove('active');
      if (studentBtn) studentBtn.classList.add('active');

      if (idLabel) idLabel.textContent = 'Enrollment no.';
      if (idInput) idInput.placeholder = 'Enrollment no.';
      if (semLabel) semLabel.textContent = 'Semester';
      if (semInput) semInput.placeholder = 'e.g., Semester 4';
      if (emailInput) emailInput.placeholder = 'john.doe@marwadiuniversity.ac.in';
    }
  }

  if (studentBtn) {
    studentBtn.addEventListener('click', () => setRole('student'));
  }

  if (facultyBtn) {
    facultyBtn.addEventListener('click', () => setRole('faculty'));
  }

  const urlParams = new URLSearchParams(window.location.search);
  const requestedRole = urlParams.get('role');
  if (requestedRole && requestedRole.toLowerCase() === 'faculty') {
    setRole('faculty');
  } else {
    setRole('student');
  }
}

function setupRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showAlert('', false);

    const fullNameInput = document.getElementById('fullName');
    const idNumberInput = document.getElementById('idNumber');
    const emailInput = document.getElementById('regEmail');
    const departmentInput = document.getElementById('department');
    const semesterOrDesignationInput = document.getElementById('semesterOrDesignation');
    const passwordInput = document.getElementById('regPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const fullName = fullNameInput ? fullNameInput.value.trim() : '';
    const idNumber = idNumberInput ? idNumberInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const department = departmentInput ? departmentInput.value : '';
    const semesterOrDesignation = semesterOrDesignationInput ? semesterOrDesignationInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

    if (!fullName || !idNumber || !email || !department || !semesterOrDesignation || !password || !confirmPassword) {
      showAlert('Please fill in all required fields.');
      return;
    }

    const STUDENT_DOMAIN_REGEX = /^[a-zA-Z0-9._%+-]+@marwadiuniversity\.ac\.in$/i;
    const FACULTY_DOMAIN_REGEX = /^[a-zA-Z0-9._%+-]+@marwadieducation\.edu\.in$/i;

    if (selectedRole === 'student') {
      if (!STUDENT_DOMAIN_REGEX.test(email)) {
        showAlert('Please use your official student email address ending with @marwadiuniversity.ac.in.');
        return;
      }
    } else if (selectedRole === 'faculty') {
      if (!FACULTY_DOMAIN_REGEX.test(email)) {
        showAlert('Please use your official faculty email address ending with @marwadieducation.edu.in.');
        return;
      }
    } else {
      showAlert('Invalid account type selected.');
      return;
    }

    if (password.length < 6) {
      showAlert('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Passwords do not match. Please verify.');
      return;
    }

    const rawUsers = localStorage.getItem('campusfest_users');
    let users = rawUsers ? JSON.parse(rawUsers) : [];

    const exists = users.some(u => (u.email || '').trim().toLowerCase() === email.toLowerCase());
    if (exists) {
      showAlert('An account with this email already exists. Please log in.');
      return;
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: fullName,
      email: email,
      password: password,
      role: selectedRole,
      department: department,
      semester: selectedRole === 'student' ? semesterOrDesignation : undefined,
      designation: selectedRole === 'faculty' ? semesterOrDesignation : undefined,
      enrollmentNo: selectedRole === 'student' ? idNumber : undefined,
      facultyId: selectedRole === 'faculty' ? idNumber : undefined,
      registeredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    if (window.AuthValidator && typeof window.AuthValidator.safeRegisterUser === 'function') {
      const res = window.AuthValidator.safeRegisterUser(newUser);
      if (!res.success) {
        showAlert(res.message);
        return;
      }
    } else {
      users.push(newUser);
      localStorage.setItem('campusfest_users', JSON.stringify(users));
      localStorage.setItem('campusfest_current_user', JSON.stringify(newUser));
    }

    if (selectedRole === 'faculty') {
      window.location.href = 'faculty-dashboard.html';
    } else {
      window.location.href = 'student-dashboard.html';
    }
  });
}

function showAlert(msg, show = true) {
  const alertBox = document.getElementById('registerAlert');
  if (!alertBox) return;

  if (show && msg) {
    alertBox.textContent = msg;
    alertBox.classList.remove('d-none');
  } else {
    alertBox.textContent = '';
    alertBox.classList.add('d-none');
  }
}
