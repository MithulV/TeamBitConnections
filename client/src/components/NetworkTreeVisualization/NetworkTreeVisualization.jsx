import React, { useEffect, useCallback, useMemo } from 'react';
import { useTreeState } from './useTreeState.js';
import { TreeUtils } from './TreeUtils.js';
import ControlsBar from './ControlsBar.jsx';
import TreeCanvas from './TreeCanvas.jsx';
import DetailsPanel from './DetailsPanel.jsx';

const NetworkTreeVisualization = ({ networkData, searchTerm, filterType }) => {
  const {
    selectedNode, setSelectedNode,
    expandedNodes, setExpandedNodes,
    treeData, setTreeData,
    zoom, setZoom,
    pan, setPan,
    isDragging, setIsDragging,
    dragStart, setDragStart,
    isDraggingNode, setIsDraggingNode,
    draggedNode, setDraggedNode,
    nodeDragStart, setNodeDragStart,
    nodePositions, setNodePositions,
    primedImages, setPrimedImages,
    svgRef, containerRef, canvasRef,
    CANVAS_SIZE, CANVAS_CENTER
  } = useTreeState();

  const NODE_HEIGHT = 100;

  // **KEY FIX**: Hidden iframe technique to prime the browser cache
  const primeImageCache = useCallback((imageUrls) => {
    // Limit image priming for large datasets to prevent memory issues
    const limitedUrls = imageUrls.slice(0, 50); // Only prime first 50 images
    
    limitedUrls.forEach(url => {
      if (!url || primedImages.has(url)) return;

      // Method 1: Create hidden iframe to prime cache
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.src = `data:text/html,<html><body><img src="${url}" style="width:1px;height:1px;"></body></html>`;

      document.body.appendChild(iframe);

      // Remove iframe after cache priming
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 2000); // Reduced timeout for large datasets

      // Method 2: Also use invisible Image object as backup
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => setPrimedImages(prev => new Set(prev).add(url));
      img.onerror = () => setPrimedImages(prev => new Set(prev).add(url));
      img.src = url;
    });
  }, [primedImages, setPrimedImages]);

  // Convert data to tree format - OPTIMIZED for large datasets
  const convertToTreeFormat = useCallback((data) => {
    if (!data?.networkData?.nodes?.length) return null;

    console.log(`Converting ${data.networkData.nodes.length} nodes to tree format...`);
    const startTime = performance.now();

    const nodes = data.networkData.nodes;
    const edges = data.networkData.edges || [];
    const childrenMap = new Map();
    const hasParent = new Set();
    const nodeMap = new Map();

    // Efficient map building
    nodes.forEach(node => nodeMap.set(node.id, node));

    edges.forEach(edge => {
      if (!childrenMap.has(edge.from)) {
        childrenMap.set(edge.from, []);
      }
      childrenMap.get(edge.from).push(edge.to);
      hasParent.add(edge.to);
    });

    const rootNodes = nodes.filter(node => !hasParent.has(node.id) && node.type === "user");

    let nodeCounter = 0;

    const buildNode = (nodeId, level = 0, index = 0) => {
      const node = nodeMap.get(nodeId);
      if (!node) return null;

      const children = childrenMap.get(nodeId) || [];
      const childNodes = children.map((childId, childIndex) => 
        buildNode(childId, level + 1, childIndex)
      ).filter(Boolean);

      const uniqueId = `node-${nodeCounter++}-${nodeId}`;

      const nodeData = {
        id: uniqueId,
        originalId: node.id.toString(),
        name: node.name || node.email?.split('@')[0] || "Unknown",
        fullName: node.name || node.email || "Unknown",
        email: node.email,
        title: node.title || node.type || "user",
        imageURL: TreeUtils.getAvatarUrl(node),
        nodeData: { ...node },
        children: childNodes,
        x: 0,
        y: 0,
        level,
        index,
        color: TreeUtils.getNodeColor(node, level === 0 ? 0 : index + 1)
      };

      const dimensions = TreeUtils.getNodeDimensions(nodeData, canvasRef);
      nodeData.width = dimensions.width;
      nodeData.height = dimensions.height;

      return nodeData;
    };

    let result;
    if (rootNodes.length === 1) {
      result = buildNode(rootNodes[0].id, 0, 0);
    } else {
      const rootNode = {
        id: `node-${nodeCounter++}-network-root`,
        originalId: "network-root",
        name: "Network Root",
        fullName: "Network Root", 
        email: "root",
        title: "root",
        imageURL: TreeUtils.generateDefaultAvatar("Network Root", "root"),
        nodeData: { type: "root" },
        children: rootNodes.map((node, index) => buildNode(node.id, 1, index)).filter(Boolean),
        x: 0,
        y: 0,
        level: 0,
        index: 0,
        color: "#cdb4db"
      };

      const dimensions = TreeUtils.getNodeDimensions(rootNode, canvasRef);
      rootNode.width = dimensions.width;
      rootNode.height = dimensions.height;

      result = rootNode;
    }

    const endTime = performance.now();
    console.log(`Tree conversion completed in ${endTime - startTime}ms`);

    return result;
  }, [canvasRef]);

  // Enhanced positioning algorithm with collision detection and spacing
  const calculatePositions = useCallback((node, x = CANVAS_CENTER, y = CANVAS_CENTER + 100, siblingIndex = 0, siblingCount = 1) => {
    if (!node) return;

    const levelHeight = 180;
    const nodeGap = 50;
    const minVerticalSpacing = 120;

    if (!calculatePositions.positionedNodes) {
      calculatePositions.positionedNodes = [];
    }

    if (siblingCount === 1) {
      node.x = x;
    } else {
      let siblings;
      if (node.parent) {
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
        if (i < siblingIndex) currentX += nodeGap;
      }
      currentX += siblings[siblingIndex].width / 2;
      node.x = currentX;
    }

    let proposedY = y;

    const checkCollision = (testX, testY, testWidth, testHeight) => {
      return calculatePositions.positionedNodes.some(positioned => {
        const horizontalOverlap = testX < positioned.x + positioned.width && 
                                 testX + testWidth > positioned.x;
        const verticalOverlap = testY < positioned.y + positioned.height && 
                               testY + testHeight > positioned.y;
        return horizontalOverlap && verticalOverlap;
      });
    };

    const nodeWidth = node.width || 200;
    const nodeHeight = NODE_HEIGHT;

    while (checkCollision(node.x - nodeWidth/2, proposedY - nodeHeight/2, nodeWidth, nodeHeight)) {
      proposedY += minVerticalSpacing;
    }

    node.y = proposedY;

    calculatePositions.positionedNodes.push({
      x: node.x - nodeWidth/2,
      y: node.y - nodeHeight/2,
      width: nodeWidth,
      height: nodeHeight,
      node: node
    });

    if (node.children && node.children.length > 0) {
      const childY = node.y + levelHeight;
      node.children.forEach((child, index) => {
        child.parent = node;
        calculatePositions(child, node.x, childY, index, node.children.length);
      });
    }
  }, [CANVAS_CENTER, NODE_HEIGHT]);

  // Function to get node position (either custom or original) - MEMOIZED
  const getNodePosition = useCallback((node) => {
    const customPos = nodePositions.get(node.id);
    if (customPos) {
      return { x: customPos.x, y: customPos.y };
    }
    return { x: node.x, y: node.y };
  }, [nodePositions]);

  // Function to update node position
  const updateNodePosition = useCallback((nodeId, x, y) => {
    setNodePositions(prev => {
      const newPositions = new Map(prev);
      newPositions.set(nodeId, { x, y });
      return newPositions;
    });
  }, [setNodePositions]);

  // Node drag handlers
  const handleNodeMouseDown = useCallback((e, node) => {
    if (e.shiftKey || e.ctrlKey) {
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
      selectNode(node, e);
    }
  }, [pan, zoom, getNodePosition, setIsDraggingNode, setDraggedNode, setNodeDragStart]);

  const handleNodeMouseMove = useCallback((e) => {
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
  }, [isDraggingNode, draggedNode, pan, zoom, nodeDragStart, updateNodePosition]);

  const handleNodeMouseUp = useCallback(() => {
    if (isDraggingNode) {
      console.log('Finished dragging node:', draggedNode?.name);
      setIsDraggingNode(false);
      setDraggedNode(null);
      setNodeDragStart({ x: 0, y: 0 });
    }
  }, [isDraggingNode, draggedNode, setIsDraggingNode, setDraggedNode, setNodeDragStart]);

  // Touch handlers
  const handleNodeTouchStart = useCallback((e, node) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];

      e.stopPropagation();

      const initialTouch = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      e.currentTarget.initialTouch = initialTouch;
      e.currentTarget.nodeRef = node;

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
  }, [pan, zoom, getNodePosition, setIsDraggingNode, setDraggedNode, setNodeDragStart]);

  const handleNodeTouchMove = useCallback((e) => {
    if (isDraggingNode && draggedNode && e.touches.length === 1) {
      const touch = e.touches[0];
      const initialTouch = e.currentTarget.initialTouch;

      const moveDistance = Math.sqrt(
        Math.pow(touch.clientX - initialTouch.x, 2) + 
        Math.pow(touch.clientY - initialTouch.y, 2)
      );

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

        e.currentTarget.didDrag = true;
      }
    }
  }, [isDraggingNode, draggedNode, pan, zoom, nodeDragStart, updateNodePosition]);

  const handleNodeTouchEnd = useCallback((e) => {
    if (isDraggingNode) {
      const didDrag = e.currentTarget.didDrag;
      const node = e.currentTarget.nodeRef;
      const initialTouch = e.currentTarget.initialTouch;

      setIsDraggingNode(false);
      setDraggedNode(null);
      setNodeDragStart({ x: 0, y: 0 });

      delete e.currentTarget.didDrag;
      delete e.currentTarget.nodeRef;
      delete e.currentTarget.initialTouch;

      if (!didDrag && node && initialTouch) {
        const timeDiff = Date.now() - initialTouch.time;
        if (timeDiff < 300) {
          console.log('Mobile tap detected, selecting node:', node.name);
          selectNode(node, e);
        }
      }
    }
  }, [isDraggingNode, setIsDraggingNode, setDraggedNode, setNodeDragStart]);

  // OPTIMIZED: Throttled wheel handler for large datasets
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const container = containerRef.current;
    if (!container) return;

    // Throttle wheel events for performance
    const now = Date.now();
    if (handleWheel.lastCall && now - handleWheel.lastCall < 16) { // ~60fps
      return;
    }
    handleWheel.lastCall = now;

    const rect = container.getBoundingClientRect();
    
    // Get mouse position relative to the container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate zoom delta
    const zoomSensitivity = 0.08; // Slightly higher for better feel
    const delta = e.deltaY > 0 ? -zoomSensitivity : zoomSensitivity;
    const newZoom = Math.max(0.12, Math.min(5.0, zoom + delta)); // Wider zoom range
    
    // Don't update if zoom hasn't changed enough
    if (Math.abs(newZoom - zoom) < 0.001) return;
    
    // Calculate the world point under the cursor BEFORE zoom
    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;
    
    // Calculate new pan to keep the world point under the cursor AFTER zoom
    const newPanX = mouseX - worldX * newZoom;
    const newPanY = mouseY - worldY * newZoom;
    
    // Batch state updates to prevent multiple renders
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [zoom, pan, setZoom, setPan, containerRef]);

  // FIXED: Button-based zoom handlers that don't reset view
  const handleZoomIn = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const newZoom = Math.min(zoom + 0.15, 5.0);
    
    // Calculate world point at center before zoom
    const worldX = (centerX - pan.x) / zoom;
    const worldY = (centerY - pan.y) / zoom;
    
    // Calculate new pan to keep center point centered after zoom
    const newPanX = centerX - worldX * newZoom;
    const newPanY = centerY - worldY * newZoom;
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [zoom, pan, setZoom, setPan, containerRef]);

  const handleZoomOut = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const newZoom = Math.max(zoom - 0.15, 0.12);
    
    // Calculate world point at center before zoom
    const worldX = (centerX - pan.x) / zoom;
    const worldY = (centerY - pan.y) / zoom;
    
    // Calculate new pan to keep center point centered after zoom
    const newPanX = centerX - worldX * newZoom;
    const newPanY = centerY - worldY * newZoom;
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [zoom, pan, setZoom, setPan, containerRef]);

  const handleResetView = useCallback(() => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const resetZoom = 0.9;
      
      // Reset custom node positions
      setNodePositions(new Map());
      
      // Center the view
      setPan({ 
        x: containerRect.width / 2 - CANVAS_CENTER * resetZoom,
        y: containerRect.height / 2 - CANVAS_CENTER * resetZoom
      });
      
      // Set zoom after pan to avoid conflicts
      setTimeout(() => {
        setZoom(resetZoom);
      }, 0);
    }
  }, [setZoom, setNodePositions, setPan, CANVAS_CENTER, containerRef]);

  const handleMouseDown = useCallback((e) => {
    if (!isDraggingNode && (e.target === e.currentTarget || e.target.tagName === "svg" || e.target.classList.contains("tree-content"))) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [isDraggingNode, pan, setIsDragging, setDragStart]);

  const handleMouseMove = useCallback((e) => {
    if (isDraggingNode) {
      handleNodeMouseMove(e);
    } else if (isDragging) {
      e.preventDefault();
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDraggingNode, isDragging, dragStart, setPan, handleNodeMouseMove]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingNode) {
      handleNodeMouseUp();
    } else {
      setIsDragging(false);
    }
  }, [isDraggingNode, setIsDragging, handleNodeMouseUp]);

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
  }, [pan, isDraggingNode, setIsDragging, setDragStart]);

  const handleTouchMove = useCallback((e) => {
    if (isDraggingNode) {
      handleNodeTouchMove(e);
    } else if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      e.preventDefault();
      setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    }
  }, [isDragging, dragStart, isDraggingNode, setPan, handleNodeTouchMove]);

  const handleTouchEnd = useCallback((e) => {
    if (isDraggingNode) {
      handleNodeTouchEnd(e);
    } else {
      setIsDragging(false);
    }
  }, [isDraggingNode, setIsDragging, handleNodeTouchEnd]);

  const toggleNode = useCallback((nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  }, [expandedNodes, setExpandedNodes]);

  const selectNode = useCallback((node, e) => {
    if (e) {
      e.stopPropagation();
    }
    console.log('Node selected:', node.name);
    setSelectedNode(node);
  }, [setSelectedNode]);

  const handleAvatarError = useCallback((e, node) => {
    console.log('Avatar error for:', node.name);
    e.target.src = TreeUtils.generateDefaultAvatar(node.name, node.email);
  }, []);

  // OPTIMIZED: Advanced viewport culling for large datasets (10k+ nodes)
  const { nodes: visibleNodes, connections } = useMemo(() => {
    const startTime = performance.now();
    console.log('Calculating visible nodes for large dataset...');
    
    if (!treeData) return { nodes: [], connections: [] };

    const container = containerRef.current;
    if (!container) return { nodes: [], connections: [] };

    // Get viewport dimensions
    const viewportWidth = container.clientWidth;
    const viewportHeight = container.clientHeight;

    // Calculate world coordinates of viewport
    const worldLeft = -pan.x / zoom;
    const worldTop = -pan.y / zoom;
    const worldRight = (viewportWidth - pan.x) / zoom;
    const worldBottom = (viewportHeight - pan.y) / zoom;

    // Large padding for smooth scrolling
    const padding = 1000;
    const leftBound = worldLeft - padding;
    const topBound = worldTop - padding;
    const rightBound = worldRight + padding;
    const bottomBound = worldBottom + padding;

    // Fast visibility check
    const isNodeVisible = (node) => {
      const pos = getNodePosition(node);
      const nodeWidth = node.width || 200;
      const nodeHeight = 100;
      
      return !(pos.x + nodeWidth < leftBound ||
               pos.x - nodeWidth > rightBound ||
               pos.y + nodeHeight < topBound ||
               pos.y - nodeHeight > bottomBound);
    };

    // Efficient tree traversal with early termination
    const getVisibleNodes = (node, nodes = [], connections = []) => {
      if (!node) return { nodes, connections };

      const nodeVisible = isNodeVisible(node);
      const hasVisibleChildren = node.children && expandedNodes.has(node.id);

      // Early termination: if node is far outside bounds and has no children, skip
      if (!nodeVisible && !hasVisibleChildren) {
        const pos = getNodePosition(node);
        // If node is way outside viewport and has no children, skip entire subtree
        if (pos.x > rightBound + 2000 || pos.x < leftBound - 2000 ||
            pos.y > bottomBound + 2000 || pos.y < topBound - 2000) {
          return { nodes, connections };
        }
      }

      // Add node if visible
      if (nodeVisible) {
        nodes.push(node);
      }

      // Process children
      if (hasVisibleChildren) {
        for (const child of node.children) {
          const childVisible = isNodeVisible(child);
          
          // Add connection if parent or child is visible
          if (nodeVisible || childVisible) {
            connections.push({ parent: node, child: child });
          }
          
          // Recurse into child
          getVisibleNodes(child, nodes, connections);
        }
      }

      return { nodes, connections };
    };

    const result = getVisibleNodes(treeData);
    
    const endTime = performance.now();
    console.log(`Viewport culling: ${result.nodes.length} visible nodes, ${result.connections.length} connections (${endTime - startTime}ms)`);
    
    return result;
  }, [treeData, expandedNodes, pan, zoom, getNodePosition]); // Include viewport dependencies

  // Performance monitoring
  useEffect(() => {
    if (visibleNodes.length > 0) {
      console.log(`Rendering ${visibleNodes.length} nodes, ${connections.length} connections`);
      
      const startTime = performance.now();
      
      // Monitor render time
      const timer = setTimeout(() => {
        const endTime = performance.now();
        console.log(`Render took ${endTime - startTime} milliseconds`);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [visibleNodes.length, connections.length]);

  // **CRITICAL**: Main effect for tree generation with cache priming
  useEffect(() => {
    if (networkData) {
      const tree = convertToTreeFormat(networkData);
      if (tree) {
        const allNodeIds = TreeUtils.getAllNodeIds(tree);
        setExpandedNodes(new Set(allNodeIds));

        // Reset positioned nodes before calculating positions
        calculatePositions.positionedNodes = [];
        calculatePositions(tree, CANVAS_CENTER, CANVAS_CENTER + 100);

        // **KEY**: Prime cache with limited external image URLs for large datasets
        const imageUrls = TreeUtils.collectImageUrls(tree).filter(url => 
          url.startsWith('http') && 
          (url.includes('googleusercontent.com') || url.includes('googleapis.com'))
        );

        if (imageUrls.length > 0) {
          console.log(`Priming cache for ${Math.min(imageUrls.length, 50)} images out of ${imageUrls.length} total`);
          primeImageCache(imageUrls);

          // Reduced delay for large datasets
          setTimeout(() => {
            setTreeData(tree);
          }, 1000);
        } else {
          setTreeData(tree);
        }
      }
    }
  }, [networkData, convertToTreeFormat, primeImageCache, setExpandedNodes, setTreeData, CANVAS_CENTER, calculatePositions]);

  // FIXED: Only run once when treeData is first loaded, NOT on zoom changes
  useEffect(() => {
    if (treeData && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setPan({ 
        x: containerRect.width / 2 - CANVAS_CENTER * 0.9,
        y: containerRect.height / 2 - CANVAS_CENTER * 0.9
      });
    }
  }, [treeData, CANVAS_CENTER, setPan]);

  // FIXED: Attach wheel event directly to container
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Add event listeners with explicit options
      const wheelOptions = { passive: false, capture: false };
      const touchOptions = { passive: false, capture: false };
      
      container.addEventListener("wheel", handleWheel, wheelOptions);
      container.addEventListener("touchstart", handleTouchStart, touchOptions);
      container.addEventListener("touchmove", handleTouchMove, touchOptions);
      container.addEventListener("touchend", handleTouchEnd, touchOptions);

      return () => {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const mainStyles = `
    .org-chart-container {
      font-family: Arial, sans-serif;
      background: #f6f6f6;
      border-radius: 0;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    @media (max-width: 1024px) {
      .main-layout {
        flex-direction: column;
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: mainStyles }} />
      <div className="org-chart-container">
        {/* Controls Bar */}
        <ControlsBar
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
        />

        {/* Main Layout */}
        <div className="main-layout">
          <TreeCanvas
            treeData={treeData}
            visibleNodes={visibleNodes}
            connections={connections}
            selectedNode={selectedNode}
            expandedNodes={expandedNodes}
            draggedNode={draggedNode}
            getNodePosition={getNodePosition}
            onNodeMouseDown={handleNodeMouseDown}
            onNodeTouchStart={handleNodeTouchStart}
            onNodeTouchMove={handleNodeTouchMove}
            onNodeTouchEnd={handleNodeTouchEnd}
            onToggleNode={toggleNode}
            onAvatarError={handleAvatarError}
            isDraggingNode={isDraggingNode}
            isDragging={isDragging}
            pan={pan}
            zoom={zoom}
            CANVAS_SIZE={CANVAS_SIZE}
            svgRef={svgRef}
            containerRef={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />

          <DetailsPanel 
            selectedNode={selectedNode} 
            generateDefaultAvatar={TreeUtils.generateDefaultAvatar}
          />
        </div>
      </div>
    </>
  );
};

export default NetworkTreeVisualization;
