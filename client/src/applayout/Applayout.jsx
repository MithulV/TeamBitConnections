import React, { useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/NavBar/Navbar";
import Login from "../pages/Login/Login";
import UserHome from "../pages/User/UserHome";
import Admin from "../pages/Admin/Admin";
import MiddleManHome from "../pages/MiddleMan/MiddleManHome";
import MiddleManRecords from "../pages/MiddleMan/MiddleManRecords";
import MiddleManTasks from "../pages/MiddleMan/MiddleManTasks";
import PrivateRoute from "../pages/ProtectedRoutes/PrivateRoutes";
import { useAuthStore } from "../store/AuthStore";
import UserEntries from "../pages/User/UserEntries";
import ProfileView from "../pages/MiddleMan/ProfileView";
import DetailsInput from "../components/Forms/DetailsInput";
import VisitingCardDetails from "../pages/MiddleMan/VisitingCardDetails";
import UserAssignments from "../pages/User/UserAssignments";
import TaskAssignments from "../pages/Admin/TaskAssignments";
import CameraInput from "../components/Forms/CameraInput";
import FormInput from "../components/Forms/FormInput";
import EventDetails from "../pages/User/EventDetails";
import axios from "axios";
import Referral from "../pages/User/Referral";
import ReferralSignup from "../pages/User/ReferralSignup";
import ContactNetworkAnalysis from "../pages/Admin/ContactNetworkAnalysis";
import api from "../utils/axios";

// A helper component to render the correct home page based on role
const RoleBasedHome = () => {
  const { user } = useAuthStore();

  if (!user || !user.role) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case "user":
      return <UserHome />;
    case "cata":
    case "catb":
    case "catc":
      return <MiddleManHome />;
    case "admin":
      return <Admin />;
    default:
      return <Navigate to="/login" />;
  }
};

// Admin-only route wrapper
const AdminRouteWrapper = ({ children }) => {
  const { role } = useAuthStore();
  if (role !== "admin") {
    return <Navigate to="/" />;
  }
  return children;
};

// Wrapper component to protect the verify-records route
const MiddleManRoutesWrapper = ({ children }) => {
  const { role } = useAuthStore();
  const allowedRoles = ["cata", "catb", "catc"];

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }
  return children;
};

function Applayout() {
  const { id, fetchMe, loading, isAuthenticated, clearAuth } = useAuthStore();
  const location = useLocation();

  // Combined useEffect for authentication check and online status tracking
  useEffect(() => {
    // Check authentication on app load with timeout
    const checkAuth = async () => {
      try {
        await fetchMe();
      } catch (error) {
        // No valid session found
      }
    };

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      clearAuth();
    }, 10000); // 10 second timeout

    checkAuth().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, [fetchMe, clearAuth]);

  // Online status tracking - ping server every 10 seconds
  useEffect(() => {
    if (!id) return;

    const pingInterval = setInterval(async () => {
      if (navigator.onLine) {
        try {
          await api.post(`/api/user/ping/${id}`);
        } catch (error) {
          console.error("Ping failed:", error);
        }
      }
    }, 10000); // 10 seconds

    return () => clearInterval(pingInterval);
  }, [id]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
          <p className="mt-1 text-xs text-gray-400">
            If this takes too long, the server might be down
          </p>
        </div>
      </div>
    );
  }

  // Define routes where navbar should be hidden
  const hideNavbarRoutes = ["/login", "/register"];
  const shouldShowNavbar =
    !hideNavbarRoutes.includes(location.pathname) && isAuthenticated;

  return (
    <div className="h-screen md:flex">
      {shouldShowNavbar && <Navbar />}
      <main
        className={`w-full h-screen flex-1 overflow-x-hidden overflow-y-auto ${
          shouldShowNavbar ? "md:pt-0" : ""
        }`}
      >
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<ReferralSignup />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<RoleBasedHome />} />
            <Route
              path="/verify-records"
              element={
                <MiddleManRoutesWrapper>
                  <MiddleManRecords />
                </MiddleManRoutesWrapper>
              }
            />
            <Route
              path="/analysis"
              element={
                <AdminRouteWrapper>
                  <ContactNetworkAnalysis />
                </AdminRouteWrapper>
              }
            />
            <Route path="/tasks" element={<MiddleManTasks />} />
            <Route path="/profile/:id" element={<ProfileView />} />
            <Route path="/edit/:id" element={<DetailsInput />} />
            <Route
              path="/visiting-card-details/:id"
              element={<VisitingCardDetails />}
            />
            <Route path="/entries" element={<UserEntries />} />
            <Route path="/assigned" element={<UserAssignments />} />

            {/* Admin-only route for task assignments */}
            <Route
              path="/task-assignments"
              element={
                <AdminRouteWrapper>
                  <TaskAssignments />
                </AdminRouteWrapper>
              }
            />

            {/* Admin-only route for records (MiddleManHome content) */}
            <Route
              path="/all-entries"
              element={
                <AdminRouteWrapper>
                  <MiddleManHome />
                </AdminRouteWrapper>
              }
            />
            <Route path="/refer" element={<Referral />} />
            <Route path="/camera-input" element={<CameraInput />} />
            <Route path="/form-input" element={<FormInput />} />
            <Route path="/details-input" element={<DetailsInput />} />
            <Route path="/event-details" element={<EventDetails />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default Applayout;
