import React, { useEffect, useState } from 'react';
import { Users, Eye } from 'lucide-react'; // استيراد أيقونات الطلاب والمشاهدات
import api from '../services/api';

const TeacherStats = () => {
  // تهيئة الحالة بالبيانات الجديدة: عدد الطلاب وإجمالي المشاهدات
  const [stats, setStats] = useState({ totalStudents: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // يمكنكِ تعديل الـ Endpoint هنا حسب المسار في السيرفر الخاص بكِ
        const res = await api.get('courses/stats'); 
        setStats(res.data);
      } catch (err) { 
        console.error("فشل جلب إحصائيات المعلم"); 
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-4 text-gray-500">جاري تحميل الإحصائيات...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-right" dir="rtl">
      
      {/* عدد الطلاب المشتركين */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border-r-4 border-blue-500 transition-all hover:shadow-md">
        <div className="flex justify-between items-center">
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <Users size={24} />
          </div>
          <span className="text-gray-500 text-sm font-medium">إجمالي الطلاب المشتركين</span>
        </div>
        <p className="text-3xl font-bold mt-4 text-gray-800">
          {stats.totalStudents.toLocaleString()} <span className="text-sm font-normal text-gray-500">طالب</span>
        </p>
      </div>

      {/* عدد المشاهدات الإجمالي */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border-r-4 border-emerald-500 transition-all hover:shadow-md">
        <div className="flex justify-between items-center">
          <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
            <Eye size={24} />
          </div>
          <span className="text-gray-500 text-sm font-medium">إجمالي مشاهدات الدروس</span>
        </div>
        <p className="text-3xl font-bold mt-4 text-gray-800">
          {stats.totalViews.toLocaleString()} <span className="text-sm font-normal text-gray-500">مشاهدة</span>
        </p>
      </div>

    </div>
  );
};

export default TeacherStats;
