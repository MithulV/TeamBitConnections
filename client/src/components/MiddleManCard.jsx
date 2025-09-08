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

// Remove the DeleteConfirmationModal from here since we're using the parent's modal
const MiddleManCard = ({ contact, onDelete, onEdit }) => {
  const navigate = useNavigate();
  // Remove local modal state since parent handles the modal
  console.log(contact);

  const handleViewProfile = () => {
    navigate(`/profile/${contact.id}`, { state: contact });
  };

  // Simply call the parent's onDelete function with the contact
  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(contact); // Pass the entire contact object to parent
    }
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
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
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
            <p className="text-sm text-gray-600 truncate" title={contact.role}>
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
        {/* Company and Address Section - Split into two halves */}
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
          {/* Company - First Half */}
          <div className="flex items-center gap-2 min-w-0">
            <Building size={14} className="flex-shrink-0" />
            <span
              className="truncate hover:text-gray-800 transition-colors duration-200"
              title={contact.company || "No company info"}
            >
              {contact.company || "N/A"}
            </span>
          </div>

          {/* Address - Second Half */}
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={14} className="flex-shrink-0" />
            <span
              className="truncate hover:text-gray-800 transition-colors duration-200"
              title={contact.location || "No location info"}
            >
              {contact.location || "N/A"}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2 min-w-0">
            <Phone size={14} className="flex-shrink-0" />
            <span
              className="truncate hover:text-gray-800 transition-colors duration-200"
              title={contact.phone_number || "No phone number"}
            >
              {contact.phone_number || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Mail size={14} className="flex-shrink-0" />
            <span
              className="truncate hover:text-gray-800 transition-colors duration-200"
              title={contact.email_address || "No email address"}
            >
              {contact.email_address || "N/A"}
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
  );
};

export default MiddleManCard;
