# College Info Hub - Frontend

A comprehensive platform connecting students, alumni, and faculty to foster mentorship, job opportunities, and community engagement. Built with React, Vite, and Tailwind CSS.

## Features

### 🎓 For Students
- **Personalized Dashboard**: Overview of recent activities, stats, and feed.
- **Job Portal**: Browse and apply for jobs/internships posted by alumni/partners. Filters by type, location, and role.
- **Mentorship**: Find and connect with alumni mentors for career guidance. View mentor profiles and request sessions.
- **Feed**: Stay updated with community posts, news, and success stories.
- **Profile Management**: Customizable student profile with skills, education, and resume.

### 🧑‍🎓 For Alumni & Faculty
- **Dedicated Dashboard**: Manage mentorship requests and view contribution stats.
- **Mentorship Hub**: Accept/decline mentorship requests and guide students.
- **Job Posting**: Create and manage job opportunities for the community.
- **Community Engagement**: Post updates, share insights, and interact with students.

### 📅 Events & Community
- **Event Discovery**: targeted events for Students and Alumni (Academic, Social, Career, Sports).
- **RSVP System**: Interactive attendance tracking with real-time updates.
- **Audience Targeting**: Events can be exclusive to Students, Alumni, or open to All.

### 🛡️ For Admins
- **Admin Console**: Centralized control panel for platform management.
- **User Directory**: Consolidated view of all Students and Alumni with filtering and block/unblock capabilities.
- **Event Management**: Create, Edit, and Delete events with precise audience targeting.
- **Content Moderation**: Review and approve/reject jobs and posts.
- **Reports Dashboard**: Handle user reports for inappropriate content.
- **System Settings**: Configure site metadata and maintenance mode.

## Tech Stack

- **Framework**: [React](https://react.dev/) v19 + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Routing**: [React Router](https://reactrouter.com/) v7
- **Authentication**: JWT-based (stored in localStorage)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Motion**: [Framer Motion](https://www.framer.com/motion/)

## Configuration

### Mock vs Real Backend
The application currently supports a toggle between a real backend and a mock API adapter for development/testing purposes.

To switch between modes, open `src/services/api.js` and modify the `USE_MOCK` constant:

```javascript
// src/services/api.js
const USE_MOCK = true; // Set to 'true' for Mock Data, 'false' for Real Backend
```

When `USE_MOCK` is `true`, the application intercepts Axios requests and returns data from `src/services/mock/`.

## Architecture & Project Structure

### Key Directories
```
src/
├── app/            # Redux store configuration (store.js)
├── components/     # Reusable UI components (Layouts, Guards, UI Kit)
│   ├── ProtectedRoute.jsx  # Role-Based Access Control wrapper
│   └── ...
├── features/       # Redux slices (State logic by domain)
│   ├── auth/       # Authentication slice (login, register, user state)
│   ├── jobs/       # Jobs slice (listing, applying)
│   ├── mentorship/ # Mentorship slice (mentors, requests)
│   └── posts/      # Feed posts slice
├── pages/          # Application Pages (Route components)
│   ├── admin/      # Admin-specific pages
│   ├── auth/       # Public auth pages
│   ├── dashboard/  # Role-specific dashboards (Student vs Alumni)
│   └── ...
├── services/       # API Services
│   ├── api.js      # Axios instance & Interceptors
│   ├── mock/       # Mock API handlers & data
│   └── mockData.js # Static data for mocking
└── utils/          # Helper functions
```

### Role-Based Access Control (RBAC)
Routes are protected using the `ProtectedRoute` component, which checks the user's role in the Redux state.
- **Public**: Landing, Login, Register.
- **Student**: `/student/*` (Dashboard, Feed, Jobs, Mentorship).
- **Alumni/Faculty**: `/alumni/*` (Dashboard, Feed, Jobs, Mentorship).
- **Admin**: `/admin/*` (Dashboard, Users, Reports).

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "College info hub/frontend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will generally run at `http://localhost:5173`.

4. **Build for production**
   ```bash
   npm run build
   ```

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request