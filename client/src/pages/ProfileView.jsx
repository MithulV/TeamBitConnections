import React, { useState } from 'react';
import { ArrowLeft, Briefcase, GraduationCap, StickyNote, MapPin, CheckCircle, Edit3, Users, Shield, Phone, Mail, Calendar, User, Clock, MessageCircle, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ProfileView() {
    const [showFullHistory, setShowFullHistory] = useState(false);
    const [showExpandedHierarchy, setShowExpandedHierarchy] = useState(false);
    const navigate = useNavigate();
    const handleCloseProfile = () => {
        navigate('/contacts');
    };

    const dummyData = {
        name: 'Sarah Johnson',
        title: 'Senior AI Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        skills: ['Machine Learning', 'Python', 'TensorFlow', 'React', 'AWS', 'Docker', 'Kubernetes', 'Node.js'],
        contactStatus: {
            lastContacted: '1/15/2024',
            verified: true,
            category: 'A',
        },
        experience: [
            {
                title: 'Senior AI Engineer',
                company: 'TechCorp Inc.',
                department: 'AI Research',
                period: '3/1/2020 - Present',
            },
            {
                title: 'AI Engineer',
                company: 'DataTech Solutions',
                department: 'Machine Learning',
                period: '6/1/2018 - 2/28/2020',
            },
            {
                title: 'Software Engineer',
                company: 'StartupABC',
                department: 'Engineering',
                period: '8/1/2016 - 5/31/2018',
            },
        ],
        education: [
            {
                level: 'Postgraduate',
                degree: 'Master of Science in Computer Science',
                institution: 'Stanford University',
                period: '2014-2016',
            },
            {
                level: 'Undergraduate',
                degree: 'Bachelor of Science in Computer Engineering',
                institution: 'UC Berkeley',
                period: '2010-2014',
            },
        ],
        contactInfo: {
            primaryPhone: '+1 (555) 123-4567',
            secondaryPhone: '+1 (555) 987-6543',
            primaryEmail: 'sarah.johnson@techcorp.com',
            secondaryEmail: 'sarah.j.personal@gmail.com',
            birthday: '3/15/1990',
            maritalStatus: 'Single',
            nationality: 'American',
            addedBy: 'John Smith',
        },
        address: {
            street: '123 Tech Street, Apt 4B',
            city: 'San Francisco',
            state: 'California',
            country: 'United States',
            zipCode: '94105',
        },
        contactHierarchy: [
            {
                name: 'John Smith',
                title: 'CTO at TechCorp',
                avatar: 'JS',
                relationship: 'Direct Contact'
            },
            {
                name: 'Alice Brown',
                title: 'VP Engineering',
                avatar: 'AB',
                referredBy: 'John Smith',
                relationship: 'Referred Contact'
            },
            {
                name: 'Mike Chen',
                title: 'Lead Data Scientist',
                avatar: 'MC',
                referredBy: 'Sarah Johnson',
                relationship: 'Mutual Connection'
            },
            {
                name: 'Emma Wilson',
                title: 'Product Manager',
                avatar: 'EW',
                relationship: 'Team Member'
            },
            {
                name: 'David Lee',
                title: 'Software Architect',
                avatar: 'DL',
                relationship: 'Colleague'
            },
            {
                name: 'Lisa Zhang',
                title: 'UX Designer',
                avatar: 'LZ',
                referredBy: 'Emma Wilson',
                relationship: 'Cross-functional Partner'
            },
            {
                name: 'Robert Taylor',
                title: 'DevOps Engineer',
                avatar: 'RT',
                relationship: 'Infrastructure Partner'
            },
            {
                name: 'Jennifer Martinez',
                title: 'Data Analyst',
                avatar: 'JM',
                referredBy: 'Mike Chen',
                relationship: 'Data Team'
            }
        ],
        contactHistory: [
            {
                id: 1,
                type: 'meeting',
                initiator: 'You',
                date: '1/15/2024',
                time: '2:30 PM',
                title: 'Discussed potential collaboration on AI project',
                description: 'Had an in-depth discussion about machine learning frameworks and potential partnership opportunities.',
                status: 'completed'
            },
            {
                id: 2,
                type: 'email',
                initiator: 'Sarah Johnson',
                date: '1/8/2024',
                time: '10:45 AM',
                title: 'Shared insights about latest ML frameworks',
                description: 'Sarah sent detailed analysis of TensorFlow 2.15 updates and their impact on production systems.',
                status: 'completed'
            },
            {
                id: 3,
                type: 'call',
                initiator: 'You',
                date: '12/20/2023',
                time: '4:15 PM',
                title: 'Initial introduction through John Smith',
                description: 'First contact call facilitated by John Smith. Discussed background and mutual interests in AI research.',
                status: 'completed'
            },
            {
                id: 4,
                type: 'message',
                initiator: 'Sarah Johnson',
                date: '11/28/2023',
                time: '11:30 AM',
                title: 'Connected on LinkedIn',
                description: 'Sarah accepted LinkedIn connection request and shared her recent publication on computer vision.',
                status: 'completed'
            },
            {
                id: 5,
                type: 'meeting',
                initiator: 'You',
                date: '11/15/2023',
                time: '3:00 PM',
                title: 'Tech Conference - AI Summit 2023',
                description: 'Met at the AI Summit conference during the networking session. Discussed emerging trends in machine learning.',
                status: 'completed'
            },
            {
                id: 6,
                type: 'call',
                initiator: 'Sarah Johnson',
                date: '10/30/2023',
                time: '1:15 PM',
                title: 'Follow-up on conference discussion',
                description: 'Sarah called to continue our conversation about AI trends and shared her thoughts on GPT-4 implementation.',
                status: 'completed'
            },
            {
                id: 7,
                type: 'email',
                initiator: 'You',
                date: '10/22/2023',
                time: '9:30 AM',
                title: 'Sent project proposal',
                description: 'Forwarded detailed project proposal for the computer vision collaboration we discussed.',
                status: 'completed'
            },
            {
                id: 8,
                type: 'message',
                initiator: 'Sarah Johnson',
                date: '10/15/2023',
                time: '6:45 PM',
                title: 'Shared research paper',
                description: 'Sarah shared her latest research paper on neural network optimization techniques.',
                status: 'completed'
            }
        ],
        notes: 'Had a great conversation about ML trends in 2024. She mentioned working on a new computer vision project and is interested in collaborating on AI research. Follow up in 2 weeks about the potential partnership. Had a great conversation about ML trends in 2024. She mentioned working on a new computer vision project and is interested in collaborating on AI research. Follow up in 2 weeks about the potential partnership',
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

    // Full History Modal Component
    const FullHistoryModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <Clock className="text-white w-4 h-4" />
                        </div>
                        Complete Contact History ({dummyData.contactHistory.length} interactions)
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
                        {dummyData.contactHistory.map((contact, index) => (
                            <div key={contact.id} className={`bg-gradient-to-r ${getContactTypeColor(contact.type)} border rounded-xl p-4 hover:shadow-md transition-all duration-200`}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                                        {getContactTypeIcon(contact.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-600">{contact.initiator}</span>
                                            <span className="text-sm text-gray-500">{contact.date} • {contact.time}</span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">{contact.title}</h4>
                                        <p className="text-gray-700 text-sm">{contact.description}</p>
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
                                <img
                                    src="https://xsgames.co/randomusers/assets/avatars/male/68.jpg"
                                    alt="Profile of Sarah Johnson"
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl font-bold text-gray-900">{dummyData.name}</h1>
                                            {dummyData.contactStatus.verified && (
                                                <CheckCircle className="text-blue-500 w-6 h-6" />
                                            )}
                                        </div>
                                        <p className="text-xl text-gray-700 mb-2">{dummyData.title}</p>
                                        <div className="flex items-center gap-4 text-gray-600 mb-4">
                                            <span className="flex items-center gap-1">
                                                🏢 {dummyData.company}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {dummyData.location}
                                            </span>
                                        </div>
                                        
                                        {/* Social links */}
                                        <div className="flex gap-3 mb-6">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition-colors">
                                                <span className="text-sm font-bold">in</span>
                                            </div>
                                            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-500 transition-colors">
                                                <span className="text-sm">T</span>
                                            </div>
                                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-gray-900 transition-colors">
                                                <span className="text-sm">G</span>
                                            </div>
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
                                    {dummyData.skills.map((skill) => (
                                        <span
                                            key={skill}
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
                                        <p className="text-sm text-gray-600 mb-1">Last Contacted</p>
                                        <p className="font-semibold text-gray-900">{dummyData.contactStatus.lastContacted}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            ✓
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">Verified</p>
                                        <p className="font-semibold text-green-600">{dummyData.contactStatus.verified ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            🏷️
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">Category</p>
                                        <p className="font-semibold text-purple-600">{dummyData.contactStatus.category}</p>
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
                                    {dummyData.contactHistory.slice(0, 3).map((contact, index) => (
                                        <div key={contact.id} className={`bg-gradient-to-r ${getContactTypeColor(contact.type)} border rounded-xl p-4 hover:shadow-md transition-all duration-200`}>
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                                                    {getContactTypeIcon(contact.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-gray-600">{contact.initiator}</span>
                                                        <span className="text-sm text-gray-500">{contact.date} • {contact.time}</span>
                                                    </div>
                                                    <h4 className="font-semibold text-gray-900 mb-2">{contact.title}</h4>
                                                    <p className="text-gray-700 text-sm">{contact.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setShowFullHistory(true)}
                                    className="w-full mt-6 py-3 text-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg font-medium text-gray-700 flex items-center justify-center gap-2"
                                >
                                    View Full History ({dummyData.contactHistory.length} interactions)
                                </button>
                            </div>
                        </div>

                        {/* Experience */}
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
                                {dummyData.experience.map((exp, index) => (
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

                        {/* Education */}
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
                                {dummyData.education.map((edu, index) => (
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
                                    <p className="text-gray-700 leading-relaxed">{dummyData.notes}</p>
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
                                {Object.entries(dummyData.contactInfo).map(([key, value]) => (
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
                                    <p className="font-medium">{dummyData.address.street}</p>
                                    <p>{dummyData.address.city}, {dummyData.address.state}</p>
                                    <p>{dummyData.address.country}</p>
                                    <p className="font-medium">{dummyData.address.zipCode}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Hierarchy */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4 border-b">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                                        <Users className="text-white w-4 h-4" />
                                    </div>
                                    Contact Hierarchy
                                </h2>
                            </div>
                            <div className="p-6">
                                {(showExpandedHierarchy ? dummyData.contactHierarchy : dummyData.contactHierarchy.slice(0, 4)).map((contact, index) => (
                                    <div key={index} className="mb-4 last:mb-0">
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                {contact.avatar}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold text-gray-900">{contact.name}</p>
                                                    {contact.relationship === 'Direct Contact' && (
                                                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">{contact.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                        {contact.relationship}
                                                    </span>
                                                </div>
                                                {contact.referredBy && (
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        via {contact.referredBy}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {index < (showExpandedHierarchy ? dummyData.contactHierarchy.length - 1 : Math.min(4, dummyData.contactHierarchy.length) - 1) && (
                                            <div className="ml-8 h-6 border-l-2 border-gray-200"></div>
                                        )}
                                    </div>
                                ))}
                                <button 
                                    onClick={() => setShowExpandedHierarchy(!showExpandedHierarchy)}
                                    className="w-full mt-4 py-2 text-center text-gray-600 hover:text-gray-800 transition-colors border-t pt-4 flex items-center justify-center gap-2"
                                >
                                    {showExpandedHierarchy ? (
                                        <>
                                            Show Less <ChevronUp className="w-4 h-4" />
                                        </>
                                    ) : (
                                        <>
                                            Show More ({dummyData.contactHierarchy.length - 4} more) <ChevronDown className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full History Modal */}
            {showFullHistory && <FullHistoryModal />}
        </div>
    );
}

export default ProfileView;