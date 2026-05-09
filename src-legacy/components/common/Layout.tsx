/**
 * Layout component - Wraps pages with Header and Sidebar
 */

import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useUIStore } from '../../stores/uiStore';

export const Layout: React.FC = () => {
  const { sidebarOpen } = useUIStore();

  return (
    <Box className="flex flex-col h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <Box className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <Box
          component="main"
          className="flex-1 overflow-auto bg-gray-50"
          sx={{
            transition: 'margin-left 0.3s ease-in-out',
            marginLeft: sidebarOpen ? 0 : '-240px',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
