let selectedLoginRole = 'student';

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  ensureDefaultUsers();
  setupRoleToggle();
  setupLoginForm();
});

function ensureDefaultUsers() {
  const defaultUsers = [
    {
      id: 'usr-student-1',
      name: 'Alex Mercer',
      email: 'alex.mercer@marwadiuniversity.ac.in',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      semester: '5th Semester',
      enrollmentNo: 'CS2021045',
      phone: '+91 9876543210'
    },
    {
      id: 'usr-student-2',
      name: 'John Doe',
      email: 'john.doe@marwadiuniversity.ac.in',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      semester: '4th Semester',
      enrollmentNo: 'EN2021001',
      phone: '+91 9876543211'
    },
    {
      id: 'usr-faculty-1',
      name: 'Dr. Sarah Jenkins',
      email: 's.jenkins@marwadieducation.edu.in',
      password: 'password123',
      role: 'faculty',
      department: 'Computer Science',
      designation: 'Associate Professor',
      facultyId: 'FAC-2023-894',
      phone: '+91 9876543212'
    }
  ];

  const raw = localStorage.getItem('campusfest_users');
  if (!raw) {
    localStorage.setItem('campusfest_users', JSON.stringify(defaultUsers));
  } else {
    try {
      const existing = JSON.parse(raw);
      let updated = false;
      defaultUsers.forEach(du => {
        if (!existing.some(u => (u.email || '').trim().toLowerCase() === du.email.toLowerCase())) {
          existing.push(du);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem('campusfest_users', JSON.stringify(existing));
      }
    } catch (e) {
      localStorage.setItem('campusfest_users', JSON.stringify(defaultUsers));
    }
  }
}

function setupRoleToggle() {
  const studentBtn = document.getElementById('studentRoleBtn');
  const facultyBtn = document.getElementById('facultyRoleBtn');
  const emailInput = document.getElementById('collegeEmail');

  function setRole(role) {
    selectedLoginRole = role;
    showAlert('', false);

    if (role === 'faculty') {
      if (studentBtn) studentBtn.classList.remove('active');
      if (facultyBtn) facultyBtn.classList.add('active');
      if (emailInput) emailInput.placeholder = 'faculty.name@marwadieducation.edu.in';
    } else {
      if (facultyBtn) facultyBtn.classList.remove('active');
      if (studentBtn) studentBtn.classList.add('active');
      if (emailInput) emailInput.placeholder = 'student.name@marwadiuniversity.ac.in';
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

function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showAlert('', false);

    const emailInput = document.getElementById('collegeEmail');
    const passwordInput = document.getElementById('password');

    const rawEmail = emailInput ? emailInput.value : '';
    const email = rawEmail.trim();
    const password = passwordInput ? passwordInput.value : '';

    if (!email) {
      if (selectedLoginRole === 'faculty') {
        showAlert('Please use your official faculty email address ending with @marwadieducation.edu.in.');
      } else {
        showAlert('Please use your official student email address ending with @marwadiuniversity.ac.in.');
      }
      return;
    }

    if (!password) {
      showAlert('Please enter your password.');
      return;
    }

    const STUDENT_DOMAIN_REGEX = /^[a-zA-Z0-9._%+-]+@marwadiuniversity\.ac\.in$/i;
    const FACULTY_DOMAIN_REGEX = /^[a-zA-Z0-9._%+-]+@marwadieducation\.edu\.in$/i;

    if (selectedLoginRole === 'student') {
      if (!STUDENT_DOMAIN_REGEX.test(email)) {
        showAlert('Please use your official student email address ending with @marwadiuniversity.ac.in.');
        return;
      }
    } else if (selectedLoginRole === 'faculty') {
      if (!FACULTY_DOMAIN_REGEX.test(email)) {
        showAlert('Please use your official faculty email address ending with @marwadieducation.edu.in.');
        return;
      }
    } else {
      showAlert('Invalid account type selected.');
      return;
    }

    const usersRaw = localStorage.getItem('campusfest_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    let matchedUser = users.find(u => (u.email || '').trim().toLowerCase() === email.toLowerCase());

    if (matchedUser) {
      if (matchedUser.role !== selectedLoginRole) {
        if (selectedLoginRole === 'student') {
          showAlert('Please use your official student email address ending with @marwadiuniversity.ac.in.');
        } else {
          showAlert('Please use your official faculty email address ending with @marwadieducation.edu.in.');
        }
        return;
      }

      if (matchedUser.password !== password) {
        showAlert('Incorrect password. Please try again.');
        return;
      }
    } else {
      const namePart = email.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      matchedUser = {
        id: 'usr-' + Date.now(),
        name: formattedName || (selectedLoginRole === 'faculty' ? 'Faculty Member' : 'Student Member'),
        email: email,
        password: password,
        role: selectedLoginRole,
        department: 'Computer Science',
        semester: selectedLoginRole === 'student' ? '5th Semester' : undefined,
        designation: selectedLoginRole === 'faculty' ? 'Associate Professor' : undefined,
        enrollmentNo: selectedLoginRole === 'student' ? 'CS' + Math.floor(100000 + Math.random() * 900000) : undefined,
        facultyId: selectedLoginRole === 'faculty' ? 'FAC-' + Math.floor(1000 + Math.random() * 9000) : undefined
      };

      users.push(matchedUser);
      localStorage.setItem('campusfest_users', JSON.stringify(users));
    }

    sessionStorage.removeItem('campusfest_logged_out');
    localStorage.setItem('campusfest_current_user', JSON.stringify(matchedUser));

    if (matchedUser.role === 'faculty') {
      window.location.href = 'faculty-dashboard.html';
    } else {
      window.location.href = 'student-dashboard.html';
    }
  });

  const forgotLink = document.getElementById('forgotPassLink');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Password reset link sent to your registered institutional email.');
    });
  }
}

function showAlert(message, show = true) {
  const alertBox = document.getElementById('loginAlert');
  if (!alertBox) return;

  if (show && message) {
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
  } else {
    alertBox.textContent = '';
    alertBox.classList.add('d-none');
  }
}
