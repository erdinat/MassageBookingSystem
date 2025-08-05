import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography, 
  Box, 
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  TextField,
  Alert,
  Fade,
  Slide,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Person as PersonIcon,
  Schedule as TimeIcon,
  Euro as PriceIcon,
  Spa as SpaIcon,
  CheckCircle as CheckIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/tr';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('tr');

// Türkiye saati için timezone ayarı
const TIMEZONE = 'Europe/Istanbul';

const steps = ['Hizmet Onayı', 'Terapist Seçimi', 'Tarih Seçimi', 'Saat Seçimi', 'Bilgileriniz'];

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

function BookingPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Data states
  const [service, setService] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    surname: '',
    phone: '',
    email: ''
  });

  // Load service details
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/services/${serviceId}`);
        if (response.ok) {
          const serviceData = await response.json();
          setService(serviceData);
        }
      } catch (error) {
        console.error('Hizmet yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  // Load therapists when step 1 is reached
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/therapists');
        const data = await response.json();
        setTherapists(data);
      } catch (error) {
        console.error('Terapistler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeStep === 1) {
      fetchTherapists();
    }
  }, [activeStep]);

  // Load available slots when date and therapist are selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (selectedTherapist && selectedDate) {
        try {
          setLoading(true);
          const response = await fetch('/api/availability');
          const data = await response.json();
          
          // Filter for selected therapist and date (Türkiye saati ile)
          const filteredSlots = data.filter(slot => 
            slot.therapistId === selectedTherapist.id && 
            !slot.isBooked &&
            dayjs.utc(slot.startTime).tz(TIMEZONE).format('YYYY-MM-DD') === selectedDate.tz(TIMEZONE).format('YYYY-MM-DD')
          );
          
          setAvailableSlots(filteredSlots);
          
          // Eğer seçilen tarihte müsaitlik yoksa kullanıcıya bilgi ver
          if (filteredSlots.length === 0) {
            console.log('Seçilen tarihte müsaitlik bulunamadı');
          }
        } catch (error) {
          console.error('Müsait saatler yüklenirken hata:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (activeStep === 3) {
      fetchAvailableSlots();
    }
  }, [activeStep, selectedTherapist, selectedDate]);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleBooking = async () => {
    try {
      setLoading(true);
      
      // Create customer
      const customerResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerInfo),
      });
      const customer = await customerResponse.json();

      // Create appointment
    const appointmentData = {
      serviceId: parseInt(serviceId),
        therapistId: selectedTherapist.id,
        availabilitySlotId: selectedSlot.id,
        customerId: customer.id,
      };

      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      // Update slot as booked
      await fetch(`/api/availability/${selectedSlot.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selectedSlot, isBooked: true }),
      });

      // Success - navigate to confirmation
      navigate('/', { 
        state: { 
          bookingSuccess: true, 
          appointment: {
            service: service.name,
            therapist: selectedTherapist.name,
            date: selectedDate.format('DD MMMM YYYY'),
            time: dayjs.utc(selectedSlot.startTime).tz(TIMEZONE).format('HH:mm')
          }
        }
      });
    } catch (error) {
      console.error('Randevu oluşturulurken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: return service !== null;
      case 1: return selectedTherapist !== null;
      case 2: return selectedDate !== null;
      case 3: return selectedSlot !== null;
      case 4: return customerInfo.name && customerInfo.surname && customerInfo.phone && customerInfo.email;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ backgroundColor: '#F5F1E8', border: '2px solid #D4B896' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                {service ? (
                  <Box>
                    <SpaIcon sx={{ fontSize: 80, color: '#8B6F47', mb: 2 }} />
                    <Typography variant="h4" sx={{ color: '#8B6F47', mb: 2, fontWeight: 'bold' }}>
                      {service.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
                      {service.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                      <Chip 
                        icon={<TimeIcon />} 
                        label={`${service.durationMinutes} dakika`}
                        sx={{ backgroundColor: '#D4B896', color: '#8B6F47', fontWeight: 'bold' }}
                      />
                      <Chip 
                        icon={<PriceIcon />} 
                        label={`₺${service.price}`}
                        sx={{ backgroundColor: '#8B6F47', color: '#F5F1E8', fontWeight: 'bold' }}
                      />
                    </Box>
                    <Alert severity="info" sx={{ backgroundColor: 'rgba(139, 111, 71, 0.1)' }}>
                      Bu hizmeti seçtiniz. Devam etmek için İleri butonuna tıklayın.
                    </Alert>
                  </Box>
                ) : (
                  <CircularProgress sx={{ color: '#8B6F47' }} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h5" sx={{ color: '#8B6F47', mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
              Terapistinizi Seçin
            </Typography>
            <Grid container spacing={3}>
              {therapists.map((therapist) => (
                <Grid item xs={12} md={6} key={therapist.id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedTherapist?.id === therapist.id ? '3px solid #8B6F47' : '2px solid #D4B896',
                        backgroundColor: selectedTherapist?.id === therapist.id ? 'rgba(139, 111, 71, 0.1)' : '#F5F1E8',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setSelectedTherapist(therapist)}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                        <Avatar 
                          src={therapist.profilePictureUrl}
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            mr: 2, 
                            backgroundColor: '#8B6F47',
                            border: '2px solid #8B6F47'
                          }}
                        >
                          {therapist.profilePictureUrl ? null : <PersonIcon sx={{ fontSize: 30, color: '#F5F1E8' }} />}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ color: '#8B6F47', fontWeight: 'bold' }}>
                            {therapist.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {therapist.bio}
                          </Typography>
                          <Chip 
                            icon={<TimeIcon />}
                            label="Müsait saatler mevcut"
                            color="success"
                            size="small"
                            sx={{ backgroundColor: '#4caf50', color: 'white' }}
                          />
                        </Box>
                        {selectedTherapist?.id === therapist.id && (
                          <CheckIcon sx={{ color: '#8B6F47', fontSize: 30 }} />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h5" sx={{ color: '#8B6F47', mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
              Randevu Tarihinizi Seçin
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                <DatePicker
                  label="Randevu Tarihi"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  minDate={dayjs()}
                  maxDate={dayjs().add(30, 'day')}
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: '#F5F1E8',
                      borderRadius: 2,
                    },
                    '& .MuiInputLabel-root': {
                      color: '#8B6F47',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#D4B896',
                      },
                      '&:hover fieldset': {
                        borderColor: '#8B6F47',
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h5" sx={{ color: '#8B6F47', mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
              Müsait Saatleri Seçin
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress sx={{ color: '#8B6F47' }} />
          </Box>
            ) : availableSlots.length > 0 ? (
              <Grid container spacing={2}>
                {availableSlots.map((slot) => (
                  <Grid item xs={6} sm={4} md={3} key={slot.id}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card
                        sx={{
                          cursor: 'pointer',
                          textAlign: 'center',
                          backgroundColor: selectedSlot?.id === slot.id ? '#8B6F47' : '#F5F1E8',
                          color: selectedSlot?.id === slot.id ? '#F5F1E8' : '#8B6F47',
                          border: '2px solid #D4B896',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: selectedSlot?.id === slot.id ? '#8B6F47' : 'rgba(139, 111, 71, 0.1)',
                          }
                        }}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <CardContent sx={{ py: 2 }}>
                          <ClockIcon sx={{ fontSize: 24, mb: 1 }} />
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {dayjs.utc(slot.startTime).tz(TIMEZONE).format('HH:mm')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="warning" sx={{ backgroundColor: 'rgba(255, 165, 0, 0.1)' }}>
                Seçilen tarih için müsait saat bulunmamaktadır. Lütfen başka bir tarih seçin.
              </Alert>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h5" sx={{ color: '#8B6F47', mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
              İletişim Bilgileriniz
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ad"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: '#F5F1E8',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#8B6F47',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#D4B896',
                      },
                      '&:hover fieldset': {
                        borderColor: '#8B6F47',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Soyad"
                  name="surname"
                  value={customerInfo.surname}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: '#F5F1E8',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#8B6F47',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#D4B896',
                      },
                      '&:hover fieldset': {
                        borderColor: '#8B6F47',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefon"
                  name="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: '#F5F1E8',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#8B6F47',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#D4B896',
                      },
                      '&:hover fieldset': {
                        borderColor: '#8B6F47',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="E-posta"
                  name="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: '#F5F1E8',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#8B6F47',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#D4B896',
                      },
                      '&:hover fieldset': {
                        borderColor: '#8B6F47',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
            
            {/* Booking Summary */}
            <Card sx={{ mt: 4, backgroundColor: 'rgba(139, 111, 71, 0.1)', border: '2px solid #D4B896' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#8B6F47', mb: 2, fontWeight: 'bold' }}>
                  Randevu Özeti
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#8B6F47' }}>
                        <SpaIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Hizmet" secondary={service?.name} />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#8B6F47' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Terapist" secondary={selectedTherapist?.name} />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#8B6F47' }}>
                        <CalendarIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Tarih & Saat" 
                      secondary={`${selectedDate?.tz(TIMEZONE).format('DD MMMM YYYY')} - ${selectedSlot ? dayjs.utc(selectedSlot.startTime).tz(TIMEZONE).format('HH:mm') : ''}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#8B6F47' }}>
                        <PriceIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Ücret" secondary={`₺${service?.price}`} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'rgba(245, 241, 232, 0.3)', py: 4 }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h3" align="center" sx={{ color: '#8B6F47', fontWeight: 'bold', mb: 4 }}>
        Randevu Oluştur
      </Typography>

          <Card sx={{ backgroundColor: '#F5F1E8', border: '2px solid #D4B896', mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
                    <StepLabel
                      sx={{
                        '& .MuiStepLabel-label': {
                          color: '#8B6F47',
                          fontWeight: 'bold',
                        },
                        '& .MuiStepIcon-root': {
                          color: '#D4B896',
                        },
                        '& .MuiStepIcon-root.Mui-active': {
                          color: '#8B6F47',
                        },
                        '& .MuiStepIcon-root.Mui-completed': {
                          color: '#8B6F47',
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
          </Step>
        ))}
      </Stepper>

              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0 || loading}
                  startIcon={<BackIcon />}
                  sx={{
                    color: '#8B6F47',
                    borderColor: '#8B6F47',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 111, 71, 0.1)',
                    },
                  }}
                  variant="outlined"
                >
          Geri
        </Button>

        {activeStep === steps.length - 1 ? (
                  <Button
                    onClick={handleBooking}
                    disabled={!canProceed() || loading}
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: '#8B6F47',
                      color: '#F5F1E8',
                      px: 4,
                      '&:hover': {
                        backgroundColor: '#6B5437',
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Randevuyu Tamamla'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                    variant="contained"
                    endIcon={<ForwardIcon />}
                    size="large"
                    sx={{
                      backgroundColor: '#8B6F47',
                      color: '#F5F1E8',
                      px: 4,
                      '&:hover': {
                        backgroundColor: '#6B5437',
                      },
                    }}
                  >
                    İleri
                  </Button>
        )}
      </Box>
            </CardContent>
          </Card>
        </motion.div>
    </Container>
    </Box>
  );
}

export default BookingPage;