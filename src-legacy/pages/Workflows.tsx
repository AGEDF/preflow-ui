/**
 * Workflows page - List and manage workflows
 * Phase 1: Skeleton only. Phase 2 will implement builder.
 */

import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

export const Workflows: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="flex justify-between items-center mb-8">
        <Typography variant="h4" className="font-bold">
          Workflows
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/workflows/new')}
        >
          Create Workflow
        </Button>
      </Box>

      {/* Placeholder: Workflow list will be implemented in Phase 2 */}
      <Box className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <Typography variant="h6" color="textSecondary" className="mb-4">
          Workflow list will be implemented in Phase 2 (Workflow Builder)
        </Typography>
        <Typography color="textSecondary" className="text-sm">
          Current phase: Foundation (Phase 1) - Routing skeleton
        </Typography>
      </Box>
    </Container>
  );
};
