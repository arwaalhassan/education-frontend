import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, Pencil, Trash2, FileText, Plus, Search, Loader2, GraduationCap, Users, Download, LayoutGrid } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

const AllContentManagement = () => {
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    // 🟢 إضافة State للتحكم في التبويب النشط (الصف الدراسي الحالي)
    const [activeTab, setActiveTab] = useState('all'); 
    const navigate = useNavigate();

    // قائمة الصفوف المطابقة تماماً للمنصة (الفلاتر والباك إيند)
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
            setCourses(res.data);
        } catch (err) {
            console.error("خطأ في جلب البيانات:", err);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (course) => {
        // 1. حساب عدد الفيديوهات (الدروس)
        const videosCount = course.lessons ? course.lessons.length : 0;

        // 2. حساب إجمالي عدد المشاهدات بجمع مشاهدات كل فيديو
        const totalViews = course.lessons 
            ? course.lessons.reduce((sum, lesson) => sum + (lesson.views_count || lesson.views || 0), 0)
            : 0;

        // 3. جلب اسم الصف الدراسي المقابل للـ id
        const gradeName = gradesList.find(g => g.id === course.grade)?.name || course.grade || 'غير محدد';

        // 4. تجهيز محتوى الـ CSV مع إضافة الـ BOM لضمان عدم ظهور اللغة العربية كرموز غريبة في Excel
        const csvRows = [
            ["ID", "اسم الكورس", "الصف الدراسي", "اسم الأستاذ", "عدد الفيديوهات", "إجمالي المشاهدات"], // العناوين
            [
                course.id, 
                `"${course.title.replace(/"/g, '""')}"`, // حماية النصوص من الفواصل داخل الاسم
                `"${gradeName}"`, 
                `"${course.instructor_name || 'الأدمن'}"`, 
                videosCount, 
                totalViews
            ]
        ];

        // تحويل المصفوفة إلى نص CSV يفصل بينه فواصل
        const csvContent = "\uFEFF" + csvRows.map(e => e.join(",")).join("\n");
        
        // 5. عملية التحميل
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `تقرير_كورس_${course.title.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); 
    };
    const handleDeleteCourse = async (id) => {
        if (window.confirm("هل أنت متأكد من حذف هذا الكورس وكل محتوياته نهائياً؟")) {
            try {
                await api.delete(`/courses/${id}`);
                setCourses(courses.filter(c => c.id !== id));
                alert("تم حذف الكورس بنجاح");
            } catch (err) {
                alert("فشل الحذف، تأكد من صلاحيات الإدارة");
            }
        }
    };

    // 🟢 تحسين عملية الفلترة: تشمل البحث + فلترة الصف الدراسي المختار
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        
        // إذا كان التبويب المختار هو "الكل" نمرر الكورس، وإلا نتحقق من مطابقة حقل الـ grade
        // (تأكدي أن الباك إيند يرسل حقل الكورس باسم grade أو قم بتغييره لـ grade_id حسب مسمياتك)
        const matchesGrade = activeTab === 'all' || course.grade === activeTab; 

        return matchesSearch && matchesGrade;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-right" dir="rtl">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
                <p className="text-gray-500 font-bold">جاري تحميل محتوى المنصة...</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen text-right font-sans" dir="rtl">
            {/* Header Section */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
                             <BookOpen size={28} />
                        </div>
                        إدارة المحتوى التعليمي
                    </h1>
                    <p className="text-slate-500 mt-1 mr-12">تحكم في الكورسات والاختبارات الخاصة بالمنصة</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute right-4 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="ابحث عن اسم الكورس في هذا القسم..." 
                            className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={() => navigate('/add-course')}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg"
                    >
                        <Plus size={22} />
                        <span className="font-bold">كورس جديد</span>
                    </button>
                </div>
            </div>

            {/* 🟢 قسم التبويبات (Tabs Navbar) لاختيار الصف الدراسي */}
            <div className="max-w-6xl mx-auto mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200/60 flex flex-wrap gap-1">
                {gradesList.map((grade) => (
                    <button
                        key={grade.id}
                        onClick={() => setActiveTab(grade.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                            activeTab === grade.id
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                        {grade.id === 'all' && <LayoutGrid size={16} />}
                        {grade.name}
                        {/* عداد يوضح عدد الكورسات الموجودة داخل هذا الصف برقم صغير */}
                        <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === grade.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {grade.id === 'all' 
                                ? courses.length 
                                : courses.filter(c => c.grade === grade.id).length
                            }
                        </span>
                    </button>
                ))}
            </div>

            {/* Courses List */}
            <div className="max-w-6xl mx-auto">
                {filteredCourses.length === 0 ? (
                    <div className="bg-white p-20 rounded-[30px] border-2 border-dashed border-slate-200 text-center">
                        <Search className="text-slate-300 mx-auto mb-4" size={40} />
                        <h3 className="text-xl font-bold text-slate-700">لا توجد كورسات مضافة في هذا القسم!</h3>
                        <p className="text-slate-400 text-sm mt-1">يمكنك إضافة أول كورس عبر زر "كورس جديد" بالأعلى</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        {filteredCourses.map(course => (
                            <div key={course.id} className="bg-white p-6 rounded-[25px] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center hover:shadow-md transition-all group">
                                <div className="flex items-center gap-5 mb-4 lg:mb-0 w-full lg:w-auto">
                                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <GraduationCap size={32} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-slate-800">{course.title}</h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded-md">ID: {course.id}</span>
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                                                {gradesList.find(g => g.id === course.grade)?.name || course.grade}
                                            </span>
                                            <span className="text-blue-600 font-bold">المدرب: {course.instructor_name || 'الأدمن'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-2 w-full lg:w-auto">
                                    {/* زر الطلاب */}
                                    <button 
                                        onClick={() => navigate(`/admin/course/${course.id}/students`)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                                    >
                                        <Users size={18} />
                                        <span>الطلاب</span>
                                    </button>

                                    {/* زر الاختبارات */}
                                    <button 
                                        onClick={() => navigate(`/admin/course/${course.id}/quizzes`)}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-bold hover:bg-purple-600 hover:text-white transition-all border border-purple-100"
                                    >
                                        <FileText size={18} />
                                        <span>الاختبارات</span>
                                    </button>

                                    {/* زر الدروس */}
                                    <button 
                                        onClick={() => navigate(`/admin/course/${course.id}/lessons`)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                                    >
                                        <BookOpen size={18} />
                                        <span>الدروس</span>
                                    </button>

                                    {/* زر التصدير */}
                                    <button 
                                        onClick={() => handleExport(course)}
                                        className="p-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all border border-orange-100"
                                        title="تصدير بيانات الكورس"
                                    >
                                        <Download size={20} />
                                    </button>

                                    {/* زر التعديل */}
                                    <button 
                                        onClick={() => navigate(`/edit-course/${course.id}`)}
                                        className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                        <Pencil size={20} />
                                    </button>

                                    {/* زر الحذف */}
                                    <button 
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                    >
                                        <Trash2 size={20} />
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
