import React from 'react';
import TreeNode from './TreeNode.jsx';
import ConnectionLines from './ConnectionLines.jsx';

const TreeCanvas = React.memo(({
  treeData,
  visibleNodes,
  connections,
  selectedNode,
  expandedNodes,
  draggedNode,
  getNodePosition,
  onNodeMouseDown,
  onNodeTouchStart,
  onNodeTouchMove,
  onNodeTouchEnd,
  onToggleNode,
  onAvatarError,
  isDraggingNode,
  isDragging,
  pan,
  zoom,
  CANVAS_SIZE,
  svgRef,
  containerRef,
  onMouseDown,
  onMouseMove,
  onMouseUp
}) => {
  const canvasStyles = `
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
      transform-origin: 0 0;
    }

    .grid-background {
      opacity: 0.6;
    }

    .tree-svg {
      display: block;
      pointer-events: all;
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
  `;

  if (!treeData) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: canvasStyles }} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading network tree and priming image cache...</p>
          <small>This ensures Google profile pictures load properly</small>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: canvasStyles }} />
      <div 
        className={`tree-viewport ${isDragging ? 'dragging' : 'ready'} ${isDraggingNode ? 'dragging-node' : ''}`}
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
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
          {/* Grid background */}
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
            <ConnectionLines 
              connections={connections} 
              getNodePosition={getNodePosition} 
            />

            {/* Nodes - FIXED with safety check */}
            <g className="nodes">
              {visibleNodes && Array.isArray(visibleNodes) && visibleNodes.length > 0 ? visibleNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isExpanded = expandedNodes.has(node.id);
                const isBeingDragged = draggedNode?.id === node.id;

                return (
                  <TreeNode
                    key={node.id}
                    node={node}
                    isSelected={isSelected}
                    isExpanded={isExpanded}
                    isBeingDragged={isBeingDragged}
                    getNodePosition={getNodePosition}
                    onNodeMouseDown={onNodeMouseDown}
                    onNodeTouchStart={onNodeTouchStart}
                    onNodeTouchMove={onNodeTouchMove}
                    onNodeTouchEnd={onNodeTouchEnd}
                    onToggleNode={onToggleNode}
                    onAvatarError={onAvatarError}
                    isDraggingNode={isDraggingNode}
                  />
                );
              }) : (
                <text x="50%" y="50%" textAnchor="middle" fill="#666" fontSize="14">
                  No nodes to display
                </text>
              )}
            </g>
          </svg>
        </div>
      </div>
    </>
  );
});

TreeCanvas.displayName = 'TreeCanvas';

export default TreeCanvas;
