import React, { useState, useEffect, useRef } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function CustomDatePicker({ value, onChange, placeholder = 'Select date', openUp = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
    const containerRef = useRef(null);

    // Sync with external value
    useEffect(() => {
        if (value) {
            const d = new Date(value);
            setSelectedDate(d);
            setViewDate(d);
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const startDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handleDateClick = (day) => {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setSelectedDate(d);
        setIsOpen(false);
        // Format as YYYY-MM-DD for consistency
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - (offset * 60 * 1000));
        onChange(localDate.toISOString().split('T')[0]);
    };

    const changeMonth = (offset) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = startDayOfMonth(year, month);
        const days = [];

        // Empty slots
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ width: '40px', height: '40px' }} />);
        }

        // Day slots
        for (let d = 1; d <= totalDays; d++) {
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
            const isSelected = selectedDate && selectedDate.toDateString() === new Date(year, month, d).toDateString();

            days.push(
                <div 
                    key={d} 
                    onClick={() => handleDateClick(d)}
                    style={{ 
                        width: '32px', 
                        height: '32px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#000' : isToday ? 'var(--gold)' : 'var(--text-primary)',
                        background: isSelected ? 'var(--gold)' : isToday ? 'rgba(212,160,23,0.1)' : 'transparent',
                        border: isToday ? '1px solid var(--gold)' : '1px solid transparent',
                        transition: 'all 0.2s ease',
                        margin: '2px'
                    }}
                    onMouseEnter={(e) => {
                        if (!isSelected) e.target.style.background = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                        if (!isSelected) e.target.style.background = isToday ? 'rgba(212,160,23,0.1)' : 'transparent';
                    }}
                >
                    {d}
                </div>
            );
        }

        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="form-input"
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    cursor: 'pointer',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.7rem 1rem'
                }}
            >
                <CalendarIcon style={{ width: '1.1rem', height: '1.1rem', color: 'var(--gold)' }} />
                <span style={{ color: selectedDate ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : placeholder}
                </span>
            </div>

            {isOpen && (
                <div style={{ 
                    position: 'absolute', 
                    bottom: openUp ? 'calc(100% + 8px)' : 'auto',
                    top: openUp ? 'auto' : 'calc(100% + 8px)', 
                    left: 0, 
                    zIndex: 4000,
                    background: '#0d1b2e',
                    border: '1.5px solid var(--gold)',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    boxShadow: openUp ? '0 -25px 60px rgba(0,0,0,0.8)' : '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,160,23,0.1)',
                    width: '320px',
                    animation: openUp ? 'calendarAppearUp 0.3s ease' : 'calendarAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" onClick={() => changeMonth(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                                <ChevronLeftIcon style={{ width: '1rem', height: '1rem' }} />
                            </button>
                            <button type="button" onClick={() => changeMonth(1)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                                <ChevronRightIcon style={{ width: '1rem', height: '1rem' }} />
                            </button>
                        </div>
                    </div>

                    {/* Weekdays */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', opacity: 0.6 }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                        {renderCalendar()}
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center' }}>
                        <button 
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                setSelectedDate(today);
                                setViewDate(today);
                                setIsOpen(false);
                                onChange(today.toISOString().split('T')[0]);
                            }}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: 'var(--gold)', 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                cursor: 'pointer',
                                padding: '0.2rem 0.5rem'
                            }}
                        >
                            TODAY
                        </button>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes calendarAppear {
                    from { opacity: 0; transform: translateY(10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes calendarAppearUp {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}} />
        </div>
    );
}
