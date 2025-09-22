import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

const Users: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Users Management
        </Typography>
        <Typography variant="body1">
          User management functionality will be implemented here.
        </Typography>
      </Box>
    </Container>
  );
};

export default Users;
