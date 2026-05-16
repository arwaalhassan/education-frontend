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
// دالة لتحديث قيمة المبلغ في الـ state عند الكتابة داخل الـ Input
    const handleAmountChange = (paymentId, value) => {
        setRequests(requests.map(req => 
            req.id === paymentId ? { ...req, editableAmount: value } : req
        ));
    };
    // دالة المعالجة (موافقة أو رفض)
   const handleAction = async (reqObject, action) => {
        const paymentId = reqObject.id;
        const finalAmount = reqObject.editableAmount;

        const confirmMsg = action === 'completed' 
            ? `هل أنت متأكد من الموافقة وتفعيل الكورس بمبلغ (${finalAmount} JOD)؟` 
            : "هل أنت متأكد من رفض هذا الطلب؟";
            
        if (!window.confirm(confirmMsg)) return;

        try {
            // نرسل الحالة الجديدة بالإضافة إلى المبلغ والمستخدم والكورس ليتوافق تماماً مع السيرفر
            await api.put(`/admin/payments/${paymentId}/status`, {
                status: action,
                amount: action === 'completed' ? parseFloat(finalAmount) : 0, // إرسال المبلغ المعدل
                user_id: reqObject.user_id, // ممرر من قاعدة البيانات للربط
                course_id: reqObject.course_id
            });
            
            alert(action === 'completed' ? "تم تفعيل الكورس وتحديث السجل المالي للطالب بنجاح" : "تم رفض الطلب");
            
            // تحديث القائمة لإخفاء الطلب المعالج
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
                            <th className="p-4 font-semibold w-44">المبلغ المدفوع (قابل للتعديل)</th>
                            <th className="p-4 font-semibold">وسيلة الدفع</th>
                            <th className="p-4 text-center font-semibold">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? requests.map(req => (
                            <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                <td className="p-4 font-medium">{req.full_name}</td>
                                <td className="p-4">{req.course_title}</td>
                               {/* حقل إدخال رقمي مرن لتغيير المبلغ المالي */}
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={req.editableAmount || ''} 
                                            onChange={(e) => handleAmountChange(req.id, e.target.value)}
                                            className="w-24 px-2 py-1 text-center font-bold text-green-600 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 bg-gray-50 hover:bg-white"
                                            step="0.01"
                                            min="0"
                                        />
                                        <span className="text-gray-500 text-sm font-semibold">JOD</span>
                                    </div>
                                </td>
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
