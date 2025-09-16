import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header/Header";

// Import your extracted components
import NetworkTreeVisualization from "../../components/NetworkTreeVisualization/NetworkTreeVisualization";
import NetworkStatistics from "../../components/NetworkStatistics/NetworkStatistics";
import NetworkExplorer from "../../components/NetworkExplorer/NetworkExplorer";
import { RefreshCw } from "lucide-react";

function ContactNetworkAnalysis() {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("tree");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/analyze-contact-network"
      );
      setNetworkData(response.data);
      console.log("Network data loaded:", response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch network data"
      );
      console.error("Error fetching network data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-700">
              Running Network Analysis...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center bg-white p-8 rounded-lg shadow max-w-md">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Analysis Failed
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchNetworkData}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          {/* Header */}
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Network Dashboard
            </h1>
            <div className="text-sm text-gray-500">
              Last analyzed: {new Date(networkData.timestamp).toLocaleString()}
            </div>
          </div>
          {/* Refresh Button */}
          <div className="flex-shrink-0">
            <button
              onClick={fetchNetworkData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? "Running Analysis..." : "Refresh"}
            </button>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: "tree", label: "Network Tree" },
                { key: "statistics", label: "Statistics" },
                { key: "search", label: "Explorer" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Network Tree Tab */}
            {activeTab === "tree" && (
              <NetworkTreeVisualization
                networkData={networkData}
                searchTerm={searchTerm}
                filterType={filterType}
              />
            )}

            {/* Statistics Tab */}
            {activeTab === "statistics" && (
              <NetworkStatistics networkData={networkData} />
            )}

            {/* Explorer Tab */}
            {activeTab === "search" && (
              <NetworkExplorer networkData={networkData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactNetworkAnalysis;
