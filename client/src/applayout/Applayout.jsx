import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Login from '../pages/Login';
import UserHome from '../pages/UserHome';
import Admin from '../pages/admin';
import MiddleManHome from '../pages/MiddleManHome';
import MiddleManRecords from '../pages/MiddleManRecords';
import MiddleManTasks from '../pages/MiddleManTasks';
import PrivateRoute from '../pages/PrivateRoutes';
import { useAuthStore } from '../store/AuthStore';
import UserEntries from '../pages/UserEntries';
import ProfileView from '../pages/ProfileView';
import DetailsInput from '../components/DetailsInput';
import VisitingCardDetails from '../pages/VisitingCardDetails';
import UserAssignments from '../pages/UserAssignments';
import TaskAssignments from '../pages/TaskAssignments';
// A helper component to render the correct home page based on role
const RoleBasedHome = () => {
    const { role } = useAuthStore();

    switch (role) {
        case 'user':
            return <UserHome />;
        case 'cata':
        case 'catb':
        case 'catc':
            return <MiddleManHome />;
        case 'admin':
            return <Admin />;
        default:
            // If role is not matched, redirect to login
            return <Navigate to="/login" />;
    }
};

// A helper component for routes accessible only by 'cata', 'catb', 'catc'
const MiddleManRoutes = () => {
    const { role } = useAuthStore();
    const allowedRoles = ['cata', 'catb', 'catc'];

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" />; // Redirect if not the correct role
    }

    return (
        <Routes>
            <Route path="/verify-records" element={<MiddleManRecords />} />
        </Routes>
    );
};

// Admin-only route wrapper
const AdminRouteWrapper = ({ children }) => {
    const { role } = useAuthStore();

    if (role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};

// Wrapper component to protect the verify-records route
const MiddleManRoutesWrapper = ({ children }) => {
    const { role } = useAuthStore();
    const allowedRoles = ['cata', 'catb', 'catc'];

    if (!allowedRoles.includes(role)) {
        // Redirect to their respective home page if they try to access a forbidden URL
        return <Navigate to="/" />;
    }
    return children;
};

function Applayout() {
    return (
        <div className='h-screen flex'>
            <Navbar />
            <main className='w-full h-screen flex-1 overflow-x-hidden overflow-y-auto'>
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<RoleBasedHome />} />
                        <Route path="/verify-records" element={
                            <MiddleManRoutesWrapper>
                                <MiddleManRecords />
                            </MiddleManRoutesWrapper>
                        } />
                        <Route path="/tasks" element={<MiddleManTasks />} />
                        <Route path="/profile/:id" element={<ProfileView />} />
                        <Route path="/edit/:id" element={<DetailsInput />} />
                        <Route path="/visiting-card-details/:id" element={<VisitingCardDetails />} />
                        <Route path="/entries" element={<UserEntries />} />
                        <Route path='/assigned' element={<UserAssignments />} />

                        {/* Admin-only route for task assignments */}
                        <Route path="/task-assignments" element={
                            <AdminRouteWrapper>
                                <TaskAssignments />
                            </AdminRouteWrapper>
                        } />
                    </Route>

                    {/* Fallback route to redirect to home if logged in, or login if not */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </div>
    );
}


export default Applayout;
