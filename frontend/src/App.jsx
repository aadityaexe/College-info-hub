import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
// import DashboardLayout from './components/DashboardLayout'; // Removed
import StudentLayout from './components/StudentLayout';
import AlumniLayout from './components/AlumniLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import LandingPage from './pages/LandingPage';

import FeedPage from './pages/feed/FeedPage';
import JobsPage from './pages/jobs/JobsPage';
import JobDetailPage from './pages/jobs/JobDetailPage';
import MentorshipPage from './pages/mentorship/MentorshipPage';
import MentorProfilePage from './pages/mentorship/MentorProfilePage';
import ProfilePage from './pages/profile/ProfilePage';
import MailPage from './pages/mail/MailPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import AlumniDashboard from './pages/dashboard/AlumniDashboard';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPending from './pages/admin/AdminPending';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminEvents from './pages/admin/AdminEvents';
import EventsPage from './pages/events/EventsPage';

function App() {
  return (
    <Routes>
      {/* Public Routes (Landing & Auth) */}
      <Route element={<Layout />}>
         <Route path="/" element={<LandingPage />} />
         <Route path="/login" element={<LoginPage />} />
         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
         <Route path="/admin/login" element={<AdminLoginPage />} />
         <Route path="/register" element={<RegisterPage />} />
      </Route>
        
      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
         <Route index element={<Navigate to="/student/dashboard" replace />} />
         <Route path="dashboard" element={<StudentDashboard />} />
         <Route path="feed" element={<FeedPage />} />
         <Route path="events" element={<EventsPage />} />
         <Route path="jobs" element={<JobsPage />} />
         <Route path="jobs/:id" element={<JobDetailPage />} />
         <Route path="mentorship" element={<MentorshipPage />} />
         <Route path="mentorship/mentors/:id" element={<MentorProfilePage />} />
         <Route path="mail" element={<MailPage />} />
         <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Alumni Routes */}
      <Route path="/alumni" element={<ProtectedRoute allowedRoles={['alumni', 'faculty']}><AlumniLayout /></ProtectedRoute>}>
         <Route index element={<Navigate to="/alumni/dashboard" replace />} />
         <Route path="dashboard" element={<AlumniDashboard />} />
         <Route path="feed" element={<FeedPage />} />
         <Route path="events" element={<EventsPage />} />
         <Route path="jobs" element={<JobsPage />} />
         <Route path="jobs/:id" element={<JobDetailPage />} />
         <Route path="mentorship" element={<MentorshipPage />} />
         <Route path="mentorship/mentors/:id" element={<MentorProfilePage />} />
         <Route path="mail" element={<MailPage />} />
         <Route path="profile" element={<ProfilePage />} />
      </Route>
        
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="pending" element={<AdminPending />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
