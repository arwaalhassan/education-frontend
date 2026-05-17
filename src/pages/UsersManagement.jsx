import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Users, Shield, UserMinus, UserCheck, Search, 
    UserPlus, X, SmartphoneNfc, Trash2, CheckCircle 
} from 'lucide-react';
import * as XLSX from "xlsx";

const UsersControl = () => {
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const isAdmin = currentUser.role === 'admin';
    const isEmployee = currentUser.role === 'employee'; // 🔑 تم تفعيلها واستخدامها أدناه
    
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
            setUsers(res.data);
        } catch (err) {
            console.error("خطأ في جلب البيانات");
        } finally {
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
        // 🛡️ حظر الموظف من تعطيل أو تفعيل الحسابات من الواجهة
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
        // 🛡️ حظر الموظف من تغيير الرتب
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
        XXLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XXLSX.writeFile(workbook, "users.xlsx");
    };

    if (loading) return <div className="p-10 text-center font-bold">جاري تحميل البيانات...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="text-blue-600" /> إدارة المستخدمين
                </h1>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الإيميل..."
                            className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="border px-3 py-2 rounded-lg"
                    >
                        <option value="all">كل المستخدمين</option>
                        <option value="student">طلاب</option>
                        <option value="teacher">أستاذة</option>
                        <option value="admin">مدراء</option>
                    </select>

                    <button
                        onClick={exportToExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        تصدير Excel
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <UserPlus size={18} /> إضافة مستخدم
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="p-4 border-b text-center">المستخدم</th>
                            <th className="p-4 border-b text-center">الهاتف</th>
                            <th className="p-4 border-b text-center">الدور</th>
                            <th className="p-4 border-b text-center">الحالة</th>
                            <th className="p-4 border-b text-center">كود التحقق</th>
                            <th className="p-4 border-b text-center">العنوان</th>
                            <th className="p-4 border-b text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="font-bold text-gray-800 text-center">{user.full_name}</div>
                                    <div className="text-xs text-gray-500 text-center">{user.email}</div>
                                </td>
                                <td className="p-4 text-center text-blue-600 font-mono text-sm">
                                    {user.phone || '---'}
                                </td>
                                <td className="p-4 text-center">
                                    {/* 🛡️ إذا كان موظفاً، يُعرض الدور كنص فقط ولا يمكنه تعديله عبر القائمة */}
                                    {isEmployee ? (
                                        <span className="bg-blue-50 text-blue-700 text-xs rounded px-2.5 py-1 border border-blue-100">
                                            {user.role === 'admin' ? 'مدير' : user.role === 'teacher' ? 'أستاذ' : 'طالب'}
                                        </span>
                                    ) : (
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                            className="bg-blue-50 text-blue-700 text-xs rounded px-2 py-1 outline-none border border-blue-100"
                                        >
                                            <option value="student">طالب</option>
                                            <option value="teacher">أستاذ</option>
                                            <option value="admin">مدير</option>
                                        </select>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.is_active ? 'نشط' : 'معطل'}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    {user.is_verified ? (
                                        <span className="text-green-600 text-xs font-bold flex items-center justify-center gap-1">
                                            <CheckCircle size={14} /> مفعّل
                                        </span>
                                    ) : (
                                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold border border-amber-200">
                                            {user.verification_code}
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-center">{user.address}</td>
                                <td className="p-4">
                                    <div className="flex gap-2 justify-center">
                                        {/* زر الواتساب */}
                                        {!user.is_verified && user.phone && (
                                            <button
                                                onClick={() => sendWhatsApp(user.phone, user.verification_code)}
                                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                                                title="إرسال الكود للواتساب"
                                            >
                                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.92c1.516.903 3.009 1.357 4.605 1.358 5.403 0 9.803-4.398 9.805-9.802.001-2.617-1.02-5.077-2.872-6.93-1.852-1.854-4.312-2.874-6.931-2.874-5.405 0-9.803 4.398-9.806 9.801 0 1.691.479 3.177 1.386 4.611l-.993 3.626 3.746-.983z"/></svg>
                                            </button>
                                        )}
                                        
                                        {/* زر تفعيل/تعطيل - 🛡️ يظهر للآدمن فقط حالياً لحماية الطلاب من الحظر العشوائي */}
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleToggleStatus(user.id)}
                                                className={`p-2 rounded-lg ${user.is_active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={user.is_active ? "تعطيل الحساب" : "تفعيل الحساب"}
                                            >
                                                {user.is_active ? <UserMinus size={18}/> : <UserCheck size={18}/>}
                                            </button>
                                        )}

                                        {/* فك قفل الجهاز - (✅ مسموح للموظف لمساعدة الطلاب) */}
                                        <button
                                            onClick={() => handleResetDevice(user.id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="فك قفل الجهاز"
                                        >
                                            <SmartphoneNfc size={18} />
                                        </button>

                                        {/* حذف نهائي - (🔒 للآدمن فقط) */}
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.full_name)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="حذف نهائي"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showAddModal && isAdmin && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    {/* ... محتوى الـ Modal يبعد كما هو تماماً ... */}
                </div>
            )}
        </div>
    );
};

export default UsersControl;
