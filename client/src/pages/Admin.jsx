import React, { useState, useEffect, useRef, useMemo,useCallback } from "react";
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
} from "lucide-react";
import Header from "../components/Header";
import Alert from "../components/Alert";
import Geocoder from "../components/Geocoder";
import { useAuthStore } from "../store/AuthStore";
import { format, parseISO, subDays, subMonths, isAfter, startOfDay, endOfDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import { Line } from 'react-chartjs-2';
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
  Filler
);

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <div className="flex items-center mt-2">
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-sm ml-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}
            >
              {trendValue}%
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon: Icon, onClick, color }) => (
  <div
    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

// Enhanced Contacts Chart Component
const ContactsChart = ({ contacts, startDate, endDate, dateRangeType, setStartDate, setEndDate, setDateRangeType }) => {
  const handlePredefinedRange = (range) => {
    const today = new Date();
    let newStartDate;

    switch (range) {
      case 'last7days':
        newStartDate = subDays(today, 7);
        break;
      case 'last30days':
        newStartDate = subDays(today, 30);
        break;
      case 'lastMonth':
        newStartDate = subMonths(today, 1);
        break;
      case 'last3Months':
        newStartDate = subMonths(today, 3);
        break;
      case 'last6Months':
        newStartDate = subMonths(today, 6);
        break;
      case 'lastYear':
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

    const filteredContacts = contactsArray.filter(contact => {
      const createdDate = contact.created_at ? parseISO(contact.created_at) : null;
      return createdDate &&
        isAfter(createdDate, startOfDay(startDate)) &&
        createdDate <= endOfDay(endDate);
    });

    const createdDates = {};
    const updatedDates = {};

    filteredContacts.forEach(contact => {
      if (contact.created_at) {
        const date = format(parseISO(contact.created_at), 'yyyy-MM-dd');
        createdDates[date] = (createdDates[date] || 0) + 1;
      }

      if (contact.updated_at) {
        const updateDate = parseISO(contact.updated_at);
        if (isAfter(updateDate, startOfDay(startDate)) && updateDate <= endOfDay(endDate)) {
          const date = format(updateDate, 'yyyy-MM-dd');
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
          label: 'Contacts Created',
          data: allDates.map(date => createdDates[date] || 0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Contacts Updated',
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

// Enhanced ContactsMapContainer with proper loading states and map invalidation
const ContactsMapContainer = ({ contacts, showAlert }) => {
  return (
    <Geocoder
      contacts={contacts}
      className="h-64"
      showProgress={true}
    />
  );
};  

// Main Admin Component
function Admin() {
  console.log("🚀 Admin component rendering");

  const navigate = useNavigate();
  const { id, role } = useAuthStore();

  console.log("👤 User data:", { id, role });

  // State Management
  const [stats, setStats] = useState({
    totalContacts: 0,
    verifiedContacts: 0,
    unverifiedContacts: 0,
    totalEvents: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalImages: 0,
    activeAssignments: 0,
  });

  const [contacts, setContacts] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [categoryData, setCategoryData] = useState({ A: 0, B: 0, C: 0 });
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [dateRangeType, setDateRangeType] = useState('custom');

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

  // CSV Export Function
  const exportCsv = (contacts) => {
    const headers = [
      "Added By", "Created At", "Name", "Phone Number",
      "Secondary Phone Number", "Email Address", "Secondary Email",
      "Skills", "Linkedin Url", "Job Title", "Company Name", "Department Type",
      "From Date", "To Date", "Event Name", "Event Role", "Event held Organization",
      "Event location", "Date of Birth", "Gender", "Nationality", "Marital Status",
      "Category", "Emergency Contact Name", "Emergency Contact Relationship",
      "Logger", "Street", "City", "State", "Country", "ZipCode",
      "Pg Course Name", "Pg College Name", "Pg University Type", "Pg Start Date",
      "Pg End Date", "Ug Course Name", "Ug College Name", "Ug University Type",
      "Ug Start Date", "Ug End Date"
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));

    contacts.forEach(contact => {
      const row = [
        contact.added_by || '',
        contact.created_at ? format(parseISO(contact.created_at), "yyyy-MM-dd HH:mm:ss") : '',
        contact.name || '',
        contact.phone_number || '',
        contact.secondary_phone_number || '',
        contact.email_address || '',
        contact.secondary_email || '',
        contact.skills || '',
        contact.linkedin_url || '',
        contact.job_title || '',
        contact.company_name || '',
        contact.department_type || '',
        contact.from_date || '',
        contact.to_date || '',
        contact.event_name || '',
        contact.event_role || '',
        contact.event_held_organization || '',
        contact.event_location || '',
        contact.dob ? format(parseISO(contact.dob), "yyyy-MM-dd") : '',
        contact.gender || '',
        contact.nationality || '',
        contact.marital_status || '',
        contact.category || '',
        contact.emergency_contact_name || '',
        contact.emergency_contact_relationship || '',
        contact.logger || '',
        contact.street || '',
        contact.city || '',
        contact.state || '',
        contact.country || '',
        contact.zipcode || '',
        contact.pg_course_name || '',
        contact.pg_college_name || '',
        contact.pg_university_type || '',
        contact.pg_start_date || '',
        contact.pg_end_date || '',
        contact.ug_course_name || '',
        contact.ug_college_name || '',
        contact.ug_university_type || '',
        contact.ug_start_date || '',
        contact.ug_end_date || ''
      ];

      csvRows.push(row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
    });

    return csvRows.join('\n');
  };

  const exportContactsToCSV = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`http://localhost:8000/api/get-all-contact/`);
      const contacts = response.data.data || response.data || [];

      const csvContent = exportCsv(contacts);

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = `contacts-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;

      saveAs(blob, fileName);
      showAlert("success", `Successfully exported ${contacts.length} contacts to CSV`);

    } catch (error) {
      console.error("Error exporting contacts:", error);
      showAlert("error", "Failed to export contacts to CSV");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Dashboard Data
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
        axios.get("http://localhost:8000/api/get-contacts-by-category/?category=A"),
        axios.get("http://localhost:8000/api/get-contacts-by-category/?category=B"),
        axios.get("http://localhost:8000/api/get-contacts-by-category/?category=C"),
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
        unverifiedImages: unverifiedImages.length
      });

      setContacts(allContacts);
      setRecentContacts(recentContactsData.map(item => ({
        ...item,
        role: item.experiences?.[0]?.job_title || "N/A",
        company: item.experiences?.[0]?.company || "N/A",
        location: `${item.address?.city || ""}, ${item.address?.state || ""}`.trim() === ","
          ? "N/A"
          : `${item.address?.city || ""}, ${item.address?.state || ""}`,
        skills: item.skills ? item.skills.split(",").map(s => s.trim()) : [],
      })));

      setStats({
        totalContacts: allContacts.length,
        verifiedContacts: allContacts.filter(c => c.verified || c.contact_status === 'approved').length,
        unverifiedContacts: allContacts.filter(c => !c.verified || c.contact_status === 'pending').length,
        totalEvents: allContacts.reduce((acc, c) => acc + (c.event_name ? c.event_name.split(';').length : 0), 0),
        totalImages: unverifiedImages.length,
        completedTasks: 0,
        pendingTasks: 0,
        activeAssignments: 0,
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

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
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
      formData.append('csv_file', file);
      formData.append('created_by', id);

      const response = await axios.post('http://localhost:8000/api/import-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const { successCount, errorCount, duplicateCount, totalRows } = response.data.data;

        showAlert("success",
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
      console.error('CSV import error:', error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Unknown error occurred during CSV import';
      showAlert("error", `CSV Import Error: ${errorMessage}`);
    }

    event.target.value = '';
  };

  // Quick Actions Configuration
  const quickActions = [
    {
      title: "Add New Contact",
      description: "Create a new contact entry that is verified",
      icon: Users,
      color: "bg-blue-500",
      onClick: () => navigate('/details-input', {
        state: {
          contact: null,
          isAddMode: true,
          source: 'admin',
          currentUserId: id,
          userRole: role,
          successCallback: {
            message: `User has been successfully added to contacts.`,
            refreshData: true
          }
        }
      }),
    },
    {
      title: "Add CSV File",
      description: "Add contacts that are verified",
      icon: UserCheck,
      color: "bg-orange-500",
      onClick: () => {
        csvInputRef.current?.click();
      },
    },
    {
      title: "Assign Tasks",
      description: "Create new assignments",
      icon: Handshake,
      color: "bg-green-500",
      onClick: () => navigate("/task-assignments"),
    },
    {
      title: "Generate CSV File",
      description: "Export data CSV",
      icon: Download,
      color: "bg-purple-500",
      onClick: () => exportContactsToCSV(),
    },
  ];

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden CSV Input */}
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv,application/vnd.ms-excel"
        onChange={handleCSVUpload}
        style={{ display: 'none' }}
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
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your BitConnections platform
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Primary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Contacts"
              value={stats.totalContacts}
              icon={Users}
              color="bg-blue-500"
              trend="up"
              trendValue="12"
            />
            <StatCard
              title="Verified Contacts"
              value={stats.verifiedContacts}
              icon={UserCheck}
              color="bg-green-500"
              trend="up"
              trendValue="8"
            />
            <StatCard
              title="Pending Verification"
              value={stats.unverifiedContacts}
              icon={Clock}
              color="bg-orange-500"
            />
            <StatCard
              title="Total Events"
              value={stats.totalEvents}
              icon={Calendar}
              color="bg-purple-500"
              trend="up"
              trendValue="15"
            />
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Unverified Images"
              value={stats.totalImages}
              icon={Camera}
              color="bg-red-500"
            />
            <StatCard
              title="Active Assignments"
              value={stats.activeAssignments}
              icon={Handshake}
              color="bg-indigo-500"
            />
            <StatCard
              title="Category A"
              value={categoryData.A}
              icon={Building}
              color="bg-red-600"
            />
            <StatCard
              title="Category B + C"
              value={categoryData.B + categoryData.C}
              icon={Building}
              color="bg-green-600"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <QuickActionCard key={index} {...action} />
                  ))}
                </div>
              </div>
            </div>

            {/* Analytics & Recent Activity */}
            <div className="lg:col-span-2 space-y-8">
              {/* Category Distribution */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Category Distribution
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Category A
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${(categoryData.A /
                              (categoryData.A +
                                categoryData.B +
                                categoryData.C)) *
                              100
                              }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 w-8">
                        {categoryData.A}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Category B
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{
                            width: `${(categoryData.B /
                              (categoryData.A +
                                categoryData.B +
                                categoryData.C)) *
                              100
                              }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 w-8">
                        {categoryData.B}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Category C
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(categoryData.C /
                              (categoryData.A +
                                categoryData.B +
                                categoryData.C)) *
                              100
                              }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 w-8">
                        {categoryData.C}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Contacts */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Contacts
                  </h2>
                </div>

                {recentContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No recent contacts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentContacts.map((contact, index) => {
                      return (
                        <div
                          key={contact.contact_id || index}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                          onClick={() => navigate(`/profile/${contact.contact_id}`, { state: contact })}
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {contact.name || 'No Name'}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {contact.email_address || contact.email || 'No Email'}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm text-gray-500">
                              {contact.created_at ? format(parseISO(contact.created_at), "MMM dd") : 'No Date'}
                            </p>
                            <div className="flex justify-end mt-1">
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${contact.contact_status === 'approved' && contact.verified
                                  ? "bg-green-500"
                                  : contact.contact_status === 'rejected'
                                    ? "bg-red-500"
                                    : "bg-orange-500"
                                  }`}
                              ></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analytics Section - Chart and Map */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Activity Chart */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Contact Activity Over Time</h2>
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

            {/* Enhanced Contact Locations Map */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Contact Locations</h2>
              </div>
              <ContactsMapContainer contacts={contacts} showAlert={showAlert} />
              <p className="text-xs text-gray-500 mt-2">
                🌍 Enhanced geocoding with multi-service fallback, smart address matching, and precision scoring
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
