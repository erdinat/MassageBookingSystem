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
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Person as PersonIcon,
  Psychology as ExpertIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';

function TherapistsPage() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteTherapists, setFavoriteTherapists] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // API'den terapistleri çek
    fetch('http://localhost:5058/api/therapists')
      .then(response => response.json())
      .then(data => {
        setTherapists(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Terapistler yüklenirken hata:', error);
        setLoading(false);
      });

    // Kullanıcı giriş yapmışsa favori terapistleri çek
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    if (user.id && user.role === 'Customer') {
      fetchFavoriteTherapists(user.id);
    }
  }, []);

  const fetchFavoriteTherapists = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5058/api/auth/favorites/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          if (data.success && data.favoriteTherapists) {
            setFavoriteTherapists(data.favoriteTherapists);
          }
        } catch (error) {
          console.error('JSON parse error:', error);
        }
      }
    } catch (error) {
      console.error('Favori terapistler yüklenirken hata:', error);
    }
  };

  const handleToggleFavorite = async (therapistId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        setNotification({ open: true, message: 'Favori eklemek için giriş yapmalısınız.', severity: 'warning' });
        return;
      }

      if (user.role !== 'Customer') {
        setNotification({ open: true, message: 'Sadece müşteriler favori terapist ekleyebilir.', severity: 'warning' });
        return;
      }

      const token = localStorage.getItem('token');
      const isFavorite = favoriteTherapists.some(ft => ft.id === therapistId);
      
      const url = isFavorite 
        ? `http://localhost:5058/api/auth/favorites/${user.id}/remove/${therapistId}`
        : `http://localhost:5058/api/auth/favorites/${user.id}/add/${therapistId}`;
      
      const method = isFavorite ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotification({ open: true, message: data.message, severity: 'success' });
        
        // Favori listesini güncelle
        if (isFavorite) {
          setFavoriteTherapists(prev => prev.filter(ft => ft.id !== therapistId));
        } else {
          const therapist = therapists.find(t => t.id === therapistId);
          if (therapist) {
            setFavoriteTherapists(prev => [...prev, therapist]);
          }
        }
      } else {
        try {
          const data = await response.json();
          setNotification({ open: true, message: data.message || 'Bir hata oluştu.', severity: 'error' });
        } catch (error) {
          setNotification({ open: true, message: `HTTP ${response.status}: ${response.statusText}`, severity: 'error' });
        }
      }
    } catch (error) {
      console.error('Favori işlemi sırasında hata:', error);
      setNotification({ open: true, message: 'Bir hata oluştu.', severity: 'error' });
    }
  };

  const isFavorite = (therapistId) => {
    return favoriteTherapists.some(ft => ft.id === therapistId);
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

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
              <Grid item xs={12} md={6} key={therapist.id} sx={{ display: 'flex' }}>
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
                  height: '350px',
                  position: 'relative'
                }}>
                  {currentUser && currentUser.role === 'Customer' && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                      <Tooltip title={isFavorite(therapist.id) ? "Favorilerden Kaldır" : "Favorilere Ekle"}>
                        <IconButton 
                          onClick={() => handleToggleFavorite(therapist.id)}
                          sx={{ 
                            color: isFavorite(therapist.id) ? '#C62828' : '#8B6F47',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 1)',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          {isFavorite(therapist.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
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

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleNotificationClose} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleNotificationClose} severity={notification.severity} sx={{ width: '100%' }} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TherapistsPage;