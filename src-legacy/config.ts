/**
 * Configuration for Preflow UI
 * Environment variables should be set in .env.local
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const WORKER_BASE_URL = import.meta.env.VITE_WORKER_BASE_URL || 'http://localhost:8001';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

export const REQUEST_TIMEOUT = 30000; // ms
export const JOB_POLL_INTERVAL = 2000; // ms (fallback polling)
export const JOB_POLL_ENABLED = import.meta.env.VITE_JOB_POLL_ENABLED !== 'false';

// Job status colors for consistent UI
export const JOB_STATUS_COLORS = {
  QUEUED: '#ffa726', // Orange
  PENDING: '#42a5f5', // Light blue
  RUNNING: '#2196f3', // Blue
  COMPLETED: '#66bb6a', // Green
  FAILED: '#ef5350', // Red
};

// Node definition types
export const NODE_DEFINITION_TYPES = {
  REMOVE_NULLS: 'remove_nulls',
  FILL_VALUES: 'fill_values',
  NORMALIZE: 'normalize',
  DUPLICATE_ROWS: 'duplicate_rows',
  // Add more as backend supports them
};
