import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Megaphone, Trash2, Plus, Calendar, Image as ImageIcon, X, Upload } from 'lucide-react';

const AnnouncementsManager = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // حالات التحكم في النافذة المنبثقة (Modal)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // 1. جلب الإعلانات
    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/general/announcements');
            setAnnouncements(res.data);
        } catch (err) {
            console.error("خطأ في جلب الإعلانات:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    // 2. إضافة إعلان جديد
    const handleAddAnnouncement = async (e) => {
        e.preventDefault();
        if (!content.trim()) return alert("يرجى كتابة محتوى الإعلان");

        setUploading(true);
        const formData = new FormData();
        formData.append('content', content);
        if (imageFile) formData.append('image', imageFile);

        try {
          
            await api.post('/admin/announcements', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert("تم نشر الإعلان بنجاح");
            setIsModalOpen(false); // إغلاق النافذة
            setContent('');
            setImageFile(null);
            fetchAnnouncements(); // تحديث القائمة
        } catch (err) {
            alert("فشل في إضافة الإعلان، تأكد من صلاحيات الأدمن والاتصال");
        } finally {
            setUploading(false);
        }
    };

    // 3. حذف إعلان
    const handleDelete = async (id) => {
        if (!window.confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
        try {
            await api.delete(`/admin/announcements/${id}`);
            setAnnouncements(announcements.filter(a => a.id !== id));
        } catch (err) {
            alert("فشل حذف الإعلان");
        }
    };

    if (loading) return <div className="p-10 text-center animate-bounce text-orange-600 font-bold">جاري جلب الإعلانات...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen relative" dir="rtl">
            
            {/* الهيدر */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Megaphone className="text-orange-500" /> إدارة الإعلانات
                    </h1>
                    <p className="text-gray-500 text-sm">تحكم في الأخبار التي تظهر للطلاب في الصفحة الرئيسية</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-orange-700 transition shadow-lg shadow-orange-200"
                >
                    <Plus size={20} /> إضافة إعلان جديد
                </button>
            </div>

            {/* نافذة الإضافة (Modal) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">إنشاء إعلان جديد</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><X /></button>
                            </div>
                            
                            <form onSubmit={handleAddAnnouncement} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">نص الإعلان</label>
                                    <textarea 
                                        rows="4"
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition shadow-inner"
                                        placeholder="ماذا تريد أن تخبر الطلاب؟"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">صورة الإعلان (اختياري)</label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="text-gray-400 mb-2" />
                                            <p className="text-xs text-gray-500">{imageFile ? imageFile.name : "اضغط لرفع صورة"}</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                                    </label>
                                </div>

                                <button 
                                    disabled={uploading}
                                    className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition disabled:bg-gray-300"
                                >
                                    {uploading ? "جاري النشر..." : "نشر الإعلان الآن"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* عرض الإعلانات (Grid) */}
            {announcements.length === 0 ? (
                <div className="bg-white p-20 text-center rounded-3xl border-2 border-dashed border-gray-100 mt-10">
                    <Megaphone size={60} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-medium italic">لا توجد إعلانات منشورة حالياً..</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.map((ann) => (
                        <div key={ann.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="h-44 bg-gray-100 relative overflow-hidden">
                                {ann.imageUrl ? (
                                    <img src={ann.imageUrl} alt="إعلان" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300 bg-gray-50"><ImageIcon size={40} /></div>
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <button 
                                        onClick={() => handleDelete(ann.id)}
                                        className="p-2 bg-white/90 backdrop-blur text-red-500 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition"
                                    ><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-3 bg-orange-50 w-fit px-3 py-1 rounded-full">
                                    <Calendar size={12} />
                                    <span>{new Date(ann.created_at).toLocaleDateString('ar-SA')}</span>
                                </div>
                                <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3 text-sm flex-1 font-medium">
                                    {ann.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnnouncementsManager;
