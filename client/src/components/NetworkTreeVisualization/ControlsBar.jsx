import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const ControlsBar = ({ zoom, onZoomIn, onZoomOut, onResetView }) => {
  const controlsBarStyles = `
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

    @media (max-width: 1024px) {
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
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: controlsBarStyles }} />
      <div className="controls-bar">
        <div className="zoom-controls">
          <button onClick={onZoomOut} className="control-btn">
            <ZoomOut size={16} />
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={onZoomIn} className="control-btn">
            <ZoomIn size={16} />
          </button>
        </div>
        <button onClick={onResetView} className="control-btn" title="Reset view and positions">
          <RotateCcw size={16} />
        </button>
        <div className="drag-hint">
          Hold Shift + Drag to move nodes | Drag anywhere to pan
        </div>
      </div>
    </>
  );
};

export default ControlsBar;
