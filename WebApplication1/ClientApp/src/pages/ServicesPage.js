import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Chip,
  CircularProgress,
  Button,
  CardActions
} from '@mui/material';
import { 
  Spa as SpaIcon,
  Schedule as TimeIcon,
  Euro as PriceIcon,
  CalendarToday as BookIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API'den hizmetleri çek
    fetch('/api/services')
      .then(response => response.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Hizmetler yüklenirken hata:', error);
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
      {/* Hero Section for Services */}
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
            Hizmetlerimiz
          </Typography>
          
          <Typography variant="h6" component="p" align="center" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Profesyonel masaj hizmetlerimizi keşfedin ve kendinize en uygun olanını seçin
          </Typography>
        </Container>
      </Box>

      <Container sx={{ mt: 6, mb: 4 }}>
        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {services.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ 
                backgroundColor: '#F5F1E8', 
                border: '1px solid #D4B896',
                textAlign: 'center',
                py: 6
              }}>
                <CardContent>
                  <SpaIcon sx={{ fontSize: 80, color: '#8B6F47', mb: 2 }} />
                  <Typography variant="h5" sx={{ color: '#8B6F47', mb: 2 }}>
                    Henüz hizmet eklenmemiş
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Postman ile /api/services endpoint'ine POST isteği göndererek hizmet ekleyebilirsiniz.
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Örnek hizmet verisi:
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
  "name": "İsveç Masajı",
  "description": "Rahatlatıcı ve stres azaltıcı geleneksel İsveç masajı",
  "durationMinutes": 60,
  "price": 250.00
}`}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            services.map((service) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={service.id}>
                <Card sx={{ 
                  height: '320px', // SABİT YÜKSEKLİK
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': { 
                    boxShadow: 8,
                    transform: 'translateY(-5px)'
                  },
                  backgroundColor: '#F5F1E8',
                  border: '1px solid #D4B896',
                  transition: 'all 0.3s ease',
                  borderRadius: 2
                }}>
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SpaIcon sx={{ color: '#8B6F47', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ color: '#8B6F47', fontWeight: 'bold' }}>
                        {service.name}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        lineHeight: 1.5, 
                        flexGrow: 1,
                        mb: 2,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {service.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip 
                        icon={<TimeIcon />} 
                        label={`${service.durationMinutes} dk`} 
                        size="small"
                        sx={{ 
                          backgroundColor: '#D4B896', 
                          color: '#8B6F47',
                          fontWeight: 'bold',
                          '& .MuiChip-icon': { color: '#8B6F47' }
                        }}
                      />
                      <Chip 
                        icon={<PriceIcon />} 
                        label={`₺${service.price}`} 
                        size="small"
                        sx={{ 
                          backgroundColor: '#8B6F47', 
                          color: '#F5F1E8',
                          fontWeight: 'bold',
                          '& .MuiChip-icon': { color: '#F5F1E8' }
                        }}
                      />
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0, mt: 'auto' }}>
                    <Button
                      component={RouterLink}
                      to={`/booking/${service.id}`}
                      variant="contained"
                      fullWidth
                      size="medium"
                      startIcon={<BookIcon />}
                      sx={{
                        backgroundColor: '#8B6F47',
                        color: '#F5F1E8',
                        py: 1,
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: '#6B5437',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(139, 111, 71, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Randevu Al
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}

export default ServicesPage;
