import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, PieChart, Wallet } from 'lucide-react';
import api from '../services/api';

const TeacherEarnings = () => {
  const [earnings, setEarnings] = useState({ totalSales: 0, platformCommission: 0, netEarnings: 0 });

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await api.get('courses/earnings');
        setEarnings(res.data);
      } catch (err) { console.error("فشل جلب الأرباح"); }
    };
    fetchEarnings();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-right" dir="rtl">
      {/* إجمالي المبيعات */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border-r-4 border-blue-500">
        <div className="flex justify-between items-center">
          <div className="bg-blue-50 p-3 rounded-full text-blue-600"><TrendingUp /></div>
          <span className="text-gray-500 text-sm font-medium">إجمالي المبيعات</span>
        </div>
        <p className="text-2xl font-bold mt-4 text-gray-800">{earnings.totalSales} ج.م</p>
      </div>

      {/* عمولة المنصة */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border-r-4 border-orange-500">
        <div className="flex justify-between items-center">
          <div className="bg-orange-50 p-3 rounded-full text-orange-600"><PieChart /></div>
          <span className="text-gray-500 text-sm font-medium">عمولة المنصة (20%)</span>
        </div>
        <p className="text-2xl font-bold mt-4 text-gray-800">{earnings.platformCommission} ج.م</p>
      </div>

      {/* صافي الربح */}
    <div className="bg-linear-to-br from-green-600 to-emerald-700 p-6 rounded-2xl shadow-lg text-white">
  <div className="flex justify-between items-center">
    {/* أيقونة المحفظة مع خلفية شبه شفافة */}
    <div className="bg-white/20 p-3 rounded-full">
      <Wallet size={24} />
    </div>
    <span className="text-white/90 text-sm font-medium">صافي أرباحك</span>
  </div>
  <div className="mt-4">
    <p className="text-3xl font-bold tracking-tight">
      {earnings.netEarnings.toLocaleString()} <span className="text-sm font-normal text-green-100">ج.م</span>
    </p>
  </div>
</div>
</div>
  );
};

export default TeacherEarnings;