import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        email: searchParams.get('email') || '',
        token: searchParams.get('token') || '',
        newPassword: '',
        confirmNewPassword: ''
    });

    useEffect(() => {
        // Token ve email yoksa login sayfasına yönlendir
        if (!formData.token || !formData.email) {
            setError('Geçersiz şifre sıfırlama linki.');
        }
    }, [formData.token, formData.email]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmNewPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await apiService.resetPassword({
                email: formData.email,
                token: formData.token,
                newPassword: formData.newPassword,
                confirmNewPassword: formData.confirmNewPassword
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.message || 'Şifre sıfırlama başarısız.');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            setError('Şifre sıfırlama sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom color="success.main">
                        ✅ Şifreniz Başarıyla Sıfırlandı!
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Yeni şifrenizle giriş yapabilirsiniz. 3 saniye sonra giriş sayfasına yönlendirileceksiniz.
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom align="center">
                    🔐 Şifre Sıfırlama
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        margin="normal"
                        disabled
                        helperText="Email adresi otomatik olarak dolduruldu"
                    />
                    
                    <TextField
                        fullWidth
                        label="Yeni Şifre"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                        helperText="En az 6 karakter olmalıdır"
                    />
                    
                    <TextField
                        fullWidth
                        label="Yeni Şifre (Tekrar)"
                        name="confirmNewPassword"
                        type="password"
                        value={formData.confirmNewPassword}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                        error={formData.newPassword !== formData.confirmNewPassword && formData.confirmNewPassword !== ''}
                        helperText={formData.newPassword !== formData.confirmNewPassword && formData.confirmNewPassword !== '' ? 'Şifreler eşleşmiyor' : ''}
                    />
                    
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading || !formData.token || !formData.email}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Şifremi Sıfırla'}
                    </Button>
                    
                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => navigate('/login')}
                        sx={{ mt: 1 }}
                    >
                        Giriş Sayfasına Dön
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default ResetPasswordPage;
