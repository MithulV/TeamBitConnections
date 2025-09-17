import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Users,
  UserCheck,
  Shield,
  Calculator,
  Globe,
  CheckCircle,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Handshake,
  Download,
  BarChart3,
} from "lucide-react";
import Header from "../../components/Header/Header";
import Alert from "../../components/Alert/Alert";
import { useAuthStore } from "../../store/AuthStore";
import {
  format,
  parseISO,
  subDays,
  subMonths,
  isAfter,
  startOfDay,
  endOfDay,
  startOfMonth,
} from "date-fns";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
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
} from "chart.js";

// Import your extracted components
import StatCard from "../../components/StatCard/StatCard";
import QuickActionCard from "../../components/QuickActionCard/QuickActionCard";
import PerformanceMetricsCard from "../../components/PerformanceMetricsCard/PerformanceMetricsCard";
import ContactsChart from "../../components/ContactsChart/ContactsChart";
import SkillsHorizontalBarChart from "../../components/SkillsHorizontalBarChart/SkillsHorizontalBarChart.jsx";
import EventsBarChart from "../../components/EventsBarChart/EventsBarChart";
import RecentEventsTimeline from "../../components/RecentEventsTimeline/RecentEventsTimeline";
import ContactDataQualityMonitor from "../../components/ContactDataQualityMonitor/ContactDataQualityMonitor";
import ContactSourceAnalytics from "../../components/ContactSourceAnalytic/ContactSourceAnalytic";
import UserActivitySegmentation from "../../components/UserActivitySegmentation/UserActivitySegmentation";
import ContactDiversityOverview from "../../components/ContactDiversityOverview/ContactDiversityOverview";
import OnlineUsersCard from "../../components/OnlineUsersCard/OnlineUsersCard";

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

// Utility functions for trend calculations
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
  return format(new Date(), "yyyy-MM-dd");
};

// Get yesterday's date formatted
const getYesterdayFormatted = () => {
  return format(subDays(new Date(), 1), "yyyy-MM-dd");
};

// Main Admin Component
function Admin() {
  console.log("🚀 Admin component rendering");

  const navigate = useNavigate();
  const { id, role } = useAuthStore();

  console.log("👤 User data:", { id, role });

  // State Management with corrected dynamic trends
  const [stats, setStats] = useState({
    totalContacts: 0,
    verifiedContacts: 0,
    unverifiedContacts: 0,
    totalEvents: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalUnverifiedContacts: 0,
    activeAssignments: 0,
    dataQualityScore: 0,
    monthlyAcquisitionRate: 0,
    linkedinConnections: 0,
    completeProfiles: 0,
    // Dynamic trend percentages
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

  // CSV export functions
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

      const response = await axios.get(
        `http://localhost:8000/api/get-all-contact/`
      );
      const contacts = response.data.data || response.data || [];

      const jsonContent = JSON.stringify(contacts, null, 2);
      const blob = new Blob([jsonContent], {
        type: "application/json;charset=utf-8;",
      });
      const fileName = `contacts-export-${format(
        new Date(),
        "yyyy-MM-dd-HHmm"
      )}.json`;

      saveAs(blob, fileName);
      showAlert(
        "success",
        `Successfully exported ${contacts.length} contacts to JSON`
      );
    } catch (error) {
      console.error("Error exporting contacts:", error);
      showAlert("error", "Failed to export contacts to JSON");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Dashboard Data with CORRECTED TREND CALCULATIONS
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

      // Dynamic trend calculations
      const today = new Date();
      const yesterday = subDays(today, 1);
      const startOfThisMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const daysPassed = Math.max(
        1,
        Math.floor((today - startOfThisMonth) / (1000 * 60 * 60 * 24)) + 1
      );

      // Current metrics
      const totalContacts = allContacts.length;
      const verifiedContacts = allContacts.filter(
        (c) => c.verified || c.contact_status === "approved"
      ).length;
      const completeProfiles = allContacts.filter(
        (c) => c.email_address && c.phone_number && c.skills && c.company_name
      ).length;
      const linkedinConnections = allContacts.filter(
        (c) => c.linkedin_url
      ).length;
      const dataQualityScore =
        Math.round((completeProfiles / totalContacts) * 100) || 0;

      // Count events today vs yesterday for trend
      const todayEvents = allContacts
        .filter((c) => {
          if (!c.created_at) return false;
          const createdDate = format(parseISO(c.created_at), "yyyy-MM-dd");
          return createdDate === getTodayFormatted();
        })
        .reduce(
          (acc, c) => acc + (c.event_name ? c.event_name.split(";").length : 0),
          0
        );

      const yesterdayEvents = allContacts
        .filter((c) => {
          if (!c.created_at) return false;
          const createdDate = format(parseISO(c.created_at), "yyyy-MM-dd");
          return createdDate === getYesterdayFormatted();
        })
        .reduce(
          (acc, c) => acc + (c.event_name ? c.event_name.split(";").length : 0),
          0
        );

      const totalEvents = allContacts.reduce(
        (acc, c) => acc + (c.event_name ? c.event_name.split(";").length : 0),
        0
      );

      const thisMonthContacts = allContacts.filter((c) => {
        if (!c.created_at) return false;
        const createdDate = parseISO(c.created_at);
        return createdDate >= startOfThisMonth && createdDate <= today;
      }).length;

      const monthlyAcquisitionRate =
        Math.round((thisMonthContacts / daysPassed) * 10) / 10;

      // Previous day comparisons for trends
      const yesterdayTotalContacts = allContacts.filter((c) => {
        if (!c.created_at) return false;
        const createdDate = parseISO(c.created_at);
        return createdDate <= yesterday;
      }).length;

      const yesterdayVerifiedContacts = allContacts.filter((c) => {
        const contactDate = c.created_at ? parseISO(c.created_at) : null;
        return (
          (c.verified || c.contact_status === "approved") &&
          contactDate &&
          contactDate <= yesterday
        );
      }).length;

      const yesterdayCompleteProfiles = allContacts.filter((c) => {
        const contactDate = c.created_at ? parseISO(c.created_at) : null;
        return (
          c.email_address &&
          c.phone_number &&
          c.skills &&
          c.company_name &&
          contactDate &&
          contactDate <= yesterday
        );
      }).length;

      const yesterdayLinkedinConnections = allContacts.filter((c) => {
        const contactDate = c.created_at ? parseISO(c.created_at) : null;
        return c.linkedin_url && contactDate && contactDate <= yesterday;
      }).length;

      // Count new contacts today vs yesterday for acquisition trend
      const todayNewContacts = allContacts.filter((c) => {
        if (!c.created_at) return false;
        const createdDate = format(parseISO(c.created_at), "yyyy-MM-dd");
        return createdDate === getTodayFormatted();
      }).length;

      const yesterdayNewContacts = allContacts.filter((c) => {
        if (!c.created_at) return false;
        const createdDate = format(parseISO(c.created_at), "yyyy-MM-dd");
        return createdDate === getYesterdayFormatted();
      }).length;

      // Calculate trend percentages
      const totalContactsTrend = calculateTrendPercentage(
        todayNewContacts,
        yesterdayNewContacts
      );
      const verifiedContactsPercentage = calculateVerifiedPercentage(
        verifiedContacts,
        totalContacts
      );
      const monthlyAcquisitionTrend = calculateTrendPercentage(
        todayNewContacts,
        yesterdayNewContacts
      );
      const linkedinTrend = calculateTrendPercentage(
        linkedinConnections,
        yesterdayLinkedinConnections
      );
      const completeProfilesPercentage = calculateCompletionPercentage(
        completeProfiles,
        totalContacts
      );
      const totalEventsTrend = calculateTrendPercentage(
        todayEvents,
        yesterdayEvents
      );

      setStats({
        totalContacts,
        verifiedContacts,
        unverifiedContacts: allContacts.filter(
          (c) => !c.verified || c.contact_status === "pending"
        ).length,
        totalEvents,
        totalUnverifiedContacts: unverifiedImages.length + unverifiedContacts.length,
        dataQualityScore,
        monthlyAcquisitionRate,
        linkedinConnections,
        completeProfiles,
        completedTasks: 0,
        pendingTasks: 0,
        activeAssignments: 0,
        // Dynamic trends
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
          <p className="mt-6 text-gray-700 font-medium">
            Loading Admin Dashboard...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Preparing executive insights •{" "}
            {format(new Date(), "MMM dd, yyyy HH:mm")}
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

      <div className="w-full bg-white shadow-sm sticky top-0 z-50 border-b-2 border-b-gray-50">
        <div className="flex justify-end">
          <Header />
        </div>
      </div>

      <div className="p-6">
        <div className="container mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Data Analytics of Contacts • Last updated:{" "}
                {format(new Date(), "HH:mm")}
              </p>
            </div>

            {/* Refresh Button - Stacked on mobile, inline on desktop */}
            <div className="flex justify-start sm:justify-end">
              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center sm:justify-start"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="sm:inline">Refresh Data</span>
              </button>
            </div>
          </div>

          {/* Enhanced Primary Stats Grid with GREEN text for verified contacts */}
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
                  <span className="text-green-600 font-semibold">
                    {stats.verifiedContactsTrend}%
                  </span>{" "}
                  of total contacts
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

          {/* Enhanced Secondary Stats Grid with GREEN text for complete profiles */}
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
                  <span className="text-green-600 font-semibold">
                    {stats.completeProfilesTrend}%
                  </span>{" "}
                  completion rate
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
              value={stats.totalUnverifiedContacts.toLocaleString()}
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
              {/* Enhanced Contact Source & Growth Analytics with WEEKLY COUNTS */}
              <ContactSourceAnalytics contacts={contacts} />

              {/* Enhanced Recent Activity */}
              <RecentEventsTimeline contacts={contacts} />
            </div>
          </div>

          {/* Contact Activity Over Time - FULL WIDTH */}
          <div className="mt-8">
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Contact Activity Over Time
                </h2>
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
          </div>

          {/* Skills Distribution - FULL WIDTH */}
          <div className="mt-6">
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
