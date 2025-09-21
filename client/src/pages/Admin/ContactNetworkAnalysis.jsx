import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import Header from "../../components/Header/Header";
import NetworkTreeVisualization from "../../components/NetworkTreeVisualization/NetworkTreeVisualization";
import { RefreshCw } from "lucide-react";

function ContactNetworkAnalysis() {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/analyze-contact-network");
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
      {/* Header */}
      <div className="w-full bg-white shadow-sm sticky top-0 z-50 border-b-2 border-b-gray-50">
        <div className="flex justify-end">
          <Header />
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        {/* Network Tree Visualization - Full Page */}
        <div className="bg-white shadow">
          <div className="p-6">
            <NetworkTreeVisualization networkData={networkData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactNetworkAnalysis;
