import React from "react";

const DeleteConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  itemName = "this item",
  deleteType = "contact", // contact, task, user, etc.
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  // Handle confirm with proper event handling
  const handleConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Modal confirm button clicked");
    onConfirm();
  };

  // Handle cancel with proper event handling
  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Modal cancel button clicked");
    onCancel();
  };

  // Get dynamic message based on delete type
  const getDeleteMessage = () => {
    switch (deleteType) {
      case "task":
        return `Are you sure you want to delete ${itemName}? This will permanently remove the task from your system and cannot be undone.`;
      case "contact":
        return `Are you sure you want to delete ${itemName}? This will permanently remove the contact and all associated data.`;
      case "user":
        return `Are you sure you want to delete ${itemName}? This will permanently remove the user account and all associated data.`;
      case "assignment":
        return `Are you sure you want to delete the assignment for ${itemName}? This will remove the user from your assigned list.`;
      case "visitingCard":
        return `Are you sure you want to delete this visiting card? This action cannot be undone.`;
      default:
        return `Are you sure you want to delete ${itemName}? This will permanently remove the item and all associated data.`;
    }
  };

  // Get dynamic title based on delete type
  const getDeleteTitle = () => {
    switch (deleteType) {
      case "task":
        return "Delete Task";
      case "contact":
        return "Delete Contact";
      case "user":
        return "Delete User";
      case "assignment":
        return "Remove Assignment";
      case "visitingCard":
        return "Delete Visiting Card";
      default:
        return "Confirm Delete";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isDeleting ? handleCancel : undefined} // Prevent closing during deletion
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-start gap-3 p-6 pb-4">
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
              {getDeleteTitle()}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 text-sm leading-relaxed pl-13">
            {getDeleteMessage()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isDeleting}
            className="px-6 py-2 text-sm font-medium text-blue-600 bg-transparent border-none rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
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
              deleteType === "assignment" ? "Remove" : "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
