import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';

function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    useEffect(() => {
        if (email && token) {
            verifyEmail();
        } else {
            setError('Geçersiz email doğrulama linki.');
        }
    }, [email, token]);

    const verifyEmail = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await apiService.verifyEmail({
                email: email,
                token: token
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.message || 'Email doğrulama başarısız.');
            }
        } catch (error) {
            console.error('Email verification error:', error);
            setError('Email doğrulama sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6">
                        Email doğrulanıyor...
                    </Typography>
                </Paper>
            </Container>
        );
    }

    if (success) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom color="success.main">
                        ✅ Email Başarıyla Doğrulandı!
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Hesabınız artık aktif. 3 saniye sonra giriş sayfasına yönlendirileceksiniz.
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    📧 Email Doğrulama
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
                    Email adresinizi doğrulamak için aşağıdaki butona tıklayın.
                </Typography>

                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        onClick={verifyEmail}
                        disabled={loading}
                        sx={{ mr: 2 }}
                    >
                        Email'i Doğrula
                    </Button>
                    
                    <Button
                        variant="text"
                        onClick={() => navigate('/login')}
                    >
                        Giriş Sayfasına Dön
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default VerifyEmailPage;
