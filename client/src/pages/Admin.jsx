import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  MapPin,
  Building,
  Camera,
  Handshake,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw,
  Target,
  Award,
  Zap,
  PieChart,
  FileText,
  Bell,
  Star,
  UserPlus,
  Shield,
  Database,
  Globe,
  Settings,
  MapIcon,
  Mail,
  Phone,
  Briefcase,
  BookOpen,
  Heart,
  Lightbulb,
  Network,
  Flame,
  Trophy,
  Rocket,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Gauge,
  Sparkles,
  GitBranch,
  Package,
  TrendingDownIcon,
  BarChart,
  PieChart as PieChartIcon,
  Layers,
  Grid3X3,
  MapPinIcon,
  FileDown,
  FileText as FileIcon,
  Calculator,
  ChevronDown,
  ChevronUp,
  BarChart2
} from "lucide-react";
import { X } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../components/Header";
import Alert from "../components/Alert";
import { useAuthStore } from "../store/AuthStore";
import { format, parseISO, subDays, subMonths, isAfter, startOfDay, endOfDay, differenceInDays, startOfMonth, getDaysInMonth } from "date-fns";
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import { Line, Bar, Doughnut, Radar, Scatter } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
  ArcElement,
  RadialLinearScale
);
// UPDATED: Utility functions for trend calculations
const calculateTrendPercentage = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Calculate percentage of verified contacts vs total
const calculateVerifiedPercentage = (verified, total) => {
  if (total === 0) return 0;
  return Math.round((verified / total) * 100);
};

// Calculate completion percentage for profiles
const calculateCompletionPercentage = (complete, total) => {
  if (total === 0) return 0;
  return Math.round((complete / total) * 100);
};

// Get today's date formatted
const getTodayFormatted = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

// Get yesterday's date formatted
const getYesterdayFormatted = () => {
  return format(subDays(new Date(), 1), 'yyyy-MM-dd');
};

// UPDATED: Deduplication logic for updated_at dates per contact
const getDedupedUpdatesPerDay = (contacts) => {
  const updatedDatesMap = new Map(); // contactId -> Set of unique days

  contacts.forEach(contact => {
    const contactId = contact.contact_id;

    if (!updatedDatesMap.has(contactId)) {
      updatedDatesMap.set(contactId, new Set());
    }

    const dateSet = updatedDatesMap.get(contactId);

    // Collect all update dates from all related tables
    const updateCandidates = [];

    if (contact.updated_at) updateCandidates.push(contact.updated_at);
    if (contact.address_updated_at) updateCandidates.push(contact.address_updated_at);

    // Handle multiple dates from education
    if (contact.education_updated_at) {
      const eduUpdates = contact.education_updated_at.split('; ').filter(Boolean);
      updateCandidates.push(...eduUpdates);
    }

    // Handle multiple dates from experience
    if (contact.experience_updated_at) {
      const expUpdates = contact.experience_updated_at.split('; ').filter(Boolean);
      updateCandidates.push(...expUpdates);
    }

    // Handle multiple dates from events
    if (contact.event_details_updated_at) {
      const eventUpdates = contact.event_details_updated_at.split('; ').filter(Boolean);
      updateCandidates.push(...eventUpdates);
    }

    // Deduplicate per contact per day
    updateCandidates.forEach(dateStr => {
      if (!dateStr) return;
      try {
        const dateObj = parseISO(dateStr);
        if (!isNaN(dateObj)) {
          const dayKey = format(dateObj, 'yyyy-MM-dd');
          dateSet.add(dayKey); // Set automatically deduplicates
        }
      } catch (error) {
        console.warn('Invalid date:', dateStr);
      }
    });
  });

  // Aggregate counts across all contacts per day
  const aggregateCounts = {};

  for (const dateSet of updatedDatesMap.values()) {
    dateSet.forEach(day => {
      aggregateCounts[day] = (aggregateCounts[day] || 0) + 1;
    });
  }

  return aggregateCounts;
};

// Helper function for processing created dates (only from contacts table)
const getAllCreatedDates = (contacts) => {
  return contacts
    .map(contact => contact.created_at)
    .filter(Boolean);
};

// Tooltip Component for clipped text
const TextWithTooltip = ({ text, className = "", maxWidth = "150px" }) => {
  return (
    <span
      className={`${className}`}
      title={text}
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block',
        maxWidth: maxWidth,
        cursor: 'help'
      }}
    >
      {text}
    </span>
  );
};

// UPDATED: Enhanced Stat Card Component with GREEN text for specific cards
const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, status, subtext, valueColor }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-shadow duration-300 relative">
    {/* Fixed Icon Position - Top Right */}
    <div className={`absolute top-4 right-4 p-3 rounded-full ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>

    {/* Content Area - Fixed Width */}
    <div className="pr-16">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor || 'text-gray-900'}`}>{value}</p>
      {subtext && (
        <div className="flex items-center gap-1 mt-1">
          <p className="text-xs text-gray-500">{subtext}</p>
          {trend && trendValue !== undefined && (
            <>
              {trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}
              >
                {Math.abs(trendValue)}%
              </span>
            </>
          )}
        </div>
      )}
    </div>
  </div>
);

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon: Icon, onClick, color, badge }) => (
  <div
    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 group relative"
    onClick={onClick}
  >
    {badge && (
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
        {badge}
      </div>
    )}
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color} group-hover:scale-105 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);
// NEW: Compact Performance Metrics Card
const PerformanceMetricsCard = ({ contacts, stats }) => {
  const metrics = useMemo(() => {
    const total = contacts.length;
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);

    // Weekly activity
    const weeklyNewContacts = contacts.filter(c => {
      if (!c.created_at) return false;
      const createdDate = parseISO(c.created_at);
      return createdDate >= sevenDaysAgo;
    }).length;

    // Active events (recent)
    const activeEvents = contacts.filter(c => c.event_name && c.event_name.trim() !== '').length;

    // Data completeness score
    const completeProfiles = contacts.filter(c =>
      c.email_address && c.phone_number && c.skills && c.company_name
    ).length;

    const completenessScore = total > 0 ? Math.round((completeProfiles / total) * 100) : 0;

    // Professional network strength
    const linkedinContacts = contacts.filter(c => c.linkedin_url && c.linkedin_url.trim() !== '').length;
    const networkStrength = total > 0 ? Math.round((linkedinContacts / total) * 100) : 0;

    return {
      weeklyActivity: weeklyNewContacts,
      dataCompleteness: completenessScore,
      networkStrength,
      activeEvents: activeEvents,
      verificationRate: total > 0 ? Math.round((stats.verifiedContacts / total) * 100) : 0
    };
  }, [contacts, stats]);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        <div className="ml-auto bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
          Live Stats
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Row 1 */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700">Weekly Activity</p>
              <p className="text-lg font-bold text-blue-800">{metrics.weeklyActivity}</p>
            </div>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700">Data Complete</p>
              <p className="text-lg font-bold text-green-800">{metrics.dataCompleteness}%</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-700">Network Strength</p>
              <p className="text-lg font-bold text-purple-800">{metrics.networkStrength}%</p>
            </div>
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-700">Event Participants</p>
              <p className="text-lg font-bold text-orange-800">{metrics.activeEvents}</p>
            </div>
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Bottom summary */}
      <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Verification Rate:</span>
          <span className="font-bold text-gray-900">{metrics.verificationRate}%</span>
        </div>
      </div>
    </div>
  );
};

// UPDATED: Enhanced Contacts Chart Component with proper deduplication
const ContactsChart = ({ contacts, startDate, endDate, dateRangeType, setStartDate, setEndDate, setDateRangeType }) => {
  const handlePredefinedRange = (range) => {
    const today = new Date();
    let newStartDate;

    switch (range) {
      case "last7days":
        newStartDate = subDays(today, 7);
        break;
      case "last30days":
        newStartDate = subDays(today, 30);
        break;
      case "lastMonth":
        newStartDate = subMonths(today, 1);
        break;
      case "last3Months":
        newStartDate = subMonths(today, 3);
        break;
      case "last6Months":
        newStartDate = subMonths(today, 6);
        break;
      case "lastYear":
        newStartDate = subMonths(today, 12);
        break;
      default:
        return;
    }

    setStartDate(startOfDay(newStartDate));
    setEndDate(endOfDay(today));
    setDateRangeType(range);
  };

  const processChartData = useMemo(() => {
    const contactsArray = Array.isArray(contacts) ? contacts : [];
    // Get created dates (only from contacts table)
    const allCreatedDates = getAllCreatedDates(contactsArray);

    // Get deduplicated updated dates per contact per day
    const allUpdatesPerDay = getDedupedUpdatesPerDay(contactsArray);
    const createdDates = {};
    const updatedDates = {};
    // Process created dates within date range
    allCreatedDates.forEach(dateStr => {
      if (!dateStr) return;
      try {
        const date = parseISO(dateStr);
        if (isAfter(date, startOfDay(startDate)) && date <= endOfDay(endDate)) {
          const dayKey = format(date, 'yyyy-MM-dd');
          createdDates[dayKey] = (createdDates[dayKey] || 0) + 1;
        }
      } catch (error) {
        console.warn('Invalid created date:', dateStr);
      }
    });
    // Process updated dates within date range (already deduplicated)
    Object.entries(allUpdatesPerDay).forEach(([dayKey, count]) => {
      try {
        const date = parseISO(dayKey);
        if (isAfter(date, startOfDay(startDate)) && date <= endOfDay(endDate)) {
          updatedDates[dayKey] = count;
        }
      } catch (error) {
        console.warn('Invalid updated date:', dayKey);
      }
    });

    const allDates = Array.from(
      new Set([...Object.keys(createdDates), ...Object.keys(updatedDates)])
    ).sort();

    return {
      labels: allDates,
      datasets: [
        {
          label: "Contacts Created",
          data: allDates.map((date) => createdDates[date] || 0),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Records Updated',
          data: allDates.map(date => updatedDates[date] || 0),
          borderColor: 'rgb(139, 69, 19)',
          backgroundColor: 'rgba(139, 69, 19, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [contacts, startDate, endDate]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      filler: {
        propagate: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          maxTicksLimit: 15,
        },
      },
    },
    interaction: {
      intersect: false,
    },
  };

  const predefinedRanges = [
    { key: 'last7days', label: 'Last 7 Days' },
    { key: 'last30days', label: 'Last 30 Days' },
    { key: 'lastMonth', label: 'Last Month' },
    { key: 'last3Months', label: 'Last 3 Months' },
    { key: 'last6Months', label: 'Last 6 Months' },
    { key: 'lastYear', label: 'Last Year' },
  ];

  return (
    <div>
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {predefinedRanges.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handlePredefinedRange(key)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${dateRangeType === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setDateRangeType('custom')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${dateRangeType === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Custom Range
          </button>
        </div>

        {dateRangeType === 'custom' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                dateFormat="MMM dd, yyyy"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date()}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                dateFormat="MMM dd, yyyy"
              />
            </div>
          </div>
        )}
      </div>

      <div className="h-64">
        <Line data={processChartData} options={chartOptions} />
      </div>

      <div className="mt-3 text-xs text-gray-500 flex justify-between">
        <span>
          Range: {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
        </span>
        <span>
          Total in range: {processChartData.datasets[0].data.reduce((a, b) => a + b, 0)} created, {' '}
          {processChartData.datasets[1].data.reduce((a, b) => a + b, 0)} updated
        </span>
      </div>
    </div>
  );
};

// Skills Horizontal Bar Chart
const SkillsHorizontalBarChart = ({ contacts }) => {
  const barData = useMemo(() => {
    const skillsMap = {};

    contacts.forEach(contact => {
      if (contact.skills) {
        const skills = contact.skills.split(',').map(s => s.trim().toLowerCase());
        skills.forEach(skill => {
          if (skill && skill.length > 0) {
            skillsMap[skill] = (skillsMap[skill] || 0) + 1;
          }
        });
      }
    });

    const allSkills = Object.entries(skillsMap)
      .sort(([, a], [, b]) => b - a);

    const labels = allSkills.map(([skill]) =>
      skill.charAt(0).toUpperCase() + skill.slice(1)
    );

    const skillCounts = allSkills.map(([, count]) => count);

    return {
      labels,
      datasets: [{
        label: 'Number of People',
        data: skillCounts,
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(139, 92, 246, 0.9)',
        hoverBorderColor: 'rgba(139, 92, 246, 1)',
      }]
    };
  }, [contacts]);

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          title: (context) => `${context[0].label}`,
          label: (context) => `${context.parsed.x} ${context.parsed.x === 1 ? 'person' : 'people'}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Number of People',
        },
      },
      y: {
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: 'Skills',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">All Skills Distribution</h2>
        <div className="ml-auto bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
          Horizontal View
        </div>
      </div>
      <div className="h-96 overflow-y-auto">
        <div style={{ height: Math.max(400, barData.labels.length * 25) }}>
          <Bar data={barData} options={options} />
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500 text-center">
        Showing all {barData.labels?.length || 0} unique skills with distribution counts
      </div>
    </div>
  );
};

// Events Bar Chart
const EventsBarChart = ({ contacts }) => {
  const chartData = useMemo(() => {
    const eventCounts = {};

    contacts.forEach(contact => {
      if (contact.event_name) {
        const events = contact.event_name.split(';').map(e => e.trim());
        events.forEach(event => {
          if (event) eventCounts[event] = (eventCounts[event] || 0) + 1;
        });
      }
    });

    const sortedEvents = Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      labels: sortedEvents.map(([event]) =>
        event.length > 15 ? event.substring(0, 15) + '...' : event
      ),
      datasets: [
        {
          label: 'Participants',
          data: sortedEvents.map(([, count]) => count),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [contacts]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Top Events</h2>
      </div>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// Recent Events Timeline
// Enhanced Recent Events Timeline with Modification History (like ProfileView)
const RecentEventsTimeline = ({ contacts }) => {
  const [modificationHistory, setModificationHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showFullHistory, setShowFullHistory] = useState(false);

  // Fetch modification history from API (similar to ProfileView)
  useEffect(() => {
    const fetchModificationHistory = async () => {
      try {
        // You might need to adjust this API endpoint to get system-wide modifications
        const response = await axios.get(`http://localhost:8000/api/get-all-modification-history/`);
        const data = response.data;

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
  }, []);

  // Helper functions from ProfileView
  const getModificationTypeIcon = (modificationType) => {
    switch (modificationType) {
      case "CREATE":
        return <UserPlus className="w-4 h-4" />;
      case "UPDATE":
        return <Edit className="w-4 h-4" />;
      case "USER UPDATE":
        return <FileText className="w-4 h-4" />;
      case "USER VERIFY":
        return <CheckCircle className="w-4 h-4" />;
      case "ASSIGN":
        return <Users className="w-4 h-4" />;
      case "DELETE":
        return <Trash2 className="w-4 h-4" />;
      case "CONTACT":
        return <Phone className="w-4 h-4" />;
      case "UPDATE USER EVENT": // NEW CASE for adding events
        return <Calendar className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };


const getModificationTypeTitle = (modificationType) => {
  switch (modificationType) {
    case "CREATE":
      return "Contact Created";
    case "UPDATE":
      return "Profile Updated";
    case "USER UPDATE":
      return "Information Modified";
    case "USER VERIFY":
      return "Profile Verified";
    case "ASSIGN":
      return "Contact Assigned";
    case "DELETE":
      return "Contact Removed";
    case "CONTACT":
      return "Contact Activity";
    case "UPDATE USER EVENT": // NEW CASE for adding events
      return "Event Added";
    default:
      return "Activity Logged";
  }
};


const getModificationTypeColor = (modificationType) => {
  switch (modificationType) {
    case "CREATE":
      return "from-emerald-50 to-green-100 border-emerald-200 text-emerald-700";
    case "UPDATE":
      return "from-blue-50 to-indigo-100 border-blue-200 text-blue-700";
    case "USER UPDATE":
      return "from-amber-50 to-orange-100 border-amber-200 text-amber-700";
    case "USER VERIFY":
      return "from-violet-50 to-purple-100 border-violet-200 text-violet-700";
    case "ASSIGN":
      return "from-cyan-50 to-teal-100 border-cyan-200 text-cyan-700";
    case "DELETE":
      return "from-rose-50 to-red-100 border-rose-200 text-rose-700";
    case "CONTACT":
      return "from-pink-50 to-fuchsia-100 border-pink-200 text-pink-700";
    case "UPDATE USER EVENT": // NEW CASE for adding events
      return "from-yellow-50 to-amber-100 border-yellow-200 text-yellow-700";
    default:
      return "from-slate-50 to-gray-100 border-slate-200 text-slate-700";
  }
};


  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Combine modification history with existing contact data
  const combinedActivityHistory = [
    ...modificationHistory.map(item => ({
      id: item.id,
      type: "modification",
      modificationType: item.modification_type,
      initiator: item.username,
      assignedTo: item.assigned_to_username,
      date: formatDate(item.created_at),
      time: new Date(item.created_at).toLocaleTimeString(),
      title: getModificationTypeTitle(item.modification_type),
      description: item.description,
      contactName: item.contact_name || 'Unknown Contact',
      created_at: item.created_at,
    })),
    // Add recent contact additions
    ...contacts.slice(0, 10).map(contact => ({
      id: `contact-${contact.contact_id}`,
      type: "contact_added",
      modificationType: "CREATE",
      initiator: contact.added_by || 'System',
      title: `${contact.name || 'Unknown'} joined`,
      description: contact.event_name ? `Event: ${contact.event_name.split(';')[0]}` : `Category: ${contact.category || 'N/A'}`,
      contactName: contact.name,
      date: formatDate(contact.created_at),
      time: contact.created_at ? new Date(contact.created_at).toLocaleTimeString() : 'Unknown',
      category: contact.category,
      created_at: contact.created_at,
    }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 15);

  // Full History Modal Component (like ProfileView)
  const FullHistoryModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                System Activity Timeline
              </h2>
              <p className="text-slate-300 text-sm">
                {combinedActivityHistory.length} system interactions tracked
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFullHistory(false)}
            className="p-2 hover:bg-slate-700 rounded-xl transition-colors group"
          >
            <X className="w-5 h-5 text-slate-300 group-hover:text-white" />
          </button>
        </div>

        {/* Enhanced Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-gradient-to-br from-slate-50 to-gray-100">
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-indigo-600 border-t-transparent"></div>
              <span className="mt-4 text-gray-600 font-medium">Loading system activity...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {combinedActivityHistory.map((historyItem, index) => (
                <div
                  key={`${historyItem.type}-${historyItem.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Enhanced Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br ${getModificationTypeColor(historyItem.modificationType)}`}>
                      {getModificationTypeIcon(historyItem.modificationType)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Enhanced Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                            {historyItem.initiator}
                          </span>
                          {historyItem.assignedTo && (
                            <div className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                              <span>assigned to</span>
                              <span className="font-semibold">{historyItem.assignedTo}</span>
                            </div>
                          )}
                          {historyItem.contactName && (
                            <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                              {historyItem.contactName}
                            </span>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div className="font-medium">{historyItem.date}</div>
                          <div>{historyItem.time}</div>
                        </div>
                      </div>

                      {/* Enhanced Title and Description */}
                      <h4 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-indigo-700 transition-colors">
                        {historyItem.title}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {historyItem.description}
                      </p>

                      {/* Activity Badge */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r ${getModificationTypeColor(historyItem.modificationType)}`}>
                          Activity #{combinedActivityHistory.length - index}
                        </span>
                      </div>
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
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recent System Activity</h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
              Live Updates
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading recent activity...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {combinedActivityHistory.slice(0, 5).map((historyItem, index) => (
                <div
                  key={`recent-${historyItem.type}-${historyItem.id}`}
                  className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all duration-200 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm bg-gradient-to-br ${getModificationTypeColor(historyItem.modificationType)}`}>
                    {getModificationTypeIcon(historyItem.modificationType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-full">
                          {historyItem.initiator}
                        </span>
                        {historyItem.assignedTo && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            → {historyItem.assignedTo}
                          </span>
                        )}
                        {historyItem.contactName && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            {historyItem.contactName}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {historyItem.date} • {historyItem.time}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">
                      {historyItem.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {historyItem.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowFullHistory(true)}
            className="w-full mt-6 py-3 text-center bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 rounded-xl font-semibold text-indigo-700 border border-indigo-200 hover:border-indigo-300 flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            View Complete System Timeline ({combinedActivityHistory.length} activities)
          </button>
        </div>
      </div>

      {/* Full History Modal */}
      {showFullHistory && <FullHistoryModal />}
    </>
  );
};


// Enhanced Contact Data Quality Monitor
const ContactDataQualityMonitor = ({ contacts }) => {
  const qualityData = useMemo(() => {
    const total = contacts.length;
    if (total === 0) return {
      overallScore: 0,
      missingEmail: 0,
      missingPhone: 0,
      missingSkills: 0,
      missingCompany: 0,
      completionRate: 0,
      criticalIssues: 0,
      recommendations: []
    };

    const missingEmail = contacts.filter(c => !c.email_address || c.email_address.trim() === '').length;
    const missingPhone = contacts.filter(c => !c.phone_number || c.phone_number.trim() === '').length;
    const missingSkills = contacts.filter(c => !c.skills || c.skills.trim() === '').length;
    const missingCompany = contacts.filter(c => !c.company_name || c.company_name.trim() === '').length;
    const missingLinkedIn = contacts.filter(c => !c.linkedin_url || c.linkedin_url.trim() === '').length;

    const criticalFields = missingEmail + missingPhone;
    const overallScore = Math.round(((total * 5) - (missingEmail + missingPhone + missingSkills + missingCompany + missingLinkedIn)) / (total * 5) * 100);
    const completionRate = Math.round(((total - criticalFields) / total) * 100);

    const recommendations = [];
    if (missingCompany > missingSkills && missingCompany > total * 0.1) {
      recommendations.push('High company data gaps detected. Prioritize filling company information.');
    } else if (missingSkills > total * 0.3) {
      recommendations.push('Skills data needs improvement.');
    }

    if (missingEmail > total * 0.1) recommendations.push('High email gaps detected.');
    if (missingPhone > total * 0.1) recommendations.push('Phone number information missing for many contacts.');

    return {
      overallScore,
      missingEmail,
      missingPhone,
      missingSkills,
      missingCompany,
      completionRate,
      criticalIssues: criticalFields,
      recommendations
    };
  }, [contacts]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Data Quality Monitor</h2>
        <div className="ml-auto bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
          Admin Grade
        </div>
      </div>

      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${getScoreBg(qualityData.overallScore)} border-l-4 ${qualityData.overallScore >= 80 ? 'border-green-500' : qualityData.overallScore >= 60 ? 'border-yellow-500' : 'border-red-500'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Overall Data Quality</p>
              <p className={`text-3xl font-bold ${getScoreColor(qualityData.overallScore)}`}>
                {qualityData.overallScore}%
              </p>
            </div>
            <div className={`p-2 rounded-full ${qualityData.overallScore >= 80 ? 'bg-green-500' : qualityData.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}>
              {qualityData.overallScore >= 80 ?
                <CheckCircle className="w-6 h-6 text-white" /> :
                qualityData.overallScore >= 60 ?
                  <AlertCircle className="w-6 h-6 text-white" /> :
                  <XCircle className="w-6 h-6 text-white" />
              }
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">Missing Email</span>
            </div>
            <p className="text-lg font-bold text-red-700">{qualityData.missingEmail}</p>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Missing Phone</span>
            </div>
            <p className="text-lg font-bold text-orange-700">{qualityData.missingPhone}</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Missing Skills</span>
            </div>
            <p className="text-lg font-bold text-blue-700">{qualityData.missingSkills}</p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Missing Company</span>
            </div>
            <p className="text-lg font-bold text-purple-700">{qualityData.missingCompany}</p>
          </div>
        </div>

        {qualityData.recommendations.length > 0 && (
          <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Admin Recommendations</span>
            </div>
            <ul className="text-sm text-yellow-800 space-y-1">
              {qualityData.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-1">
                  <Target className="w-3 h-3 mt-0.5 text-yellow-600" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// UPDATED: Contact Source & Growth Analytics with WEEKLY COUNTS DISPLAY
const ContactSourceAnalytics = ({ contacts }) => {
  const sourceData = useMemo(() => {
    const today = getTodayFormatted();
    const yesterday = getYesterdayFormatted();
    const thisWeek = subDays(new Date(), 7);
    const lastWeek = subDays(new Date(), 14);
    const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

    // Calculate days passed in current month
    const daysPassed = Math.max(1, Math.floor((new Date() - startOfThisMonth) / (1000 * 60 * 60 * 24)) + 1);

    // CORRECTED: Count new contacts added today vs yesterday for trend
    const todayNewContacts = contacts.filter(c => {
      if (!c.created_at) return false;
      const createdDate = format(parseISO(c.created_at), 'yyyy-MM-dd');
      return createdDate === today;
    }).length;

    const yesterdayNewContacts = contacts.filter(c => {
      if (!c.created_at) return false;
      const createdDate = format(parseISO(c.created_at), 'yyyy-MM-dd');
      return createdDate === yesterday;
    }).length;

    // UPDATED: Weekly growth calculations with proper counts
    const thisWeekContacts = contacts.filter(c =>
      c.created_at && isAfter(parseISO(c.created_at), thisWeek)
    ).length;

    const lastWeekContacts = contacts.filter(c =>
      c.created_at &&
      isAfter(parseISO(c.created_at), lastWeek) &&
      parseISO(c.created_at) <= thisWeek
    ).length;

    // Count contacts this month
    const thisMonthContacts = contacts.filter(c => {
      if (!c.created_at) return false;
      const createdDate = parseISO(c.created_at);
      return createdDate >= startOfThisMonth && createdDate <= new Date();
    }).length;

    // Count contacts last month for comparison
    const lastMonthContacts = contacts.filter(c => {
      if (!c.created_at) return false;
      const createdDate = parseISO(c.created_at);
      return createdDate >= startOfLastMonth && createdDate <= endOfLastMonth;
    }).length;

    // Calculate dynamic daily average for this month
    const dailyAverage = Math.round((thisMonthContacts / daysPassed) * 10) / 10;

    const sourceAnalysis = {};
    contacts.forEach(contact => {
      const source = contact.added_by || 'Direct Entry';
      sourceAnalysis[source] = (sourceAnalysis[source] || 0) + 1;
    });

    const topSources = Object.entries(sourceAnalysis)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    // Count categories for this month only
    const monthlyCategories = { A: 0, B: 0, C: 0 };
    contacts.forEach(contact => {
      if (contact.created_at) {
        const createdDate = parseISO(contact.created_at);
        if (createdDate >= startOfThisMonth && createdDate <= new Date()) {
          if (contact.category && monthlyCategories.hasOwnProperty(contact.category)) {
            monthlyCategories[contact.category]++;
          }
        }
      }
    });

    // Count total categories (all time)
    const totalCategories = { A: 0, B: 0, C: 0 };
    contacts.forEach(contact => {
      if (contact.category && totalCategories.hasOwnProperty(contact.category)) {
        totalCategories[contact.category]++;
      }
    });

    // CORRECTED: Calculate daily trend (today vs yesterday new contacts)
    const dailyNewContactsTrend = calculateTrendPercentage(todayNewContacts, yesterdayNewContacts);
    const weeklyGrowthRate = calculateTrendPercentage(thisWeekContacts, lastWeekContacts);
    const monthlyGrowthRate = calculateTrendPercentage(thisMonthContacts, lastMonthContacts);

    return {
      dailyTrend: dailyNewContactsTrend,
      todayNewContacts,
      yesterdayNewContacts,
      weeklyGrowth: weeklyGrowthRate,
      monthlyGrowth: monthlyGrowthRate,
      thisWeekCount: thisWeekContacts,
      lastWeekCount: lastWeekContacts,
      thisMonthCount: thisMonthContacts,
      lastMonthCount: lastMonthContacts,
      dailyAverage,
      daysPassed,
      topSources,
      monthlyCategories,
      totalCategories,
      avgDaily: Math.round(thisWeekContacts / 7)
    };
  }, [contacts]);

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-semibold text-gray-900">Growth & Sources</h2>
        <div className="ml-auto bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          Live Data
        </div>
      </div>

      <div className="space-y-4">
        {/* UPDATED: Daily new contacts trend with improved spacing */}
        <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200" style={{ minHeight: '140px' }}>
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-sm font-medium text-indigo-700">Daily New Contacts</p>
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-2xl font-bold ${getGrowthColor(sourceData.dailyTrend)}`}>
                  {sourceData.dailyTrend > 0 ? '+' : ''}{sourceData.dailyTrend}%
                </span>
                {getGrowthIcon(sourceData.dailyTrend)}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-indigo-800">
                <strong>{sourceData.todayNewContacts}</strong> today vs <strong>{sourceData.yesterdayNewContacts}</strong> yesterday
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* UPDATED: Weekly Growth with counts display and improved spacing */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200" style={{ minHeight: '140px' }}>
            <div className="flex flex-col justify-between h-full">
              <div>
                <p className="text-sm font-medium text-blue-700">Weekly Growth</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-2xl font-bold ${getGrowthColor(sourceData.weeklyGrowth)}`}>
                    {sourceData.weeklyGrowth > 0 ? '+' : ''}{sourceData.weeklyGrowth}%
                  </span>
                  {getGrowthIcon(sourceData.weeklyGrowth)}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-blue-800">
                  <strong>{sourceData.lastWeekCount}</strong> last week vs <strong>{sourceData.thisWeekCount}</strong> this week
                </p>
              </div>
            </div>
          </div>

          {/* UPDATED: Monthly Growth with improved spacing */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200" style={{ minHeight: '140px' }}>
            <div className="flex flex-col justify-between h-full">
              <div>
                <p className="text-sm font-medium text-green-700">This Month vs Last</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-xl font-bold ${getGrowthColor(sourceData.monthlyGrowth)}`}>
                    {sourceData.monthlyGrowth > 0 ? '+' : ''}{sourceData.monthlyGrowth}%
                  </span>
                  {getGrowthIcon(sourceData.monthlyGrowth)}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-green-800">{sourceData.thisMonthCount} vs {sourceData.lastMonthCount}</p>
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Daily Average ({sourceData.daysPassed} days passed)
            </span>
            <span className="text-lg font-bold text-gray-900">{sourceData.dailyAverage} contacts/day</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Top Contributors</h3>
          <div className="space-y-2">
            {sourceData.topSources.map(([source, count], index) => (
              <div key={source} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                  <span className="text-sm font-medium text-gray-900">
                    {source.length > 15 ? source.substring(0, 15) + '...' : source}
                  </span>
                </div>
                <span className="text-sm text-gray-600">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">This Month by Category</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="p-2 bg-red-50 rounded text-center border border-red-200">
              <p className="text-sm font-medium text-red-700">Category A</p>
              <p className="text-lg font-bold text-red-800">{sourceData.monthlyCategories.A}</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded text-center border border-yellow-200">
              <p className="text-sm font-medium text-yellow-700">Category B</p>
              <p className="text-lg font-bold text-yellow-800">{sourceData.monthlyCategories.B}</p>
            </div>
            <div className="p-2 bg-green-50 rounded text-center border border-green-200">
              <p className="text-sm font-medium text-green-700">Category C</p>
              <p className="text-lg font-bold text-green-800">{sourceData.monthlyCategories.C}</p>
            </div>
          </div>

          <h3 className="text-sm font-medium text-gray-700 mb-2">Total Categories (All Time)</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-red-100 rounded text-center border border-red-300">
              <p className="text-xs font-medium text-red-700">Total Category A</p>
              <p className="text-xl font-bold text-red-900">{sourceData.totalCategories.A}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded text-center border border-yellow-300">
              <p className="text-xs font-medium text-yellow-700">Total Category B</p>
              <p className="text-xl font-bold text-yellow-900">{sourceData.totalCategories.B}</p>
            </div>
            <div className="p-2 bg-green-100 rounded text-center border border-green-300">
              <p className="text-xs font-medium text-green-700">Total Category C</p>
              <p className="text-xl font-bold text-green-900">{sourceData.totalCategories.C}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Activity Segmentation Radar Chart
const UserActivitySegmentation = ({ contacts }) => {
  const segmentData = useMemo(() => {
    const total = contacts.length;
    if (total === 0) {
      return {
        labels: ['Email Coverage', 'Phone Coverage', 'LinkedIn Presence', 'Event Participation', 'Skill Completeness', 'Company Info'],
        datasets: [{
          label: 'Activity Score',
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
        }]
      };
    }

    const emailCoverage = Math.round((contacts.filter(c => c.email_address && c.email_address.trim() !== '').length / total) * 100);
    const phoneCoverage = Math.round((contacts.filter(c => c.phone_number && c.phone_number.trim() !== '').length / total) * 100);
    const linkedinPresence = Math.round((contacts.filter(c => c.linkedin_url && c.linkedin_url.trim() !== '').length / total) * 100);
    const eventParticipation = Math.round((contacts.filter(c => c.event_name && c.event_name.trim() !== '').length / total) * 100);
    const skillCompleteness = Math.round((contacts.filter(c => c.skills && c.skills.trim() !== '').length / total) * 100);
    const companyInfo = Math.round((contacts.filter(c => c.company_name && c.company_name.trim() !== '').length / total) * 100);

    return {
      labels: ['Email Coverage', 'Phone Coverage', 'LinkedIn Presence', 'Event Participation', 'Skill Completeness', 'Company Info'],
      datasets: [{
        label: 'Coverage %',
        data: [emailCoverage, phoneCoverage, linkedinPresence, eventParticipation, skillCompleteness, companyInfo],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointRadius: 4,
      }]
    };
  }, [contacts]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">User Activity Segmentation</h2>
        <div className="ml-auto bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
          Coverage Analysis
        </div>
      </div>

      <div className="h-80">
        <Radar data={segmentData} options={options} />
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">Comprehensive view of data completeness across all contact fields</p>
      </div>
    </div>
  );
};

// Enhanced Contact Diversity Overview
const ContactDiversityOverview = ({ contacts }) => {
  const diversityData = useMemo(() => {
    const departments = {};
    const city = {};
    const jobTitles = {};
    const companies = {};

    contacts.forEach(contact => {
      if (contact.department_type) {
        departments[contact.department_type] = (departments[contact.department_type] || 0) + 1;
      }

      if (contact.city) {
        city[contact.city] = (city[contact.city] || 0) + 1;
      }

      if (contact.job_title) {
        jobTitles[contact.job_title] = (jobTitles[contact.job_title] || 0) + 1;
      }

      if (contact.company_name) {
        companies[contact.company_name] = (companies[contact.company_name] || 0) + 1;
      }
    });

    const topDepartment = Object.entries(departments).sort(([, a], [, b]) => b - a)[0];
    const topCity = Object.entries(city).sort(([, a], [, b]) => b - a)[0];
    const topJobTitle = Object.entries(jobTitles).sort(([, a], [, b]) => b - a)[0];

    return {
      topDepartment: topDepartment ? { name: topDepartment[0], count: topDepartment[1] } : null,
      topCity: topCity ? { name: topCity[0], count: topCity[1] } : null,
      topJobTitle: topJobTitle ? { name: topJobTitle[0], count: topJobTitle[1] } : null,
      totalDepartments: Object.keys(departments).length,
      totalCity: Object.keys(city).length,
      totalJobTitles: Object.keys(jobTitles).length,
      totalCompanies: Object.keys(companies).length,
    };
  }, [contacts]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <MapPinIcon className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-semibold text-gray-900">Contact Diversity Overview</h2>
        <div className="ml-auto bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          Diversity Insights
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Top Department</p>
            <TextWithTooltip
              text={diversityData.topDepartment ? diversityData.topDepartment.name : 'N/A'}
              className="text-lg font-semibold text-blue-700"
              maxWidth="200px"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600">
              {diversityData.topDepartment ? `${diversityData.topDepartment.count} people` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-900">Most Common City</p>
            <TextWithTooltip
              text={diversityData.topCity ? diversityData.topCity.name : 'N/A'}
              className="text-lg font-semibold text-purple-700"
              maxWidth="200px"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-600">
              {diversityData.topCity ? `${diversityData.topCity.count} contacts` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-lg font-bold text-gray-900">{diversityData.totalDepartments}</p>
            <p className="text-xs text-gray-600">Departments</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-lg font-bold text-gray-900">{diversityData.totalCity}</p>
            <p className="text-xs text-gray-600">Districts</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-lg font-bold text-gray-900">{diversityData.totalJobTitles}</p>
            <p className="text-xs text-gray-600">Job Roles</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-lg font-bold text-gray-900">{diversityData.totalCompanies}</p>
            <p className="text-xs text-gray-600">Companies</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// NEW: Online Users Card Component
const OnlineUsersCard = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlinePercentage, setOnlinePercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOnlineUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/online');

      if (response.data.success) {
        setOnlineUsers(response.data.data || []);
        setTotalUsers(response.data.totalCount || 0);
        setOnlineCount(response.data.onlineCount || 0);
        setOnlinePercentage(response.data.onlinePercentage || 0);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch online users:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineUsers();

    // Refresh every 10 seconds
    const interval = setInterval(fetchOnlineUsers, 10000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';

    const now = new Date();
    const lastSeen = new Date(dateString);
    const diff = now - lastSeen;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Online Users</h2>
          <div className="ml-auto">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading online users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-semibold text-gray-900">Online Users</h2>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Live
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-700">Total Users</p>
            <p className="text-2xl font-bold text-green-800">{totalUsers.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-700">Currently Online</p>
            <p className="text-2xl font-bold text-green-800">{onlineCount}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-700">Online Rate</p>
            <p className="text-lg font-bold text-green-800">{onlinePercentage}%</p>
          </div>
        </div>
      </div>

      {/* Online Users List */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Active Users ({onlineCount})
        </h3>

        <div className="max-h-16 overflow-y-auto space-y-2 pr-2">
          {onlineUsers.length > 0 ? (
            onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.username || user.email || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Role: {user.role || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {getTimeAgo(user.last_seen)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <UserX className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No users are currently online</p>
              <p className="text-gray-400 text-xs mt-1">Users will appear here when they're active</p>
            </div>
          )}
        </div>
      </div>

      {/* Refresh Info */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Auto-refreshes every 10 seconds • Last updated: {format(new Date(), 'HH:mm:ss')}
        </p>
      </div>
    </div>
  );
};

// Main Admin Component
function Admin() {
  console.log("🚀 Admin component rendering");

  const navigate = useNavigate();
  const { id, role } = useAuthStore();

  console.log("👤 User data:", { id, role });

  // UPDATED: State Management with corrected dynamic trends
  const [stats, setStats] = useState({
    totalContacts: 0,
    verifiedContacts: 0,
    unverifiedContacts: 0,
    totalEvents: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalImages: 0,
    activeAssignments: 0,
    dataQualityScore: 0,
    monthlyAcquisitionRate: 0,
    linkedinConnections: 0,
    completeProfiles: 0,
    // CORRECTED: Dynamic trend percentages
    totalContactsTrend: 0,
    verifiedContactsTrend: 0,
    monthlyAcquisitionTrend: 0,
    linkedinTrend: 0,
    completeProfilesTrend: 0,
    totalEventsTrend: 0,
  });

  const [contacts, setContacts] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [categoryData, setCategoryData] = useState({ A: 0, B: 0, C: 0 });
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [dateRangeType, setDateRangeType] = useState("custom");

  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

  // Alert Functions
  const showAlert = (severity, message) => {
    setAlert({ isOpen: true, severity, message });
  };

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  // ✅ ENHANCED CHART COMPONENT WITH CUSTOM DATE RANGE
  const ContactsChart = ({ contacts }) => {
    const handlePredefinedRange = (range) => {
      const today = new Date();
      let newStartDate;

      switch (range) {
        case "last7days":
          newStartDate = subDays(today, 7);
          break;
        case "last30days":
          newStartDate = subDays(today, 30);
          break;
        case "lastMonth":
          newStartDate = subMonths(today, 1);
          break;
        case "last3Months":
          newStartDate = subMonths(today, 3);
          break;
        case "last6Months":
          newStartDate = subMonths(today, 6);
          break;
        case "lastYear":
          newStartDate = subMonths(today, 12);
          break;
        default:
          return;
      }

      setStartDate(startOfDay(newStartDate));
      setEndDate(endOfDay(today));
      setDateRangeType(range);
    };

    const processChartData = useMemo(() => {
      // ✅ Ensure contacts is an array before filtering
      const contactsArray = Array.isArray(contacts) ? contacts : [];

      const filteredContacts = contactsArray.filter((contact) => {
        const createdDate = contact.created_at
          ? parseISO(contact.created_at)
          : null;
        return (
          createdDate &&
          isAfter(createdDate, startOfDay(startDate)) &&
          createdDate <= endOfDay(endDate)
        );
      });

      const createdDates = {};
      const updatedDates = {};

      filteredContacts.forEach((contact) => {
        if (contact.created_at) {
          const date = format(parseISO(contact.created_at), "yyyy-MM-dd");
          createdDates[date] = (createdDates[date] || 0) + 1;
        }

        if (contact.updated_at) {
          const updateDate = parseISO(contact.updated_at);
          if (
            isAfter(updateDate, startOfDay(startDate)) &&
            updateDate <= endOfDay(endDate)
          ) {
            const date = format(updateDate, "yyyy-MM-dd");
            updatedDates[date] = (updatedDates[date] || 0) + 1;
          }
        }
      });

      const allDates = Array.from(
        new Set([...Object.keys(createdDates), ...Object.keys(updatedDates)])
      ).sort();

      return {
        labels: allDates,
        datasets: [
          {
            label: "Contacts Created",
            data: allDates.map((date) => createdDates[date] || 0),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Contacts Updated",
            data: allDates.map((date) => updatedDates[date] || 0),
            borderColor: "rgb(139, 69, 19)",
            backgroundColor: "rgba(139, 69, 19, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      };
    }, [contacts, startDate, endDate]);

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: false,
        },
        filler: {
          propagate: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
        x: {
          ticks: {
            maxTicksLimit: 15,
          },
        },
      },
      interaction: {
        intersect: false,
      },
    };

    const predefinedRanges = [
      { key: "last7days", label: "Last 7 Days" },
      { key: "last30days", label: "Last 30 Days" },
      { key: "lastMonth", label: "Last Month" },
      { key: "last3Months", label: "Last 3 Months" },
      { key: "last6Months", label: "Last 6 Months" },
      { key: "lastYear", label: "Last Year" },
    ];

    return (
      <div>
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {predefinedRanges.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handlePredefinedRange(key)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${dateRangeType === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => setDateRangeType("custom")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${dateRangeType === "custom"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Custom Range
            </button>
          </div>

          {dateRangeType === "custom" && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  From:
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={endDate}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dateFormat="MMM dd, yyyy"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">To:</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dateFormat="MMM dd, yyyy"
                />
              </div>
            </div>
          )}
        </div>

        <div className="h-64">
          <Line data={processChartData} options={chartOptions} />
        </div>

        <div className="mt-3 text-xs text-gray-500 flex justify-between">
          <span>
            Range: {format(startDate, "MMM dd, yyyy")} -{" "}
            {format(endDate, "MMM dd, yyyy")}
          </span>
          <span>
            Total in range:{" "}
            {processChartData.datasets[0].data.reduce((a, b) => a + b, 0)}{" "}
            created,{" "}
            {processChartData.datasets[1].data.reduce((a, b) => a + b, 0)}{" "}
            updated
          </span>
        </div>
      </div>
    );
  };

  // ✅ FIXED SEQUENTIAL BATCH GEOCODING WITH USA ADDRESS SUPPORT
  const ContactsMap = ({ contacts }) => {
    const [geocodedContacts, setGeocodedContacts] = useState([]);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [progress, setProgress] = useState(0);

    // ✅ Use ref-based tracking to prevent multiple executions
    const isProcessingRef = useRef(false);
    const contactsHashRef = useRef("");

    // ✅ ENHANCED GEOCODING WITH USA ADDRESS SUPPORT
    const geocodeSingleContact = async (contact) => {
      const { street = "", city = "", state = "", country = "India" } = contact;

      console.log(
        `🔍 Starting geocode for: ${contact.name} (ID: ${contact.contact_id})`
      );
      console.log(
        `📍 Address data: Street:"${street}" City:"${city}" State:"${state}" Country:"${country}"`
      );

      if (!city) {
        console.log(`❌ Skipping ${contact.name} - no city provided`);
        return null;
      }

      // ✅ COUNTRY-SPECIFIC GEOCODING STRATEGIES
      let strategies = [];

      if (country === "USA" || country === "United States") {
        strategies = [
          `${city}, ${state}, United States`, // Standard USA format
          `${city}, ${state}, USA`, // Alternative USA format
          `${street}, ${city}, ${state}, United States`, // With street
        ];
      } else if (country === "Canada") {
        strategies = [
          `${city}, ${state}, Canada`,
          `${street}, ${city}, ${state}, Canada`,
          `${city}, Canada`,
        ];
      } else if (country === "Australia") {
        strategies = [
          `${city}, ${state}, Australia`,
          `${street}, ${city}, ${state}, Australia`,
          `${city}, Australia`,
        ];
      } else {
        // Default strategies for other countries
        strategies = [
          `${city} ${state} ${country}`.trim(),
          `Hospital ${city} ${state} ${country}`.trim(),
          `${street} ${city} ${state}`.trim(),
        ];
      }

      for (let i = 0; i < strategies.length; i++) {
        const query = strategies[i];
        console.log(
          `🎯 Strategy ${i + 1}/${strategies.length} for ${contact.name
          }: "${query}"`
        );

        try {
          const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
              params: {
                q: query,
                format: "json",
                limit: 3,
                countrycodes: countryCodeMap[country] || "in",
                addressdetails: 1,
              },
            }
          );

          console.log(
            `📡 API response for ${contact.name}: ${response.data?.length || 0
            } results`
          );

          if (response.data && response.data.length > 0) {
            let bestResult = response.data[0];

            // Find better result if multiple returned
            if (response.data.length > 1) {
              const exactCityMatch = response.data.find((result) =>
                result.display_name.toLowerCase().includes(city.toLowerCase())
              );
              if (exactCityMatch) {
                bestResult = exactCityMatch;
                console.log(`🎯 Found exact city match for ${contact.name}`);
              }
            }

            console.log(`✅ SUCCESS for ${contact.name}:`);
            console.log(`   Display: ${bestResult.display_name}`);
            console.log(`   Coords: ${bestResult.lat}, ${bestResult.lon}`);

            let precision = 0.5;
            if (bestResult.display_name.toLowerCase().includes("hospital"))
              precision += 0.3;
            if (
              bestResult.display_name.toLowerCase().includes(city.toLowerCase())
            )
              precision += 0.2;
            if (bestResult.display_name.toLowerCase().includes("medical"))
              precision += 0.25;
            precision = Math.max(precision, bestResult.importance || 0.5);
            precision = Math.min(precision, 1.0);

            const geocodedContact = {
              id: contact.contact_id,
              position: [
                parseFloat(bestResult.lat),
                parseFloat(bestResult.lon),
              ],
              name: contact.name,
              email: contact.email_address,
              address: `${street} ${city}, ${state}, ${country}`.trim(),
              city,
              state,
              country,
              category: contact.category || "A",
              createdAt: contact.created_at,
              precision,
              geocodeResult: bestResult.display_name,
            };

            console.log(
              `🎯 Created marker for ${contact.name} at position:`,
              geocodedContact.position
            );
            console.log(`   Precision score: ${precision.toFixed(2)}`);
            return geocodedContact;
          } else {
            console.log(
              `⚠️ No results for ${contact.name} with strategy ${i + 1
              }: "${query}"`
            );
          }
        } catch (error) {
          console.error(
            `❌ API Error for ${contact.name}:`,
            error.response?.status,
            error.message
          );

          // Check for rate limiting
          if (error.response?.status === 429) {
            console.log(`⏳ Rate limited, waiting longer...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        // Delay between strategies
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      console.log(`💀 ALL STRATEGIES FAILED for: ${contact.name}`);
      return null;
    };

    useMapEvents({
      zoomend: () => {
        if (geocodedContacts.length > 0) {
          setGeocodedContacts((prev) => [...prev]);
        }
      },
      moveend: () => {
        if (geocodedContacts.length > 0) {
          setGeocodedContacts((prev) => [...prev]);
        }
      },
    });

    // ✅ FIXED useEffect with enhanced batch processing
    useEffect(() => {
      // ✅ Ensure contacts is an array before processing
      const contactsArray = Array.isArray(contacts) ? contacts : [];

      if (contactsArray.length === 0) {
        console.log("❌ No contacts to process");
        return;
      }

      // Create unique hash for contacts to detect changes
      const currentHash = contactsArray
        .map((c) => `${c.contact_id}-${c.city}-${c.state}`)
        .join("|");

      if (isProcessingRef.current || contactsHashRef.current === currentHash) {
        console.log("❌ Already processing or same contacts, skipping");
        return;
      }

      console.log("🚀 Starting ENHANCED SEQUENTIAL BATCH geocoding");
      console.log(`📊 Total contacts: ${contactsArray.length}`);

      // Filter contacts with valid addresses
      const contactsToProcess = contactsArray.filter((c) => c.city && c.state);
      const skippedContacts = contactsArray.filter((c) => !c.city || !c.state);

      console.log(
        `📍 Contacts with valid addresses (city + state): ${contactsToProcess.length}`
      );
      console.log(
        `⚠️ Contacts skipped (missing city/state): ${skippedContacts.length}`
      );

      if (contactsToProcess.length === 0) {
        console.log("❌ No valid contacts to geocode");
        return;
      }

      // Set processing flags
      isProcessingRef.current = true;
      contactsHashRef.current = currentHash;
      setIsGeocoding(true);
      setProgress(0);
      setGeocodedContacts([]);

      const processContacts = async () => {
        try {
          console.log(
            `🔄 About to process ${contactsToProcess.length} valid contacts:`
          );
          contactsToProcess.forEach((contact, index) => {
            console.log(
              `   ${index + 1}. ${contact.name} - ${contact.city}, ${contact.state
              }, ${contact.country}`
            );
          });

          // ✅ Process in sequential batches with enhanced logging
          const allResults = await processInSequentialBatches(
            contactsToProcess,
            3, // Batch size
            geocodeSingleContact,
            (batchResults, batchNumber, totalBatches) => {
              const validResults = batchResults.filter(Boolean);
              console.log(
                `📊 BATCH ${batchNumber}/${totalBatches} COMPLETED: ${validResults.length} valid markers`
              );

              // Instant rendering callback
              setGeocodedContacts((prev) => {
                const newTotal = [...prev, ...validResults];
                console.log(`📍 TOTAL MARKERS ON MAP: ${newTotal.length}`);
                return newTotal;
              });

              const progressPercent = (batchNumber / totalBatches) * 100;
              setProgress(progressPercent);
            }
          );

          const validResults = allResults.filter(Boolean);

          console.log("🎉 FINAL GEOCODING SUMMARY:");
          console.log(`   ✅ Successfully geocoded: ${validResults.length}`);
          console.log(`   📍 Total markers on map: ${validResults.length}`);

          if (validResults.length > 0) {
            console.log(`📍 ALL MARKERS CREATED:`);
            validResults.forEach((result, index) => {
              console.log(
                `   ${index + 1}. ${result.name} (${result.city}, ${result.country
                }) - [${result.position[0]}, ${result.position[1]}]`
              );
            });
          }
        } catch (error) {
          console.error("❌ Sequential batch geocoding error:", error);
        } finally {
          isProcessingRef.current = false;
          setIsGeocoding(false);
          setProgress(100);
          console.log("🏁 Geocoding process completed");
        }
      };

      processContacts();
    }, [contacts]);

    const createPrecisionIcon = (category, precision) => {
      const colors = {
        A: "#ef4444",
        B: "#f59e0b",
        C: "#10b981",
      };

      const size = precision > 0.8 ? 32 : precision > 0.6 ? 28 : 26;
      const borderColor =
        precision > 0.8 ? "#10b981" : precision > 0.6 ? "#f59e0b" : "white";
      const borderWidth = precision > 0.8 ? 4 : 3;
      const star = precision > 0.8 ? "★" : "";

      return L.divIcon({
        className: "precision-marker",
        html: `<div style="
          background-color: ${colors[category] || "#6b7280"};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${borderWidth}px solid ${borderColor};
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${Math.round(size * 0.4)}px;
          position: relative;
          z-index: 1000;
        ">${category}${star}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    return (
      <>
        {isGeocoding && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-green-600 mx-auto"></div>
              <p className="mt-3 text-sm text-gray-700 font-semibold">
                🔄 Enhanced Geocoding... {Math.round(progress)}%
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Improved USA address support - check console for details
              </p>
            </div>
          </div>
        )}

        {/* ✅ ENHANCED FITBOUNDS COMPONENT */}
        {geocodedContacts.length > 0 && (
          <FitBoundsComponent
            positions={geocodedContacts.map((c) => c.position)}
          />
        )}

        {/* ✅ RENDER ALL MARKERS WITH ENHANCED VISIBILITY */}
        {geocodedContacts.map((contact, index) => {
          console.log(
            `🗺️ Rendering marker ${index + 1}:`,
            contact.name,
            contact.position
          );
          return (
            <Marker
              key={`marker-${contact.id}-${index}`}
              position={contact.position}
              icon={createPrecisionIcon(contact.category, contact.precision)}
            >
              <Popup className="precision-popup" maxWidth={400}>
                <div className="p-3">
                  <div className="font-bold text-lg text-gray-900 mb-3 border-b pb-2">
                    {contact.name}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Email:</strong> {contact.email}
                    </div>
                    <div>
                      <strong>Original Address:</strong> {contact.address}
                    </div>

                    <div className="bg-gray-50 p-2 rounded border-l-4 border-blue-400">
                      <div className="text-xs text-gray-600 font-medium">
                        Geocoded Location:
                      </div>
                      <div className="text-xs text-gray-700 mt-1">
                        {contact.geocodeResult}
                      </div>
                    </div>

                    <div>
                      <strong>City/Country:</strong> {contact.city},{" "}
                      {contact.country}
                    </div>
                    <div>
                      <strong>Coordinates:</strong> [
                      {contact.position[0].toFixed(4)},{" "}
                      {contact.position[1].toFixed(4)}]
                    </div>

                    <div className="flex items-center gap-2">
                      <strong>Category:</strong>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${contact.category === "A"
                            ? "bg-red-100 text-red-800"
                            : contact.category === "B"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                      >
                        {contact.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <strong>Precision:</strong>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${contact.precision > 0.8
                            ? "bg-green-100 text-green-800"
                            : contact.precision > 0.6
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {contact.precision > 0.8
                          ? "🎯 High Precision"
                          : contact.precision > 0.6
                            ? "📍 Medium Precision"
                            : "📌 General Area"}
                      </span>
                    </div>

                    {contact.createdAt && (
                      <div>
                        <strong>Added:</strong>{" "}
                        {format(parseISO(contact.createdAt), "MMM dd, yyyy")}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  };

  const ContactsMapContainer = ({ contacts }) => {
    return (
      <div className="h-[400px] w-full rounded-lg overflow-hidden relative">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: "100%", width: "100%" }}
          className="rounded-lg"
          preferCanvas={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <ContactsMap contacts={contacts} />
        </MapContainer>
      </div>
    );
  };

  const exportCsv = (contacts) => {
    const headers = [
      "Added By",
      "Created At",
      "Name",
      "Phone Number",
      "Secondary Phone Number",
      "Email Address",
      "Secondary Email",
      "Skills",
      "Linkedin Url",
      "Job Title",
      "Company Name",
      "Department Type",
      "From Date",
      "To Date",
      "Event Name",
      "Event Role",
      "Event held Organization",
      "Event location",
      "Date of Birth",
      "Gender",
      "Nationality",
      "Marital Status",
      "Category",
      "Emergency Contact Name",
      "Emergency Contact Relationship",
      "Logger",
      "Street",
      "City",
      "State",
      "Country",
      "ZipCode",
      "Pg Course Name",
      "Pg College Name",
      "Pg University Type",
      "Pg Start Date",
      "Pg End Date",
      "Ug Course Name",
      "Ug College Name",
      "Ug University Type",
      "Ug Start Date",
      "Ug End Date",
    ];

    const csvRows = [];
    csvRows.push(headers.join(","));

    contacts.forEach((contact) => {
      const row = [
        contact.added_by || "",
        contact.created_at
          ? format(parseISO(contact.created_at), "yyyy-MM-dd HH:mm:ss")
          : "",
        contact.name || "",
        contact.phone_number || "",
        contact.secondary_phone_number || "",
        contact.email_address || "",
        contact.secondary_email || "",
        contact.skills || "",
        contact.linkedin_url || "",
        contact.job_title || "",
        contact.company_name || "",
        contact.department_type || "",
        contact.from_date || "",
        contact.to_date || "",
        contact.event_name || "",
        contact.event_role || "",
        contact.event_held_organization || "",
        contact.event_location || "",
        contact.dob ? format(parseISO(contact.dob), "yyyy-MM-dd") : "",
        contact.gender || "",
        contact.nationality || "",
        contact.marital_status || "",
        contact.category || "",
        contact.emergency_contact_name || "",
        contact.emergency_contact_relationship || "",
        contact.logger || "",
        contact.street || "",
        contact.city || "",
        contact.state || "",
        contact.country || "",
        contact.zipcode || "",
        contact.pg_course_name || "",
        contact.pg_college_name || "",
        contact.pg_university_type || "",
        contact.pg_start_date || "",
        contact.pg_end_date || "",
        contact.ug_course_name || "",
        contact.ug_college_name || "",
        contact.ug_university_type || "",
        contact.ug_start_date || "",
        contact.ug_end_date || "",
      ];

      csvRows.push(
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      );
    });

    return csvRows.join("\n");
  };

  const exportContactsToCSV = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:8000/api/get-all-contact/`
      );
      const contacts = response.data.data || response.data || [];

      const csvContent = exportCsv(contacts);

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const fileName = `contacts-export-${format(
        new Date(),
        "yyyy-MM-dd-HHmm"
      )}.csv`;

      saveAs(blob, fileName);
      showAlert(
        "success",
        `Successfully exported ${contacts.length} contacts to CSV`
      );
    } catch (error) {
      console.error("Error exporting contacts:", error);
      showAlert("error", "Failed to export contacts to CSV");
    } finally {
      setLoading(false);
    }
  };

  const exportContactsToJSON = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`http://localhost:8000/api/get-all-contact/`);
      const contacts = response.data.data || response.data || [];

      const jsonContent = JSON.stringify(contacts, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const fileName = `contacts-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;

      saveAs(blob, fileName);
      showAlert("success", `Successfully exported ${contacts.length} contacts to JSON`);

    } catch (error) {
      console.error("Error exporting contacts:", error);
      showAlert("error", "Failed to export contacts to JSON");
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Fetch Dashboard Data with CORRECTED TREND CALCULATIONS
  const fetchDashboardData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const [
        recentContactsResponse,
        contactsResponse,
        unverifiedContactsResponse,
        unverifiedImagesResponse,
        categoryAResponse,
        categoryBResponse,
        categoryCResponse,
        allContactsResponse,
      ] = await Promise.all([
        axios.get(`http://localhost:8000/api/get-all-contact/?limit=5`),
        axios.get(`http://localhost:8000/api/contacts/${id}`),
        axios.get("http://localhost:8000/api/get-unverified-contacts/"),
        axios.get("http://localhost:8000/api/get-unverified-images/"),
        axios.get(
          "http://localhost:8000/api/get-contacts-by-category/?category=A"
        ),
        axios.get(
          "http://localhost:8000/api/get-contacts-by-category/?category=B"
        ),
        axios.get(
          "http://localhost:8000/api/get-contacts-by-category/?category=C"
        ),
        axios.get("http://localhost:8000/api/get-all-contact/"),
      ]);

      const allContacts = allContactsResponse.data?.data || [];
      const recentContactsData = recentContactsResponse.data?.data || [];
      const unverifiedContacts = unverifiedContactsResponse.data?.data || [];
      const unverifiedImages = unverifiedImagesResponse.data?.data || [];

      console.log("📊 Dashboard data loaded:", {
        allContacts: allContacts.length,
        recentContacts: recentContactsData.length,
        unverifiedContacts: unverifiedContacts.length,
        unverifiedImages: unverifiedImages.length,
      });

      setContacts(allContacts);
      setRecentContacts(
        recentContactsData.map((item) => ({
          ...item,
          role: item.experiences?.[0]?.job_title || "N/A",
          company: item.experiences?.[0]?.company || "N/A",
          location:
            `${item.address?.city || ""}, ${item.address?.state || ""
              }`.trim() === ","
              ? "N/A"
              : `${item.address?.city || ""}, ${item.address?.state || ""}`,
          skills: item.skills
            ? item.skills.split(",").map((s) => s.trim())
            : [],
        }))
      );

      // CORRECTED: Dynamic trend calculations
      const today = new Date();
      const yesterday = subDays(today, 1);
      const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const daysPassed = Math.max(1, Math.floor((today - startOfThisMonth) / (1000 * 60 * 60 * 24)) + 1);

      // Current metrics
      const totalContacts = allContacts.length;
      const verifiedContacts = allContacts.filter(c => c.verified || c.contact_status === 'approved').length;
      const completeProfiles = allContacts.filter(c =>
        c.email_address && c.phone_number && c.skills && c.company_name
      ).length;
      const linkedinConnections = allContacts.filter(c => c.linkedin_url).length;
      const dataQualityScore = Math.round((completeProfiles / totalContacts) * 100) || 0;

      // CORRECTED: Count events today vs yesterday for trend
      const todayEvents = allContacts.filter(c => {
        if (!c.created_at) return false;
        const createdDate = format(parseISO(c.created_at), 'yyyy-MM-dd');
        return createdDate === getTodayFormatted();
      }).reduce((acc, c) => acc + (c.event_name ? c.event_name.split(';').length : 0), 0);

      const yesterdayEvents = allContacts.filter(c => {
        if (!c.created_at) return false;
        const createdDate = format(parseISO(c.created_at), 'yyyy-MM-dd');
        return createdDate === getYesterdayFormatted();
      }).reduce((acc, c) => acc + (c.event_name ? c.event_name.split(';').length : 0), 0);

      const totalEvents = allContacts.reduce((acc, c) => acc + (c.event_name ? c.event_name.split(';').length : 0), 0);

      const thisMonthContacts = allContacts.filter(c => {
        if (!c.created_at) return false;
        const createdDate = parseISO(c.created_at);
        return createdDate >= startOfThisMonth && createdDate <= today;
      }).length;

      const monthlyAcquisitionRate = Math.round((thisMonthContacts / daysPassed) * 10) / 10;

      // CORRECTED: Previous day comparisons for trends
      const yesterdayTotalContacts = allContacts.filter(c => {
        if (!c.created_at) return false;
        const createdDate = parseISO(c.created_at);
        return createdDate <= yesterday;
      }).length;

      const yesterdayVerifiedContacts = allContacts.filter(c => {
        const contactDate = c.created_at ? parseISO(c.created_at) : null;
        return (c.verified || c.contact_status === 'approved') &&
          contactDate && contactDate <= yesterday;
      }).length;

      const yesterdayCompleteProfiles = allContacts.filter(c => {
        const contactDate = c.created_at ? parseISO(c.created_at) : null;
        return c.email_address && c.phone_number && c.skills && c.company_name &&
          contactDate && contactDate <= yesterday;
      }).length;

      const yesterdayLinkedinConnections = allContacts.filter(c => {
        const contactDate = c.created_at ? parseISO(c.created_at) : null;
        return c.linkedin_url && contactDate && contactDate <= yesterday;
      }).length;

      // Count new contacts today vs yesterday for acquisition trend
      const todayNewContacts = allContacts.filter(c => {
        if (!c.created_at) return false;
        const createdDate = format(parseISO(c.created_at), 'yyyy-MM-dd');
        return createdDate === getTodayFormatted();
      }).length;

      const yesterdayNewContacts = allContacts.filter(c => {
        if (!c.created_at) return false;
        const createdDate = format(parseISO(c.created_at), 'yyyy-MM-dd');
        return createdDate === getYesterdayFormatted();
      }).length;

      // CORRECTED: Calculate trend percentages
      const totalContactsTrend = calculateTrendPercentage(todayNewContacts, yesterdayNewContacts);
      const verifiedContactsPercentage = calculateVerifiedPercentage(verifiedContacts, totalContacts);
      const monthlyAcquisitionTrend = calculateTrendPercentage(todayNewContacts, yesterdayNewContacts);
      const linkedinTrend = calculateTrendPercentage(linkedinConnections, yesterdayLinkedinConnections);
      const completeProfilesPercentage = calculateCompletionPercentage(completeProfiles, totalContacts);
      const totalEventsTrend = calculateTrendPercentage(todayEvents, yesterdayEvents);

      setStats({
        totalContacts,
        verifiedContacts,
        unverifiedContacts: allContacts.filter(c => !c.verified || c.contact_status === 'pending').length,
        totalEvents,
        totalImages: unverifiedImages.length,
        dataQualityScore,
        monthlyAcquisitionRate,
        linkedinConnections,
        completeProfiles,
        completedTasks: 0,
        pendingTasks: 0,
        activeAssignments: 0,
        // CORRECTED: Dynamic trends
        totalContactsTrend,
        verifiedContactsTrend: verifiedContactsPercentage,
        monthlyAcquisitionTrend,
        linkedinTrend,
        completeProfilesTrend: completeProfilesPercentage,
        totalEventsTrend,
      });

      setCategoryData({
        A: categoryAResponse.data?.data.length || 0,
        B: categoryBResponse.data?.data.length || 0,
        C: categoryCResponse.data?.data.length || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showAlert("error", "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🔄 useEffect running, checking user ID...");
    console.log("👤 ID available:", !!id, "Value:", id);

    if (id) {
      console.log("✅ User ID found, calling fetchDashboardData");
      fetchDashboardData();
    } else {
      console.log("⚠️ No user ID yet, waiting...");
    }
  }, [id]);

  // CSV Upload Handler
  const csvInputRef = useRef(null);

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      showAlert("error", "Please select a valid CSV file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showAlert("error", "File size too large. Maximum 10MB allowed.");
      return;
    }

    showAlert("info", "Processing CSV file...");

    try {
      const formData = new FormData();
      formData.append("csv_file", file);
      formData.append("created_by", id);

      const response = await axios.post(
        "http://localhost:8000/api/import-csv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const { successCount, errorCount, duplicateCount, totalRows } =
          response.data.data;

        showAlert(
          "success",
          `CSV Import Complete!\n` +
          `📊 Total rows processed: ${totalRows}\n` +
          `✅ Successfully added: ${successCount}\n` +
          `⚠️ Duplicates skipped: ${duplicateCount}\n` +
          `❌ Errors encountered: ${errorCount}`
        );

        fetchDashboardData();
      } else {
        showAlert("error", `Import failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("CSV import error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred during CSV import";
      showAlert("error", `CSV Import Error: ${errorMessage}`);
    }

    event.target.value = "";
  };

  // Enhanced Quick Actions with admin functionality
  const quickActions = [
    {
      title: "Add New Contact",
      description: "Create verified contact entry",
      icon: Users,
      color: "bg-blue-500",
      onClick: () =>
        navigate("/details-input", {
          state: {
            contact: null,
            isAddMode: true,
            source: "admin",
            currentUserId: id,
            userRole: role,
            successCallback: {
              message: `User has been successfully added to contacts.`,
              refreshData: true,
            },
          },
        }),
    },
    {
      title: "Bulk CSV Import",
      description: "Import verified contacts",
      icon: UserCheck,
      color: "bg-orange-500",
      onClick: () => {
        csvInputRef.current?.click();
      },
    },
    {
      title: "Task Management",
      description: "Create & assign tasks",
      icon: Handshake,
      color: "bg-green-500",
      onClick: () => navigate("/task-assignments"),
    },
    {
      title: "Export Data",
      description: "Download reports in multiple formats",
      icon: Download,
      color: "bg-purple-500",
      onClick: () => exportContactsToCSV(),
    },
  ];

  // Loading State with enhanced admin styling
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading Admin Dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">
            Preparing executive insights • {format(new Date(), 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hidden CSV Input */}
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv,application/vnd.ms-excel"
        onChange={handleCSVUpload}
        style={{ display: "none" }}
      />

      {/* Alert Component */}
      <Alert
        isOpen={alert.isOpen}
        severity={alert.severity}
        message={alert.message}
        onClose={closeAlert}
        position="bottom"
        duration={4000}
      />

      <Header />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Executive
                </div>
              </div>
              <p className="text-gray-600 mt-1">
                Data Analytics of Contacts • Last updated: {format(new Date(), 'HH:mm')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </button>
            </div>
          </div>

          {/* UPDATED: Enhanced Primary Stats Grid with GREEN text for verified contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Contacts"
              value={stats.totalContacts.toLocaleString()}
              icon={Users}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              trend={stats.totalContactsTrend >= 0 ? "up" : "down"}
              trendValue={stats.totalContactsTrend}
              subtext="All registered users"
            />
            <StatCard
              title="Verified Contacts"
              value={stats.verifiedContacts.toLocaleString()}
              icon={UserCheck}
              color="bg-gradient-to-r from-green-500 to-green-600"
              subtext={
                <>
                  <span className="text-green-600 font-semibold">{stats.verifiedContactsTrend}%</span> of total contacts
                </>
              }
            />
            <StatCard
              title="Data Quality Score"
              value={`${stats.dataQualityScore}%`}
              icon={Shield}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              subtext="Complete profiles"
            />
            <StatCard
              title="Monthly Acquisition Rate"
              value={stats.monthlyAcquisitionRate}
              icon={Calculator}
              color="bg-gradient-to-r from-orange-500 to-orange-600"
              trend={stats.monthlyAcquisitionTrend >= 0 ? "up" : "down"}
              trendValue={stats.monthlyAcquisitionTrend}
              subtext="Contacts per day this month"
            />
          </div>

          {/* UPDATED: Enhanced Secondary Stats Grid with GREEN text for complete profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="LinkedIn Connections"
              value={stats.linkedinConnections.toLocaleString()}
              icon={Globe}
              color="bg-gradient-to-r from-blue-600 to-indigo-600"
              trend={stats.linkedinTrend >= 0 ? "up" : "down"}
              trendValue={stats.linkedinTrend}
              subtext="Professional network"
            />
            <StatCard
              title="Complete Profiles"
              value={stats.completeProfiles.toLocaleString()}
              icon={CheckCircle}
              color="bg-gradient-to-r from-green-600 to-emerald-600"
              subtext={
                <>
                  <span className="text-green-600 font-semibold">{stats.completeProfilesTrend}%</span> completion rate
                </>
              }

            />
            <StatCard
              title="Total Events"
              value={stats.totalEvents.toLocaleString()}
              icon={Calendar}
              color="bg-gradient-to-r from-purple-600 to-purple-700"
              trend={stats.totalEventsTrend >= 0 ? "up" : "down"}
              trendValue={stats.totalEventsTrend}
              subtext="Event participations"
            />
            <StatCard
              title="Data Verification Queue"
              value={stats.totalImages.toLocaleString()}
              icon={AlertTriangle}
              color="bg-gradient-to-r from-red-500 to-red-600"
              subtext="Awaiting review"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Quick Actions
                  </h2>
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <QuickActionCard key={index} {...action} />
                  ))}
                </div>
              </div>

              {/* Enhanced Contact Data Quality Monitor */}
              <ContactDataQualityMonitor contacts={contacts} />
              <div className="mt-9">
                <OnlineUsersCard />
              </div>

            </div>

            {/* Analytics & Recent Activity */}
            <div className="lg:col-span-2 space-y-8">
              {/* UPDATED: Enhanced Contact Source & Growth Analytics with WEEKLY COUNTS */}
              <ContactSourceAnalytics contacts={contacts} />

              {/* Enhanced Recent Activity */}
              <RecentEventsTimeline contacts={contacts} />

              {/* NEW: Online Users Card */}
            </div>
          </div>

          {/* Charts Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* UPDATED: Contact Activity Chart with DEDUPLICATION */}
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Contact Activity Over Time</h2>
                <div className="ml-auto bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  Trending
                </div>
              </div>
              <ContactsChart
                contacts={contacts}
                startDate={startDate}
                endDate={endDate}
                dateRangeType={dateRangeType}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                setDateRangeType={setDateRangeType}
              />
            </div>

            {/* Skills Horizontal Bar Chart */}
            <SkillsHorizontalBarChart contacts={contacts} />
          </div>

          {/* Additional Charts Row */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Events Bar Chart */}
            <EventsBarChart contacts={contacts} />

            {/* Contact Diversity Overview */}
            <ContactDiversityOverview contacts={contacts} />
          </div>

          {/* User Activity Segmentation */}
          <div className="mt-6">
            <UserActivitySegmentation contacts={contacts} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
