import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Box, Typography, TextField, Button, Grid, Paper, Snackbar, Alert,
  Divider, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Tooltip, Avatar
} from '@mui/material';
import {
  Edit as EditIcon, Save as SaveIcon, Lock as LockIcon, Favorite as FavoriteIcon,
  Delete as DeleteIcon, AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const ProfilePage = () => {
  const [user, setUser] = useState({ name: '', surname: '', email: '', phone: '' });
  const [favoriteTherapists, setFavoriteTherapists] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !currentUser.id) {
        navigate('/auth');
        return;
      }
      
      const response = await fetch(`/api/auth/profile/${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setUser({
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone || '',
      });
      setFavoriteTherapists(data.favoriteTherapists || []);
    } catch (error) {
      console.error('Kullanıcı verileri alınamadı', error);
      setNotification({ open: true, message: 'Kullanıcı verileri alınamadı.', severity: 'error' });
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/auth/profile/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(user)
      });
      
      if (!response.ok) {
        throw new Error('Profil güncellenemedi');
      }
      
      setNotification({ open: true, message: 'Profil başarıyla güncellendi!', severity: 'success' });
      setEditMode(false);
      // Update user info in localStorage
      const localUser = JSON.parse(localStorage.getItem('user'));
      localUser.name = user.name;
      localUser.surname = user.surname;
      localStorage.setItem('user', JSON.stringify(localUser));
      window.dispatchEvent(new Event('storage')); // Notify other components of change
    } catch (error) {
      setNotification({ open: true, message: 'Profil güncellenemedi.', severity: 'error' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotification({ open: true, message: 'Yeni şifreler eşleşmiyor.', severity: 'warning' });
      return;
    }
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/auth/change-password/${currentUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
          confirmNewPassword: passwordData.confirmPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Şifre değiştirilemedi');
      }
      
      setNotification({ open: true, message: 'Şifre başarıyla değiştirildi!', severity: 'success' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setNotification({ open: true, message: error.message || 'Şifre değiştirilemedi.', severity: 'error' });
    }
  };
  
  const handleRemoveFavorite = async (therapistId) => {
    try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch(`/api/auth/favorites/${currentUser.id}/remove/${therapistId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Favori kaldırılamadı');
        }
        
        setNotification({ open: true, message: 'Terapist favorilerden kaldırıldı.', severity: 'success' });
        fetchUserData(); // Refresh list
    } catch (error) {
        setNotification({ open: true, message: 'Favori kaldırılamadı.', severity: 'error' });
    }
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants}>
      <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#8B6F47', textAlign: 'center', mb: 4 }}>
          Profilim
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccountCircleIcon sx={{ fontSize: 40, color: '#8B6F47', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: '600', color: '#5D4037' }}>Kullanıcı Bilgileri</Typography>
                <Tooltip title={editMode ? "Değişiklikleri Kaydet" : "Bilgileri Düzenle"}>
                  <IconButton onClick={editMode ? handleUpdateProfile : () => setEditMode(true)} sx={{ ml: 'auto' }}>
                    {editMode ? <SaveIcon color="primary" /> : <EditIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 3 }}/>
              <form onSubmit={handleUpdateProfile}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Ad" name="name" value={user.name} onChange={handleInputChange} fullWidth disabled={!editMode} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Soyad" name="surname" value={user.surname} onChange={handleInputChange} fullWidth disabled={!editMode} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Email" name="email" value={user.email} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Telefon" name="phone" value={user.phone} onChange={handleInputChange} fullWidth disabled={!editMode} />
                  </Grid>
                </Grid>
              </form>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LockIcon sx={{ fontSize: 40, color: '#8B6F47', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: '600', color: '#5D4037' }}>Şifre Değiştir</Typography>
              </Box>
              <Divider sx={{ mb: 3 }}/>
              <form onSubmit={handleChangePassword}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField type="password" label="Eski Şifre" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} fullWidth />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField type="password" label="Yeni Şifre" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} fullWidth />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField type="password" label="Yeni Şifre (Tekrar)" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} fullWidth />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" sx={{ 
                      backgroundColor: '#8B6F47', 
                      '&:hover': { backgroundColor: '#A0825A' } 
                    }}>
                      Şifreyi Güncelle
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.8)', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FavoriteIcon sx={{ fontSize: 40, color: '#C62828', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: '600', color: '#5D4037' }}>Favori Terapistler</Typography>
              </Box>
              <Divider sx={{ mb: 2 }}/>
              {favoriteTherapists.length > 0 ? (
                <List>
                  {favoriteTherapists.map(therapist => (
                    <motion.div key={therapist.id} layout>
                        <ListItem>
                            <Avatar sx={{ mr: 2, bgcolor: '#8B6F47' }}>{therapist.name.charAt(0)}</Avatar>
                            <ListItemText primary={therapist.name} secondary={therapist.bio} />
                            <ListItemSecondaryAction>
                                <Tooltip title="Favorilerden Kaldır">
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFavorite(therapist.id)}>
                                        <DeleteIcon color="error" />
                                    </IconButton>
                                </Tooltip>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </motion.div>
                  ))}
                </List>
              ) : (
                <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
                  Henüz favori terapistiniz bulunmuyor.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleNotificationClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={handleNotificationClose} severity={notification.severity} sx={{ width: '100%' }} variant="filled">
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </motion.div>
  );
};

export default ProfilePage;
