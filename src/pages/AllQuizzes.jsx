import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Edit, Search, BookOpen, Clock, CheckCircle, Plus, ChevronRight, Loader2, AlertTriangle, LayoutGrid } from 'lucide-react';

const AllQuizzes = () => {
    const { courseId } = useParams(); 
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, [courseId]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            
            // تم تعديل المسار ليتوافق مع هيكلية الراوتر في الباك إند الخاص بك
            // إذا كان هناك معرف كورس نطلب اختبارات الكورس، وإلا نطلب الكل
            const url = courseId 
                ? `/quizzes/admin/courses/${courseId}/quizzes` 
                : '/quizzes/admin/quizzes/all'; 

            const res = await api.get(url);
            
            // معالجة مرنة لاستقبال البيانات سواء كانت مصفوفة مباشرة أو داخل كائن
            if (Array.isArray(res.data)) {
                setQuizzes(res.data);
            } else if (res.data.quizzes) {
                setQuizzes(res.data.quizzes);
            } else {
                setQuizzes([]);
            }
        } catch (err) {
            console.error("خطأ في جلب الاختبارات:", err);
            setQuizzes([]);
        } finally {
            setLoading(false);
        }
    };

    // تصفية الاختبارات بناءً على كلمة البحث (البحث في العنوان أو اسم الكورس)
    const filteredQuizzes = quizzes.filter(q => 
        q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={48} />
            <p className="text-slate-600 font-bold">جاري تحميل الاختبارات...</p>
        </div>
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen text-right font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto">
                
                {/* الرأس (Header) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <button 
                            onClick={() => navigate('/admin/all-content')} 
                            className="flex items-center gap-1 text-blue-600 mb-3 hover:gap-2 transition-all font-medium"
                        >
                            <ChevronRight size={20} /> العودة لإدارة المحتوى
                        </button>
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
                                <LayoutGrid size={24} />
                            </div>
                            {courseId ? 'إدارة اختبارات الكورس' : 'جميع اختبارات المنصة'}
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        {/* حقل البحث */}
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="بحث عن اختبار..." 
                                className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all bg-white"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        {/* زر الإضافة (يظهر فقط عند التواجد داخل كورس محدد) */}
                        {courseId && (
                            <button 
                                onClick={() => navigate(`/create-quiz/${courseId}`)} // تم التغيير من add-quiz لـ create-quiz
        className="bg-green-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-100 font-bold active:scale-95"
    >
        <Plus size={22} /> إضافة اختبار جديد
                            </button>
                        )}
                    </div>
                </div>

                {/* عرض المحتوى */}
                {filteredQuizzes.length === 0 ? (
                    <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-200 text-center shadow-sm">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="text-amber-400" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-2">لا توجد اختبارات متاحة</h3>
                        <p className="text-slate-400 max-w-sm mx-auto">
                            {searchTerm ? 'لم نجد نتائج تطابق بحثك.' : 'لم يتم إضافة أي اختبارات لهذا القسم بعد.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredQuizzes.map((quiz) => (
                            <div 
                                key={quiz.id} 
                                className="bg-white p-6 rounded-[25px] shadow-sm border border-slate-100 flex flex-col sm:row justify-between items-center hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-5 w-full">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <BookOpen size={28} />
                                    </div>
                                    <div className="flex-1 text-right">
                                        <h3 className="font-bold text-xl text-slate-800">{quiz.title}</h3>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                            <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                                <Clock size={16} className="text-blue-500" /> {quiz.duration} دقيقة
                                            </span>
                                            
                                            {/* عرض اسم الكورس فقط في حالة العرض العام */}
                                            {!courseId && (
                                                <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-lg">
                                                    الكورس: {quiz.course_name}
                                                </span>
                                            )}

                                            <span className={`flex items-center gap-1 font-bold px-2 py-1 rounded-lg ${quiz.is_published ? 'text-green-600 bg-green-50' : 'text-orange-500 bg-orange-50'}`}>
                                                <CheckCircle size={16} /> {quiz.is_published ? 'منشور' : 'مسودة'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => navigate(`/admin/edit-quiz/${quiz.id}`)}
                                            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-md active:scale-95 flex items-center gap-2"
                                        >
                                            <Edit size={18} />
                                            تعديل الأسئلة
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllQuizzes;