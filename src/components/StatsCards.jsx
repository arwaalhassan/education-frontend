import React from 'react';
import { Users, Video, DollarSign, Star } from 'lucide-react';

const StatsCards = ({ stats }) => {
  // استخدام التنسيق العربي للأرقام أو التنسيق القياسي
  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString('en-US');
  };

  const cards = [
    { 
      id: 1, 
      title: 'إجمالي الطلاب', 
      value: formatNumber(stats?.totalStudents), 
      icon: Users, 
      color: 'bg-blue-500' 
    },
    { 
      id: 2, 
      title: 'الكورسات المرفوعة', 
      value: formatNumber(stats?.totalCourses), 
      icon: Video, 
      color: 'bg-green-500' 
    },
    { 
      id: 3, 
      title: 'إجمالي الأرباح', 
      value: `$${formatNumber(stats?.totalEarnings)}`, 
      icon: DollarSign, 
      color: 'bg-yellow-600' // تغميق اللون قليلاً للوضوح
    },
    { 
      id: 4, 
      title: 'تقييم المنصة', 
      value: stats?.rating || '4.9', 
      icon: Star, 
      color: 'bg-purple-500' 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((item) => (
        <div 
          key={item.id} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-lg hover:-translate-y-1"
        >
          <div className="text-right"> {/* التأكد من المحاذاة لليمين */}
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{item.title}</p>
            <h3 className="text-2xl font-black text-gray-800 mt-1">{item.value}</h3>
          </div>
          <div className={`${item.color} p-3 rounded-xl text-white shadow-inner`}>
            <item.icon size={26} />
          </div>
        </div>
      ))}
    </div>                                                                                                                                                                 
  );
};

export default StatsCards;
