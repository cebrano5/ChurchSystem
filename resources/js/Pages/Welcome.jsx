import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';

export default function Welcome({ auth, status }) {
    // Login Form
    const loginForm = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const onLoginSubmit = (e) => {
        e.preventDefault();
        loginForm.post(route('login'), {
            onFinish: () => loginForm.reset('password'),
        });
    };

    return (
        <>
            <Head title="Admin Portal | The Sanctuary" />
            
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
                                <div className="px-5 py-2 rounded-xl transition-all font-semibold text-white bg-white/20">
                                    Admin Access Only
                                </div>
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
                        className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/60 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Side: Text Content */}
                        <div className="flex flex-col items-start text-left max-w-2xl animate-fade-up">
                            <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-400 text-xs font-bold tracking-[0.2em] uppercase mb-8 border border-blue-500/30">
                                Enterprise Management
                            </span>
                            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight mb-8 leading-[0.95] drop-shadow-2xl">
                                Centralized<br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
                                    Church Systems
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-xl font-medium leading-relaxed drop-shadow">
                                The unified administrative platform for leadership, organizational oversight, and ministry coordination across all hierarchies.
                            </p>
                            
                            <div className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                                </div>
                                <div className="text-gray-300 text-sm font-semibold tracking-wide">
                                    System Status: <span className="text-green-400">Secure & Operational</span>
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
                                    <h2 className="text-3xl font-black text-white mb-4">Portal Active</h2>
                                    <p className="text-gray-400 mb-10 font-medium">Session authenticated for <span className="text-amber-400">{auth.user.name}</span></p>
                                    <Link
                                        href={route('dashboard')}
                                        className="w-full py-5 rounded-2xl bg-amber-500 text-white font-black text-xl hover:bg-amber-600 transition-all shadow-2xl shadow-amber-500/30 transform hover:-translate-y-1 block"
                                    >
                                        Go to Command Center
                                    </Link>
                                </div>
                            ) : (
                                <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                                    <div className="flex border-b border-white/10">
                                        <div className="flex-1 py-6 text-sm font-bold tracking-widest uppercase text-amber-400 bg-white/5 border-b-2 border-amber-500 text-center">
                                            Admin Sign In
                                        </div>
                                    </div>

                                    <div className="p-10">
                                        {status && (
                                            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-bold flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                {status}
                                            </div>
                                        )}

                                        <form onSubmit={onLoginSubmit} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-medium"
                                                    placeholder="Enter administrator ID"
                                                    value={loginForm.data.username}
                                                    onChange={e => loginForm.setData('username', e.target.value)}
                                                    required
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
                                                    required
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
                                                    <span className="text-sm font-bold text-gray-400 group-hover:text-gray-300 transition-colors">Maintain session</span>
                                                </label>
                                                <Link href={route('password.request')} className="text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors">Recovery</Link>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loginForm.processing}
                                                className="w-full py-5 rounded-2xl bg-amber-500 text-white font-black text-lg hover:bg-amber-600 transition-all shadow-2xl shadow-amber-500/20 transform active:scale-[0.98] disabled:opacity-50"
                                            >
                                                {loginForm.processing ? 'Authenticating...' : 'Sign In to Portal'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features Section - Administrative Focus */}
                <div className="bg-[#0a0f1a] relative">
                    <div className="py-32 px-6 max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-20">
                            <span className="text-amber-500 text-xs font-black tracking-[0.3em] uppercase mb-4 block">System Capabilities</span>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Built for Oversight</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-medium">
                                A comprehensive ecosystem designed for the modern church administration.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10">
                            {/* Feature 1 */}
                            <div className="group relative">
                                <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 transform transition-all hover:-translate-y-3">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20">
                                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-white">Hierarchical Control</h3>
                                    <p className="text-gray-400 leading-relaxed text-lg font-medium mb-6">
                                        Manage national, conference, and district structures with granular role-based access control.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Feature 2 */}
                            <div className="group relative">
                                <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 transform transition-all hover:-translate-y-3">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-8 border border-amber-500/20">
                                        <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-white">Advanced Analytics</h3>
                                    <p className="text-gray-400 leading-relaxed text-lg font-medium mb-6">
                                        Real-time insights into membership growth, financial health, and ministry engagement.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Feature 3 */}
                            <div className="group relative">
                                <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 transform transition-all hover:-translate-y-3">
                                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 border border-purple-500/20">
                                        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-white">Secure Governance</h3>
                                    <p className="text-gray-400 leading-relaxed text-lg font-medium mb-6">
                                        Audit-ready record keeping and encrypted data protection for all church operations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-[#070b14] py-12 border-t border-white/5 text-center">
                    <p className="text-gray-600 text-xs font-bold tracking-widest uppercase">
                        &copy; {new Date().getFullYear()} The Sanctuary | Administrative Division. All rights reserved.
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
