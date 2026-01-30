import React, { useState } from 'react';
import api from '../services/api';
import { Upload, Loader, FileText, Video as VideoIcon } from 'lucide-react';

const VideoUploader = ({ courseId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(""); // إضافة عنوان للملف
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const uploadVideo = async () => {
    // التحقق من المدخلات المطلوبة للسيرفر
    if (!file || !title) return alert("يرجى إدخال العنوان واختيار ملف");

    const formData = new FormData();
    // 1. يجب أن يكون الاسم 'file' كما هو محدد في upload.js (.single('file'))
    formData.append('file', file); 
    // 2. إرسال بيانات الكورس المطلوبة في videoController.js
    formData.append('course_id', courseId);
    formData.append('title', title);
    formData.append('description', 'تم الرفع عبر لوحة التحكم');
    formData.append('sort_order', 0);

    setUploading(true);
    try {
      // إرسال الطلب للمسار الذي حددناه في routes/videos.js
      const res = await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      
      // السيرفر يعيد filePath ونوع الملف في الاستجابة
      const result = res.data;
      onUploadSuccess(result); 
      alert(`تم رفع ${result.type} بنجاح!`);
      setFile(null);
      setTitle("");
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "فشل الرفع";
      alert(errorMsg);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المادة (فيديو أو ملف)</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: الدرس الأول: مقدمة في البرمجة"
          className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <input 
          type="file" 
          onChange={handleFileChange} 
          // السماح بالفيديو وملفات المكتب ليتوافق مع الميدل وير الجديد
          accept="video/*,.pdf,.doc,.docx" 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
        />
      </div>
      
      {uploading && (
        <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
          <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      <button 
        type="button"
        onClick={uploadVideo} 
        disabled={uploading}
        className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {uploading ? (
          <><Loader className="animate-spin" /> جاري المعالجة {progress}%</>
        ) : (
          <><Upload size={20} /> حفظ ورفع المادة التعليمية</>
        )}
      </button>
    </div>
  );
};

export default VideoUploader;