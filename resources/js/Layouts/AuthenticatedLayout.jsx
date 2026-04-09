import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    HomeIcon, UserGroupIcon, BuildingOfficeIcon, GlobeAltIcon,
    CalendarIcon, CurrencyDollarIcon, PresentationChartLineIcon
} from '@heroicons/react/24/outline';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    
    // Determine which menu items to show based on role
    const getMenu = () => {
        const menu = [
            { name: 'Dashboard', routeName: 'dashboard', icon: HomeIcon, show: true },
            { name: 'Administrators', routeName: 'users.index', icon: UserGroupIcon, show: ['national_admin', 'conference_admin', 'district_admin'].includes(user.role) },
            { name: 'Conferences', routeName: 'conferences.index', icon: GlobeAltIcon, show: ['national_admin'].includes(user.role) },
            { name: 'Districts', routeName: 'districts.index', icon: BuildingOfficeIcon, show: ['national_admin', 'conference_admin'].includes(user.role) },
            { name: 'Societies', routeName: 'societies.index', icon: BuildingOfficeIcon, show: ['national_admin', 'conference_admin', 'district_admin'].includes(user.role) },
            { name: 'Members', routeName: 'members.index', icon: UserGroupIcon, show: true },
            { name: 'Ministries', routeName: 'ministries.index', icon: UserGroupIcon, show: true },
            { name: 'Events & Attendance', routeName: 'events.index', icon: CalendarIcon, show: true },
            { name: 'Donations', routeName: 'donations.index', icon: CurrencyDollarIcon, show: true },
        ];
        return menu.filter(item => item.show);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1e3a5f] text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 font-bold text-lg tracking-wider border-b border-[#2a4d7a]">
                    <span className="text-[#c9a227] mr-2">✦</span> Church System
                </div>
                
                <div className="p-4 flex flex-col space-y-1 flex-1 overflow-y-auto">
                    {getMenu().map((item) => (
                        <Link
                            key={item.name}
                            href={route(item.routeName)}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                                route().current(item.routeName.split('.')[0] + '.*') || route().current(item.routeName)
                                ? 'bg-[#2a4d7a] text-white' 
                                : 'text-slate-300 hover:bg-[#2a4d7a] hover:text-white'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </div>


                <div className="p-4 border-t border-[#2a4d7a] text-sm">
                    <div className="truncate text-slate-300">{user.name}</div>
                    <div className="text-xs text-[#c9a227] uppercase tracking-wider font-semibold mt-1">
                        {user.role.replace('_', ' ')}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
                    <h2 className="font-semibold text-xl text-slate-800 leading-tight">
                        {header}
                    </h2>
                    <div>
                        <Link href={route('logout')} method="post" as="button" className="text-sm text-red-600 font-medium hover:underline">
                            Log out
                        </Link>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
