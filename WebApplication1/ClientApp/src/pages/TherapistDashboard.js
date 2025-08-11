import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Assessment as StatsIcon
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/tr';

// Timezone ve locale ayarları
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('tr');

// Türkiye saati için timezone ayarı
const TIMEZONE = 'Europe/Istanbul';

function TherapistDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [therapistProfile, setTherapistProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    weeklyRevenue: 0,
    nextAppointment: null
  });

  // Dialog states
  const [profileDialog, setProfileDialog] = useState(false);
  const [availabilityDialog, setAvailabilityDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState({});
  const [availabilityForm, setAvailabilityForm] = useState({
    date: null,
    startTime: null,
    endTime: null,
    isBooked: false
  });

  // Notification
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchTherapistData();
  }, []);

  // Separate useEffect for appointments and slots that depends on therapistProfile
  useEffect(() => {
    if (therapistProfile?.id) {
      fetchAppointments();
      fetchAvailabilitySlots();
    }
  }, [therapistProfile]);

  // Separate useEffect for stats that depends on appointments
  useEffect(() => {
    if (appointments.length >= 0) {
      fetchStats();
    }
  }, [appointments]);

  const fetchTherapistData = async () => {
    try {
      const response = await fetch('/api/therapists');
      const therapists = await response.json();
      console.log('Therapists data:', therapists);
      console.log('Current user:', user);
      
      // Try multiple ways to find the therapist
      let myProfile = therapists.find(t => t.user?.id === user.id);
      if (!myProfile) {
        // Fallback: find by name match
        myProfile = therapists.find(t => 
          t.name.toLowerCase().includes(user.name.toLowerCase()) ||
          user.email.includes('therapist')
        );
      }
      if (!myProfile) {
        // Last resort: if only one therapist and user has therapist email
        if (therapists.length === 1 && user.email.includes('@therapist.lor-masaj.com')) {
          myProfile = therapists[0];
        }
      }
      
      console.log('My profile:', myProfile);
      setTherapistProfile(myProfile);
      setEditingProfile(myProfile || {});
    } catch (error) {
      console.error('Terapist profili yüklenirken hata:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const allAppointments = await response.json();
      console.log('All appointments:', allAppointments);
      console.log('Therapist profile:', therapistProfile);
      
      // Filter appointments for this therapist - use therapist.id from nested object
      const myAppointments = allAppointments.filter(a => {
        console.log('Comparing:', a.therapist?.id, 'with', therapistProfile?.id);
        return a.therapist?.id === therapistProfile?.id;
      });
      console.log('My appointments after filter:', myAppointments);
      console.log('Total appointments:', allAppointments.length);
      setAppointments(myAppointments);
    } catch (error) {
      console.error('Randevular yüklenirken hata:', error);
    }
  };

  const fetchAvailabilitySlots = async () => {
    try {
      const response = await fetch('/api/availability');
      const allSlots = await response.json();
      console.log('All slots:', allSlots);
      
      // Filter slots for this therapist - use therapist.id from nested object
      const mySlots = allSlots.filter(slot => slot.therapist?.id === therapistProfile?.id);
      console.log('My slots:', mySlots);
      setAvailabilitySlots(mySlots);
    } catch (error) {
      console.error('Müsaitlik bilgileri yüklenirken hata:', error);
    }
  };

  const fetchStats = async () => {
    // Türkiye saati ile tarih karşılaştırması
    const today = dayjs().tz(TIMEZONE).format('YYYY-MM-DD');
    const todayAppointments = appointments.filter(a => 
      dayjs(a.availabilitySlot?.startTime).tz(TIMEZONE).format('YYYY-MM-DD') === today
    ).length;

    // Gerçek gelir hesaplama - servis fiyatlarını kullanarak
    const weeklyRevenue = appointments
      .filter(a => {
        const appointmentDate = dayjs(a.availabilitySlot?.startTime).tz(TIMEZONE);
        const weekAgo = dayjs().tz(TIMEZONE).subtract(7, 'day');
        return appointmentDate.isAfter(weekAgo);
      })
      .reduce((total, appointment) => {
        return total + (appointment.service?.price || 0);
      }, 0);

    // Sonraki randevu - Türkiye saati ile
    const nextAppointment = appointments.find(a => 
      dayjs(a.availabilitySlot?.startTime).tz(TIMEZONE).isAfter(dayjs().tz(TIMEZONE))
    );

    console.log('Stats calculation:', { 
      totalAppointments: appointments.length, 
      todayAppointments, 
      weeklyRevenue,
      nextAppointment 
    });

    setStats({
      totalAppointments: appointments.length,
      todayAppointments: todayAppointments,
      weeklyRevenue: weeklyRevenue,
      nextAppointment: nextAppointment
    });
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleProfileSave = async () => {
    try {
      const response = await fetch(`/api/therapists/${therapistProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProfile)
      });

      if (response.ok) {
        setTherapistProfile(editingProfile);
        setProfileDialog(false);
        showNotification('Profil başarıyla güncellendi!', 'success');
      }
    } catch (error) {
      showNotification('Profil güncellenirken hata oluştu!', 'error');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/therapists/${therapistProfile.id}/upload-picture`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setEditingProfile({ ...editingProfile, profilePictureUrl: result.profilePictureUrl });
        showNotification('Profil fotoğrafı başarıyla yüklendi!', 'success');
      }
    } catch (error) {
      showNotification('Fotoğraf yüklenirken hata oluştu!', 'error');
    }
  };

  const handleAvailabilitySave = async () => {
    try {
      // Tarih ve saati Türkiye saati ile birleştir
      const selectedDate = dayjs(availabilityForm.date).tz(TIMEZONE);
      const startTime = dayjs(availabilityForm.startTime);
      const endTime = dayjs(availabilityForm.endTime);
      
      // Tarih + saat birleştirme (Türkiye saati)
      const startDateTime = selectedDate
        .hour(startTime.hour())
        .minute(startTime.minute())
        .second(0)
        .millisecond(0)
        .tz(TIMEZONE);
        
      const endDateTime = selectedDate
        .hour(endTime.hour())
        .minute(endTime.minute())
        .second(0)
        .millisecond(0)
        .tz(TIMEZONE);

      console.log('Frontend - Start DateTime (Turkey):', startDateTime.format());
      console.log('Frontend - End DateTime (Turkey):', endDateTime.format());
      console.log('Frontend - Start DateTime (UTC):', startDateTime.utc().toISOString());
      console.log('Frontend - End DateTime (UTC):', endDateTime.utc().toISOString());

      const availabilityData = {
        therapistId: therapistProfile.id,
        startTime: startDateTime.utc().toISOString(), // UTC olarak gönder
        endTime: endDateTime.utc().toISOString(),     // UTC olarak gönder
        isBooked: false
      };

      console.log('Sending availability data:', availabilityData);

      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availabilityData)
      });

      if (response.ok) {
        console.log('Availability saved successfully');
        fetchAvailabilitySlots();
        setAvailabilityDialog(false);
        showNotification('Müsaitlik başarıyla eklendi!', 'success');
        setAvailabilityForm({
          date: null,
          startTime: null,
          endTime: null,
          isBooked: false
        });
      } else {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        showNotification('Müsaitlik eklenirken hata oluştu: ' + errorData, 'error');
      }
    } catch (error) {
      console.error('Frontend Error:', error);
      showNotification('Müsaitlik eklenirken hata oluştu: ' + error.message, 'error');
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const formatDate = (dateString) => {
    const result = dayjs(dateString).tz(TIMEZONE).format('DD/MM/YYYY');
    console.log('formatDate Debug:', { input: dateString, output: result, timezone: TIMEZONE });
    return result;
  };

  const formatTime = (timeString) => {
    // UTC olarak parse edip Türkiye saatine çevir
    const utcTime = dayjs.utc(timeString);
    const turkeyTime = utcTime.tz(TIMEZONE);
    const result = turkeyTime.format('HH:mm');
    
    console.log('formatTime Debug:', { 
      input: timeString, 
      utcTime: utcTime.format(), 
      turkeyTime: turkeyTime.format(), 
      output: result,
      timezone: TIMEZONE 
    });
    
    return result;
  };

  // Tab Panel Component
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#8B6F47', fontWeight: 'bold' }}>
            Terapist Paneli
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Hoş geldin, {user.name}! Burada profilini ve randevularını yönetebilirsin.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Toplam Randevu */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(145deg, #8B6F47 0%, #6B5437 100%)', 
              color: 'white',
              height: '140px',
              boxShadow: '0 8px 32px rgba(139, 111, 71, 0.3)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(139, 111, 71, 0.4)'
              }
            }}>
              <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '50%', 
                  p: 2, 
                  mr: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <EventIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {stats.totalAppointments}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                    Toplam Randevu
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Bugünkü Randevu */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(145deg, #FF6B6B 0%, #EE5A52 100%)', 
              color: 'white',
              height: '140px',
              boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(255, 107, 107, 0.4)'
              }
            }}>
              <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '50%', 
                  p: 2, 
                  mr: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ScheduleIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {stats.todayAppointments}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                    Bugünkü Randevu
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Haftalık Gelir */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(145deg, #4ECDC4 0%, #44A08D 100%)', 
              color: 'white',
              height: '140px',
              boxShadow: '0 8px 32px rgba(78, 205, 196, 0.3)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(78, 205, 196, 0.4)'
              }
            }}>
              <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '50%', 
                  p: 2, 
                  mr: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <StatsIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '1.8rem' }}>
                    ₺{stats.weeklyRevenue?.toLocaleString('tr-TR') || '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                    Haftalık Gelir
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sonraki Randevu */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)', 
              color: 'white',
              height: '140px',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(102, 126, 234, 0.4)'
              }
            }}>
              <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '50%', 
                  p: 2, 
                  mr: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DashboardIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '1.8rem' }}>
                    {stats.nextAppointment ? formatTime(stats.nextAppointment.availabilitySlot?.startTime) : 'Yok'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                    Sonraki Randevu
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="therapist dashboard tabs">
              <Tab label="Profil Yönetimi" icon={<PersonIcon />} />
              <Tab label="Randevularım" icon={<EventIcon />} />
              <Tab label="Müsaitlik" icon={<ScheduleIcon />} />
            </Tabs>
          </Box>

          {/* Profile Management Tab */}
          <TabPanel value={currentTab} index={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={therapistProfile?.profilePictureUrl}
                sx={{ width: 100, height: 100, mr: 3, border: '3px solid #8B6F47' }}
              >
                {therapistProfile?.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ color: '#8B6F47', fontWeight: 'bold' }}>
                  {therapistProfile?.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {therapistProfile?.bio}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setProfileDialog(true)}
                  sx={{ backgroundColor: '#8B6F47', '&:hover': { backgroundColor: '#6B5437' } }}
                >
                  Profili Düzenle
                </Button>
              </Box>
            </Box>
          </TabPanel>

          {/* Appointments Tab */}
          <TabPanel value={currentTab} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F1E8' }}>
                    <TableCell><strong>Tarih</strong></TableCell>
                    <TableCell><strong>Saat</strong></TableCell>
                    <TableCell><strong>Müşteri</strong></TableCell>
                    <TableCell><strong>Hizmet</strong></TableCell>
                    <TableCell><strong>Durum</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{formatDate(appointment.availabilitySlot?.startTime)}</TableCell>
                      <TableCell>{formatTime(appointment.availabilitySlot?.startTime)}</TableCell>
                      <TableCell>{appointment.customer?.name} {appointment.customer?.surname}</TableCell>
                      <TableCell>{appointment.service?.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={dayjs(appointment.availabilitySlot?.startTime).isAfter(dayjs()) ? 'Yaklaşan' : 'Tamamlandı'}
                          color={dayjs(appointment.availabilitySlot?.startTime).isAfter(dayjs()) ? 'primary' : 'success'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Availability Tab */}
          <TabPanel value={currentTab} index={2}>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<ScheduleIcon />}
                onClick={() => setAvailabilityDialog(true)}
                sx={{ backgroundColor: '#8B6F47', '&:hover': { backgroundColor: '#6B5437' } }}
              >
                Yeni Müsaitlik Ekle
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F1E8' }}>
                    <TableCell><strong>Tarih</strong></TableCell>
                    <TableCell><strong>Başlangıç</strong></TableCell>
                    <TableCell><strong>Bitiş</strong></TableCell>
                    <TableCell><strong>Durum</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availabilitySlots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell>{formatDate(slot.startTime)}</TableCell>
                      <TableCell>{formatTime(slot.startTime)}</TableCell>
                      <TableCell>{formatTime(slot.endTime)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={slot.isBooked ? 'Rezerve' : 'Müsait'}
                          color={slot.isBooked ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>

        {/* Profile Edit Dialog */}
        <Dialog open={profileDialog} onClose={() => setProfileDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Profil Düzenle</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Avatar
                src={editingProfile?.profilePictureUrl}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2, border: '3px solid #8B6F47' }}
              >
                {editingProfile?.name?.charAt(0)}
              </Avatar>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="profile-upload"
              />
              <label htmlFor="profile-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ borderColor: '#8B6F47', color: '#8B6F47' }}
                >
                  Fotoğraf Yükle
                </Button>
              </label>
            </Box>
            <TextField
              fullWidth
              label="Ad Soyad"
              value={editingProfile?.name || ''}
              onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Biyografi"
              multiline
              rows={4}
              value={editingProfile?.bio || ''}
              onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProfileDialog(false)} startIcon={<CancelIcon />}>İptal</Button>
            <Button 
              onClick={handleProfileSave} 
              variant="contained" 
              startIcon={<SaveIcon />}
              sx={{ backgroundColor: '#8B6F47', '&:hover': { backgroundColor: '#6B5437' } }}
            >
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>

        {/* Availability Dialog */}
        <Dialog open={availabilityDialog} onClose={() => setAvailabilityDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ 
            backgroundColor: '#F5F1E8', 
            color: '#8B6F47', 
            fontWeight: 'bold',
            borderBottom: '2px solid #D4B896',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <ScheduleIcon sx={{ color: '#8B6F47' }} />
            Yeni Müsaitlik Ekle
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#F5F1E8', pt: 3, pb: 2 }}>
            <Grid container spacing={2} direction="column">
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                  <DatePicker
                    label="Tarih *"
                    value={availabilityForm.date}
                    onChange={(newValue) => {
                      if (newValue) {
                        const startTime = newValue.hour(9).minute(0); // Varsayılan 09:00
                        const endTime = newValue.hour(10).minute(0);   // Varsayılan 10:00
                        setAvailabilityForm({ 
                          ...availabilityForm, 
                          date: newValue,
                          startTime: startTime,
                          endTime: endTime
                        });
                      }
                    }}
                    minDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#D4B896',
                            },
                            '&:hover fieldset': {
                              borderColor: '#8B6F47',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#8B6F47',
                            },
                          },
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                  <TimePicker
                    label="Başlangıç Saati *"
                    value={availabilityForm.startTime}
                    onChange={(newValue) => {
                      if (newValue && availabilityForm.date) {
                        const updatedStartTime = availabilityForm.date.hour(newValue.hour()).minute(newValue.minute());
                        const updatedEndTime = updatedStartTime.add(1, 'hour'); // 1 saat sonrası
                        setAvailabilityForm({ 
                          ...availabilityForm, 
                          startTime: updatedStartTime,
                          endTime: updatedEndTime
                        });
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#D4B896',
                            },
                            '&:hover fieldset': {
                              borderColor: '#8B6F47',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#8B6F47',
                            },
                          },
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                  <TimePicker
                    label="Bitiş Saati *"
                    value={availabilityForm.endTime}
                    onChange={(newValue) => {
                      if (newValue && availabilityForm.date) {
                        const updatedEndTime = availabilityForm.date.hour(newValue.hour()).minute(newValue.minute());
                        setAvailabilityForm({ 
                          ...availabilityForm, 
                          endTime: updatedEndTime
                        });
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#D4B896',
                            },
                            '&:hover fieldset': {
                              borderColor: '#8B6F47',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#8B6F47',
                            },
                          },
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ 
                  backgroundColor: '#D4B896', 
                  p: 2, 
                  borderRadius: 1,
                  border: '1px solid #8B6F47'
                }}>
                  <Typography variant="body2" sx={{ color: '#8B6F47', fontWeight: 'bold', mb: 1 }}>
                    💡 Bilgi:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8B6F47' }}>
                    • Tarih seçtiğinizde otomatik olarak 09:00-10:00 arası ayarlanır
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8B6F47' }}>
                    • Başlangıç saatini değiştirdiğinizde bitiş saati 1 saat sonrasına ayarlanır
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8B6F47' }}>
                    • Bitiş saatini manuel olarak değiştirebilirsiniz
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            backgroundColor: '#F5F1E8', 
            p: 3, 
            borderTop: '2px solid #D4B896',
            gap: 2
          }}>
            <Button 
              onClick={() => setAvailabilityDialog(false)} 
              sx={{ 
                color: '#8B6F47',
                border: '1px solid #8B6F47',
                '&:hover': {
                  backgroundColor: '#8B6F47',
                  color: 'white'
                }
              }}
            >
              İptal
            </Button>
            <Button 
              onClick={handleAvailabilitySave}
              variant="contained"
              disabled={!availabilityForm.date || !availabilityForm.startTime || !availabilityForm.endTime}
              sx={{ 
                backgroundColor: '#8B6F47', 
                '&:hover': { backgroundColor: '#6B5437' },
                '&:disabled': {
                  backgroundColor: '#D4B896',
                  color: '#8B6F47'
                }
              }}
            >
              Ekle
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert 
            onClose={() => setNotification({ ...notification, open: false })} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
}

export default TherapistDashboard;