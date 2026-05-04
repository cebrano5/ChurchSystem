import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';

export default function Welcome({ auth, canLogin, canRegister, status }) {
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

    // Login Form
    const loginForm = useForm({
        username: '',
        password: '',
        remember: false,
    });

    // Register Form
    const registerForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const onLoginSubmit = (e) => {
        e.preventDefault();
        loginForm.post(route('login'), {
            onFinish: () => loginForm.reset('password'),
        });
    };

    const onRegisterSubmit = (e) => {
        e.preventDefault();
        registerForm.post(route('register'), {
            onFinish: () => registerForm.reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Welcome to The Sanctuary" />
            
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 overflow-x-hidden">
                {/* Navigation */}
                <nav className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight drop-shadow-lg">The Sanctuary</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white border border-white/20 transition-all font-bold shadow-2xl"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <button 
                                    onClick={() => setAuthMode('login')}
                                    className={`px-5 py-2 rounded-xl transition-all font-semibold ${authMode === 'login' ? 'text-white bg-white/20' : 'text-white/70 hover:text-white'}`}
                                >
                                    Log in
                                </button>
                                <button 
                                    onClick={() => setAuthMode('register')}
                                    className={`px-5 py-2 rounded-xl transition-all font-semibold ${authMode === 'register' ? 'text-white bg-white/20' : 'text-white/70 hover:text-white'}`}
                                >
                                    Register
                                </button>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Hero Section with Integrated Auth */}
                <div className="relative w-full min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden bg-[#0a0f1a]">
                    {/* Background Visuals */}
                    <img 
                        src="/images/hero.png" 
                        alt="Church Background" 
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Side: Text Content */}
                        <div className="flex flex-col items-start text-left max-w-2xl animate-fade-up">
                            <span className="inline-block py-1.5 px-4 rounded-full bg-amber-500/20 backdrop-blur-md text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-8 border border-amber-500/30">
                                Welcome Home
                            </span>
                            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight mb-8 leading-[0.95] drop-shadow-2xl">
                                Experience Faith,<br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
                                    Build Community
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-xl font-medium leading-relaxed drop-shadow">
                                Join us in a journey of faith, love, and service. Whether you're visiting or looking for a church home, you belong here.
                            </p>
                            
                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0a0f1a] bg-gray-800 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-xl">
                                            <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                                        </div>
                                    ))}
                                    <div className="w-12 h-12 rounded-full border-2 border-[#0a0f1a] bg-amber-500 flex items-center justify-center text-xs font-black text-navy shadow-xl">
                                        +500
                                    </div>
                                </div>
                                <div className="text-gray-400 text-sm font-semibold">
                                    Join <span className="text-white">500+ members</span> in our<br/>growing community
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Auth Card */}
                        <div className="flex justify-center lg:justify-end animate-fade-up" style={{ animationDelay: '0.2s' }}>
                            {auth.user ? (
                                <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center">
                                    <div className="w-20 h-20 rounded-3xl bg-amber-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/20 rotate-3">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                    <h2 className="text-3xl font-black text-white mb-4">Welcome Back!</h2>
                                    <p className="text-gray-400 mb-10 font-medium">You are currently signed in as <span className="text-amber-400">{auth.user.name}</span></p>
                                    <Link
                                        href={route('dashboard')}
                                        className="w-full py-5 rounded-2xl bg-amber-500 text-white font-black text-xl hover:bg-amber-600 transition-all shadow-2xl shadow-amber-500/30 transform hover:-translate-y-1 block"
                                    >
                                        Open Dashboard
                                    </Link>
                                </div>
                            ) : (
                                <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                                    {/* Form Switcher Header */}
                                    <div className="flex border-b border-white/10">
                                        <button 
                                            onClick={() => setAuthMode('login')}
                                            className={`flex-1 py-6 text-sm font-bold tracking-widest uppercase transition-all ${authMode === 'login' ? 'text-amber-400 bg-white/5 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Sign In
                                        </button>
                                        <button 
                                            onClick={() => setAuthMode('register')}
                                            className={`flex-1 py-6 text-sm font-bold tracking-widest uppercase transition-all ${authMode === 'register' ? 'text-amber-400 bg-white/5 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Join Us
                                        </button>
                                    </div>

                                    <div className="p-10">
                                        {status && (
                                            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-bold flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                {status}
                                            </div>
                                        )}

                                        {authMode === 'login' ? (
                                            <form onSubmit={onLoginSubmit} className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-medium"
                                                        placeholder="Enter username"
                                                        value={loginForm.data.username}
                                                        onChange={e => loginForm.setData('username', e.target.value)}
                                                    />
                                                    <InputError message={loginForm.errors.username} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                                                    <input
                                                        type="password"
                                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-medium"
                                                        placeholder="••••••••"
                                                        value={loginForm.data.password}
                                                        onChange={e => loginForm.setData('password', e.target.value)}
                                                    />
                                                    <InputError message={loginForm.errors.password} />
                                                </div>

                                                <div className="flex items-center justify-between px-1">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                className="peer sr-only"
                                                                checked={loginForm.data.remember}
                                                                onChange={e => loginForm.setData('remember', e.target.checked)}
                                                            />
                                                            <div className="w-5 h-5 border-2 border-white/20 rounded-md peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all"></div>
                                                            <svg className="absolute inset-0 w-5 h-5 text-navy opacity-0 peer-checked:opacity-100 p-1 transition-all" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                                                    </label>
                                                    <Link href={route('password.request')} className="text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors">Forgot?</Link>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={loginForm.processing}
                                                    className="w-full py-5 rounded-2xl bg-amber-500 text-white font-black text-lg hover:bg-amber-600 transition-all shadow-2xl shadow-amber-500/20 transform active:scale-[0.98] disabled:opacity-50"
                                                >
                                                    {loginForm.processing ? 'Signing in...' : 'Sign In'}
                                                </button>
                                            </form>
                                        ) : (
                                            <form onSubmit={onRegisterSubmit} className="space-y-5">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-amber-500 transition-all outline-none font-medium"
                                                        placeholder="John Doe"
                                                        value={registerForm.data.name}
                                                        onChange={e => registerForm.setData('name', e.target.value)}
                                                    />
                                                    <InputError message={registerForm.errors.name} />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
                                                    <input
                                                        type="email"
                                                        className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-amber-500 transition-all outline-none font-medium"
                                                        placeholder="you@example.com"
                                                        value={registerForm.data.email}
                                                        onChange={e => registerForm.setData('email', e.target.value)}
                                                    />
                                                    <InputError message={registerForm.errors.email} />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                                                        <input
                                                            type="password"
                                                            className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-amber-500 transition-all outline-none font-medium"
                                                            placeholder="••••••••"
                                                            value={registerForm.data.password}
                                                            onChange={e => registerForm.setData('password', e.target.value)}
                                                        />
                                                        <InputError message={registerForm.errors.password} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm</label>
                                                        <input
                                                            type="password"
                                                            className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-amber-500 transition-all outline-none font-medium"
                                                            placeholder="••••••••"
                                                            value={registerForm.data.password_confirmation}
                                                            onChange={e => registerForm.setData('password_confirmation', e.target.value)}
                                                        />
                                                        <InputError message={registerForm.errors.password_confirmation} />
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={registerForm.processing}
                                                    className="w-full py-5 mt-4 rounded-2xl bg-white text-navy font-black text-lg hover:bg-gray-100 transition-all shadow-2xl transform active:scale-[0.98] disabled:opacity-50"
                                                >
                                                    {registerForm.processing ? 'Creating account...' : 'Create Account'}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-[#0a0f1a] relative">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="py-32 px-6 max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-20">
                            <span className="text-amber-500 text-xs font-black tracking-[0.3em] uppercase mb-4 block">Our Core Pillars</span>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Built for Our Community</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-medium">
                                We've designed our system to facilitate growth, connection, and service in every aspect of our church life.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10">
                            {/* Feature 1 */}
                            <div className="group relative">
                                <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/20 to-transparent rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 transform transition-all hover:-translate-y-3 hover:bg-white/[0.05]">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-white">Connect & Grow</h3>
                                    <p className="text-gray-400 leading-relaxed text-lg font-medium mb-6">
                                        Join small groups, ministries, and events tailored for all ages to grow deeper in faith together.
                                    </p>
                                    <div className="h-1 w-12 bg-blue-500/30 rounded-full group-hover:w-full transition-all duration-500"></div>
                                </div>
                            </div>
                            
                            {/* Feature 2 */}
                            <div className="group relative">
                                <div className="absolute -inset-1 bg-gradient-to-b from-amber-500/20 to-transparent rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 transform transition-all hover:-translate-y-3 hover:bg-white/[0.05]">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-8 border border-amber-500/20 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-white">Learn the Word</h3>
                                    <p className="text-gray-400 leading-relaxed text-lg font-medium mb-6">
                                        Access sermons, teachings, and resources that help you understand and apply Biblical truths.
                                    </p>
                                    <div className="h-1 w-12 bg-amber-500/30 rounded-full group-hover:w-full transition-all duration-500"></div>
                                </div>
                            </div>
                            
                            {/* Feature 3 */}
                            <div className="group relative">
                                <div className="absolute -inset-1 bg-gradient-to-b from-purple-500/20 to-transparent rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 transform transition-all hover:-translate-y-3 hover:bg-white/[0.05]">
                                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-white">Serve Others</h3>
                                    <p className="text-gray-400 leading-relaxed text-lg font-medium mb-6">
                                        Discover opportunities to serve our community, support ministries, and make a real difference.
                                    </p>
                                    <div className="h-1 w-12 bg-purple-500/30 rounded-full group-hover:w-full transition-all duration-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-[#070b14] py-12 border-t border-white/5 text-center">
                    <p className="text-gray-600 text-xs font-bold tracking-widest uppercase">
                        &copy; {new Date().getFullYear()} The Sanctuary. All rights reserved.
                    </p>
                </footer>
            </div>
            
            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </>
    );
}
