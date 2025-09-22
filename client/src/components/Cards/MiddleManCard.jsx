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

  const handleViewProfile = () => {
    navigate(`/profile/${contact.contact_id}`, { state: contact });
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
  // ---------- helper ----------
  const debounce = (fn, wait = 150) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  // ---------- main ----------
  const calculateVisibleSkills = () => {
    const container = skillsContainerRef.current;
    if (!container || !contact.skills?.length) return;

    const counterWidth = 45;                    // “+N” badge
    const spaceLeft  = container.offsetWidth - counterWidth;
    const pills      = [...container.children].filter(
      (el) => el.dataset.skill === "true"       // mark real pills only
    );

    let used = 0;
    let visible = 0;

    for (const pill of pills) {
      const style      = getComputedStyle(pill);
      const pillWidth  =
        pill.offsetWidth +               // real width
        parseFloat(style.marginLeft) +
        parseFloat(style.marginRight);   // horizontal gap

      if (used + pillWidth > spaceLeft) break;
      used += pillWidth;
      visible += 1;
    }

    // Always show at least one pill
    setVisibleSkillsCount(Math.max(1, visible));
  };

  // initial run and debounced resize listener
  const onResize = debounce(calculateVisibleSkills, 150);

  calculateVisibleSkills();
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, [contact.skills]);


  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 max-w-sm">
  {/* Header with Avatar and Actions */}
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div className="relative">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20 shadow-sm"
          alt={contact.name}
        />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <div className="min-w-0 flex-1">
        <h3
          className="font-semibold text-gray-900 text-base truncate"
          title={contact.name}
        >
          {contact.name}
        </h3>
        <p
          className="text-sm text-gray-500 truncate"
          title={contact.role}
        >
          {contact.role}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shadow-sm ${getCategoryColor(
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
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          onClick={handleDeleteClick}
        >
          <Trash2 size={16} className="text-red-500" />
        </button>
      </div>
    </div>
  </div>

  {/* Contact Details */}
  <div className="space-y-3 mb-4">
    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
      <div className="flex items-center gap-2 min-w-0">
        <Building size={14} className="text-gray-400 flex-shrink-0" />
        <span
          className="truncate hover:text-gray-800 transition-colors duration-200"
          title={contact.company || "No company info"}
        >
          {contact.company || "N/A"}
        </span>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <MapPin size={14} className="text-gray-400 flex-shrink-0" />
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
        <Phone size={14} className="text-gray-400 flex-shrink-0" />
        <span
          className="truncate hover:text-gray-800 transition-colors duration-200"
          title={contact.phone_number || "No phone number"}
        >
          {contact.phone_number || "N/A"}
        </span>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <Mail size={14} className="text-gray-400 flex-shrink-0" />
        <span
          className="truncate hover:text-gray-800 transition-colors duration-200"
          title={contact.email_address || "No email address"}
        >
          {contact.email_address || "N/A"}
        </span>
      </div>
    </div>
  </div>

  {/* Skills + View Profile */}
  <div className="flex items-center gap-3">
    <div
      ref={skillsContainerRef}
      className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden"
    >
      {contact.skills && contact.skills.length > 0 ? (
        <>
          {contact.skills.slice(0, visibleSkillsCount).map((skill, index) => (
            <span
              key={index}
              data-skill="true"
              className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 max-w-[120px] truncate shadow-sm"
              title={skill}
            >
              {skill}
            </span>
          ))}
          {contact.skills.length > visibleSkillsCount && (
            <span
              className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 shadow-sm"
              title={`${contact.skills.length - visibleSkillsCount} more skills: ${contact.skills
                .slice(visibleSkillsCount)
                .join(", ")}`}
            >
              +{contact.skills.length - visibleSkillsCount}
            </span>
          )}
        </>
      ) : (
        <span className="text-xs text-gray-400 flex-shrink-0">
          No skills listed
        </span>
      )}
    </div>

    <button
      className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1 flex-shrink-0 whitespace-nowrap shadow-sm"
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
