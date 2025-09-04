import axios from 'axios'
import { useAuthStore } from '../store/AuthStore'

const api = axios.create({
    baseURL: 'http://localhost:8000'
});


// Request interceptor - automatically adds token to all requests
api.interceptors.request.use(
    (config) => {
        const {token} = useAuthStore.getState();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

// Response interceptor - handles token expiration
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            const {clearAuth} = useAuthStore.getState();
            clearAuth();
            window.location.href = '/login'; // Redirect to login
        }
        return Promise.reject(error);
    }
)

export default api;