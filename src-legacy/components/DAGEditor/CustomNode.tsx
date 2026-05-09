/**
 * CustomNode - Custom node component for React Flow
 */

import React, { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography, Paper } from '@mui/material';
import { useUIStore } from '../../stores/uiStore';
import './CustomNode.css';

interface CustomNodeData {
  label: string;
  nodeDefinitionId: string;
  description?: string;
  config?: Record<string, unknown>;
}

interface CustomNodeProps {
  data: CustomNodeData;
  selected?: boolean;
  isConnectable?: boolean;
  id: string;
}

export const CustomNode: React.FC<CustomNodeProps> = ({
  data,
  selected = false,
  isConnectable = true,
  id,
}) => {
  const selectedNodeId = useUIStore((state) => state.selectedNodeId);
  const isSelected = selectedNodeId === id || selected;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Box
      className={`custom-node ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      {/* Top Handle - Input */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="handle handle-top"
      />

      {/* Node Content */}
      <Paper
        elevation={isSelected ? 8 : 2}
        className="node-content"
        sx={{
          p: 1.5,
          textAlign: 'center',
          backgroundColor: isSelected ? '#e3f2fd' : '#fff',
          borderColor: isSelected ? '#1976d2' : '#e0e0e0',
          borderWidth: isSelected ? 2 : 1,
          borderStyle: 'solid',
          borderRadius: 1,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 4,
            borderColor: '#1976d2',
          },
          minWidth: '120px',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: '#333',
            mb: 0.5,
          }}
        >
          {data.label}
        </Typography>

        {data.description && (
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              display: 'block',
              fontSize: '0.7rem',
            }}
          >
            {data.description.substring(0, 30)}
            {data.description.length > 30 ? '...' : ''}
          </Typography>
        )}
      </Paper>

      {/* Bottom Handle - Output */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="handle handle-bottom"
      />

      {/* Left Handle - Alternative Input */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="handle handle-left"
      />

      {/* Right Handle - Alternative Output */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="handle handle-right"
      />
    </Box>
  );
};
