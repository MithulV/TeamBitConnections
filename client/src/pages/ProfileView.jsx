import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  StickyNote,
  MapPin,
  CheckCircle,
  Edit3,
  Users,
  Shield,
  Phone,
  Mail,
  Calendar,
  User,
  Clock,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  X,
  UserCheck,
  UserPlus,
  Trash2,
  Settings,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

function ProfileView() {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [showExpandedHierarchy, setShowExpandedHierarchy] = useState(false);
  const [modificationHistory, setModificationHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { role, id } = useAuthStore();

  // Access the state object passed during navigation
  const contact = location.state || {};
  console.log(contact);

  // Fetch modification history from API
  useEffect(() => {
    const fetchModificationHistory = async () => {
      try {
        const contactId = contact.contact_id || contact.id;
        if (!contactId) {
          setIsLoadingHistory(false);
          return;
        }

        const response = await fetch(`http://localhost:8000/api/get-modification-history/${contactId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setModificationHistory(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch modification history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchModificationHistory();
  }, [contact]);

  const handleCloseProfile = () => {
    navigate("/contacts");
  };

  const handleEditProfile = () => {
    navigate("/details-input", {
      state: {
        contact: contact,
        isAddMode: true,
        source: "profile",
        currentUserId: id,
        userRole: role,
        successCallback: {
          message: `${contact.name} has been successfully updated.`,
          refreshData: true,
        },
      },
    });
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "N/A";
    return phone;
  };

  const getInitials = (name) => {
    if (!name) return "N/A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Updated function to get modification type icon
  const getModificationTypeIcon = (modificationType) => {
    switch (modificationType) {
      case "CREATE":
        return <UserPlus className="w-4 h-4" />;
      case "UPDATE":
        return <Settings className="w-4 h-4" />;
      case "USER UPDATE":
        return <Edit3 className="w-4 h-4" />;
      case "USER VERIFY":
        return <UserCheck className="w-4 h-4" />;
      case "ASSIGN":
        return <Users className="w-4 h-4" />;
      case "DELETE":
        return <Trash2 className="w-4 h-4" />;
      case "CONTACT":
        return <Phone className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  // Updated function to get modification type color
  const getModificationTypeColor = (modificationType) => {
    switch (modificationType) {
      case "CREATE":
        return "from-green-100 to-emerald-100 border-green-200 text-green-700";
      case "UPDATE":
        return "from-blue-100 to-sky-100 border-blue-200 text-blue-700";
      case "USER UPDATE":
        return "from-orange-100 to-amber-100 border-orange-200 text-orange-700";
      case "USER VERIFY":
        return "from-purple-100 to-indigo-100 border-purple-200 text-purple-700";
      case "ASSIGN":
        return "from-cyan-100 to-teal-100 border-cyan-200 text-cyan-700";
      case "DELETE":
        return "from-red-100 to-rose-100 border-red-200 text-red-700";
      case "CONTACT":
        return "from-pink-100 to-fuchsia-100 border-pink-200 text-pink-700";
      default:
        return "from-gray-100 to-slate-100 border-gray-200 text-gray-700";
    }
  };

  const getContactTypeIcon = (type) => {
    switch (type) {
      case "meeting":
        return "🤝";
      case "call":
        return "📞";
      case "email":
        return "📧";
      case "message":
        return "💬";
      default:
        return "📝";
    }
  };

  const getContactTypeColor = (type) => {
    switch (type) {
      case "meeting":
        return "from-green-100 to-emerald-100 border-green-200";
      case "call":
        return "from-blue-100 to-sky-100 border-blue-200";
      case "email":
        return "from-purple-100 to-indigo-100 border-purple-200";
      case "message":
        return "from-orange-100 to-amber-100 border-orange-200";
      default:
        return "from-gray-100 to-slate-100 border-gray-200";
    }
  };

  // Process contact data
  const contactData = {
    name: contact.name || "N/A",
    title: contact.role || "N/A",
    company: contact.company || "N/A",
    location:
      contact.location ||
      (contact.address
        ? `${contact.address.city}, ${contact.address.state}`
        : "N/A"),
    skills: contact.skills || [],
    contactStatus: {
      lastContacted: contact.updated_at
        ? formatDate(contact.updated_at)
        : "N/A",
      verified: contact.events?.some((event) => event.verified) || false,
      category: contact.category || "N/A",
    },
    experience: contact.experiences
      ? contact.experiences.map((exp) => ({
          title: exp.job_title,
          company: exp.company,
          department: exp.department,
          period: `${formatDate(exp.from_date)} - ${
            exp.to_date ? formatDate(exp.to_date) : "Present"
          }`,
        }))
      : [],
    education: contact.education
      ? [
          ...(contact.education.pg_course_name
            ? [
                {
                  level: "Postgraduate",
                  degree: contact.education.pg_course_name,
                  institution: `${contact.education.pg_college}, ${contact.education.pg_university}`,
                  period: `${formatDate(
                    contact.education.pg_from_date
                  )} - ${formatDate(contact.education.pg_to_date)}`,
                },
              ]
            : []),
          ...(contact.education.ug_course_name
            ? [
                {
                  level: "Undergraduate",
                  degree: contact.education.ug_course_name,
                  institution: `${contact.education.ug_college}, ${contact.education.ug_university}`,
                  period: `${formatDate(
                    contact.education.ug_from_date
                  )} - ${formatDate(contact.education.ug_to_date)}`,
                },
              ]
            : []),
        ]
      : [],
    contactInfo: {
      primaryPhone: formatPhoneNumber(contact.phone_number),
      secondaryPhone: formatPhoneNumber(contact.secondary_phone_number),
      primaryEmail: contact.email_address || "N/A",
      secondaryEmail: contact.secondary_email || "N/A",
      birthday: contact.dob ? formatDate(contact.dob) : "N/A",
      maritalStatus: contact.marital_status || "N/A",
      nationality: contact.nationality || "N/A",
      emergencyContact: contact.emergency_contact_name || "N/A",
      emergencyPhone: formatPhoneNumber(contact.emergency_contact_phone_number),
      emergencyRelationship: contact.emergency_contact_relationship || "N/A",
    },
    address: contact.address
      ? {
          street: contact.address.street,
          city: contact.address.city,
          state: contact.address.state,
          country: contact.address.country,
          zipCode: contact.address.zipcode,
        }
      : null,
    events: contact.events || [],
    linkedinUrl: contact.linkedin_url || null,
    initials: contact.initials || getInitials(contact.name),
    avatarColor: contact.avatarColor || "#DB2777",
    notes: contact.logger || "No notes available",
  };

  // Combine modification history with any existing dummy data
  const combinedContactHistory = [
    ...modificationHistory.map(item => ({
      id: item.id,
      type: "modification",
      modificationType: item.modification_type,
      initiator: item.username,
      assignedTo: item.assigned_to_username,
      date: formatDate(item.created_at),
      time: new Date(item.created_at).toLocaleTimeString(),
      title: item.modification_type.replace("_", " "),
      description: item.description,
      created_at: item.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Full History Modal Component
  const FullHistoryModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Clock className="text-white w-4 h-4" />
            </div>
            Complete Contact History ({combinedContactHistory.length} interactions)
          </h2>
          <button
            onClick={() => setShowFullHistory(false)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-50">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading history...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {combinedContactHistory.map((historyItem, index) => (
                <div
                  key={`${historyItem.type}-${historyItem.id}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gradient-to-br ${
                      historyItem.type === 'modification' 
                        ? getModificationTypeColor(historyItem.modificationType)
                        : getContactTypeColor(historyItem.type)
                    }`}>
                      {historyItem.type === 'modification' 
                        ? getModificationTypeIcon(historyItem.modificationType)
                        : getContactTypeIcon(historyItem.type)
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">
                            {historyItem.initiator}
                          </span>
                          {historyItem.assignedTo && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              → {historyItem.assignedTo}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {historyItem.date} • {historyItem.time}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                        {historyItem.title}
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {historyItem.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with clean design */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            onClick={handleCloseProfile}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Contacts</span>
          </button>
          <div className="text-sm text-gray-500">Profile View</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Profile Card - Minimal and Professional */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="p-8 border-l-4 border-l-blue-500">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full shadow-sm flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: contactData.avatarColor }}
                >
                  {contactData.initials}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {contactData.name}
                      </h1>
                      {contactData.contactStatus.verified && (
                        <CheckCircle className="text-blue-500 w-5 h-5" />
                      )}
                    </div>
                    <p className="text-lg text-gray-600 mb-2">
                      {contactData.title}
                    </p>
                    <div className="flex items-center gap-4 text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {contactData.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {contactData.location}
                      </span>
                    </div>

                    {/* Social links */}
                    <div className="flex gap-3 mb-6">
                      {contactData.linkedinUrl && (
                        <a
                          href={contactData.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                        >
                          <span className="text-sm font-bold">in</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        handleEditProfile();
                      }}
                    >
                      <Edit3 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {contactData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Status - Card Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Contact Status
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border border-gray-100 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                    <p className="font-semibold text-gray-900">
                      {contactData.contactStatus.lastContacted}
                    </p>
                  </div>
                  <div className="text-center p-4 border border-gray-100 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Verified</p>
                    <p className="font-semibold text-green-600">
                      {contactData.contactStatus.verified ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="text-center p-4 border border-gray-100 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-semibold text-purple-600">
                      {contactData.contactStatus.category}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Contact History - Timeline Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Recent Contact History
                </h2>
              </div>
              <div className="p-6">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    <span className="ml-2 text-gray-600">Loading recent history...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {combinedContactHistory.slice(0, 3).map((historyItem, index) => (
                      <div
                        key={`recent-${historyItem.type}-${historyItem.id}`}
                        className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 bg-gradient-to-br ${
                          historyItem.type === 'modification' 
                            ? getModificationTypeColor(historyItem.modificationType)
                            : getContactTypeColor(historyItem.type)
                        }`}>
                          {historyItem.type === 'modification' 
                            ? getModificationTypeIcon(historyItem.modificationType)
                            : getContactTypeIcon(historyItem.type)
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-600">
                                {historyItem.initiator}
                              </span>
                              {historyItem.assignedTo && (
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                  → {historyItem.assignedTo}
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {historyItem.date} • {historyItem.time}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1 capitalize">
                            {historyItem.title}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {historyItem.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowFullHistory(true)}
                  className="w-full mt-4 py-2 text-center bg-indigo-50 hover:bg-indigo-100 transition-colors rounded-lg font-medium text-indigo-700 border border-indigo-200"
                >
                  View Full History ({combinedContactHistory.length} interactions)
                </button>
              </div>
            </div>

            {/* Experience - Professional List */}
            {contactData.experience.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Experience
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {contactData.experience.map((exp, index) => (
                      <div
                        key={index}
                        className="flex gap-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {exp.title}
                          </h3>
                          <p className="text-blue-600 font-medium mb-1">
                            {exp.company} • {exp.department}
                          </p>
                          <p className="text-gray-500 text-sm">{exp.period}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Education - Academic Style */}
            {contactData.education.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-purple-50 border-b border-purple-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    Education
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {contactData.education.map((edu, index) => (
                      <div
                        key={index}
                        className="flex gap-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0"
                      >
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {edu.level}
                          </h3>
                          <p className="text-purple-600 font-medium mb-1">
                            {edu.degree}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {edu.institution} • {edu.period}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Events - Event Cards */}
            {contactData.events.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    Events
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {contactData.events.map((event, index) => (
                      <div
                        key={event.event_id}
                        className="border border-amber-200 rounded-lg p-4 bg-amber-50"
                      >
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {event.event_name}
                            </h3>
                            <p className="text-amber-700 font-medium mb-1">
                              {event.event_role} • {event.event_held_organization}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {formatDate(event.event_date)} • {event.event_location}
                            </p>
                            {event.verified && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notes & Logger - Quote Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-orange-50 border-b border-orange-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-orange-600" />
                  Notes & Logger
                </h2>
              </div>
              <div className="p-6">
                <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed italic">
                    "{contactData.notes}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Style */}
          <div className="space-y-6">
            {/* Contact Information - Clean List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-800 text-white">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(contactData.contactInfo).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="font-medium text-gray-900 text-right">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Address - Map Style */}
            {contactData.address && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-emerald-600 text-white">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address
                  </h2>
                </div>
                <div className="p-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="space-y-2 text-gray-700">
                      <p className="font-medium">{contactData.address.street}</p>
                      <p>
                        {contactData.address.city}, {contactData.address.state}
                      </p>
                      <p>{contactData.address.country}</p>
                      <p className="font-medium text-emerald-700">
                        {contactData.address.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full History Modal */}
      {showFullHistory && <FullHistoryModal />}
    </div>
  );
}

export default ProfileView;
