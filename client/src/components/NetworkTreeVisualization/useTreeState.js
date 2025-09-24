import { useState, useRef } from 'react';

export const useTreeState = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [treeData, setTreeData] = useState(null);
  const [zoom, setZoom] = useState(0.9);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Node dragging state
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [nodeDragStart, setNodeDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState(new Map());

  // Image cache state
  const [primedImages, setPrimedImages] = useState(new Set());

  // Refs
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Constants
  const CANVAS_SIZE = 100000;
  const CANVAS_CENTER = CANVAS_SIZE / 2;

  return {
    // State
    selectedNode,
    setSelectedNode,
    expandedNodes,
    setExpandedNodes,
    treeData,
    setTreeData,
    zoom,
    setZoom,
    pan,
    setPan,
    isDragging,
    setIsDragging,
    dragStart,
    setDragStart,
    isDraggingNode,
    setIsDraggingNode,
    draggedNode,
    setDraggedNode,
    nodeDragStart,
    setNodeDragStart,
    nodePositions,
    setNodePositions,
    primedImages,
    setPrimedImages,
    
    // Refs
    svgRef,
    containerRef,
    canvasRef,
    
    // Constants
    CANVAS_SIZE,
    CANVAS_CENTER
  };
};
