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
import AllQuizzes from './pages/AllQuizzes'; // <--- تأكد من استيراد هذه الصفحة
import Login from './pages/Login';
import Reports from './pages/Reports';
import AnnouncementsManager from './pages/AnnouncementsManager';
import AllContentManagement from './pages/AllContentManagement';
import StudentResults from './pages/StudentResults'; 

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
        {token && user && <Sidebar onLogout={refreshAuth} />}

        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route 
              path="/login" 
              element={!token ? <Login onLogin={refreshAuth} /> : <Navigate to="/" />} 
            />

            {/* --- مسارات عامة --- */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/add-course" element={<ProtectedRoute><AddCourse /></ProtectedRoute>} />
            
            {/* صفحة إنشاء اختبار جديد */}
            <Route path="/create-quiz/:courseId" element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />

            {/* --- مسار نتائج الطلاب --- */}
            <Route 
              path="/admin/results" 
              element={<AdminOrTeacherRoute><StudentResults /></AdminOrTeacherRoute>} 
            />

            {/* --- مسارات الأدمن حصراً --- */}
            <Route path="/admin/students" element={<AdminRoute><StudentManagement /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UsersManagement /></AdminRoute>} />
            <Route path="/admin/announcements" element={<AdminRoute><AnnouncementsManager /></AdminRoute>} />
            <Route path="/admin/all-content" element={<AdminRoute><AllContentManagement /></AdminRoute>} />
            <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />

            {/* --- مسارات التعديل والإدارة الضبط هنا --- */}
            <Route path="/edit-course/:id" element={<AdminOrTeacherRoute><AddCourse /></AdminOrTeacherRoute>} /> 

            {/* تم التعديل هنا: المسار الآن يفتح AllQuizzes لعرض القائمة بدلاً من CreateQuiz */}
            <Route 
              path="/admin/course/:courseId/quizzes" 
              element={<AdminOrTeacherRoute><AllQuizzes /></AdminOrTeacherRoute>} 
            />

            {/* مسار تعديل الأسئلة لاحقاً */}
            <Route 
              path="/admin/edit-quiz/:quizId" 
              element={<AdminOrTeacherRoute><CreateQuiz isEdit={true} /></AdminOrTeacherRoute>} 
            />

            <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;