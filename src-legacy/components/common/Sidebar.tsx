/**
 * Sidebar component - Left navigation menu
 */

import React from 'react';
import { Drawer, Box, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import WorkflowIcon from '@mui/icons-material/AccountTree';
import DatasetIcon from '@mui/icons-material/Dataset';
import JobIcon from '@mui/icons-material/Task';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';

const DRAWER_WIDTH = 240;

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { label: 'Home', icon: <HomeIcon />, path: '/' },
  { label: 'Workflows', icon: <WorkflowIcon />, path: '/workflows' },
  { label: 'Datasets', icon: <DatasetIcon />, path: '/datasets' },
  { label: 'Jobs', icon: <JobIcon />, path: '/jobs' },
];

const settingsItems: MenuItem[] = [
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const handleNavigation = (path: string) => {
    navigate(path);
    // Keep sidebar open on desktop, close on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Drawer
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      sx={{ width: DRAWER_WIDTH }}
      slotProps={{ paper: { sx: { width: DRAWER_WIDTH } } }}
    >
      <Box className="h-full flex flex-col bg-gray-50">
        {/* Main menu */}
        <List className="flex-1">
          {menuItems.map((item) => (
            <ListItem
              component="button"
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                backgroundColor: isActive(item.path) ? '#eff6ff' : 'transparent',
                borderLeft: isActive(item.path) ? '4px solid #3b82f6' : 'none',
                color: isActive(item.path) ? '#3b82f6' : 'inherit',
              }}
            >
              <ListItemIcon className={isActive(item.path) ? 'text-blue-500' : ''}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>

        <Divider />

        {/* Settings menu */}
        <List>
          {settingsItems.map((item) => (
            <ListItem
              component="button"
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                backgroundColor: isActive(item.path) ? '#eff6ff' : 'transparent',
                borderLeft: isActive(item.path) ? '4px solid #3b82f6' : 'none',
                color: isActive(item.path) ? '#3b82f6' : 'inherit',
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
