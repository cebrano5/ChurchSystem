import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    UserGroupIcon, BuildingOfficeIcon, GlobeAltIcon,
    CurrencyDollarIcon, CalendarIcon, ChartBarIcon,
    ArrowTrendingUpIcon, MapPinIcon,
    ArrowRightIcon, ClockIcon, UserPlusIcon,
    SparklesIcon, CheckBadgeIcon
} from '@heroicons/react/24/outline';

/* ─── Stat card visual config ────────────────────────────────── */
const CARD_CONFIG = {
    members:          { icon: UserGroupIcon,      color: '#a78bfa', glow: 'rgba(167,139,250,0.4)',  label: 'Members' },
    total_members:    { icon: UserGroupIcon,      color: '#a78bfa', glow: 'rgba(167,139,250,0.4)',  label: 'Total Members' },
    societies:        { icon: BuildingOfficeIcon, color: '#38bdf8', glow: 'rgba(56,189,248,0.4)',  label: 'Societies' },
    districts:        { icon: MapPinIcon,         color: '#2dd4bf', glow: 'rgba(45,212,191,0.4)',  label: 'Districts' },
    conferences:      { icon: GlobeAltIcon,       color: '#fb923c', glow: 'rgba(251,146,60,0.4)',  label: 'Conferences' },
    events:           { icon: CalendarIcon,       color: '#f472b6', glow: 'rgba(244,114,182,0.4)', label: 'Events' },
    total_events:     { icon: CalendarIcon,       color: '#f472b6', glow: 'rgba(244,114,182,0.4)', label: 'Total Events' },
    donations:        { icon: CurrencyDollarIcon, color: '#ffeb3b', glow: 'rgba(255,235,59,0.4)',  label: 'Donations' },
    total_donations:  { icon: CurrencyDollarIcon, color: '#ffeb3b', glow: 'rgba(255,235,59,0.4)',  label: 'Total Donations' },
    ministries:       { icon: ChartBarIcon,       color: '#4ade80', glow: 'rgba(74,222,128,0.4)',  label: 'Ministries' },
};

const DEFAULT_CONFIG = { icon: ChartBarIcon, color: '#94a3b8', glow: 'rgba(148,163,184,0.3)', label: null };

/* ─── Format values ──────────────────────────────────────────── */
function formatValue(key, value) {
    if (key.includes('donations')) {
        const num = Number(value);
        if (num >= 1_000_000) return `₱${(num / 1_000_000).toFixed(1)}M`;
        if (num >= 1_000)     return `₱${(num / 1_000).toFixed(1)}K`;
        return `₱${num.toLocaleString()}`;
    }
    const n = Number(value);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

function humanize(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ─── Individual stat card ───────────────────────────────────── */
function StatCard({ statKey, value, index }) {
    const cfg = CARD_CONFIG[statKey] ?? DEFAULT_CONFIG;
    const Icon = cfg.icon;
    const label = cfg.label ?? humanize(statKey);

    return (
        <div
            className="animate-fade-up"
            style={{
                animationDelay: `${index * 80}ms`,
                background: 'rgba(28, 50, 84, 0.4)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: '1.75rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = cfg.color + '60';
                e.currentTarget.style.boxShadow = `0 20px 40px ${cfg.glow}`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{
                position: 'absolute', top: 0, right: 0, width: '120px', height: '120px',
                background: `radial-gradient(circle at center, ${cfg.color}15 0%, transparent 70%)`,
                filter: 'blur(20px)', pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Icon style={{ width: '1.4rem', height: '1.4rem', color: cfg.color }} />
                </div>
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {label}
            </div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2.2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {formatValue(statKey, value)}
            </div>
        </div>
    );
}

/* ─── Role badge colours ─────────────────────────────────────── */
const ROLE_BADGE = {
    national_admin:   { text: 'National Command',   color: '#ffeb3b', bg: 'rgba(255,235,59,0.15)',  border: '#ffeb3b50'  },
    conference_admin: { text: 'Conference HQ',     color: '#38bdf8', bg: 'rgba(56,189,248,0.15)', border: '#38bdf850' },
    district_admin:   { text: 'District Oversight', color: '#4ade80', bg: 'rgba(74,222,128,0.15)', border: '#4ade8050' },
    society_admin:    { text: 'Local Registry',    color: '#c084fc', bg: 'rgba(192,132,252,0.15)', border: '#c084fc50' },
};

/* ─── Main component ─────────────────────────────────────────── */
export default function Dashboard({ stats = {}, role = 'society_admin', scopeName, upcomingEvents = [], recentMembers = [], upcomingEventsList = [] }) {
    const entries = Object.entries(stats);
    const badge = ROLE_BADGE[role] ?? ROLE_BADGE.society_admin;
    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    })();

    const displayEvents = upcomingEvents.length > 0 ? upcomingEvents : (upcomingEventsList || []);

    return (
        <AuthenticatedLayout header={scopeName ? `Command Center — ${scopeName}` : 'Command Center'}>
            <Head title="Command Center" />

            {/* ── Dashboard Shell ────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                
                {/* ── Cinematic Hero Section ──────────────────────── */}
                <div style={{
                    position: 'relative', borderRadius: '32px', overflow: 'hidden',
                    background: 'linear-gradient(135deg, #0f1e35 0%, #1a3254 100%)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    padding: '3rem', minHeight: '260px',
                    display: 'flex', alignItems: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
                }}>
                    {/* Background Mesh Gradients */}
                    <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '80%', background: 'radial-gradient(circle, rgba(255,235,59,0.12) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-20%', right: '10%', width: '30%', height: '70%', background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '2.5rem', width: '100%' }}>
                        {/* Interactive Avatar/Icon */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{ 
                                width: '100px', height: '100px', borderRadius: '30px',
                                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2.8rem', boxShadow: '0 12px 40px rgba(255,235,59,0.35)',
                                animation: 'float 6s ease-in-out infinite'
                            }}>
                                🛡️
                            </div>
                            <div style={{ 
                                position: 'absolute', bottom: '-5px', right: '-5px',
                                width: '32px', height: '32px', borderRadius: '10px',
                                background: '#4ade80', border: '4px solid #1a3254',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <CheckBadgeIcon style={{ width: '1rem', color: '#000' }} />
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: badge.color, background: badge.bg, border: `1px solid ${badge.border}`, padding: '0.3rem 1rem', borderRadius: '12px' }}>
                                    {badge.text}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontSize: '0.75rem', fontWeight: 600 }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
                                    System Active
                                </div>
                            </div>
                            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2.8rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                {greeting}, <span style={{ color: 'var(--gold)' }}>Admin</span>
                            </h1>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '0.75rem', maxWidth: '600px', lineHeight: 1.6 }}>
                                You are currently overseeing <strong style={{ color: '#fff' }}>{scopeName || 'National Operations'}</strong>. 
                                Everything is operational. What's our focus today?
                            </p>
                        </div>

                        {/* Date Metric */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px', textAlign: 'center', minWidth: '140px' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: '1' }}>
                                {new Date().getDate()}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main Dashboard Layout ────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem' }}>
                    
                    {/* Left Column: Stats & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        
                        {/* Stats Section */}
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <ArrowTrendingUpIcon style={{ width: '1.2rem', color: 'var(--gold)' }} />
                                    Growth Overview
                                </h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                                {entries.map(([key, value], i) => (
                                    <StatCard key={key} statKey={key} value={value} index={i} />
                                ))}
                            </div>
                        </section>

                        {/* Quick Actions Grid */}
                        <section>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <SparklesIcon style={{ width: '1.2rem', color: 'var(--gold)' }} />
                                Operational Shortcuts
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {[
                                    { label: 'Member Registry', route: 'members.index', icon: UserGroupIcon, color: '#a78bfa', desc: 'Add or manage church members' },
                                    { label: 'Event Scheduler', route: 'events.index', icon: CalendarIcon, color: '#f472b6', desc: 'Manage services & gatherings' },
                                    { label: 'Financial Ledger', route: 'donations.index', icon: CurrencyDollarIcon, color: '#ffeb3b', desc: 'Track donations & offerings' },
                                    { label: 'Ministry Hub', route: 'ministries.index', icon: ChartBarIcon, color: '#4ade80', desc: 'Oversee department activities' },
                                ].map((item, i) => (
                                    <Link key={item.label} href={route(item.route)} style={{
                                        display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem',
                                        background: 'rgba(28, 50, 84, 0.4)', border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '24px', textDecoration: 'none', transition: 'all 0.25s ease'
                                    }} onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                        e.currentTarget.style.background = 'rgba(28, 50, 84, 0.7)';
                                        e.currentTarget.style.borderColor = item.color + '40';
                                    }} onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.background = 'rgba(28, 50, 84, 0.4)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                    }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: item.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <item.icon style={{ width: '1.5rem', color: item.color }} />
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{item.label}</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.1rem' }}>{item.desc}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Activity & Insights */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        
                        {/* Activity Feed */}
                        <section style={{ 
                            background: 'rgba(28, 50, 84, 0.4)', borderRadius: '28px', 
                            border: '1px solid rgba(255,255,255,0.05)', padding: '1.75rem',
                            display: 'flex', flexDirection: 'column', gap: '1.5rem'
                        }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <ClockIcon style={{ width: '1.1rem', color: 'var(--gold)' }} />
                                Recent Activity
                            </h3>

                            {recentMembers.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {recentMembers.map((member) => (
                                        <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <UserPlusIcon style={{ width: '1.1rem', color: 'var(--text-secondary)' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{member.first_name} {member.last_name}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Joined {new Date(member.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No recent activity.</div>
                            )}

                            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)' }} />

                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <CalendarIcon style={{ width: '1.1rem', color: 'var(--gold)' }} />
                                Next Up
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {displayEvents.map((ev) => (
                                    <div key={ev.id} style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-light)' }}>{ev.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            {new Date(ev.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(ev.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                                {displayEvents.length === 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No upcoming events.</div>}
                            </div>
                        </section>


                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
