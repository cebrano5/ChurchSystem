import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    UserGroupIcon, CurrencyDollarIcon, CalendarIcon,
    ChartBarIcon, MapPinIcon, UserIcon,
    ArrowLeftIcon, PencilSquareIcon, BuildingOfficeIcon,
    ClockIcon, GlobeAltIcon,
} from '@heroicons/react/24/outline';

function StatCard({ icon: Icon, label, value, color, glow }) {
    return (
        <div style={{
            background: 'rgba(28, 50, 84, 0.5)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            transition: 'all 0.25s ease',
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + '50'; e.currentTarget.style.boxShadow = `0 16px 40px ${glow}`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: color + '18', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: '1.3rem', color }} />
            </div>
            <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{label}</div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
            </div>
        </div>
    );
}

function formatCurrency(val) {
    const n = Number(val ?? 0);
    if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `₱${(n / 1_000).toFixed(1)}K`;
    return `₱${n.toLocaleString()}`;
}

export default function DistrictShow({ district, admin, societyCount, memberCount, totalDonations, upcomingEvents, societies, recentMembers }) {
    const conference = district.annual_conference;

    return (
        <AuthenticatedLayout header={district.name}>
            <Head title={district.name} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Back + Edit */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href={route('districts.index')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        <ArrowLeftIcon style={{ width: '1rem' }} /> Back to Districts
                    </Link>
                    <Link href={route('districts.edit', district.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.25rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700, background: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.3)', color: 'var(--gold)', textDecoration: 'none', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,160,23,0.22)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,160,23,0.12)'}>
                        <PencilSquareIcon style={{ width: '0.9rem' }} /> Edit District
                    </Link>
                </div>

                {/* Hero */}
                <div style={{ borderRadius: '28px', padding: '2.5rem', background: 'linear-gradient(135deg, #0f1e35 0%, #1a3254 100%)', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: '40%', height: '130%', background: 'radial-gradient(circle, rgba(45,212,191,0.1) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', flexShrink: 0, background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', boxShadow: '0 12px 30px rgba(45,212,191,0.3)' }}>🏢</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#2dd4bf', background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.25)', padding: '0.2rem 0.75rem', borderRadius: '8px' }}>District</span>
                                {conference && <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{conference.name}</span>}
                            </div>
                            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{district.name}</h1>
                            {district.location_name && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                    <MapPinIcon style={{ width: '0.9rem' }} /> {district.location_name}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
                    <StatCard icon={BuildingOfficeIcon} label="Local Societies" value={societyCount}              color="#38bdf8" glow="rgba(56,189,248,0.25)" />
                    <StatCard icon={UserGroupIcon}      label="Total Members"  value={memberCount}               color="#a78bfa" glow="rgba(167,139,250,0.25)" />
                    <StatCard icon={CalendarIcon}       label="Upcoming Events" value={upcomingEvents.length}    color="#f472b6" glow="rgba(244,114,182,0.25)" />
                    <StatCard icon={CurrencyDollarIcon} label="Total Donations" value={formatCurrency(totalDonations)} color="#ffeb3b" glow="rgba(255,235,59,0.2)" />
                </div>

                {/* Main Body */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>

                    {/* Left: Societies + Events */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Local Societies */}
                        <div style={{ background: 'rgba(28, 50, 84, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '1.75rem' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.25rem' }}>
                                <BuildingOfficeIcon style={{ width: '1.1rem', color: 'var(--gold)' }} /> Local Societies
                            </h3>
                            {societies.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>No societies yet.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {societies.map(s => (
                                        <Link key={s.id} href={route('societies.show', s.id)} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '0.9rem 1rem', borderRadius: '14px',
                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)',
                                            textDecoration: 'none', transition: 'all 0.2s',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.2)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <BuildingOfficeIcon style={{ width: '0.9rem', color: '#38bdf8' }} />
                                                </div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{s.name}</span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                                                {s.members_count} members
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Upcoming Events */}
                        <div style={{ background: 'rgba(28, 50, 84, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '1.75rem' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.25rem' }}>
                                <CalendarIcon style={{ width: '1.1rem', color: 'var(--gold)' }} /> Upcoming Events
                            </h3>
                            {upcomingEvents.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>No upcoming events scheduled.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {upcomingEvents.map(ev => (
                                        <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'rgba(244,114,182,0.12)', border: '1px solid rgba(244,114,182,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#f472b6', textTransform: 'uppercase' }}>{new Date(ev.event_date).toLocaleDateString('en-US', { month: 'short' })}</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{new Date(ev.event_date).getDate()}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{ev.name}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <ClockIcon style={{ width: '0.7rem' }} />
                                                    {new Date(ev.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Info + Admin + Recent Members */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* District Info */}
                        <div style={{ background: 'rgba(28, 50, 84, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '1.75rem' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ChartBarIcon style={{ width: '1.1rem', color: 'var(--gold)' }} /> District Info
                            </h3>
                            {conference && (
                                <div style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>Annual Conference</div>
                                    <div style={{ fontSize: '0.88rem', color: '#fff', marginTop: '0.15rem', fontWeight: 500 }}>{conference.name}</div>
                                </div>
                            )}
                            {district.description && (
                                <div style={{ padding: '0.75rem 0' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>Description</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.6 }}>{district.description}</div>
                                </div>
                            )}
                        </div>

                        {/* Administrator */}
                        <div style={{ background: 'rgba(28, 50, 84, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '1.75rem' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <UserIcon style={{ width: '1.1rem', color: 'var(--gold)' }} /> Administrator
                            </h3>
                            {admin ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#000', flexShrink: 0 }}>
                                        {admin.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{admin.name}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>@{admin.username}</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>No administrator assigned.</div>
                            )}
                        </div>

                        {/* Recent Members */}
                        <div style={{ background: 'rgba(28, 50, 84, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '1.75rem' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <UserGroupIcon style={{ width: '1.1rem', color: 'var(--gold)' }} /> Recent Members
                            </h3>
                            {recentMembers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No members yet.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {recentMembers.map(m => (
                                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(167,139,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <UserIcon style={{ width: '0.9rem', color: '#a78bfa' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{m.first_name} {m.last_name}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Joined {new Date(m.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
