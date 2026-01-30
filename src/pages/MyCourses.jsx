import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Edit3, Trash2, Video, Loader, X, ClipboardCheck, FolderPlus } from 'lucide-react';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error("خطأ في جلب الكورسات", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse({ ...course });
    setIsModalOpen(true);
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الكورس نهائياً؟")) {
        try {
            await api.delete(`/courses/${id}`);
            setCourses(courses.filter(c => c.id !== id));
        } catch (error) {
            alert("فشل الحذف، قد يكون الكورس مرتبطاً ببيانات أخرى");
        }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await api.put(`/courses/${selectedCourse.id}`, {
        title: selectedCourse.title,
        price: selectedCourse.price
      });
      setCourses(courses.map(c => c.id === selectedCourse.id ? selectedCourse : c));
      setIsModalOpen(false);
    } catch (error) {
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center p-20 min-h-screen">
        <Loader className="animate-spin text-blue-600 mb-2" size={40} />
        <p className="text-gray-500 font-bold">جاري تحميل كورساتك...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black mb-10 text-gray-800 border-r-8 border-blue-600 pr-4">
          لوحة تحكم المحاضر
          <p className="text-sm font-medium text-gray-500 mt-1">إدارة الدورات التدريبية والمحتوى التعليمي</p>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-4xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-100">
                    <Video size={28} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(course)} 
                      className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                      title="تعديل الكورس"
                    >
                      <Edit3 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                      title="حذف الكورس"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-black mb-2 text-gray-800 leading-tight">{course.title}</h3>
                <div className="inline-block bg-green-50 text-green-700 px-4 py-1 rounded-full font-bold text-sm mb-6">
                  السعر: {course.price} $
                </div>
              </div>

              <div className="space-y-3">
                {/* زر إدارة المحتوى */}
                <button 
                  onClick={() => navigate(`/manage-content/${course.id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                >
                  <FolderPlus size={20} />
                  إدارة الدروس والملفات
                </button>

                {/* زر إدارة الاختبارات - تم ربطه بصفحة AllQuizzes التي برمجناها */}
                <button 
                  onClick={() => navigate(`/admin/course/${course.id}/quizzes`)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-bold hover:bg-emerald-600 hover:text-white transition-all duration-300 border border-emerald-100"
                >
                  <ClipboardCheck size={20} />
                  إدارة اختبارات الكورس
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* نافذة التعديل المنبثقة */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-800">تعديل الكورس</h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-200 transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-black mb-2 text-gray-600 mr-2">اسم الدورة التدريبية</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                  value={selectedCourse.title || ''} 
                  onChange={(e) => setSelectedCourse({...selectedCourse, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-black mb-2 text-gray-600 mr-2">السعر المطلوب ($)</label>
                <input 
                  type="number" 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                  value={selectedCourse.price || 0}
                  onChange={(e) => setSelectedCourse({...selectedCourse, price: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={updateLoading}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {updateLoading ? (
                  <Loader className="animate-spin" size={24} />
                ) : 'تحديث البيانات الآن'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;