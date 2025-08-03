import React, { useState, useEffect } from 'react';
import { Grid, CircularProgress, Box, Typography } from '@mui/material';
import TherapistCard from './TherapistCard';

const TherapistList = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await fetch('/api/therapists');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTherapists(data);
      } catch (error) {
        console.error("Terapistler çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
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
        Terapistlerimiz
      </Typography>
      <Grid container spacing={4}>
        {therapists.map((therapist) => (
          <TherapistCard key={therapist.id} therapist={therapist} />
        ))}
      </Grid>
    </>
  );
};

export default TherapistList; 