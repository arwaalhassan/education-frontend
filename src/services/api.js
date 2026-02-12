import axios from 'axios';

const api = axios.create({
    baseURL: 'https://education-scj0.onrender.com/api', 
});

// [1] Interceptor للطلبات الصادرة: إضافة التوكن تلقائياً
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// [2] Interceptor للردود الواردة: معالجة انتهاء الصلاحية (401)
api.interceptors.response.use(
    (response) => response, // إذا كان الرد ناجحاً، مرره كما هو
    (error) => {
        // إذا كان الخطأ 401 (غير مصرح به) فهذا يعني التوكن انتهى أو تلاعب به أحد
        if (error.response && error.response.status === 401) {
            console.error("الجلسة انتهت، جاري تسجيل الخروج...");
            
            // تنظيف البيانات المحلية
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // توجيه المستخدم لصفحة تسجيل الدخول
            // نستخدم window.location لأننا خارج سياق React Router هنا
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
