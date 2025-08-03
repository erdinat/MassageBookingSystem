import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Avatar,
  CircularProgress
} from '@mui/material';
import { 
  Person as PersonIcon 
} from '@mui/icons-material';

function TherapistsPage() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API'den terapistleri çek
    fetch('/api/therapists')
      .then(response => response.json())
      .then(data => {
        setTherapists(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Terapistler yüklenirken hata:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#8B6F47' }} />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: '#8B6F47' }}>
        Terapistlerimiz
      </Typography>
      
      <Typography variant="h6" component="p" gutterBottom align="center" color="text.secondary">
        Deneyimli ve profesyonel terapist kadromuz
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {therapists.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: '#F5F1E8', border: '1px solid #D4B896' }}>
              <CardContent>
                <Typography variant="h6" align="center" sx={{ color: '#8B6F47' }}>
                  Henüz terapist eklenmemiş
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                  Postman ile /api/therapists endpoint'ine POST isteği göndererek terapist ekleyebilirsiniz.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          therapists.map((therapist) => (
            <Grid item xs={12} md={6} lg={4} key={therapist.id}>
              <Card sx={{ 
                height: '100%', 
                '&:hover': { boxShadow: 6 },
                backgroundColor: '#F5F1E8',
                border: '1px solid #D4B896'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={therapist.profilePictureUrl}
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        mb: 2, 
                        backgroundColor: '#8B6F47',
                        border: '3px solid #8B6F47'
                      }}
                    >
                      {therapist.profilePictureUrl ? null : <PersonIcon sx={{ fontSize: 40, color: '#F5F1E8' }} />}
                    </Avatar>
                    
                    <Typography variant="h6" align="center" sx={{ color: '#8B6F47' }}>
                      {therapist.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" align="center">
                    {therapist.bio}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

export default TherapistsPage; 