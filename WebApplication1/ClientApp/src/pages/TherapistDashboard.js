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
import 'dayjs/locale/tr';

// Set dayjs locale to Turkish
dayjs.locale('tr');

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
    // This would be implemented with specific API endpoints
    // For now, calculate from existing data
    const today = dayjs().format('YYYY-MM-DD');
    const todayAppointments = appointments.filter(a => 
      dayjs(a.availabilitySlot?.startTime).format('YYYY-MM-DD') === today
    ).length;

    setStats({
      totalAppointments: appointments.length,
      todayAppointments: todayAppointments,
      weeklyRevenue: appointments.length * 250, // Estimated
      nextAppointment: appointments.find(a => 
        dayjs(a.availabilitySlot?.startTime).isAfter(dayjs())
      )
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
      const availabilityData = {
        therapistId: therapistProfile.id,
        date: dayjs(availabilityForm.date).format('YYYY-MM-DD'),
        startTime: dayjs(availabilityForm.startTime).format('HH:mm:ss'),
        endTime: dayjs(availabilityForm.endTime).format('HH:mm:ss'),
        isBooked: false
      };

      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availabilityData)
      });

      if (response.ok) {
        fetchAvailabilitySlots();
        setAvailabilityDialog(false);
        showNotification('Müsaitlik başarıyla eklendi!', 'success');
        setAvailabilityForm({
          date: null,
          startTime: null,
          endTime: null,
          isBooked: false
        });
      }
    } catch (error) {
      showNotification('Müsaitlik eklenirken hata oluştu!', 'error');
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const formatTime = (timeString) => {
    return dayjs(timeString, 'HH:mm:ss').format('HH:mm');
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
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #8B6F47 0%, #A0845C 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">{stats.totalAppointments}</Typography>
                    <Typography variant="body2">Toplam Randevu</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #D4B896 0%, #E8D4B0 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 40, mr: 2, color: '#8B6F47' }} />
                  <Box>
                    <Typography variant="h4" component="div" sx={{ color: '#8B6F47' }}>{stats.todayAppointments}</Typography>
                    <Typography variant="body2" sx={{ color: '#8B6F47' }}>Bugünkü Randevu</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #F5F1E8 0%, #FFFFFF 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StatsIcon sx={{ fontSize: 40, mr: 2, color: '#8B6F47' }} />
                  <Box>
                    <Typography variant="h4" component="div" sx={{ color: '#8B6F47' }}>₺{stats.weeklyRevenue}</Typography>
                    <Typography variant="body2" sx={{ color: '#8B6F47' }}>Haftalık Gelir</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: '2px solid #8B6F47' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DashboardIcon sx={{ fontSize: 40, mr: 2, color: '#8B6F47' }} />
                  <Box>
                    <Typography variant="h6" component="div" sx={{ color: '#8B6F47' }}>
                      {stats.nextAppointment ? formatTime(stats.nextAppointment.appointmentDate) : 'Yok'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8B6F47' }}>Sonraki Randevu</Typography>
                  </Box>
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
          <DialogTitle>Yeni Müsaitlik Ekle</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <DatePicker
                label="Tarih"
                value={availabilityForm.date}
                onChange={(newValue) => setAvailabilityForm({ ...availabilityForm, date: newValue })}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                minDate={dayjs()}
              />
              <TimePicker
                label="Başlangıç Saati"
                value={availabilityForm.startTime}
                onChange={(newValue) => setAvailabilityForm({ ...availabilityForm, startTime: newValue })}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
              <TimePicker
                label="Bitiş Saati"
                value={availabilityForm.endTime}
                onChange={(newValue) => setAvailabilityForm({ ...availabilityForm, endTime: newValue })}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAvailabilityDialog(false)} startIcon={<CancelIcon />}>İptal</Button>
            <Button 
              onClick={handleAvailabilitySave} 
              variant="contained" 
              startIcon={<SaveIcon />}
              sx={{ backgroundColor: '#8B6F47', '&:hover': { backgroundColor: '#6B5437' } }}
              disabled={!availabilityForm.date || !availabilityForm.startTime || !availabilityForm.endTime}
            >
              Kaydet
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