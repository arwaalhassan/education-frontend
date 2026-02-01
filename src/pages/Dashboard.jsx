import React, { useEffect, useState, useCallback } from 'react';
import api from "../services/api"; 
import StatsCards from "../components/StatsCards";
import TeacherEarnings from "../components/TeacherEarnings"; 
import { RefreshCcw } from 'lucide-react'; // أيقونة للتحديث

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // جلب بيانات المستخدم مع حماية ضد القيم الفارغة
  const user = JSON.parse(localStorage.getItem('user')) || { role: 'guest', username: 'زائر' };

  // استخدام useCallback لجعل الدالة قابلة للاستدعاء يدوياً ولتجنب الـ Re-renders
  const fetchDashboardData = useCallback(async () => {
    if (user.role === 'admin') {
      setLoading(true);
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error("خطأ في جلب إحصائيات الآدمن:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [user.role]); // تعتمد فقط على دور المستخدم

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-right font-sans" dir="rtl">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">مرحباً، {user.username} 👋</h1>
          <p className="text-gray-500 mt-2">إليك نظرة سريعة على ما يحدث في المنصة اليوم.</p>
        </div>
        
        {/* زر التحديث اليدوي للآدمن */}
        {user.role === 'admin' && (
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all shadow-sm"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            تحديث البيانات
          </button>
        )}
      </header>
      
      {/* عرض مكون الأرباح للأستاذ */}
      {user.role === 'teacher' && <TeacherEarnings />}

      {/* عرض بطاقات الإحصائيات للآدمن */}
      {user.role === 'admin' && (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl shadow-sm"></div>
            ))}
          </div>
        ) : (
          <StatsCards stats={stats} />
        )
      )}

      {/* تنبيه الحالة أو النشاط الأخير */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8 transition-all hover:shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
          تحديثات النظام
        </h2>
        <div className="border-r-4 border-blue-500 bg-blue-50 p-5 rounded-xl">
           <p className="text-blue-900 font-medium">
             نظام التقارير المتقدم يعمل الآن. يمكنك مراقبة الأداء المالي ونشاط الطلاب بدقة من خلال صفحة التقارير.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
