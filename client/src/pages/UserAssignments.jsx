import api from '../utils/axios';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/AuthStore';
import { ArrowLeft } from 'lucide-react';
import { format, parseISO } from "date-fns";
import Header from '../components/Header';
import BasicDetailCard from '../components/BasicDetailCard';
import DetailsInput from '../components/DetailsInput';
import Alert from '../components/Alert';
import Avatar from '../assets/Avatar.png';

const DeleteConfirmationModal = ({
    isOpen,
    onConfirm,
    onCancel,
    itemName = "this user",
    deleteType = "contact",
    isDeleting = false, // Add isDeleting prop
}) => {
    if (!isOpen) return null;

    const getDeleteMessage = () => {
        switch (deleteType) {
            case "contact":
                return `Are you sure you want to delete ${itemName}? This will remove the contact from your assignments.`;
            case "assignment":
                return `Are you sure you want to remove the assignment for ${itemName}? You will no longer be responsible for updating this contact.`;
            default:
                return `Are you sure you want to delete ${itemName}? This action cannot be undone.`;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur effect */}
            <div
                className="absolute inset-0 bg-black/60 bg-opacity-50 backdrop-blur-sm transition-all duration-300"
                onClick={!isDeleting ? onCancel : undefined} // Prevent closing during deletion
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 animate-fadeIn">
                {/* Header with Material Design styling */}
                <div className="flex items-start gap-3 p-6 pb-4">
                    {/* Warning Icon with circular background */}
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-full flex-shrink-0 mt-1">
                        <svg
                            className="w-6 h-6 text-orange-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-medium text-gray-900 mb-1">
                            Confirm Delete
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    <p className="text-gray-600 text-sm leading-relaxed pl-13">
                        {getDeleteMessage()}
                    </p>
                </div>

                {/* Actions with Material Design button styling */}
                <div className="flex justify-end gap-3 px-6 pb-6">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-6 py-2 text-sm font-medium text-blue-600 bg-transparent border-none rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-6 py-2 text-sm font-medium text-red-600 bg-transparent border-none rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-200 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px]"
                    >
                        {isDeleting ? (
                            <>
                                <svg
                                    className="animate-spin h-4 w-4 text-red-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8z"
                                    ></path>
                                </svg>
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

function UserAssignments() {
    const [data, setData] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [addingUser, setAddingUser] = useState(null);
    const [activeView, setActiveView] = useState("formData");
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false); // Add isDeleting state
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
            const response = await api.get(`/api/get-assignment/${id}`);
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
                const response = await api.put(
                    `/api/update-contact/${updatedData.contact_id}?event_verified=false&contact_status=pending`,
                    updatedData
                );
                console.log("Update response:", response);

                // Update the data state
                setData((prevData)=>prevData.filter(data=>data.contact_id!==updatedData.contact_id));

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

    // Updated handleDeleteClick for assignments
    const handleDeleteClick = (contact_id) => {
        const user = data.find((user) => user.contact_id === contact_id);
        if (user) {
            setUserToDelete({
                id: contact_id,
                assignment_id: user.assignment_id,
                name: user?.name || "this user",
                type: "assignment"
            });
            setShowDeleteModal(true);
        }
    };

    // Updated confirmDelete function with loading state
    const confirmDelete = async () => {
        if (userToDelete) {
            setIsDeleting(true); // Start loading
            try {
                switch (userToDelete.type) {
                    case "assignment":
                        // Call assignment deletion API - this removes the assignment, not the contact
                        await api.delete(`/api/delete-assignment/${userToDelete.assignment_id}`);
                        setData((prevData) =>
                            prevData.filter(user => user.contact_id !== userToDelete.id)
                        );
                        showAlert("success", `Assignment for ${userToDelete.name} has been successfully removed.`);
                        break;

                    case "contact":
                        // If you want to delete the actual contact (not just remove assignment)
                        await api.delete(`/api/delete-contact/${userToDelete.id}`);

                        setData((prevData) =>
                            prevData.filter(user => user.contact_id !== userToDelete.id)
                        );
                        showAlert("success", `${userToDelete.name} has been successfully deleted.`);
                        break;

                    default:
                        showAlert("error", "Unknown deletion type.");
                        return;
                }

                setShowDeleteModal(false);
                setUserToDelete(null);
            } catch (error) {
                showAlert("error", "Failed to delete. Please try again.");
                console.log("Error deleting:", error);
            } finally {
                setIsDeleting(false); // Stop loading
            }
        }
    };

    const cancelDelete = () => {
        if (isDeleting) return; // Prevent closing during deletion
        setShowDeleteModal(false);
        setUserToDelete(null);
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
                                                <div className={`w-3 h-3 ${data.length === 0 ? "bg-red-500" : "bg-green-400"} rounded-full mr-2`}></div>
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
                                                    assignment_id={participant.assignment_id}
                                                    editOrAdd={"add"}
                                                    assignedOn={participant.created_at ? format(
                                                        parseISO(participant.created_at),
                                                        "MMMM dd, yyyy"
                                                    ) : "N/A"}
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
                                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
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

                            {/* Delete Confirmation Modal with Loading State */}
                            <DeleteConfirmationModal
                                isOpen={showDeleteModal}
                                onConfirm={confirmDelete}
                                onCancel={cancelDelete}
                                itemName={userToDelete?.name}
                                deleteType={userToDelete?.type}
                                isDeleting={isDeleting} // Pass isDeleting state
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserAssignments;
