import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import CourseCatalog from "./pages/lms/CourseCatalog";
import ForgotPassword from "./components/ForgotPassword";

// Dashboard Pages
import Dashboard from "./pages/Dashboard";
import MyLearning from "./pages/lms/MyLearning";
import CoursePlayer from "./pages/lms/CoursePlayer";
import EnrollClass from "./pages/lms/EnrollClass";
import CourseManagement from "./pages/admin/CourseManagement";
import AdministrativeConfigs from "./pages/admin/AdministrativeConfigs";
import HR from "./pages/dashboard/HR";
import Settings from "./pages/dashboard/Settings";
import Students from "./pages/dashboard/Students";
import ParentManagement from "./pages/admin/ParentManagement";
import ParentDashboard from "./pages/parent/ParentDashboard";
import RegisterChild from "./pages/parent/RegisterChild";
import Attendance from "./pages/attendance/Attendance";
import Profile from "./pages/profile/Profile";
import Finance from "./pages/Finance";
import Announcement from "./pages/dashboard/Announcement";
import Expenses from "./pages/expenses/Expenses";

// Leave
import LeaveRequestList from "./components/LeaveRequestList";

// ---------------------------
// Private Route Wrapper
// ---------------------------
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return user ? children : <Navigate to="/login" replace />;
};

// ---------------------------
// Leave Role Logic
// ---------------------------
function LeaveRequestOrForm() {
  const { user } = useAuth();
  if (!user) return null;

  const isAdmin = user.role?.toLowerCase() === "admin";

  return (
    <LeaveRequestList
      showApplyButton={!isAdmin}
      onlyMine={!isAdmin}
    />
  );
}

// ---------------------------
// Dashboard Redirect Logic
// ---------------------------
const DashboardRedirect = () => {
  const { user } = useAuth();

  if (user?.role === "parent") {
    return <Navigate to="/dashboard/parent-dashboard" replace />;
  }

  return <Dashboard />;
};

// ---------------------------
// Main App
// ---------------------------
function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>

          {/* ================= PUBLIC ROUTES ================= */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />

            <Route
              path="/about"
              element={
                <div className="p-20 text-center">
                  About Us Page (Coming Soon)
                </div>
              }
            />

            <Route
              path="/contact"
              element={
                <div className="p-20 text-center">
                  Contact Page (Coming Soon)
                </div>
              }
            />

            <Route
              path="/courses"
              element={
                <div className="p-20 text-center">
                  <h1 className="text-2xl font-bold mb-4">All Courses</h1>
                  <CourseCatalog />
                </div>
              }
            />

            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ================= AUTH ================= */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} />
          </Route>

          {/* ================= DASHBOARD ROUTES ================= */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardRedirect />} />

            {/* Announcements */}
            <Route path="announcements" element={<Announcement />} />

            {/* LMS */}
            <Route path="lms" element={<MyLearning />} />
            <Route path="lms/course/:id" element={<CoursePlayer />} />
            <Route path="enroll" element={<EnrollClass />} />

            {/* Parent */}
            <Route path="parent-dashboard" element={<ParentDashboard />} />
            <Route
              path="parent/register-child"
              element={<RegisterChild />}
            />

            {/* Attendance */}
            <Route path="attendance" element={<Attendance />} />

            {/* Admin */}
            <Route path="admin/courses" element={<CourseManagement />} />
            <Route path="admin/configs" element={<AdministrativeConfigs />} />
            <Route path="admin/parents" element={<ParentManagement />} />

            {/* HR */}
            <Route path="hr" element={<HR />} />
            <Route path="finance" element={<Finance />} />
            <Route path="expenses" element={<Expenses />} />

            {/* Students */}
            <Route path="students" element={<Students />} />

            {/* Profile */}
            <Route path="student/profile" element={<Profile />} />
            <Route path="coach/profile" element={<Profile />} />
            <Route path="hr/profile" element={<Profile />} />

            {/* Settings */}
            <Route path="settings" element={<Settings />} />

            {/* Leave */}
            <Route path="leave-request" element={<LeaveRequestOrForm />} />
          </Route>

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;