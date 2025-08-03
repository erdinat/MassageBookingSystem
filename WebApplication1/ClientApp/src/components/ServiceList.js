import React, { useState, useEffect } from 'react';
import { Grid, CircularProgress, Box, Typography } from '@mui/material';
import ServiceCard from './ServiceCard';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error("Hizmetler çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Hizmetlerimiz
      </Typography>
      <Grid container spacing={4}>
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </Grid>
    </>
  );
};

export default ServiceList; 