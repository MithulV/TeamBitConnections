import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

const NetworkStatistics = ({ networkData }) => {
  const statisticsData = useMemo(() => {
    if (!networkData?.networkMetrics) return null;

    return {
      barChart: {
        series: [{
          name: 'Network Statistics',
          data: [
            networkData.totalContacts,
            networkData.totalUsers,
            networkData.networkMetrics.maxLevel,
            networkData.referralChains?.length || 0,
          ]
        }],
        options: {
          chart: {
            type: 'bar',
            height: 350
          },
          xaxis: {
            categories: ['Total Contacts', 'Total Users', 'Network Depth', 'Referral Chains']
          },
          colors: ['#3b82f6', '#22c55e', '#8b5cf6', '#f59e0b'],
          title: {
            text: 'Network Overview'
          }
        }
      },
      doughnutChart: {
        series: [],
        options: {
          chart: {
            type: 'donut',
            height: 350
          },
          labels: [],
          title: {
            text: 'Connection Distribution'
          }
        }
      }
    };
  }, [networkData]);

  // Prepare connection distribution
  const connectionDistribution = useMemo(() => {
    if (!networkData?.networkData?.nodes) return { series: [], labels: [] };

    const users = networkData.networkData.nodes.filter(n => n.type === 'user');
    const connectionRanges = {
      '0': 0,
      '1-5': 0,
      '6-10': 0,
      '11-20': 0,
      '20+': 0,
    };

    users.forEach((user) => {
      const connections = user.connections || 0;
      if (connections === 0) connectionRanges['0']++;
      else if (connections <= 5) connectionRanges['1-5']++;
      else if (connections <= 10) connectionRanges['6-10']++;
      else if (connections <= 20) connectionRanges['11-20']++;
      else connectionRanges['20+']++;
    });

    return {
      series: Object.values(connectionRanges),
      labels: Object.keys(connectionRanges),
      options: {
        chart: {
          type: 'donut',
          height: 350
        },
        labels: Object.keys(connectionRanges),
        colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'],
        title: {
          text: 'Connection Distribution'
        }
      }
    };
  }, [networkData]);

  if (!statisticsData) return <div>Loading statistics...</div>;

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Network Statistics
        </h3>
        <p className="text-gray-600 mt-1">
          Comprehensive overview of your network metrics and key performance indicators
        </p>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h4 className="font-semibold text-blue-900 mb-2">
          How Statistics Work:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Key Metrics Cards:</strong> Essential network statistics at a glance</li>
          <li>• <strong>Bar Charts:</strong> Visual comparison of different network metrics</li>
          <li>• <strong>Connection Distribution:</strong> How users are distributed by connection count</li>
          <li>• <strong>Network Health:</strong> Overall health and density measurements</li>
        </ul>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {networkData.totalContacts}
              </div>
              <div className="text-sm text-gray-600">Total Contacts</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {networkData.totalUsers}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {networkData.networkMetrics.maxLevel}
              </div>
              <div className="text-sm text-gray-600">Network Depth</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {networkData.networkMetrics.averageConnectionsPerUser.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Connections</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <ReactApexChart
            options={statisticsData.barChart.options}
            series={statisticsData.barChart.series}
            type="bar"
            height={350}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <ReactApexChart
            options={connectionDistribution.options}
            series={connectionDistribution.series}
            type="donut"
            height={350}
          />
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">
          Enhanced Statistics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h5 className="font-semibold text-gray-700 mb-2">Network Density</h5>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {(networkData.networkMetrics.networkDensity * 100).toFixed(2)}%
            </div>
            <p className="text-sm text-gray-600">How interconnected your network is</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h5 className="font-semibold text-gray-700 mb-2">Total Relationships</h5>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {networkData.networkData.totalEdges}
            </div>
            <p className="text-sm text-gray-600">Direct connections in your network</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h5 className="font-semibold text-gray-700 mb-2">Referral Chains</h5>
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {networkData.referralChains?.length || 0}
            </div>
            <p className="text-sm text-gray-600">Active referral pathways</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatistics;
