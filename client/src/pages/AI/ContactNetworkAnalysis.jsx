import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Tree from 'react-d3-tree';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  RadialLinearScale
);

function ContactNetworkAnalysis() {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tree');
  const [treeData, setTreeData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const treeContainer = useRef(null);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  useEffect(() => {
    if (treeContainer.current) {
      const dimensions = treeContainer.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: 50,
      });
    }
  }, [treeData]);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/analyze-contact-network');
      setNetworkData(response.data);

      const treeStructure = buildTreeStructure(response.data);
      setTreeData(treeStructure);

      console.log('🤖 AI Network data loaded:', response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch network data');
      console.error('❌ Error fetching network data:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildTreeStructure = (data) => {
    if (!data || !data.networkData || !data.networkData.nodes || data.networkData.nodes.length === 0) {
      return {
        name: 'No Network Data',
        attributes: { type: 'empty' },
        children: []
      };
    }

    const nodes = data.networkData.nodes;
    const edges = data.networkData.edges || [];

    const nodeMap = new Map();

    nodes.forEach(node => {
      const treeNode = {
        name: node.name || node.email || 'Unknown',
        attributes: {
          id: node.id,
          email: node.email,
          type: node.type,
          connections: node.connections || 0,
          level: node.level || 0,
          referredBy: node.referredBy,
          contactsAdded: node.contactsAdded?.length || 0,
          category: node.category,
          addedBy: node.addedBy,
          createdAt: node.createdAt,
          role: node.role,
          events: node.events || '',
          totalEvents: node.totalEvents || 0
        },
        children: []
      };
      nodeMap.set(node.id, treeNode);
    });

    const childrenMap = new Map();
    const hasParent = new Set();

    edges.forEach(edge => {
      const parentId = edge.from;
      const childId = edge.to;

      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId).push(childId);
      hasParent.add(childId);
    });

    const rootNodes = [];
    nodes.forEach(node => {
      if (!hasParent.has(node.id) && node.type === 'user') {
        rootNodes.push(node.id);
      }
    });

    const buildSubtree = (nodeId) => {
      const node = nodeMap.get(nodeId);
      if (!node) return null;

      const children = childrenMap.get(nodeId) || [];
      node.children = children.map(childId => buildSubtree(childId)).filter(Boolean);

      return node;
    };

    if (rootNodes.length === 0) {
      return {
        name: 'Network Overview',
        attributes: {
          type: 'root',
          totalNodes: nodes.length,
          totalEdges: edges.length
        },
        children: nodes.slice(0, 10).map(node => ({
          name: node.name || node.email || 'Unknown',
          attributes: {
            type: node.type,
            connections: node.connections || 0,
            email: node.email
          },
          children: []
        }))
      };
    } else if (rootNodes.length === 1) {
      return buildSubtree(rootNodes[0]);
    } else {
      return {
        name: 'Network Hierarchy',
        attributes: {
          type: 'virtual_root',
          totalRoots: rootNodes.length,
          totalNodes: nodes.length
        },
        children: rootNodes.map(rootId => buildSubtree(rootId)).filter(Boolean)
      };
    }
  };

  const handleNodeClick = (nodeData) => {
    setSelectedNode(nodeData);
  };

  const renderTreeNode = ({ nodeDatum, toggleNode }) => {
    const isRoot = nodeDatum.attributes?.type === 'virtual_root' || nodeDatum.attributes?.type === 'root';
    const isUser = nodeDatum.attributes?.type === 'user';
    const isContact = nodeDatum.attributes?.type === 'contact';

    const shouldHighlight = () => {
      if (!searchTerm) return false;
      return nodeDatum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nodeDatum.attributes?.email && nodeDatum.attributes.email.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    const isHighlighted = shouldHighlight();

    return (
      <g>
        {isHighlighted && (
          <circle
            r="25"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3"
            opacity="0.6"
          />
        )}

        {isRoot ? (
          <polygon
            points="-20,-15 20,-15 25,0 20,15 -20,15 -25,0"
            fill="#8b5cf6"
            stroke="#374151"
            strokeWidth="2"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              handleNodeClick(nodeDatum);
              toggleNode();
            }}
          />
        ) : isUser ? (
          <circle
            r="20"
            fill="#3b82f6"
            stroke="#1e40af"
            strokeWidth="3"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              handleNodeClick(nodeDatum);
              toggleNode();
            }}
          />
        ) : (
          <rect
            x="-18"
            y="-14"
            width="36"
            height="28"
            rx="6"
            fill="#22c55e"
            stroke="#16a34a"
            strokeWidth="2"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              handleNodeClick(nodeDatum);
              toggleNode();
            }}
          />
        )}

        <text
          fill="#1f2937"
          x="25"        // Reduced from 35
          y="-8"
          fontSize="14px"  // Slightly smaller
          fontWeight="600"
          style={{ userSelect: 'none' }}
        >
          {nodeDatum.name && nodeDatum.name.length > 14 ?
            `${nodeDatum.name.substring(0, 14)}...` :
            nodeDatum.name || 'Unknown'
          }
        </text>

        <text
          fill="#6b7280"
          x="25"        // Reduced from 35
          y="6"
          fontSize="11px"  // Slightly smaller
          fontWeight="500"
          style={{ userSelect: 'none' }}
        >
          {nodeDatum.attributes?.type || 'unknown'}
          {nodeDatum.attributes?.connections ? ` • ${nodeDatum.attributes.connections}` : ''}
        </text>


        {isUser && nodeDatum.attributes?.connections > 0 && (
          <g>
            <circle
              cx="18"
              cy="-18"
              r="8"
              fill="#f59e0b"
              stroke="#d97706"
              strokeWidth="2"
            />
            <text
              x="18"
              y="-14"
              textAnchor="middle"
              fontSize="10px"
              fill="white"
              fontWeight="bold"
            >
              {nodeDatum.attributes.connections}
            </text>
          </g>
        )}

        {isContact && nodeDatum.attributes?.totalEvents > 0 && (
          <g>
            <circle
              cx="-18"
              cy="-18"
              r="6"
              fill="#ec4899"
              stroke="#db2777"
              strokeWidth="1"
            />
            <text
              x="-18"
              y="-15"
              textAnchor="middle"
              fontSize="8px"
              fill="white"
              fontWeight="bold"
            >
              {nodeDatum.attributes.totalEvents}
            </text>
          </g>
        )}
      </g>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-700">
              Running AI Analysis...
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
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Analysis Failed</h2>
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

  // Chart data preparation functions
  const prepareStatisticsBarChart = () => {
    if (!networkData?.networkMetrics) return { labels: [], datasets: [] };

    return {
      labels: ['Total Contacts', 'Total Users', 'Network Depth', 'Referral Chains'],
      datasets: [{
        label: 'Network Statistics',
        data: [
          networkData.totalContacts,
          networkData.totalUsers,
          networkData.networkMetrics.maxLevel,
          networkData.referralChains?.length || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(139, 92, 246)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 2
      }]
    };
  };

  const prepareNetworkMetricsChart = () => {
    if (!networkData?.networkMetrics) return { labels: [], datasets: [] };

    const metrics = networkData.networkMetrics;
    return {
      labels: ['Network Depth', 'Avg Connections', 'Network Density', 'Total Nodes'],
      datasets: [{
        label: 'Network Metrics',
        data: [
          metrics.maxLevel,
          metrics.averageConnectionsPerUser,
          metrics.networkDensity * 100,
          metrics.totalNodes / 10
        ],
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgb(139, 92, 246)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)'
        ],
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2
      }]
    };
  };

  const prepareConnectionDistribution = () => {
    if (!networkData?.networkData?.nodes) return { labels: [], datasets: [] };

    const users = networkData.networkData.nodes.filter(n => n.type === 'user');
    const connectionRanges = {
      '0': 0,
      '1-5': 0,
      '6-10': 0,
      '11-20': 0,
      '20+': 0
    };

    users.forEach(user => {
      const connections = user.connections || 0;
      if (connections === 0) connectionRanges['0']++;
      else if (connections <= 5) connectionRanges['1-5']++;
      else if (connections <= 10) connectionRanges['6-10']++;
      else if (connections <= 20) connectionRanges['11-20']++;
      else connectionRanges['20+']++;
    });

    return {
      labels: Object.keys(connectionRanges),
      datasets: [{
        data: Object.values(connectionRanges),
        backgroundColor: [
          '#ef4444',
          '#f97316',
          '#eab308',
          '#22c55e',
          '#3b82f6'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            AI Network Intelligence
          </h1>
          <div className="text-sm text-gray-500">
            Last analyzed: {new Date(networkData.timestamp).toLocaleString()}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'tree', label: 'Network Tree' },
                { key: 'statistics', label: 'Statistics' },
                { key: 'analytics', label: 'Analytics' },
                { key: 'insights', label: 'AI Insights' },
                { key: 'influencers', label: 'Influencers' },
                { key: 'search', label: 'Explorer' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Network Tree Tab */}
            {activeTab === 'tree' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Interactive Network Tree</h3>
                    <p className="text-gray-600 mt-1">Visual representation of your referral network hierarchy</p>
                  </div>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Search nodes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="user">Users Only</option>
                      <option value="contact">Contacts Only</option>
                    </select>
                  </div>
                </div>

                {/* How it works */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">How Network Tree Works:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Users (Blue Circles):</strong> People who have accounts in your system</li>
                    <li>• <strong>Contacts (Green Rectangles):</strong> People added through events</li>
                    <li>• <strong>Hierarchy:</strong> Shows who referred whom and who added which contacts</li>
                    <li>• <strong>Orange Badge:</strong> Number of direct connections for each user</li>
                    <li>• <strong>Pink Badge:</strong> Number of events attended by contacts</li>
                    <li>• <strong>Click nodes:</strong> Expand/collapse branches and view details</li>
                  </ul>
                </div>

                {/* Legend */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-purple-500 rounded mr-2" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)' }}></div>
                      <span className="font-medium text-gray-700">Network Root</span>
                    </div>  
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-full mr-2"></div>
                      <span className="font-medium text-gray-700">Users ({networkData.totalUsers})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-4 bg-green-500 rounded mr-2"></div>
                      <span className="font-medium text-gray-700">Contacts ({networkData.totalContacts})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                      <span className="font-medium text-gray-700">Connection Count</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Tree Visualization */}
                  <div className="lg:col-span-3">
                    <div
                      id="treeWrapper"
                      ref={treeContainer}
                      className="bg-white border border-gray-300 rounded-lg"
                      style={{ width: '100%', height: '600px' }}  // Reduced from 700px
                    >

                      {treeData ? (
                        <Tree
                          data={treeData}
                          translate={translate}
                          orientation="vertical"
                          pathFunc="step"
                          separation={{ siblings: 0.8, nonSiblings: 1.2}}  // Reduced from 2.5, 3
                          nodeSize={{ x: 180, y: 100 }}                     // Reduced from 300, 140
                          renderCustomNodeElement={renderTreeNode}
                          zoom={1.0}                                         // Increased from 0.8
                          scaleExtent={{ min: 0.3, max: 4 }}               // Adjusted range
                          enableLegacyTransitions={true}
                          shouldCollapseNeighborNodes={false}
                          collapsible={true}
                          depthFactor={100}                                 // Reduced from 140
                        />

                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <p className="text-xl font-medium text-gray-600 mb-4">No tree data available</p>
                            <button
                              onClick={fetchNetworkData}
                              className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
                            >
                              Reload Tree
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Node Details Panel */}
                  <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-300 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Node Details</h4>
                      {selectedNode ? (
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${selectedNode.attributes?.type === 'user' ? 'bg-blue-500' :
                              selectedNode.attributes?.type === 'contact' ? 'bg-green-500' :
                                'bg-purple-500'
                              }`}>
                              <span className="text-white text-lg">
                                {selectedNode.attributes?.type === 'user' ? '👤' :
                                  selectedNode.attributes?.type === 'contact' ? '📋' : '🌐'}
                              </span>
                            </div>
                            <h5 className="font-semibold text-gray-800">{selectedNode.name}</h5>
                          </div>

                          <div className="space-y-3 text-sm">
                            {selectedNode.attributes?.email && (
                              <div>
                                <span className="font-medium text-gray-700">Email:</span>
                                <p className="text-gray-600 text-xs break-all">{selectedNode.attributes.email}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-gray-50 p-2 rounded text-center">
                                <div className="text-lg font-semibold text-blue-600">{selectedNode.attributes?.connections || 0}</div>
                                <div className="text-xs text-gray-600">Connections</div>
                              </div>
                              <div className="bg-gray-50 p-2 rounded text-center">
                                <div className="text-lg font-semibold text-green-600">{selectedNode.children?.length || 0}</div>
                                <div className="text-xs text-gray-600">Children</div>
                              </div>
                            </div>

                            {selectedNode.attributes?.type === 'user' && selectedNode.attributes?.referredBy && (
                              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                                <span className="font-medium text-blue-700 block mb-1">Referred By:</span>
                                <p className="text-blue-600 text-xs break-all">{selectedNode.attributes.referredBy}</p>
                              </div>
                            )}

                            {selectedNode.attributes?.type === 'contact' && selectedNode.attributes?.addedBy && (
                              <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                                <span className="font-medium text-green-700 block mb-1">Added By:</span>
                                <p className="text-green-600 text-xs">{selectedNode.attributes.addedBy}</p>
                              </div>
                            )}

                            {selectedNode.attributes?.totalEvents > 0 && (
                              <div className="bg-pink-50 p-3 rounded border-l-4 border-pink-400">
                                <span className="font-medium text-pink-700 block mb-1">Events:</span>
                                <p className="text-pink-600 text-xs">{selectedNode.attributes.totalEvents} events attended</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-gray-500 text-sm">
                            Click on any node to view details
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NEW STATISTICS TAB */}
            {activeTab === 'statistics' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Network Statistics</h3>
                  <p className="text-gray-600 mt-1">Comprehensive overview of your network metrics and key performance indicators</p>
                </div>

                {/* How it works */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <h4 className="font-semibold text-blue-900 mb-2">How Statistics Work:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Key Metrics Cards:</strong> Essential network statistics at a glance</li>
                    <li>• <strong>Bar Charts:</strong> Visual comparison of different network metrics</li>
                    <li>• <strong>Connection Distribution:</strong> How users are distributed by connection count</li>
                    <li>• <strong>Network Health:</strong> Overall health and density measurements</li>
                    <li>• <strong>AI Enhancement:</strong> Statistics powered by neural network analysis</li>
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
                        <div className="text-2xl font-bold text-gray-900">{networkData.totalContacts}</div>
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
                        <div className="text-2xl font-bold text-gray-900">{networkData.totalUsers}</div>
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
                        <div className="text-2xl font-bold text-gray-900">{networkData.networkMetrics.maxLevel}</div>
                        <div className="text-sm text-gray-600">Network Depth</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">{networkData.networkMetrics.averageConnectionsPerUser.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">Avg Connections</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow border">
                    <h4 className="text-xl font-semibold mb-4 text-gray-800">Network Overview</h4>
                    <div className="h-80">
                      <Bar data={prepareStatisticsBarChart()} options={chartOptions} />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow border">
                    <h4 className="text-xl font-semibold mb-4 text-gray-800">Connection Distribution</h4>
                    <div className="h-80">
                      <Doughnut data={prepareConnectionDistribution()} options={chartOptions} />
                    </div>
                  </div>
                </div>

                {/* AI Enhanced Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">🤖 AI-Enhanced Statistics</h4>
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
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Network Analytics Dashboard</h3>
                  <p className="text-gray-600 mt-1">Statistical analysis of your network structure and patterns</p>
                </div>

                {/* How it works */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                  <h4 className="font-semibold text-green-900 mb-2">How Analytics Work:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• <strong>Radar Chart:</strong> Compares multiple network metrics on a single view</li>
                    <li>• <strong>Doughnut Chart:</strong> Shows distribution of users by connection count ranges</li>
                    <li>• <strong>Network Density:</strong> Measures how interconnected your network is (0-100%)</li>
                    <li>• <strong>Total Relationships:</strong> Count of all direct connections between nodes</li>
                    <li>• <strong>Referral Chains:</strong> Number of active referral pathways in your network</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow border">
                    <h4 className="text-xl font-semibold mb-4 text-gray-800">Network Metrics Overview</h4>
                    <div className="h-80">
                      <Radar data={prepareNetworkMetricsChart()} options={radarOptions} />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow border">
                    <h4 className="text-xl font-semibold mb-4 text-gray-800">Connection Distribution</h4>
                    <div className="h-80">
                      <Doughnut data={prepareConnectionDistribution()} options={chartOptions} />
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-indigo-500 text-white p-6 rounded-lg shadow">
                    <h5 className="text-lg font-semibold mb-2">Network Density</h5>
                    <div className="text-3xl font-bold mb-2">{(networkData.networkMetrics.networkDensity * 100).toFixed(2)}%</div>
                    <p className="text-indigo-200 text-sm">How interconnected your network is</p>
                  </div>

                  <div className="bg-teal-500 text-white p-6 rounded-lg shadow">
                    <h5 className="text-lg font-semibold mb-2">Total Relationships</h5>
                    <div className="text-3xl font-bold mb-2">{networkData.networkData.totalEdges}</div>
                    <p className="text-teal-200 text-sm">Direct connections in your network</p>
                  </div>

                  <div className="bg-rose-500 text-white p-6 rounded-lg shadow">
                    <h5 className="text-lg font-semibold mb-2">Referral Chains</h5>
                    <div className="text-3xl font-bold mb-2">{networkData.referralChains?.length || 0}</div>
                    <p className="text-rose-200 text-sm">Active referral pathways</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'insights' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">🤖 AI-Powered Insights</h3>
                  <p className="text-gray-600 mt-1">Neural network analysis of your network patterns and predictions</p>
                </div>

                {/* How it works */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
                  <h4 className="font-semibold text-purple-900 mb-2">How AI Neural Networks Work:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• <strong>Deep Learning:</strong> Multi-layer neural networks analyze complex patterns</li>
                    <li>• <strong>LSTM Networks:</strong> Recurrent neural networks for sequence prediction</li>
                    <li>• <strong>CNN Pattern Recognition:</strong> Convolutional networks detect network features</li>
                    <li>• <strong>Autoencoders:</strong> Neural networks for anomaly detection</li>
                    <li>• <strong>GANs:</strong> Generative networks for synthetic data analysis</li>
                    <li>• <strong>Real Training:</strong> Networks learn from your actual network data</li>
                  </ul>
                </div>

                <div className="space-y-6">
                  {networkData.aiInsights?.map((insight, index) => (
                    <div
                      key={index}
                      className={`rounded-lg shadow border ${insight.importance === 'high'
                        ? 'bg-red-50 border-red-200'
                        : insight.importance === 'medium'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-green-50 border-green-200'
                        }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className={`w-3 h-3 rounded-full mr-3 ${insight.importance === 'high' ? 'bg-red-500' :
                                insight.importance === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}></div>
                              <h4 className="text-xl font-semibold text-gray-800">{insight.title}</h4>
                            </div>
                            <p className="text-gray-700 mb-2">{insight.description}</p>
                            {insight.data?.aiModel && (
                              <p className="text-sm text-gray-600">
                                🤖 <strong>AI Model:</strong> {insight.data.aiModel}
                              </p>
                            )}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${insight.importance === 'high' ? 'bg-red-500 text-white' :
                            insight.importance === 'medium' ? 'bg-yellow-500 text-white' :
                              'bg-green-500 text-white'
                            }`}>
                            {insight.importance.toUpperCase()}
                          </div>
                        </div>

                        {insight.data && (
                          <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                              🔍 View Neural Network Details
                            </summary>
                            <div className="mt-2 bg-white rounded p-3 border">
                              <pre className="text-sm overflow-auto max-h-40 text-gray-700">
                                {JSON.stringify(insight.data, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Influencers Tab */}
            {activeTab === 'influencers' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Network Influencers</h3>
                  <p className="text-gray-600 mt-1">Top users ranked by their network influence and connections</p>
                </div>

                {/* How it works */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                  <h4 className="font-semibold text-yellow-900 mb-2">How Influence Scoring Works:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• <strong>Base Score:</strong> Direct connections count as primary influence factor</li>
                    <li>• <strong>Hierarchy Bonus:</strong> Users higher in network hierarchy get additional points</li>
                    <li>• <strong>Network Reach:</strong> Indirect connections through referrals multiply influence</li>
                    <li>• <strong>Rankings:</strong> Gold (1st), Silver (2nd), Bronze (3rd) medals for top performers</li>
                    <li>• <strong>Influence Meter:</strong> Visual bar showing relative influence level (0-100%)</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {networkData.topInfluencers?.map((influencer, index) => (
                    <div key={index} className="bg-white rounded-lg shadow border p-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-400' :
                              'bg-blue-500'
                          }`}>
                          {index + 1}
                        </div>
                        {index < 3 && (
                          <div className="ml-2 text-2xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </div>
                        )}
                      </div>

                      <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">{influencer.name}</h4>
                        <p className="text-sm text-gray-600 break-all">{influencer.email}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">Connections:</span>
                          <span className="text-xl font-semibold text-blue-600">{influencer.connections}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">Network Level:</span>
                          <span className="font-semibold text-gray-800">{influencer.level}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Influence Score:</span>
                          <span className="text-xl font-semibold text-purple-600">{influencer.influence_score}</span>
                        </div>
                      </div>

                      {/* Influence meter */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min((influencer.influence_score / 50) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">Influence Level</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explorer Tab */}
            {activeTab === 'search' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Network Explorer</h3>
                  <p className="text-gray-600 mt-1">Search and filter through all network nodes</p>
                </div>

                {/* How it works */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
                  <h4 className="font-semibold text-indigo-900 mb-2">How Network Explorer Works:</h4>
                  <ul className="text-sm text-indigo-800 space-y-1">
                    <li>• <strong>Search:</strong> Find nodes by name or email address (real-time filtering)</li>
                    <li>• <strong>Filter:</strong> Show all nodes, only users, or only contacts</li>
                    <li>• <strong>Node List:</strong> Browse through all network members with key details</li>
                    <li>• <strong>Quick Stats:</strong> Summary of network composition and structure</li>
                    <li>• <strong>Click to Select:</strong> Choose any node to view detailed information</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Search Controls */}
                    <div className="bg-white p-6 rounded-lg shadow border">
                      <h4 className="text-lg font-semibold mb-4">Search & Filter</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Types</option>
                          <option value="user">Users Only</option>
                          <option value="contact">Contacts Only</option>
                        </select>
                      </div>
                    </div>

                    {/* Search Results */}
                    <div className="bg-white rounded-lg shadow border p-6">
                      <h4 className="text-lg font-semibold mb-4">Network Nodes</h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {networkData.networkData?.nodes
                          ?.filter(node => {
                            const matchesSearch = !searchTerm ||
                              node.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              node.email?.toLowerCase().includes(searchTerm.toLowerCase());
                            const matchesFilter = filterType === 'all' || node.type === filterType;
                            return matchesSearch && matchesFilter;
                          })
                          ?.slice(0, 20)
                          ?.map((node, index) => (
                            <div
                              key={node.id}
                              onClick={() => setSelectedNode({
                                name: node.name || node.email,
                                attributes: node,
                                children: []
                              })}
                              className={`flex items-center p-3 rounded border cursor-pointer hover:bg-gray-50 ${node.type === 'user' ? 'border-blue-200' : 'border-green-200'
                                }`}
                            >
                              <div className={`w-10 h-10 rounded flex items-center justify-center mr-3 ${node.type === 'user' ? 'bg-blue-500' : 'bg-green-500'
                                }`}>
                                <span className="text-white text-sm">
                                  {node.type === 'user' ? '👤' : '📋'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-800">{node.name || 'Unknown'}</h5>
                                <p className="text-sm text-gray-600">{node.email}</p>
                                <p className="text-xs text-gray-500">{node.connections || 0} connections</p>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs font-medium ${node.type === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                }`}>
                                {node.type}
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>

                  {/* Explorer Details Panel */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow border p-4">
                      <h4 className="text-lg font-semibold mb-4">Quick Stats</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Nodes:</span>
                          <span className="font-semibold text-blue-600">{networkData.networkData?.totalNodes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Edges:</span>
                          <span className="font-semibold text-green-600">{networkData.networkData?.totalEdges}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">User Nodes:</span>
                          <span className="font-semibold text-purple-600">{networkData.totalUsers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contact Nodes:</span>
                          <span className="font-semibold text-orange-600">{networkData.totalContacts}</span>
                        </div>
                      </div>
                    </div>

                    {selectedNode && (
                      <div className="bg-white rounded-lg shadow border p-4">
                        <h4 className="text-lg font-semibold mb-4">Selected Node</h4>
                        <div className="text-center mb-3">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-2 ${selectedNode.attributes?.type === 'user' ? 'bg-blue-500' : 'bg-green-500'
                            }`}>
                            <span className="text-white text-lg">
                              {selectedNode.attributes?.type === 'user' ? '👤' : '📋'}
                            </span>
                          </div>
                          <h5 className="font-semibold text-gray-800">{selectedNode.name}</h5>
                        </div>

                        <div className="space-y-2 text-sm">
                          {selectedNode.attributes?.email && (
                            <div>
                              <span className="font-medium text-gray-700">Email:</span>
                              <span className="text-gray-600 break-all ml-2">{selectedNode.attributes.email}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-blue-50 p-2 rounded text-center">
                              <div className="font-semibold text-blue-600">{selectedNode.attributes?.connections || 0}</div>
                              <div className="text-xs text-gray-600">Connections</div>
                            </div>
                            <div className="bg-green-50 p-2 rounded text-center">
                              <div className="font-semibold text-green-600">{selectedNode.attributes?.level || 0}</div>
                              <div className="text-xs text-gray-600">Level</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={fetchNetworkData}
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running AI Analysis...' : '🤖 Run AI Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactNetworkAnalysis;
