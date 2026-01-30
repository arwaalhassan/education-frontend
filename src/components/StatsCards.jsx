import React from 'react';
import { Users, Video, DollarSign, Star } from 'lucide-react';

const StatsCards = ({ stats }) => {
  // بيانات تجريبية في حال لم تصل البيانات من الباك-إند بعد
  const defaultStats = [
    { id: 1, title: 'إجمالي الطلاب', value: stats?.totalStudents || '0', icon: Users, color: 'bg-blue-500' },
    { id: 2, title: 'الكورسات المرفوعة', value: stats?.totalCourses || '0', icon: Video, color: 'bg-green-500' },
    { id: 3, title: 'إجمالي الأرباح', value: `$${stats?.totalEarnings || '0'}`, icon: DollarSign, color: 'bg-yellow-500' },
    { id: 4, title: 'تقييم الأستاذ', value: stats?.rating || '4.9', icon: Star, color: 'bg-purple-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {defaultStats.map((item) => (
        <div key={item.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center justify-between transition-transform hover:scale-105">
          <div>
            <p className="text-gray-500 text-sm font-medium">{item.title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{item.value}</h3>
          </div>
          <div className={`${item.color} p-3 rounded-lg text-white`}>
            <item.icon size={24} />
          </div>
        </div>
      ))}
    </div>                                                                                             
  );
};

export default StatsCards;