import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Users, Shield, UserMinus, UserCheck, Search, 
    UserPlus, X, SmartphoneNfc, Trash2, CheckCircle 
} from 'lucide-react';

const UsersControl = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        role: 'student'
    });

    // جلب المستخدمين من السيرفر
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

    // [1] إعادة تعيين الجهاز
    const handleResetDevice = async (userId) => {
        if (!window.confirm("هل أنت متأكد من فك قفل الجهاز لهذا المستخدم؟")) return;
        try {
            await api.put('/admin/users/reset-device', { userId });
            alert("تم إعادة تعيين الجهاز بنجاح");
        } catch (err) {
            alert(err.response?.data?.message || "فشلت عملية إعادة التعيين");
        }
    };

    // [2] إرسال الكود عبر الواتساب
    const sendWhatsApp = (phone, code) => {
        if (!phone) return alert("لا يوجد رقم هاتف لهذا المستخدم");
        const message = `أهلاً بك في منصة التعليم. كود تفعيل حسابك هو: ${code}`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // [3] حذف المستخدم
    const handleDeleteUser = async (id, username) => {
        if (!window.confirm(`هل أنت متأكد من حذف المستخدم (${username})؟`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            alert("تم حذف المستخدم بنجاح");
        } catch (err) {
            alert(err.response?.data?.message || "فشل الحذف");
        }
    };

    // [4] تغيير حالة النشاط (تفعيل/تعطيل)
    const handleToggleStatus = async (id) => {
        try {
            const response = await api.patch(`/admin/users/${id}/status`);
            const newStatus = response.data.is_active;
            setUsers(users.map(u => u.id === id ? { ...u, is_active: newStatus } : u));
        } catch (err) {
            alert("فشلت عملية تحديث الحالة");
        }
    };

    // [5] تغيير الرتبة
    const handleChangeRole = async (id, newRole) => {
        try {
            await api.put(`/admin/users/${id}/role`, { role: newRole });
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
            alert("تم تحديث الرتبة");
        } catch (err) {
            alert("خطأ في التحديث");
        }
    };

    // [6] إضافة مستخدم جديد مع استثناء الآدمن
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/users', newUser);
            
            const addedUser = {
                id: res.data.userId,
                ...newUser,
                is_active: 1,
                // إذا كان المضاف آدمن، نعتبره مفعلاً فوراً في الواجهة
                is_verified: newUser.role === 'admin' ? 1 : 0,
                verification_code: res.data.verificationCode || '---'
            };

            setUsers([addedUser, ...users]);
            setShowAddModal(false);
            setNewUser({ username: '', email: '', password: '', phone: '', role: 'student' });
            alert("تم إضافة المستخدم بنجاح");
        } catch (err) {
            alert(err.response?.data?.message || "خطأ في إضافة المستخدم");
        }
    };

    // تصفية البحث
    const filteredUsers = users.filter(u =>
        (u.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

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
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <UserPlus size={18} /> إضافة مستخدم
                    </button>
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
                            <th className="p-4 border-b text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="font-bold text-gray-800 text-center">{user.username}</div>
                                    <div className="text-xs text-gray-500 text-center">{user.email}</div>
                                </td>
                                <td className="p-4 text-center text-blue-600 font-mono text-sm">
                                    {user.phone || '---'}
                                </td>
                                <td className="p-4 text-center">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                        className="bg-blue-50 text-blue-700 text-xs rounded px-2 py-1 outline-none border border-blue-100"
                                    >
                                        <option value="student">طالب</option>
                                        <option value="teacher">أستاذ</option>
                                        <option value="admin">مدير</option>
                                    </select>
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
                                        {/* تفعيل/تعطيل */}
                                        <button
                                            onClick={() => handleToggleStatus(user.id)}
                                            className={`p-2 rounded-lg ${user.is_active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                            title={user.is_active ? "تعطيل الحساب" : "تفعيل الحساب"}
                                        >
                                            {user.is_active ? <UserMinus size={18}/> : <UserCheck size={18}/>}
                                        </button>
                                        {/* فك قفل الجهاز */}
                                        <button
                                            onClick={() => handleResetDevice(user.id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="فك قفل الجهاز"
                                        >
                                            <SmartphoneNfc size={18} />
                                        </button>
                                        {/* حذف */}
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.username)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            title="حذف نهائي"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <UserPlus className="text-blue-600" /> إضافة مستخدم جديد
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                                <input
                                    type="text" required
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                <input
                                    type="email" required
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                                <input
                                    type="text" required
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="09xxxxxxxx"
                                    value={newUser.phone}
                                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                                <input
                                    type="password" required minLength="6"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                                <select
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                >
                                    <option value="student">طالب</option>
                                    <option value="teacher">أستاذ</option>
                                    <option value="admin">مدير (بدون كود)</option>
                                </select>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition">
                                    تأكيد الإضافة
                                </button>
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-200 transition">
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersControl;
