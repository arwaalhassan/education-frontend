import React, { useState, useEffect } from 'react';
import api from '../services/api'; // استخدمي ملف الـ api الخاص بك
import * as XLSX from 'xlsx';

const CouponManager = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generatedCodes, setGeneratedCodes] = useState([]);
    
    const [formData, setFormData] = useState({
        courseId: '',
        count: 5,
        days: 30
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses'); 
            const data = Array.isArray(res.data) ? res.data : [];
        setCourses(data);
    } catch (err) {
        console.error("خطأ في جلب الكورسات", err);
        setCourses([]); // إفراغ المصفوفة في حال الخطأ لمنع الـ Crash
    }
    };

    const handleGenerate = async () => {
        if (formData.count <= 0) return alert("يرجى تحديد عدد صالح");
        
        setLoading(true);
        try {
            // الكود أصبح أنظف هنا لأن التوكن يرسل تلقائياً من ملف api.js
            const res = await api.post('/courses/generate-coupons', {
                course_id: formData.courseId || null,
                count: parseInt(formData.count),
                days: parseInt(formData.days)
            });

            setGeneratedCodes(res.data.codes);
            alert(`تم توليد ${res.data.codes.length} كود بنجاح`);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "فشل في توليد الكوبونات");
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
    if (generatedCodes.length === 0) return;

    const dataToExport = generatedCodes.map((code, index) => {
        // البحث عن الكورس مع التأكد من مطابقة النوع (استخدام == بدلاً من ===)
        const selectedCourse = courses.find(c => String(c.id) === String(formData.courseId));
        
        return {
            "م": index + 1,
            "كود الخصم": code,
            "تاريخ الإنشاء": new Date().toLocaleDateString('ar-EG'),
            "صلاحية الأيام": formData.days || "دائم",
            "الكورس المستهدف": selectedCourse ? selectedCourse.title : "عام (كل الكورسات)"
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "كوبونات الخصم");
    XLSX.writeFile(workbook, `Coupons_${formData.courseId || 'General'}_${Date.now()}.xlsx`);
};
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>🎫 إدارة كوبونات الخصم</h1>
            <p style={styles.subtitle}>يمكنك توليد أكواد اشتراك مجانية وتحديد مدة صلاحيتها</p>

            <div style={styles.card}>
                <div style={styles.inputGroup}>
                    <label>اختر الكورس المستهدف:</label>
                    <select 
                        style={styles.input}
                        value={formData.courseId}
                        onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                    >
                        <option value="">-- كوبون عام (كل الكورسات) --</option>
                        {courses.map(course => (
                           <option key={course.id} value={course.id}>
        {course.title || "بدون عنوان"} 
    </option>
                        ))}
                    </select>
                </div>

                <div style={styles.row}>
                    <div style={styles.inputGroup}>
                        <label>عدد الكوبونات:</label>
                        <input 
                            type="number" 
                            style={styles.input}
                            value={formData.count}
                            onChange={(e) => setFormData({...formData, count: e.target.value})}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label>الصلاحية (بالأيام):</label>
                        <input 
                            type="number" 
                            style={styles.input}
                            value={formData.days}
                            placeholder="مثلاً: 30"
                            onChange={(e) => setFormData({...formData, days: e.target.value})}
                        />
                    </div>
                </div>

                <button 
                    onClick={handleGenerate} 
                    disabled={loading}
                    style={{...styles.button, backgroundColor: '#0D47A1'}}
                >
                    {loading ? "جاري التوليد..." : "توليد الأكواد الآن"}
                </button>
            </div>

            {generatedCodes.length > 0 && (
                <div style={styles.resultContainer}>
                    <div style={styles.resultHeader}>
                        <h3>الأكواد التي تم إنشاؤها ({generatedCodes.length})</h3>
                        <button onClick={exportToExcel} style={styles.excelButton}>
                             تصدير إلى Excel 📊
                        </button>
                    </div>
                    
                    <div style={styles.codeList}>
                        {generatedCodes.map((code, index) => (
                            <div key={index} style={styles.codeItem}>
                                <code>{code}</code>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// تنسيقات CSS بسيطة وجميلة داخل الملف
const styles = {
    container: { maxWidth: '800px', margin: '40px auto', padding: '20px', direction: 'rtl', fontFamily: 'Arial, sans-serif' },
    title: { color: '#333', textAlign: 'center' },
    subtitle: { color: '#666', textAlign: 'center', marginBottom: '30px' },
    card: { background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '30px' },
    inputGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column', flex: 1 },
    row: { display: 'flex', gap: '15px', marginBottom: '15px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px', fontSize: '16px' },
    button: { width: '100%', padding: '15px', color: '#white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', color: '#fff' },
    resultContainer: { background: '#E3F2FD', padding: '20px', borderRadius: '15px' },
    resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    excelButton: { backgroundColor: '#2E7D32', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' },
    codeList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' },
    codeItem: { background: '#fff', padding: '10px', textAlign: 'center', borderRadius: '5px', border: '1px dashed #0D47A1', fontWeight: 'bold' }
};

export default CouponManager;