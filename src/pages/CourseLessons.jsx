
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { PlayCircle, FileText, Trash2, Loader2 } from 'lucide-react';

const CourseLessons = () => {
    const { courseId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
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

    // دالة الحذف الجديدة
    const handleDeleteLesson = async (lessonId) => {
        if (window.confirm("هل أنت متأكد من حذف هذا الدرس نهائياً؟")) {
            try {
                // التأكد من أن المسار يتطابق مع ما تم تعريفه في الباك إند
                await api.delete(`/admin/lessons/${lessonId}`);
                
                // تحديث القائمة في الواجهة فوراً بعد الحذف
                setLessons(lessons.filter(lesson => lesson.id !== lessonId));
                alert("تم حذف الدرس بنجاح");
            } catch (err) {
                console.error("Delete error:", err);
                alert("فشل في حذف الدرس. تأكد من صلاحيات الأدمن.");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto" dir="rtl">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">إدارة محتويات الكورس</h2>
                <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-medium">
                    لوحة تحكم الأدمن
                </span>
            </div>

            <div className="grid gap-4">
                {lessons.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                        <p className="text-slate-500 font-medium">لا يوجد دروس مرفوعة لهذا الكورس بعد.</p>
                    </div>
                ) : (
                    lessons.map((lesson) => (
                        <div 
                            key={lesson.id} 
                            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:border-red-100 transition-all duration-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    {lesson.content_type === 'video' ? 
                                        <PlayCircle className="text-blue-500" size={24} /> : 
                                        <FileText className="text-orange-500" size={24} />
                                    }
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-1">{lesson.title}</h4>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
                                            {lesson.content_type}
                                        </span>
                                        <span className="text-[10px] text-slate-400">ID: {lesson.id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* زر الحذف الجديد */}
                            <button 
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 font-bold text-sm group"
                            >
                                <span>حذف</span>
                                <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseLessons;
