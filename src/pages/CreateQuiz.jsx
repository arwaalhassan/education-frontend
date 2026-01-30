import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { PlusCircle, Save, Trash2, Clock, FileText, ArrowRight, Loader2 } from 'lucide-react';

const CreateQuiz = () => {
    // 1. استخراج المعرفات من الرابط
    // الترتيب في App.js يجب أن يكون مشابه لـ /admin/course/:courseId/quizzes أو /admin/edit-quiz/:quizId
    const { courseId, quizId } = useParams(); 
    const navigate = useNavigate();
    const isEditMode = Boolean(quizId);

    const [quizData, setQuizData] = useState({ 
        title: '', 
        duration: 30 
    });
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(isEditMode); 
    const [isSaving, setIsSaving] = useState(false);

    // 2. جلب بيانات الاختبار إذا كنا في وضع التعديل
    useEffect(() => {
        if (isEditMode) {
            const fetchQuizData = async () => {
                try {
                   
                    const res = await api.get(`/quizzes/admin/quizzes/${quizId}/details`);
                    setQuizData({ 
                        title: res.data.title, 
                        duration: res.data.duration 
                    });
                    setQuestions(res.data.questions || []);
                } catch (err) {
                    console.error("Fetch Error:", err);
                    alert("خطأ في جلب بيانات الاختبار، تأكد من صحة الرابط");
                } finally {
                    setLoading(false);
                }
            };
            fetchQuizData();
        }
    }, [quizId, isEditMode]);

    const addQuestionField = () => {
        setQuestions([...questions, { 
            question_text: '', 
            option_a: '', 
            option_b: '', 
            option_c: '', 
            option_d: '', 
            correct_answer: 'A' 
        }]);
    };

    const updateQuestion = (index, field, value) => {
        const updatedQs = [...questions];
        updatedQs[index][field] = value;
        setQuestions(updatedQs);
    };

    const removeQuestion = async (index, qId) => {
        if (isEditMode && qId) {
            if (!window.confirm("هل تريد حذف هذا السؤال نهائياً من قاعدة البيانات؟")) return;
            try {
                // تأكد من وجود هذا المسار في الـ Backend لحذف سؤال فردي
                await api.delete(`/quizzes/admin/questions/${qId}`);
            } catch (err) {
                return alert("فشل حذف السؤال من السيرفر");
            }
        }
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSaveQuiz = async () => {
        if (!quizData.title.trim() || questions.length === 0) {
            return alert("يرجى إكمال البيانات وإضافة سؤال واحد على الأقل");
        }

        setIsSaving(true);
        try {
            if (isEditMode) {
             
                await api.put(`/quizzes/admin/${quizId}`, {
                    title: quizData.title,
                    duration: parseInt(quizData.duration)
                });

                // 2. تحديث أو إضافة الأسئلة
                const promises = questions.map(q => {
                    if (q.id) {
                        // تحديث سؤال موجود
                        return api.put(`/quizzes/admin/questions/${q.id}`, q);
                    } else {
                        // إضافة سؤال جديد للاختبار الحالي
                        return api.post(`/quizzes/${quizId}/question`, q);
                    }
                });
                await Promise.all(promises);
                alert("تم تحديث الاختبار بنجاح");
            } else {
                // --- منطق الإضافة الأصلي ---
                const quizRes = await api.post('/quizzes', { 
                    courseId: parseInt(courseId), 
                    title: quizData.title,
                    duration: parseInt(quizData.duration),
                    is_published: 1 
                });
                
                const newQuizId = quizRes.data.quizId;
                
                // إضافة الأسئلة واحداً تلو الآخر للـ Quiz ID الجديد
                const questionPromises = questions.map(q => api.post(`/quizzes/${newQuizId}/question`, q));
                await Promise.all(questionPromises);
                alert("تم إنشاء الاختبار بنجاح");
            }
            navigate(-1); 
        } catch (error) {
            console.error("Save Error:", error);
            alert("حدث خطأ أثناء حفظ البيانات");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
            <p className="text-gray-500 font-bold">جاري تحميل بيانات الاختبار...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-2xl rounded-[2.5rem] text-right mt-10 mb-20 border border-gray-50" dir="rtl">
            
            {/* الرأس */}
            <div className="flex justify-between items-center mb-8 border-b-2 border-blue-50 pb-5">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
                            <FileText size={24} />
                        </div>
                        {isEditMode ? 'تعديل محتوى الاختبار' : 'إعداد اختبار جديد'}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 mr-12 font-medium">قم بإضافة الأسئلة وتحديد الإجابات الصحيحة</p>
                </div>
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-1 text-slate-500 hover:text-blue-600 font-bold transition-colors bg-slate-50 px-4 py-2 rounded-xl"
                >
                     عودة <ArrowRight size={20} />
                </button>
            </div>

            {/* معلومات الاختبار الأساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 bg-linear-to-r from-blue-50 to-indigo-50 p-8 rounded-4xl border border-blue-100/50">
                <div className="space-y-2">
                    <label className="font-black text-slate-700 block mr-1 text-sm">عنوان الاختبار</label>
                    <input 
                        type="text" 
                        placeholder="مثال: اختبار الشهر الأول"
                        value={quizData.title}
                        className="w-full p-4 rounded-2xl border-2 border-transparent shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-700"
                        onChange={(e) => setQuizData({...quizData, title: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="font-black text-slate-700 mr-1 text-sm flex items-center gap-2">
                        <Clock size={16} className="text-blue-600" /> مدة الاختبار (بالدقائق)
                    </label>
                    <input 
                        type="number" 
                        value={quizData.duration}
                        className="w-full p-4 rounded-2xl border-2 border-transparent shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-black text-slate-700"
                        onChange={(e) => setQuizData({...quizData, duration: e.target.value})}
                    />
                </div>
            </div>

            {/* قائمة الأسئلة */}
            <div className="space-y-8">
                {questions.map((q, index) => (
                    <div key={index} className="p-8 border-2 border-slate-100 rounded-4xl bg-white relative hover:border-blue-200 transition-colors group shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <span className="bg-slate-900 text-white px-5 py-1.5 rounded-full text-xs font-black shadow-lg">
                                الســـــؤال {index + 1}
                            </span>
                            <button 
                                onClick={() => removeQuestion(index, q.id)}
                                className="text-red-400 hover:text-red-600 transition-all flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-xl group-hover:opacity-100 md:opacity-0"
                            >
                                <Trash2 size={18} /> <span className="text-xs font-black">حذف السؤال</span>
                            </button>
                        </div>
                        
                        <div className="space-y-2 mb-6">
                            <label className="text-xs font-black text-slate-400 mr-2">نص السؤال</label>
                            <textarea 
                                placeholder="اكتب سؤالك هنا..."
                                className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-blue-200 focus:bg-white transition-all outline-none min-h-25 text-lg font-bold text-slate-800"
                                value={q.question_text}
                                onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                            />
                        </div>

                        {/* قسم الخيارات */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['a', 'b', 'c', 'd'].map((char) => (
                                <div key={char} className="relative group/option">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border border-slate-100 text-blue-600 font-black">
                                        {char.toUpperCase()}
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder={`الخيار ${char.toUpperCase()}`}
                                        className="w-full pr-14 pl-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all outline-none font-medium text-slate-700"
                                        value={q[`option_${char}`]}
                                        onChange={(e) => updateQuestion(index, `option_${char}`, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* قسم الإجابة الصحيحة */}
                        <div className="mt-6 flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50">
                            <div className="bg-emerald-500 text-white p-2 rounded-xl">
                                <PlusCircle size={18} />
                            </div>
                            <label className="text-sm font-black text-emerald-800 flex-1">حدد الإجابة الصحيحة من الخيارات أعلاه:</label>
                            <select 
                                className="p-2 px-8 border-2 border-emerald-200 rounded-xl shadow-sm font-black text-emerald-700 bg-white outline-none cursor-pointer"
                                value={q.correct_answer}
                                onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                            >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            {/* أزرار التحكم */}
            <div className="mt-12 flex flex-col md:flex-row gap-5">
                <button 
                    onClick={addQuestionField} 
                    className="flex-1 py-5 bg-slate-100 text-slate-700 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95"
                >
                    <PlusCircle size={22} /> إضافة سؤال جديد
                </button>
                <button 
                    onClick={handleSaveQuiz} 
                    disabled={isSaving}
                    className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="animate-spin" size={22} />
                    ) : (
                        <Save size={22} />
                    )}
                    {isEditMode ? 'حفظ كافة التعديلات' : 'حفظ ونشر الاختبار'}
                </button>
            </div>
        </div>
    );
};

export default CreateQuiz;
