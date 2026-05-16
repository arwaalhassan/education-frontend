import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api'; 
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
    GripVertical,
    Eye
} from 'lucide-react';
import AddInteractiveQuestions from '../components/AddInteractiveQuestions';
import VideoUploader from '../components/VideoUploader';

const CourseLessons = () => {
    const { courseId } = useParams();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLessonId, setSelectedLessonId] = useState(null);
    const [showAddSection, setShowAddSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState("");
    const [openUploaderId, setOpenUploaderId] = useState(null);

    // جلب البيانات المنظمة (Hierarchy)
    const fetchContent = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/courses/${courseId}/hierarchy`); 
            setSections(res.data);
        } catch (err) {
            console.error("خطأ في جلب الهيكلية:", err);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    // دالة تحديث الترتيب في السيرفر
    const handleReorderSave = async (updatedSections) => {
        try {
            await api.post(`/courses/${courseId}/reorder`, { sections: updatedSections });
        } catch (err) {
            console.error("فشل حفظ الترتيب الجديد:", err);
            alert("حدث خطأ أثناء حفظ الترتيب، يرجى تحديث الصفحة.");
        }
    };

    // منطق السحب والإفلات
    const onDragEnd = (result) => {
        const { destination, source, type } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newSections = Array.from(sections);

        if (type === 'SECTION') {
            // إعادة ترتيب الوحدات (المجلدات)
            const [reorderedItem] = newSections.splice(source.index, 1);
            newSections.splice(destination.index, 0, reorderedItem);
            setSections(newSections);
            handleReorderSave(newSections);
        } else {
            // إعادة ترتيب الدروس
            const sourceSectionIndex = newSections.findIndex(s => `section-${s.id}` === source.droppableId);
            const destSectionIndex = newSections.findIndex(s => `section-${s.id}` === destination.droppableId);

            if (sourceSectionIndex === -1 || destSectionIndex === -1) return;

            const sourceSection = newSections[sourceSectionIndex];
            const destSection = newSections[destSectionIndex];

            const sourceLessons = Array.from(sourceSection.lessons || []);
            const [movedLesson] = sourceLessons.splice(source.index, 1);

            if (sourceSectionIndex === destSectionIndex) {
                // ترتيب داخل نفس الوحدة
                sourceLessons.splice(destination.index, 0, movedLesson);
                newSections[sourceSectionIndex] = { ...sourceSection, lessons: sourceLessons };
            } else {
                // نقل من وحدة إلى وحدة أخرى
                const destLessons = Array.from(destSection.lessons || []);
                destLessons.splice(destination.index, 0, movedLesson);
                newSections[sourceSectionIndex] = { ...sourceSection, lessons: sourceLessons };
                newSections[destSectionIndex] = { ...destSection, lessons: destLessons };
            }

            setSections(newSections);
            handleReorderSave(newSections);
        }
    };

    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) return;
        try {
            await api.post('/courses/sections', { course_id: courseId, title: newSectionTitle });
            setNewSectionTitle("");
            setShowAddSection(false);
            fetchContent();
        } catch (err) { alert("فشل إضافة الوحدة"); }
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
                fetchContent(); 
                alert("تم حذف الدرس بنجاح");
            } catch (err) {
                console.error("Delete error:", err);
                alert("فشل في حذف الدرس.");
            }
        }
    };

    if (loading && sections.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto" dir="rtl">
            {/* الهيدر */}
            <div className="flex justify-between items-center mb-10">
                <div className="text-right">
                    <h1 className="text-3xl font-black text-slate-800">إدارة محتوى الكورس</h1>
                    <p className="text-slate-500 font-medium">نظّم الدروس والوحدات بالسحب والإفلات</p>
                </div>
                <button 
                    onClick={() => setShowAddSection(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                    <FolderPlus size={20} />
                    إضافة وحدة جديدة
                </button>
            </div>

            {/* فورم إضافة وحدة */}
            {showAddSection && (
                <div className="mb-8 p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 flex gap-4 items-end animate-in fade-in slide-in-from-top-4">
                    <div className="flex-1 text-right">
                        <label className="block text-sm font-bold mb-2 text-blue-800">اسم الوحدة</label>
                        <input 
                            type="text" 
                            className="w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                            placeholder="مثلاً: الوحدة الأولى: مقدمة في Flutter"
                            value={newSectionTitle}
                            onChange={(e) => setNewSectionTitle(e.target.value)}
                        />
                    </div>
                    <button onClick={handleAddSection} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700">حفظ</button>
                    <button onClick={() => setShowAddSection(false)} className="bg-gray-200 text-gray-600 px-6 py-4 rounded-2xl font-bold hover:bg-gray-300">إلغاء</button>
                </div>
            )}

            {/* نظام السحب والإفلات */}
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="all-sections" type="SECTION">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                            {sections.length === 0 ? (
                                <div className="text-center p-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                                    <Video className="mx-auto text-slate-200 mb-4" size={64} />
                                    <p className="text-slate-400 font-bold text-xl">ابدأ بإضافة أول وحدة تعليمية</p>
                                </div>
                            ) : (
                                sections.map((section, index) => (
                                    <Draggable key={section.id} draggableId={`section-${section.id}`} index={index}>
                                        {(provided) => (
                                            <div 
                                                ref={provided.innerRef} 
                                                {...provided.draggableProps}
                                                className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden"
                                            >
                                                {/* رأس الوحدة */}
                                                <div className="p-6 bg-slate-50/80 flex justify-between items-center border-b border-slate-100">
                                                    <div className="flex items-center gap-4">
                                                        <div {...provided.dragHandleProps} className="text-slate-400 hover:text-blue-500 cursor-grab active:cursor-grabbing">
                                                            <GripVertical size={22} />
                                                        </div>
                                                        <h3 className="text-xl font-black text-slate-800">{section.title}</h3>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => setOpenUploaderId(openUploaderId === section.id ? null : section.id)}
                                                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${openUploaderId === section.id ? 'bg-red-50 text-red-600' : 'bg-blue-600 text-white shadow-md'}`}
                                                        >
                                                            {openUploaderId === section.id ? <X size={16}/> : <Plus size={16}/>}
                                                            {openUploaderId === section.id ? "إغلاق" : "إضافة درس"}
                                                        </button>
                                                        <button onClick={() => handleDeleteSection(section.id)} className="p-2 text-red-300 hover:text-red-600 transition-colors">
                                                            <Trash2 size={20}/>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* منطقة الرفع */}
                                                {openUploaderId === section.id && (
                                                    <div className="p-6 bg-blue-50/30 border-b border-blue-100">
                                                        <VideoUploader 
                                                            courseId={courseId} 
                                                            sectionId={section.id} 
                                                            onUploadSuccess={() => { fetchContent(); setOpenUploaderId(null); }} 
                                                        />
                                                    </div>
                                                )}

                                                {/* قائمة الدروس */}
                                                <Droppable droppableId={`section-${section.id}`} type="LESSON">
                                                    {(provided) => (
                                                        <div {...provided.droppableProps} ref={provided.innerRef} className="p-4 space-y-2 min-h-[50px]">
                                                            {section.lessons && section.lessons.length > 0 ? (
                                                                section.lessons.map((lesson, lIndex) => (
                                                                    <Draggable key={lesson.id} draggableId={`lesson-${lesson.id}`} index={lIndex}>
                                                                        {(provided) => (
                                                                            <div 
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                className="flex items-center justify-between p-4 bg-white border border-transparent hover:border-blue-100 hover:bg-blue-50/20 rounded-2xl transition-all group"
                                                                            >
                                                                                <div className="flex items-center gap-4">
                                                                                    <GripVertical size={16} className="text-slate-300 group-hover:text-blue-400 cursor-grab" />
                                                                                    <div className={`p-2 rounded-lg ${lesson.content_type === 'video' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                                                                                        {lesson.content_type === 'video' ? <PlayCircle size={20} /> : <FileText size={20} />}
                                                                                    </div>
                                                                                    <div className="flex flex-col gap-1">
                                                                                        <h4 className="font-bold text-slate-700 text-right">{lesson.title}</h4>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                                                                                                {lesson.content_type}
                                                                                            </span>
                                                                                            {lesson.content_type === 'video' && (
                                                                                                <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                                                                                    <Eye size={12} />
                                                                                                    <span>{lesson.views_count || lesson.views || 0} مشاهدة</span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    <button onClick={() => setSelectedLessonId(lesson.id)} className="p-2 bg-white text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all">
                                                                                        <HelpCircle size={18}/>
                                                                                    </button>
                                                                                    <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 bg-white text-red-500 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-all">
                                                                                        <Trash2 size={18}/>
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))
                                                            ) : (
                                                                !openUploaderId && <p className="text-center py-6 text-slate-400 text-sm italic">اسحب دروساً إلى هنا أو اضغط إضافة درس</p>
                                                            )}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </div>
                                        )}
                                    </Draggable>
                                ))
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* مودال الأسئلة التفاعلية */}
            {selectedLessonId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative">
                        <button 
                            onClick={() => setSelectedLessonId(null)}
                            className="absolute left-6 top-6 text-slate-400 hover:text-slate-600 transition-colors z-10"
                        >
                            <X size={24} />
                        </button>
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 text-right">إدارة الأسئلة التفاعلية</h3>
                            <AddInteractiveQuestions videoId={selectedLessonId} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseLessons;
