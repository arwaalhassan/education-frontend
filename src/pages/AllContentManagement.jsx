import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, Pencil, Trash2, FileText, Plus, Search, Loader2, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AllContentManagement = () => {
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // جلب البيانات عند فتح الصفحة
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/courses'); 
            setCourses(res.data);
        } catch (err) {
            console.error("خطأ في جلب البيانات:", err);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (id) => {
        if (window.confirm("هل أنت متأكد من حذف هذا الكورس وكل محتوياته (دروس، اختبارات) نهائياً؟")) {
            try {
                await api.delete(`/courses/${id}`);
                setCourses(courses.filter(c => c.id !== id));
                alert("تم حذف الكورس بنجاح");
            } catch (err) {
                alert("فشل الحذف، تأكد من صلاحيات الإدارة");
            }
        }
    };

    const filteredCourses = courses.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
                <p className="text-gray-500 font-bold">جاري تحميل محتوى المنصة...</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen text-right font-sans" dir="rtl">
            {/* الهيدر: العنوان + الأزرار */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                             <BookOpen size={28} />
                        </div>
                        إدارة المحتوى التعليمي
                    </h1>
                    <p className="text-slate-500 mt-1 mr-12">تحكم في الكورسات والاختبارات الخاصة بالمنصة</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* حقل البحث */}
                    <div className="relative group min-w-75">
                        <Search className="absolute right-4 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="ابحث عن اسم الكورس..." 
                            className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50/50 focus:border-blue-400 outline-none transition-all shadow-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={() => navigate('/add-course')}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
                    >
                        <Plus size={22} />
                        <span className="font-bold">كورس جديد</span>
                    </button>
                </div>
            </div>

            {/* شبكة عرض الكورسات */}
            <div className="max-w-6xl mx-auto">
                {filteredCourses.length === 0 ? (
                    <div className="bg-white p-20 rounded-[30px] border-2 border-dashed border-slate-200 text-center">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-slate-300" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">لا توجد نتائج!</h3>
                        <p className="text-slate-400 mt-2">لم نجد أي كورس يطابق بحثك حالياً</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        {filteredCourses.map(course => (
                            <div 
                                key={course.id} 
                                className="bg-white p-6 rounded-[25px] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center group hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
                            >
                                <div className="flex items-center gap-5 mb-4 lg:mb-0">
                                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <GraduationCap size={32} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-slate-800">{course.title}</h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">ID: {course.id}</span>
                                            <span className="font-medium text-blue-600">بواسطة: {course.instructor_name || 'أدمن المنصة'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-center">
                                    {/* زر إدارة الاختبارات - الرابط الأساسي الذي طلبته */}
                                    <button 
                                        onClick={() => navigate(`/admin/course/${course.id}/quizzes`)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-purple-50 text-purple-700 rounded-2xl font-bold hover:bg-purple-600 hover:text-white transition-all duration-200 border border-purple-100"
                                    >
                                        <FileText size={20} />
                                        <span>الاختبارات</span>
                                    </button>
                                    {/* زر إدارة الدروس - أضيفيه بجانب زر الاختبارات */}
                                    <button 
                                        onClick={() => navigate(`/admin/course/${course.id}/lessons`)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all duration-200 border border-blue-100"
                                    >
                                    <BookOpen size={20} />
                                    <span>الدروس</span>
                                    </button>
                                    {/* زر التعديل */}
                                    <button 
                                        onClick={() => navigate(`/edit-course/${course.id}`)}
                                        className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-200 border border-blue-100"
                                        title="تعديل الكورس"
                                    >
                                        <Pencil size={22} />
                                    </button>

                                    {/* زر الحذف */}
                                    <button 
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-200 border border-red-100"
                                        title="حذف الكورس"
                                    >
                                        <Trash2 size={22} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllContentManagement;
