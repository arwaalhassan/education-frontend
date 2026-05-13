import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    Users, 
    UserMinus, 
    Search, 
    ArrowRight, 
    Loader2, 
    Eye, 
    Clock, 
    X,
    PlayCircle
} from 'lucide-react';

const CourseStudents = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    // States للقائمة الرئيسية
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // States لسجل المشاهدات (Logs)
    const [selectedStudentLogs, setSelectedStudentLogs] = useState([]);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [isLogsLoading, setIsLogsLoading] = useState(false);
    const [activeStudentName, setActiveStudentName] = useState('');

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

    // دالة جلب مشاهدات الطالب
    const fetchStudentLogs = async (student) => {
        try {
            setActiveStudentName(student.full_name);
            setIsLogsLoading(true);
            setShowLogsModal(true);
            // استدعاء سجلات المشاهدة لهذا الطالب في هذا الكورس
            const res = await api.get(`/admin/courses/${courseId}/students/${student.id}/logs`);
            setSelectedStudentLogs(res.data);
        } catch (err) {
            console.error("خطأ في جلب سجلات المشاهدة:", err);
            setSelectedStudentLogs([]);
        } finally {
            setIsLogsLoading(false);
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
            <p className="text-slate-600 font-medium">جاري تحميل قائمة الطلاب...</p>
        </div>
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen text-right font-sans" dir="rtl">
            <div className="max-w-5xl mx-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                        <ArrowRight size={20} /> عودة للخلف
                    </button>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Users className="text-blue-600" /> الطلاب المسجلون بالكورس
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute right-4 top-3.5 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="ابحث باسم الطالب أو رقم الهاتف..." 
                        className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm focus:border-blue-400 transition-all"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Students List Table */}
                <div className="bg-white rounded-[25px] shadow-sm border border-slate-100 overflow-hidden">
                    {filteredStudents.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 italic">لا يوجد طلاب مسجلون حالياً</div>
                    ) : (
                        <table className="w-full text-right border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-4 font-bold text-slate-600">اسم الطالب</th>
                                    <th className="p-4 font-bold text-slate-600">رقم الهاتف</th>
                                    <th className="p-4 font-bold text-slate-600 text-center">تاريخ التسجيل</th>
                                    <th className="p-4 font-bold text-slate-600 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-700">{student.full_name}</div>
                                        </td>
                                        <td className="p-4 text-slate-600 tracking-wide font-mono">{student.phone}</td>
                                        <td className="p-4 text-sm text-slate-500 text-center">
                                            {new Date(student.enrolled_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* زر عرض المشاهدات */}
                                                <button 
                                                    onClick={() => fetchStudentLogs(student)}
                                                    className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                                                    title="عرض سجل المشاهدات"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                {/* زر إلغاء الاشتراك */}
                                                <button 
                                                    onClick={() => handleUnenroll(student.id)}
                                                    className="p-2.5 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                    title="إلغاء الاشتراك"
                                                >
                                                    <UserMinus size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal: سجل المشاهدات */}
            {showLogsModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[30px] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl scale-in-center">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">نشاط الطالب</h3>
                                <p className="text-sm text-blue-600 mt-1 font-medium">{activeStudentName}</p>
                            </div>
                            <button 
                                onClick={() => setShowLogsModal(false)} 
                                className="p-2 bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto bg-slate-50/50">
                            {isLogsLoading ? (
                                <div className="flex flex-col items-center justify-center p-12">
                                    <Loader2 className="animate-spin text-blue-600 mb-2" size={30} />
                                    <span className="text-slate-500">جاري جلب السجلات...</span>
                                </div>
                            ) : selectedStudentLogs.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <PlayCircle className="text-slate-300" size={32} />
                                    </div>
                                    <p className="text-slate-500 font-medium">هذا الطالب لم يبدأ بمشاهدة أي فيديو بعد.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedStudentLogs.map((log, index) => (
                                        <div 
                                            key={index} 
                                            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm">
                                                    {String(index + 1).padStart(2, '0')}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                                                        {log.video_title || "فيديو بدون عنوان"}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Clock size={12} /> {new Date(log.watched_at).toLocaleString('ar-EG')}
                                                        </p>
                                                        {log.watch_count && (
                                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                                                                شوهد {log.watch_count} مرات
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="hidden sm:block">
                                                <span className="text-[11px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                                                    نشط
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-white border-t border-slate-100 text-center">
                            <button 
                                onClick={() => setShowLogsModal(false)}
                                className="px-8 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all text-sm"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseStudents;
