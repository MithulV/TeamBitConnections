import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/AuthStore';
import { ArrowLeft } from 'lucide-react';
import { format, parseISO } from "date-fns";
import Header from '../components/Header';
import BasicDetailCard from '../components/BasicDetailCard';
import DetailsInput from '../components/DetailsInput';
import Alert from '../components/Alert';
import Avatar from '../assets/Avatar.png';

function UserAssignments() {
    const [data, setData] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [addingUser, setAddingUser] = useState(null);
    const [activeView, setActiveView] = useState("formData");
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({
        isOpen: false,
        severity: "success",
        message: "",
    });

    const { id } = useAuthStore();

    const showAlert = (severity, message) => {
        setAlert({
            isOpen: true,
            severity,
            message,
        });
    };

    const closeAlert = () => {
        setAlert((prev) => ({
            ...prev,
            isOpen: false,
        }));
    };

    const getData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8000/api/get-assignment/${id}`);
            console.log("User assignments fetched successfully:", response.data);
            setData(response.data);
        } catch (error) {
            console.error("Error fetching user assignments:", error);
            showAlert("error", "Failed to fetch assignments. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            getData();
        }
    }, [id]);

    const handleAddCancel = () => {
        setIsAdding(false);
        setAddingUser(null);
    };

    const onAdd = async (contact_id) => {
        try {
            const user = data.find((user) => user.contact_id === contact_id);
            console.log("Adding user:", user);
            if (user) {
                setAddingUser(user);
                setIsAdding(true);
            }
        } catch (error) {
            showAlert("error", "Failed to load user data for adding.");
            console.log("Error loading user for add", error);
        }
    };

    const handleAddComplete = async (updatedData) => {
        try {
            if (updatedData && addingUser) {
                console.log("Saving data:", updatedData);
                const response = await axios.put(
                    `http://localhost:8000/api/update-contact/${updatedData.contact_id}`,
                    updatedData
                );
                console.log("Update response:", response);

                // Update the data state
                setData((prevData) =>
                    prevData.map((user) =>
                        user.contact_id === updatedData.contact_id
                            ? { ...user, ...updatedData }
                            : user
                    )
                );

                showAlert(
                    "success",
                    `${updatedData.name} has been successfully updated.`
                );
            }

            // Close the form
            setIsAdding(false);
            setAddingUser(null);
        } catch (error) {
            console.log("Error updating user", error);
            showAlert("error", "Failed to update user. Please try again.");
        }
    };

    const handleDeleteClick = (contact_id) => {
        // Delete functionality if needed
        console.log("Delete clicked for:", contact_id);
        showAlert("info", "Delete functionality not implemented yet.");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading assignments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Alert
                isOpen={alert.isOpen}
                severity={alert.severity}
                message={alert.message}
                onClose={closeAlert}
                position="bottom"
                duration={4000}
            />

            {/* Full Width Header Section */}
            <div className="w-full bg-white shadow-sm">
                <div className="flex items-center justify-between">
                    {/* Left Section - Back Button */}
                    <div className="flex-shrink-0">
                        {isAdding ? (
                            <button
                                onClick={handleAddCancel}
                                className="px-4 py-2 ml-5 flex items-center gap-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                            >
                                <ArrowLeft size={20} />
                                Back
                            </button>
                        ) : (
                            <div></div>
                        )}
                    </div>

                    {/* Right Section - Header always on the right */}
                    <div className="flex-shrink-0">
                        <Header />
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {isAdding && addingUser ? (
                        /* Show DetailsInput when adding */
                        <div className="bg-white rounded-lg shadow-sm">
                            <DetailsInput
                                onBack={handleAddCancel}
                                onSave={handleAddComplete}
                                initialData={addingUser}
                                isAddMode={true}
                                assignToUser={undefined}
                            />
                        </div>
                    ) : (
                        /* Show user cards when not adding */
                        <>
                            {activeView === "formData" ? (
                                <div>
                                    {/* Header Info */}
                                    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                                                <span className="text-sm text-gray-600">
                                                    {data.length} Assigned Contact{data.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <button
                                                onClick={getData}
                                                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                            >
                                                Refresh
                                            </button>
                                        </div>
                                    </div>

                                    {/* Cards Grid */}
                                    {data.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {data.map((participant, index) => (
                                                <BasicDetailCard
                                                    key={participant.contact_id || index}
                                                    name={participant.name}
                                                    phone={participant.phone_number}
                                                    email={participant.email_address}
                                                    event={participant.events?.[0]?.event_name || "N/A"}
                                                    role={participant.events?.[0]?.event_role || "N/A"}
                                                    date={format(
                                                        parseISO(participant.created_at || new Date()),
                                                        "MMMM dd, yyyy"
                                                    )}
                                                    org={participant.events?.[0]?.event_held_organization || "N/A"}
                                                    location={participant.events?.[0]?.event_location || "N/A"}
                                                    profileImage={participant.profileImage || Avatar}
                                                    onDelete={() => handleDeleteClick(participant.contact_id)}
                                                    onType={() => onAdd(participant.contact_id)}
                                                    editOrAdd={"add"}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        /* Empty State */
                                        <div className="text-center py-16">
                                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                                <svg
                                                    className="w-8 h-8 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                No assignments found
                                            </h3>
                                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                                You don't have any contacts assigned to you yet. Check back later or contact your administrator.
                                            </p>
                                            <button
                                                onClick={getData}
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                            >
                                                <svg
                                                    className="w-5 h-5 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                    />
                                                </svg>
                                                Refresh
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserAssignments;
