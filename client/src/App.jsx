import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CourseCatalog from "./pages/lms/CourseCatalog";
import CoursePlayer from "./pages/lms/CoursePlayer";
import MyLearning from "./pages/lms/MyLearning";
import EnrollClass from "./pages/lms/EnrollClass";
import CourseManagement from "./pages/admin/CourseManagement";
import AdministrativeConfigs from "./pages/admin/AdministrativeConfigs";
import HR from "./pages/dashboard/HR";
import Settings from "./pages/dashboard/Settings";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

// Public Route wrapper (redirects to dashboard if already logged in, optional)
const PublicOnlyRoute = ({ children }) => {
  const { loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  // Allow access to public pages even if logged in, but for Login page specifically we might want to redirect
  return children;
};

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          {/* Public Routes */}
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
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="lms" element={<MyLearning />} />
            <Route path="lms/course/:id" element={<CoursePlayer />} />
            <Route path="enroll" element={<EnrollClass />} />
            <Route
              path="attendance"
              element={
                <div className="p-4">
                  <h2 className="text-2xl font-bold">Attendance</h2>
                  <p>Coming Soon</p>
                </div>
              }
            />
            <Route
              path="subscription"
              element={
                <div className="p-4">
                  <h2 className="text-2xl font-bold">Subscription</h2>
                  <p>Coming Soon</p>
                </div>
              }
            />
            <Route
              path="timetable"
              element={
                <div className="p-4">
                  <h2 className="text-2xl font-bold">Time Table</h2>
                  <p>Coming Soon</p>
                </div>
              }
            />
            <Route path="admin/courses" element={<CourseManagement />} />
            <Route path="admin/configs" element={<AdministrativeConfigs />} />
            <Route path="hr" element={<HR />} />
            <Route
              path="finance"
              element={
                <div className="p-4">
                  <h2 className="text-2xl font-bold">Finance</h2>
                  <p>Coming Soon</p>
                </div>
              }
            />
            <Route
              path="students"
              element={
                <div className="p-4">
                  <h2 className="text-2xl font-bold">Students</h2>
                  <p>Coming Soon</p>
                </div>
              }
            />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
