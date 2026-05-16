import React, { useState, useEffect } from 'react';
import api from "../services/api";

const StudentManagement = () => {
    const [requests, setRequests] = useState([]); // تخزين طلبات الاشتراك المعلقة
    const [loading, setLoading] = useState(true);

    // جلب الطلبات المعلقة
    const fetchPendingRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/payments/pending');
            
            // 🔥 ضبط وتجهيز البيانات: ننسخ السعر الأصلي ليكون القيمة الافتراضية داخل حقل الإدخال
            const preparedData = res.data.map(req => ({
                ...req,
                editableAmount: req.amount !== undefined ? req.amount : ''
            }));
            
            setRequests(preparedData);
        } catch (err) {
            console.error("خطأ في جلب الطلبات:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    // دالة لتحديث قيمة المبلغ في الـ state عند الكتابة داخل الـ Input لطلب معين
    const handleAmountChange = (paymentId, value) => {
        setRequests(requests.map(req => 
            req.id === paymentId ? { ...req, editableAmount: value } : req
        ));
    };

    // دالة المعالجة (موافقة أو رفض)
    const handleAction = async (reqObject, action) => {
        const paymentId = reqObject.id;
        
        // حماية مضافة: التأكد من اختيار قيمة ماليّة، وإلا نعتمد القيمة الأصلية أو 0
        const finalAmount = reqObject.editableAmount !== undefined && reqObject.editableAmount !== '' 
            ? reqObject.editableAmount 
            : (reqObject.amount || 0);

        const confirmMsg = action === 'completed' 
            ? `هل أنت متأكد من الموافقة وتفعيل الكورس بمبلغ (${finalAmount} JOD)؟` 
            : "هل أنت متأكد من رفض هذا الطلب؟";
            
        if (!window.confirm(confirmMsg)) return;

        try {
            // نرسل الحالة الجديدة بالإضافة إلى المبلغ المعدل والمعرفات للسيرفر
            await api.put(`/admin/payments/${paymentId}/status`, {
                status: action,
                amount: action === 'completed' ? parseFloat(finalAmount) : 0, 
                user_id: reqObject.user_id, // ممرر من السيرفر للربط بجدول enrollments
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
                                            value={req.editableAmount} 
                                            onChange={(e) => handleAmountChange(req.id, e.target.value)}
                                            className="w-24 px-2 py-1 text-center font-bold text-green-600 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 bg-gray-50 hover:bg-white"
                                            step="0.01"
                                            min="0"
                                        />
                                        <span className="text-gray-500 text-sm font-semibold">JOD</span>
                                    </div>
                                </td>

                                <td className="p-4">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                                        {req.payment_method}
                                    </span>
                                </td>
                                <td className="p-4 flex justify-center gap-2">
                                    {/* 🔥 تم الإصلاح هنا: نقوم بتمرير كائن الـ req بالكامل بدلاً من req.id فقط */}
                                    <button 
                                        onClick={() => handleAction(req, 'completed')}
                                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition font-medium"
                                    >
                                        موافقة
                                    </button>
                                    <button 
                                        onClick={() => handleAction(req, 'failed')}
                                        className="bg-red-100 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-200 transition font-medium"
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
