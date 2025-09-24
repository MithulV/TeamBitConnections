import React from 'react';
import { TreeUtils } from './TreeUtils.js';

const ConnectionLines = ({ connections, getNodePosition }) => {
  const connectionStyles = `
    .connection-line {
      transition: all 0.3s ease;
    }

    .connection-line:hover {
      stroke-width: 2.5;
      stroke: #666;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: connectionStyles }} />
      <g className="connections">
        {connections.map((conn, index) => (
          <path
            key={`connection-${conn.parent.id}-${conn.child.id}-${index}`}
            d={TreeUtils.generateSmoothPath(conn.parent, conn.child, getNodePosition)}
            stroke="#999"
            strokeWidth="1.5"
            fill="none"
            className="connection-line"
          />
        ))}
      </g>
    </>
  );
};

export default ConnectionLines;
