import React, { useState, useEffect } from 'react';
import api from "../services/api";

const StudentManagement = () => {
    const [requests, setRequests] = useState([]); // سنخزن هنا طلبات الاشتراك المعلقة
    const [loading, setLoading] = useState(true);

    // جلب الطلبات المعلقة فقط
    const fetchPendingRequests = async () => {
        try {
            setLoading(true);
            // نفترض وجود مسار في الباك إيند يجلب الطلبات التي حالتها pending
            const res = await api.get('/admin/payments/pending');
            setRequests(res.data);
        } catch (err) {
            console.error("خطأ في جلب الطلبات:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    // دالة المعالجة (موافقة أو رفض)
    const handleAction = async (paymentId, action) => {
        const confirmMsg = action === 'completed' ? "هل أنت متأكد من الموافقة وتفعيل الكورس؟" : "هل أنت متأكد من رفض هذا الطلب؟";
        if (!window.confirm(confirmMsg)) return;

        try {
            // سنرسل الحالة الجديدة للسيرفر (completed للموافقة أو failed للرفض)
            await api.put(`/admin/payments/${paymentId}/status`, {
    status: action
});
            
            alert(action === 'completed' ? "تم تفعيل الكورس للطالب بنجاح" : "تم رفض الطلب");
            
            // تحديث القائمة بعد العملية
            setRequests(requests.filter(req => req.id !== paymentId));
        } catch (error) {
            alert(error.response?.data?.message || "حدث خطأ أثناء معالجة الطلب");
        }
    };

    if (loading) return <div className="p-10 text-center">جاري تحميل الطلبات المعلقة...</div>;

    return (
        <div className="p-6" dir="rtl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">إدارة طلبات الاشتراك المعلقة</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold">اسم الطالب</th>
                            <th className="p-4 font-semibold">الكورس المطلوب</th>
                            <th className="p-4 font-semibold">المبلغ</th>
                            <th className="p-4 font-semibold">وسيلة الدفع</th>
                            <th className="p-4 text-center font-semibold">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? requests.map(req => (
                            <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                <td className="p-4 font-medium">{req.username}</td>
                                <td className="p-4">{req.course_title}</td>
                                <td className="p-4 text-green-600 font-bold">{req.amount} JOD</td>
                                <td className="p-4">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                                        {req.payment_method}
                                    </span>
                                </td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button 
                                        onClick={() => handleAction(req.id, 'completed')}
                                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition"
                                    >
                                        موافقة
                                    </button>
                                    <button 
                                        onClick={() => handleAction(req.id, 'failed')}
                                        className="bg-red-100 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-200 transition"
                                    >
                                        رفض
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="p-10 text-center text-gray-500">لا توجد طلبات اشتراك معلقة حالياً</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentManagement;