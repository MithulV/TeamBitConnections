import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Enhanced CSS styles with uniform boldness for all nodes
const treeStyles = `
  .rd3t-node text,
  .node-text-group text,
  svg text,
  .rd3t-tree text,
  .rd3t-tree g text {
    font-weight: 600 !important;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    -webkit-font-smoothing: antialiased !important;
    -moz-osx-font-smoothing: grayscale !important;
    font-synthesis: none !important;
  }
  
  .rd3t-label__title,
  .rd3t-label__attributes {
    font-weight: 600 !important;
  }
  
  /* Specific override for nodes with siblings - SAME BOLDNESS */
  .rd3t-node.rd3t-node--hasChildren text,
  .rd3t-node[data-has-siblings="true"] text,
  g[data-has-siblings="true"] text {
    font-weight: 600 !important;
    font-synthesis: none !important;
  }
  
  /* Override any bold rendering in SVG context - SAME BOLDNESS */
  svg g text {
    font-weight: 600 !important;
    stroke: none !important;
    fill: #4b5563 !important;
  }
`;

const NetworkTreeVisualization = ({ networkData, searchTerm, filterType }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const treeContainer = useRef(null);
  const treeRef = useRef(null);

  // Inject styles to override any library defaults
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = treeStyles;
    document.head.appendChild(styleSheet);
    
    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  const buildTreeStructure = (data) => {
    if (
      !data ||
      !data.networkData ||
      !data.networkData.nodes ||
      data.networkData.nodes.length === 0
    ) {
      return {
        name: "No Network Data",
        attributes: { type: "empty" },
        children: [],
      };
    }

    const nodes = data.networkData.nodes;
    const edges = data.networkData.edges || [];

    const nodeMap = new Map();

    nodes.forEach((node) => {
      const treeNode = {
        name: node.name || node.email || "Unknown",
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
          events: node.events || "",
          totalEvents: node.totalEvents || 0,
        },
        children: [],
      };
      nodeMap.set(node.id, treeNode);
    });

    const childrenMap = new Map();
    const hasParent = new Set();

    edges.forEach((edge) => {
      const parentId = edge.from;
      const childId = edge.to;

      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId).push(childId);
      hasParent.add(childId);
    });

    const rootNodes = [];
    nodes.forEach((node) => {
      if (!hasParent.has(node.id) && node.type === "user") {
        rootNodes.push(node.id);
      }
    });

    const buildSubtree = (nodeId) => {
      const node = nodeMap.get(nodeId);
      if (!node) return null;

      const children = childrenMap.get(nodeId) || [];
      node.children = children
        .map((childId) => buildSubtree(childId))
        .filter(Boolean);

      return node;
    };

    if (rootNodes.length === 0) {
      return {
        name: "Network Overview",
        attributes: {
          type: "root",
          totalNodes: nodes.length,
          totalEdges: edges.length,
        },
        children: nodes.slice(0, 10).map((node) => ({
          name: node.name || node.email || "Unknown",
          attributes: {
            type: node.type,
            connections: node.connections || 0,
            email: node.email,
          },
          children: [],
        })),
      };
    } else if (rootNodes.length === 1) {
      return buildSubtree(rootNodes[0]);
    } else {
      return {
        name: "Network Hierarchy",
        attributes: {
          type: "virtual_root",
          totalRoots: rootNodes.length,
          totalNodes: nodes.length,
        },
        children: rootNodes
          .map((rootId) => buildSubtree(rootId))
          .filter(Boolean),
      };
    }
  };

  useEffect(() => {
    if (networkData) {
      const treeStructure = buildTreeStructure(networkData);
      setTreeData(treeStructure);
    }
  }, [networkData]);

  useEffect(() => {
    if (treeContainer.current) {
      const dimensions = treeContainer.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: 80,
      });
    }
  }, [treeData]);

  // Zoom control functions
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom * 1.2, 10)); // Max zoom 10x
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom * 0.8, 0.1)); // Min zoom 0.1x
  };

  const handleResetZoom = () => {
    setZoom(0.8);
    if (treeContainer.current) {
      const dimensions = treeContainer.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: 80,
      });
    }
  };

  const handleNodeClick = (nodeData) => {
    setSelectedNode(nodeData);
  };

  // Updated renderTreeNode function with UNIFORM BOLDNESS for all nodes
  const renderTreeNode = ({ nodeDatum, toggleNode }) => {
    const isRoot =
      nodeDatum.attributes?.type === "virtual_root" ||
      nodeDatum.attributes?.type === "root";
    const isUser = nodeDatum.attributes?.type === "user";
    const isContact = nodeDatum.attributes?.type === "contact";
    
    // Check if this node has siblings
    const hasSiblings = nodeDatum.children && nodeDatum.children.length > 0;

    const shouldHighlight = () => {
      if (!searchTerm) return false;
      return (
        nodeDatum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nodeDatum.attributes?.email &&
          nodeDatum.attributes.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
      );
    };

    const isHighlighted = shouldHighlight();

    // Function to truncate text properly
    const truncateText = (text, maxLength) => {
      if (!text) return "Unknown";
      return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    return (
      <g data-has-siblings={hasSiblings}>
        {/* Enhanced highlight ring for better visibility */}
        {isHighlighted && (
          <circle
            r="50"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="4"
            opacity="0.8"
          />
        )}

        {/* Improved node shapes with better contrast */}
        {isRoot ? (
          <rect
            x="-35"
            y="-18"
            width="70"
            height="36"
            rx="8"
            fill="#8b5cf6"
            stroke="#ffffff"
            strokeWidth="3"
            style={{ cursor: "pointer" }}
            onClick={() => {
              handleNodeClick(nodeDatum);
              toggleNode();
            }}
          />
        ) : isUser ? (
          <circle
            r="25"
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth="3"
            style={{ cursor: "pointer" }}
            onClick={() => {
              handleNodeClick(nodeDatum);
              toggleNode();
            }}
          />
        ) : (
          <rect
            x="-28"
            y="-16"
            width="56"
            height="32"
            rx="8"
            fill="#22c55e"
            stroke="#ffffff"
            strokeWidth="3"
            style={{ cursor: "pointer" }}
            onClick={() => {
              handleNodeClick(nodeDatum);
              toggleNode();
            }}
          />
        )}

        {/* UNIFORM BOLD TEXT FOR ALL NODES */}
        <g className="node-text-group" data-has-siblings={hasSiblings}>
          {/* Wider text background to accommodate longer text */}
          <rect
            x="-75"
            y="42"
            width="150"
            height="45"
            rx="8"
            fill="rgba(255, 255, 255, 0.95)"
            stroke="rgba(0, 0, 0, 0.08)"
            strokeWidth="1"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          />
          
          {/* Main name text - SAME BOLDNESS FOR ALL */}
          <text
            fill="#4b5563"
            x="0"
            y="58"
            textAnchor="middle"
            fontSize="12px"
            fontWeight="600" // UNIFORM BOLDNESS
            fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            style={{ 
              userSelect: "none",
              fontWeight: "600 !important", // SAME FOR ALL - no conditional
              WebkitFontSmoothing: "antialiased",
              textRendering: "geometricPrecision",
              fontSynthesis: "none",
              fontVariant: "normal"
            }}
            data-has-siblings={hasSiblings}
          >
            {truncateText(nodeDatum.name, 20)}
          </text>

          {/* Type and connection text - SAME BOLDNESS FOR ALL */}
          <text
            fill="#6b7280"
            x="0"
            y="75"
            textAnchor="middle"
            fontSize="10px"
            fontWeight="500" // UNIFORM BOLDNESS
            fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            style={{ 
              userSelect: "none",
              fontWeight: "500 !important", // SAME FOR ALL - no conditional
              WebkitFontSmoothing: "antialiased",
              textRendering: "geometricPrecision",
              fontSynthesis: "none",
              fontVariant: "normal"
            }}
            data-has-siblings={hasSiblings}
          >
            {nodeDatum.attributes?.type || "unknown"}
            {nodeDatum.attributes?.connections
              ? ` • ${nodeDatum.attributes.connections}`
              : ""}
          </text>
        </g>

        {/* Enhanced badges with bold text */}
        {isUser && nodeDatum.attributes?.connections > 0 && (
          <g>
            <circle
              cx="35"
              cy="-28"
              r="12"
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth="2"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            />
            <text
              x="35"
              y="-23"
              textAnchor="middle"
              fontSize="10px"
              fill="white"
              fontWeight="600" // UNIFORM BOLDNESS
              fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
              style={{ 
                fontWeight: "600 !important",
                WebkitFontSmoothing: "antialiased",
                fontSynthesis: "none"
              }}
            >
              {nodeDatum.attributes.connections}
            </text>
          </g>
        )}

        {isContact && nodeDatum.attributes?.totalEvents > 0 && (
          <g>
            <circle
              cx="-35"
              cy="-28"
              r="10"
              fill="#ec4899"
              stroke="#ffffff"
              strokeWidth="2"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            />
            <text
              x="-35"
              y="-23"
              textAnchor="middle"
              fontSize="9px"
              fill="white"
              fontWeight="600" // UNIFORM BOLDNESS
              fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
              style={{ 
                fontWeight: "600 !important",
                WebkitFontSmoothing: "antialiased",
                fontSynthesis: "none"
              }}
            >
              {nodeDatum.attributes.totalEvents}
            </text>
          </g>
        )}
      </g>
    );
  };

  if (!treeData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tree data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Inject inline styles to override any library defaults */}
      <style>{treeStyles}</style>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Interactive Network Tree
          </h3>
          <p className="text-gray-600 mt-1">
            Visual representation of your referral network hierarchy
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">
          How Network Tree Works:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <strong>Users (Blue Circles):</strong> People who have
            accounts in your system
          </li>
          <li>
            • <strong>Contacts (Green Rectangles):</strong> People
            added through events
          </li>
          <li>
            • <strong>Hierarchy:</strong> Shows who referred whom and
            who added which contacts
          </li>
          <li>
            • <strong>Orange Badge:</strong> Number of direct
            connections for each user
          </li>
          <li>
            • <strong>Pink Badge:</strong> Number of events attended
            by contacts
          </li>
          <li>
            • <strong>Click nodes:</strong> Expand/collapse branches
            and view details
          </li>
          <li>
            • <strong>Zoom Controls:</strong> Use buttons or mouse wheel to zoom in/out
          </li>
        </ul>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center">
            <div
              className="w-6 h-6 bg-purple-500 rounded mr-2"
              style={{
                clipPath:
                  "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
              }}
            ></div>
            <span className="font-medium text-gray-700">
              Network Root
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full mr-2"></div>
            <span className="font-medium text-gray-700">
              Users ({networkData?.totalUsers || 0})
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-4 bg-green-500 rounded mr-2"></div>
            <span className="font-medium text-gray-700">
              Contacts ({networkData?.totalContacts || 0})
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span className="font-medium text-gray-700">
              Connection Count
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tree Visualization with Zoom Controls */}
        <div className="lg:col-span-3 relative">
          {/* Zoom Control Panel */}
          <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg border p-2 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="text-xs text-gray-600 text-center px-2 py-1 bg-gray-100 rounded">
              {Math.round(zoom * 100)}%
            </div>
          </div>

          <div
            id="treeWrapper"
            ref={treeContainer}
            className="bg-white border border-gray-300 rounded-lg overflow-hidden"
            style={{ width: "100%", height: "700px" }}
          >
            {treeData ? (
              <Tree
                ref={treeRef}
                data={treeData}
                translate={translate}
                orientation="vertical"
                pathFunc="step"
                separation={{ siblings: 2.2, nonSiblings: 2.8 }}
                nodeSize={{ x: 280, y: 160 }}
                renderCustomNodeElement={renderTreeNode}
                zoom={zoom}
                scaleExtent={{ min: 0.1, max: 10 }}
                enableLegacyTransitions={true}
                shouldCollapseNeighborNodes={false}
                collapsible={true}
                depthFactor={160}
                styles={{
                  links: {
                    stroke: '#94a3b8',
                    strokeWidth: 2,
                    strokeOpacity: 0.6,
                  },
                  nodes: {
                    node: {
                      name: {
                        fontWeight: '600 !important', // UNIFORM BOLDNESS
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif !important',
                        fontSynthesis: 'none !important'
                      },
                      attributes: {
                        fontWeight: '500 !important', // UNIFORM BOLDNESS
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif !important',
                        fontSynthesis: 'none !important'
                      }
                    }
                  }
                }}
                onLinkClick={(linkSource, linkTarget) => {
                  console.log('Link clicked:', linkSource, linkTarget);
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-xl font-medium text-gray-600 mb-4">
                    No tree data available
                  </p>
                  <button className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600">
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
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Node Details
            </h4>
            {selectedNode ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${
                      selectedNode.attributes?.type === "user"
                        ? "bg-blue-500"
                        : selectedNode.attributes?.type === "contact"
                        ? "bg-green-500"
                        : "bg-purple-500"
                    }`}
                  >
                    <span className="text-white text-lg">
                      {selectedNode.attributes?.type === "user"
                        ? "👤"
                        : selectedNode.attributes?.type === "contact"
                        ? "📋"
                        : "🌐"}
                    </span>
                  </div>
                  <h5 className="font-semibold text-gray-800">
                    {selectedNode.name}
                  </h5>
                </div>

                <div className="space-y-3 text-sm">
                  {selectedNode.attributes?.email && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Email:
                      </span>
                      <p className="text-gray-600 text-xs break-all">
                        {selectedNode.attributes.email}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {selectedNode.attributes?.connections || 0}
                      </div>
                      <div className="text-xs text-gray-600">
                        Connections
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {selectedNode.children?.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">
                        Children
                      </div>
                    </div>
                  </div>

                  {selectedNode.attributes?.type === "user" &&
                    selectedNode.attributes?.referredBy && (
                      <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                        <span className="font-medium text-blue-700 block mb-1">
                          Referred By:
                        </span>
                        <p className="text-blue-600 text-xs break-all">
                          {selectedNode.attributes.referredBy}
                        </p>
                      </div>
                    )}

                  {selectedNode.attributes?.type === "contact" &&
                    selectedNode.attributes?.addedBy && (
                      <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                        <span className="font-medium text-green-700 block mb-1">
                          Added By:
                        </span>
                        <p className="text-green-600 text-xs">
                          {selectedNode.attributes.addedBy}
                        </p>
                      </div>
                    )}

                  {selectedNode.attributes?.totalEvents > 0 && (
                    <div className="bg-pink-50 p-3 rounded border-l-4 border-pink-400">
                      <span className="font-medium text-pink-700 block mb-1">
                        Events:
                      </span>
                      <p className="text-pink-600 text-xs">
                        {selectedNode.attributes.totalEvents} events
                        attended
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                      clipRule="evenodd"
                    />
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
  );
};

export default NetworkTreeVisualization;
