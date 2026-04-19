import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { Users, Shield, UserMinus, UserCheck, CreditCard, Search, UserPlus, X, SmartphoneNfc, Trash2, CheckCircle, XCircle } from 'lucide-react';

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
// --- [1] دالة إعادة تعيين الجهاز ---
    const handleResetDevice = async (userId) => {
        if (!window.confirm("هل أنت متأكد من فك قفل الجهاز لهذا المستخدم؟ سيتمكن من الدخول من أي جهاز جديد مرة واحدة.")) return;
        try {
            await api.put('/admin/users/reset-device', { userId });
            alert("تم إعادة تعيين الجهاز بنجاح");
        } catch (err) {
            alert(err.response?.data?.message || "فشلت عملية إعادة التعيين");
        }
    };
const sendWhatsApp = (phone, code) => {
    if (!phone) return alert("لا يوجد رقم هاتف لهذا المستخدم");
    
    // نص الرسالة الذي سيظهر في الواتساب
    const message = `أهلاً بك في منصة التعليم. كود تفعيل حسابك هو: ${code}`;
    
    // إنشاء الرابط (مع التأكد من ترميز النص بشكل صحيح)
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    // فتح الرابط في نافذة جديدة
    window.open(url, '_blank');
};
    // --- [2] دالة حذف المستخدم ---
    const handleDeleteUser = async (id, username) => {
        if (!window.confirm(`هل أنت متأكد تماماً من حذف المستخدم (${username})؟ لا يمكن التراجع عن هذه الخطوة.`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id)); // إزالة من القائمة فوراً
            alert("تم حذف المستخدم بنجاح");
        } catch (err) {
            alert(err.response?.data?.message || "فشل الحذف (قد يكون للمستخدم سجلات مالية تمنع حذفه)");
        }
    };
    const handleToggleStatus = async (id) => {
        try {
            const response = await api.patch(`/admin/users/${id}/status`);
            const newStatus = response.data.is_active;
            setUsers(users.map(u => u.id === id ? { ...u, is_active: newStatus } : u));
        } catch (err) { 
            console.error(err);
            alert("فشلت عملية تحديث الحالة"); 
        }
    };

    const handleChangeRole = async (id, newRole) => {
        try {
            await api.put(`/admin/users/${id}/role`, { role: newRole });
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
            alert("تم تحديث الرتبة");
        } catch (err) { alert("خطأ في التحديث"); }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/users', newUser);
            const addedUser = { 
                id: res.data.userId, 
                ...newUser, 
                is_active: 1 
            };
            setUsers([addedUser, ...users]);
            setShowAddModal(false);
            setNewUser({ username: '', email: '', password: '',phone: '', role: 'student' });
            alert("تم إضافة المستخدم بنجاح");
        } catch (err) {
            alert(err.response?.data?.message || "خطأ في إضافة المستخدم");
        }
    };

    const handleManualAccess = async (userId) => {
        const courseId = prompt("أدخل رقم الكورس (Course ID):");
        if (!courseId) return;
        try {
            await api.post('/admin/payments/manual', { user_id: userId, course_id: courseId });
            alert("تم منح الوصول بنجاح!");
        } catch (err) { alert(err.response?.data?.message || "فشلت العملية"); }
    };

    const filteredUsers = users.filter(u => 
        (u.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
        (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center">جاري التحميل...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="text-blue-600" /> إدارة المستخدمين
                </h1>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            type="text" placeholder="بحث بالاسم أو الإيميل..." 
                            className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                        <UserPlus size={18} /> إضافة مستخدم
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="p-4">المستخدم</th>
                            <th className="p-4">الدور</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4">رقم الهاتف</th> {/* عمود جديد */}
                            <th className="p-4">كود التحقق</th> {/* عمود جديد */}
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
                                {/* عرض رقم الهاتف */}
            <td className="p-4 text-blue-600 font-mono text-sm">
                {user.phone || '---'}
            </td>

            {/* عرض كود التحقق */}
            <td className="p-4 text-center">
                {!user.is_verified ? (
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold border border-amber-200">
                        {user.verification_code}
                    </span>
                ) : (
                    <span className="text-green-500 text-xs">تم التأكيد ✅</span>
                )}
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
                                <td className="p-4 flex gap-1 justify-center">
                {/* زر الإرسال عبر الواتساب - يظهر فقط إذا لم يتم التفعيل */}
                {!user.is_verified && user.phone && (
                    <button 
                        onClick={() => sendWhatsApp(user.phone, user.verification_code)}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition shadow-sm"
                        title="إرسال الكود للواتساب"
                    >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.92c1.516.903 3.009 1.357 4.605 1.358 5.403 0 9.803-4.398 9.805-9.802.001-2.617-1.02-5.077-2.872-6.93-1.852-1.854-4.312-2.874-6.931-2.874-5.405 0-9.803 4.398-9.806 9.801 0 1.691.479 3.177 1.386 4.611l-.993 3.626 3.746-.983z"/></svg>
                    </button>
                )}
                                    </td>
                                <td className="p-4 flex gap-2">
                                    <button 
                                        onClick={() => handleToggleStatus(user.id)}
                                        className={`p-2 rounded-lg transition ${user.is_active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                        title={user.is_active ? "تعطيل" : "تفعيل"}
                                    >
                                        {user.is_active ? <UserMinus size={20}/> : <UserCheck size={20}/>}
                                    </button>
                                   {/* زر إعادة تعيين الجهاز */}
                                        <button 
                                            onClick={() => handleResetDevice(user.id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="إعادة تعيين الجهاز (فك القفل)"
                                        >
                                            <SmartphoneNfc size={18} />
                                        </button>
                                    {/* زر حذف المستخدم */}
                                        <button 
                                            onClick={() => handleDeleteUser(user.id, user.username)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="حذف المستخدم نهائياً"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <UserPlus className="text-blue-600" /> إضافة مستخدم جديد
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                                <input 
                                    type="text" required
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="مثال: ahmad_dev"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                <input 
                                    type="email" required
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="example@mail.com"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                />
                            </div>
                            <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (واتساب)</label>
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
                                    placeholder="******"
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
                                    <option value="admin">مدير</option>
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
