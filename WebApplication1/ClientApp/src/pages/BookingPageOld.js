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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  FormHelperText,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as SuccessIcon,
  Schedule as TimeIcon,
  CalendarToday as DateIcon,
  Spa as ServiceIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useApi, useLazyApi } from '../hooks/useApi';
import { LoadingState, FormSkeleton } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { 
  validateName, 
  validateEmail, 
  validatePhone, 
  formatPhoneNumber,
  normalizePhoneNumber 
} from '../utils/validation';

const steps = ['Terapist Seç', 'Tarih ve Saat Seç', 'Hizmet Seç', 'Bilgilerini Gir'];

function BookingPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // Adım 1 State - Terapist
  const [selectedTherapist, setSelectedTherapist] = useState('');
  
  // Adım 2 State - Tarih ve Saat
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availability, setAvailability] = useState([]);

  // Adım 3 State - Hizmet
  const [selectedService, setSelectedService] = useState(serviceId || '');

  // Adım 4 State - Müşteri Bilgileri
  const [customerInfo, setCustomerInfo] = useState({ 
    name: '', 
    surname: '', 
    phone: '', 
    email: '' 
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Success/Error messages
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // API Hooks
  const { 
    data: therapists, 
    loading: therapistsLoading, 
    error: therapistsError 
  } = useApi(() => api.therapists.getAll(), [activeStep]);
  
  const { 
    data: services, 
    loading: servicesLoading, 
    error: servicesError 
  } = useApi(() => api.services.getAll(), [activeStep]);

  // Adım 2: Müsaitlikleri Çek
  useEffect(() => {
    const fetchAvailability = async () => {
      if (selectedTherapist) {
        setLoading(true);
        try {
          // TODO: API'yi terapiste göre filtreleyecek şekilde güncelle
          const response = await fetch(`/api/availability`); 
          const data = await response.json();
          // Sadece seçili terapistin ve rezerve edilmemiş slotlarını filtrele
          const filteredSlots = data.filter(slot => slot.therapistId === selectedTherapist && !slot.isBooked);
          setAvailability(filteredSlots);
        } catch (error) {
          console.error('Müsaitlik çekilirken hata:', error);
        }
        setLoading(false);
      }
    };
    if (activeStep === 1) {
      fetchAvailability();
    }
  }, [activeStep, selectedTherapist]);


  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleBooking = async () => {
    setLoading(true);
    // 1. Müşteriyi oluştur veya mevcutu bul
    // TODO: Bu kısım daha gelişmiş bir hale getirilebilir (örn: email ile müşteri arama)
    let customerId;
    try {
      const customerResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerInfo),
      });
      const newCustomer = await customerResponse.json();
      customerId = newCustomer.id;
    } catch (error) {
      console.error('Müşteri oluşturulurken hata:', error);
      setLoading(false);
      return;
    }

    // 2. Randevuyu oluştur
    const appointmentData = {
      serviceId: parseInt(serviceId),
      therapistId: selectedTherapist,
      availabilitySlotId: selectedSlot,
      customerId: customerId,
    };

    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      // 3. Slot'u "dolu" olarak güncelle
      const slotToUpdate = availability.find(s => s.id === selectedSlot);
      await fetch(`/api/availability/${selectedSlot}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...slotToUpdate, isBooked: true }),
      });

      alert('Randevunuz başarıyla oluşturuldu!');
      navigate('/');
    } catch (error) {
      console.error('Randevu oluşturulurken hata:', error);
      alert('Randevu oluşturulurken bir hata oluştu.');
    }
    setLoading(false);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth>
            <InputLabel>Terapist Seçin</InputLabel>
            <Select value={selectedTherapist} label="Terapist Seçin" onChange={(e) => setSelectedTherapist(e.target.value)}>
              {therapists.map((therapist) => (
                <MenuItem key={therapist.id} value={therapist.id}>
                  {therapist.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 1:
        return (
          <FormControl fullWidth>
            <InputLabel>Müsait Zamanı Seçin</InputLabel>
            <Select value={selectedSlot} label="Müsait Zamanı Seçin" onChange={(e) => setSelectedSlot(e.target.value)}>
              {availability.map((slot) => (
                <MenuItem key={slot.id} value={slot.id}>
                  {new Date(slot.startTime).toLocaleString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 2:
        return (
          <Box component="form" noValidate autoComplete="off">
            <TextField label="Ad" name="name" value={customerInfo.name} onChange={handleInputChange} fullWidth margin="normal" />
            <TextField label="Soyad" name="surname" value={customerInfo.surname} onChange={handleInputChange} fullWidth margin="normal" />
            <TextField label="Telefon" name="phone" value={customerInfo.phone} onChange={handleInputChange} fullWidth margin="normal" />
            <TextField label="Email" name="email" value={customerInfo.email} onChange={handleInputChange} fullWidth margin="normal" />
          </Box>
        );
      default:
        return 'Bilinmeyen adım';
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Randevu Oluştur
      </Typography>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mt: 4, mb: 2 }}>
        {loading ? <CircularProgress /> : getStepContent(activeStep)}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          Geri
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === steps.length - 1 ? (
          <Button onClick={handleBooking}>Randevuyu Tamamla</Button>
        ) : (
          <Button onClick={handleNext}>İleri</Button>
        )}
      </Box>
    </Container>
  );
}

export default BookingPage;
