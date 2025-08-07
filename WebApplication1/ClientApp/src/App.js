import React, { useState, useEffect } from 'react';
import { Routes, Route, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  Button,
  useScrollTrigger,
  Slide,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider
} from '@mui/material';
import { 
  Home as HomeIcon,
  Spa as ServicesIcon,
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as TimeIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  BookOnline as BookOnlineIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Sayfaları import et
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import TherapistsPage from './pages/TherapistsPage';
import BookingPage from './pages/BookingPage';
import AppointmentManagementPage from './pages/AppointmentManagementPage';
import AdminDashboard from './pages/AdminDashboard';
import TherapistDashboard from './pages/TherapistDashboard';
import LoginRegisterPage from './pages/LoginRegisterPage';
import ProfilePage from './pages/ProfilePage';

// Arka planı yönetecek özel bileşen
const Background = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -10, // Her şeyin arkasında kalmasını garantile
      backgroundImage: 'url(/images/footer-floral.png)',
      backgroundSize: '300px',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      // Üzerindeki hafif beyaz katman
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: -5,
      },
    }}
  />
);


// Scroll'da header'ı gizlemek için
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

const navButtonStyles = (isActive) => ({
  color: isActive ? '#8B6F47' : '#A0825A',
  backgroundColor: isActive ? 'rgba(139, 111, 71, 0.3)' : 'rgba(255, 255, 255, 0.7)',
  border: '1px solid #A0825A',
  '&:hover': {
    backgroundColor: 'rgba(139, 111, 71, 0.8)',
    color: '#FFFFFF',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(139, 111, 71, 0.4)'
  },
  px: 2,
  py: 1,
  borderRadius: 2,
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  '@media (max-width: 768px)': {
    '& .MuiButton-startIcon': { margin: 0 },
    minWidth: 'auto',
    px: 1
  }
});

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic navigation and user state
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  });
  
  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'Admin';
  const isTherapist = user?.role === 'Therapist';
  const isCustomer = user?.role === 'Customer';
  
  // Debug log for troubleshooting
  console.log('Current user:', user);
  console.log('User role:', user?.role);
  console.log('isAdmin:', isAdmin);
  console.log('isTherapist:', isTherapist);
  console.log('isCustomer:', isCustomer);

  // State for profile menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Update user state on storage change and page load
  useEffect(() => {
    const updateUserState = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        setUser(null);
      }
    };

    // Update on page load
    updateUserState();

    // Update on storage change (e.g., login/logout from another tab)
    const handleStorageChange = () => {
      updateUserState();
    };

    // Update on custom user state change event
    const handleUserStateChanged = (event) => {
      setUser(event.detail.user);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userStateChanged', handleUserStateChanged);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userStateChanged', handleUserStateChanged);
    };
  }, []);

  // Dynamic navigation based on user status
  const getNavigationItems = () => {
    const baseItems = [
      { label: 'Ana Sayfa', path: '/', icon: HomeIcon },
      { label: 'Hizmetler', path: '/services', icon: ServicesIcon },
      { label: 'Terapistler', path: '/therapists', icon: PeopleIcon }
    ];

    if (isLoggedIn) {
      // Logged in user navigation
      const loggedInItems = [...baseItems];

      if (isCustomer) {
        loggedInItems.push(
          { label: 'Randevularım', path: '/appointments', icon: TimeIcon },
          { label: 'Profilim', path: '/profile', icon: AccountIcon }
        );
      } else if (isTherapist) {
        loggedInItems.push(
          { label: 'Terapist Paneli', path: '/therapist-dashboard', icon: AdminIcon },
          { label: 'Profilim', path: '/profile', icon: AccountIcon }
        );
      } else if (isAdmin) {
        loggedInItems.push(
          { label: 'Admin Paneli', path: '/admin', icon: AdminIcon },
          { label: 'Profilim', path: '/profile', icon: AccountIcon }
        );
      }

      return loggedInItems;
    } else {
      // Guest user navigation
      return [
        ...baseItems,
        { label: 'Giriş/Kayıt', path: '/auth', icon: AccountIcon }
      ];
    }
  };

  const navigationItems = getNavigationItems();
  
  // Debug navigation items
  console.log('Navigation items for user:', navigationItems);

  // Ana sayfa kontrolü
  const isHomePage = location.pathname === '/';
  
  // Geri butonuna tıklama işlevi
  const handleGoBack = () => {
    navigate(-1); // Tarayıcı history'sinde bir adım geri
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  // Çıkış yapma işlevi
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Dispatch custom event to notify about logout
    window.dispatchEvent(new CustomEvent('userStateChanged', { 
      detail: { user: null } 
    }));
    setUser(null); // Update state
    handleClose();
    navigate('/');
  };

  return (
    <>
      <Background />
      <Box sx={{ flexGrow: 1, backgroundColor: 'transparent' }}>
        {/* Header */}
        <HideOnScroll>
          <AppBar position="fixed" sx={{ 
            backgroundImage: 'url(/images/footer-floral.png)',
            backgroundSize: '120px',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
            backgroundColor: 'rgba(250, 246, 235, 0.9)',
            backgroundBlendMode: 'soft-light',
            boxShadow: '0 2px 10px rgba(200, 180, 150, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url(/images/footer-floral.png)',
              backgroundSize: '120px',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat',
              opacity: 0.15,
              zIndex: 1
            },
            '& > *': {
              position: 'relative',
              zIndex: 2
            }
          }}>
            <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
              {/* Sol taraf - Geri butonu (sadece ana sayfa dışında) */}
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                {!isHomePage && (
                  <Tooltip title="Geri">
                    <IconButton
                      onClick={handleGoBack}
                      sx={{
                        color: '#8B6F47',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid #A0825A',
                        '&:hover': {
                          backgroundColor: 'rgba(139, 111, 71, 0.8)',
                          color: '#FFFFFF',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(139, 111, 71, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* Orta - Masaj Hizmet Yazısı */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                              <Typography 
                variant="h3"
                component={RouterLink}
                to="/"
                sx={{ 
                  textDecoration: 'none', 
                  color: 'rgba(139, 111, 71, 0.8)',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(139, 111, 71, 0.8)',
                  cursor: 'pointer',
                  letterSpacing: '2px',
                  fontFamily: 'serif',
                  '&:hover': {
                    color: 'rgba(139, 111, 71, 0.8)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                L'OR
              </Typography>
              </Box>

              {/* Sağ taraf - Navigation & User Menu */}
              <Box sx={{ display: 'flex', gap: 1, flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                {/* Navigation Buttons (Base Items) */}
                {getNavigationItems().filter(item => ['Ana Sayfa', 'Hizmetler', 'Terapistler'].includes(item.label)).map((item) => (
                    <Button
                      key={item.path}
                      component={RouterLink}
                      to={item.path}
                      startIcon={<item.icon />}
                      sx={navButtonStyles(location.pathname === item.path)}
                    >
                      <Box sx={{ '@media (max-width: 768px)': { display: 'none' } }}>{item.label}</Box>
                    </Button>
                ))}

                {/* User Menu or Login Button */}
                {isLoggedIn ? (
                  <>
                    <Tooltip title="Profil Menüsü">
                      <IconButton onClick={handleMenu} size="small">
                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#8B6F47' }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      PaperProps={{
                        sx: {
                          overflow: 'visible',
                          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                          mt: 1.5,
                          '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                          },
                          '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                          },
                        },
                      }}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <MenuItem onClick={() => handleNavigate('/profile')}>
                        <ListItemIcon><AccountIcon fontSize="small" /></ListItemIcon>
                        Profilim
                      </MenuItem>
                      {isCustomer && (
                        <MenuItem onClick={() => handleNavigate('/appointments')}>
                          <ListItemIcon><BookOnlineIcon fontSize="small" /></ListItemIcon>
                          Randevularım
                        </MenuItem>
                      )}
                      {isTherapist && (
                        <MenuItem onClick={() => handleNavigate('/therapist-dashboard')}>
                          <ListItemIcon><AdminIcon fontSize="small" /></ListItemIcon>
                          Terapist Paneli
                        </MenuItem>
                      )}
                      {isAdmin && (
                        <MenuItem onClick={() => handleNavigate('/admin')}>
                          <ListItemIcon><AdminIcon fontSize="small" /></ListItemIcon>
                          Admin Paneli
                        </MenuItem>
                      )}
                      <Divider />
                      <MenuItem onClick={handleLogout}>
                        <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                        <Typography color="error">Çıkış Yap</Typography>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button
                    component={RouterLink}
                    to="/auth"
                    startIcon={<AccountIcon />}
                    sx={navButtonStyles(location.pathname === '/auth')}
                  >
                     <Box sx={{ '@media (max-width: 768px)': { display: 'none' } }}>
                        Giriş Yap
                     </Box>
                  </Button>
                )}
              </Box>
            </Toolbar>
          </AppBar>
        </HideOnScroll>

        {/* Spacer for fixed header */}
        <Box sx={{ height: '80px' }} />

        {/* Main Content - Routing */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <motion.div style={{ backgroundColor: 'transparent' }} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <HomePage />
              </motion.div>
            } />
            <Route path="/services" element={
              <motion.div style={{ backgroundColor: 'transparent' }} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ServicesPage />
              </motion.div>
            } />
            <Route path="/therapists" element={
              <motion.div style={{ backgroundColor: 'transparent' }} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <TherapistsPage />
              </motion.div>
            } />
            <Route path="/booking/:serviceId" element={
              <motion.div style={{ backgroundColor: 'transparent' }} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <BookingPage />
              </motion.div>
            } />
            <Route path="/randevu" element={
              <motion.div style={{ backgroundColor: 'transparent' }} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <BookingPage />
              </motion.div>
            } />
            <Route path="/appointments" element={
              <motion.div style={{ backgroundColor: 'transparent' }} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <AppointmentManagementPage />
              </motion.div>
            } />
                      <Route path="/auth" element={
            <motion.div style={{ backgroundColor: 'transparent' }} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <LoginRegisterPage />
            </motion.div>
          } />
          <Route path="/profile" element={
            <motion.div style={{ backgroundColor: 'transparent' }} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <ProfilePage />
            </motion.div>
          } />
            <Route path="/admin" element={
              <motion.div style={{ backgroundColor: 'transparent' }} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <AdminDashboard />
              </motion.div>
            } />
            <Route path="/therapist-dashboard" element={
              <motion.div style={{ backgroundColor: 'transparent' }} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <TherapistDashboard />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </Box>
    </>
  );
}

export default App;
