import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Grid } from '@mui/material';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  const handleBookClick = () => {
    navigate(`/book/${service.id}`);
  };

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="h2">
            {service.name}
          </Typography>
          <Typography>
            {service.description}
          </Typography>
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Süre: {service.durationMinutes} dakika
          </Typography>
          <Typography variant="h6" component="p" sx={{ mt: 1 }}>
            Fiyat: {service.price} TL
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" variant="contained" onClick={handleBookClick}>Randevu Al</Button>
        </CardActions>
      </Card>
    </Grid>
  );
};

export default ServiceCard;
