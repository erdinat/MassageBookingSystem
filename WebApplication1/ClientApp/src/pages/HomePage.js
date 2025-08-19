import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box, 
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Divider,
  IconButton,
  Fab,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Spa as SpaIcon,
  Person as PersonIcon,
  Schedule as TimeIcon,
  Euro as PriceIcon,
  ArrowForward as ArrowIcon,
  AccessTime as ClockIcon,
  LocalFlorist as FlowerIcon,
  CleanHands as HygieneIcon,
  PersonPin as TherapistIcon,
  ChevronLeft,
  ChevronRight,
  ArrowDownward,
  ArrowUpward,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const AnimatedSection = React.forwardRef(({ children, ...props }, ref) => {
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

const sliderVariants = {
  enter: (direction) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    };
  }
};

function HomePage() {
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [[page, direction], setPage] = useState([0, 0]);
  const [isHovering, setIsHovering] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  
  // Booking success notification state
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Parallax Ref
  const heroRef = useRef(null);

  // Section Refs for scrolling
  const topRef = useRef(null);
  const galleryRef = useRef(null);
  const advantagesRef = useRef(null);
  const servicesAndTherapistsRef = useRef(null);
  const footerRef = useRef(null);

  const sectionRefs = [topRef, galleryRef, advantagesRef, servicesAndTherapistsRef, footerRef];

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const sliderImages = [
    '/images/slider-1.jpg',
    '/images/slider-2.jpg',
    '/images/slider-3.jpg'
  ];
  
  const imageIndex = Math.abs(page % sliderImages.length);

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleScroll = () => {
    const nextIndex = (currentSectionIndex + 1) % sectionRefs.length;
    
    const targetRef = sectionRefs[nextIndex];

    if (targetRef && targetRef.current) {
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurrentSectionIndex(nextIndex);
    }
  };
  
  const handleScrollToTop = () => {
    sectionRefs[0].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrentSectionIndex(0);
  }

  const advantages = [
    {
      icon: ClockIcon,
      image: '/images/advantage-clock.png',
      title: 'Zamanında Hizmet',
      description: 'Randevularınızı asla kaçırmayın, zamanında profesyonel hizmet alın.'
    },
    {
      icon: FlowerIcon,
      image: '/images/advantage-flower.png',
      title: 'Doğal Ürünler',
      description: 'Sadece doğal ve organik ürünler kullanarak size hizmet veriyoruz.'
    },
    {
      icon: HygieneIcon,
      image: '/images/advantage-hygiene.png',
      title: 'Hijyen Garantisi',
      description: 'En yüksek hijyen standartlarıyla temiz ve güvenli ortam.'
    },
    {
      icon: TherapistIcon,
      image: '/images/advantage-therapist.png',
      title: 'Uzman Terapistler',
      description: 'Alanında deneyimli ve sertifikalı profesyonel terapistler.'
    }
  ];

  // Check for booking success from navigation state
  useEffect(() => {
    if (location.state?.bookingSuccess) {
      setShowBookingSuccess(true);
      setBookingDetails(location.state.appointment);
      
      // Clear the navigation state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    // API'den hizmetleri ve terapistleri çek
    Promise.all([
      fetch('/api/services').then(res => res.json()),
      fetch('/api/therapists').then(res => res.json())
    ])
    .then(([servicesData, therapistsData]) => {
      setServices(servicesData.slice(0, 3)); // İlk 3 hizmeti göster
      setTherapists(therapistsData.slice(0, 3)); // İlk 3 terapisti göster
      setLoading(false);
    })
    .catch(error => {
      console.error('Veriler yüklenirken hata:', error);
      setLoading(false);
    });
  }, []);

  // Slider otomatik geçiş
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovering) {
        paginate(1);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovering, page]);
  
    useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.findIndex(ref => ref.current === entry.target);
            if (index !== -1) {
              setCurrentSectionIndex(index);
            }
          }
        });
      },
      { threshold: 0.5 } // %50'si göründüğünde
    );

    sectionRefs.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      sectionRefs.forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [sectionRefs]);


  return (
    <Box ref={topRef}>
      {/* Hero Section with Parallax */}
      <Box
        ref={heroRef}
        sx={{
          height: '70vh',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            y: backgroundY,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/images/hero.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(139, 111, 71, 0.7)',
            zIndex: 1,
          }}
        />
        <Container sx={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ color: 'white', textAlign: 'center', maxWidth: '600px', mx: 'auto' }}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ 
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                mb: 3
              }}>
                Profesyonel Masaj Hizmetleri
              </Typography>
              <Typography variant="h5" component="p" gutterBottom sx={{ 
                mb: 4,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}>
                Uzman terapistlerimizle rahatlama ve yenilenme deneyimi yaşayın
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/services"
                sx={{
                  backgroundColor: '#F5F1E8',
                  color: '#8B6F47',
                  py: 2,
                  px: 4,
                  fontSize: '1.2rem',
                  textDecoration: 'none',
                  '&:hover': {
                    backgroundColor: '#D4B896',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Hemen Randevu Alın
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Content that scrolls over the hero */}
      <Box sx={{ position: 'relative' }}>
        {/* Slider Section */}
        <AnimatedSection ref={galleryRef}>
          <Box sx={{ py: 6 }}>
            <Container>
              <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ 
                color: '#8B6F47', 
                mb: 4,
                fontWeight: 'bold'
              }}>
                Hizmet Galerisi
              </Typography>
              
              <Box 
                sx={{ position: 'relative', height: '400px', borderRadius: 2, overflow: 'hidden' }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={page}
                    src={sliderImages[imageIndex]}
                    custom={direction}
                    variants={sliderVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "tween", duration: 0.7, ease: "easeInOut" },
                      opacity: { duration: 0.4 }
                    }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </AnimatePresence>
                <AnimatePresence>
                  {isHovering && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', zIndex: 2 }}
                      >
                        <IconButton onClick={() => paginate(-1)} sx={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.4)', '&:hover': {backgroundColor: 'rgba(0,0,0,0.6)'} }}>
                          <ChevronLeft fontSize="large" />
                        </IconButton>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)', zIndex: 2 }}
                      >
                        <IconButton onClick={() => paginate(1)} sx={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.4)', '&:hover': {backgroundColor: 'rgba(0,0,0,0.6)'} }}>
                          <ChevronRight fontSize="large" />
                        </IconButton>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </Box>
            </Container>
          </Box>
        </AnimatedSection>

        {/* Advantages Section */}
        <AnimatedSection ref={advantagesRef}>
          <Box sx={{ py: 6 }}>
            <Container>
              <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ 
                color: '#8B6F47', 
                mb: 4,
                fontWeight: 'bold'
              }}>
                Neden Bizi Tercih Etmelisiniz?
              </Typography>
              
              <Grid container spacing={4} justifyContent="center">
                  {advantages.map((advantage, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <motion.div whileHover={{ y: -5 }} style={{ width: '100%', height: '100%' }}>
                        <Card sx={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          maxWidth: { xs: '80%', sm: '280px' },
                          display: 'flex',
                          flexDirection: 'column',
                          textAlign: 'center',
                          backgroundColor: 'rgba(245, 241, 232, 0.8)',
                          border: '2px solid #D4B896',
                          backdropFilter: 'blur(1px)',
                          transition: 'all 0.3s ease',
                        }}>
                          <CardContent sx={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: { xs: 2, md: 3 }
                          }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                              <img
                                src={advantage.image}
                                alt={advantage.title}
                                style={{
                                  width: '96px',
                                  height: '96px',
                                  objectFit: 'contain',
                                  display: 'block'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </Box>
                            <Typography variant="h6" component="h3" gutterBottom sx={{
                              color: '#8B6F47',
                              fontWeight: 'bold',
                              mb: 1
                            }}>
                              {advantage.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{
                              textAlign: 'center',
                              lineHeight: 1.5
                            }}>
                              {advantage.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
            </Container>
          </Box>
        </AnimatedSection>

        <Divider sx={{ borderColor: '#D4B896' }} />

        {/* Services and Therapists Sections */}
        <AnimatedSection ref={servicesAndTherapistsRef}>
          <Container sx={{ mt: 6, mb: 4 }}>
            <Grid container spacing={6}>
              {/* Hizmetler Bölümü */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" component="h2" sx={{ color: '#8B6F47', fontWeight: 'bold' }}>
                    Hizmetlerimiz
                  </Typography>
                  <Button 
                    component={RouterLink}
                    to="/services"
                    variant="outlined" 
                    endIcon={<ArrowIcon />}
                    sx={{ 
                      color: '#8B6F47', 
                      borderColor: '#8B6F47',
                      '&:hover': {
                        backgroundColor: '#F5F1E8',
                        borderColor: '#8B6F47'
                      }
                    }}
                  >
                    Tümünü Gör
                  </Button>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress sx={{ color: '#8B6F47' }} />
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {services.length === 0 ? (
                      <Grid item xs={12}>
                        <Card sx={{ backgroundColor: '#F5F1E8' }}>
                          <CardContent>
                            <Typography variant="body2" align="center" color="text.secondary">
                              Henüz hizmet eklenmemiş. Postman ile /api/services endpoint'ine POST isteği gönderin.
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ) : (
                      services.map((service) => (
                        <Grid item xs={12} md={4} key={service.id}>
                          <motion.div whileHover={{ y: -5 }} style={{ height: '100%' }}>
                            <Card sx={{ 
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              backgroundColor: 'rgba(245, 241, 232, 0.7)',
                              border: '2px solid #D4B896',
                              backdropFilter: 'blur(1px)',
                              transition: 'all 0.3s ease'
                            }}>
                              <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <SpaIcon sx={{ color: '#8B6F47', mr: 1 }} />
                                  <Typography variant="h6" sx={{ fontSize: '1rem', color: '#8B6F47' }}>
                                    {service.name}
                                  </Typography>
                                </Box>
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem' }}>
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
                                      '& .MuiChip-icon': { color: '#F5F1E8' }
                                    }}
                                  />
                                </Box>
                              </CardContent>

                              <Box sx={{ p: 2, pt: 0 }}>
                                <Button
                                  component={RouterLink}
                                  to={`/booking/${service.id}`}
                                  variant="contained"
                                  fullWidth
                                  size="small"
                                  sx={{
                                    backgroundColor: '#8B6F47',
                                    color: '#F5F1E8',
                                    '&:hover': {
                                      backgroundColor: '#6B5437'
                                    }
                                  }}
                                >
                                  Randevu Al
                                </Button>
                              </Box>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))
                    )}
                  </Grid>
                )}
              </Grid>

              {/* Terapistler Bölümü */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" component="h2" sx={{ color: '#8B6F47', fontWeight: 'bold' }}>
                    Terapistlerimiz
                  </Typography>
                  <Button 
                    component={RouterLink}
                    to="/therapists"
                    variant="outlined" 
                    endIcon={<ArrowIcon />}
                    sx={{ 
                      color: '#8B6F47', 
                      borderColor: '#8B6F47',
                      '&:hover': {
                        backgroundColor: '#F5F1E8',
                        borderColor: '#8B6F47'
                      }
                    }}
                  >
                    Tümünü Gör
                  </Button>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress sx={{ color: '#8B6F47' }} />
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {therapists.length === 0 ? (
                      <Grid item xs={12}>
                        <Card sx={{ backgroundColor: '#F5F1E8' }}>
                          <CardContent>
                            <Typography variant="body2" align="center" color="text.secondary">
                              Henüz terapist eklenmemiş. Postman ile /api/therapists endpoint'ine POST isteği gönderin.
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ) : (
                      therapists.map((therapist) => (
                        <Grid item xs={12} md={4} key={therapist.id}>
                          <motion.div whileHover={{ y: -5 }} style={{ height: '100%' }}>
                            <Card sx={{ 
                              height: '100%', 
                              backgroundColor: 'rgba(245, 241, 232, 0.7)',
                              border: '2px solid #D4B896',
                              backdropFilter: 'blur(1px)',
                              transition: 'all 0.3s ease'
                            }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <Avatar 
                                    src={therapist.profileImageUrl ? `/images/therapists/${therapist.profileImageUrl}` : undefined}
                                    sx={{ 
                                      width: 80, 
                                      height: 80, 
                                      mr: 2, 
                                      backgroundColor: '#8B6F47' 
                                    }}
                                  >
                                    <PersonIcon sx={{ color: '#F5F1E8' }} />
                                  </Avatar>
                                  
                                  <Box>
                                    <Typography variant="h6" sx={{ fontSize: '1rem', color: '#8B6F47' }}>
                                      {therapist.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                      {therapist.bio}
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))
                    )}
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Container>
        </AnimatedSection>

        {/* Footer */}
        <Box
          ref={footerRef}
          sx={{
            backgroundImage: 'url(/images/footer-floral.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#8B6F47',
            py: 6,
            mt: 6,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(139, 111, 71, 0.8)',
              zIndex: 1
            }
          }}
        >
          <Container sx={{ position: 'relative', zIndex: 2 }}>
            <Grid container spacing={4} sx={{ color: 'white' }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  L'OR Masaj Merkezi
                </Typography>
                <Typography variant="body1" paragraph>
                  Profesyonel masaj hizmetleri ile size huzur ve rahatlama sunuyoruz. 
                  Uzman terapistlerimiz ve doğal ürünlerimizle sağlığınıza değer katıyoruz.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                  İletişim Bilgileri
                </Typography>
                <Typography variant="body2" paragraph>
                  📍 Adres: Kadıköy Mahallesi, Derince Sokak No:123<br/>
                  📞 Telefon: +90 (555) 123-4567<br/>
                  📧 E-posta: info@lormasaj.com<br/>
                  🕐 Çalışma Saatleri: 09:00 - 21:00
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3, borderColor: 'rgba(245, 241, 232, 0.3)' }} />
            
            <Typography variant="body2" align="center" sx={{ color: '#F5F1E8' }}>
              © 2025 L'OR Masaj Merkezi. Tüm hakları saklıdır.
            </Typography>
          </Container>
        </Box>
      </Box>

      {/* Scroll Button */}
      <Fab 
        color="primary" 
        aria-label="scroll" 
        onClick={currentSectionIndex >= sectionRefs.length - 1 ? handleScrollToTop : handleScroll}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          backgroundColor: '#8B6F47',
          '&:hover': {
            backgroundColor: '#6B5437'
          }
        }}
      >
        {currentSectionIndex >= sectionRefs.length - 1 ? <ArrowUpward /> : <ArrowDownward />}
      </Fab>

      {/* Booking Success Notification */}
      <Snackbar
        open={showBookingSuccess}
        autoHideDuration={8000}
        onClose={() => setShowBookingSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowBookingSuccess(false)}
          severity="success"
          variant="filled"
          icon={<SuccessIcon />}
          sx={{
            backgroundColor: '#4CAF50',
            color: 'white',
            fontSize: '1.1rem',
            '& .MuiAlert-icon': {
              fontSize: '2rem'
            }
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              🎉 Randevunuz Başarıyla Oluşturuldu!
            </Typography>
            {bookingDetails && (
              <Box sx={{ fontSize: '0.9rem' }}>
                <Typography variant="body2">
                  📧 Email ve SMS bildirimleriniz gönderildi
                </Typography>
                <Typography variant="body2">
                  📅 {bookingDetails.date} - {bookingDetails.time}
                </Typography>
                <Typography variant="body2">
                  🌿 {bookingDetails.service} - {bookingDetails.therapist}
                </Typography>
              </Box>
            )}
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default HomePage;
