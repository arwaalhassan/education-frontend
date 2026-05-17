import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Users, Shield, UserMinus, UserCheck, Search, 
    UserPlus, X, SmartphoneNfc, Trash2, CheckCircle, Smartphone 
} from 'lucide-react';
import * as XLSX from "xlsx";

const UsersControl = () => {
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const isAdmin = currentUser.role === 'admin';
    const isEmployee = currentUser.role === 'employee'; 
    
    const [roleFilter, setRoleFilter] = useState('all');
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'student',
        address: ''
    });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("خطأ في جلب البيانات");
        } finaly {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleResetDevice = async (userId) => {
        if (!window.confirm("هل أنت متأكد من فك قفل الجهاز لهذا المستخدم؟")) return;
        try {
            await api.put('/admin/users/reset-device', { userId });
            alert("تم إعادة تعيين الجهاز بنجاح");
        } catch (err) {
            alert(err.response?.data?.message || "فشلت عملية إعادة التعيين");
        }
    };

    const sendWhatsApp = (phone, code) => {
        if (!phone) return alert("لا يوجد رقم هاتف لهذا المستخدم");
        let cleanPhone = phone.toString().replace(/[\s\+\-\(\)]/g, '');
        if (cleanPhone.startsWith('09') && cleanPhone.length === 10) {
            cleanPhone = '963' + cleanPhone.substring(1);
        } 
        else if (cleanPhone.startsWith('00963')) {
            cleanPhone = cleanPhone.substring(2);
        }
        else if (cleanPhone.startsWith('9') && cleanPhone.length === 9) {
            cleanPhone = '963' + cleanPhone;
        }
        else if (cleanPhone.startsWith('96309')) {
            cleanPhone = '963' + cleanPhone.substring(4);
        }

        const message = `مرحباً بك في منصتنا التعليمية 🎓\n\nكود تفعيل حسابك الخاص بك هو: *${code}*\n\nيرجى إدخال هذا الكود في التطبيق لتفعيل الحساب.`;
        const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
            alert("يرجى السماح بالنوافذ المنبثقة (Pop-ups) لتتمكن من فتح الواتساب يدوياً.");
        }
    };

    const handleDeleteUser = async (id, full_name) => {
        if (!window.confirm(`هل أنت متأكد من حذف المستخدم (${full_name})؟`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            alert("تم حذف المستخدم بنجاح");
        } catch (err) {
            alert(err.response?.data?.message || "فشلت الحذف");
        }
    };

    const handleToggleStatus = async (id) => {
        if (isEmployee) return alert("عذراً، لا تملك صلاحية تعديل حالة حسابات المستخدمين.");
        try {
            const response = await api.patch(`/admin/users/${id}/status`);
            const newStatus = response.data.is_active;
            setUsers(users.map(u => u.id === id ? { ...u, is_active: newStatus } : u));
        } catch (err) {
            alert("فشلت عملية تحديث الحالة");
        }
    };

    const handleChangeRole = async (id, newRole) => {
        if (isEmployee) return alert("عذراً، لا تملك صلاحية تغيير رتب المستخدمين.");
        try {
            await api.put(`/admin/users/${id}/role`, { role: newRole });
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
            alert("تم تحديث الرتبة");
        } catch (err) {
            alert("خطأ في التحديث");
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/users', newUser);
            const addedUser = {
                id: res.data.userId,
                ...newUser,
                is_active: 1,
                is_verified: (newUser.role === 'admin' || newUser.role === 'teacher' || newUser.role === 'employee') ? 1 : 0,
                verification_code: res.data.verificationCode || '---'
            };
            setUsers([addedUser, ...users]);
            setShowAddModal(false);
            setNewUser({ full_name: '', email: '', password: '', phone: '', role: 'student', address: '' });
            alert("تم إضافة المستخدم بنجاح");
        } catch (err) {
            alert(err.response?.data?.message || "خطأ في إضافة المستخدم");
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            (u.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role?.toLowerCase() === roleFilter;
        return matchesSearch && matchesRole;
    });

    const exportToExcel = () => {
        const dataToExport = filteredUsers.map(u => ({
            FullName: u.full_name,
            Email: u.email,
            Phone: u.phone,
            Role: u.role,
            Active: u.is_active ? "Active" : "Inactive",
            Verified: u.is_verified ? "Yes" : "No",
            Address: u.address
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, "users.xlsx");
    };

    // دالة مساعدة لعرض الاسم العربي للدور/الرتبة
    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin': return 'مدير';
            case 'teacher': return 'أستاذ';
            case 'employee': return 'موظف';
            default: return 'طالب';
        }
    };

    if (loading) return <div className="p-10 text-center font-bold">جاري تحميل البيانات...</div>;

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen font-sans" dir="rtl">
            
            {/* 📱 رأس الصفحة */}
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 mb-6">
                <h1 className="text-xl md:text-2xl font-black flex items-center gap-2 text-slate-800">
                    <Users className="text-blue-600 shrink-0" size={26} /> إدارة المستخدمين
                </h1>
                
                <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-3 w-full xl:w-auto">
                    
                    {/* حقل البحث */}
                    <div className="relative w-full sm:w-60">
                        <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الإيميل..."
                            className="w-full pr-10 pl-4 py-2 border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* قائمة اختيار الأدوار في الفلتر العلوي */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full sm:w-auto border border-slate-200 bg-white px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                    >
                        <option value="all">كل المستخدمين</option>
                        <option value="student">طلاب</option>
                        <option value="teacher">أستاذة</option>
                        <option value="employee">موظفين</option>
                        <option value="admin">مدراء</option>
                    </select>

                    {/* أزرار العمليات */}
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={exportToExcel}
                            className="flex-1 sm:flex-none justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm transition-colors"
                        >
                            تصدير Excel
                        </button>
                        
                        {isAdmin && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex-1 sm:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm transition-colors shrink-0"
                            >
                                <UserPlus size={16} /> إضافة مستخدم
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 🖥️ 1. عرض جدول الكمبيوتر */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="p-4 border-b font-bold text-sm">المستخدم</th>
                            <th className="p-4 border-b text-center font-bold text-sm">الهاتف</th>
                            <th className="p-4 border-b text-center font-bold text-sm">الدور</th>
                            <th className="p-4 border-b text-center font-bold text-sm">الحالة</th>
                            <th className="p-4 border-b text-center font-bold text-sm">كود التحقق</th>
                            <th className="p-4 border-b text-center font-bold text-sm">العنوان</th>
                            <th className="p-4 border-b text-center font-bold text-sm">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50/80 transition">
                                <td className="p-4">
                                    <div className="font-black text-slate-800">{user.full_name}</div>
                                    <div className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</div>
                                </td>
                                <td className="p-4 text-center text-blue-600 font-mono text-sm font-bold">
                                    {user.phone || '---'}
                                </td>
                                <td className="p-4 text-center">
                                    {isEmployee ? (
                                        <span className="bg-blue-50 text-blue-700 text-xs font-bold rounded-lg px-2.5 py-1 border border-blue-100">
                                            {getRoleLabel(user.role)}
                                        </span>
                                    ) : (
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                            className="bg-blue-50 text-blue-700 text-xs font-bold rounded-lg px-2 py-1 outline-none border border-blue-100"
                                        >
                                            <option value="student">طالب</option>
                                            <option value="teacher">أستاذ</option>
                                            <option value="employee">موظف</option>
                                            <option value="admin">مدير</option>
                                        </select>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.is_active ? 'نشط' : 'معطل'}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    {user.is_verified ? (
                                        <span className="text-green-600 text-xs font-bold flex items-center justify-center gap-1">
                                            <CheckCircle size={14} /> مفعّل
                                        </span>
                                    ) : (
                                        <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg font-mono font-bold text-sm border border-amber-200">
                                            {user.verification_code}
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-center text-sm text-slate-500">{user.address || '---'}</td>
                                <td className="p-4">
                                    <div className="flex gap-1.5 justify-center">
                                        {!user.is_verified && user.phone && (
                                            <button
                                                onClick={() => sendWhatsApp(user.phone, user.verification_code)}
                                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition shadow-sm"
                                                title="إرسال للواتساب"
                                            >
                                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.92c1.516.903 3.009 1.357 4.605 1.358 5.403 0 9.803-4.398 9.805-9.802.001-2.617-1.02-5.077-2.872-6.93-1.852-1.854-4.312-2.874-6.931-2.874-5.405 0-9.803 4.398-9.806 9.801 0 1.691.479 3.177 1.386 4.611l-.993 3.626 3.746-.983z"/></svg>
                                            </button>
                                        )}
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleToggleStatus(user.id)}
                                                className={`p-2 rounded-xl border transition ${user.is_active ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                                                title={user.is_active ? "تعطيل" : "تفعيل"}
                                            >
                                                {user.is_active ? <UserMinus size={16}/> : <UserCheck size={16}/>}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleResetDevice(user.id)}
                                            className="p-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                                            title="فك قفل الجهاز"
                                        >
                                            <SmartphoneNfc size={16} />
                                        </button>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.full_name)}
                                                className="p-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition"
                                                title="حذف"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 📱 2. عرض الموبايل الذكي */}
            <div className="lg:hidden grid grid-cols-1 gap-4">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-slate-800 text-base">{user.full_name}</h3>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {user.is_active ? 'نشط' : 'معطل'}
                            </span>
                        </div>

                        <hr className="border-slate-100" />

                        <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600">
                            <div><span className="text-slate-400">الهاتف:</span> <span className="font-mono text-blue-600 font-bold">{user.phone || '---'}</span></div>
                            <div className="flex items-center gap-1">
                                <span className="text-slate-400">الدور:</span> 
                                {isEmployee ? (
                                    <span className="font-bold text-slate-800">{getRoleLabel(user.role)}</span>
                                ) : (
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                        className="bg-slate-50 border border-slate-200 px-1 py-0.5 rounded font-bold text-slate-700"
                                    >
                                        <option value="student">طالب</option>
                                        <option value="teacher">أستاذ</option>
                                        <option value="employee">موظف</option>
                                        <option value="admin">مدير</option>
                                    </select>
                                )}
                            </div>
                            <div>
                                <span className="text-slate-400">الكود:</span>
                                <span className="mr-1">
                                    {user.is_verified ? (
                                        <span className="text-green-600 font-bold inline-flex items-center gap-0.5"><CheckCircle size={12} /> مفعّل</span>
                                    ) : (
                                        <span className="bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded font-bold font-mono">{user.verification_code}</span>
                                    )}
                                </span>
                            </div>
                            <div className="truncate"><span className="text-slate-400">العنوان:</span> <span>{user.address || '---'}</span></div>
                        </div>

                        <div className="flex gap-2 border-t border-slate-50 pt-3 mt-1">
                            {!user.is_verified && user.phone && (
                                <button
                                    onClick={() => sendWhatsApp(user.phone, user.verification_code)}
                                    className="flex-1 py-2 bg-green-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                                >
                                    واتساب
                                </button>
                            )}
                            <button
                                onClick={() => handleResetDevice(user.id)}
                                className="flex-1 py-2 border border-blue-200 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                            >
                                <Smartphone size={14} /> فك القفل
                            </button>
                            
                            {isAdmin && (
                                <>
                                    <button
                                        onClick={() => handleToggleStatus(user.id)}
                                        className={`p-2 border rounded-xl ${user.is_active ? 'border-orange-200 text-orange-600' : 'border-green-200 text-green-600'}`}
                                    >
                                        {user.is_active ? <UserMinus size={15}/> : <UserCheck size={15}/>}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id, user.full_name)}
                                        className="p-2 border border-red-200 text-red-600 rounded-xl"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal إضافة مستخدم للأدمن */}
            {showAddModal && isAdmin && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" dir="rtl">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-black text-slate-800">إضافة مستخدم جديد للمنصة</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 bg-slate-50 p-1.5 rounded-lg"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleAddUser} className="space-y-3.5 text-right">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">الاسم الكامل</label>
                                <input type="text" required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">البريد الإلكتروني</label>
                                <input type="email" required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm font-mono outline-none focus:border-blue-500" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">كلمة المرور</label>
                                <input type="password" required className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">رقم الهاتف</label>
                                <input type="text" required placeholder="09xxxxxxxx" className="w-full border border-slate-200 p-2.5 rounded-xl text-sm font-mono outline-none focus:border-blue-500" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">العنوان السكني</label>
                                <input type="text" className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500" value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">الدور (الرتبة)</label>
                                <select className="w-full border border-slate-200 p-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 bg-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                    <option value="student">طالب</option>
                                    <option value="teacher">أستاذ</option>
                                    <option value="employee">موظف / إداري</option>
                                    <option value="admin">مدير (أدمن)</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-md transition-colors mt-2">إنشاء وتفعيل الحساب</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersControl;
