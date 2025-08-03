import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
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
  IconButton,
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
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Business as ServicesIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Euro as PriceIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Spa as SpaIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dashboard Data
  const [dashboardStats, setDashboardStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalRevenue: 0,
    activeTherapists: 0,
    recentAppointments: []
  });

  // Appointments Data
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);

  // Dialog States
  const [serviceDialog, setServiceDialog] = useState({ open: false, service: null });
  const [therapistDialog, setTherapistDialog] = useState({ open: false, therapist: null });
  const [availabilityDialog, setAvailabilityDialog] = useState({ open: false, slot: null });

  // Form States
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    durationMinutes: ''
  });
  const [therapistForm, setTherapistForm] = useState({
    name: '',
    bio: '',
    profilePictureUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const [availabilityForm, setAvailabilityForm] = useState({
    therapistId: '',
    startTime: null,
    endTime: null,
    isBooked: false
  });

  useEffect(() => {
    loadDashboardData();
    loadAppointments();
    loadServices();
    loadTherapists();
    loadAvailability();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [appointmentsRes, servicesRes, therapistsRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/services'),
        fetch('/api/therapists')
      ]);

      const appointmentsData = await appointmentsRes.json();
      const servicesData = await servicesRes.json();
      const therapistsData = await therapistsRes.json();

      const today = dayjs().format('YYYY-MM-DD');
      const todayAppointments = appointmentsData.filter(apt => 
        dayjs(apt.availabilitySlot.startTime).format('YYYY-MM-DD') === today
      );

      const totalRevenue = appointmentsData.reduce((total, apt) => total + apt.service.price, 0);

      setDashboardStats({
        totalAppointments: appointmentsData.length,
        todayAppointments: todayAppointments.length,
        totalRevenue: totalRevenue,
        activeTherapists: therapistsData.length,
        recentAppointments: appointmentsData.slice(0, 5)
      });
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
      showSnackbar('Dashboard verileri yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Randevular yüklenirken hata:', error);
    }
  };

  const loadServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Hizmetler yüklenirken hata:', error);
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

  const loadAvailability = async () => {
    try {
      const response = await fetch('/api/availability');
      if (response.ok) {
        const data = await response.json();
        setAvailabilitySlots(data);
      }
    } catch (error) {
      console.error('Müsaitlik verileri yüklenirken hata:', error);
    }
  };

  const handleSaveService = async () => {
    try {
      const method = serviceDialog.service ? 'PUT' : 'POST';
      const url = serviceDialog.service 
        ? `/api/services/${serviceDialog.service.id}` 
        : '/api/services';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...serviceForm,
          price: parseFloat(serviceForm.price),
          durationMinutes: parseInt(serviceForm.durationMinutes),
          ...(serviceDialog.service && { id: serviceDialog.service.id })
        })
      });

      if (response.ok) {
        showSnackbar(`Hizmet başarıyla ${serviceDialog.service ? 'güncellendi' : 'eklendi'}!`, 'success');
        closeServiceDialog();
        loadServices();
      } else {
        showSnackbar('Hizmet kaydedilirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Hizmet kaydedilirken hata:', error);
      showSnackbar('Hizmet kaydedilirken hata oluştu', 'error');
    }
  };

  const handleSaveTherapist = async () => {
    try {
      // Step 1: Save therapist text data
      const method = therapistDialog.therapist ? 'PUT' : 'POST';
      const url = therapistDialog.therapist 
        ? `/api/therapists/${therapistDialog.therapist.id}` 
        : '/api/therapists';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...therapistForm,
          id: therapistDialog.therapist?.id,
          // ProfilePictureUrl is handled separately but we might need to pass the existing one
          profilePictureUrl: therapistDialog.therapist?.profilePictureUrl || '' 
        })
      });

      if (!response.ok) {
        throw new Error('Terapist bilgileri kaydedilemedi.');
      }

      let savedTherapistData = therapistDialog.therapist;
      if(method === 'POST') {
        savedTherapistData = await response.json();
      }
      
      const therapistId = savedTherapistData.id;

      // Step 2: If a file is selected, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        console.log('Uploading file:', selectedFile.name, 'Size:', selectedFile.size);
        
        const uploadResponse = await fetch(`/api/therapists/${therapistId}/upload-picture`, {
          method: 'POST',
          body: formData,
        });

        console.log('Upload response status:', uploadResponse.status);
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Upload error response:', errorText);
          throw new Error(`Profil fotoğrafı yüklenemedi: ${errorText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log('Upload successful:', uploadResult);
      }

      showSnackbar(`Terapist başarıyla ${therapistDialog.therapist ? 'güncellendi' : 'eklendi'}!`, 'success');
      closeTherapistDialog();
      loadTherapists();

    } catch (error) {
      console.error('Terapist kaydedilirken hata:', error);
      showSnackbar(error.message || 'Terapist kaydedilirken bir hata oluştu.', 'error');
    }
  };

  const handleSaveAvailability = async () => {
    try {
      const method = availabilityDialog.slot ? 'PUT' : 'POST';
      const url = availabilityDialog.slot 
        ? `/api/availability/${availabilityDialog.slot.id}` 
        : '/api/availability';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...availabilityForm,
          therapistId: parseInt(availabilityForm.therapistId),
          startTime: availabilityForm.startTime?.toISOString(),
          endTime: availabilityForm.endTime?.toISOString(),
          ...(availabilityDialog.slot && { id: availabilityDialog.slot.id })
        })
      });

      if (response.ok) {
        showSnackbar(`Müsaitlik başarıyla ${availabilityDialog.slot ? 'güncellendi' : 'eklendi'}!`, 'success');
        closeAvailabilityDialog();
        loadAvailability();
      } else {
        showSnackbar('Müsaitlik kaydedilirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Müsaitlik kaydedilirken hata:', error);
      showSnackbar('Müsaitlik kaydedilirken hata oluştu', 'error');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showSnackbar('Hizmet başarıyla silindi!', 'success');
        loadServices();
      } else {
        showSnackbar('Hizmet silinirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Hizmet silinirken hata:', error);
      showSnackbar('Hizmet silinirken hata oluştu', 'error');
    }
  };

  const handleDeleteTherapist = async (id) => {
    if (!window.confirm('Bu terapisti silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/therapists/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showSnackbar('Terapist başarıyla silindi!', 'success');
        loadTherapists();
      } else {
        showSnackbar('Terapist silinirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Terapist silinirken hata:', error);
      showSnackbar('Terapist silinirken hata oluştu', 'error');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showSnackbar('Randevu başarıyla iptal edildi!', 'success');
        loadAppointments();
        loadDashboardData();
      } else {
        showSnackbar('Randevu iptal edilirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Randevu iptal edilirken hata:', error);
      showSnackbar('Randevu iptal edilirken hata oluştu', 'error');
    }
  };

  const handleDeleteAvailability = async (id) => {
    if (!window.confirm('Bu müsaitlik slotunu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/availability/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showSnackbar('Müsaitlik başarıyla silindi!', 'success');
        loadAvailability();
      } else {
        showSnackbar('Müsaitlik silinirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Müsaitlik silinirken hata:', error);
      showSnackbar('Müsaitlik silinirken hata oluştu', 'error');
    }
  };

  const openServiceDialog = (service = null) => {
    setServiceDialog({ open: true, service });
    if (service) {
      setServiceForm({
        name: service.name,
        description: service.description,
        price: service.price.toString(),
        durationMinutes: service.durationMinutes.toString()
      });
    } else {
      setServiceForm({ name: '', description: '', price: '', durationMinutes: '' });
    }
  };

  const closeServiceDialog = () => {
    setServiceDialog({ open: false, service: null });
    setServiceForm({ name: '', description: '', price: '', durationMinutes: '' });
  };

  const openTherapistDialog = (therapist = null) => {
    setTherapistDialog({ open: true, therapist });
    if (therapist) {
      setTherapistForm({
        name: therapist.name,
        bio: therapist.bio,
        profilePictureUrl: therapist.profilePictureUrl || ''
      });
    } else {
      setTherapistForm({ name: '', bio: '', profilePictureUrl: '' });
    }
    setSelectedFile(null);
  };

  const closeTherapistDialog = () => {
    setTherapistDialog({ open: false, therapist: null });
    setTherapistForm({ name: '', bio: '' });
  };

  const openAvailabilityDialog = (slot = null) => {
    setAvailabilityDialog({ open: true, slot });
    if (slot) {
      setAvailabilityForm({
        therapistId: slot.therapistId.toString(),
        startTime: dayjs(slot.startTime),
        endTime: dayjs(slot.endTime),
        isBooked: slot.isBooked
      });
    } else {
      setAvailabilityForm({ therapistId: '', startTime: null, endTime: null, isBooked: false });
    }
  };

  const closeAvailabilityDialog = () => {
    setAvailabilityDialog({ open: false, slot: null });
    setAvailabilityForm({ therapistId: '', startTime: null, endTime: null, isBooked: false });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const DashboardStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ backgroundColor: '#E3F2FD', border: '2px solid #2196F3' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <CalendarIcon sx={{ fontSize: 48, color: '#2196F3', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
              {dashboardStats.totalAppointments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toplam Randevu
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ backgroundColor: '#E8F5E8', border: '2px solid #4CAF50' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <TodayIcon sx={{ fontSize: 48, color: '#4CAF50', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              {dashboardStats.todayAppointments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bugünkü Randevular
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ backgroundColor: '#FFF3E0', border: '2px solid #FF9800' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <MoneyIcon sx={{ fontSize: 48, color: '#FF9800', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
              ₺{dashboardStats.totalRevenue}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toplam Gelir
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ backgroundColor: '#F3E5F5', border: '2px solid #9C27B0' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 48, color: '#9C27B0', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9C27B0' }}>
              {dashboardStats.activeTherapists}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aktif Terapist
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const RecentAppointments = () => (
    <Card sx={{ backgroundColor: '#F5F1E8', border: '2px solid #D4B896', mt: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: '#8B6F47', fontWeight: 'bold', mb: 2 }}>
          Son Randevular
        </Typography>
        <List>
          {dashboardStats.recentAppointments.map((appointment, index) => (
            <ListItem key={appointment.id} divider={index < dashboardStats.recentAppointments.length - 1}>
              <ListItemAvatar>
                <Avatar sx={{ backgroundColor: '#8B6F47' }}>
                  <CalendarIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${appointment.customer.name} ${appointment.customer.surname}`}
                secondary={`${appointment.service.name} - ${dayjs(appointment.availabilitySlot.startTime).format('DD MMM HH:mm')}`}
              />
              <Chip 
                label={`₺${appointment.service.price}`}
                color="primary"
                sx={{ backgroundColor: '#8B6F47' }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const tabLabels = ['Dashboard', 'Randevular', 'Hizmetler', 'Terapistler', 'Müsaitlik'];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'rgba(245, 241, 232, 0.3)', py: 4 }}>
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h3" align="center" sx={{ color: '#8B6F47', fontWeight: 'bold', mb: 4 }}>
            Admin Paneli
          </Typography>

          <Card sx={{ backgroundColor: '#F5F1E8', border: '2px solid #D4B896' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    color: '#8B6F47',
                    fontWeight: 'bold',
                    minWidth: 120
                  },
                  '& .Mui-selected': {
                    color: '#8B6F47 !important'
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#8B6F47'
                  }
                }}
              >
                {tabLabels.map((label, index) => (
                  <Tab key={index} label={label} />
                ))}
              </Tabs>
            </Box>

            <CardContent sx={{ p: 3, minHeight: 600 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
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
                    {/* Tab Contents will be implemented in the next parts */}
                    {activeTab === 0 && (
                      <Box>
                        <DashboardStats />
                        <RecentAppointments />
                      </Box>
                    )}
                    {activeTab === 1 && (
                      <Box>
                        <Typography variant="h5" sx={{ color: '#8B6F47', mb: 3, fontWeight: 'bold' }}>
                          Randevu Yönetimi
                        </Typography>
                        <TableContainer component={Paper} sx={{ backgroundColor: 'white', border: '1px solid #D4B896' }}>
                          <Table>
                            <TableHead sx={{ backgroundColor: '#F5F1E8' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Müşteri</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Hizmet</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Terapist</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Tarih & Saat</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Ücret</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Durum</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>İşlemler</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {appointments.map((appointment) => {
                                const appointmentDate = dayjs(appointment.availabilitySlot.startTime);
                                const isUpcoming = appointmentDate.isAfter(dayjs());
                                
                                return (
                                  <TableRow key={appointment.id} hover>
                                    <TableCell>
                                      {appointment.customer.name} {appointment.customer.surname}
                                      <br />
                                      <Typography variant="body2" color="text.secondary">
                                        {appointment.customer.email}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>{appointment.service.name}</TableCell>
                                    <TableCell>{appointment.therapist.name}</TableCell>
                                    <TableCell>
                                      {appointmentDate.format('DD.MM.YYYY')}
                                      <br />
                                      <Typography variant="body2" color="text.secondary">
                                        {appointmentDate.format('HH:mm')}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>₺{appointment.service.price}</TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={isUpcoming ? 'Yaklaşan' : 'Tamamlandı'}
                                        color={isUpcoming ? 'primary' : 'success'}
                                        size="small"
                                        sx={{
                                          backgroundColor: isUpcoming ? '#8B6F47' : '#4CAF50',
                                          color: 'white'
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <IconButton 
                                        size="small"
                                        onClick={() => {
                                          const details = `Müşteri: ${appointment.customer.name} ${appointment.customer.surname}
Email: ${appointment.customer.email}
Telefon: ${appointment.customer.phone}
Hizmet: ${appointment.service.name}
Terapist: ${appointment.therapist.name}
Tarih: ${appointmentDate.format('DD MMMM YYYY')}
Saat: ${appointmentDate.format('HH:mm')}
Ücret: ₺${appointment.service.price}`;
                                          alert(details);
                                        }}
                                        sx={{ color: '#8B6F47' }}
                                      >
                                        <ViewIcon />
                                      </IconButton>
                                      {isUpcoming && (
                                        <IconButton 
                                          size="small"
                                          onClick={() => handleDeleteAppointment(appointment.id)}
                                          sx={{ color: '#d32f2f' }}
                                        >
                                          <CancelIcon />
                                        </IconButton>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                    {activeTab === 2 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                          <Typography variant="h5" sx={{ color: '#8B6F47', fontWeight: 'bold' }}>
                            Hizmet Yönetimi
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => openServiceDialog()}
                            sx={{ backgroundColor: '#8B6F47', '&:hover': { backgroundColor: '#6B5437' } }}
                          >
                            Yeni Hizmet
                          </Button>
                        </Box>
                        <TableContainer component={Paper} sx={{ backgroundColor: 'white', border: '1px solid #D4B896' }}>
                          <Table>
                            <TableHead sx={{ backgroundColor: '#F5F1E8' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Hizmet Adı</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Açıklama</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Süre</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Fiyat</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>İşlemler</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {services.map((service) => (
                                <TableRow key={service.id} hover>
                                  <TableCell sx={{ fontWeight: 'bold' }}>{service.name}</TableCell>
                                  <TableCell>
                                    <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {service.description}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      icon={<TimeIcon />}
                                      label={`${service.durationMinutes} dk`}
                                      size="small"
                                      sx={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      icon={<PriceIcon />}
                                      label={`₺${service.price}`}
                                      size="small"
                                      sx={{ backgroundColor: '#FFF3E0', color: '#FF9800' }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <IconButton 
                                      size="small"
                                      onClick={() => openServiceDialog(service)}
                                      sx={{ color: '#8B6F47' }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                      size="small"
                                      onClick={() => handleDeleteService(service.id)}
                                      sx={{ color: '#d32f2f' }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                    {activeTab === 3 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                          <Typography variant="h5" sx={{ color: '#8B6F47', fontWeight: 'bold' }}>
                            Terapist Yönetimi
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => openTherapistDialog()}
                            sx={{ backgroundColor: '#8B6F47', '&:hover': { backgroundColor: '#6B5437' } }}
                          >
                            Yeni Terapist
                          </Button>
                        </Box>
                        <TableContainer component={Paper} sx={{ backgroundColor: 'white', border: '1px solid #D4B896' }}>
                          <Table>
                            <TableHead sx={{ backgroundColor: '#F5F1E8' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Fotoğraf</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>İsim</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Biyografi</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>İşlemler</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {therapists.map((therapist) => (
                                <TableRow key={therapist.id} hover>
                                  <TableCell>
                                    <Avatar 
                                      src={therapist.profilePictureUrl} 
                                      sx={{ width: 60, height: 60, border: '2px solid #8B6F47' }}
                                    >
                                      {therapist.name.charAt(0)}
                                    </Avatar>
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 'bold' }}>{therapist.name}</TableCell>
                                  <TableCell>
                                    <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {therapist.bio}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <IconButton 
                                      size="small"
                                      onClick={() => openTherapistDialog(therapist)}
                                      sx={{ color: '#8B6F47' }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                      size="small"
                                      onClick={() => handleDeleteTherapist(therapist.id)}
                                      sx={{ color: '#d32f2f' }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                    {activeTab === 4 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                          <Typography variant="h5" sx={{ color: '#8B6F47', fontWeight: 'bold' }}>
                            Müsaitlik Yönetimi
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => openAvailabilityDialog()}
                            sx={{ backgroundColor: '#8B6F47', '&:hover': { backgroundColor: '#6B5437' } }}
                          >
                            Yeni Müsaitlik
                          </Button>
                        </Box>
                        <TableContainer component={Paper} sx={{ backgroundColor: 'white', border: '1px solid #D4B896' }}>
                          <Table>
                            <TableHead sx={{ backgroundColor: '#F5F1E8' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Terapist</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Tarih</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Başlangıç</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Bitiş</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>Durum</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#8B6F47' }}>İşlemler</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {availabilitySlots.map((slot) => (
                                <TableRow key={slot.id} hover>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Avatar 
                                        src={slot.therapist?.profilePictureUrl} 
                                        sx={{ width: 40, height: 40, mr: 2, border: '2px solid #8B6F47' }}
                                      >
                                        {slot.therapist?.name?.charAt(0)}
                                      </Avatar>
                                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        {slot.therapist?.name}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(slot.startTime).toLocaleDateString('tr-TR')}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(slot.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(slot.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={slot.isBooked ? 'Dolu' : 'Müsait'} 
                                      color={slot.isBooked ? 'error' : 'success'}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <IconButton 
                                      size="small"
                                      onClick={() => openAvailabilityDialog(slot)}
                                      sx={{ color: '#8B6F47' }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                      size="small"
                                      onClick={() => handleDeleteAvailability(slot.id)}
                                      sx={{ color: '#d32f2f' }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Service Dialog */}
        <Dialog open={serviceDialog.open} onClose={closeServiceDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#F5F1E8', color: '#8B6F47', fontWeight: 'bold' }}>
            {serviceDialog.service ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#F5F1E8', pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hizmet Adı"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  multiline
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Süre (Dakika)"
                  type="number"
                  value={serviceForm.durationMinutes}
                  onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Fiyat (₺)"
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#F5F1E8', p: 3 }}>
            <Button onClick={closeServiceDialog} sx={{ color: '#8B6F47' }}>
              İptal
            </Button>
            <Button 
              onClick={handleSaveService}
              variant="contained"
              sx={{ backgroundColor: '#8B6F47', '&:hover': { backgroundColor: '#6B5437' } }}
            >
              {serviceDialog.service ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Therapist Dialog */}
        <Dialog open={therapistDialog.open} onClose={closeTherapistDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#F5F1E8', color: '#8B6F47', fontWeight: 'bold' }}>
            {therapistDialog.therapist ? 'Terapist Düzenle' : 'Yeni Terapist Ekle'}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#F5F1E8', pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Terapist Adı"
                  value={therapistForm.name}
                  onChange={(e) => setTherapistForm({ ...therapistForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Biyografi"
                  multiline
                  rows={4}
                  value={therapistForm.bio}
                  onChange={(e) => setTherapistForm({ ...therapistForm, bio: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  component="label" 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  sx={{ mb: 2, color: '#8B6F47', borderColor: '#8B6F47' }}
                >
                  Profil Fotoğrafı Yükle
                  <input 
                    type="file" 
                    hidden 
                    accept="image/*"
                    onChange={handleFileChange} 
                  />
                </Button>
                {selectedFile && (
                  <Typography variant="body2" sx={{ color: '#8B6F47', mb: 2 }}>
                    Seçilen dosya: {selectedFile.name}
                  </Typography>
                )}
                {therapistForm.profilePictureUrl && (
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#8B6F47', mb: 1, display: 'block' }}>
                      Mevcut Fotoğraf:
                    </Typography>
                    <Avatar 
                      src={therapistForm.profilePictureUrl} 
                      sx={{ width: 100, height: 100, m: 'auto', border: '2px solid #8B6F47' }} 
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#F5F1E8', p: 3 }}>
            <Button onClick={closeTherapistDialog} sx={{ color: '#8B6F47' }}>
              İptal
            </Button>
            <Button 
              onClick={handleSaveTherapist}
              variant="contained"
              sx={{ backgroundColor: '#8B6F47', '&:hover': { backgroundColor: '#6B5437' } }}
            >
              {therapistDialog.therapist ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Availability Dialog */}
        <Dialog open={availabilityDialog.open} onClose={closeAvailabilityDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#F5F1E8', color: '#8B6F47', fontWeight: 'bold' }}>
            {availabilityDialog.slot ? 'Müsaitlik Düzenle' : 'Yeni Müsaitlik Ekle'}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#F5F1E8', pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Terapist</InputLabel>
                  <Select
                    value={availabilityForm.therapistId}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, therapistId: e.target.value })}
                    label="Terapist"
                    required
                  >
                    {therapists.map((therapist) => (
                      <MenuItem key={therapist.id} value={therapist.id.toString()}>
                        {therapist.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                  <DatePicker
                    label="Tarih"
                    value={availabilityForm.startTime}
                    onChange={(newValue) => {
                      if (newValue) {
                        const startTime = newValue.hour(9).minute(0); // Varsayılan 09:00
                        const endTime = newValue.hour(10).minute(0);   // Varsayılan 10:00
                        setAvailabilityForm({ 
                          ...availabilityForm, 
                          startTime: startTime,
                          endTime: endTime
                        });
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                  <TimePicker
                    label="Başlangıç Saati"
                    value={availabilityForm.startTime}
                    onChange={(newValue) => {
                      if (newValue && availabilityForm.startTime) {
                        const updatedStartTime = availabilityForm.startTime.hour(newValue.hour()).minute(newValue.minute());
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
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                  <TimePicker
                    label="Bitiş Saati"
                    value={availabilityForm.endTime}
                    onChange={(newValue) => {
                      if (newValue && availabilityForm.startTime) {
                        const updatedEndTime = availabilityForm.startTime.hour(newValue.hour()).minute(newValue.minute());
                        setAvailabilityForm({ 
                          ...availabilityForm, 
                          endTime: updatedEndTime
                        });
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#F5F1E8', p: 3 }}>
            <Button onClick={closeAvailabilityDialog} sx={{ color: '#8B6F47' }}>
              İptal
            </Button>
            <Button 
              onClick={handleSaveAvailability}
              variant="contained"
              disabled={!availabilityForm.therapistId || !availabilityForm.startTime || !availabilityForm.endTime}
              sx={{ backgroundColor: '#8B6F47', '&:hover': { backgroundColor: '#6B5437' } }}
            >
              {availabilityDialog.slot ? 'Güncelle' : 'Ekle'}
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

export default AdminDashboard;
