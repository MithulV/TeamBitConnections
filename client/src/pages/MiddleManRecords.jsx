import React, { use, useEffect, useState } from "react";
import BasicDetailCard from "../components/BasicDetailCard";
import Alert from "../components/Alert";
import Avatar from "../assets/Avatar.png";
import DetailsInput from "../components/DetailsInput";
import Header from "../components/Header";
import { useAuthStore } from "../store/AuthStore";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [AddingUser, setAddingUser] = useState(null);
  const [activeView, setActiveView] = useState("formData"); // 'formData' or 'visitingCards'
  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

  const [data, setData] = useState([]); //STORES THE UNVERIFIED CONTACTS
  const [visitingCard, setVisitingCard] = useState([]); //STORES THE UNVERIFIED VISITING CARDS

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

  const handleSelectUnverifiedVisitingCards = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/get-unverified-images/`
      );
      console.log("Visiting cards fetched successfully:", response.data);
      setVisitingCard(response.data.data || []);
    } catch (error) {
      console.error("Error fetching visiting cards:", error);
    }
  };
  useEffect(() => {
    handleSelectUnverifiedVisitingCards();
  }, []);

  // useEffect(() => {
  //   const handleDeleteVisitingCard = async () => {
  //     if (userToDelete) {
  //       try {
  //         await axios.delete(
  //           `http://localhost:8000/api/delete-image/${userToDelete.id}`
  //         );
  //         setVisitingCard((prev) =>
  //           prev.filter((card) => card.id !== userToDelete.id)
  //         );
  //         showAlert("success", `${userToDelete.name} has been successfully deleted.`);
  //         setUserToDelete(null);
  //       } catch (error) {
  //         showAlert("error", "Failed to delete visiting card. Please try again.");
  //         console.error("Error deleting visiting card", userToDelete.id, error);
  //       }
  //     }
  //   };
  // }, [userToDelete]);





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
      console.log(user, id);
      if (user) {
        setAddingUser(user);
        setIsAdding(true);
      }
    } catch (error) {
      showAlert("error", "Failed to load user data for Adding.");
      console.log("Error editing user", error);
    }
  };

  const handleAddComplete = async (updatedData) => {
    try {
      if (updatedData && AddingUser) {
        // Update the user in the data array
        console.log(updatedData);
        const response = await axios.put(
          `http://localhost:8000/api/update-contact/${updatedData.contact_id}`,
          updatedData
        );
        console.log(response);
        setData((prevData) =>
          prevData.filter(
            (user) => user.events[0].event_id !== updatedData.event_id
          )
        );

        // Show success alert
        showAlert(
          "success",
          `${updatedData.name} has been successfully Added.`
        );
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

  const navigate = useNavigate();
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
          <div className={`flex gap-4 mb-6 ${isAdding ? "hidden" : "block"}`}>
            <button
              onClick={() => setActiveView("formData")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeView === "formData"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Form Data
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
                // Replace the visitingCards section in your component with this enhanced UI

                <div className="p-6">
                  <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">
                          {visitingCard.length} Records to be Verified
                        </span>
                      </div>
                    </div>

                    {/* Cards Grid */}
                    {visitingCard.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {visitingCard.map((card) => (
                          <div
                            key={card.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer"
                            onClick={() => {
                              navigate(`/visiting-card-details/${card.id}`);
                            }}
                          >
                            <div className="relative h-48 bg-gray-50">
                              <img
                                src={`http://localhost:8000/${card.file_path.replace(
                                  /\\/g,
                                  "/"
                                )}`}
                                alt={`Visiting Card ${card.id}`}
                                className="w-full h-full object-contain p-2"
                              />
                              {/* Hover Overlay with Actions */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="flex space-x-3">
                                  {/* <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200" >
                                    <svg
                                      className="w-5 h-5 text-blue-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                  </button> */}
                                  <button
                                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/visiting-card-details/${card.id}`
                                      );
                                    }}
                                  >
                                    <svg
                                      className="w-5 h-5 text-green-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    <svg
                                      className="w-5 h-5 text-red-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center text-xs text-gray-500">
                                  <svg
                                    className="w-3 h-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {new Date(
                                    card.created_at
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Empty State
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
                              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3 3a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No visiting cards found
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          There are no visiting cards pending review at the
                          moment. Upload new cards to get started.
                        </p>
                        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
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
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Add First Card
                        </button>
                      </div>
                    )}
                  </div>
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
