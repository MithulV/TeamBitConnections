import React, { useEffect, useState } from "react";
import BasicDetailCard from "../../components/Cards/BasicDetailCard";
import Alert from "../../components/Alert/Alert";
import Avatar from "../../assets/Avatar.png";
import Header from "../../components/Header/Header";
import { useAuthStore } from "../../store/AuthStore";
import api from "../../utils/axios";
import { format, parseISO } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../components/Modals/DeleteConfirmationModal";

function MiddleManRecords() {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const location = useLocation();
  const [activeView, setActiveView] = useState(
    location.state?.view || "formData"
  );
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

  const [data, setData] = useState([]);
  const [visitingCard, setVisitingCard] = useState([]);
  const [assignedByUserData, setAssignedByUserData] = useState([]);

  const { id, role } = useAuthStore();

  const handleSelectContact = () => {
    api
      .get(`/api/get-unverified-contacts/`)
      .then((response) => {
        console.log("Contacts fetched successfully:", response.data.data);
        setData(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching contacts:", error);
        showAlert("error", "Failed to fetch unverified contacts.");
      });
  };

  const handleSelectUnverifiedVisitingCards = async () => {
    try {
      const response = await api.get(`/api/get-unverified-images/`);
      console.log("Visiting cards fetched successfully:", response.data.data);
      setVisitingCard(response.data.data || []);
    } catch (error) {
      console.error("Error fetching visiting cards:", error);
      showAlert("error", "Failed to fetch visiting cards.");
    }
  };

  const handleSelectAssignedByUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/get-assigned-to/${id}`);
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

  // Listen for navigation back with success
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const navigationState = window.history.state?.state;
        if (navigationState?.fromDetailsInput && navigationState?.success) {
          showAlert("success", navigationState.message);
          if (navigationState.refreshData) {
            handleSelectContact();
          }
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

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
        type: "contact",
        event_id: user.events[0].event_id,
      });
      setShowDeleteModal(true);
    }
  };

  const handleAssignmentDelete = (assignment_id) => {
    const user = assignedByUserData.find(
      (user) => user.assignment_id === assignment_id
    );
    if (user) {
      setUserToDelete({
        assignment_id: assignment_id,
        name: user?.name || "this user",
        type: "assignment",
      });
      setShowDeleteModal(true);
    }
  };

  const handleVisitingCardDelete = (card_id, card_name = "visiting card") => {
    setUserToDelete({
      id: card_id,
      name: card_name,
      type: "visitingCard",
    });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      setIsDeleting(true);
      try {
        switch (userToDelete.type) {
          case "contact":
            await api.delete(
              `/api/delete-contact/${userToDelete.id}?userType=${role}&eventId=${userToDelete.event_id}`
            );

            setData((prevData) => {
              return prevData.filter((item) => {
                const hasMatchingEvent =
                  item.events &&
                  item.events[0] &&
                  item.events[0].event_id === userToDelete.event_id;
                const shouldRemove =
                  item.contact_id === userToDelete.id && hasMatchingEvent;

                return !shouldRemove;
              });
            });

            showAlert(
              "success",
              `${userToDelete.name} has been successfully deleted.`
            );
            break;

          case "assignment":
            await api.delete(
              `/api/delete-assignment/${userToDelete.assignment_id}`
            );

            setAssignedByUserData((prevData) =>
              prevData.filter(
                (p) => p.assignment_id !== userToDelete.assignment_id
              )
            );
            handleSelectContact();
            showAlert(
              "success",
              `Assignment for ${userToDelete.name} has been successfully deleted.`
            );
            break;

          case "visitingCard":
            await api.delete(
              `/api/delete-image/${userToDelete.id}?userType=${role}`
            );

            setVisitingCard((prevData) =>
              prevData.filter((card) => card.id !== userToDelete.id)
            );
            showAlert(
              "success",
              "Visiting card has been successfully deleted."
            );
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
        setIsDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const onAdd = async (contact_id) => {
    try {
      const user = data.find((user) => user.contact_id === contact_id);
      console.log("Adding user:", user);
      if (user) {
        navigate("/details-input", {
          state: {
            contact: user,
            isAddMode: true,
            source: "middleman",
            currentUserId: id,
            userRole: role,
            successCallback: {
              message: `${user.name} has been successfully verified and added to contacts.`,
              refreshData: true,
            },
          },
        });
      }
    } catch (error) {
      showAlert("error", "Failed to load user data for adding.");
      console.log("Error loading user for add", error);
    }
  };
  const handleDeleteAssignedUser = async (assignment_id) => {
    handleAssignmentDelete(assignment_id);
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
      <div className="w-full bg-white shadow-sm sticky top-0 z-50 border-b-2 border-b-gray-50">
        <div className="flex justify-end">
          <Header />
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <div className="container mx-auto">
          {/* Mobile-Responsive Tab Buttons */}
          <div className="mb-6">
            {/* Mobile: Horizontal scrolling tabs */}
            <div className="sm:hidden">
              <div className="flex gap-2  pb-2">
                <button
                  onClick={() => setActiveView("formData")}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeView === "formData"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                >
                  Form Data
                </button>
                <button
                  onClick={() => setActiveView("visitingCards")}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeView === "visitingCards"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setActiveView("AssignedToUser")}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeView === "AssignedToUser"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                >
                  Assigned
                </button>
              </div>
            </div>

            {/* Desktop/Tablet: Regular flex layout */}
            <div className="hidden sm:flex gap-4">
              <button
                onClick={() => setActiveView("formData")}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeView === "formData"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
              >
                Form Data
              </button>
              <button
                onClick={() => setActiveView("visitingCards")}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeView === "visitingCards"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
              >
                Visiting Cards
              </button>
              <button
                onClick={() => setActiveView("AssignedToUser")}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeView === "AssignedToUser"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
              >
                Assigned By Me
              </button>
            </div>
          </div>

          {activeView === "formData" ? (
            <div>
              <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
                    {data.length} Records to be Verified
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                    org={
                      participant.events?.[0]?.event_held_organization || "N/A"
                    }
                    location={participant.events?.[0]?.event_location || "N/A"}
                    profileImage={participant.profileImage || Avatar}
                    onDelete={() => handleDeleteClick(participant.contact_id)}
                    onType={() => onAdd(participant.contact_id)}
                    editOrAdd={"add"}
                    assignedOn={undefined}
                  />
                ))}

                {data.length === 0 && (
                  <div className="col-span-full text-center py-12 sm:py-16">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
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
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      No unverified contacts found
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                      All contacts have been verified or there are no pending
                      submissions to review.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : activeView === "visitingCards" ? (
            <div>
              <div className="container mx-auto">
                <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">
                      {visitingCard.length} Records to be Verified
                    </span>
                  </div>
                </div>

                {visitingCard.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {visitingCard.map((card) => (
                      <div
                        key={card.id}
                        className="group cursor-pointer bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                        onClick={() => {
                          navigate(`/visiting-card-details/${card.id}`);
                        }}
                      >
                        {/* Image with overlay buttons - always visible on mobile, hover on desktop */}
                        <div className="relative">
                          <img
                            src={`http://localhost:8000/${card.file_path.replace(
                              /\\/g,
                              "/"
                            )}`}
                            alt={`Visiting Card ${card.id}`}
                            className="w-full h-32 sm:h-48 object-cover"
                          />

                          {/* Mobile: Always visible buttons */}
                          <div className="absolute top-2 right-2 flex space-x-2 sm:hidden">
                            <button
                              className="p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/visiting-card-details/${card.id}`);
                              }}
                            >
                              <svg
                                className="w-4 h-4 text-green-600"
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
                              className="p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVisitingCardDelete(
                                  card.id,
                                  `Visiting Card ${card.id}`
                                );
                              }}
                            >
                              <svg
                                className="w-4 h-4 text-red-600"
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

                          {/* Desktop: Hover overlay buttons */}
                          <div className="hidden absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 sm:flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-3">
                              <button
                                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/visiting-card-details/${card.id}`);
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
                                  handleVisitingCardDelete(
                                    card.id,
                                    `Visiting Card ${card.id}`
                                  );
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

                        {/* Info box attached to image - no gap */}
                        <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
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
                            {new Date(card.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
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
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      No visiting cards found
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                      There are no visiting cards pending review at the moment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : activeView === "AssignedToUser" ? (
            <div>
              <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
                <div className="flex flex-row items-center justify-between gap-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">
                      {assignedByUserData.length} User
                      <span className="text-sm hidden sm:inline">
                        {assignedByUserData.length !== 1 ? "s" : ""} Assigned by
                        You still not completed their update
                      </span>
                      <span className="text-sm inline sm:hidden">
                        {assignedByUserData.length !== 1 ? "s" : ""} not completed their update
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={handleSelectAssignedByUser}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                      org={
                        participant.events?.[0]?.event_held_organization ||
                        "N/A"
                      }
                      location={
                        participant.events?.[0]?.event_location || "N/A"
                      }
                      profileImage={participant.profileImage || Avatar}
                      onDelete={() =>
                        handleDeleteAssignedUser(participant.assignment_id)
                      }
                      editOrAdd={undefined}
                      assignedOn={
                        participant.assigned_on
                          ? format(
                            parseISO(participant.assigned_on),
                            "MMMM dd, yyyy"
                          )
                          : "N/A"
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No users assigned by you
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                    You haven't assigned any users yet. Start assigning users to
                    see them here.
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
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}

export default MiddleManRecords;
