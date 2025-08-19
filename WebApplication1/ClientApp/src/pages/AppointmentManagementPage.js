import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Grid,
  Button,
  Chip,
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
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
  Spa as ServiceIcon,
  Euro as PriceIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CompletedIcon,
  AccessTime as ClockIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

function AppointmentManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState({
    upcoming: [],
    past: []
  });
  const [loading, setLoading] = useState(true);
  const [customerEmail, setCustomerEmail] = useState('');
  const [emailEntered, setEmailEntered] = useState(false);

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!user;
  
  // Reschedule Dialog States
  const [rescheduleDialog, setRescheduleDialog] = useState({
    open: false,
    appointment: null
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState('');
  
  // Notification States
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Different Email Dialog
  const [differentEmailDialog, setDifferentEmailDialog] = useState({
    open: false,
    email: ''
  });

  const loadAppointments = async () => {
    if (!customerEmail) return;
    
    setLoading(true);
    try {
      const [upcomingRes, pastRes] = await Promise.all([
        fetch(`/api/appointments/customer/${encodeURIComponent(customerEmail)}/upcoming`),
        fetch(`/api/appointments/customer/${encodeURIComponent(customerEmail)}/past`)
      ]);

      if (upcomingRes.ok && pastRes.ok) {
        const upcomingData = await upcomingRes.json();
        const pastData = await pastRes.json();
        
        setAppointments({
          upcoming: upcomingData,
          past: pastData
        });
      } else {
        showSnackbar('Randevular yüklenirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Randevular yüklenirken hata:', error);
      showSnackbar('Randevular yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTherapists = async () => {
    try {
      const response = await fetch('/api/therapists');
      if (response.ok) {
        const data = await response.json();
        setTherapists(data);
      }
    } catch (error) {
      console.error('Terapistler yüklenirken hata:', error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate || !rescheduleDialog.appointment) return;

    try {
      const response = await fetch('/api/availability');
      if (response.ok) {
        const data = await response.json();
        const filteredSlots = data.filter(slot => 
          !slot.isBooked &&
          dayjs.utc(slot.startTime).tz('Europe/Istanbul').format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD') &&
          (selectedTherapist ? slot.therapistId === parseInt(selectedTherapist) : true)
        );
        setAvailableSlots(filteredSlots);
      }
    } catch (error) {
      console.error('Müsait saatler yüklenirken hata:', error);
    }
  };

  useEffect(() => {
    // If user is logged in, use their email automatically
    if (isLoggedIn) {
      setCustomerEmail(user.email);
      setEmailEntered(true);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (emailEntered) {
      loadAppointments();
    }
  }, [emailEntered, customerEmail]);

  useEffect(() => {
    loadTherapists();
  }, []);

  useEffect(() => {
    loadAvailableSlots();
  }, [selectedDate, selectedTherapist]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (customerEmail.trim()) {
      setEmailEntered(true);
    }
  };

  const openRescheduleDialog = (appointment) => {
    setRescheduleDialog({
      open: true,
      appointment: appointment
    });
    setSelectedTherapist(appointment.therapistId ? appointment.therapistId.toString() : '');
    setSelectedDate(null);
    setSelectedSlot('');
    setAvailableSlots([]);
  };

  const closeRescheduleDialog = () => {
    setRescheduleDialog({
      open: false,
      appointment: null
    });
    setSelectedDate(null);
    setSelectedSlot('');
    setSelectedTherapist('');
    setAvailableSlots([]);
  };

  const handleReschedule = async () => {
    if (!selectedSlot || !rescheduleDialog.appointment) return;

    try {
      const response = await fetch(`/api/appointments/${rescheduleDialog.appointment.id}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newAvailabilitySlotId: parseInt(selectedSlot),
          newTherapistId: selectedTherapist !== (rescheduleDialog.appointment.therapistId ? rescheduleDialog.appointment.therapistId.toString() : '') 
            ? parseInt(selectedTherapist) 
            : null
        })
      });

      if (response.ok) {
        showSnackbar('Randevu başarıyla güncellendi!', 'success');
        closeRescheduleDialog();
        loadAppointments(); // Refresh appointments
      } else {
        const errorData = await response.text();
        showSnackbar(errorData || 'Randevu güncellenirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Randevu güncellenirken hata:', error);
      showSnackbar('Randevu güncellenirken hata oluştu', 'error');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Randevunuzu iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showSnackbar('Randevu başarıyla iptal edildi', 'success');
        loadAppointments(); // Refresh appointments
      } else {
        showSnackbar('Randevu iptal edilirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Randevu iptal edilirken hata:', error);
      showSnackbar('Randevu iptal edilirken hata oluştu', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const AppointmentCard = ({ appointment, showActions = true }) => {
    const appointmentDate = appointment.availabilitySlot?.startTime ? dayjs.utc(appointment.availabilitySlot.startTime).tz('Europe/Istanbul') : null;
    const isUpcoming = appointmentDate ? appointmentDate.isAfter(dayjs()) : false;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          sx={{ 
            mb: 2, 
            backgroundColor: '#F5F1E8',
            border: '2px solid #D4B896',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(139, 111, 71, 0.2)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#8B6F47', fontWeight: 'bold' }}>
                {appointment.service?.name || 'Hizmet belirtilmemiş'}
              </Typography>
              <Chip 
                icon={isUpcoming ? <CalendarIcon /> : <CompletedIcon />}
                label={isUpcoming ? 'Yaklaşan' : 'Tamamlandı'}
                color={isUpcoming ? 'primary' : 'success'}
                sx={{
                  backgroundColor: isUpcoming ? '#8B6F47' : '#4CAF50',
                  color: 'white'
                }}
              />
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#8B6F47', width: 32, height: 32 }}>
                        <CalendarIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Tarih"
                      secondary={appointmentDate ? appointmentDate.format('DD MMMM YYYY') : 'Tarih belirtilmemiş'}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#8B6F47', width: 32, height: 32 }}>
                        <TimeIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Saat"
                      secondary={appointmentDate ? appointmentDate.format('HH:mm') : 'Saat belirtilmemiş'}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#8B6F47', width: 32, height: 32 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Terapist"
                      secondary={appointment.therapist?.name || 'Terapist belirtilmemiş'}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#8B6F47', width: 32, height: 32 }}>
                        <PriceIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Ücret"
                      secondary={`₺${appointment.service?.price || 0}`}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
          
          {showActions && isUpcoming && (
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => openRescheduleDialog(appointment)}
                sx={{
                  color: '#8B6F47',
                  borderColor: '#8B6F47',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 111, 71, 0.1)'
                  }
                }}
                variant="outlined"
              >
                Değiştir
              </Button>
              <Button
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => handleCancelAppointment(appointment.id)}
                sx={{
                  color: '#d32f2f',
                  borderColor: '#d32f2f',
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.1)'
                  }
                }}
                variant="outlined"
              >
                İptal Et
              </Button>
            </CardActions>
          )}
        </Card>
      </motion.div>
    );
  };

  if (isLoggedIn && !emailEntered) {
    // If logged in, don't ask for email, just load data
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#8B6F47' }} />
      </Box>
    );
  }

  if (!isLoggedIn && !emailEntered) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'rgba(245, 241, 232, 0.3)', py: 4 }}>
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card sx={{ backgroundColor: '#F5F1E8', border: '2px solid #D4B896', p: 4 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CalendarIcon sx={{ fontSize: 80, color: '#8B6F47', mb: 2 }} />
                <Typography variant="h4" sx={{ color: '#8B6F47', fontWeight: 'bold', mb: 2 }}>
                  Randevularım
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Randevularınızı görüntülemek için e-posta adresinizi girin
                </Typography>
                
                <Box component="form" onSubmit={handleEmailSubmit} sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="E-posta Adresi"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    sx={{
                      mb: 3,
                      '& .MuiInputBase-root': {
                        backgroundColor: 'white'
                      },
                      '& .MuiInputLabel-root': {
                        color: '#8B6F47'
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#D4B896'
                        },
                        '&:hover fieldset': {
                          borderColor: '#8B6F47'
                        }
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                      backgroundColor: '#8B6F47',
                      color: 'white',
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#6B5437'
                      }
                    }}
                  >
                    Randevularımı Göster
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'rgba(245, 241, 232, 0.3)', py: 4 }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h3" sx={{ color: '#8B6F47', fontWeight: 'bold' }}>
              Randevularım
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                if (isLoggedIn) {
                  // Giriş yapmış kullanıcı için dialog aç
                  setDifferentEmailDialog({
                    open: true,
                    email: ''
                  });
                } else {
                  // Giriş yapmamış kullanıcı için e-posta giriş formunu göster
                  setEmailEntered(false);
                  setCustomerEmail('');
                }
              }}
              sx={{
                color: '#8B6F47',
                borderColor: '#8B6F47',
                '&:hover': {
                  backgroundColor: 'rgba(139, 111, 71, 0.1)'
                }
              }}
            >
              Farklı E-posta
            </Button>
          </Box>

          <Card sx={{ backgroundColor: '#F5F1E8', border: '2px solid #D4B896', mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    color: '#8B6F47',
                    fontWeight: 'bold'
                  },
                  '& .Mui-selected': {
                    color: '#8B6F47 !important'
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#8B6F47'
                  }
                }}
              >
                <Tab label={`Yaklaşan Randevular (${appointments.upcoming.length})`} />
                <Tab label={`Geçmiş Randevular (${appointments.past.length})`} />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 3 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress sx={{ color: '#8B6F47' }} />
                </Box>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === 0 ? (
                      appointments.upcoming.length > 0 ? (
                        appointments.upcoming.map((appointment) => (
                          <AppointmentCard key={appointment.id} appointment={appointment} />
                        ))
                      ) : (
                        <Alert severity="info" sx={{ backgroundColor: 'rgba(139, 111, 71, 0.1)' }}>
                          Yaklaşan randevunuz bulunmamaktadır.
                        </Alert>
                      )
                    ) : (
                      appointments.past.length > 0 ? (
                        appointments.past.map((appointment) => (
                          <AppointmentCard key={appointment.id} appointment={appointment} showActions={false} />
                        ))
                      ) : (
                        <Alert severity="info" sx={{ backgroundColor: 'rgba(139, 111, 71, 0.1)' }}>
                          Geçmiş randevunuz bulunmamaktadır.
                        </Alert>
                      )
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Reschedule Dialog */}
        <Dialog 
          open={rescheduleDialog.open} 
          onClose={closeRescheduleDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ backgroundColor: '#F5F1E8', color: '#8B6F47', fontWeight: 'bold' }}>
            Randevu Güncelle
            <IconButton
              onClick={closeRescheduleDialog}
              sx={{ position: 'absolute', right: 8, top: 8, color: '#8B6F47' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#F5F1E8', pt: 3 }}>
            {rescheduleDialog.appointment && (
              <Box>
                <Alert severity="info" sx={{ mb: 3, backgroundColor: 'rgba(139, 111, 71, 0.1)' }}>
                  <strong>{rescheduleDialog.appointment.service.name}</strong> randevunuzu güncelliyorsunuz
                </Alert>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Terapist</InputLabel>
                      <Select
                        value={selectedTherapist}
                        onChange={(e) => setSelectedTherapist(e.target.value)}
                        label="Terapist"
                      >
                        {therapists.map((therapist) => (
                          <MenuItem key={therapist.id} value={therapist.id.toString()}>
                            {therapist.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                      <DatePicker
                        label="Yeni Tarih"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        minDate={dayjs()}
                        maxDate={dayjs().add(30, 'day')}
                        slotProps={{
                          textField: {
                            fullWidth: true
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  {selectedDate && availableSlots.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ color: '#8B6F47', mb: 2 }}>
                        Müsait Saatler
                      </Typography>
                      <Grid container spacing={1}>
                        {availableSlots.map((slot) => (
                          <Grid item key={slot.id}>
                            <Button
                              variant={selectedSlot === slot.id.toString() ? 'contained' : 'outlined'}
                              onClick={() => setSelectedSlot(slot.id.toString())}
                              sx={{
                                color: selectedSlot === slot.id.toString() ? 'white' : '#8B6F47',
                                backgroundColor: selectedSlot === slot.id.toString() ? '#8B6F47' : 'transparent',
                                borderColor: '#8B6F47',
                                '&:hover': {
                                  backgroundColor: selectedSlot === slot.id.toString() ? '#6B5437' : 'rgba(139, 111, 71, 0.1)'
                                }
                              }}
                            >
                              {dayjs(slot.startTime).format('HH:mm')}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  )}
                  {selectedDate && availableSlots.length === 0 && (
                    <Grid item xs={12}>
                      <Alert severity="warning">
                        Seçilen tarih için müsait saat bulunmamaktadır.
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#F5F1E8', p: 3 }}>
            <Button onClick={closeRescheduleDialog} sx={{ color: '#8B6F47' }}>
              İptal
            </Button>
            <Button 
              onClick={handleReschedule}
              variant="contained"
              disabled={!selectedSlot}
              sx={{
                backgroundColor: '#8B6F47',
                '&:hover': {
                  backgroundColor: '#6B5437'
                }
              }}
            >
              Güncelle
            </Button>
          </DialogActions>
        </Dialog>

        {/* Different Email Dialog */}
        <Dialog
          open={differentEmailDialog.open}
          onClose={() => setDifferentEmailDialog({ open: false, email: '' })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ backgroundColor: '#F5F1E8', color: '#8B6F47', fontWeight: 'bold' }}>
            Farklı E-posta Adresi
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#F5F1E8', pt: 3 }}>
            <Typography variant="body1" sx={{ mb: 3, color: '#8B6F47' }}>
              Farklı bir e-posta adresi ile randevuları görüntülemek istiyorsanız, e-posta adresini girin:
            </Typography>
            <TextField
              fullWidth
              label="E-posta Adresi"
              type="email"
              value={differentEmailDialog.email}
              onChange={(e) => setDifferentEmailDialog({
                ...differentEmailDialog,
                email: e.target.value
              })}
              required
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: 'white'
                },
                '& .MuiInputLabel-root': {
                  color: '#8B6F47'
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#D4B896'
                  },
                  '&:hover fieldset': {
                    borderColor: '#8B6F47'
                  }
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#F5F1E8', p: 3 }}>
            <Button 
              onClick={() => setDifferentEmailDialog({ open: false, email: '' })}
              sx={{ color: '#8B6F47' }}
            >
              İptal
            </Button>
            <Button 
              onClick={() => {
                if (differentEmailDialog.email.trim()) {
                  setCustomerEmail(differentEmailDialog.email);
                  setEmailEntered(true);
                  setDifferentEmailDialog({ open: false, email: '' });
                }
              }}
              variant="contained"
              disabled={!differentEmailDialog.email.trim()}
              sx={{
                backgroundColor: '#8B6F47',
                '&:hover': {
                  backgroundColor: '#6B5437'
                }
              }}
            >
              Randevuları Göster
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default AppointmentManagementPage;