export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#0d1b2e]">
            {/* Left side - Landing / Hero */}
            <div className="hidden md:flex md:w-1/2 relative flex-col justify-between overflow-hidden">
                <img 
                    src="/images/hero.png" 
                    alt="Church Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b2e]/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d1b2e]/90"></div>

                {/* Content over image */}
                <div className="relative z-10 p-12 lg:p-20 flex flex-col h-full justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4a017] to-[#b8860b] flex items-center justify-center shadow-lg">
                            <span className="text-2xl text-[#0d1b2e]">✦</span>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-wide font-['Plus_Jakarta_Sans']">The Sanctuary</span>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6 font-['Plus_Jakarta_Sans'] drop-shadow-md">
                            Experience Faith,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0c040] to-[#d4a017]">
                                Build Community.
                            </span>
                        </h1>
                        <p className="text-lg text-[#8ba4c8] max-w-md font-light leading-relaxed">
                            Join us in a journey of faith, love, and service. Whether you're visiting or looking for a church home, you belong here.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Auth Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 relative overflow-hidden guest-shell" style={{ background: 'none' }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23243d63\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50 pointer-events-none"></div>
                <div className="login-card w-full max-w-md mx-auto relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
