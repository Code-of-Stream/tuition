import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';

const Unauthorized: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        401 - Unauthorized Access
      </Typography>
      <Typography variant="body1" paragraph>
        You don't have permission to access this page. Please contact the administrator if you believe this is an error.
      </Typography>
      <Box mt={4}>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/"
        >
          Return to Home
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;
