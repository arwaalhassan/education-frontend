import axios from 'axios';

const api = axios.create({
  baseURL: 'https://education-scj0.onrender.com/api', 
});

// إضافة التوكن تلقائياً لكل الطلبات بعد تسجيل الدخول
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
