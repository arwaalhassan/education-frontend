import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Clock, Save, HelpCircle, Loader2 } from 'lucide-react';

const AddInteractiveQuestions = ({ videoId }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // 1. جلب الأسئلة الموجودة مسبقاً عند تحميل المكون
    useEffect(() => {
        const fetchExistingQuestions = async () => {
            try {
                const res = await api.get(`/videos/${videoId}/questions`);
                // التأكد من تحويل الخيارات من نص JSON إلى مصفوفة إذا لزم الأمر
                const formattedData = res.data.map(q => ({
                    ...q,
                    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
                }));
                setQuestions(formattedData);
            } catch (err) {
                console.error("لم يتم العثور على أسئلة سابقة:", err);
            } finally {
                setFetching(false);
            }
        };
        if (videoId) fetchExistingQuestions();
    }, [videoId]);

    // إضافة سؤال جديد فارغ
    const addNewQuestion = () => {
        setQuestions([...questions, {
            question_text: '',
            trigger_time: 0,
            options: ['', ''],
            correct_option_index: 0
        }]);
    };

    // تحديث حقول السؤال الأساسية
    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    // تحديث الخيارات داخل السؤال
    const updateOption = (qIndex, optIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[optIndex] = value;
        setQuestions(newQuestions);
    };

    // 2. دالة الحفظ مع التحقق من البيانات
    const handleSave = async () => {
        // التحقق من أن جميع النصوص ممتلئة
        const isValid = questions.every(q => 
            q.question_text.trim() !== '' && 
            q.options.every(opt => opt.trim() !== '')
        );

        if (!isValid) {
            alert('يرجى التأكد من كتابة نصوص جميع الأسئلة والخيارات.');
            return;
        }

        setLoading(true);
        try {
            await api.post(`/videos/${videoId}/questions`, { questions });
            alert('تم حفظ الأسئلة التفاعلية بنجاح 🎉');
        } catch (err) {
            console.error(err);
            alert('فشل في حفظ الأسئلة، تأكد من اتصال السيرفر.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center p-10">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-slate-500">جاري تحميل الأسئلة...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-2 rounded-2xl" dir="rtl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <HelpCircle className="text-blue-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-800">الأسئلة التفاعلية</h2>
                </div>
                <button 
                    onClick={addNewQuestion}
                    className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-bold text-sm"
                >
                    <Plus size={18} />
                    إضافة سؤال جديد
                </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto px-2">
                {questions.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                        <p className="text-slate-400">لا يوجد أسئلة لهذا الفيديو بعد. ابدأ بإضافة أول سؤال!</p>
                    </div>
                ) : (
                    questions.map((q, qIndex) => (
                        <div key={qIndex} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 relative shadow-sm">
                            <button 
                                onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))}
                                className="absolute left-4 top-4 text-red-400 hover:text-red-600 p-1"
                                title="حذف السؤال"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">نص السؤال</label>
                                    <input 
                                        type="text"
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={q.question_text}
                                        onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                                        placeholder="مثلاً: ما نتيجة تنفيذ الكود التالي؟"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">توقيت الظهور (بالثواني)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 text-gray-400" size={16} />
                                        <input 
                                            type="number"
                                            min="0"
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                            value={q.trigger_time}
                                            onChange={(e) => updateQuestion(qIndex, 'trigger_time', Math.max(0, parseInt(e.target.value) || 0))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-600">الخيارات (اختر الإجابة الصحيحة):</label>
                                {q.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-3">
                                        <input 
                                            type="radio"
                                            name={`correct_${qIndex}`}
                                            checked={q.correct_option_index === optIndex}
                                            onChange={() => updateQuestion(qIndex, 'correct_option_index', optIndex)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                        <input 
                                            type="text"
                                            className={`flex-1 p-2 border rounded-lg text-sm outline-none transition-all ${q.correct_option_index === optIndex ? 'border-green-500 bg-green-50' : 'bg-white border-gray-200'}`}
                                            value={opt}
                                            onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                            placeholder={`الخيار ${optIndex + 1}`}
                                        />
                                        {q.options.length > 2 && (
                                            <button 
                                                onClick={() => {
                                                    const newOpts = q.options.filter((_, i) => i !== optIndex);
                                                    updateQuestion(qIndex, 'options', newOpts);
                                                }}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button 
                                    onClick={() => updateQuestion(qIndex, 'options', [...q.options, ''])}
                                    className="text-xs text-blue-600 font-bold mt-1 hover:underline flex items-center gap-1"
                                >
                                    <Plus size={14} /> إضافة خيار
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {questions.length > 0 && (
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="mt-8 w-full bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 disabled:bg-slate-300 transition-all shadow-lg shadow-green-100"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {loading ? 'جاري الحفظ...' : 'حفظ جميع التعديلات'}
                </button>
            )}
        </div>
    );
};

export default AddInteractiveQuestions;