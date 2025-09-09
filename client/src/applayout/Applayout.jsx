import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Login from "../pages/Login";
import UserHome from "../pages/userHome";
import Admin from "../pages/Admin";
import MiddleManHome from "../pages/MiddleManHome";
import MiddleManRecords from "../pages/MiddleManRecords";
import MiddleManTasks from "../pages/MiddleManTasks";
import PrivateRoute from "../pages/PrivateRoutes";
import { useAuthStore } from "../store/AuthStore";
import UserEntries from "../pages/UserEntries";
import ProfileView from "../pages/ProfileView";
import DetailsInput from "../components/DetailsInput";
import VisitingCardDetails from "../pages/VisitingCardDetails";
import UserAssignments from "../pages/UserAssignments";
import TaskAssignments from "../pages/TaskAssignments";
import CameraInput from "../components/CameraInput";
import FormInput from "../components/FormInput";
import axios from "axios";

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
          console.log("Ping successful for user:", id);
        } catch (error) {
          console.error("Ping failed:", error);
        }
      }
    }, 10000); // 10 seconds

    return () => clearInterval(pingInterval);
  }, []); // Added id to dependencies

  return (
    <div className="h-screen flex">
      <Navbar />
      <main className="w-full h-screen flex-1 overflow-x-hidden overflow-y-auto">
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

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

            <Route path="/camera-input" element={<CameraInput />} />
            <Route path="/form-input" element={<FormInput />} />
            <Route path="/details-input" element={<DetailsInput />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default Applayout;
