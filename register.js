

document.addEventListener('DOMContentLoaded', () => {
  setupRegisterForm();
});

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
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const department = departmentInput ? departmentInput.value : '';
    const semesterOrDesignation = semesterOrDesignationInput ? semesterOrDesignationInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

if (!fullName || !idNumber || !email || !department || !semesterOrDesignation || !password || !confirmPassword) {
      showAlert('Please fill in all required fields marked with *.');
      return;
    }

const isStudent = /^[^\s@]+@marwadiuniversity\.ac\.in$/i.test(email);
    const isFaculty = /^[^\s@]+@marwadieducation\.edu\.in$/i.test(email);

    if (!isStudent && !isFaculty) {
      if (email.includes('gmail') || email.includes('yahoo') || email.includes('example')) {
        showAlert('Personal email domains are not allowed. Students must use @marwadiuniversity.ac.in and faculty must use @marwadieducation.edu.in');
      } else {
        showAlert('Please enter a valid student email ending with @marwadiuniversity.ac.in or faculty/admin email ending with @marwadieducation.edu.in');
      }
      return;
    }

    const role = isFaculty ? 'faculty' : 'student';

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

const exists = users.some(u => u.email.toLowerCase() === email);
    if (exists) {
      showAlert('An account with this email already exists. Please log in.');
      return;
    }

const newUser = {
      id: 'usr-' + Date.now(),
      name: fullName,
      email: email,
      password: password,
      role: role,
      department: department,
      semester: role === 'student' ? semesterOrDesignation : undefined,
      designation: role === 'faculty' ? semesterOrDesignation : undefined,
      enrollmentNo: role === 'student' ? idNumber : undefined,
      facultyId: role === 'faculty' ? idNumber : undefined,
      registeredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    users.push(newUser);
    localStorage.setItem('campusfest_users', JSON.stringify(users));

localStorage.setItem('campusfest_current_user', JSON.stringify(newUser));

if (role === 'faculty') {
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
