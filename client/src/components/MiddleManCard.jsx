import React, { useState, useRef, useEffect } from "react";
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

const MiddleManCard = ({ contact, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const skillsContainerRef = useRef(null);
  const [visibleSkillsCount, setVisibleSkillsCount] = useState(2);

  console.log(contact);

  const handleViewProfile = () => {
    navigate(`/profile/${contact.id}`, { state: contact });
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(contact);
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

  // Calculate how many skills can fit based on available space
  useEffect(() => {
    const calculateVisibleSkills = () => {
      if (skillsContainerRef.current && contact.skills?.length > 0) {
        const containerWidth = skillsContainerRef.current.offsetWidth;
        // Estimate: each skill takes roughly 80-120px, +N counter takes 40px
        // Leave some buffer space
        if (containerWidth < 250) {
          setVisibleSkillsCount(1);
        } else if (containerWidth < 350) {
          setVisibleSkillsCount(2);
        } else {
          setVisibleSkillsCount(3);
        }
      }
    };

    calculateVisibleSkills();
    window.addEventListener('resize', calculateVisibleSkills);
    return () => window.removeEventListener('resize', calculateVisibleSkills);
  }, [contact.skills]);

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

      {/* Skills/Tags with View Profile Button - Better Layout */}
      <div className="flex items-center gap-3">
        {/* Skills Section - Dynamic based on available space */}
        <div 
          ref={skillsContainerRef}
          className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden"
        >
          {contact.skills && contact.skills.length > 0 ? (
            <>
              {/* Render skills based on available space */}
              {contact.skills.slice(0, visibleSkillsCount).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 max-w-[120px] truncate"
                  title={skill}
                >
                  {skill}
                </span>
              ))}
              
              {/* Show remaining count if there are more skills */}
              {contact.skills.length > visibleSkillsCount && (
                <span
                  className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium whitespace-nowrap flex-shrink-0"
                  title={`${contact.skills.length - visibleSkillsCount} more skills: ${contact.skills.slice(visibleSkillsCount).join(", ")}`}
                >
                  +{contact.skills.length - visibleSkillsCount}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400 flex-shrink-0">No skills listed</span>
          )}
        </div>

        {/* View Profile Button - Compact version */}
        <button
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1 flex-shrink-0 whitespace-nowrap"
          onClick={handleViewProfile}
        >
          <ExternalLink size={12} />
          <span className="hidden sm:inline">View Profile</span>
          <span className="sm:hidden">View</span>
        </button>
      </div>
    </div>
  );
};

export default MiddleManCard;
