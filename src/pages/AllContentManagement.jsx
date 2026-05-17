import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, Pencil, Trash2, FileText, Plus, Search, Loader2, GraduationCap, Users, Download, LayoutGrid } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const AllContentManagement = () => {
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); 
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user && user.role === 'admin';

    const gradesList = [
        { id: 'all', name: 'كل الكورسات' },
        { id: 'ثامن', name: 'الصف الثامن' },
        { id: 'تاسع', name: 'الصف التاسع' },
        { id: 'عاشر', name: 'الصف العاشر' },
        { id: '11', name: 'الحادي عشر' },
        { id: 'بكالوريا_علمي', name: 'بكالوريا علمي' },
        { id: 'بكالوريا_ادبي', name: 'بكالوريا أدبي' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/courses'); 
            setCourses(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("خطأ في جلب البيانات:", err);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExportToExcel = async (course) => {
        // ... (دالة التصدير كما هي بدون تغيير)
    };

    const handleDeleteCourse = async (id) => {
        if (!isAdmin) return;
        if (window.confirm("هل أنت متأكد من حذف هذا الكورس؟")) {
            try {
                await api.delete(`/courses/${id}`);
                setCourses(courses.filter(c => c.id !== id));
            } catch (err) {
                alert("فشل الحذف");
            }
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = activeTab === 'all' || course.grade === activeTab; 
        return matchesSearch && matchesGrade;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-right px-4" dir="rtl">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
                <p className="text-gray-500 font-bold">جاري تحميل محتوى المنصة...</p>
            </div>
        );
    }

    return (
        // 📱 تقليص الهوامش الخارجية على الموبايل p-4 وتكبيرها على الشاشات الكبيرة md:p-8
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-right font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto">
                
                {/* Header Section: flex-col على الموبايل ليصطف العنوان والبحث عمودياً */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shrink-0">
                                 <BookOpen size={24} md={28} />
                            </div>
                            إدارة المحتوى التعليمي
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">تحكم في الكورسات والاختبارات الخاصة بالمنصة</p>
                    </div>

                    {/* أزرار البحث والإضافة تصبح بعرض كامل w-full وتصطف بمرونة */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative group w-full sm:min-w-[300px]">
                            <Search className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="ابحث عن اسم الكورس..." 
                                className="w-full pr-11 pl-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-sm md:text-base"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {isAdmin && (
                            <button 
                                onClick={() => navigate('/add-course')}
                                className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg w-full sm:w-auto text-sm md:text-base shrink-0"
                            >
                                <Plus size={20} />
                                <span className="font-bold">كورس جديد</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 📱 قسم التبويبات المتجاوب: يسمح بالتمرير الأفقي على الموبايل المريح اللمس دون تخريب التصميم (flex-nowrap overflow-x-auto) */}
                <div className="mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/60 flex flex-nowrap overflow-x-auto gap-1 no-scrollbar scroll-smooth">
                    {gradesList.map((grade) => (
                        <button
                            key={grade.id}
                            onClick={() => setActiveTab(grade.id)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 shrink-0 ${
                                activeTab === grade.id
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {grade.id === 'all' && <LayoutGrid size={14} />}
                            {grade.name}
                            <span className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded-md ${activeTab === grade.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {grade.id === 'all' ? courses.length : courses.filter(c => c.grade === grade.id).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Courses List */}
                {filteredCourses.length === 0 ? (
                    <div className="bg-white p-12 md:p-20 rounded-[24px] border-2 border-dashed border-slate-200 text-center">
                        <Search className="text-slate-300 mx-auto mb-3" size={36} />
                        <h3 className="text-lg font-bold text-slate-700">لا توجد كورسات!</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredCourses.map(course => (
                            // 📱 الكارد الخارجي: يتحول من عمودي على الموبايل إلى أفقي على الشاشات الكبيرة lg:flex-row
                            <div key={course.id} className="bg-white p-4 md:p-6 rounded-[22px] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 hover:shadow-md transition-all group">
                                
                                {/* تفاصيل الكورس (الهوية والاسم) */}
                                <div className="flex items-center gap-4 w-full lg:w-auto">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <GraduationCap size={24} md={32} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-base md:text-xl text-slate-800 truncate">{course.title}</h3>
                                        {/* التسميات الفرعية تلتف بسلاسة flex-wrap */}
                                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">ID: {course.id}</span>
                                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                                                {gradesList.find(g => g.id === course.grade)?.name || course.grade}
                                            </span>
                                            <span className="text-blue-600 font-bold truncate">المدرب: {course.instructor_name || 'الأدمن'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 📱 الأزرار والعمليات: تتحول إلى نظام Grid على الموبايل لتصطف بشكل متناسق بعرض كامل */}
                                <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto border-t border-slate-50 pt-4 lg:pt-0 lg:border-none">
                                    <button 
                                        onClick={() => navigate(`/admin/course/${course.id}/students`)}
                                        className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 sm:px-4 sm:py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs md:text-sm hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                                    >
                                        <Users size={16} />
                                        <span>الطلاب</span>
                                    </button>

                                    <button 
                                        onClick={() => navigate(`/admin/course/${course.id}/quizzes`)}
                                        className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 sm:px-4 sm:py-2 bg-purple-50 text-purple-700 rounded-xl font-bold text-xs md:text-sm hover:bg-purple-600 hover:text-white transition-all border border-purple-100"
                                    >
                                        <FileText size={16} />
                                        <span>الاختبارات</span>
                                    </button>

                                    <button 
                                        onClick={() => navigate(`/admin/course/${course.id}/lessons`)}
                                        className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 sm:px-4 sm:py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs md:text-sm hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                                    >
                                        <BookOpen size={16} />
                                        <span>الدروس</span>
                                    </button>

                                    {/* أزرار الإجراءات الفردية تصطف بنسق ممتاز */}
                                    <div className="col-span-3 flex justify-end gap-2 mt-1 sm:mt-0 w-full sm:w-auto">
                                        <button 
                                            onClick={() => handleExportToExcel(course)}
                                            className="flex-1 sm:flex-none flex justify-center p-2.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-100"
                                            title="تصدير"
                                        >
                                            <Download size={18} />
                                        </button>

                                        {isAdmin && (
                                            <>
                                                <button 
                                                    onClick={() => navigate(`/edit-course/${course.id}`)}
                                                    className="flex-1 sm:flex-none flex justify-center p-2.5 bg-slate-100 text-slate-600 rounded-xl"
                                                    title="تعديل"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                    className="flex-1 sm:flex-none flex justify-center p-2.5 bg-red-50 text-red-500 rounded-xl"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
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

export default AllContentManagement;
