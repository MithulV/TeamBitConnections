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
// A helper component to render the correct home page based on role
const RoleBasedHome = () => {
  const { role } = useAuthStore();

  switch (role) {
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
  const { id } = useAuthStore();
  const location = useLocation();

  // Define routes where navbar should be hidden
  const hideNavbarRoutes = ["/login", "/register"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  // Online status tracking - ping server every 10 seconds
  useEffect(() => {
    if (!id) return;

    const pingInterval = setInterval(async () => {
      if (navigator.onLine) {
        try {
          await axios.post(
            `http://localhost:8000/api/user/ping/${id}`,
            {},
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        } catch (error) {
          console.error("Ping failed:", error);
        }
      }
    }, 10000); // 10 seconds

    return () => clearInterval(pingInterval);
  }, [id]); // Added id to dependencies

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
