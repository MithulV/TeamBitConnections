import React, { useEffect, useState } from "react";
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
  deleteType = "contact",
  isDeleting = false, // Add isDeleting prop
}) => {
  if (!isOpen) return null;

  const getDeleteMessage = () => {
    switch (deleteType) {
      case "contact":
        return `Are you sure you want to delete ${itemName}? This will remove the contact from unverified list.`;
      case "assignment":
        return `Are you sure you want to delete the assignment for ${itemName}? This will remove the user from your assigned list.`;
      case "visitingCard":
        return `Are you sure you want to delete this visiting card? This action cannot be undone.`;
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

function MiddleManRecords() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Add isDeleting state
  const [isAdding, setIsAdding] = useState(false);
  const [addingUser, setAddingUser] = useState(null);
  const [activeView, setActiveView] = useState("formData");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

  const [data, setData] = useState([]);
  const [visitingCard, setVisitingCard] = useState([]);
  const [assignedByUserData, setAssignedByUserData] = useState([]);

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
        showAlert("error", "Failed to fetch unverified contacts.");
      });
  };

  const handleSelectUnverifiedVisitingCards = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/get-unverified-images/`
      );
      console.log("Visiting cards fetched successfully:", response.data);
      setVisitingCard(response.data.data || []);
    } catch (error) {
      console.error("Error fetching visiting cards:", error);
      showAlert("error", "Failed to fetch visiting cards.");
    }
  };

  const handleSelectAssignedByUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/get-assigned-to/${id}`
      );
      console.log("Assigned by user data fetched successfully:", response.data);
      setAssignedByUserData(response.data);
    } catch (error) {
      console.error("Error fetching assigned by user data:", error);
      showAlert("error", "Failed to fetch users assigned by you.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSelectContact();
    handleSelectUnverifiedVisitingCards();
  }, []);

  useEffect(() => {
    if (activeView === "AssignedToUser" && id) {
      handleSelectAssignedByUser();
    }
  }, [activeView, id]);

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
    if (user) {
      setUserToDelete({ 
        id: contact_id, 
        name: user?.name || "this user",
        type: "contact" 
      });
      setShowDeleteModal(true);
    }
  };

  const handleAssignmentDelete = (assignment_id) => {
    const user = assignedByUserData.find((user) => user.assignment_id === assignment_id);
    if (user) {
      setUserToDelete({
        assignment_id: assignment_id,
        name: user?.name || "this user",
        type: "assignment"
      });
      setShowDeleteModal(true);
    }
  };

  const handleVisitingCardDelete = (card_id, card_name = "visiting card") => {
    setUserToDelete({
      id: card_id,
      name: card_name,
      type: "visitingCard"
    });
    setShowDeleteModal(true);
  };

  // Updated confirmDelete function with loading state
  const confirmDelete = async () => {
    if (userToDelete) {
      setIsDeleting(true); // Start loading
      try {
        switch (userToDelete.type) {
          case "contact":
            await axios.delete(`http://localhost:8000/api/delete-contact/${userToDelete.id}`);
            
            setData((prevData) =>
              prevData.filter((item) => item.contact_id !== userToDelete.id)
            );
            showAlert("success", `${userToDelete.name} has been successfully deleted.`);
            break;

          case "assignment":
            await axios.delete(`http://localhost:8000/api/delete-assignment/${userToDelete.assignment_id}`);
            
            setAssignedByUserData((prevData) =>
              prevData.filter(p => p.assignment_id !== userToDelete.assignment_id)
            );
            showAlert("success", `Assignment for ${userToDelete.name} has been successfully deleted.`);
            break;

          case "visitingCard":
            await axios.delete(`http://localhost:8000/api/delete-image/${userToDelete.id}`);
            
            setVisitingCard((prevData) =>
              prevData.filter(card => card.id !== userToDelete.id)
            );
            showAlert("success", "Visiting card has been successfully deleted.");
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

        setData((prevData) =>
          prevData.filter(
            (user) => user.contact_id !== updatedData.contact_id
          )
        );

        showAlert(
          "success",
          `${updatedData.name} has been successfully added to verified contacts.`
        );
      }

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

  const assignToUser = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/api/assign/`, {
        assigned_by: id,
        assigned_to: addingUser.created_by,
        event_id: addingUser.events[0].event_id,
      });
      console.log(response.data);
      console.log(id, addingUser.created_by, addingUser.events[0].event_id);
      showAlert("success", "Successfully assigned to user");
      handleAddCancel();
    } catch (err) {
      console.log(err);
      showAlert("error", "Failed to assign to user");
    }
  };

  const handleDeleteAssignedUser = async (assignment_id) => {
    handleAssignmentDelete(assignment_id);
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
            <button
              onClick={() => setActiveView("AssignedToUser")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeView === "AssignedToUser"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Assigned By Me
            </button>
          </div>

          {isAdding && addingUser ? (
            <div className="bg-white rounded-lg shadow-sm">
              <DetailsInput
                onBack={handleAddCancel}
                onSave={handleAddComplete}
                initialData={addingUser}
                isAddMode={true}
                assignToUser={assignToUser}
              />
            </div>
          ) : (
            <>
              {activeView === "formData" ? (
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
                        parseISO(participant.created_at),
                        "MMMM dd, yyyy"
                      )}
                      org={participant.events?.[0]?.event_held_organization || "N/A"}
                      location={participant.events?.[0]?.event_location || "N/A"}
                      profileImage={participant.profileImage || Avatar}
                      onDelete={() => handleDeleteClick(participant.contact_id)}
                      onType={() => onAdd(participant.contact_id)}
                      editOrAdd={"add"}
                      assignedOn={undefined}
                    />
                  ))}

                  {data.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">
                        No unverified contacts found
                      </div>
                      <div className="text-gray-500">
                        All contacts have been verified.
                      </div>
                    </div>
                  )}
                </div>
              ) : activeView === "visitingCards" ? (
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
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="flex space-x-3">
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
                                      handleVisitingCardDelete(card.id, `Visiting Card ${card.id}`);
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
                          moment.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeView === "AssignedToUser" ? (
                <div>
                  <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">
                          {assignedByUserData.length} User{assignedByUserData.length !== 1 ? 's' : ''} Assigned by You still not completed their update
                        </span>
                      </div>
                      <button
                        onClick={handleSelectAssignedByUser}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading && (
                          <svg
                            className="animate-spin h-3 w-3 text-gray-600"
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
                        )}
                        {loading ? "Loading..." : "Refresh"}
                      </button>
                    </div>
                  </div>

                  {assignedByUserData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {assignedByUserData.map((participant, index) => (
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
                          onDelete={() => handleDeleteAssignedUser(participant.assignment_id)}
                          editOrAdd={undefined}
                          assignedOn={participant.assigned_on ? format(
                            parseISO(participant.assigned_on),
                            "MMMM dd, yyyy"
                          ) : "N/A"}
                        />
                      ))}
                    </div>
                  ) : (
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No users assigned by you
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        You haven't assigned any users yet. Start assigning users to see them here.
                      </p>
                      <button
                        onClick={handleSelectAssignedByUser}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading && (
                          <svg
                            className="animate-spin h-4 w-4 text-white"
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
                        )}
                        {loading ? "Loading..." : "Refresh"}
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
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

export default MiddleManRecords;
