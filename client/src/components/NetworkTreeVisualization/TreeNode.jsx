import React from 'react';

const TreeNode = React.memo(({
  node,
  isSelected,
  isExpanded,
  isBeingDragged,
  getNodePosition,
  onNodeMouseDown,
  onNodeTouchStart,
  onNodeTouchMove,
  onNodeTouchEnd,
  onToggleNode,
  onAvatarError,
  isDraggingNode
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const nodeWidth = node.width || 200;
  const textStartX = -nodeWidth / 2 + 85;
  const NODE_HEIGHT = 100;
  
  const nodePos = getNodePosition(node);
  const isOnline = node.nodeData?.is_online;

  const nodeStyles = `
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

    .expand-btn {
      cursor: pointer;
    }

    .expand-btn:hover {
      fill: #f0f0f0;
      transform: scale(1.1);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: nodeStyles }} />
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
          onMouseDown={(e) => onNodeMouseDown(e, node)}
          onTouchStart={(e) => onNodeTouchStart(e, node)}
          onTouchMove={onNodeTouchMove}
          onTouchEnd={onNodeTouchEnd}
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

        {/* Avatar Image - ORIGINAL BEAUTIFUL VERSION */}
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
            onMouseDown={(e) => onNodeMouseDown(e, node)}
            onTouchStart={(e) => onNodeTouchStart(e, node)}
            onTouchMove={onNodeTouchMove}
            onTouchEnd={onNodeTouchEnd}
            onError={(e) => onAvatarError(e, node)}
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
          onMouseDown={(e) => onNodeMouseDown(e, node)}
          onTouchStart={(e) => onNodeTouchStart(e, node)}
          onTouchMove={onNodeTouchMove}
          onTouchEnd={onNodeTouchEnd}
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
          onMouseDown={(e) => onNodeMouseDown(e, node)}
          onTouchStart={(e) => onNodeTouchStart(e, node)}
          onTouchMove={onNodeTouchMove}
          onTouchEnd={onNodeTouchEnd}
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
                onToggleNode(node.id);
              }}
              onTouchEnd={(e) => {
                if (!isDraggingNode) {
                  e.stopPropagation();
                  onToggleNode(node.id);
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
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.isBeingDragged === nextProps.isBeingDragged &&
    prevProps.isDraggingNode === nextProps.isDraggingNode
  );
});

TreeNode.displayName = 'TreeNode';

export default TreeNode;
