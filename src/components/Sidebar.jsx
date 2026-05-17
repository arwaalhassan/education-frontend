import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, Users, LogOut, BookOpen, 
  DollarSign, ClipboardCheck, UserCheck, Megaphone, Ticket, Menu, X 
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // 📱 حالة التحكم في فتح وإغلاق القائمة على الموبايل
  const user = JSON.parse(localStorage.getItem('user')) || { role: 'student' }; 

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');  
    if (onLogout) onLogout();
    navigate('/login'); 
  };

  // 🟢 تحديث مصفوفة الصلاحيات لتشمل الموظف (employee) في الصفحات المسموحة له
  const menuItems = [
    { name: 'الرئيسية', path: '/', icon: LayoutDashboard, roles: ['admin', 'teacher'] },
    { name: 'إضافة كورس', path: '/add-course', icon: PlusCircle, roles: ['teacher'] },
    { name: 'كورساتي', path: '/my-courses', icon: BookOpen, roles: ['teacher'] },
    { name: 'إدارة الطلاب', path: '/admin/students', icon: UserCheck, roles: ['admin', 'employee'] },
    { name: 'نتائج الطلاب', path: '/admin/results', icon: ClipboardCheck, roles: ['admin', 'teacher'] },
    { name: 'إدارة المستخدمين', path: '/admin/users', icon: Users, roles: ['admin', 'employee'] },
    { name: 'إدارة الإعلانات', path: '/admin/announcements', icon: Megaphone, roles: ['admin'] },
    { name: 'الأرباح والتقارير', path: '/reports', icon: DollarSign, roles: ['admin'] },
    { name: 'إدارة الكوبونات', path: '/admin/coupons', icon: Ticket, roles: ['admin'] },
    { name: 'إدارة المحتوى', path: '/admin/all-content', icon: BookOpen, roles: ['admin', 'employee'] }, // الموظف يدخل هنا للتصدير
  ];

  return (
    <>
      {/* 📱 1. شريط علوي يظهر فقط على الموبايل يحتوي على زر الهامبرغر والشعار */}
      <div className="lg:hidden w-full bg-slate-900 text-white h-16 flex items-center justify-between px-4 sticky top-0 z-50 shadow-md" dir="rtl">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg">
            <img src="/icon1.png" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          <span className="text-lg font-bold">Great! Plattform</span>
        </div>
        {/* زر الفتح والإغلاق للموبايل */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 📱 2. خلفية معتمة (Overlay) تظهر عند فتح القائمة على الموبايل لإغلاقها عند الضغط في أي مكان فارغ */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ⚙️ 3. الـ Sidebar الأساسي (متجاوب: ثابت على الويب، منزلق Dynamic على الموبايل) */}
      <div 
        className={`fixed lg:sticky top-0 right-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out border-l border-slate-800
          ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}
        dir="rtl"
      >
        {/* رأس القائمة (يختفي في الموبايل لأن الشريط العلوي يعوضه) */}
        <div className="hidden lg:flex p-6 items-center gap-3 border-b border-slate-800">
          <div className="bg-white p-1 rounded-lg shadow-md overflow-hidden shrink-0">
            <img src="/icon1.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-xl font-bold tracking-wide">Great! Plattform</span>
        </div>

        {/* جسم القائمة - الروابط */}
        <nav className="flex-1 overflow-y-auto mt-4 px-2 custom-scrollbar">
          {menuItems
            .filter(item => item.roles.includes(user.role))
            .map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path}
                // عند الضغط على أي رابط في الموبايل يتم إغلاق القائمة تلقائياً
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-3 p-3 rounded-xl mb-1 transition-all duration-200 ${
                    isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium text-sm md:text-base">{item.name}</span>
              </NavLink>
            ))}
        </nav>

        {/* تذييل القائمة - معلومات المستخدم وتسجيل الخروج */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="mb-4 px-3 py-2 bg-slate-800/40 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-500">تم تسجيل الدخول كـ:</p>
              <p className="text-xs font-bold text-blue-400 truncate mt-0.5">{user.username || user.email}</p>
              <span className="inline-block mt-1 text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-medium">
                {user.role === 'admin' ? 'مدير النظام' : user.role === 'employee' ? 'موظف / إداري' : 'مدرس'}
              </span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-950/30 rounded-xl transition-colors text-right justify-start text-sm font-medium"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
