import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/AuthStore';

const campusImageUrl = 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2072&auto=format&fit=crop';

const GoogleIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.651-3.358-11.303-7.962H6.389c3.279,6.463,9.932,11,17.611,11z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.012,35.197,44,30.024,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setAuth, role } = useAuthStore();

    useEffect(() => {
        // If a role exists, the user is logged in, so redirect them.
        if (role) {
            navigate('/');
        }
    }, [role, navigate]);

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:8000/auth/login', { email, password });
            if (res.data.success) {
                const { token, user } = res.data;
                setAuth(token, user.email, user.role, user.id); // Update the store
                localStorage.setItem('token', token); // Persist token
                console.log("Login successful:", user);
                navigate('/'); // Redirect on successful login
            }
        } catch (error) {
            console.error("Login failed:", error);
            // You might want to show an error message to the user here
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
                {/* Left Side */}
                <div className="relative flex flex-col justify-between p-8 text-white md:p-12 rounded-2xl md:w-1/2">
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl" style={{ backgroundImage: `url(${campusImageUrl})` }}>
                        <div className="absolute inset-0 bg-black opacity-40 rounded-2xl"></div>
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <p className="mb-2 text-sm font-light tracking-wider text-purple-100">BIT CONNECTIONS</p>
                        </div>
                        <div className="transform transition-all hover:scale-105">
                            <h1 className="mb-3 text-5xl font-bold leading-tight">
                                Your next connection awaits!
                            </h1>
                            <p className="font-light text-gray-200">
                                Log in to access campus tools, collaborate with peers, and continue where you left off.
                            </p>
                        </div>
                        <div /> {/* Spacer */}
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex flex-col justify-center p-8 md:p-14">
                    <span className="mb-3 text-4xl font-bold">Sign in to Bit Connections</span>
                    <span className="font-light text-gray-400 mb-8">
                        Welcome back! Please enter your details.
                    </span>
                    <div className="py-4">
                        <label className="mb-2 text-md font-semibold text-gray-600 flex items-center"><Mail className="mr-2 h-5 w-5 text-gray-400" />Email address</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="you@company.com"
                            className="w-full p-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="py-4">
                        <label className="mb-2 text-md font-semibold text-gray-600 flex items-center"><Lock className="mr-2 h-5 w-5 text-gray-400" />Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="********"
                            className="w-full p-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <button onClick={handleLogin} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg mt-4 mb-6 font-semibold hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Sign in
                    </button>
                    <div className="flex items-center mb-6">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-gray-400 font-light">or</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <button className="w-full border border-gray-300 text-md p-3 rounded-lg flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                        <GoogleIcon className="mr-3" />
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;