import React, { useState, useEffect } from "react";
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
import { useAuthStore } from "../store/AuthStore";
import { format, parseISO } from "date-fns";

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
              className={`text-sm ml-1 ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
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

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  color,
}) => (
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

const RecentActivityItem = ({ activity }) => (
  <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
    <div className="flex-1">
      <p className="text-sm text-gray-900">{activity.description}</p>
      <p className="text-xs text-gray-500">
        {format(parseISO(activity.timestamp), "MMM dd, yyyy HH:mm")}
      </p>
    </div>
  </div>
);

function Admin() {
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

  const [recentContacts, setRecentContacts] = useState([]);
  const [recentImages, setRecentImages] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [categoryData, setCategoryData] = useState({ A: 0, B: 0, C: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

  const { id } = useAuthStore();

  const showAlert = (severity, message) => {
    setAlert({ isOpen: true, severity, message });
  };

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch various data in parallel
      const [
        contactsResponse,
        unverifiedContactsResponse,
        unverifiedImagesResponse,
        categoryAResponse,
        categoryBResponse,
        categoryCResponse,
      ] = await Promise.all([
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
      ]);

      const contacts = contactsResponse.data;
      const unverifiedContacts = unverifiedContactsResponse.data;
      const unverifiedImages = unverifiedImagesResponse.data;

      // Calculate stats
      setStats({
        totalContacts: contacts.length,
        verifiedContacts: contacts.filter((c) => c.verified).length,
        unverifiedContacts: unverifiedContacts.length,
        totalEvents: contacts.reduce(
          (acc, contact) => acc + (contact.events?.length || 0),
          0
        ),
        completedTasks: 0, // You can fetch this from tasks API
        pendingTasks: 0, // You can fetch this from tasks API
        totalImages: unverifiedImages.length,
        activeAssignments: 0, // You can fetch this from assignments API
      });

      // Set category data
      setCategoryData({
        A: categoryAResponse.data.length,
        B: categoryBResponse.data.length,
        C: categoryCResponse.data.length,
      });

      // Set recent data
      setRecentContacts(contacts.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showAlert("error", "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [id]);

  const quickActions = [
    {
      title: "Add New Contact",
      description: "Create a new contact entry",
      icon: Users,
      color: "bg-blue-500",
      onClick: () => console.log("Add contact"),
    },
    {
      title: "Review Unverified",
      description: "Check pending verifications",
      icon: UserCheck,
      color: "bg-orange-500",
      onClick: () => console.log("Review unverified"),
    },
    {
      title: "Assign Tasks",
      description: "Create new assignments",
      icon: Handshake,
      color: "bg-green-500",
      onClick: () => console.log("Assign tasks"),
    },
    {
      title: "Generate Report",
      description: "Export data reports",
      icon: Download,
      color: "bg-purple-500",
      onClick: () => console.log("Generate report"),
    },
  ];

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

          {/* Stats Grid */}
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

          {/* Secondary Stats */}
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
              title="Category B"
              value={categoryData.B}
              icon={Building}
              color="bg-yellow-600"
            />
          </div>

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

            {/* Recent Activity & Analytics */}
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
                            width: `${
                              (categoryData.A /
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
                            width: `${
                              (categoryData.B /
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
                            width: `${
                              (categoryData.C /
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
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {recentContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {contact.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {contact.email_address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {format(parseISO(contact.created_at), "MMM dd")}
                        </p>
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            contact.verified ? "bg-green-500" : "bg-orange-500"
                          }`}
                        ></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              System Health
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-green-600">Healthy</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  API Services
                </p>
                <p className="text-xs text-green-600">Online</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Storage</p>
                <p className="text-xs text-orange-600">85% Used</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;

