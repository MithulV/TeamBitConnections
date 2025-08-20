import React, { useState } from 'react'
import Avatar from '../assets/Avatar.png';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';
import BasicDetailCard from '../components/BasicDetailCard';
import Header from '../components/Header';
const dummyCardData = [
 
  {
    "id": 9,
    "name": "David Lee",
    "phone": "+1 (555) 258-3691",
    "email": "david.lee@financehub.com",
    "event": "FinTech Forward 2025",
    "role": "attendee",
    "date": "2025-09-22",
    "org": "FinanceHub",
    "location": "Chicago, IL",
    "profileImage": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150"
  },
  {
    "id": 10,
    "name": "Maria Garcia",
    "phone": "+34 655 123 456",
    "email": "maria.garcia@edutech.es",
    "event": "EdTech Global Symposium",
    "role": "organizer",
    "date": "2025-10-05",
    "org": "EduTech Spain",
    "location": "Madrid, Spain"
  },
  {
    "id": 11,
    "name": "Kenji Tanaka",
    "phone": "+81 90-1234-5678",
    "email": "kenji.tanaka@cybersec.jp",
    "event": "Cybersecurity World Forum",
    "role": "speaker",
    "date": "2025-10-18",
    "org": "CyberSecure Japan",
    "location": "Tokyo, Japan",
    "profileImage": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    "id": 12,
    "name": "Fatima Al-Sayed",
    "phone": "+971 50 123 4567",
    "email": "fatima.a@greentech.ae",
    "event": "Green Energy Summit",
    "role": "sponsor",
    "date": "2025-11-02",
    "org": "GreenTech Innovations UAE",
    "location": "Dubai, UAE"
  },
  {
    "id": 13,
    "name": "Olivia Williams",
    "phone": "+1 (555) 741-8529",
    "email": "olivia.w@cloudsolutions.com",
    "event": "Cloud Computing Expo",
    "role": "attendee",
    "date": "2025-09-25",
    "org": "Cloud Solutions Inc.",
    "location": "Las Vegas, NV",
    "profileImage": "https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=150"
  },
  {
    "id": 14,
    "name": "Ben Carter",
    "phone": "+44 7700 900123",
    "email": "ben.carter@vrvision.co.uk",
    "event": "VR/AR Developers Conference",
    "role": "volunteer",
    "date": "2025-10-12",
    "org": "VR Vision Ltd.",
    "location": "London, UK"
  },
  {
    "id": 15,
    "name": "Chloe Dubois",
    "phone": "+33 6 12 34 56 78",
    "email": "chloe.dubois@press.fr",
    "event": "European Tech Week",
    "role": "press",
    "date": "2025-11-10",
    "org": "TechPress France",
    "location": "Paris, France"
  },
  
];

const DeleteConfirmationModal = ({ isOpen, onConfirm, onCancel, itemName = "this user" }) => {
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
            Are you sure you want to delete <span className="font-medium">{itemName}</span>? This action cannot be undone.
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
  const [data, setData] = useState(dummyCardData);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [alert, setAlert] = useState({
    isOpen: false,
    severity: 'success',
    message: ''
  });

  const showAlert = (severity, message) => {
    setAlert({
      isOpen: true,
      severity,
      message
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  const handleDeleteClick = (id) => {
    const user = data.find(user => user.id === id);
    setUserToDelete({ id, name: user?.name || "this user" });
    setShowDeleteModal(true);
  }

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        setData(prevData => prevData.filter(item => item.id !== userToDelete.id));
        setShowDeleteModal(false);
        showAlert('success', `${userToDelete.name} has been successfully deleted.`);
        setUserToDelete(null);
      } catch (error) {
        showAlert('error', 'Failed to delete user. Please try again.');
        console.log("Error deleting user", userToDelete.id, error);
      }
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  }

  const onEdit = async (id) => {
    try {
      const user = data.find(user => user.id === id);
      if (user) {
        setEditingUser(user);
        setIsEditing(true);
      }
    } catch (error) {
      showAlert('error', 'Failed to load user data for editing.');
      console.log("Error editing user", error);
    }
  }

  const handleEditComplete = (updatedData) => {
    try {
      if (updatedData && editingUser) {
        // Update the user in the data array
        setData(prevData => prevData.map(user =>
          user.id === editingUser.id
            ? { ...user, ...updatedData }
            : user
        ));

        // Show success alert
        showAlert('success', `${updatedData.name || editingUser.name} has been successfully updated.`);
      }

      // Close the edit form
      setIsEditing(false);
      setEditingUser(null);
    } catch (error) {
      console.log("Error updating user", error);
      showAlert('error', 'Failed to update user. Please try again.');
    }
  }

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditingUser(null);
  }

  return (
    <div className='w-full h-full'>
      <Alert
        isOpen={alert.isOpen}
        severity={alert.severity}
        message={alert.message}
        onClose={closeAlert}
        position="bottom"
        duration={4000}
      />
      {/* Header with User Info - Always visible */}
      <Header />

      {/* Conditional Content */}
      {isEditing && editingUser ? (
        // Show FormInput when editing
        <div className='p-5'>
          <FormInput
            onBack={handleEditCancel}
            onSave={handleEditComplete}
            initialData={editingUser}
            isEditMode={true}
          />
        </div>
      ) : (
        // Show user cards when not editing
        <>
          <div className="grid grid-cols-3 gap-3 p-5">
            {data.map((participant) => (
              <BasicDetailCard
                key={participant.id}
                name={participant.name}
                phone={participant.phone}
                email={participant.email}
                event={participant.event}
                role={participant.role}
                date={participant.date}
                org={participant.org}
                location={participant.location}
                profileImage={participant.profileImage}
                onDelete={() => handleDeleteClick(participant.id)}
                onType={() => onEdit(participant.id)}
                editOrAdd={"edit"}
              />
            ))}
          </div>
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            itemName={userToDelete?.name}
          />
        </>
      )}
    </div>
  )
}

export default UserEntries