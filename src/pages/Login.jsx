import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = ({ onLogin }) => { // 1. استلام الدالة onLogin كـ Prop
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const response = await axios.post(
            'https://education-scj0.onrender.com/api/auth/login',
            {
                email: email.trim(), // إزالة أي مسافات زائدة
                password: password
            },
            {
                headers: {
                    'Content-Type': 'application/json' // تأكيد نوع البيانات
                }
            }
        );

        // تخزين البيانات...
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        if (onLogin) onLogin(); 
        navigate('/');

    } catch (err) {
        // طباعة الخطأ في الكونسول لمعرفة السبب الدقيق أثناء التطوير
        console.error("Login Error Details:", err.response?.data);
        setError(err.response?.data?.message || 'فشل تسجيل الدخول. تأكد من البيانات.');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4" dir="rtl">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <GraduationCap className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">تسجيل الدخول</h2>
                    <p className="text-slate-500 mt-2">مرحباً بك في منصتي التعليمية</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6 flex items-center gap-3 text-red-700">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                        <div className="relative">
                            <Mail className="absolute right-3 top-3 text-slate-400" size={20} />
                            <input 
                                type="email" 
                                required
                                className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-right"
                                placeholder="example@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-3 text-slate-400" size={20} />
                            <input 
                                type="password" 
                                required
                                className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-right"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? 'جاري التحميل...' : 'دخول'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
