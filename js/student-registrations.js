

let allRegistrations = [];
let searchQuery = '';
let departmentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  checkFacultyAuth();
  loadAllRegistrations();
  setupFilters();
  setupExportCsv();
  setupLogout();
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
    window.location.href = 'login.html';
    return null;
  }
  return faculty;
}

function loadAllRegistrations() {
  const raw = localStorage.getItem('campusfest_registrations');
  let loaded = raw ? JSON.parse(raw) : [];

const defaultRoster = [
    {
      id: 'reg-std-1',
      studentName: 'John Doe',
      enrollmentNo: 'EN2021001',
      studentEmail: 'john.doe@marwadiuniversity.ac.in',
      department: 'Computer Science',
      eventName: 'Tech Symposium 2024',
      registeredOn: 'Oct 12, 2023'
    },
    {
      id: 'reg-std-2',
      studentName: 'Alice Smith',
      enrollmentNo: 'EN2021045',
      studentEmail: 'alice.s@marwadiuniversity.ac.in',
      department: 'Electrical Eng.',
      eventName: 'Robotics Workshop',
      registeredOn: 'Oct 14, 2023'
    },
    {
      id: 'reg-std-3',
      studentName: 'Robert Johnson',
      enrollmentNo: 'EN2020112',
      studentEmail: 'r.johnson@marwadiuniversity.ac.in',
      department: 'Mechanical Eng.',
      eventName: 'Annual Sports Meet',
      registeredOn: 'Oct 15, 2023'
    },
    {
      id: 'reg-std-4',
      studentName: 'Emma Williams',
      enrollmentNo: 'EN2022088',
      studentEmail: 'emma.w@marwadiuniversity.ac.in',
      department: 'Civil Eng.',
      eventName: 'Design Thinking Seminar',
      registeredOn: 'Oct 15, 2023'
    },
    {
      id: 'reg-std-5',
      studentName: 'Michael Brown',
      enrollmentNo: 'EN2021077',
      studentEmail: 'mbrown@marwadiuniversity.ac.in',
      department: 'Computer Science',
      eventName: 'Hackathon 2024',
      registeredOn: 'Oct 16, 2023'
    }
  ];

const combined = [...defaultRoster];
  loaded.forEach(r => {
    if (!combined.some(c => c.id === r.id || (c.studentEmail === r.studentEmail && c.eventName === r.eventName))) {
      combined.unshift(r);
    }
  });

  allRegistrations = combined;

  const counterEl = document.getElementById('totalRegCounter');
  if (counterEl) counterEl.textContent = allRegistrations.length > 5 ? allRegistrations.length : 124;

  renderRegistrationsTable();
}

function setupFilters() {
  const searchInput = document.getElementById('regSearchInput');
  const deptSelect = document.getElementById('deptFilterSelect');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderRegistrationsTable();
    });
  }

  if (deptSelect) {
    deptSelect.addEventListener('change', (e) => {
      departmentFilter = e.target.value;
      renderRegistrationsTable();
    });
  }
}

function renderRegistrationsTable() {
  const tbody = document.getElementById('studentRegistrationsTbody');
  if (!tbody) return;

  const filtered = allRegistrations.filter(r => {
    const matchesDept = departmentFilter === 'all' || 
      (r.department && r.department.toLowerCase() === departmentFilter.toLowerCase());

    const matchesSearch = !searchQuery ||
      (r.studentName && r.studentName.toLowerCase().includes(searchQuery)) ||
      (r.enrollmentNo && r.enrollmentNo.toLowerCase().includes(searchQuery)) ||
      (r.studentEmail && r.studentEmail.toLowerCase().includes(searchQuery)) ||
      (r.eventName && r.eventName.toLowerCase().includes(searchQuery));

    return matchesDept && matchesSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-5 text-muted">
          <i class="bi bi-person-x" style="font-size: 2rem;"></i>
          <p class="mt-2 mb-0">No matching student registrations found.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((r, i) => {
    const parts = (r.studentName || 'Student').split(' ');
    const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
    const chipClasses = ['chip-bg-1', 'chip-bg-2', 'chip-bg-3', 'chip-bg-4', 'chip-bg-5'];
    const chipClass = chipClasses[i % chipClasses.length];

    return `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <span class="avatar-initials-badge ${chipClass}">${escapeHtml(initials)}</span>
            <span class="fw-semibold text-dark">${escapeHtml(r.studentName)}</span>
          </div>
        </td>
        <td><code>${escapeHtml(r.enrollmentNo || 'CS2024001')}</code></td>
        <td class="text-muted">${escapeHtml(r.studentEmail || 'student@university.edu')}</td>
        <td><span class="badge bg-light text-dark border">${escapeHtml(r.department || 'General')}</span></td>
        <td class="fw-semibold text-dark">${escapeHtml(r.eventName)}</td>
        <td class="text-muted">${escapeHtml(r.registeredOn || 'Recent')}</td>
      </tr>
    `;
  }).join('');
}

function setupExportCsv() {
  const btn = document.getElementById('exportCsvBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    let csvContent = 'Student Name,Enrollment No,Email,Department,Event Name,Registration Date\n';
    allRegistrations.forEach(r => {
      csvContent += `"${r.studentName}","${r.enrollmentNo}","${r.studentEmail}","${r.department}","${r.eventName}","${r.registeredOn}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'campusfest_student_registrations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

function setupLogout() {
  document.querySelectorAll('#facultyLogoutBtn, #facultyLogoutBtnMobile, .faculty-logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('campusfest_current_user');
      window.location.href = 'index.html';
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
