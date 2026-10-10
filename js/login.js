

document.addEventListener('DOMContentLoaded', () => {
  ensureDefaultUsers();
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
        if (!existing.some(u => u.email.toLowerCase() === du.email.toLowerCase())) {
          existing.push(du);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem('campusfest_users', JSON.stringify(existing));
      }
    } catch(e) {
      localStorage.setItem('campusfest_users', JSON.stringify(defaultUsers));
    }
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

    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

if (!email) {
      showAlert('Please enter your official college email address.');
      return;
    }

    if (!password) {
      showAlert('Please enter your password.');
      return;
    }

const isStudent = /^[^\s@]+@marwadiuniversity\.ac\.in$/i.test(email);
    const isFaculty = /^[^\s@]+@marwadieducation\.edu\.in$/i.test(email);

    if (!isStudent && !isFaculty) {
      showAlert('Please enter a valid student email ending with @marwadiuniversity.ac.in or faculty/admin email ending with @marwadieducation.edu.in');
      return;
    }

    const detectedRole = isFaculty ? 'faculty' : 'student';

const usersRaw = localStorage.getItem('campusfest_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    let matchedUser = users.find(u => u.email.toLowerCase() === email);

    if (matchedUser) {
      if (matchedUser.password !== password) {
        showAlert('Incorrect password. Please try again.');
        return;
      }
    } else {
      
      const namePart = email.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      matchedUser = {
        id: 'usr-' + Date.now(),
        name: formattedName || (detectedRole === 'faculty' ? 'Faculty Member' : 'Student Member'),
        email: email,
        password: password,
        role: detectedRole,
        department: 'Computer Science',
        semester: detectedRole === 'student' ? '5th Semester' : undefined,
        designation: detectedRole === 'faculty' ? 'Associate Professor' : undefined,
        enrollmentNo: detectedRole === 'student' ? 'CS' + Math.floor(100000 + Math.random() * 900000) : undefined,
        facultyId: detectedRole === 'faculty' ? 'FAC-' + Math.floor(1000 + Math.random() * 9000) : undefined
      };

      users.push(matchedUser);
      localStorage.setItem('campusfest_users', JSON.stringify(users));
    }

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
