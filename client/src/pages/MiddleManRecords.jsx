import React, { useState } from 'react'
import BasicDetailCard from '../components/BasicDetailCard'
import Alert from '../components/Alert';
import Avatar from '../assets/Avatar.png';
import DetailsInput from '../components/DetailsInput';
const dummyCardData = [
  {
    id: 1,
    name: "Sarah Johnson",
    phone: "+1 (555) 123-4567",
    email: "sarah.johnson@email.com",
    event: "Tech Innovation Summit 2025",
    role: "speaker",
    date: "2025-08-15",
    org: "Google Inc.",
    location: "San Francisco, CA",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"
  },
  {
    id: 2,
    name: "Michael Chen",
    phone: "+1 (555) 987-6543",
    email: "m.chen@startupxyz.com",
    event: "Startup Pitch Day",
    role: "attendee",
    date: "2025-08-20",
    org: "StartupXYZ",
    location: "Austin, TX"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    phone: "+1 (555) 456-7890",
    email: "emily.rodriguez@medtech.org",
    event: "Healthcare Innovation Conference",
    role: "organizer",
    date: "2025-09-05",
    org: "MedTech Solutions",
    location: "Boston, MA",
    profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150"
  },
  {
    id: 4,
    name: "James Wilson",
    phone: "+1 (555) 321-0987",
    email: "james@techcorp.com",
    event: "AI & Machine Learning Expo",
    role: "sponsor",
    date: "2025-08-30",
    org: "TechCorp Industries",
    location: "Seattle, WA"
  },
  {
    id: 5,
    name: "Lisa Thompson",
    phone: "+1 (555) 654-3210",
    email: "lisa.thompson@volunteer.org",
    event: "Community Tech Workshop",
    role: "volunteer",
    date: "2025-08-25",
    org: "Community Volunteers",
    location: "Denver, CO",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"
  },
  {
    id: 6,
    name: "Alex Morgan",
    phone: "+1 (555) 789-0123",
    email: "alex.morgan@newstech.com",
    event: "Digital Media Summit",
    role: "press",
    date: "2025-09-10",
    org: "NewsTech Media",
    location: "New York, NY"
  },
  {
    id: 7,
    name: "Priya Patel",
    phone: "+91 98765 43210",
    email: "priya.patel@globalevent.in",
    event: "Global Innovation Forum",
    role: "attendee",
    date: "2025-09-15",
    org: "Innovation Hub India",
    location: "Mumbai, India",
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
  },
  {
    id: 8,
    name: "Robert Kim",
    phone: "+1 (555) 147-2583",
    email: "robert.kim@designstudio.com",
    event: "UX/UI Design Conference",
    role: "speaker",
    date: "2025-08-28",
    org: "Creative Design Studio",
    location: "Portland, OR"
  }
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

function MiddleManRecords() {
  const [data, setData] = useState(dummyCardData);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [AddingUser, setAddingUser] = useState(null);

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

  const onAdd = async (id) => {
    try {
      const user = data.find(user => user.id === id);
      if (user) {
        setAddingUser(user);
        setIsAdding(true);
      }
    } catch (error) {
      showAlert('error', 'Failed to load user data for Adding.');
      console.log("Error editing user", error);
    }
  }

  const handleAddComplete = (updatedData) => {
    try {
      if (updatedData && AddingUser) {
        // Update the user in the data array
        setData(prevData => prevData.map(user =>
          user.id === AddingUser.id
            ? { ...user, ...updatedData }
            : user
        ));

        // Show success alert
        showAlert(`success has been successfully Added.`);
      }

      // Close the edit form
      setIsAdding(false);
      setAddingUser(null);
    } catch (error) {
      console.log("Error updating user", error);
      showAlert('error', 'Failed to add user. Please try again.');
    }
  }

  const handleAddCancel = () => {
    setIsAdding(false);
    setAddingUser(null);
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
      {/* Conditional Content */}
      {isAdding && AddingUser ? (
        // Show FormInput when editing
        <div className='p-5'>
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
                onType={() => onAdd(participant.id)}
                editOrAdd={"add"}
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

export default MiddleManRecords