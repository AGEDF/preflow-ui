/**
 * 404 Not Found page
 */

import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box className="flex flex-col items-center justify-center h-screen">
        <Typography variant="h1" className="font-bold text-8xl text-gray-300 mb-4">
          404
        </Typography>
        <Typography variant="h4" className="font-bold mb-2">
          Page Not Found
        </Typography>
        <Typography color="textSecondary" className="mb-8 text-center">
          The page you're looking for doesn't exist. Please return to the home page.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
        >
          Return Home
        </Button>
      </Box>
    </Container>
  );
};
