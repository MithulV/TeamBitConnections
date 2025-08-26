import React, { useEffect, useState } from "react";
import Avatar from "../assets/Avatar.png";
import FormInput from "../components/FormInput";
import Alert from "../components/Alert";
import BasicDetailCard from "../components/BasicDetailCard";
import Header from "../components/Header";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { parseISO, format } from "date-fns";
import { useAuthStore } from "../store/AuthStore";

const DeleteConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  itemName = "this user",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-black/60 bg-opacity-50 backdrop-blur-sm transition-all duration-300"
        onClick={onCancel}
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
            className="px-6 py-2 text-sm font-medium text-blue-600 bg-transparent border-none rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 uppercase tracking-wide"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-medium text-red-600 bg-transparent border-none rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-200 uppercase tracking-wide"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

function UserEntries() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
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

  const handleDeleteClick = (id) => {
    const user = profileData.find((user) => user.id === id);
    setUserToDelete({ id: user?.contact_id, name: user?.name || "this user" });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        console.log(userToDelete);
        const response = await axios.delete(
          `http://localhost:8000/api/delete-contact/${userToDelete.id}`
        );
        setShowDeleteModal(false);
        showAlert(
          "success",
          `${userToDelete.name} has been successfully deleted.`
        );
        setUserToDelete(null);
        // Refresh data after deletion
        handleSelectContact();
      } catch (error) {
        showAlert("error", "Failed to delete user. Please try again.");
        console.log("Error deleting user", userToDelete.id, error);
      }
    }
  };

  const cancelDelete = () => {
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
        const response = await axios.put(
          `http://localhost:8000/api/update-contacts-and-events/${editingUser.id}`,
          updatedData
        );
        console.log(response);
        showAlert(
          "success",
          `${updatedData.name || editingUser.name} has been successfully updated.`
        );

        // Update the contact with matching contact_id
        setProfileData((prevData) =>
          prevData.map((p) =>
            p.contact_id === editingUser.id
              ? { ...p, ...updatedData }
              : p
          )
        );
      }

      // Close the edit form
      setIsEditing(false);
      setEditingUser(null);
    } catch (error) {
      console.log("Error updating user", error);
      showAlert("error", "Failed to update user. Please try again.");
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditingUser(null);
  };

  const { id } = useAuthStore();

  const handleSelectContact = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/contacts/${id}`
      );
      console.log("Contacts fetched successfully:", response.data);
      setProfileData(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleSelectImage = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/get-contact-images/${id}`
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
        <div className={`p-6 pb-0 ${isEditing ? 'hidden' : 'block'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveView("formDetails")}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeView === "formDetails"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                Form Details
              </button>
              <button
                onClick={() => setActiveView("visitingCards")}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeView === "visitingCards"
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
                      org={participant.events?.[0]?.event_held_organization || "N/A"}
                      location={participant.events?.[0]?.event_location || "N/A"}
                      profileImage={participant.profileImage || Avatar}
                      onDelete={() => handleDeleteClick(participant.id)}
                      onType={() => onEdit(participant)}
                      editOrAdd={"edit"}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-6">
                    {Array.isArray(imageData?.data) &&
                      imageData.data.map((card, index) => (
                        <div
                          key={card.id ?? index}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 h-48 w-full"
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
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          itemName={userToDelete?.name}
        />
      </div>
    </div>
  );
}

export default UserEntries;
