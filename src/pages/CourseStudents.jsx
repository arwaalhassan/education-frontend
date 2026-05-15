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
    PlayCircle,
    AlertCircle
} from 'lucide-react';

const CourseStudents = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    // States القائمة الرئيسية
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // States لسجل المشاهدات (Logs)
    const [selectedStudentLogs, setSelectedStudentLogs] = useState([]);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [isLogsLoading, setIsLogsLoading] = useState(false);
    const [activeStudentName, setActiveStudentName] = useState('');

    useEffect(() => {
        fetchStudents();
    }, [courseId]);

   // 1. جلب قائمة الطلاب
const fetchStudents = async () => {
    try {
        setLoading(true);
        setError(null);
        // التعديل: إزالة /admin وإضافة الترتيب الصحيح للمسار
        // نفترض هنا أن ملف routes/student.js مربوط في server.js بمسار '/api/students'
        const res = await api.get(`/student/course/${courseId}/students`);
        
        setStudents(res.data);
    } catch (err) {
        console.error("خطأ في جلب الطلاب:", err);
        setError("تعذر تحميل قائمة الطلاب، تأكد من مسار السيرفر.");
    } finally {
        setLoading(false);
    }
};

// 2. جلب سجلات المشاهدة
const fetchStudentLogs = async (student) => {
    try {
        setActiveStudentName(student.full_name);
        setIsLogsLoading(true);
        setShowLogsModal(true);
        // التعديل: المسار ليطابق router.get('/course/:courseId/student/:studentId/logs')
        const res = await api.get(`/student/course/${courseId}/student/${student.id}/logs`);
        setSelectedStudentLogs(res.data);
    } catch (err) {
        console.error("خطأ في السجلات:", err);
        setSelectedStudentLogs([]);
    } finally {
        setIsLogsLoading(false);
    }
};

// 3. إلغاء الاشتراك
const handleUnenroll = async (userId) => {
    if (window.confirm("هل أنت متأكد؟")) {
        try {
            // التعديل: المسار ليطابق router.post('/unenroll-student')
            await api.post('/student/unenroll-student', { userId, courseId });
            setStudents(students.filter(s => s.id !== userId));
        } catch (err) {
            alert("حدث خطأ أثناء إلغاء الاشتراك");
        }
    }
};

    const filteredStudents = students.filter(s => 
        (s.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.phone?.includes(searchTerm))
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-600 font-bold text-lg">جاري تحميل قائمة الطلاب...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-right font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <button 
                            onClick={() => navigate(-1)} 
                            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all mb-2 font-medium"
                        >
                            <ArrowRight size={18} /> العودة للوحة التحكم
                        </button>
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Users size={28} />
                            </div>
                            الطلاب المسجلون
                        </h1>
                    </div>
                    
                    {/* Stat Card - السمة الجديدة المضافة بناءً على طلبك السابق لعرض نشاط الطلاب */}
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-4">
                        <div className="text-left">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">إجمالي المسجلين</p>
                            <p className="text-2xl font-black text-blue-600">{students.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                            <Users size={20} />
                        </div>
                    </div>
                </div>

                {/* Search & Actions */}
                <div className="relative mb-6 group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={22} />
                    <input 
                        type="text" 
                        placeholder="ابحث باسم الطالب أو رقم الهاتف..." 
                        className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all text-lg"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Main Content */}
                {error ? (
                    <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center text-red-600 flex flex-col items-center">
                        <AlertCircle size={40} className="mb-2" />
                        <p className="font-bold">{error}</p>
                        <button onClick={fetchStudents} className="mt-4 text-sm underline font-bold">إعادة المحاولة</button>
                    </div>
                ) : (
                    <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 overflow-hidden">
                        {filteredStudents.length === 0 ? (
                            <div className="p-20 text-center">
                                <Users size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 text-lg font-medium">لا يوجد طلاب يطابقون بحثك حالياً</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse">
                                    <thead className="bg-slate-50/80 border-b border-slate-100">
                                        <tr>
                                            <th className="p-5 font-bold text-slate-600">اسم الطالب</th>
                                            <th className="p-5 font-bold text-slate-600">رقم الهاتف</th>
                                            <th className="p-5 font-bold text-slate-600 text-center">تاريخ الانضمام</th>
                                            <th className="p-5 font-bold text-slate-600 text-center">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredStudents.map(student => (
                                            <tr key={student.id} className="hover:bg-blue-50/20 transition-colors">
                                                <td className="p-5">
                                                    <div className="font-bold text-slate-800">{student.full_name}</div>
                                                    <div className="text-xs text-slate-400 mt-1">ID: #{student.id.toString().slice(-5)}</div>
                                                </td>
                                                <td className="p-5 text-slate-600 font-mono tracking-tighter text-lg" dir="ltr">
                                                    {student.phone}
                                                </td>
                                                <td className="p-5 text-center text-slate-500 font-medium">
                                                    {new Date(student.enrolled_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button 
                                                            onClick={() => fetchStudentLogs(student)}
                                                            className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all font-bold text-sm shadow-sm"
                                                            title="عرض نشاط المشاهدة"
                                                        >
                                                            <Eye size={16} />
                                                            <span>النشاط</span>
                                                        </button>

                                                        <button 
                                                            onClick={() => handleUnenroll(student.id)}
                                                            className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                            title="إلغاء اشتراك الطالب"
                                                        >
                                                            <UserMinus size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal: سجل المشاهدات بتصميم حديث */}
            {showLogsModal && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl transition-transform animate-in zoom-in-95 duration-300">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3 text-right">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                    <PlayCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">تتبع المشاهدات</h3>
                                    <p className="text-sm text-blue-600 font-bold tracking-tight">{activeStudentName}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowLogsModal(false)} 
                                className="p-2 bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto bg-slate-50/30 custom-scrollbar">
                            {isLogsLoading ? (
                                <div className="flex flex-col items-center justify-center p-20">
                                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                                    <span className="text-slate-500 font-bold">جاري تحليل البيانات...</span>
                                </div>
                            ) : selectedStudentLogs.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 text-slate-200">
                                        <PlayCircle size={40} />
                                    </div>
                                    <p className="text-slate-500 text-lg font-bold">لم يتم تسجيل أي نشاط مشاهدة بعد</p>
                                    <p className="text-slate-400 text-sm mt-1">تظهر السجلات بمجرد بدء الطالب في متابعة الدروس.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {selectedStudentLogs.map((log, index) => (
                                        <div 
                                            key={index} 
                                            className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-blue-300 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-400 rounded-xl flex items-center justify-center font-black transition-colors">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 leading-none mb-2">
                                                        {log.video_title || "فيديو تعليمي"}
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                                            <Clock size={14} className="text-blue-400" /> 
                                                            {new Date(log.watched_at).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                                        </span>
                                                        {log.watch_count > 1 && (
                                                            <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg font-black border border-amber-100">
                                                                مكرر ({log.watch_count})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="hidden sm:block">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-5 bg-white border-t border-slate-50 text-center">
                            <button 
                                onClick={() => setShowLogsModal(false)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                            >
                                إغلاق السجل
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseStudents;
