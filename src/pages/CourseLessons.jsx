import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api'; 
import { 
    PlayCircle, 
    FileText, 
    Trash2, 
    Loader2, 
    HelpCircle, 
    X, 
    Video,
    FolderPlus,
    Plus,      
    ChevronDown
} from 'lucide-react';
import AddInteractiveQuestions from '../components/AddInteractiveQuestions';
import VideoUploader from '../components/VideoUploader';

const CourseLessons = () => {
    const { courseId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState([]);
    const [selectedLessonId, setSelectedLessonId] = useState(null);
    const [showAddSection, setShowAddSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState("");
    const [openUploaderId, setOpenUploaderId] = useState(null);
    useEffect(() => {
        const fetchLessons = async () => {
            try {
                // تأكدي أن هذا الرابط يعيد مصفوفة من الدروس
                const res = await api.get(`/videos/course/${courseId}/list`);
                setLessons(res.data);
            } catch (err) {
                console.error("خطأ في جلب الدروس:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLessons();
    }, [courseId]);

    
    // دالة جلب البيانات المنظمة (Hierarchy)
    const fetchContent = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/courses/${courseId}/hierarchy`); 
            setSections(res.data);
        } catch (err) {
            console.error("خطأ في جلب الهيكلية:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, [courseId]);

    const handleAddSection = async () => {
        if (!newSectionTitle) return;
        try {
            await api.post('/courses/sections', { course_id: courseId, title: newSectionTitle });
            setNewSectionTitle("");
            setShowAddSection(false);
            fetchContent();
        } catch (err) { alert("فشل إضافة المجلد"); }
    };

    const handleDeleteSection = async (sectionId) => {
        if (window.confirm("حذف المجلد سيحذف كل الدروس التي بداخله، هل أنت متأكد؟")) {
            try {
                await api.delete(`/courses/sections/${sectionId}`);
                fetchContent();
            } catch (err) { alert("فشل الحذف"); }
        }
    };
    const handleDeleteLesson = async (lessonId) => {
        if (window.confirm("هل أنت متأكد من حذف هذا الدرس نهائياً؟")) {
            try {
                await api.delete(`/admin/lessons/${lessonId}`);
                setLessons(lessons.filter(lesson => lesson.id !== lessonId));
                alert("تم حذف الدرس بنجاح");
            } catch (err) {
                console.error("Delete error:", err);
                alert("فشل في حذف الدرس.");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );}
    return (
        <div className="p-8 max-w-5xl mx-auto" dir="rtl">
            {/* الهيدر */}
            <div className="flex justify-between items-center mb-10">
                <div className="text-right">
                    <h1 className="text-3xl font-black text-slate-800">إدارة محتوى الكورس</h1>
                    <p className="text-slate-500 font-medium">نظّم الدروس داخل وحدات تعليمية مرتبة</p>
                </div>
                <button 
                    onClick={() => setShowAddSection(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                    <FolderPlus size={20} />
                    إضافة وحدة جديدة
                </button>
            </div>

            {/* فورم إضافة مجلد جديد */}
            {showAddSection && (
                <div className="mb-8 p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 flex gap-4 items-end animate-in fade-in slide-in-from-top-4">
                    <div className="flex-1 text-right">
                        <label className="block text-sm font-bold mb-2 text-blue-800">اسم الوحدة (مثلاً: الوحدة الأولى)</label>
                        <input 
                            type="text" 
                            className="w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                            placeholder="ادخل عنوان المجلد هنا..."
                            value={newSectionTitle}
                            onChange={(e) => setNewSectionTitle(e.target.value)}
                        />
                    </div>
                    <button onClick={handleAddSection} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors">حفظ</button>
                    <button onClick={() => setShowAddSection(false)} className="bg-gray-200 text-gray-600 px-6 py-4 rounded-2xl font-bold hover:bg-gray-300">إلغاء</button>
                </div>
            )}

            {/* عرض المجلدات والدروس */}
            <div className="space-y-6">
                {sections.length === 0 ? (
                    <div className="text-center p-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Video className="mx-auto text-slate-200 mb-4" size={64} />
                        <p className="text-slate-400 font-bold text-xl">لا يوجد محتوى حالياً، ابدأ بإضافة أول وحدة تعليمية</p>
                    </div>
                ) : (
                    sections.map((section) => (
                        <div key={section.id} className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* رأس المجلد */}
                            <div className="p-6 bg-slate-50/80 flex justify-between items-center border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-600">
                                        <ChevronDown size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800">{section.title}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setOpenUploaderId(openUploaderId === section.id ? null : section.id)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${openUploaderId === section.id ? 'bg-red-50 text-red-600' : 'bg-blue-600 text-white shadow-md shadow-blue-100'}`}
                                    >
                                        {openUploaderId === section.id ? <X size={16}/> : <Plus size={16}/>}
                                        {openUploaderId === section.id ? "إغلاق" : "إضافة درس هنا"}
                                    </button>
                                    <button onClick={() => handleDeleteSection(section.id)} className="p-2 text-red-300 hover:text-red-600 transition-colors"><Trash2 size={20}/></button>
                                </div>
                            </div>

                            {/* منطقة الرفع داخل المجلد */}
                            {openUploaderId === section.id && (
                                <div className="p-6 bg-blue-50/30 border-b border-blue-100">
                                    <VideoUploader 
                                        courseId={courseId} 
                                        sectionId={section.id} 
                                        onUploadSuccess={() => {
                                            fetchContent();
                                            setOpenUploaderId(null);
                                        }} 
                                    />
                                </div>
                            )}

                            {/* قائمة الدروس داخل هذا المجلد */}
                            <div className="p-4 space-y-2">
                                {section.lessons && section.lessons.length > 0 ? (
                                    section.lessons.map(lesson => (
                                        <div key={lesson.id} className="flex items-center justify-between p-4 bg-white border border-transparent hover:border-blue-100 hover:bg-blue-50/20 rounded-2xl transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${lesson.content_type === 'video' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                                                    {lesson.content_type === 'video' ? <PlayCircle size={20} /> : <FileText size={20} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-700">{lesson.title}</h4>
                                                    <span className="text-[10px] text-slate-400 uppercase">{lesson.content_type}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setSelectedLessonId(lesson.id)} className="p-2 bg-white text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all"><HelpCircle size={18}/></button>
                                                <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 bg-white text-red-500 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-6 text-slate-400 text-sm italic">لا توجد دروس مضافة لهذه الوحدة</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* مودال الأسئلة التفاعلية */}
            {selectedLessonId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative">
                        <button 
                            onClick={() => setSelectedLessonId(null)}
                            className="absolute left-6 top-6 text-slate-400 hover:text-slate-600 transition-colors z-10"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 text-right">
                                تعديل الأسئلة التفاعلية للدرس
                            </h3>
                            <AddInteractiveQuestions videoId={selectedLessonId} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseLessons;