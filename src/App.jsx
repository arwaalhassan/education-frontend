import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AddCourse from './pages/AddCourse';
import Students from './pages/Students';
import MyCourses from './pages/MyCourses';
import UsersManagement from './pages/UsersManagement';
import StudentManagement from './pages/StudentManagement';
import CreateQuiz from './pages/CreateQuiz';
import AllQuizzes from './pages/AllQuizzes'; 
import Login from './pages/Login';
import Reports from './pages/Reports';
import AnnouncementsManager from './pages/AnnouncementsManager';
import AllContentManagement from './pages/AllContentManagement';
import StudentResults from './pages/StudentResults'; 
import CourseLessons from './pages/CourseLessons'; 
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const refreshAuth = () => {
    setToken(localStorage.getItem('token'));
    const savedUser = localStorage.getItem('user');
    try {
      setUser(savedUser ? JSON.parse(savedUser) : null);
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => refreshAuth();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- مكونات الحماية (Guards) ---
  
  const ProtectedRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    return children;
  };

  const AdminOrTeacherRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    if (user?.role !== 'admin' && user?.role !== 'teacher') return <Navigate to="/" />;
    return children;
  };

  const AdminRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    if (user?.role !== 'admin') return <Navigate to="/" />;
    return children;
  };

  return (
    <Router>
      <div className="flex bg-gray-100 min-h-screen">
        {/* لا يظهر الشريط الجانبي إلا إذا كان المستخدم مسجلاً دخوله */}
        {token && user && <Sidebar onLogout={refreshAuth} />}

        <div className="flex-1 overflow-y-auto">
          <Routes>
            {/* مسار تسجيل الدخول */}
            <Route 
              path="/login" 
              element={!token ? <Login onLogin={refreshAuth} /> : <Navigate to="/" />} 
            />

            {/* --- 1. مسارات عامة (للطالب والمعلم والآدمن) --- */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />

            {/* --- 2. مسارات المعلمين والآدمن (إدارة المحتوى) --- */}
            {/* ملاحظة: تم نقل المسارات التي كانت تسمح للطالب بالدخول إليها بالخطأ إلى هنا */}
            <Route path="/my-courses" element={<AdminOrTeacherRoute><MyCourses /></AdminOrTeacherRoute>} />
            <Route path="/add-course" element={<AdminOrTeacherRoute><AddCourse /></AdminOrTeacherRoute>} />
            <Route path="/edit-course/:id" element={<AdminOrTeacherRoute><AddCourse /></AdminOrTeacherRoute>} /> 
            {/* إدارة الدروس والمحتوى */}
            <Route 
              path="/admin/course/:courseId/lessons" 
              element={<AdminOrTeacherRoute><CourseLessons /></AdminOrTeacherRoute>} 
            />
            {/* إدارة الاختبارات */}
            <Route path="/create-quiz/:courseId" element={<AdminOrTeacherRoute><CreateQuiz /></AdminOrTeacherRoute>} />
            <Route path="/admin/course/:courseId/quizzes" element={<AdminOrTeacherRoute><AllQuizzes /></AdminOrTeacherRoute>} />
            <Route path="/admin/edit-quiz/:quizId" element={<AdminOrTeacherRoute><CreateQuiz isEdit={true} /></AdminOrTeacherRoute>} />
            <Route path="/admin/results" element={<AdminOrTeacherRoute><StudentResults /></AdminOrTeacherRoute>} />

            {/* --- 3. مسارات الآدمن حصراً (إدارة النظام والأرباح) --- */}
            <Route path="/admin/students" element={<AdminRoute><StudentManagement /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UsersManagement /></AdminRoute>} />
            <Route path="/admin/announcements" element={<AdminRoute><AnnouncementsManager /></AdminRoute>} />
            <Route path="/admin/all-content" element={<AdminRoute><AllContentManagement /></AdminRoute>} />
            <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />

            {/* إعادة توجيه أي مسار غير موجود */}
            <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
