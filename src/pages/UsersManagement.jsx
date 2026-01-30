import React, { useState, useEffect } from 'react';
import api from '../services/api'; // ملف الـ axios الذي جهزناه
import { Users, Shield, UserMinus, UserCheck, CreditCard, Search } from 'lucide-react';

const UsersControl = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // 1. جلب المستخدمين (دالة getUsers)
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

    // 2. تفعيل/تعطيل الحساب (دالة updateUserStatus)
    const handleToggleStatus = async (id, currentStatus) => {
    try {
        // نرسل طلباً فارغاً لأن الباك إند يقوم بالتبديل تلقائياً
        const response = await api.patch(`/admin/users/${id}/status`);
        
        // نحدث الحالة في الواجهة بناءً على ما رجع من السيرفر (is_active الجديد)
        const newStatus = response.data.is_active;
        setUsers(users.map(u => u.id === id ? { ...u, is_active: newStatus } : u));
        
    } catch (err) { 
        console.error(err);
        alert("فشلت عملية تحديث الحالة"); 
    }
};

    // 3. تغيير الرتبة (دالة updateUserRole)
    const handleChangeRole = async (id, newRole) => {
        try {
            await api.put(`/admin/users/${id}/role`, { role: newRole });
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
            alert("تم تحديث الرتبة");
        } catch (err) { alert("خطأ في التحديث"); }
    };

    // 4. منح وصول يدوي لكورس (دالة grantManualAccess)
    const handleManualAccess = async (userId) => {
        const courseId = prompt("أدخل رقم الكورس (Course ID):");
        if (!courseId) return;
        try {
            await api.post('/admin/payments/manual', { user_id: userId, course_id: courseId });
            alert("تم منح الوصول بنجاح!");
        } catch (err) { alert(err.response?.data?.message || "فشلت العملية"); }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center">جاري التحميل...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="text-blue-600" /> إدارة المستخدمين
                </h1>
                <div className="relative w-64">
                    <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" placeholder="بحث بالاسم أو الإيميل..." 
                        className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="p-4">المستخدم</th>
                            <th className="p-4">الرتبة</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="font-bold">{user.username}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="p-4">
                                    <select 
                                        value={user.role} 
                                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                        className="bg-blue-50 text-blue-700 text-sm rounded px-2 py-1 outline-none"
                                    >
                                        <option value="student">طالب</option>
                                        <option value="teacher">أستاذ</option>
                                        <option value="admin">مدير</option>
                                    </select>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.is_active ? 'نشط' : 'معطل'}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button 
                                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                                        className={`p-2 rounded-lg transition ${user.is_active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                        title={user.is_active ? "تعطيل" : "تفعيل"}
                                    >
                                        {user.is_active ? <UserMinus size={20}/> : <UserCheck size={20}/>}
                                    </button>
                                    <button 
                                        onClick={() => handleManualAccess(user.id)}
                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                        title="منح وصول يدوي"
                                    >
                                        <CreditCard size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersControl;