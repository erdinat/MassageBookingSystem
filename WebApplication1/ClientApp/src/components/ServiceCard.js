import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Grid } from '@mui/material';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  const handleBookClick = () => {
    navigate(`/book/${service.id}`);
  };

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card sx={{ 
        height: '320px', // SABİT YÜKSEKLİK
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
        }
      }}>
        <CardContent sx={{ 
          flexGrow: 1, 
          padding: 2, 
          display: 'flex', 
          flexDirection: 'column'
        }}>
          <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {service.name}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 2, 
              color: 'text.secondary', 
              lineHeight: 1.5, 
              flexGrow: 1,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {service.description}
          </Typography>
          <Box sx={{ mt: 'auto' }}>
            <Typography sx={{ mb: 1 }} color="text.secondary" variant="body2">
              ⏱️ Süre: {service.durationMinutes} dk
            </Typography>
            <Typography variant="h6" component="p" sx={{ mt: 1, fontWeight: 'bold', color: 'primary.main' }}>
              💰 {service.price} TL
            </Typography>
          </Box>
        </CardContent>
        <CardActions sx={{ padding: 2, pt: 0, mt: 'auto' }}>
          <Button 
            size="medium" 
            variant="contained" 
            onClick={handleBookClick}
            fullWidth
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Randevu Al
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
};

export default ServiceCard;
