import React, { useState, useEffect, useRef, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const NetworkTreeVisualization = ({ networkData, searchTerm, filterType }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [treeData, setTreeData] = useState(null);
  const [zoom, setZoom] = useState(0.9);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // New state for node dragging
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [nodeDragStart, setNodeDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState(new Map());
  
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Infinite canvas dimensions
  const CANVAS_SIZE = 20000; // Large canvas size for infinite feel
  const CANVAS_CENTER = CANVAS_SIZE / 2;

  // Default avatar generator based on name/email
  const generateDefaultAvatar = (name, email) => {
    const initials = name 
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : email ? email[0].toUpperCase() : '?';
    
    // Generate a consistent color based on the name/email
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
    ];
    const colorIndex = (name || email || '').length % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="${backgroundColor}"/>
        <text x="50" y="60" text-anchor="middle" fill="white" font-size="32" font-family="Arial, sans-serif" font-weight="bold">
          ${initials}
        </text>
      </svg>
    `)}`;
  };

  // Enhanced avatar URL function with better profile picture handling
  const getAvatarUrl = (node) => {
    console.log('Getting avatar for node:', node.name, 'Profile picture:', node.profile_picture || node.nodeData?.profile_picture);
    
    // For users, try profile_picture from multiple possible sources
    if (node.type === 'user') {
      // Try direct property first
      let profilePicture = node.profile_picture;
      
      // Then try from nodeData
      if (!profilePicture && node.nodeData) {
        profilePicture = node.nodeData.profile_picture;
      }
      
      // If we have a profile picture URL, validate and use it
      if (profilePicture && typeof profilePicture === 'string' && profilePicture.trim() !== '') {
        // Clean up the URL - remove any surrounding brackets or extra characters
        const cleanUrl = profilePicture.trim().replace(/^\[|\]$/g, '');
        
        // Validate that it looks like a URL
        if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
          console.log('Using profile picture:', cleanUrl);
          return cleanUrl;
        }
      }
    }
    
    // For contacts or if no profile picture, generate default avatar
    console.log('Using default avatar for:', node.name);
    return generateDefaultAvatar(node.name, node.email);
  };

  // Color palette
  const getNodeColor = (node, index) => {
    const colors = [
      "#cdb4db", "#ffafcc", "#f8ad9d", "#c9cba3", "#00afb9",
      "#84a59d", "#0081a7", "#ffc9b9", "#d0f4de", "#fcf6bd"
    ];
    return colors[index % colors.length];
  };

  // More reliable text measurement using Canvas API
  const measureTextWidth = (text, fontSize = 14, fontFamily = "Arial, sans-serif", fontWeight = "bold") => {
    if (!text) return 0;
    
    // Create canvas for text measurement if not exists
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set font properties
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    
    // Measure text width
    const metrics = ctx.measureText(text);
    const width = metrics.width;
    
    return width;
  };

  // Calculate node dimensions to fit full text with proper padding
  const getNodeDimensions = (node) => {
    const minWidth = 200; // Minimum width
    const avatarSpace = 85; // Space from left edge to start of text
    const rightPadding = 30; // Right padding for safety
    
    // Measure both name and title using canvas
    const nameWidth = measureTextWidth(node.name || "Unknown", 14, "Arial, sans-serif", "bold");
    const titleWidth = measureTextWidth(node.title || "user", 11, "Arial, sans-serif", "normal");
    
    // Use the larger of the two text widths
    const maxTextWidth = Math.max(nameWidth, titleWidth);
    const requiredWidth = avatarSpace + maxTextWidth + rightPadding;
    
    // Final width calculation
    const finalWidth = Math.max(requiredWidth, minWidth);
    
    return {
      width: finalWidth,
      height: 100
    };
  };

  const NODE_HEIGHT = 100;

  // Convert data to tree format with unique IDs
  const convertToTreeFormat = (data) => {
    if (!data?.networkData?.nodes?.length) return null;
    
    const nodes = data.networkData.nodes;
    const edges = data.networkData.edges || [];
    const childrenMap = new Map();
    const hasParent = new Set();
    const nodeMap = new Map();

    nodes.forEach(node => nodeMap.set(node.id, node));
    
    edges.forEach(edge => {
      if (!childrenMap.has(edge.from)) {
        childrenMap.set(edge.from, []);
      }
      childrenMap.get(edge.from).push(edge.to);
      hasParent.add(edge.to);
    });

    const rootNodes = nodes.filter(node => !hasParent.has(node.id) && node.type === "user");

    // Counter for generating unique node IDs
    let nodeCounter = 0;

    const buildNode = (nodeId, level = 0, index = 0) => {
      const node = nodeMap.get(nodeId);
      if (!node) return null;

      const children = childrenMap.get(nodeId) || [];
      const childNodes = children.map((childId, childIndex) => 
        buildNode(childId, level + 1, childIndex)
      ).filter(Boolean);

      // Generate unique ID for React keys
      const uniqueId = `node-${nodeCounter++}-${nodeId}`;

      const nodeData = {
        id: uniqueId, // Use unique ID for React keys
        originalId: node.id.toString(), // Keep original ID for reference
        name: node.name || node.email?.split('@')[0] || "Unknown",
        fullName: node.name || node.email || "Unknown",
        email: node.email,
        title: node.title || node.type || "user",
        imageURL: getAvatarUrl(node), // Use enhanced avatar logic
        nodeData: { ...node }, // Store all original data
        children: childNodes,
        x: 0,
        y: 0,
        level,
        index,
        color: getNodeColor(node, level === 0 ? 0 : index + 1)
      };

      // Calculate dimensions to fit full text
      const dimensions = getNodeDimensions(nodeData);
      nodeData.width = dimensions.width;
      nodeData.height = dimensions.height;

      return nodeData;
    };

    if (rootNodes.length === 1) {
      return buildNode(rootNodes[0].id, 0, 0);
    } else {
      const rootNode = {
        id: `node-${nodeCounter++}-network-root`,
        originalId: "network-root",
        name: "Network Root",
        fullName: "Network Root", 
        email: "root",
        title: "root",
        imageURL: generateDefaultAvatar("Network Root", "root"),
        nodeData: { type: "root" },
        children: rootNodes.map((node, index) => buildNode(node.id, 1, index)).filter(Boolean),
        x: 0,
        y: 0,
        level: 0,
        index: 0,
        color: "#cdb4db"
      };

      const dimensions = getNodeDimensions(rootNode);
      rootNode.width = dimensions.width;
      rootNode.height = dimensions.height;

      return rootNode;
    }
  };

  // Enhanced positioning algorithm - center the tree in the infinite canvas
  const calculatePositions = (node, x = CANVAS_CENTER, y = CANVAS_CENTER + 100, siblingIndex = 0, siblingCount = 1) => {
    if (!node) return;

    const levelHeight = 180;
    const nodeGap = 50;

    if (siblingCount === 1) {
      node.x = x;
    } else {
      let siblings = [];
      if (node.parent && node.parent.children) {
        siblings = node.parent.children;
      } else {
        siblings = new Array(siblingCount).fill({ width: 200 });
      }

      const totalNodeWidths = siblings.reduce((sum, sibling) => sum + sibling.width, 0);
      const totalGaps = (siblingCount - 1) * nodeGap;
      const totalWidth = totalNodeWidths + totalGaps;
      const startX = x - totalWidth / 2;

      let currentX = startX;
      for (let i = 0; i < siblingIndex; i++) {
        currentX += siblings[i].width;
        if (i < siblingIndex) {
          currentX += nodeGap;
        }
      }
      currentX += siblings[siblingIndex].width / 2;
      node.x = currentX;
    }
    
    node.y = y;

    if (node.children && node.children.length > 0) {
      const childY = y + levelHeight;
      node.children.forEach((child, index) => {
        child.parent = node;
        calculatePositions(child, node.x, childY, index, node.children.length);
      });
    }
  };

  const getAllNodeIds = (node, ids = []) => {
    if (!node) return ids;
    ids.push(node.id);
    if (node.children) {
      node.children.forEach(child => getAllNodeIds(child, ids));
    }
    return ids;
  };

  // Function to get node position (either custom or original)
  const getNodePosition = (node) => {
    const customPos = nodePositions.get(node.id);
    if (customPos) {
      return { x: customPos.x, y: customPos.y };
    }
    return { x: node.x, y: node.y };
  };

  // Function to update node position
  const updateNodePosition = (nodeId, x, y) => {
    setNodePositions(prev => {
      const newPositions = new Map(prev);
      newPositions.set(nodeId, { x, y });
      return newPositions;
    });
  };

  // Node drag handlers
  const handleNodeMouseDown = (e, node) => {
    if (e.shiftKey || e.ctrlKey) {
      // Only allow dragging when Shift or Ctrl is held
      e.stopPropagation();
      e.preventDefault();
      
      setIsDraggingNode(true);
      setDraggedNode(node);
      
      const rect = containerRef.current.getBoundingClientRect();
      const svgPoint = {
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom
      };
      
      const nodePos = getNodePosition(node);
      setNodeDragStart({
        x: svgPoint.x - nodePos.x,
        y: svgPoint.y - nodePos.y
      });
      
      console.log('Started dragging node:', node.name);
    } else {
      // Normal click behavior
      selectNode(node, e);
    }
  };

  const handleNodeMouseMove = (e) => {
    if (isDraggingNode && draggedNode) {
      e.preventDefault();
      
      const rect = containerRef.current.getBoundingClientRect();
      const svgPoint = {
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom
      };
      
      const newX = svgPoint.x - nodeDragStart.x;
      const newY = svgPoint.y - nodeDragStart.y;
      
      updateNodePosition(draggedNode.id, newX, newY);
    }
  };

  const handleNodeMouseUp = () => {
    if (isDraggingNode) {
      console.log('Finished dragging node:', draggedNode?.name);
      setIsDraggingNode(false);
      setDraggedNode(null);
      setNodeDragStart({ x: 0, y: 0 });
    }
  };

  // FIXED: Enhanced touch handlers that properly handle both tap and drag on mobile
  const handleNodeTouchStart = (e, node) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      
      e.stopPropagation();
      
      // Store initial touch position to detect movement
      const initialTouch = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      
      // Store on the element for later reference
      e.currentTarget.initialTouch = initialTouch;
      e.currentTarget.nodeRef = node;
      
      // Set up for potential dragging
      setIsDraggingNode(true);
      setDraggedNode(node);
      
      const rect = containerRef.current.getBoundingClientRect();
      const svgPoint = {
        x: (touch.clientX - rect.left - pan.x) / zoom,
        y: (touch.clientY - rect.top - pan.y) / zoom
      };
      
      const nodePos = getNodePosition(node);
      setNodeDragStart({
        x: svgPoint.x - nodePos.x,
        y: svgPoint.y - nodePos.y
      });
    }
  };

  const handleNodeTouchMove = (e) => {
    if (isDraggingNode && draggedNode && e.touches.length === 1) {
      const touch = e.touches[0];
      const initialTouch = e.currentTarget.initialTouch;
      
      // Calculate movement distance
      const moveDistance = Math.sqrt(
        Math.pow(touch.clientX - initialTouch.x, 2) + 
        Math.pow(touch.clientY - initialTouch.y, 2)
      );
      
      // Only start preventing default and dragging if moved more than 10px
      if (moveDistance > 10) {
        e.preventDefault();
        
        const rect = containerRef.current.getBoundingClientRect();
        const svgPoint = {
          x: (touch.clientX - rect.left - pan.x) / zoom,
          y: (touch.clientY - rect.top - pan.y) / zoom
        };
        
        const newX = svgPoint.x - nodeDragStart.x;
        const newY = svgPoint.y - nodeDragStart.y;
        
        updateNodePosition(draggedNode.id, newX, newY);
        
        // Mark that we actually dragged
        e.currentTarget.didDrag = true;
      }
    }
  };

  const handleNodeTouchEnd = (e) => {
    if (isDraggingNode) {
      const didDrag = e.currentTarget.didDrag;
      const node = e.currentTarget.nodeRef;
      const initialTouch = e.currentTarget.initialTouch;
      
      // Clean up drag state
      setIsDraggingNode(false);
      setDraggedNode(null);
      setNodeDragStart({ x: 0, y: 0 });
      
      // Clean up element references
      delete e.currentTarget.didDrag;
      delete e.currentTarget.nodeRef;
      delete e.currentTarget.initialTouch;
      
      // If no dragging occurred and it was a quick tap, select the node
      if (!didDrag && node && initialTouch) {
        const timeDiff = Date.now() - initialTouch.time;
        if (timeDiff < 300) { // Quick tap (less than 300ms)
          console.log('Mobile tap detected, selecting node:', node.name);
          selectNode(node, e);
        }
      }
    }
  };

  // Function to format field names for display
  const formatFieldName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  };

  // Enhanced function to render all available node data
  const renderNodeDetails = (node) => {
    if (!node || !node.nodeData) return null;

    const excludeFields = [
      'id', 'imageURL', 'children', 'x', 'y', 'level', 'index', 'color', 'width', 'height',
      'connections', 'contacts', 'contactsAdded', 'contacts_added', 'network_connections'
    ];
    
    const allFields = Object.entries(node.nodeData)
      .filter(([key, value]) => {
        return !excludeFields.includes(key.toLowerCase()) && 
               !key.toLowerCase().includes('connection') &&
               !key.toLowerCase().includes('contact') &&
               value !== null && 
               value !== undefined && 
               value !== '' &&
               value !== 'Unknown' &&
               !(Array.isArray(value) && value.length > 0 && typeof value[0] === 'object');
      })
      .sort(([a], [b]) => a.localeCompare(b));

    const priorityFields = [
      'first_name', 'last_name', 'name', 'email', 'phone', 'title', 
      'role', 'company', 'department', 'location', 'is_online'
    ];
    const priority = [];
    const others = [];

    allFields.forEach(([key, value]) => {
      if (priorityFields.includes(key.toLowerCase())) {
        priority.push([key, value]);
      } else {
        others.push([key, value]);
      }
    });

    const sortedFields = [...priority, ...others];

    return sortedFields.map(([key, value], index) => {
      let displayValue = value;
      
      if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
      } else if (key.toLowerCase() === 'is_online') {
        displayValue = value ? '🟢 Online' : '🔴 Offline';
      } else if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object') {
          return null;
        }
        displayValue = value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        return null;
      }

      const uniqueKey = `detail-${node.id}-${key}-${index}`;

      return (
        <div key={uniqueKey} className="detail-row">
          <div className="detail-label">
            <strong>{formatFieldName(key)}:</strong>
          </div>
          <div className="detail-value">
            {displayValue}
          </div>
        </div>
      );
    }).filter(Boolean);
  };

  // Enhanced avatar image handler with better error handling
  const handleAvatarError = (e, node) => {
    console.log('Avatar failed to load for:', node.name, 'Original URL:', e.target.src);
    const fallbackUrl = generateDefaultAvatar(node.name, node.email);
    e.target.src = fallbackUrl;
  };

  // FIXED: Main effect for tree generation (only when data changes) - NO ZOOM DEPENDENCY
  useEffect(() => {
    if (networkData) {
      const tree = convertToTreeFormat(networkData);
      if (tree) {
        const allNodeIds = getAllNodeIds(tree);
        setExpandedNodes(new Set(allNodeIds));
        
        calculatePositions(tree, CANVAS_CENTER, CANVAS_CENTER + 100);
        setTreeData(tree);
      }
    }
  }, [networkData]); // 👈 REMOVED zoom dependency to prevent re-renders

  // FIXED: Separate effect for initial view centering (only when tree is first created)
  useEffect(() => {
    if (treeData && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setPan({ 
        x: containerRect.width / 2 - CANVAS_CENTER * zoom,
        y: containerRect.height / 2 - CANVAS_CENTER * zoom
      });
    }
  }, [treeData]); // 👈 Only when tree data changes, not zoom

  // Event handlers for canvas panning
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.1));
  
  const handleResetView = () => {
    setZoom(0.9);
    // Reset node positions
    setNodePositions(new Map());
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setPan({ 
        x: containerRect.width / 2 - CANVAS_CENTER * 0.9,
        y: containerRect.height / 2 - CANVAS_CENTER * 0.9
      });
    }
  };

  const handleMouseDown = (e) => {
    if (!isDraggingNode && (e.target === e.currentTarget || e.target.tagName === "svg" || e.target.classList.contains("tree-content"))) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingNode) {
      handleNodeMouseMove(e);
    } else if (isDragging) {
      e.preventDefault();
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    if (isDraggingNode) {
      handleNodeMouseUp();
    } else {
      setIsDragging(false);
    }
  };

  const handleTouchStart = useCallback((e) => {
    if (!isDraggingNode && e.touches.length === 1) {
      const touch = e.touches[0];
      const target = e.target;
      const isClickableElement = target.classList.contains('node-bg') || 
                                target.classList.contains('avatar-image') || 
                                target.classList.contains('expand-btn') ||
                                target.tagName === 'text';
      
      if (!isClickableElement) {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      }
    }
  }, [pan, isDraggingNode]);

  const handleTouchMove = useCallback((e) => {
    if (isDraggingNode) {
      handleNodeTouchMove(e);
    } else if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      e.preventDefault();
      setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    }
  }, [isDragging, dragStart, isDraggingNode]);

  const handleTouchEnd = useCallback((e) => {
    if (isDraggingNode) {
      handleNodeTouchEnd(e);
    } else {
      setIsDragging(false);
    }
  }, [isDraggingNode]);

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const pointX = (mouseX - pan.x) / zoom;
      const pointY = (mouseY - pan.y) / zoom;
      
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.1, Math.min(3.0, zoom + delta));
      
      setZoom(newZoom);
      setPan({
        x: mouseX - pointX * newZoom,
        y: mouseY - pointY * newZoom
      });
    }
  }, [zoom, pan]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      container.addEventListener("touchstart", handleTouchStart, { passive: false });
      container.addEventListener("touchmove", handleTouchMove, { passive: false });
      container.addEventListener("touchend", handleTouchEnd, { passive: false });
      
      return () => {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const selectNode = (node, e) => {
    if (e) {
      e.stopPropagation();
    }
    console.log('Node selected:', node.name); // Debug log
    setSelectedNode(node);
  };

  const getVisibleNodes = (node, nodes = [], connections = []) => {
    if (!node) return { nodes, connections };
    
    nodes.push(node);
    
    if (node.children && expandedNodes.has(node.id)) {
      node.children.forEach(child => {
        connections.push({ parent: node, child: child });
        getVisibleNodes(child, nodes, connections);
      });
    }
    
    return { nodes, connections };
  };

  const { nodes: visibleNodes, connections } = treeData ? getVisibleNodes(treeData) : { nodes: [], connections: [] };

  const generateSmoothPath = (parent, child) => {
    const parentPos = getNodePosition(parent);
    const childPos = getNodePosition(child);
    
    const startX = parentPos.x;
    const startY = parentPos.y + NODE_HEIGHT / 2;
    const endX = childPos.x;
    const endY = childPos.y - NODE_HEIGHT / 2;
    
    const midY = startY + (endY - startY) / 2;
    const cornerRadius = 20;

    if (Math.abs(endX - startX) < 10) {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    } else {
      const direction = endX > startX ? 1 : -1;
      
      return `M ${startX} ${startY} 
              L ${startX} ${midY - cornerRadius}
              Q ${startX} ${midY} ${startX + (cornerRadius * direction)} ${midY}
              L ${endX - (cornerRadius * direction)} ${midY}
              Q ${endX} ${midY} ${endX} ${midY + cornerRadius}
              L ${endX} ${endY}`;
    }
  };

  if (!treeData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading network tree...</p>
      </div>
    );
  }

  return (
    <div className="org-chart-container">
      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="zoom-controls">
          <button onClick={handleZoomOut} className="control-btn">
            <ZoomOut size={16} />
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="control-btn">
            <ZoomIn size={16} />
          </button>
        </div>
        <button onClick={handleResetView} className="control-btn" title="Reset view and positions">
          <RotateCcw size={16} />
        </button>
        <div className="drag-hint">
          Hold Shift + Drag to move nodes | Drag anywhere to pan
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        <div 
          className={`tree-viewport ${isDragging ? 'dragging' : 'ready'} ${isDraggingNode ? 'dragging-node' : ''}`}
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="tree-content"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: `${CANVAS_SIZE}px`,
              height: `${CANVAS_SIZE}px`
            }}
          >
            {/* Infinite grid background pattern */}
            <div 
              className="grid-background"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `
                  radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0),
                  linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '100px 100px, 100px 100px, 100px 100px',
                pointerEvents: 'none'
              }}
            />
            
            <svg 
              ref={svgRef}
              className="tree-svg"
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
            >
              {/* Connection Lines */}
              <g className="connections">
                {connections.map((conn, index) => (
                  <path
                    key={`connection-${conn.parent.id}-${conn.child.id}-${index}`}
                    d={generateSmoothPath(conn.parent, conn.child)}
                    stroke="#999"
                    strokeWidth="1.5"
                    fill="none"
                    className="connection-line"
                  />
                ))}
              </g>

              {/* Nodes with enhanced mobile touch handling */}
              <g className="nodes">
                {visibleNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const hasChildren = node.children && node.children.length > 0;
                  const isExpanded = expandedNodes.has(node.id);
                  const nodeWidth = node.width || 200;
                  const textStartX = -nodeWidth / 2 + 85;
                  const isBeingDragged = draggedNode?.id === node.id;
                  
                  // Get node position (custom or original)
                  const nodePos = getNodePosition(node);
                  
                  // Online status indicator
                  const isOnline = node.nodeData?.is_online;

                  return (
                    <g 
                      key={node.id} 
                      transform={`translate(${nodePos.x}, ${nodePos.y})`}
                      className={`node-group ${isBeingDragged ? 'being-dragged' : ''}`}
                    >
                      {/* Node Background */}
                      <rect
                        x={-nodeWidth / 2}
                        y={-NODE_HEIGHT / 2}
                        width={nodeWidth}
                        height={NODE_HEIGHT}
                        rx={8}
                        fill={node.color}
                        stroke="#333"
                        strokeWidth={isSelected ? "3" : "1"}
                        className={`node-bg ${isBeingDragged ? 'dragging' : ''}`}
                        style={{ cursor: isBeingDragged ? 'grabbing' : 'grab' }}
                        onMouseDown={(e) => handleNodeMouseDown(e, node)}
                        onTouchStart={(e) => handleNodeTouchStart(e, node)}
                        onTouchMove={handleNodeTouchMove}
                        onTouchEnd={handleNodeTouchEnd}
                      />

                      {/* Avatar Background */}
                      <circle
                        cx={-nodeWidth / 2 + 40}
                        cy={-5}
                        r={25}
                        fill="white"
                        stroke="#333"
                        strokeWidth={1}
                        className="avatar-bg"
                      />
                      
                      {/* Clip path for the avatar */}
                      <clipPath id={`clip-${node.id}`}>
                        <circle cx={-nodeWidth / 2 + 40} cy={-5} r={23} />
                      </clipPath>
                      
                      {/* Avatar Image using foreignObject for better external URL support */}
                      <foreignObject
                        x={-nodeWidth / 2 + 17}
                        y={-28}
                        width={46}
                        height={46}
                        clipPath={`url(#clip-${node.id})`}
                      >
                        <img
                          src={node.imageURL}
                          alt={node.name}
                          className="avatar-image"
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            cursor: isBeingDragged ? 'grabbing' : 'grab',
                            display: 'block',
                            border: 'none',
                            outline: 'none'
                          }}
                          onMouseDown={(e) => handleNodeMouseDown(e, node)}
                          onTouchStart={(e) => handleNodeTouchStart(e, node)}
                          onTouchMove={handleNodeTouchMove}
                          onTouchEnd={handleNodeTouchEnd}
                          onError={(e) => handleAvatarError(e, node)}
                          onLoad={() => console.log('Avatar loaded successfully for:', node.name)}
                        />
                      </foreignObject>

                      {/* Online Status Indicator */}
                      {isOnline !== undefined && (
                        <circle
                          cx={-nodeWidth / 2 + 55}
                          cy={-20}
                          r={4}
                          fill={isOnline ? "#4CAF50" : "#FF0000"}
                          stroke="white"
                          strokeWidth={2}
                          className="online-status"
                        />
                      )}

                      {/* Name Text */}
                      <text
                        x={textStartX}
                        y={-5}
                        textAnchor="start"
                        alignmentBaseline="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fontFamily="Arial, sans-serif"
                        fill="#fff"
                        className="node-name"
                        style={{ cursor: isBeingDragged ? 'grabbing' : 'grab' }}
                        onMouseDown={(e) => handleNodeMouseDown(e, node)}
                        onTouchStart={(e) => handleNodeTouchStart(e, node)}
                        onTouchMove={handleNodeTouchMove}
                        onTouchEnd={handleNodeTouchEnd}
                      >
                        {node.name}
                      </text>

                      {/* Title Text */}
                      <text
                        x={textStartX}
                        y={15}
                        textAnchor="start"
                        alignmentBaseline="middle"
                        fontSize="11"
                        fontFamily="Arial, sans-serif"
                        fill="#fff"
                        opacity="0.9"
                        className="node-title"
                        style={{ cursor: isBeingDragged ? 'grabbing' : 'grab' }}
                        onMouseDown={(e) => handleNodeMouseDown(e, node)}
                        onTouchStart={(e) => handleNodeTouchStart(e, node)}
                        onTouchMove={handleNodeTouchMove}
                        onTouchEnd={handleNodeTouchEnd}
                      >
                        {node.title}
                      </text>

                      {/* Expand/Collapse Button */}
                      {hasChildren && (
                        <g>
                          <circle
                            cx={0}
                            cy={65}
                            r={10}
                            fill="white"
                            stroke="#333"
                            strokeWidth={1}
                            className="expand-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNode(node.id);
                            }}
                            onTouchEnd={(e) => {
                              if (!isDraggingNode) {
                                e.stopPropagation();
                                toggleNode(node.id);
                              }
                            }}
                          />
                          <text
                            x={0}
                            y={70}
                            textAnchor="middle"
                            fontSize={12}
                            fontWeight="bold"
                            fill="#333"
                            style={{ userSelect: 'none', pointerEvents: 'none' }}
                          >
                            {isExpanded ? '−' : '+'}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Enhanced Details Panel */}
        <div className="details-panel">
          <div className="panel-content">
            <h3 className="panel-title">Node Details</h3>
            {selectedNode ? (
              <div className="selected-info">
                <div className="selected-header">
                  <div 
                    className="selected-avatar"
                    style={{ background: selectedNode.color }}
                  >
                    <img 
                      src={selectedNode.imageURL} 
                      alt={selectedNode.name}
                      className="selected-avatar-img"
                      onError={(e) => {
                        console.log('Details panel avatar failed, using fallback');
                        e.target.src = generateDefaultAvatar(selectedNode.name, selectedNode.email);
                      }}
                      onLoad={() => console.log('Details panel avatar loaded successfully')}
                    />
                    {/* Online status for details panel */}
                    {selectedNode.nodeData?.is_online !== undefined && (
                      <div className={`online-indicator ${selectedNode.nodeData.is_online ? 'online' : 'offline'}`}>
                        {selectedNode.nodeData.is_online ? '🟢' : '🔴'}
                      </div>
                    )}
                  </div>
                  <div className="selected-header-text">
                    <h4>{selectedNode.fullName}</h4>
                    <span>{selectedNode.title}</span>
                  </div>
                </div>
                
                <div className="selected-details">
                  <div className="details-section">
                    <h5 className="section-title">Information</h5>
                    {renderNodeDetails(selectedNode)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <div className="empty-icon">👤</div>
                <p>Click a node to view detailed information</p>
                <small>Hold Shift + Drag to move nodes | Drag to pan around the infinite canvas</small>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .org-chart-container {
          font-family: Arial, sans-serif;
          background: #f6f6f6;
          border-radius: 0;
          overflow: hidden;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: white;
          border-bottom: 1px solid #333;
          gap: 12px;
        }

        .zoom-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-btn {
          padding: 8px;
          background: white;
          border: 1px solid #333;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          touch-action: manipulation;
        }

        .control-btn:hover {
          background: #f0f0f0;
        }

        .zoom-level {
          font-size: 14px;
          font-weight: bold;
          color: #333;
          min-width: 60px;
          text-align: center;
          padding: 6px 12px;
          background: white;
          border: 1px solid #333;
          border-radius: 4px;
        }

        .drag-hint {
          font-size: 12px;
          color: #666;
          font-style: italic;
          padding: 4px 8px;
          background: #f0f0f0;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .main-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .tree-viewport {
          flex: 1;
          background: #f6f6f6;
          overflow: hidden;
          position: relative;
          touch-action: none;
          user-select: none;
        }

        .tree-viewport.ready {
          cursor: grab;
        }

        .tree-viewport.dragging {
          cursor: grabbing;
        }

        .tree-viewport.dragging-node {
          cursor: crosshair;
        }

        .tree-content {
          position: relative;
        }

        .grid-background {
          opacity: 0.6;
        }

        .tree-svg {
          display: block;
          pointer-events: all;
        }

        .node-group {
          transition: filter 0.2s ease;
        }

        .node-group.being-dragged {
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
          z-index: 1000;
        }

        .node-bg, .avatar-image, .expand-btn {
          cursor: grab;
          transition: all 0.2s ease;
        }

        .node-bg.dragging {
          cursor: grabbing;
          filter: brightness(1.1);
        }

        .node-bg:hover {
          stroke-width: 2;
          filter: brightness(1.05);
        }

        .avatar-bg {
          pointer-events: none;
        }

        .avatar-image:hover {
          filter: brightness(1.1);
        }

        .node-name, .node-title {
          pointer-events: all;
          user-select: none;
          cursor: grab;
        }

        .online-status {
          transition: all 0.2s ease;
        }

        .connection-line {
          transition: all 0.3s ease;
        }

        .connection-line:hover {
          stroke-width: 2.5;
          stroke: #666;
        }

        .expand-btn {
          cursor: pointer;
        }

        .expand-btn:hover {
          fill: #f0f0f0;
          transform: scale(1.1);
        }

        .details-panel {
          width: 350px;
          border-left: 1px solid #333;
          background: white;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .panel-content {
          padding: 20px;
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .panel-title {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin: 0 0 20px 0;
        }

        .selected-info {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #ddd;
        }

        .selected-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #ddd;
        }

        .selected-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid #333;
          flex-shrink: 0;
          position: relative;
        }

        .selected-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .online-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          font-size: 12px;
          background: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .selected-header-text {
          flex: 1;
          min-width: 0;
        }

        .selected-header h4 {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin: 0 0 4px 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          line-height: 1.3;
        }

        .selected-header span {
          font-size: 12px;
          color: #666;
          font-style: italic;
          word-wrap: break-word;
        }

        .details-section {
          margin-top: 8px;
        }

        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #333;
          margin: 0 0 12px 0;
          padding: 8px 0 4px 0;
          border-bottom: 1px solid #eee;
        }

        .detail-row {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
          font-size: 13px;
          gap: 4px;
          line-height: 1.4;
        }

        .detail-label {
          flex-shrink: 0;
        }

        .detail-label strong {
          color: #333;
          font-weight: 600;
        }

        .detail-value {
          color: #666;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          padding-left: 8px;
          line-height: 1.4;
        }

        .no-selection {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .no-selection small {
          display: block;
          margin-top: 8px;
          color: #999;
          font-size: 12px;
        }

        .empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: #666;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #333;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
        }

        @media (max-width: 1024px) {
          .main-layout {
            flex-direction: column;
          }
          .details-panel {
            width: 100%;
            height: 300px;
          }
          
          .drag-hint {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .controls-bar {
            padding: 8px 16px;
          }
          
          .control-btn {
            padding: 12px;
            min-height: 44px;
            min-width: 44px;
          }
          
          .zoom-level {
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default NetworkTreeVisualization;
