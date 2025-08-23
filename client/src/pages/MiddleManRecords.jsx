import React, { useEffect, useState } from "react";
import BasicDetailCard from "../components/BasicDetailCard";
import Alert from "../components/Alert";
import Avatar from "../assets/Avatar.png";
import DetailsInput from "../components/DetailsInput";
import Header from "../components/Header";
import { useAuthStore } from "../store/AuthStore";
import axios from "axios";
import { format, parseISO } from "date-fns";

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

function MiddleManRecords() {
  const [data, setData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [AddingUser, setAddingUser] = useState(null);
  const [activeView, setActiveView] = useState("formData"); // 'formData' or 'visitingCards'

  const { id } = useAuthStore();
  const handleSelectContact = () => {
    axios
      .get(`http://localhost:8000/api/get-unverified-contacts/`)
      .then((response) => {
        console.log("Contacts fetched successfully:", response.data);
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching contacts:", error);
      });
  };
  useEffect(() => {
    handleSelectContact();
  }, []);

  // Sample visiting card images (replace with your actual images)
  const visitingCards = [
    { id: 1, image: "https://example.com/card1.jpg" },
    { id: 2, image: "https://example.com/card2.jpg" },
    // Add more visiting card images
  ];

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
    const user = data.find((user) => user.contact_id === contact_id);
    setUserToDelete({ id, name: user?.name || "this user" });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        setData((prevData) =>
          prevData.filter((item) => item.id !== userToDelete.id)
        );
        setShowDeleteModal(false);
        showAlert(
          "success",
          `${userToDelete.name} has been successfully deleted.`
        );
        setUserToDelete(null);
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

  const onAdd = async (contact_id) => {
    try {
      const user = data.find((user) => user.contact_id === contact_id);
      console.log(user, id)
      if (user) {
        setAddingUser(user);
        setIsAdding(true);
      }
    } catch (error) {
      showAlert("error", "Failed to load user data for Adding.");
      console.log("Error editing user", error);
    }
  };

  const handleAddComplete = (updatedData) => {
    try {
      if (updatedData && AddingUser) {
        // Update the user in the data array
        setData((prevData) =>
          prevData.map((user) =>
            user.id === AddingUser.id ? { ...user, ...updatedData } : user
          )
        );

        // Show success alert
        showAlert(`success has been successfully Added.`);
      }

      // Close the edit form
      setIsAdding(false);
      setAddingUser(null);
    } catch (error) {
      console.log("Error updating user", error);
      showAlert("error", "Failed to add user. Please try again.");
    }
  };

  const handleAddCancel = () => {
    setIsAdding(false);
    setAddingUser(null);
  };

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
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* View Toggle Buttons */}
          <div className={`flex gap-4 mb-6 ${isAdding?"hidden":"block"}`}>
            <button
              onClick={() => setActiveView("formData")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${activeView === "formData"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
            >
              Form Data
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

          {isAdding && AddingUser ? (
            // Show FormInput when editing
            <div className="bg-white rounded-lg shadow-sm">
              <DetailsInput
                onBack={handleAddCancel}
                onSave={handleAddComplete}
                initialData={AddingUser}
                isAddMode={true}
              />
            </div>
          ) : (
            // Show user cards when not adding
            <>
              {activeView === "formData" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.map((participant, index) => (
                    <BasicDetailCard
                      key={index}
                      name={participant.name}
                      phone={participant.phone_number}
                      email={participant.email_address}
                      event={participant.events[0].event_name}
                      role={participant.events[0].event_role}
                      date={format(
                        parseISO(participant.created_at),
                        "MMMM dd, yyyy"
                      )}
                      org={participant.events[0].event_held_organization}
                      location={participant.events[0].event_location}
                      profileImage={participant.profileImage || Avatar}
                      onDelete={() => handleDeleteClick(participant.contact_id)}
                      onType={() => onAdd(participant.contact_id)}
                      editOrAdd={"add"}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visitingCards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-white rounded-lg shadow-md p-4"
                    >
                      <img
                        src={card.image}
                        alt={`Visiting Card ${card.id}`}
                        className="w-full h-auto object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
              <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                itemName={userToDelete?.name}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MiddleManRecords;
