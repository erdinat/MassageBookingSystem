import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const TherapistCard = ({ therapist }) => {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {therapist.name}
          </Typography>
          <Typography color="text.secondary">
            {therapist.bio}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default TherapistCard; 