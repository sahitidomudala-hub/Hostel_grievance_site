import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
    const [loginType, setLoginType] = useState('student'); // 'student' or 'admin'
    const [identifier, setIdentifier] = useState(''); // Email or SAP ID
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            let email = identifier;
            if (loginType === 'student') {
                // Map student SAP ID to internal email format
                email = `${identifier}@hostel.local`;
            }
            await login(email, password);
        } catch (err) {
            setError('Failed to log in: ' + err.message);
        }
    };

    // Check role and redirect
    const { userRole } = useAuth();
    React.useEffect(() => {
        if (userRole === 'student') navigate('/student');
        if (userRole === 'admin') navigate('/admin');
    }, [userRole, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Hostel Grievance Management System
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center border-b border-gray-200 mb-6">
                    <button
                        type="button"
                        className={`py-2 px-4 text-sm font-medium focus:outline-none border-b-2 ${loginType === 'student' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => { setLoginType('student'); setIdentifier(''); setError(''); }}
                    >
                        Student Login
                    </button>
                    <button
                        type="button"
                        className={`py-2 px-4 text-sm font-medium focus:outline-none border-b-2 ${loginType === 'admin' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => { setLoginType('admin'); setIdentifier(''); setError(''); }}
                    >
                        Admin Login
                    </button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 text-center text-sm">{error}</div>}
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="identifier"
                                name="identifier"
                                type={loginType === 'admin' ? "email" : "text"}
                                autoComplete={loginType === 'admin' ? "email" : "off"}
                                required
                                className="block w-full rounded-t-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                placeholder={loginType === 'admin' ? "Email address" : "SAP ID"}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-b-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            Sign in
                        </button>
                    </div>

                    {loginType === 'student' && (
                        <div className="text-center text-sm">
                            <span className="text-gray-600">Don't have an account? </span>
                            <Link to="/signup" className="font-medium text-primary hover:text-blue-600">
                                Sign up
                            </Link>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;
