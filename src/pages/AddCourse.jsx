import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoUploader from '../components/VideoUploader'; 
import api from '../services/api';
import { Save, ArrowRight, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

const AddCourse = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [courseId, setCourseId] = useState(id || null);
  const [isSaved, setIsSaved] = useState(!!id);
  const [loading, setLoading] = useState(false);

 const [courseData, setCourseData] = useState({ 
    title: '', 
    description: '', 
    grade: 'تاسع', // القيمة الافتراضية الجديدة
    price: '' 
  });

  useEffect(() => {
    if (id) fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/courses/${id}`);
      setCourseData({
        title: res.data.title,
        description: res.data.description,
        grade: res.data.grade || 'تاسع', // جلب الصف من السيرفر
        price: res.data.price
      });
    } catch (err) {
      console.error("خطأ في جلب البيانات", err);
    } finally {
      setLoading(false);
    }
  };

  // الوظيفة الأساسية: حفظ بيانات الكورس للحصول على ID
  const saveBasicDetails = async () => {
    if (!courseData.title || !courseData.price) {
      return alert("يرجى إدخال العنوان والسعر على الأقل");
    }

    const user = JSON.parse(localStorage.getItem('user'));
    
    
    const payload = {
      title: courseData.title,
      description: courseData.description || "",
      grade: courseData.grade, // إرسال الصف الدراسي بدلاً من الفرع (أو معه)
      branch: 'scientific', // يمكن تركه كقيمة افتراضية إذا كان السيرفر يطلبه إجبارياً
      price: Number(courseData.price),
      instructor_id: user?.id 
    };

    try {
      setLoading(true);
      if (courseId) {
        // تحديث كورس موجود
        await api.put(`/courses/${courseId}`, payload);
        setIsSaved(true);
        alert("تم تحديث البيانات");
      } else {
        // إنشاء كورس جديد
        const res = await api.post('/courses', payload);
        // تأكد أن السيرفر يعيد الـ id الجديد في res.data.id أو res.data.courseId
        const newId = res.data.id || res.data.courseId || res.data.insertId;
        setCourseId(newId);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error details:", err.response?.data);
      alert("خطأ: " + (err.response?.data?.message || "تأكد من إدخال جميع الحقول المطلوبة"));
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSuccess = (data) => {
    alert("تم رفع الملف وربطه بالكورس بنجاح!");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto text-right" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="text-blue-600" />
          {courseId ? "إدارة محتوى الكورس" : "إنشاء كورس جديد"}
        </h1>
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ArrowRight size={18} /> رجوع
        </button>
      </div>

      <div className="space-y-6">
        {/* القسم الأول: البيانات الأساسية */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1 mr-1">عنوان الكورس *</label>
              <input 
                type="text" 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={courseData.title}
                onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                placeholder="مثلاً: كورس الفيزياء - الفصل الأول"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 mr-1">الوصف</label>
              <textarea 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
                value={courseData.description}
                onChange={(e) => setCourseData({...courseData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
      {/* القسم المعدل: اختيار الصف الدراسي */}
      <div>
        <label className="block text-sm font-bold mb-1 mr-1">الصف الدراسي *</label>
        <select 
          className="w-full p-3 border rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500"
          value={courseData.grade}
          onChange={(e) => setCourseData({...courseData, grade: e.target.value})}
        >
          <option value="تاسع">الصف التاسع</option>
          <option value="عاشر">الصف العاشر</option>
          <option value="11">الحادي عشر</option>
          <option value="12">البكالوريا</option>
        </select>
      </div>
              <div>
                <label className="block text-sm font-bold mb-1 mr-1">السعر ($) *</label>
                <input 
                  type="number" 
                  className="w-full p-3 border rounded-xl outline-none"
                  value={courseData.price}
                  onChange={(e) => setCourseData({...courseData, price: e.target.value})}
                />
              </div>
            </div>

            {!isSaved ? (
              <button 
                onClick={saveBasicDetails}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center"
              >
                {loading ? "جاري الحفظ..." : "حفظ البيانات والبدء برفع الفيديوهات"}
              </button>
            ) : (
              <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-100">
                <span className="flex items-center gap-2 text-green-700 font-bold">
                  <CheckCircle size={18} /> تم حفظ بيانات الكورس
                </span>
                <button onClick={() => setIsSaved(false)} className="text-xs text-blue-600 underline">تعديل البيانات</button>
              </div>
            )}
          </div>
        </div>

        {/* القسم الثاني: يفتح فقط بعد الحفظ الناجح لتجنب خطأ 403 و 400 */}
        {isSaved && courseId && (
          <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-blue-600">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="text-blue-600" size={20} />
              الآن ارفع الدروس أو الملفات لهذا الكورس
            </h3>
            <VideoUploader courseId={courseId} onUploadSuccess={handleVideoSuccess} />
            
            <button 
              onClick={() => navigate('/admin/all-content')}
              className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition"
            >
              إنهاء المهمة والعودة للوحة التحكم
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCourse;
