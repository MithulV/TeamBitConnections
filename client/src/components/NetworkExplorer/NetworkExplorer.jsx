import React, { useState } from 'react';

const NetworkExplorer = ({ networkData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Network Explorer
        </h3>
        <p className="text-gray-600 mt-1">
          Search and filter through all network nodes
        </p>
      </div>

      {/* How it works */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
        <h4 className="font-semibold text-indigo-900 mb-2">
          How Network Explorer Works:
        </h4>
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
                ?.filter((node) => {
                  const matchesSearch =
                    !searchTerm ||
                    node.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    node.email?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesFilter = filterType === "all" || node.type === filterType;
                  return matchesSearch && matchesFilter;
                })
                ?.slice(0, 20)
                ?.map((node, index) => (
                  <div
                    key={node.id}
                    onClick={() =>
                      setSelectedNode({
                        name: node.name || node.email,
                        attributes: node,
                        children: [],
                      })
                    }
                    className={`flex items-center p-3 rounded border cursor-pointer hover:bg-gray-50 ${
                      node.type === "user" ? "border-blue-200" : "border-green-200"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded flex items-center justify-center mr-3 ${
                        node.type === "user" ? "bg-blue-500" : "bg-green-500"
                      }`}
                    >
                      <span className="text-white text-sm">
                        {node.type === "user" ? "👤" : "📋"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-800">
                        {node.name || "Unknown"}
                      </h5>
                      <p className="text-sm text-gray-600">{node.email}</p>
                      <p className="text-xs text-gray-500">
                        {node.connections || 0} connections
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        node.type === "user"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {node.type}
                    </div>
                  </div>
                ))}
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
                <span className="font-semibold text-blue-600">
                  {networkData.networkData?.totalNodes}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Edges:</span>
                <span className="font-semibold text-green-600">
                  {networkData.networkData?.totalEdges}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User Nodes:</span>
                <span className="font-semibold text-purple-600">
                  {networkData.totalUsers}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contact Nodes:</span>
                <span className="font-semibold text-orange-600">
                  {networkData.totalContacts}
                </span>
              </div>
            </div>
          </div>

          {selectedNode && (
            <div className="bg-white rounded-lg shadow border p-4">
              <h4 className="text-lg font-semibold mb-4">Selected Node</h4>
              <div className="text-center mb-3">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-2 ${
                    selectedNode.attributes?.type === "user"
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }`}
                >
                  <span className="text-white text-lg">
                    {selectedNode.attributes?.type === "user" ? "👤" : "📋"}
                  </span>
                </div>
                <h5 className="font-semibold text-gray-800">
                  {selectedNode.name}
                </h5>
              </div>

              <div className="space-y-2 text-sm">
                {selectedNode.attributes?.email && (
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-gray-600 break-all ml-2">
                      {selectedNode.attributes.email}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <div className="font-semibold text-blue-600">
                      {selectedNode.attributes?.connections || 0}
                    </div>
                    <div className="text-xs text-gray-600">Connections</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded text-center">
                    <div className="font-semibold text-green-600">
                      {selectedNode.attributes?.level || 0}
                    </div>
                    <div className="text-xs text-gray-600">Level</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkExplorer;
