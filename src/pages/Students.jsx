import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { User, Mail, Calendar, Trash2, Search } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // حالة نص البحث
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/students');
        setStudents(response.data);
      } catch (error) {
        console.error("Failed to load students", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // دالة الفلترة: تأخذ القائمة الأصلية وتعيد فقط من يطابق نص البحث
  const filteredStudents = students.filter((student) =>
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center">جاري تحميل بيانات الطلاب...</div>;

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">قائمة الطلاب</h1>
          <p className="text-gray-500 text-sm">إدارة الطلاب المسجلين في منصتك</p>
        </div>

        {/* حقل البحث الذكي */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">الطالب</th>
              <th className="p-4 font-semibold text-gray-600">البريد الإلكتروني</th>
              <th className="p-4 font-semibold text-gray-600">تاريخ التسجيل</th>
              <th className="p-4 font-semibold text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 flex items-center gap-3 text-right">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <User size={18} />
                  </div>
                  <span className="font-medium text-gray-800">{student.username}</span>
                </td>
                <td className="p-4 text-gray-600">{student.email}</td>
                <td className="p-4 text-gray-500 text-sm">
                   {new Date(student.created_at).toLocaleDateString('ar-EG')}
                </td>
                <td className="p-4">
                  <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* حالة عدم وجود نتائج */}
        {filteredStudents.length === 0 && (
          <div className="p-20 text-center">
            <div className="text-gray-300 mb-2 flex justify-center"><Search size={48} /></div>
            <p className="text-gray-500 font-medium">لا توجد نتائج تطابق بحثك: "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;