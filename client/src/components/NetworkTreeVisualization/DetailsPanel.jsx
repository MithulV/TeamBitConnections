import React from 'react';
import { TreeUtils } from './TreeUtils.js';

const DetailsPanel = ({ selectedNode, generateDefaultAvatar }) => {
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
            <strong>{TreeUtils.formatFieldName(key)}:</strong>
          </div>
          <div className="detail-value">
            {displayValue}
          </div>
        </div>
      );
    }).filter(Boolean);
  };

  const panelStyles = `
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

    @media (max-width: 1024px) {
      .details-panel {
        width: 100%;
        height: 300px;
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: panelStyles }} />
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
    </>
  );
};

export default DetailsPanel;
