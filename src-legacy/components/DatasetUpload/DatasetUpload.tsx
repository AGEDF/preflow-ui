/**
 * DatasetUpload - Component for uploading datasets
 * Phase 3 Implementation
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { datasetApi } from '../../services/api';
import { type Dataset } from '../../types';
import './DatasetUpload.css';

interface UploadState {
  file: File | null;
  name: string;
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

interface DatasetUploadProps {
  onUploadSuccess?: (dataset: Dataset) => void;
  onUploadError?: (error: Error) => void;
  showHistory?: boolean;
}

export const DatasetUpload: React.FC<DatasetUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  showHistory = true,
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    name: '',
    uploading: false,
    progress: 0,
    error: null,
    success: false,
  });

  const [recentDatasets, setRecentDatasets] = useState<Dataset[]>([]);
  const [showNameDialog, setShowNameDialog] = useState(false);

  const supportedFormats = ['CSV', 'Parquet', 'JSON'];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file format
    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    if (!supportedFormats.includes(ext)) {
      setUploadState((prev) => ({
        ...prev,
        error: `Invalid file format. Supported: ${supportedFormats.join(', ')}`,
      }));
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      setUploadState((prev) => ({
        ...prev,
        error: 'File size exceeds 500MB limit',
      }));
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      file,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      error: null,
      success: false,
    }));
  }, []);

  const handleDragDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const input = document.createElement('input');
      input.type = 'file';
      Object.defineProperty(input, 'files', { value: files });
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', { value: input });
      handleFileSelect(changeEvent as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  }, [handleFileSelect]);

  const handleUpload = useCallback(async () => {
    if (!uploadState.file) return;

    // Show name dialog if name not set
    if (!uploadState.name.trim()) {
      setShowNameDialog(true);
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null,
    }));

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', uploadState.file);
      formData.append('name', uploadState.name);

      // Upload with progress tracking
      const dataset = await datasetApi.uploadDataset(uploadState.file, uploadState.name);

      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        progress: 100,
        success: true,
      }));

      setRecentDatasets((prev) => [dataset, ...prev]);

      // Call callback
      if (onUploadSuccess) {
        onUploadSuccess(dataset);
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setUploadState({
          file: null,
          name: '',
          uploading: false,
          progress: 0,
          error: null,
          success: false,
        });
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        error: message,
      }));

      if (onUploadError) {
        onUploadError(error instanceof Error ? error : new Error(message));
      }
    }
  }, [uploadState.file, uploadState.name, onUploadSuccess, onUploadError]);

  const handleDeleteDataset = useCallback(async (datasetId: string) => {
    if (!confirm('Delete this dataset?')) return;

    try {
      await datasetApi.deleteDataset(datasetId);
      setRecentDatasets((prev) => prev.filter((d) => d.id !== datasetId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, []);

  return (
    <Box className="dataset-upload">
      {/* Upload Zone */}
      <Paper
        className="dataset-upload-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDragDrop}
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          border: '2px dashed #ccc',
          borderRadius: 2,
          mb: 3,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: '#f0f0f0',
            borderColor: '#999',
          },
        }}
      >
        {uploadState.success ? (
          <Box sx={{ py: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'green', mb: 1 }} />
            <Typography variant="h6" className="font-bold">
              Upload Successful!
            </Typography>
            <Typography color="textSecondary" sx={{ mt: 1 }}>
              {uploadState.file?.name}
            </Typography>
          </Box>
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
            <Typography variant="h6" className="font-bold mb-2">
              Drag & drop dataset here
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              or click to browse
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Supported: CSV, Parquet, JSON (max 500MB)
            </Typography>

            <input
              type="file"
              hidden
              accept=".csv,.parquet,.json"
              onChange={handleFileSelect}
              id="file-input"
            />
            <label htmlFor="file-input" style={{ display: 'contents' }}>
              <Button
                component="span"
                variant="contained"
                sx={{ mt: 3 }}
              >
                Select File
              </Button>
            </label>
          </>
        )}
      </Paper>

      {/* File Summary */}
      {uploadState.file && !uploadState.success && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FileIcon fontSize="small" />
              <Typography variant="body2" className="font-semibold">
                {uploadState.file.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                ({(uploadState.file.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Dataset Name"
              value={uploadState.name}
              onChange={(e) =>
                setUploadState((prev) => ({ ...prev, name: e.target.value }))
              }
              sx={{ mb: 2 }}
            />

            {uploadState.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {uploadState.error}
              </Alert>
            )}

            {uploadState.uploading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress variant="determinate" value={uploadState.progress} />
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Uploading... {uploadState.progress}%
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!uploadState.name.trim() || uploadState.uploading}
              >
                {uploadState.uploading ? 'Uploading...' : 'Upload'}
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  setUploadState({
                    file: null,
                    name: '',
                    uploading: false,
                    progress: 0,
                    error: null,
                    success: false,
                  })
                }
                disabled={uploadState.uploading}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Recent Datasets */}
      {showHistory && recentDatasets.length > 0 && (
        <Paper sx={{ mt: 3 }}>
          <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" className="font-bold">
              Recent Datasets
            </Typography>
          </Box>
          <List>
            {recentDatasets.map((dataset) => (
              <ListItem
                key={dataset.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleDeleteDataset(dataset.id)}
                    color="error"
                    title="Delete dataset"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <FileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={dataset.name}
                  secondary={`${dataset.rows || '?'} rows • ${(dataset.size / 1024 / 1024).toFixed(2)} MB`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Name Dialog */}
      <Dialog open={showNameDialog} onClose={() => setShowNameDialog(false)}>
        <DialogTitle>Dataset Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={uploadState.name}
            onChange={(e) =>
              setUploadState((prev) => ({ ...prev, name: e.target.value }))
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNameDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setShowNameDialog(false);
              handleUpload();
            }}
            variant="contained"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
