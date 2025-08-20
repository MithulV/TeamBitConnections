import React, { useState } from "react";
import {
  Edit,
  ExternalLink,
  Trash2,
  MapPin,
  Building,
  Phone,
  Mail,
  Notebook,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DeleteConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  itemName = "this contact",
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
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 animate-none">
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

const ContactCard = ({ contact, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleViewProfile = () => {
    navigate(`/profile/${contact.id}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(contact.id);
    }
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "A":
        return "bg-red-100 text-red-700";
      case "B":
        return "bg-yellow-100 text-yellow-700";
      case "C":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        {/* Header with Avatar and Actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative">
                <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{ backgroundColor: contact.avatarColor }}
                >
            {(
              <img
                src="https://xsgames.co/randomusers/assets/avatars/male/68.jpg"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) || getInitials(contact.name)}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h3
            className="font-semibold text-gray-900 text-lg truncate"
            title={contact.name}
                >
            {contact.name}
                </h3>
                <p
            className="text-sm text-gray-600 truncate"
            title={contact.role}
                >
            {contact.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryColor(
            contact.category
                )}`}
              >
                {contact.category}
              </span>
              <div className="flex gap-1">
                <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => onEdit && onEdit(contact)}
                >
            <Edit size={16} className="text-gray-500" />
                </button>
                {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Notebook size={16} className="text-blue-500" />
                </button> */}
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={handleDeleteClick}
              >
                <Trash2 size={16} className="text-red-400" />
              </button>
            </div>
          </div>
        </div>
               
        {/* Contact Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
            <Building size={14} className="flex-shrink-0" />
            <span className="truncate" title={contact.company}>
              {contact.company}
            </span>
            <MapPin size={14} className="ml-2 flex-shrink-0" />
            <span className="truncate" title={contact.location}>
              {contact.location}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2 min-w-0">
              <Phone size={14} className="flex-shrink-0" />
              <span className="truncate" title={contact.phone}>
                {contact.phone}
              </span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Mail size={14} className="flex-shrink-0" />
              <span className="truncate" title={contact.email}>
                {contact.email}
              </span>
            </div>
          </div>
        </div>

        {/* Skills/Tags with View Profile Button */}
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2 flex-1 mr-3">
            {contact.skills?.slice(0, 2).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium truncate max-w-[100px] inline-block"
                title={skill}
              >
                {skill}
              </span>
            ))}
            {contact.skills && contact.skills.length > 2 && (
              <span
                className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium"
                title={`+${
                  contact.skills.length - 2
                } more skills: ${contact.skills.slice(2).join(", ")}`}
              >
                +{contact.skills.length - 2}
              </span>
            )}
          </div>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0"
            onClick={handleViewProfile}
          >
            <ExternalLink size={14} />
            View Profile
          </button>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        itemName={contact.name}
      />
    </>
  );
};

export default ContactCard;
