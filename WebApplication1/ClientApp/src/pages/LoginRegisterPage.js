import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

function LoginRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: ''
  });

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  const showAlert = (message, severity = 'success') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      });

      const result = await response.json();

      if (result.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);
        
        // Dispatch custom event to notify App.js about user state change
        window.dispatchEvent(new CustomEvent('userStateChanged', { 
          detail: { user: result.user } 
        }));
        
        showAlert('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
        
        // Redirect to intended page or home
        const from = location.state?.from?.pathname || '/';
        setTimeout(() => navigate(from), 1500);
      } else {
        showAlert(result.message, 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('Giriş yaparken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (registerForm.password !== registerForm.confirmPassword) {
      showAlert('Şifreler eşleşmiyor', 'error');
      setLoading(false);
      return;
    }

    if (registerForm.password.length < 6) {
      showAlert('Şifre en az 6 karakter olmalıdır', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerForm)
      });

      const result = await response.json();

      if (result.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);
        
        // Dispatch custom event to notify App.js about user state change
        window.dispatchEvent(new CustomEvent('userStateChanged', { 
          detail: { user: result.user } 
        }));
        
        showAlert(result.message, 'success');
        
        // Switch to login tab after successful registration
        setTimeout(() => {
          setActiveTab(0);
          setRegisterForm({
            name: '',
            surname: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
          });
        }, 2000);
      } else {
        showAlert(result.message, 'error');
      }
    } catch (error) {
      console.error('Register error:', error);
      showAlert('Kayıt olurken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(forgotPasswordForm)
      });

      const result = await response.json();
      showAlert(result.message, result.success ? 'success' : 'error');
      
      if (result.success) {
        setShowForgotPassword(false);
        setForgotPasswordForm({ email: '' });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showAlert('Şifre sıfırlama isteği gönderilirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'rgba(245, 241, 232, 0.3)', py: 4 }}>
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{ backgroundColor: '#F5F1E8', border: '2px solid #D4B896', overflow: 'hidden' }}>
            <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#8B6F47' }}>
              <AccountIcon sx={{ fontSize: 60, color: '#F5F1E8', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#F5F1E8', fontWeight: 'bold' }}>
                L'OR Masaj Merkezi
              </Typography>
              <Typography variant="body1" sx={{ color: '#F5F1E8', opacity: 0.9 }}>
                Hesabınıza giriş yapın veya yeni hesap oluşturun
              </Typography>
            </Box>

            {/* Alert */}
            <AnimatePresence>
              {alert.show && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ p: 2 }}>
                    <Alert severity={alert.severity} onClose={() => setAlert({ show: false, message: '', severity: 'success' })}>
                      {alert.message}
                    </Alert>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {showForgotPassword ? (
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ color: '#8B6F47', fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
                  Şifre Sıfırlama
                </Typography>
                <Box component="form" onSubmit={handleForgotPassword}>
                  <TextField
                    fullWidth
                    label="E-posta Adresi"
                    type="email"
                    value={forgotPasswordForm.email}
                    onChange={(e) => setForgotPasswordForm({ email: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#8B6F47' }} />
                        </InputAdornment>
                      ),
                    }}
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
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      onClick={() => setShowForgotPassword(false)}
                      variant="outlined"
                      fullWidth
                      sx={{
                        color: '#8B6F47',
                        borderColor: '#8B6F47',
                        '&:hover': {
                          backgroundColor: 'rgba(139, 111, 71, 0.1)'
                        }
                      }}
                    >
                      Geri
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      sx={{
                        backgroundColor: '#8B6F47',
                        '&:hover': {
                          backgroundColor: '#6B5437'
                        }
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Gönder'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            ) : (
              <>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    centered
                    sx={{
                      '& .MuiTab-root': {
                        color: '#8B6F47',
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                      },
                      '& .Mui-selected': {
                        color: '#8B6F47 !important'
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: '#8B6F47'
                      }
                    }}
                  >
                    <Tab label="Giriş Yap" />
                    <Tab label="Kayıt Ol" />
                  </Tabs>
                </Box>

                <CardContent sx={{ p: 4 }}>
                  <AnimatePresence mode="wait">
                    {activeTab === 0 ? (
                      <motion.div
                        key="login"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                      >
                        <Box component="form" onSubmit={handleLogin}>
                          <TextField
                            fullWidth
                            label="E-posta Adresi"
                            type="email"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailIcon sx={{ color: '#8B6F47' }} />
                                </InputAdornment>
                              ),
                            }}
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
                          <TextField
                            fullWidth
                            label="Şifre"
                            type={showPassword ? 'text' : 'password'}
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockIcon sx={{ color: '#8B6F47' }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                  >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
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
                          <Box sx={{ textAlign: 'right', mb: 3 }}>
                            <Link
                              component="button"
                              type="button"
                              onClick={() => setShowForgotPassword(true)}
                              sx={{ color: '#8B6F47', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                              Şifremi unuttum
                            </Link>
                          </Box>
                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{
                              backgroundColor: '#8B6F47',
                              py: 1.5,
                              '&:hover': {
                                backgroundColor: '#6B5437'
                              }
                            }}
                          >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
                          </Button>
                        </Box>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="register"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                      >
                        <Box component="form" onSubmit={handleRegister}>
                          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <TextField
                              fullWidth
                              label="Ad"
                              value={registerForm.name}
                              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon sx={{ color: '#8B6F47' }} />
                                  </InputAdornment>
                                ),
                              }}
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
                            <TextField
                              fullWidth
                              label="Soyad"
                              value={registerForm.surname}
                              onChange={(e) => setRegisterForm({ ...registerForm, surname: e.target.value })}
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
                          </Box>
                          <TextField
                            fullWidth
                            label="E-posta Adresi"
                            type="email"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailIcon sx={{ color: '#8B6F47' }} />
                                </InputAdornment>
                              ),
                            }}
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
                          <TextField
                            fullWidth
                            label="Telefon"
                            type="tel"
                            value={registerForm.phone}
                            onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon sx={{ color: '#8B6F47' }} />
                                </InputAdornment>
                              ),
                            }}
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
                          <TextField
                            fullWidth
                            label="Şifre"
                            type={showPassword ? 'text' : 'password'}
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockIcon sx={{ color: '#8B6F47' }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                  >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
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
                          <TextField
                            fullWidth
                            label="Şifre Tekrar"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={registerForm.confirmPassword}
                            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockIcon sx={{ color: '#8B6F47' }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                  >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
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
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{
                              backgroundColor: '#8B6F47',
                              py: 1.5,
                              '&:hover': {
                                backgroundColor: '#6B5437'
                              }
                            }}
                          >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Kayıt Ol'}
                          </Button>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </>
            )}
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}

export default LoginRegisterPage;