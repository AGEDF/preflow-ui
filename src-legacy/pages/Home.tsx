/**
 * Home page - Welcome screen
 */

import React from 'react';
import { Box, Container, Typography, Button, Card, CardContent } from '@mui/material';
import WorkflowIcon from '@mui/icons-material/AccountTree';
import DatasetIcon from '@mui/icons-material/Dataset';
import JobIcon from '@mui/icons-material/Task';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" className="py-12">
      {/* Header */}
      <Box className="mb-12 text-center">
        <Typography variant="h3" className="mb-4 font-bold text-gray-900">
          Welcome to Preflow
        </Typography>
        <Typography variant="h6" className="text-gray-600 mb-8">
          DAG-based ML Preprocessing Orchestration Engine
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/workflows')}
        >
          Get Started
        </Button>
      </Box>

      {/* Feature Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 4,
        }}
      >
        <Card className="hover:shadow-lg transition-shadow h-full">
          <CardContent>
            <WorkflowIcon className="text-4xl text-blue-500 mb-4" />
            <Typography variant="h6" className="font-bold mb-2">
              Workflows
            </Typography>
            <Typography color="textSecondary" className="mb-4">
              Create and manage data transformation pipelines visually
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/workflows')}
            >
              View Workflows
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow h-full">
          <CardContent>
            <DatasetIcon className="text-4xl text-green-500 mb-4" />
            <Typography variant="h6" className="font-bold mb-2">
              Datasets
            </Typography>
            <Typography color="textSecondary" className="mb-4">
              Upload and manage your data files for processing
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/datasets')}
            >
              Upload Data
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow h-full">
          <CardContent>
            <JobIcon className="text-4xl text-purple-500 mb-4" />
            <Typography variant="h6" className="font-bold mb-2">
              Executions
            </Typography>
            <Typography color="textSecondary" className="mb-4">
              Monitor and track workflow execution jobs in real-time
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/jobs')}
            >
              View Jobs
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
