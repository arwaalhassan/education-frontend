import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  DollarSign, Users, BookOpen, TrendingUp, Download, 
  Calendar, Award, AlertTriangle, ArrowUpRight 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { arabicFontBase64 } from '../assets/arabicFont';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullReports = async () => {
      try {
        const response = await api.get('/admin/advanced-reports');
        setReportData(response.data);
      } catch (error) {
        console.error("خطأ في جلب التقارير المتقدمة:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFullReports();
  }, []);
// دالة متكاملة لمعالجة النصوص العربية للـ PDF
  const fixArabicText = (text) => {
    if (!text) return "";
    // 1. إعادة تشكيل الحروف (لربط الحروف ببعضها)
    const reshaped = arabicReshaper.reshape(text);
    // 2. قلب النص (لأن PDF يقرأ من اليسار لليمين افتراضياً)
    return reshaped.split('').reverse().join('');
  };

  const exportToPDF = () => {
    if (!reportData) return;
    
    const doc = new jsPDF();

    // 1. تسجيل الخط
    doc.addFileToVFS("ArabicFont.ttf", arabicFontBase64);
    doc.addFont("ArabicFont.ttf", "ArabicFont", "normal");
    
    // 2. تفعيل الخط
    doc.setFont("ArabicFont");

    // العنوان الرئيسي (محاذاة في المنتصف)
    doc.setFontSize(22);
    doc.text(fixArabicText("تقرير أداء المنصة الشامل"), 105, 20, { align: "center" });
    
    // إحصائيات سريعة
    doc.setFontSize(14);
    doc.text(`${reportData.summary?.totalEarnings || 0} $ :${fixArabicText("إجمالي الأرباح")}`, 190, 40, { align: "right" });
    doc.text(`${reportData.summary?.totalStudents || 0} :${fixArabicText("إجمالي الطلاب النشطين")}`, 190, 50, { align: "right" });

    // 3. جدول الكورسات الأكثر مبيعاً
    if (reportData.topCourses?.length > 0) {
        autoTable(doc, {
            startY: 65,
            head: [[fixArabicText('عدد المبيعات'), fixArabicText('اسم المقرر')]], // عكسنا الأعمدة لتناسب RTL
            body: reportData.topCourses.map(c => [
                c.sales_count, 
                fixArabicText(c.title)
            ]),
            styles: { 
                font: "ArabicFont", 
                halign: 'right',
                fontSize: 12 
            },
            headStyles: { 
                fillColor: [41, 128, 185], 
                font: "ArabicFont",
                halign: 'right' 
            },
            columnStyles: {
                0: { halign: 'center' }, // عمود الأرقام في المنتصف
                1: { halign: 'right' }   // عمود الأسماء لليمين
            }
        });
    }

    // 4. جدول جودة الاختبارات
    const finalY = doc.lastAutoTable.finalY || 100;
    if (reportData.quizPerformance?.length > 0) {
        doc.text(fixArabicText("تحليل أداء الاختبارات"), 190, finalY + 15, { align: "right" });
        
        autoTable(doc, {
            startY: finalY + 20,
            head: [[fixArabicText('متوسط النجاح'), fixArabicText('عنوان الاختبار')]],
            body: reportData.quizPerformance.map(q => [
                `${Math.round(q.average_score)}%`,
                fixArabicText(q.quiz_title)
            ]),
            styles: { font: "ArabicFont", halign: 'right' },
            headStyles: { fillColor: [142, 68, 173], font: "ArabicFont" }
        });
    }

    doc.save(`Admin_Report_${new Date().toLocaleDateString()}.pdf`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">جاري تحليل بيانات المنصة...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">التقارير التحليلية</h1>
          <p className="text-gray-500 mt-1">مراقبة الأداء المالي والتعليمي الشامل</p>
        </div>
        <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition shadow-lg active:scale-95"
        >
            <Download size={18} />
            تصدير التقرير (PDF)
        </button>
      </div>

      {/* 1. كروت الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="إجمالي الأرباح" 
          value={`${(reportData.summary?.totalEarnings || 0).toLocaleString()} $`} 
          icon={<DollarSign size={24} />} 
          color="green" 
        />
        <StatCard 
          title="الطلاب النشطين" 
          value={reportData.summary?.totalStudents || 0} 
          icon={<Users size={24} />} 
          color="blue" 
        />
        <StatCard 
          title="متوسط الدرجات" 
          value={`${reportData.summary?.averageGrade || 0}%`} 
          icon={<Award size={24} />} 
          color="purple" 
        />
        <StatCard 
          title="معدل النمو" 
          value="+12%" 
          icon={<TrendingUp size={24} />} 
          color="orange" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. الكورسات الأكثر مبيعاً */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
            <BookOpen className="text-blue-500" size={20} /> الكورسات الأكثر طلباً
          </h3>
          <div className="space-y-6">
            {reportData.topCourses?.map((course, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-700">{course.title}</span>
                  <span className="text-blue-600 font-medium">{course.sales_count} طالب</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(course.sales_count / (reportData.topCourses[0]?.sales_count || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. الطلاب الخاملين */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-50 relative">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} /> يحتاجون متابعة
          </h3>
          <p className="text-xs text-gray-400 mb-4">طلاب لم يبدأوا مشاهدة محتوى الكورسات</p>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {reportData.inactiveStudents?.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50/30 rounded-2xl border border-red-50 hover:bg-red-50 transition cursor-pointer">
                <div className="truncate">
                  <p className="text-sm font-bold text-gray-800">{student.username}</p>
                  <p className="text-[10px] text-gray-500 truncate">{student.course_name}</p>
                </div>
                <ArrowUpRight size={16} className="text-red-400" />
              </div>
            ))}
          </div>
        </div>

        {/* 4. أداء الاختبارات */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-purple-500" size={20} /> تحليل جودة الاختبارات
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportData.quizPerformance?.map((quiz, index) => (
              <div key={index} className="p-5 border border-gray-50 rounded-2xl bg-gray-50/50 hover:shadow-md transition">
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">{quiz.course_title}</p>
                <h4 className="font-bold text-gray-800 mb-4 truncate">{quiz.quiz_title}</h4>
                <div className="flex items-end justify-between">
                    <div>
                        <span className={`text-3xl font-black ${quiz.average_score > 70 ? 'text-green-600' : 'text-orange-500'}`}>
                          {Math.round(quiz.average_score)}%
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">متوسط النجاح</p>
                    </div>
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full mb-2">
                        <div 
                            className={`h-full rounded-full ${quiz.average_score > 70 ? 'bg-green-500' : 'bg-orange-500'}`}
                            style={{ width: `${quiz.average_score}%` }}
                        ></div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-50 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`${colors[color]} p-4 rounded-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        <h2 className="text-2xl font-black text-gray-800 mt-1">{value}</h2>
      </div>
    </div>
  );
};

export default Reports;
