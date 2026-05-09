/**
 * NodePalette - Draggable list of available node definitions
 * Users can drag nodes from here onto the DAGEditor canvas
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BuildIcon from '@mui/icons-material/Build';
import { type NodeDefinition } from '../../types';
import './NodePalette.css';

interface NodePaletteProps {
  nodeDefinitions: NodeDefinition[];
  isLoading?: boolean;
}

export const NodePalette: React.FC<NodePaletteProps> = ({
  nodeDefinitions,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string>('all');

  // Group nodes by category
  const groupedNodes = useMemo(() => {
    const grouped: Record<string, NodeDefinition[]> = {
      all: nodeDefinitions,
    };

    nodeDefinitions.forEach((node) => {
      const category = node.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(node);
    });

    return grouped;
  }, [nodeDefinitions]);

  // Filter nodes by search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedNodes;

    const term = searchTerm.toLowerCase();
    const filtered: Record<string, NodeDefinition[]> = {};

    Object.entries(groupedNodes).forEach(([category, nodes]) => {
      const matches = nodes.filter(
        (node) =>
          node.name.toLowerCase().includes(term) ||
          node.description.toLowerCase().includes(term) ||
          node.id.toLowerCase().includes(term)
      );

      if (matches.length > 0) {
        filtered[category] = matches;
      }
    });

    return filtered;
  }, [groupedNodes, searchTerm]);

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement | HTMLLIElement>,
    nodeDefId: string
  ) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('nodeDefinitionId', nodeDefId);

    // Set a custom drag image
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.padding = '8px 12px';
    dragImage.style.backgroundColor = '#1976d2';
    dragImage.style.color = 'white';
    dragImage.style.borderRadius = '4px';
    dragImage.style.fontSize = '12px';
    dragImage.textContent = 'Adding node...';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const getNodeIcon = (nodeDef: NodeDefinition) => {
    // If custom icon is provided, use it; otherwise use generic Build icon
    if (nodeDef.icon) {
      return (
        <img
          src={nodeDef.icon}
          alt={nodeDef.name}
          style={{ width: 24, height: 24 }}
        />
      );
    }
    return <BuildIcon />;
  };

  if (isLoading) {
    return (
      <Paper className="node-palette">
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="textSecondary">Loading node definitions...</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className="node-palette">
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" className="font-bold mb-4">
          Node Palette
        </Typography>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />
      </Box>

      <Divider />

      {/* Node List */}
      <Box sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {Object.entries(filteredGroups).length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary" variant="body2">
              No nodes match your search
            </Typography>
          </Box>
        ) : (
          Object.entries(filteredGroups).map(([category, nodes]) => (
            <Accordion
              key={category}
              defaultExpanded={category === 'all' || category === expandedCategory}
              onChange={() => setExpandedCategory(category)}
              sx={{
                '&:before': { display: 'none' },
                boxShadow: 'none',
                borderBottom: '1px solid #e0e0e0',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" className="font-semibold">
                  {category === 'all' ? `All (${nodes.length})` : `${category} (${nodes.length})`}
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0 }}>
                <List disablePadding>
                  {nodes.map((nodeDef) => (
                    <ListItem
                      key={nodeDef.id}
                      disablePadding
                      draggable
                      onDragStart={(e) => handleDragStart(e, nodeDef.id)}
                      className="node-palette-item"
                    >
                      <ListItemButton
                        sx={{
                          py: 1.5,
                          px: 2,
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                          },
                          cursor: 'grab',
                          '&:active': {
                            cursor: 'grabbing',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <DragIndicatorIcon
                            fontSize="small"
                            sx={{ color: '#999', mr: 1 }}
                          />
                        </ListItemIcon>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getNodeIcon(nodeDef)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" className="font-medium">
                              {nodeDef.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="textSecondary">
                              {nodeDef.description}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      {/* Footer info */}
      <Divider />
      <Box sx={{ p: 1.5, backgroundColor: '#f9f9f9' }}>
        <Typography variant="caption" color="textSecondary">
          💡 Drag nodes to canvas
        </Typography>
      </Box>
    </Paper>
  );
};
