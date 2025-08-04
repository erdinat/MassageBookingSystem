import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Avatar,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  Person as PersonIcon,
  Psychology as ExpertIcon,
  Star as StarIcon
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
    <Box>
      {/* Hero Section for Therapists */}
      <Box sx={{ 
        backgroundColor: '#F5F1E8', 
        py: 6,
        backgroundImage: 'linear-gradient(135deg, #F5F1E8 0%, #D4B896 100%)'
      }}>
        <Container>
          <Typography variant="h3" component="h1" align="center" sx={{ 
            color: '#8B6F47', 
            fontWeight: 'bold',
            mb: 2
          }}>
            Uzman Terapistlerimiz
          </Typography>
          
          <Typography variant="h6" component="p" align="center" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Alanında uzman ve sertifikalı terapistlerimizle en iyi masaj deneyimini yaşayın
          </Typography>
        </Container>
      </Box>

      <Container sx={{ mt: 6, mb: 4 }}>
        <Grid container spacing={4} alignItems="stretch">
          {therapists.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ 
                backgroundColor: '#F5F1E8', 
                border: '1px solid #D4B896',
                textAlign: 'center',
                py: 6
              }}>
                <CardContent>
                  <PersonIcon sx={{ fontSize: 80, color: '#8B6F47', mb: 2 }} />
                  <Typography variant="h5" sx={{ color: '#8B6F47', mb: 2 }}>
                    Henüz terapist eklenmemiş
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Postman ile /api/therapists endpoint'ine POST isteği göndererek terapist ekleyebilirsiniz.
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Örnek terapist verisi:
                    </Typography>
                    <Box sx={{ 
                      backgroundColor: 'rgba(139, 111, 71, 0.1)', 
                      p: 2, 
                      mt: 1, 
                      borderRadius: 1,
                      textAlign: 'left',
                      fontFamily: 'monospace'
                    }}>
                      {`{
  "name": "Ahmet Yılmaz",
  "bio": "10 yıllık deneyimli masaj terapisti",
  "profilePictureUrl": ""
}`}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            therapists.map((therapist) => (
              <Grid item xs={12} md={6} lg={4} key={therapist.id} sx={{ display: 'flex' }}>
                <Card sx={{ 
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': { 
                    boxShadow: 8,
                    transform: 'translateY(-4px)' 
                  },
                  transition: 'all 0.3s ease',
                  backgroundColor: '#FEFEFE',
                  border: '1px solid #E0E0E0',
                  height: '350px'
                }}>
                  <CardContent sx={{ 
                    textAlign: 'center',
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    <Avatar
                      src={therapist.profilePictureUrl}
                      sx={{
                        width: 100,
                        height: 100,
                        mx: 'auto',
                        mb: 1,
                        backgroundColor: '#8B6F47',
                        border: '3px solid #8B6F47'
                      }}
                    >
                      {therapist.profilePictureUrl ? null : <PersonIcon sx={{ fontSize: 50, color: '#F5F1E8' }} />}
                    </Avatar>
                    
                    <Typography variant="h6" sx={{ 
                      color: '#8B6F47', 
                      fontWeight: 'bold'
                    }}>
                      {therapist.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      lineHeight: 1.6,
                      flexGrow: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {therapist.bio}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 'auto' }}>
                      <Chip 
                        icon={<ExpertIcon />}
                        label="Uzman" 
                        size="small"
                        sx={{ 
                          backgroundColor: '#8B6F47', 
                          color: 'white',
                          fontWeight: 'bold'
                        }} 
                      />
                      <Chip 
                        icon={<StarIcon />}
                        label="Sertifikalı" 
                        size="small"
                        sx={{ 
                          backgroundColor: '#D4B896', 
                          color: '#8B6F47',
                          fontWeight: 'bold'
                        }} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}

export default TherapistsPage;