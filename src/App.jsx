import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Student Routes */}
                    <Route element={<ProtectedRoute role="student" />}>
                        <Route path="/student/*" element={<StudentDashboard />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute role="admin" />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/analytics" element={<Analytics />} />
                    </Route>

                    <Route path="*" element={<div className="flex h-screen items-center justify-center">404 - Not Found</div>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
