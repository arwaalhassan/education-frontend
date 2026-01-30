import React, { useEffect, useState } from 'react';
import api from "../services/api"; 
import StatsCards from "../components/StatsCards";
import TeacherEarnings from "../components/TeacherEarnings"; 

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // جلب بيانات المستخدم من localStorage
  const user = JSON.parse(localStorage.getItem('user')) || { role: 'guest' };

  useEffect(() => {
    const fetchDashboardData = async () => {
      // نجلب الإحصائيات فقط إذا كان المستخدم آدمن
      if (user.role === 'admin') {
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
    };

    fetchDashboardData();
  }, [user.role]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-right" dir="rtl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">مرحباً، {user.username || 'بك'}</h1>
        <p className="text-gray-500 mt-2">إليك نظرة سريعة على ما يحدث في المنصة اليوم.</p>
      </header>
      
      {/* عرض مكون الأرباح للأستاذ */}
      {user.role === 'teacher' && <TeacherEarnings />}

      {/* عرض بطاقات الإحصائيات للآدمن بعد التأكد من وصول البيانات */}
      {user.role === 'admin' && (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
          </div>
        ) : (
          <StatsCards stats={stats} />
        )
      )}

      {/* النشاط الأخير - يظهر للجميع بتصميم محسن */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">النشاط الأخير</h2>
        <div className="border-r-4 border-blue-500 bg-blue-50 p-4 rounded">
           <p className="text-blue-800">نظام التقارير يعمل الآن بكفاءة، يمكنك مراقبة الأرباح والطلاب من هنا.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;