import React, { useEffect, useState } from "react";
import Avatar from "../assets/Avatar.png";
import FormInput from "../components/FormInput";
import Alert from "../components/Alert";
import BasicDetailCard from "../components/BasicDetailCard";
import Header from "../components/Header";
import api from '../utils/axios';
import { ArrowLeft, Trash2 } from "lucide-react";
import { parseISO, format } from "date-fns";
import { useAuthStore } from "../store/AuthStore";

const DeleteConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  itemName = "this user",
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-black/60 bg-opacity-50 backdrop-blur-sm transition-all duration-300"
        onClick={!isDeleting ? onCancel : undefined}
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
            Are you sure you want to delete{" "}
            <span className="font-medium">{itemName}</span>? This action cannot
            be undone.
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

function UserEntries() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeView, setActiveView] = useState("formDetails");
  const [profileData, setProfileData] = useState([]);
  const [imageData, setImageData] = useState([]);

  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

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

  const handleDeleteClick = (contact_id) => {
    const user = profileData.find((user) => user.contact_id === contact_id);
    setUserToDelete({ id: user?.contact_id, name: user?.name || "this user" });
    setShowDeleteModal(true);
  };

  const handleDeleteImage = (imageId, imageName) => {
    setUserToDelete({
      id: imageId,
      name: imageName || "this visiting card",
      type: "image",
    });
    setShowDeleteModal(true);
  };

  // Updated confirmDelete with proper state management
  const confirmDelete = async () => {
    if (userToDelete) {
      setIsDeleting(true);
      try {
        console.log(userToDelete);

        if (userToDelete.type === "image") {
          // Delete image
          const response = await api.delete(
            `/api/delete-image/${userToDelete.id}?userType=${role}`
          );

          // ✅ Update state locally instead of API call
          setImageData((prevData) => ({
            ...prevData,
            data: prevData.data.filter((image) => image.id !== userToDelete.id),
          }));

          showAlert(
            "success",
            `${userToDelete.name} has been successfully deleted.`
          );
        } else {
          // Delete contact
          const response = await api.delete(
            `/api/delete-contact/${userToDelete.id}?userType=${role}`
          );

          // Handle different response actions
          if (response.data.action === "deleted") {
            // ✅ Complete deletion - update profileData state locally
            setProfileData((prevData) =>
              prevData.filter((contact) => contact.contact_id !== userToDelete.id)
            );
            showAlert("success", response.data.message);
          } else if (response.data.action === "rejected") {
            // ✅ Status updated to rejected - update contact status in profileData
            setProfileData((prevData) =>
              prevData.map((contact) =>
                contact.contact_id === userToDelete.id
                  ? { ...contact, contact_status: "rejected" }
                  : contact
              )
            );
            showAlert("success", response.data.message);
          } else if (response.data.action === "denied") {
            // Permission denied - show warning
            showAlert("warning", response.data.message);
          } else {
            // Fallback success message
            showAlert(
              "success",
              response.data.message ||
              `${userToDelete.name} has been processed successfully.`
            );
          }

          // ✅ No need to call handleSelectContact() - state is already updated locally
        }

        // ✅ Success: Close modal and reset state
        setShowDeleteModal(false);
        setUserToDelete(null);
      } catch (error) {
        // ✅ Handle different error responses - close modal and reset state on failure
        console.log("Error deleting", userToDelete.id, error);

        if (error.response?.status === 403) {
          // Permission denied
          showAlert(
            "error",
            error.response.data.message ||
            "You don't have permission to delete this contact."
          );
        } else if (error.response?.status === 404) {
          // Contact not found
          showAlert("error", "Contact not found.");
        } else {
          // General error
          showAlert("error", "Failed to delete. Please try again.");
        }

        // ✅ Failure: Close modal and reset state
        setShowDeleteModal(false);
        setUserToDelete(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const onEdit = async (participant) => {
    try {
      if (participant) {
        console.log(participant);
        const userToEdit = {
          id: participant.contact_id,
          name: participant.name,
          phoneNumber: participant.phone_number,
          emailAddress: participant.email_address,
          events:
            participant.events?.length > 0
              ? participant.events.map((event) => ({
                eventId: event.event_id,
                eventName: event.event_name || "",
                eventRole: event.event_role || "",
                eventDate: event.event_date || "",
                eventHeldOrganization: event.event_held_organization || "",
                eventLocation: event.event_location || "",
              }))
              : [
                {
                  eventId: "",
                  eventName: "",
                  eventRole: "",
                  eventDate: "",
                  eventHeldOrganization: "",
                  eventLocation: "",
                },
              ],
        };

        setEditingUser(userToEdit);
        setIsEditing(true);
      }
    } catch (error) {
      showAlert("error", "Failed to load user data for editing.");
      console.log("Error editing user", error);
    }
  };

  const handleEditComplete = async (updatedData) => {
    try {
      if (updatedData && editingUser) {
        const response = await api.put(
          `/api/update-contacts-and-events/${editingUser.id}`,

          updatedData
        );
        console.log(response);

        // Handle successful update - always update state locally
        setProfileData((prevData) =>
          prevData.map((contact) =>
            contact.contact_id === editingUser.id
              ? { ...contact, ...updatedData }
              : contact
          )
        );

        showAlert(
          "success",
          response.data.message ||
          `${editingUser.name} has been updated successfully.`
        );

        // ✅ Success: Close edit modal and reset state
        setIsEditing(false);
        setEditingUser(null);
      } catch (error) {
        // ✅ Handle different error responses - close modal and reset state on failure
        console.log("Error updating user", editingUser.id, error);

        if (error.response?.status === 403) {
          // Permission denied
          showAlert(
            "error",
            error.response.data.message ||
            "You don't have permission to update this contact."
          );
        } else if (error.response?.status === 404) {
          // Contact not found
          showAlert("error", "Contact or event not found.");
        } else if (error.response?.status === 409) {
          // Unique constraint violation (duplicate email)
          showAlert("error", "A contact with this email address already exists.");
        } else {
          // General error
          showAlert("error", "Failed to update contact. Please try again.");
        }

        // ✅ Failure: Close modal and reset state
        setIsEditing(false);
        setEditingUser(null);
      } finally {
      }
    }
  };


  const handleEditCancel = () => {
    setIsEditing(false);
    setEditingUser(null);
  };

  const { id, role } = useAuthStore();

  const handleSelectContact = async () => {
    try {
      const response = await api.get(
        `/api/contacts/${id}`
      );
      console.log("Contacts fetched successfully:", response.data);
      setProfileData(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleSelectImage = async () => {
    try {
      const response = await api.get(
        `/api/get-contact-images/${id}`
      );
      console.log("Contact images fetched successfully:", response.data);
      setImageData(response.data);
    } catch (error) {
      console.error("Error fetching contact images:", error);
    }
  };

  useEffect(() => {
    handleSelectContact();
  }, []);

  useEffect(() => {
    handleSelectImage();
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
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
            {isEditing ? (
              <button
                onClick={handleEditCancel}
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* View Toggle Buttons */}
        <div className={`p-6 pb-0 ${isEditing ? "hidden" : "block"}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveView("formDetails")}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${activeView === "formDetails"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
              >
                Form Details
              </button>
              <button
                onClick={() => setActiveView("visitingCards")}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${activeView === "visitingCards"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
              >
                Visiting Cards
              </button>
            </div>
          </div>
        </div>

        {/* Conditional Content */}
        {isEditing && editingUser ? (
          /* Show FormInput when editing */
          <div className="p-5">
            <FormInput
              onBack={handleEditCancel}
              onSave={handleEditComplete}
              initialData={editingUser}
              isEditMode={true}
            />
          </div>
        ) : (
          /* Show user cards when not editing */
          <>
            {activeView === "formDetails" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {profileData.map((participant, index) => {
                  return (
                    <BasicDetailCard
                      key={participant.contact_id || index}
                      name={participant.name}
                      phone={participant.phone_number}
                      email={participant.email_address}
                      event={participant.events?.[0]?.event_name || "N/A"}
                      role={participant.events?.[0]?.event_role || "N/A"}
                      date={format(
                        parseISO(participant.created_at),
                        "MMMM dd, yyyy"
                      )}
                      org={
                        participant.events?.[0]?.event_held_organization ||
                        "N/A"
                      }
                      location={
                        participant.events?.[0]?.event_location || "N/A"
                      }
                      profileImage={participant.profileImage || Avatar}
                      onDelete={() => handleDeleteClick(participant.contact_id)}
                      onType={() => onEdit(participant)}
                      editOrAdd={"edit"}
                      status={
                        participant.events?.[0]?.contact_status || "pending"
                      }
                    />
                  );
                })}

                {profileData.length === 0 && (
                  <div className="col-span-full text-center py-16">
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No contacts found
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      You haven't added any contacts yet. Start adding contacts
                      to see them here.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-6">
                    {Array.isArray(imageData?.data) &&
                      imageData.data.map((card, index) => (
                        <div
                          key={card.id ?? index}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 h-48 w-full relative group"
                        >
                          <img
                            src={`http://localhost:8000/${card.file_path.replace(
                              /\\/g,
                              "/"
                            )}`}
                            alt={`Visiting Card ${card.id}`}
                            className="w-full h-full object-cover bg-gray-50"
                            onError={(e) => {
                              e.target.src = Avatar;
                            }}
                          />
                          {/* Delete button overlay */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() =>
                                handleDeleteImage(
                                  card.id,
                                  `Visiting Card ${card.id}`
                                )
                              }
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors duration-200"
                              title="Delete visiting card"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {(!imageData?.data || imageData.data.length === 0) && (
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No visiting cards found
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        You haven't uploaded any visiting cards yet. Upload
                        cards to see them here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal with Loading State */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          itemName={userToDelete?.name}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}

export default UserEntries;
