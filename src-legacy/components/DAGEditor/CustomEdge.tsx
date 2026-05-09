/**
 * CustomEdge - Custom edge component for React Flow
 */

import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from 'reactflow';
import './CustomEdge.css';

export const CustomEdge: React.FC<EdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#1976d2' : '#b1b1b7',
          strokeWidth: selected ? 2 : 1.5,
          transition: 'all 0.2s ease',
        }}
      />
      <EdgeLabelRenderer>
        {data?.label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              fontWeight: 500,
              pointerEvents: 'none',
              backgroundColor: 'white',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid #ddd',
            }}
            className="edge-label"
          >
            {data.label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};
