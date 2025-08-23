import React, { useState } from 'react';
import { ArrowLeft, Briefcase, GraduationCap, StickyNote, MapPin, CheckCircle, Edit3, Users, Shield, Phone, Mail, Calendar, User, Clock, MessageCircle, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

function ProfileView() {
    const [showFullHistory, setShowFullHistory] = useState(false);
    const [showExpandedHierarchy, setShowExpandedHierarchy] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Access the state object passed during navigation
    const contact = location.state || {};
    console.log(contact);

    const handleCloseProfile = () => {
        navigate('/contacts');
    };

    // Helper functions
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return 'N/A';
        return phone;
    };

    const getInitials = (name) => {
        if (!name) return 'N/A';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getContactTypeIcon = (type) => {
        switch (type) {
            case 'meeting':
                return '🤝';
            case 'call':
                return '📞';
            case 'email':
                return '📧';
            case 'message':
                return '💬';
            default:
                return '📝';
        }
    };

    const getContactTypeColor = (type) => {
        switch (type) {
            case 'meeting':
                return 'from-green-100 to-emerald-100 border-green-200';
            case 'call':
                return 'from-blue-100 to-sky-100 border-blue-200';
            case 'email':
                return 'from-purple-100 to-indigo-100 border-purple-200';
            case 'message':
                return 'from-orange-100 to-amber-100 border-orange-200';
            default:
                return 'from-gray-100 to-slate-100 border-gray-200';
        }
    };

    // Process contact data
    const contactData = {
        name: contact.name || 'N/A',
        title: contact.role || 'N/A',
        company: contact.company || 'N/A',
        location: contact.location || (contact.address ? `${contact.address.city}, ${contact.address.state}` : 'N/A'),
        skills: contact.skills || [],
        contactStatus: {
            lastContacted: contact.updated_at ? formatDate(contact.updated_at) : 'N/A',
            verified: contact.events?.some(event => event.verified) || false,
            category: contact.category || 'N/A',
        },
        experience: contact.experiences ? contact.experiences.map(exp => ({
            title: exp.job_title,
            company: exp.company,
            department: exp.department,
            period: `${formatDate(exp.from_date)} - ${exp.to_date ? formatDate(exp.to_date) : 'Present'}`,
        })) : [],
        education: contact.education ? [
            ...(contact.education.pg_course_name ? [{
                level: 'Postgraduate',
                degree: contact.education.pg_course_name,
                institution: `${contact.education.pg_college}, ${contact.education.pg_university}`,
                period: `${formatDate(contact.education.pg_from_date)} - ${formatDate(contact.education.pg_to_date)}`,
            }] : []),
            ...(contact.education.ug_course_name ? [{
                level: 'Undergraduate',
                degree: contact.education.ug_course_name,
                institution: `${contact.education.ug_college}, ${contact.education.ug_university}`,
                period: `${formatDate(contact.education.ug_from_date)} - ${formatDate(contact.education.ug_to_date)}`,
            }] : [])
        ] : [],
        contactInfo: {
            primaryPhone: formatPhoneNumber(contact.phone_number),
            secondaryPhone: formatPhoneNumber(contact.secondary_phone_number),
            primaryEmail: contact.email_address || 'N/A',
            secondaryEmail: contact.secondary_email || 'N/A',
            birthday: contact.dob ? formatDate(contact.dob) : 'N/A',
            maritalStatus: contact.marital_status || 'N/A',
            nationality: contact.nationality || 'N/A',
            emergencyContact: contact.emergency_contact_name || 'N/A',
            emergencyPhone: formatPhoneNumber(contact.emergency_contact_phone_number),
            emergencyRelationship: contact.emergency_contact_relationship || 'N/A',
        },
        address: contact.address ? {
            street: contact.address.street,
            city: contact.address.city,
            state: contact.address.state,
            country: contact.address.country,
            zipCode: contact.address.zipcode,
        } : null,
        events: contact.events || [],
        linkedinUrl: contact.linkedin_url || null,
        initials: contact.initials || getInitials(contact.name),
        avatarColor: contact.avatarColor || '#DB2777',
        // Dummy data for features not yet implemented
        contactHistory: [
            {
                id: 1,
                type: 'email',
                initiator: 'System',
                date: formatDate(contact.created_at),
                time: new Date(contact.created_at).toLocaleTimeString(),
                title: 'Contact Added',
                description: `Contact was added to the system by user ${contact.created_by}`,
                status: 'completed'
            }
        ],
        notes: contact.logger || 'No notes available',
    };

    // Full History Modal Component
    const FullHistoryModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <Clock className="text-white w-4 h-4" />
                        </div>
                        Complete Contact History ({contactData.contactHistory.length} interactions)
                    </h2>
                    <button
                        onClick={() => setShowFullHistory(false)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="space-y-4">
                        {contactData.contactHistory.map((contactHistoryItem, index) => (
                            <div key={contactHistoryItem.id} className={`bg-gradient-to-r ${getContactTypeColor(contactHistoryItem.type)} border rounded-xl p-4 hover:shadow-md transition-all duration-200`}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                                        {getContactTypeIcon(contactHistoryItem.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-600">{contactHistoryItem.initiator}</span>
                                            <span className="text-sm text-gray-500">{contactHistoryItem.date} • {contactHistoryItem.time}</span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">{contactHistoryItem.title}</h4>
                                        <p className="text-gray-700 text-sm">{contactHistoryItem.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-4 shadow-lg">
                <button
                    className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors duration-200 mb-4"
                    onClick={handleCloseProfile}
                >
                    <ArrowLeft className="text-xl" />
                    <span className="font-medium">Back to Contacts</span>
                </button>

                {/* Cover photo area */}
                <div className="h-32 bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-xl mb-6"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-8">
                {/* Main Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 -mt-16 relative z-10 overflow-hidden">
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="relative">
                                <div 
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-white"
                                    style={{ backgroundColor: contactData.avatarColor }}
                                >
                                    {contactData.initials}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl font-bold text-gray-900">{contactData.name}</h1>
                                            {contactData.contactStatus.verified && (
                                                <CheckCircle className="text-blue-500 w-6 h-6" />
                                            )}
                                        </div>
                                        <p className="text-xl text-gray-700 mb-2">{contactData.title}</p>
                                        <div className="flex items-center gap-4 text-gray-600 mb-4">
                                            <span className="flex items-center gap-1">
                                                🏢 {contactData.company}
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
                                                    className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition-colors"
                                                >
                                                    <span className="text-sm font-bold">in</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                                            <Edit3 className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="flex flex-wrap gap-2">
                                    {contactData.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium hover:from-blue-200 hover:to-purple-200 transition-colors cursor-pointer"
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Status */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="text-white w-4 h-4" />
                                    </div>
                                    Contact Status
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            📅
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                                        <p className="font-semibold text-gray-900">{contactData.contactStatus.lastContacted}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            ✓
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">Verified</p>
                                        <p className="font-semibold text-green-600">{contactData.contactStatus.verified ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            🏷️
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">Category</p>
                                        <p className="font-semibold text-purple-600">{contactData.contactStatus.category}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Contact History */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                        <Clock className="text-white w-4 h-4" />
                                    </div>
                                    Recent Contact History
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {contactData.contactHistory.slice(0, 3).map((contactHistoryItem, index) => (
                                        <div key={contactHistoryItem.id} className={`bg-gradient-to-r ${getContactTypeColor(contactHistoryItem.type)} border rounded-xl p-4 hover:shadow-md transition-all duration-200`}>
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                                                    {getContactTypeIcon(contactHistoryItem.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-gray-600">{contactHistoryItem.initiator}</span>
                                                        <span className="text-sm text-gray-500">{contactHistoryItem.date} • {contactHistoryItem.time}</span>
                                                    </div>
                                                    <h4 className="font-semibold text-gray-900 mb-2">{contactHistoryItem.title}</h4>
                                                    <p className="text-gray-700 text-sm">{contactHistoryItem.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowFullHistory(true)}
                                    className="w-full mt-6 py-3 text-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg font-medium text-gray-700 flex items-center justify-center gap-2"
                                >
                                    View Full History ({contactData.contactHistory.length} interactions)
                                </button>
                            </div>
                        </div>

                        {/* Experience */}
                        {contactData.experience.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <Briefcase className="text-white w-4 h-4" />
                                        </div>
                                        Experience
                                    </h2>
                                </div>
                                <div className="p-6">
                                    {contactData.experience.map((exp, index) => (
                                        <div key={index} className="flex gap-4 mb-6 last:mb-0">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                🏢
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{exp.title}</h3>
                                                <p className="text-blue-600 font-medium mb-1">
                                                    {exp.company} • {exp.department}
                                                </p>
                                                <p className="text-gray-600 text-sm">{exp.period}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {contactData.education.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                            <GraduationCap className="text-white w-4 h-4" />
                                        </div>
                                        Education
                                    </h2>
                                </div>
                                <div className="p-6">
                                    {contactData.education.map((edu, index) => (
                                        <div key={index} className="flex gap-4 mb-6 last:mb-0">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                🎓
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{edu.level}</h3>
                                                <p className="text-purple-600 font-medium mb-1">{edu.degree}</p>
                                                <p className="text-gray-600 text-sm">
                                                    {edu.institution} • {edu.period}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Events */}
                        {contactData.events.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                            <Calendar className="text-white w-4 h-4" />
                                        </div>
                                        Events
                                    </h2>
                                </div>
                                <div className="p-6">
                                    {contactData.events.map((event, index) => (
                                        <div key={event.event_id} className="flex gap-4 mb-6 last:mb-0">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                🎭
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.event_name}</h3>
                                                <p className="text-yellow-600 font-medium mb-1">
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
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes & Logger */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                                        <StickyNote className="text-white w-4 h-4" />
                                    </div>
                                    Notes & Logger
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-amber-400">
                                    <p className="text-gray-700 leading-relaxed">{contactData.notes}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Contact Information */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                        <User className="text-white w-4 h-4" />
                                    </div>
                                    Contact Info
                                </h2>
                            </div>
                            <div className="p-6">
                                {Object.entries(contactData.contactInfo).map(([key, value]) => (
                                    <div key={key} className="mb-4 last:mb-0">
                                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </p>
                                        <p className="font-medium text-gray-900">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Address */}
                        {contactData.address && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                            <MapPin className="text-white w-4 h-4" />
                                        </div>
                                        Address
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-2 text-gray-700">
                                        <p className="font-medium">{contactData.address.street}</p>
                                        <p>{contactData.address.city}, {contactData.address.state}</p>
                                        <p>{contactData.address.country}</p>
                                        <p className="font-medium">{contactData.address.zipCode}</p>
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
