import React, { useState } from 'react';
import api from '../services/api';
import { Upload, Loader, FileText, Video as VideoIcon } from 'lucide-react';

const VideoUploader = ({ courseId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(""); 
  const [linkUrl, setLinkUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const uploadVideo = async () => {
    // التحقق من المدخلات المطلوبة للسيرفر
    if (!file || !title) return alert("يرجى إدخال العنوان واختيار ملف");
// التحقق من نوع الرفع
    if (uploadType === 'file' && !file) return alert("يرجى اختيار ملف");
    if (uploadType === 'link' && !linkUrl) return alert("يرجى إدخال الرابط");

    setUploading(true);
    try {
      let res;
   if (uploadType === 'file') {
        // حالة رفع ملف (FormData)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('course_id', courseId);
        formData.append('title', title);
        formData.append('description', 'تم الرفع كملف');
        
        res = await api.post('/videos/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (p) => setProgress(Math.round((p.loaded * 100) / p.total))
        });
      } else {
        // حالة إضافة رابط (JSON عادي)
        const payload = {
          course_id: courseId,
          title: title,
          link_url: linkUrl, // هذا الحقل سيخزنه السيرفر في file_storage_path
          description: 'رابط حصة مباشرة / خارجي',
          sort_order: 0
        };
        
        res = await api.post('/videos/upload', payload);
      }
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
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm" dir="rtl">
      {/* اختيار نوع الرفع */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button
          onClick={() => setUploadType('file')}
          className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-lg font-bold transition ${uploadType === 'file' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
        >
          <FileUp size={18} /> رفع ملف
        </button>
        <button
          onClick={() => setUploadType('link')}
          className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-lg font-bold transition ${uploadType === 'link' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
        >
          <LinkIcon size={18} /> إضافة رابط (Meet)
        </button>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">عنوان الدرس / المادة</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثلاً: حصة مباشرة - مراجعة الفصل الأول"
          className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {uploadType === 'file' ? (
        <div className="mb-6 p-4 border-2 border-dashed border-gray-200 rounded-xl">
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept="video/*,.pdf,.doc,.docx" 
            className="w-full text-sm text-gray-500 file:bg-blue-50 file:text-blue-700 file:px-4 file:py-2 file:rounded-lg file:border-0" 
          />
        </div>
      ) : (
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2 text-blue-600">رابط Google Meet أو رابط خارجي</label>
          <input 
            type="url" 
            value={linkUrl} 
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="w-full px-4 py-3 border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {uploading && uploadType === 'file' && (
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
          <div className="bg-blue-600 h-full transition-all" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      <button 
        onClick={handleUpload} 
        disabled={uploading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {uploading ? <Loader className="animate-spin" /> : <Upload size={20} />}
        {uploadType === 'file' ? 'رفع وحفظ الملف' : 'حفظ الرابط'}
      </button>
    </div>
  );
};

export default VideoUploader;
