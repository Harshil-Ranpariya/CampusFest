let allRegistrations = [];

document.addEventListener('DOMContentLoaded', () => {
  const faculty = checkFacultyAuth();
  if (faculty) {
    loadAllRegistrations();
    setupLogout();
  }
});

function checkFacultyAuth() {
  const userRaw = localStorage.getItem('campusfest_current_user');
  let faculty = null;
  if (userRaw) {
    try {
      faculty = JSON.parse(userRaw);
    } catch (e) {}
  }

  if (!faculty || faculty.role !== 'faculty') {
    if (sessionStorage.getItem('campusfest_logged_out') === 'true') {
      window.location.href = 'login.html';
      return null;
    }
    const defaultFaculty = {
      id: 'usr-faculty-1',
      name: 'Dr. Sarah Jenkins',
      email: 's.jenkins@marwadieducation.edu.in',
      role: 'faculty',
      department: 'Computer Science'
    };
    localStorage.setItem('campusfest_current_user', JSON.stringify(defaultFaculty));
    faculty = defaultFaculty;
  }

  return faculty;
}

function loadAllRegistrations() {
  const raw = localStorage.getItem('campusfest_registrations');
  let loaded = [];
  if (raw) {
    try {
      loaded = JSON.parse(raw);
    } catch (e) {
      loaded = [];
    }
  }

  const defaultRoster = [
    {
      id: 'reg-std-1',
      studentName: 'John Doe',
      enrollmentNo: 'EN2021001',
      studentEmail: 'john.doe@marwadiuniversity.ac.in',
      department: 'Computer Science',
      eventName: 'Annual Tech Symposium',
      registeredOn: 'Feb 10, 2027'
    },
    {
      id: 'reg-std-2',
      studentName: 'Alice Smith',
      enrollmentNo: 'EN2021045',
      studentEmail: 'alice.s@marwadiuniversity.ac.in',
      department: 'Electrical Eng.',
      eventName: 'Intro to Python for Data Science',
      registeredOn: 'Feb 11, 2027'
    },
    {
      id: 'reg-std-3',
      studentName: 'Robert Johnson',
      enrollmentNo: 'EN2020112',
      studentEmail: 'r.johnson@marwadiuniversity.ac.in',
      department: 'Mechanical Eng.',
      eventName: 'Inter-Collegiate Tournament',
      registeredOn: 'Feb 12, 2027'
    },
    {
      id: 'reg-std-4',
      studentName: 'Emma Williams',
      enrollmentNo: 'EN2022088',
      studentEmail: 'emma.w@marwadiuniversity.ac.in',
      department: 'Civil Eng.',
      eventName: 'Global Culture Fest',
      registeredOn: 'Feb 12, 2027'
    },
    {
      id: 'reg-std-5',
      studentName: 'Michael Brown',
      enrollmentNo: 'EN2021077',
      studentEmail: 'mbrown@marwadiuniversity.ac.in',
      department: 'Computer Science',
      eventName: 'Resume Building Workshop',
      registeredOn: 'Feb 13, 2027'
    }
  ];

  const combined = [...defaultRoster];
  if (Array.isArray(loaded)) {
    loaded.forEach(r => {
      if (!combined.some(c => c.id === r.id || (c.studentEmail === r.studentEmail && c.eventName === r.eventName))) {
        combined.unshift(r);
      }
    });
  }

  allRegistrations = combined;

  updateStatistics(loaded);
  renderRegistrationsTable();
}

function updateStatistics(loaded) {
  const totalCounterEl = document.getElementById('totalRegCounter');
  const thisWeekCounterEl = document.getElementById('thisWeekCounter');

  let totalCount = 124;
  let thisWeekCount = 42;

  if (Array.isArray(loaded) && loaded.length > 0) {
    totalCount = 124 + loaded.length;

    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    let recentCount = 0;
    loaded.forEach(r => {
      const dateVal = r.timestamp || r.registeredOn;
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d) && d >= oneWeekAgo) {
          recentCount++;
        }
      }
    });
    thisWeekCount = 42 + recentCount;
  }

  if (totalCounterEl) totalCounterEl.textContent = totalCount;
  if (thisWeekCounterEl) thisWeekCounterEl.textContent = thisWeekCount;
}

function renderRegistrationsTable() {
  const tbody = document.getElementById('studentRegistrationsTbody');
  if (!tbody) return;

  if (allRegistrations.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-5 text-muted">
          <p class="mb-0">No student registrations found.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = allRegistrations.map(r => {
    const rawName = (r.studentName || 'Student').trim();
    const nameParts = rawName.split(/\s+/);
    const initials = nameParts.length > 1
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : rawName.slice(0, 2).toUpperCase();

    let nameHtml = '';
    if (nameParts.length > 1) {
      nameHtml = `<span class="name-line">${escapeHtml(nameParts[0])}</span><span class="name-line">${escapeHtml(nameParts.slice(1).join(' '))}</span>`;
    } else {
      nameHtml = `<span class="name-line">${escapeHtml(nameParts[0])}</span>`;
    }

    return `
      <tr>
        <td>
          <div class="student-cell-content">
            <span class="student-avatar">${escapeHtml(initials)}</span>
            <span class="student-name">${nameHtml}</span>
          </div>
        </td>
        <td><span class="col-enrollment">${escapeHtml(r.enrollmentNo || 'EN2021001')}</span></td>
        <td><span class="col-email">${escapeHtml(r.studentEmail || 'student@marwadiuniversity.ac.in')}</span></td>
        <td><span class="col-dept">${escapeHtml(r.department || 'General')}</span></td>
        <td><span class="col-event">${escapeHtml(r.eventName)}</span></td>
        <td><span class="col-date">${escapeHtml(r.registeredOn || 'Feb 10, 2027')}</span></td>
      </tr>
    `;
  }).join('');
}

function setupLogout() {
  document.querySelectorAll('#facultyLogoutBtn, #facultyLogoutBtnMobile, .faculty-logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.setItem('campusfest_logged_out', 'true');
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
