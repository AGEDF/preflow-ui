/**
 * Header component - Top navigation bar
 */

import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useUIStore } from '../../stores/uiStore';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { toggleSidebar, darkMode, toggleDarkMode } = useUIStore();

  return (
    <AppBar position="static" className="bg-white shadow-md">
      <Toolbar className="flex justify-between">
        {/* Logo & Menu */}
        <Box className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
            className="text-gray-800"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className="text-gray-900 font-bold">
            Preflow
          </Typography>
        </Box>

        {/* Right side controls */}
        <Box className="flex items-center gap-4">
          <IconButton
            size="small"
            onClick={toggleDarkMode}
            className="text-gray-800"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <Button
            color="inherit"
            size="small"
            onClick={() => navigate('/workflows')}
            className="text-gray-800 normal-case"
          >
            Workflows
          </Button>

          <Button
            color="inherit"
            size="small"
            onClick={() => navigate('/datasets')}
            className="text-gray-800 normal-case"
          >
            Datasets
          </Button>

          <Button
            color="inherit"
            size="small"
            onClick={() => navigate('/jobs')}
            className="text-gray-800 normal-case"
          >
            Jobs
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
