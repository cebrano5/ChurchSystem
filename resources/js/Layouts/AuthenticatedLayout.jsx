import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    HomeIcon, UserGroupIcon, BuildingOfficeIcon, GlobeAltIcon,
    CalendarIcon, CurrencyDollarIcon, ArrowRightOnRectangleIcon,
    MapPinIcon, ChartBarIcon, Bars3Icon, XMarkIcon, MapIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/Components/Toast';

/* ─── Nav item colour accents by route ──────────────────────── */
const ITEM_COLORS = {
    dashboard:          '#d4a017',
    'conferences.index': '#f59e0b',
    'districts.index':   '#34d399',
    'societies.index':   '#38bdf8',
    'users.index':       '#a78bfa',
    'members.index':     '#c084fc',
    'ministries.index':  '#4ade80',
    'events.index':      '#f472b6',
    'donations.index':   '#fbbf24',
    'map.index':         '#ef4444',
};

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [toast, setToast] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Watch for flash messages
    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    const getMenu = () => {
        const sections = [
            {
                label: 'Overview',
                items: [
                    { name: 'Dashboard', routeName: 'dashboard', icon: HomeIcon, show: true },
                ],
            },
            {
                label: 'Organization',
                items: [
                    { name: 'Conferences',    routeName: 'conferences.index',  icon: GlobeAltIcon,       show: ['national_admin'].includes(user.role) },
                    { name: 'Districts',      routeName: 'districts.index',    icon: MapPinIcon,          show: ['national_admin', 'conference_admin'].includes(user.role) },
                    { name: 'Societies',      routeName: 'societies.index',    icon: BuildingOfficeIcon,  show: ['national_admin', 'conference_admin', 'district_admin'].includes(user.role) },
                    { name: 'Church Map',     routeName: 'map.index',          icon: MapIcon,             show: ['national_admin', 'conference_admin', 'district_admin'].includes(user.role) },

                ],
            },
            {
                label: 'Ministry',
                items: [
                    { name: 'Members',             routeName: 'members.index',    icon: UserGroupIcon,      show: true },
                    { name: 'Ministries',           routeName: 'ministries.index', icon: ChartBarIcon,       show: true },
                    { name: 'Events & Attendance',  routeName: 'events.index',     icon: CalendarIcon,       show: true },
                    { name: 'Donations',            routeName: 'donations.index',  icon: CurrencyDollarIcon, show: true },
                ],
            },
        ];

        return sections
            .map(s => ({ ...s, items: s.items.filter(i => i.show) }))
            .filter(s => s.items.length > 0);
    };

    const initials = user.name
        ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    const roleLabel = user.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    /* ─── Sidebar content (shared between desktop + mobile) ─── */
    const SidebarContent = () => (
        <>
            {/* Brand */}
            <div className="sidebar-brand" style={{ padding: '1.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ 
                    width: '42px', height: '42px', borderRadius: '12px', 
                    background: 'linear-gradient(135deg, var(--gold) 0%, #b8860b 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', boxShadow: '0 8px 20px rgba(212,160,23,0.3)',
                    flexShrink: 0
                }}>⛪</div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ 
                        fontFamily: "'Plus Jakarta Sans', sans-serif", 
                        fontWeight: 800, fontSize: '0.95rem', 
                        color: '#fff', letterSpacing: '-0.02em',
                        lineHeight: 1.1
                    }}>The Sanctuary</div>
                    <div style={{ 
                        fontSize: '0.65rem', color: 'var(--gold)', 
                        fontWeight: 700, textTransform: 'uppercase', 
                        letterSpacing: '0.1em', marginTop: '0.15rem' 
                    }}>Admin Portal</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {getMenu().map((section) => (
                    <div key={section.label} style={{ marginBottom: '0.25rem' }}>
                        <div className="sidebar-section-label">{section.label}</div>
                        {section.items.map((item) => {
                            const isActive =
                                route().current(item.routeName.split('.')[0] + '.*') ||
                                route().current(item.routeName);
                            const accent = ITEM_COLORS[item.routeName] ?? '#d4a017';
                            return (
                                <Link
                                    key={item.name}
                                    href={route(item.routeName)}
                                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                                    style={isActive ? {
                                        background: `${accent}12`,
                                        color: accent,
                                        border: `1px solid ${accent}25`,
                                        boxShadow: `0 4px 15px ${accent}08`,
                                    } : {}}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {/* Active left-bar indicator */}
                                    {isActive && (
                                        <span style={{
                                            position: 'absolute',
                                            left: '-0.75rem', top: '15%', bottom: '15%',
                                            width: '4px',
                                            borderRadius: '0 4px 4px 0',
                                            background: accent,
                                            boxShadow: `0 0 12px ${accent}`,
                                            zIndex: 2
                                        }} />
                                    )}
                                    <item.icon
                                        className="sidebar-link-icon"
                                        style={isActive ? { 
                                            color: accent,
                                            filter: `drop-shadow(0 0 5px ${accent}80)`
                                        } : {}}
                                    />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* User footer */}
            <div className="sidebar-user">
                <div className="sidebar-avatar">{initials}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="sidebar-user-name">{user.name}</div>
                    <div className="sidebar-user-role">{roleLabel}</div>
                </div>
                {/* Mini logout icon */}
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-secondary)', padding: '4px',
                        borderRadius: '6px', transition: 'color 0.15s',
                        flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    title="Sign Out"
                >
                    <ArrowRightOnRectangleIcon style={{ width: '1rem', height: '1rem' }} />
                </Link>
            </div>
        </>
    );

    return (
        <div className="app-shell">
            {/* ── Desktop Sidebar ─────────────────────────────── */}
            <aside className="sidebar hidden md:flex flex-col">
                <SidebarContent />
            </aside>

            {/* ── Mobile Sidebar Overlay ───────────────────────── */}
            {mobileOpen && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 50,
                        display: 'flex',
                    }}
                >
                    {/* Backdrop */}
                    <div
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Drawer */}
                    <aside style={{
                        position: 'relative', zIndex: 1,
                        width: '260px', background: 'linear-gradient(180deg, #0d1b2e 0%, #0f2240 100%)',
                        borderRight: '1px solid var(--navy-border)',
                        display: 'flex', flexDirection: 'column',
                        height: '100vh', overflowY: 'auto',
                    }}>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* ── Main Content ─────────────────────────────────── */}
            <main className="main-content">
                {/* Topbar */}
                <header className="topbar">
                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileOpen(o => !o)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-secondary)', padding: '4px', marginRight: '0.75rem',
                        }}
                    >
                        <Bars3Icon style={{ width: '1.3rem', height: '1.3rem' }} />
                    </button>

                    {/* Page title */}
                    <h1 className="topbar-title" style={{ flex: 1 }}>{header}</h1>

                    {/* Topbar right actions */}
                    <div className="topbar-actions">
                        {/* Role pill */}
                        <span style={{
                            fontSize: '0.68rem', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            color: 'var(--gold)', background: 'rgba(212,160,23,0.1)',
                            border: '1px solid rgba(212,160,23,0.25)',
                            borderRadius: '999px', padding: '0.2rem 0.7rem',
                            display: 'none',  // hidden on xs, shown on sm+
                        }} className="hidden sm:inline-flex">
                            {roleLabel}
                        </span>


                    </div>
                </header>

                <div className="page-body animate-fade-up">
                    {children}
                </div>
            </main>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
