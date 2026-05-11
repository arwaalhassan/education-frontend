import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, UserMinus, Search, ArrowRight, Loader2, Mail, Phone } from 'lucide-react';

const CourseStudents = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, [courseId]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/courses/${courseId}/students`);
            setStudents(res.data);
        } catch (err) {
            console.error("خطأ في جلب الطلاب:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnenroll = async (userId) => {
        if (window.confirm("هل أنت متأكد من إلغاء اشتراك هذا الطالب؟ سيفقد الوصول للمحتوى فوراً.")) {
            try {
                await api.post('/admin/courses/unenroll', { userId, courseId });
                setStudents(students.filter(s => s.id !== userId));
                alert("تم إلغاء الاشتراك بنجاح");
            } catch (err) {
                alert("حدث خطأ أثناء محاولة إلغاء الاشتراك");
            }
        }
    };

    const filteredStudents = students.filter(s => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm)
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
            <p>جاري تحميل قائمة الطلاب...</p>
        </div>
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen text-right font-sans" dir="rtl">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                        <ArrowRight size={20} /> عودة للخلف
                    </button>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Users className="text-blue-600" /> الطلاب المسجلون بالكورس
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute right-4 top-3 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="ابحث باسم الطالب أو رقم الهاتف..." 
                        className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Students List */}
                <div className="bg-white rounded-[25px] shadow-sm border border-slate-100 overflow-hidden">
                    {filteredStudents.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">لا يوجد طلاب مسجلون حالياً</div>
                    ) : (
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-4 font-bold text-slate-600">اسم الطالب</th>
                                    <th className="p-4 font-bold text-slate-600">رقم الهاتف</th>
                                    <th className="p-4 font-bold text-slate-600">تاريخ التسجيل</th>
                                    <th className="p-4 font-bold text-slate-600">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-700">{student.full_name}</td>
                                        <td className="p-4 text-slate-600">{student.phone}</td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {new Date(student.enrolled_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleUnenroll(student.id)}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                title="إلغاء الاشتراك"
                                            >
                                                <UserMinus size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseStudents;
