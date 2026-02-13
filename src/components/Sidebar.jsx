import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, Users, LogOut, GraduationCap, 
  BookOpen, DollarSign, ClipboardCheck, UserCheck, Megaphone 
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { role: 'student' }; 

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');  
    if (onLogout) onLogout();
    navigate('/login'); 
  };

  const menuItems = [
    { name: 'الرئيسية', path: '/', icon: LayoutDashboard, roles: ['admin', 'teacher'] },
    { name: 'إضافة كورس', path: '/add-course', icon: PlusCircle, roles: ['teacher'] },
    { name: 'كورساتي', path: '/my-courses', icon: BookOpen, roles: ['teacher'] },
    { name: 'إدارة الطلاب', path: '/admin/students', icon: UserCheck, roles: ['admin'] },
    // تم إصلاح عنصر نتائج الطلاب هنا ليتوافق مع باقي العناصر
    { name: 'نتائج الطلاب', path: '/admin/results', icon: ClipboardCheck, roles: ['admin', 'teacher'] },
    { name: 'إدارة المستخدمين', path: '/admin/users', icon: Users, roles: ['admin'] },
    { name: 'إدارة الإعلانات', path: '/admin/announcements', icon: Megaphone, roles: ['admin'] },
    { name: 'الأرباح والتقارير', path: '/reports', icon: DollarSign, roles: ['admin'] },
    { name: 'إدارة المحتوى', path: '/admin/all-content', icon: BookOpen, roles: ['admin'] },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col sticky top-0" dir="rtl">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-lg">
           <GraduationCap className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold text-white tracking-wide">منصة خطوة بخطوة التعليمية</span>
      </div>

      <nav className="flex-1 overflow-y-auto mt-4 px-2">
        {menuItems
          .filter(item => item.roles.includes(user.role))
          .map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 p-3 rounded-xl mb-1 transition-all duration-200 ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {/* استدعاء الأيقونة كـ Component */}
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-4 px-3 py-2 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-500">تم تسجيل الدخول كـ:</p>
            <p className="text-sm font-bold text-blue-400 truncate">{user.username || user.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors text-right justify-start"
        >
          <LogOut size={20} />
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
