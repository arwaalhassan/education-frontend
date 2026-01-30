import React, { useEffect, useState } from 'react';
import api from '../services/api'; 
import { 
    ClipboardList, 
    RefreshCw, 
    AlertCircle, 
    Download, 
    Search, 
    Filter,
    Users
} from 'lucide-react';

const StudentResults = () => {
    const [results, setResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // حالات الفلترة والبحث
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [coursesList, setCoursesList] = useState([]);

    const fetchResults = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/admin/results');
            setResults(res.data);
            setFilteredResults(res.data);

            // استخراج قائمة الكورسات الفريدة للفلترة
            const uniqueCourses = [...new Set(res.data.map(item => item.course_name).filter(Boolean))];
            setCoursesList(uniqueCourses);
        } catch (err) {
            console.error("فشل جلب النتائج", err);
            setError("تعذر الاتصال بالسيرفر، تأكد من تشغيل الباك إند.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    // منطق البحث والفلترة التلقائي
    useEffect(() => {
        let temp = results;

        if (searchTerm) {
            temp = temp.filter(r => 
                r.student_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCourse) {
            temp = temp.filter(r => r.course_name === selectedCourse);
        }

        setFilteredResults(temp);
    }, [searchTerm, selectedCourse, results]);

    // وظيفة التصدير إلى Excel (CSV)
    const exportToCSV = () => {
        if (filteredResults.length === 0) return;

        const headers = ["اسم الطالب", "الكورس", "الاختبار", "الدرجة", "التاريخ", "الحالة"];
        const rows = filteredResults.map(r => [
            r.student_name,
            r.course_name || 'غير محدد',
            r.quiz_title,
            `${parseFloat(r.score).toFixed(2)}%`,
            new Date(r.submission_date).toLocaleDateString('ar-EG'),
            r.is_completed ? "مكتمل" : "قيد التقدم"
        ]);

        let csvContent = "\uFEFF"; // لدعم اللغة العربية في Excel
        csvContent += headers.join(",") + "\n";
        rows.forEach(row => { csvContent += row.join(",") + "\n"; });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `نتائج_الطلاب_${new Date().toLocaleDateString()}.csv`);
        link.click();
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
                        <ClipboardList size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">سجل النتائج</h1>
                        <p className="text-gray-500 text-sm">عرض وتصدير تقارير أداء الطلاب</p>
                    </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={exportToCSV}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-all active:scale-95 shadow-md"
                    >
                        <Download size={18} />
                        تصدير Excel
                    </button>
                    <button 
                        onClick={fetchResults}
                        disabled={loading}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute right-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="text"
                        placeholder="ابحث باسم الطالب..."
                        className="w-full pr-10 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute right-3 top-3 text-gray-400" size={18} />
                    <select 
                        className="w-full pr-10 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        <option value="">كل الكورسات</option>
                        {coursesList.map(course => (
                            <option key={course} value={course}>{course}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center justify-between px-5 bg-blue-50 border border-blue-100 rounded-xl text-blue-700">
                    <div className="flex items-center gap-2">
                        <Users size={18} />
                        <span className="font-bold text-sm">إجمالي السجلات:</span>
                    </div>
                    <span className="text-lg font-black">{filteredResults.length}</span>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 text-red-700 flex items-center gap-3 rounded-xl animate-pulse">
                    <AlertCircle size={20} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Table Section */}
            <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-gray-50/80 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-bold text-gray-600 text-sm">الطالب</th>
                                <th className="p-4 font-bold text-gray-600 text-sm">الكورس</th>
                                <th className="p-4 font-bold text-gray-600 text-sm">الاختبار</th>
                                <th className="p-4 font-bold text-gray-600 text-sm text-center">الدرجة</th>
                                <th className="p-4 font-bold text-gray-600 text-sm">التاريخ</th>
                                <th className="p-4 font-bold text-gray-600 text-sm">الحالة</th>
                            </tr>
                        </thead>
                        
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <RefreshCw className="animate-spin text-blue-500" size={40} />
                                            <span className="text-gray-400 font-medium">جاري تحديث البيانات...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredResults.length > 0 ? (
                                filteredResults.map((res) => (
                                    <tr key={res.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4 font-bold text-gray-800">{res.student_name}</td>
                                        <td className="p-4">
                                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                                                {res.course_name || 'غير محدد'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">{res.quiz_title}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-black shadow-sm ${
                                                parseFloat(res.score) >= 50 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                                {parseFloat(res.score).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-400 font-mono" dir="ltr">
                                            {new Date(res.submission_date).toLocaleString('ar-EG', {
                                                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="p-4">
                                            <div className={`flex items-center gap-1.5 text-xs font-bold ${
                                                res.is_completed ? 'text-blue-600' : 'text-amber-500'
                                            }`}>
                                                <div className={`w-2 h-2 rounded-full ${res.is_completed ? 'bg-blue-600' : 'bg-amber-500 animate-pulse'}`}></div>
                                                {res.is_completed ? 'مكتمل' : 'قيد التقدم'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <Search size={40} strokeWidth={1} />
                                            <p className="text-lg">لا توجد نتائج تطابق بحثك</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentResults;