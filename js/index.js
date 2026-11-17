// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  initLocalStorageData();
  renderFeaturedEvents();
});

function initLocalStorageData() {
  const defaultEvents = [
    {
      id: 'evt-1',
      name: 'Annual Tech Symposium',
      category: 'Tech',
      badgeClass: 'badge-tech',
      date: 'February 17, 2027',
      time: '10:00 AM - 4:00 PM',
      venue: 'Main Auditorium',
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
    },
    {
      id: 'evt-2',
      name: 'Global Culture Fest',
      category: 'Culture',
      badgeClass: 'badge-culture',
      date: 'February 18, 2027',
      time: '12:00 PM - 8:00 PM',
      venue: 'Campus Quad',
      description: 'Celebrate diversity with food, music, and performances from student organizations around the world.',
      keyHighlights: [
        'International food street with 25+ cultural stalls.',
        'Traditional dance and acoustic musical acts.',
        'Live student band showcase in the evening.',
        'Cultural attire fashion walk.'
      ],
      organizer: 'Student Union',
      maxParticipants: 1000,
      seatsLeft: 520,
      deadline: 'February 16, 2027',
      image: 'assets/images/culture-fest.jpg',
      status: 'Open'
    },
    {
      id: 'evt-3',
      name: 'Resume Building Workshop',
      category: 'Workshop',
      badgeClass: 'badge-workshop',
      date: 'February 19, 2027',
      time: '02:00 PM - 05:00 PM',
      venue: 'Career Center, Room 204',
      description: 'Get expert advice on crafting a standout resume that will catch the eye of top employers.',
      keyHighlights: [
        '1-on-1 resume review with certified HR recruiters.',
        'ATS optimization tips and portfolio advice.',
        'Mock technical & behavioral interview walkthroughs.',
        'Custom template pack provided to all participants.'
      ],
      organizer: 'Career Placement Cell',
      maxParticipants: 30,
      seatsLeft: 3,
      deadline: 'February 17, 2027',
      image: 'assets/images/resume-workshop.jpg',
      status: 'Almost Full'
    },
    {
      id: 'evt-4',
      name: 'Spring Club Rush & Organization Fair',
      category: 'Social',
      badgeClass: 'badge-social',
      date: 'February 17, 2027',
      time: '12:00 PM - 03:00 PM',
      venue: 'Campus Quad',
      description: 'Discover over 50 campus clubs, student chapters, and sports organizations. Sign up and build your campus network.',
      keyHighlights: [
        'Interactive student association booths.',
        'Free campus fest merchandise and refreshments.',
        'Meet club presidents and leadership teams.',
        'Sign-up raffle giveaways.'
      ],
      organizer: 'Campus Life Committee',
      maxParticipants: 9999,
      seatsLeft: 'Unlimited',
      deadline: 'February 16, 2027',
      image: 'assets/images/club-rush-fair.jpg',
      status: 'Open'
    },
    {
      id: 'evt-5',
      name: 'Intro to Python for Data Science',
      category: 'Workshop',
      badgeClass: 'badge-workshop',
      date: 'February 18, 2027',
      time: '02:00 PM - 05:00 PM',
      venue: 'Lab 3B, Science Center',
      description: 'Hands-on programming session exploring data analysis with Python, NumPy, Pandas, and exploratory charts.',
      keyHighlights: [
        'Interactive Jupyter notebook exercises.',
        'Real-world campus datasets for practice.',
        'Guidance on machine learning basics.',
        'Course completion digital certificate.'
      ],
      organizer: 'Data Science Society',
      maxParticipants: 30,
      seatsLeft: 3,
      deadline: 'February 16, 2027',
      image: 'assets/images/python-workshop.jpg',
      status: 'Almost Full'
    },
    {
      id: 'evt-6',
      name: 'Inter-Collegiate Tournament',
      category: 'Sports',
      badgeClass: 'badge-sports',
      date: 'February 19, 2027',
      time: '10:00 AM - 06:00 PM',
      venue: 'Indoor Stadium',
      description: 'Basketball and Volleyball tournament featuring competing teams from top regional engineering and degree institutes.',
      keyHighlights: [
        'Trophies and medals for podium finishers.',
        'Professional referees and live scorekeeping.',
        'Halftime performances and cheering contest.',
        'Energy drinks and nutrition kits for players.'
      ],
      organizer: 'Sports Council',
      maxParticipants: 200,
      seatsLeft: 80,
      deadline: 'February 17, 2027',
      image: 'assets/images/sports-tournament.svg',
      status: 'Open'
    }
  ];

  if (!localStorage.getItem('campusfest_events')) {
    localStorage.setItem('campusfest_events', JSON.stringify(defaultEvents));
  } else {
    try {
      const stored = JSON.parse(localStorage.getItem('campusfest_events'));
      let modified = false;
      const dateMap = {
        'evt-1': { date: 'February 17, 2027', deadline: 'February 15, 2027' },
        'evt-2': { date: 'February 18, 2027', deadline: 'February 16, 2027' },
        'evt-3': { date: 'February 19, 2027', deadline: 'February 17, 2027' },
        'evt-4': { date: 'February 17, 2027', deadline: 'February 16, 2027' },
        'evt-5': { date: 'February 18, 2027', deadline: 'February 16, 2027' },
        'evt-6': { date: 'February 19, 2027', deadline: 'February 17, 2027' }
      };

      stored.forEach(evt => {
        if (dateMap[evt.id]) {
          if (evt.date !== dateMap[evt.id].date || evt.deadline !== dateMap[evt.id].deadline) {
            evt.date = dateMap[evt.id].date;
            evt.deadline = dateMap[evt.id].deadline;
            modified = true;
          }
        }
        if (evt.id === 'evt-1' && (evt.image.endsWith('.svg') || evt.name === 'Annual Tech Symposium 2024')) {
          evt.name = 'Annual Tech Symposium';
          evt.venue = 'Main Auditorium';
          evt.category = 'Tech';
          evt.image = 'assets/images/tech-symposium.jpg';
          modified = true;
        } else if (evt.id === 'evt-2' && evt.image.endsWith('.svg')) {
          evt.category = 'Culture';
          evt.image = 'assets/images/culture-fest.jpg';
          modified = true;
        } else if (evt.id === 'evt-3' && evt.image.endsWith('.svg')) {
          evt.category = 'Workshop';
          evt.image = 'assets/images/resume-workshop.jpg';
          modified = true;
        }
      });
      if (modified) {
        localStorage.setItem('campusfest_events', JSON.stringify(stored));
      }
    } catch(e) {}
  }

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

  const rawUsers = localStorage.getItem('campusfest_users');
  if (!rawUsers) {
    localStorage.setItem('campusfest_users', JSON.stringify(defaultUsers));
  } else {
    try {
      const existing = JSON.parse(rawUsers);
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

  const defaultRegistrations = [
    {
      id: 'reg-1',
      eventId: 'evt-1',
      eventName: 'Annual Tech Symposium',
      studentName: 'Alex Mercer',
      studentEmail: 'alex.mercer@marwadiuniversity.ac.in',
      enrollmentNo: 'CS2021045',
      department: 'Computer Science',
      date: 'February 17, 2027',
      time: '10:00 AM - 04:00 PM',
      venue: 'Main Auditorium',
      registeredOn: 'Feb 01, 2027',
      status: 'Confirmed'
    },
    {
      id: 'reg-2',
      eventId: 'evt-2',
      eventName: 'Global Culture Fest',
      studentName: 'Alex Mercer',
      studentEmail: 'alex.mercer@marwadiuniversity.ac.in',
      enrollmentNo: 'CS2021045',
      department: 'Computer Science',
      date: 'February 18, 2027',
      time: '12:00 PM - 08:00 PM',
      venue: 'Campus Quad',
      registeredOn: 'Feb 02, 2027',
      status: 'Confirmed'
    },
    {
      id: 'reg-3',
      eventId: 'evt-3',
      eventName: 'Resume Building Workshop',
      studentName: 'Alex Mercer',
      studentEmail: 'alex.mercer@marwadiuniversity.ac.in',
      enrollmentNo: 'CS2021045',
      department: 'Computer Science',
      date: 'February 19, 2027',
      time: '02:00 PM - 05:00 PM',
      venue: 'Career Center, Room 204',
      registeredOn: 'Feb 03, 2027',
      status: 'Confirmed'
    },
    {
      id: 'reg-4',
      eventId: 'evt-1',
      eventName: 'Annual Tech Symposium',
      studentName: 'John Doe',
      studentEmail: 'john.doe@marwadiuniversity.ac.in',
      enrollmentNo: 'EN2021001',
      department: 'Computer Science',
      date: 'February 17, 2027',
      time: '10:00 AM - 04:00 PM',
      venue: 'Main Auditorium',
      registeredOn: 'Feb 04, 2027',
      status: 'Confirmed'
    },
    {
      id: 'reg-5',
      eventId: 'evt-5',
      eventName: 'Intro to Python for Data Science',
      studentName: 'Alice Smith',
      studentEmail: 'alice.s@marwadiuniversity.ac.in',
      enrollmentNo: 'EN2021045',
      department: 'Electrical Eng.',
      date: 'February 18, 2027',
      time: '02:00 PM - 05:00 PM',
      venue: 'Lab 3B, Science Center',
      registeredOn: 'Feb 05, 2027',
      status: 'Confirmed'
    },
    {
      id: 'reg-6',
      eventId: 'evt-6',
      eventName: 'Inter-Collegiate Tournament',
      studentName: 'Robert Johnson',
      studentEmail: 'r.johnson@marwadiuniversity.ac.in',
      enrollmentNo: 'EN2020112',
      department: 'Mechanical Eng.',
      date: 'February 19, 2027',
      time: '10:00 AM - 06:00 PM',
      venue: 'Indoor Stadium',
      registeredOn: 'Feb 06, 2027',
      status: 'Confirmed'
    }
  ];

  const rawRegistrations = localStorage.getItem('campusfest_registrations');
  if (!rawRegistrations) {
    localStorage.setItem('campusfest_registrations', JSON.stringify(defaultRegistrations));
  } else {
    try {
      const storedRegs = JSON.parse(rawRegistrations);
      let regUpdated = false;
      storedRegs.forEach(r => {
        if (r.eventId === 'evt-1' && r.date !== 'February 17, 2027') {
          r.date = 'February 17, 2027';
          r.registeredOn = 'Feb 01, 2027';
          regUpdated = true;
        } else if (r.eventId === 'evt-2' && r.date !== 'February 18, 2027') {
          r.date = 'February 18, 2027';
          r.registeredOn = 'Feb 02, 2027';
          regUpdated = true;
        } else if (r.eventId === 'evt-3' && r.date !== 'February 19, 2027') {
          r.date = 'February 19, 2027';
          r.registeredOn = 'Feb 03, 2027';
          regUpdated = true;
        } else if (r.eventId === 'evt-4' && r.date !== 'February 17, 2027') {
          r.date = 'February 17, 2027';
          r.registeredOn = 'Feb 01, 2027';
          regUpdated = true;
        } else if (r.eventId === 'evt-5' && r.date !== 'February 18, 2027') {
          r.date = 'February 18, 2027';
          r.registeredOn = 'Feb 02, 2027';
          regUpdated = true;
        } else if (r.eventId === 'evt-6' && r.date !== 'February 19, 2027') {
          r.date = 'February 19, 2027';
          r.registeredOn = 'Feb 03, 2027';
          regUpdated = true;
        }
      });
      if (regUpdated) {
        localStorage.setItem('campusfest_registrations', JSON.stringify(storedRegs));
      }
    } catch (e) {}
  }

  const defaultNotifs = [
    {
      id: 'notif-1',
      title: 'Registration Confirmed: Annual Tech Symposium',
      message: 'Your spot for the Annual Tech Symposium has been secured. Please arrive 15 minutes early for check-in.',
      time: 'Just now',
      type: 'success',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Venue Change: Coding Bootcamp',
      message: 'The venue for tomorrow\'s Coding Bootcamp has been moved to Lab 3, Engineering Block.',
      time: '2 hours ago',
      type: 'warning',
      read: false
    },
    {
      id: 'notif-3',
      title: 'Call for Volunteers: Annual Art Fest',
      message: 'We are looking for enthusiastic volunteers for the upcoming Art Fest. Sign up now to earn credit hours.',
      time: 'Yesterday',
      type: 'info',
      read: true
    },
    {
      id: 'notif-4',
      title: 'Reminder: Guest Lecture on AI',
      message: 'Don\'t forget the guest lecture on Artificial Intelligence starts in 30 minutes in the Main Auditorium.',
      time: 'Feb 15, 2027',
      type: 'reminder',
      read: true
    }
  ];

  if (!localStorage.getItem('campusfest_notifications')) {
    localStorage.setItem('campusfest_notifications', JSON.stringify(defaultNotifs));
  }

  const defaultAnnouncements = [
    {
      id: 'ann-1',
      title: 'Spring Semester Registration Deadlines',
      relatedEvent: 'General',
      description: 'Please be advised that the final deadline for Spring 2027 course and event registration is approaching. Ensure all students have finalized their registrations.',
      date: 'Feb 10, 2027',
      badge: 'General'
    },
    {
      id: 'ann-2',
      title: 'Venue Change: Tech Symposium Keynote',
      relatedEvent: 'Annual Tech Symposium',
      description: 'Due to overwhelming response, the opening keynote for the Annual Tech Symposium has been moved to the Main Auditorium.',
      date: 'Feb 12, 2027',
      badge: 'Related: Annual Tech Symposium'
    }
  ];

  if (!localStorage.getItem('campusfest_announcements')) {
    localStorage.setItem('campusfest_announcements', JSON.stringify(defaultAnnouncements));
  }
}

function renderFeaturedEvents() {
  const container = document.getElementById('featuredEventsContainer');
  if (!container) return;

  const rawEvents = localStorage.getItem('campusfest_events');
  const events = rawEvents ? JSON.parse(rawEvents) : [];
  const featured = events.slice(0, 3);

  if (featured.length === 0) {
    container.innerHTML = `<div class="col-12 text-center py-4 text-muted">No featured events currently available.</div>`;
    return;
  }

  container.innerHTML = featured.map(evt => {
    let badgeClass = 'badge-tech';
    let badgeLabel = 'Tech';
    const cat = (evt.category || '').toLowerCase();
    if (cat.includes('cult')) {
      badgeClass = 'badge-culture';
      badgeLabel = 'Culture';
    } else if (cat.includes('work')) {
      badgeClass = 'badge-workshop';
      badgeLabel = 'Workshop';
    } else if (cat.includes('soc')) {
      badgeClass = 'badge-social';
      badgeLabel = 'Social';
    } else if (cat.includes('sport')) {
      badgeClass = 'badge-sports';
      badgeLabel = 'Sports';
    } else {
      badgeClass = 'badge-tech';
      badgeLabel = 'Tech';
    }

    return `
      <div class="col-md-4">
        <div class="event-card" onclick="window.location.href='event-detail.html?id=${encodeURIComponent(evt.id)}'">
          <div class="event-media">
            <img src="${evt.image || 'assets/images/tech-symposium.jpg'}" alt="${escapeHtml(evt.name)}">
            <span class="event-badge ${badgeClass}">${escapeHtml(badgeLabel)}</span>
          </div>
          <div class="event-body">
            <h3 class="event-title">${escapeHtml(evt.name)}</h3>
            <div class="event-meta">
              <div class="event-meta-item">
                <i class="bi bi-calendar3"></i>
                <span>${escapeHtml(evt.date || 'TBA')}</span>
              </div>
              <div class="event-meta-item">
                <i class="bi bi-geo-alt"></i>
                <span>${escapeHtml(evt.venue || 'Campus Venue')}</span>
              </div>
            </div>
            <p class="event-desc">${escapeHtml(evt.description || 'Join us for this exciting campus experience.')}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Helper Utilities
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
