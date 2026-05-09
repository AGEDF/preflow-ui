/**
 * NodeConfigPanel - Right sidebar for configuring selected node
 * Displays and allows editing of node properties
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper, TextField, Button, Divider, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { type Node as FlowNode } from 'reactflow';
import { type NodeDefinition } from '../../types';
import './NodeConfigPanel.css';

interface NodeConfigPanelProps {
  node: FlowNode | null;
  nodeDefinition: NodeDefinition | null;
  onConfigChange?: (nodeId: string, config: Record<string, unknown>) => void;
  onNodeDelete?: (nodeId: string) => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  nodeDefinition,
  onConfigChange,
  onNodeDelete,
}) => {
  const config = useMemo(
    () => (node?.data?.config as Record<string, unknown>) || {},
    [node?.data?.config]
  );

  const handleConfigChange = (key: string, value: unknown) => {
    if (!node || !onConfigChange) return;
    const newConfig = { ...config, [key]: value };
    onConfigChange(node.id, newConfig);
  };

  const handleDelete = () => {
    if (!node || !onNodeDelete) return;
    if (confirm(`Delete node "${node.data?.label}"?`)) {
      onNodeDelete(node.id);
    }
  };

  if (!node) {
    return (
      <Paper className="node-config-panel empty">
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary" variant="body2">
            Select a node to view and edit its configuration
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className="node-config-panel">
      {/* Header */}
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" className="font-bold">
          {node.data?.label as string || 'Node'}
        </Typography>
        {nodeDefinition && (
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
            {nodeDefinition.id}
          </Typography>
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 2, overflowY: 'auto', maxHeight: 'calc(100% - 180px)' }}>
        {/* Node Definition Info */}
        {nodeDefinition && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" className="font-semibold mb-2">
                Description
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {nodeDefinition.description}
              </Typography>
            </Box>

            {nodeDefinition.category && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" className="font-semibold mb-2">
                  Category
                </Typography>
                <Typography variant="body2">{nodeDefinition.category}</Typography>
              </Box>
            )}

            {nodeDefinition.supportedLibraries && nodeDefinition.supportedLibraries.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" className="font-semibold mb-2">
                  Libraries
                </Typography>
                <Typography variant="body2">{nodeDefinition.supportedLibraries.join(', ')}</Typography>
              </Box>
            )}
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Configuration */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" className="font-semibold mb-2">
            Configuration
          </Typography>

          {nodeDefinition?.configSchema ? (
            <Alert severity="info" sx={{ mb: 2, py: 1 }}>
              Custom configuration schema available
            </Alert>
          ) : (
            <Typography variant="caption" color="textSecondary">
              No specific configuration required
            </Typography>
          )}

          {/* Basic config editor */}
          {Object.entries(config).length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {Object.entries(config).map(([key, value]) => (
                <TextField
                  key={key}
                  fullWidth
                  size="small"
                  label={key}
                  value={typeof value === 'string' ? value : JSON.stringify(value)}
                  onChange={(e) => handleConfigChange(key, e.target.value)}
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="caption" color="textSecondary">
              No configuration parameters
            </Typography>
          )}
        </Box>
      </Box>

      <Divider />

      {/* Footer: Delete Button */}
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <Button
          fullWidth
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
          color="error"
          variant="outlined"
          size="small"
        >
          Delete
        </Button>
      </Box>
    </Paper>
  );
};
