<<<<<<< HEAD
# CampusFest – College Event Registration System

CampusFest is a comprehensive, responsive web-based event registration and management system tailored for university campuses. It streamlines event discovery, registration, and communication for students while giving faculty administrators powerful tools to organize, edit, and track events and announcements.

---

## 🌟 Key Features

### For Students (`@collegename.ac.in`)
- **Event Discovery & Filtering:** Browse upcoming cultural, technical, academic, and sports events with live keyword search and category filtering.
- **Detailed Event Information:** View event descriptions, venue locations, registration deadlines, seat limits, and faculty coordinators.
- **One-Click Event Registration:** Register for events with instant feedback and conflict detection.
- **My Registrations:** View registered events, track attendance status, download confirmation passes, or cancel registrations.
- **Personalized Student Dashboard:** Quick overview of upcoming registered events, total registrations, and personalized event suggestions.
- **Student Profile Management:** Update student contact information, department, graduation year, and interests.
- **Real-Time Notifications:** Receive notifications for event schedule updates, registration reminders, and new campus announcements.

### For Faculty Administrators (`@collegename.edu.in`)
- **Role Detection:** Automatic detection of faculty vs. student roles based on institutional email domains upon login.
- **Faculty Dashboard:** Live metrics showing total events, active registrations, capacity utilization, and recent registration activity.
- **Manage Events:** Comprehensive dashboard to view, search, filter, and control campus events.
- **Create & Edit Events:** Intuitive form to create new events or update existing event schedules, descriptions, categories, capacities, and banner images.
- **Announcements Portal:** Broadcast campus-wide notices and important alerts to the student community.
- **Student Registrations Log:** Track attendee rosters with real-time capacity monitoring and export capabilities.
- **Faculty Profile Management:** Manage faculty credentials, department affiliation, and coordinator settings.

---

## 📁 Project Folder Structure

```
CampusFest/
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── css/
│   ├── index.css
│   ├── about.css
│   ├── login.css
│   ├── register.css
│   ├── student-dashboard.css
│   ├── student-profile.css
│   ├── events.css
│   ├── event-detail.css
│   ├── my-registration.css
│   ├── student-about.css
│   ├── notifications.css
│   ├── faculty-dashboard.css
│   ├── faculty-profile.css
│   ├── manage-events.css
│   ├── add-edit-event.css
│   ├── announcements.css
│   └── student-registrations.css
│
├── js/
│   ├── index.js
│   ├── about.js
│   ├── login.js
│   ├── register.js
│   ├── student-dashboard.js
│   ├── student-profile.js
│   ├── events.js
│   ├── event-detail.js
│   ├── my-registration.js
│   ├── student-about.js
│   ├── notifications.js
│   ├── faculty-dashboard.js
│   ├── faculty-profile.js
│   ├── manage-events.js
│   ├── add-edit-event.js
│   ├── announcements.js
│   └── student-registrations.js
│
├── index.html
├── about.html
├── login.html
├── register.html
├── student-dashboard.html
├── student-profile.html
├── events.html
├── event-detail.html
├── my-registration.html
├── student-about.html
├── notifications.html
├── faculty-dashboard.html
├── faculty-profile.html
├── manage-events.html
├── add-edit-event.html
├── announcements.html
├── student-registrations.html
│
└── README.md
```

---

## 🛠️ Technology Stack

- **HTML5:** Semantic HTML structure across all public, student, and faculty portals.
- **CSS3:** Custom scoped modular stylesheets in `css/`, utilizing CSS variables, responsive flexbox/grid, and smooth transitions.
- **Bootstrap 5.3.2:** Responsive grid system, mobile navigation offcanvas, modals, and utilities.
- **Bootstrap Icons 1.11.3:** Vector icon set for interface controls.
- **Vanilla JavaScript (ES6+):** Clean client-side state handling and interactivity located in `js/`.
- **LocalStorage API:** Client-side persistence for user authentication sessions, event records, user profiles, announcements, and registrations without requiring backend servers.

---

## 🔐 Authentication & Role Detection

CampusFest uses domain-based email detection to differentiate between user roles:

| Role | Email Domain Pattern | Redirect Target |
| :--- | :--- | :--- |
| **Student** | `*@collegename.ac.in` | `student-dashboard.html` |
| **Faculty / Admin** | `*@collegename.edu.in` | `faculty-dashboard.html` |

### Sample Credentials for Testing
- **Student Account:**
  - Email: `student@collegename.ac.in`
  - Password: `Password@123`
- **Faculty Account:**
  - Email: `faculty@collegename.edu.in`
  - Password: `Password@123`

---

## 🚀 How to Run the Project

1. Clone or download this repository to your local machine.
2. Open `index.html` directly in any modern web browser (Chrome, Edge, Firefox, Safari), or use a lightweight local server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using Node.js (npx serve / live-server)
   npx serve .
   ```
3. Navigate to `http://localhost:8000` (or `index.html`) in your browser to experience CampusFest.
=======
# CampusFest
CampusFest is a responsive college event registration system built using HTML5, CSS3, Bootstrap, and JavaScript. Its main purpose is to simplify event management. Students can explore events, register, and manage profiles, while faculty can add, edit, and delete events, track registrations, and publish announcements through separate dashboards.
>>>>>>> 8786d1e62cb78a27eb7758bbd36f0a97bc8bbb94
