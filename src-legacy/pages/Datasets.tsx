/**
 * Datasets page - Upload and manage datasets
 * Phase 3 Implementation
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { datasetApi } from '../services/api';
import { DatasetUpload } from '../components/DatasetUpload/DatasetUpload';
import { type Dataset } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ width: '100%' }}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
};

export const Datasets: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Fetch datasets list
  const {
    data: datasets = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetApi.listDatasets(),
  });

  const handleUploadSuccess = (_dataset: Dataset) => {
    // Refetch datasets list
    refetch();
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="flex justify-between items-center mb-8">
        <Typography variant="h4" className="font-bold">
          Datasets
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab label="Upload Dataset" />
          <Tab label="My Datasets" />
        </Tabs>
      </Paper>

      {/* Upload Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mt: 3 }}>
          <DatasetUpload
            onUploadSuccess={handleUploadSuccess}
            showHistory={true}
          />
        </Box>
      </TabPanel>

      {/* Datasets List Tab */}
      <TabPanel value={tabValue} index={1}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Failed to load datasets</Alert>
        ) : datasets.length === 0 ? (
          <Alert severity="info">No datasets uploaded yet</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>
                    <Typography className="font-bold">Name</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography className="font-bold">Size</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography className="font-bold">Rows</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography className="font-bold">Format</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography className="font-bold">Uploaded</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datasets.map((dataset: Dataset) => (
                  <TableRow key={dataset.id} hover>
                    <TableCell>{dataset.name}</TableCell>
                    <TableCell align="right">
                      {(dataset.size / 1024 / 1024).toFixed(2)} MB
                    </TableCell>
                    <TableCell align="right">{dataset.rows || '—'}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" className="font-mono">
                        {dataset.format.toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="textSecondary">
                        {new Date(dataset.uploadedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
    </Container>
  );
};
