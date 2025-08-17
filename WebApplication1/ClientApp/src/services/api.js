const API_BASE_URL = 'http://localhost:5058/api';

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Auth endpoints
    async login(credentials) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    }

    async forgotPassword(email) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });
            return await response.json();
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    async resetPassword(data) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    async verifyEmail(data) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Verify email error:', error);
            throw error;
        }
    }

    // Services
    async getServices() {
        try {
            const response = await fetch(`${this.baseUrl}/services`);
            return await response.json();
        } catch (error) {
            console.error('Get services error:', error);
            throw error;
        }
    }

    // Therapists
    async getTherapists() {
        try {
            const response = await fetch(`${this.baseUrl}/therapists`);
            return await response.json();
        } catch (error) {
            console.error('Get therapists error:', error);
            throw error;
        }
    }

    // Appointments
    async getAppointments() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.baseUrl}/appointments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Get appointments error:', error);
            throw error;
        }
    }

    async createAppointment(appointmentData) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.baseUrl}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appointmentData)
            });
            return await response.json();
        } catch (error) {
            console.error('Create appointment error:', error);
            throw error;
        }
    }

    async deleteAppointment(id) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.baseUrl}/appointments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Delete appointment error:', error);
            throw error;
        }
    }

    // Availability
    async getAvailabilitySlots() {
        try {
            const response = await fetch(`${this.baseUrl}/availability`);
            return await response.json();
        } catch (error) {
            console.error('Get availability error:', error);
            throw error;
        }
    }

    async createAvailabilitySlot(slotData) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.baseUrl}/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(slotData)
            });
            return await response.json();
        } catch (error) {
            console.error('Create availability error:', error);
            throw error;
        }
    }

    // Admin endpoints
    async getDashboardStats() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.baseUrl}/admin/dashboard/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            throw error;
        }
    }

    // Payment
    async simulatePayment(paymentData) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/simulate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });
            return await response.json();
        } catch (error) {
            console.error('Payment simulation error:', error);
            throw error;
        }
    }
}

export default new ApiService();



