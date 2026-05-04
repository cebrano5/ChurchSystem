import React, { useState, useEffect, useRef } from 'react';
import { ClockIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function CustomTimePicker({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Initial state from value (expecting HH:mm)
    const initialTime = value ? value.split(':') : ['08', '00'];
    const [hours, setHours] = useState(parseInt(initialTime[0]));
    const [minutes, setMinutes] = useState(parseInt(initialTime[1]));
    const [ampm, setAmPm] = useState(hours >= 12 ? 'PM' : 'AM');

    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    const [hStr, setHStr] = useState(displayHours.toString());
    const [mStr, setMStr] = useState(minutes.toString().padStart(2, '0'));

    useEffect(() => {
        setHStr(displayHours.toString());
    }, [displayHours]);

    useEffect(() => {
        setMStr(minutes.toString().padStart(2, '0'));
    }, [minutes]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleUpdate = (h, m, ap) => {
        let finalH = h;
        if (ap === 'PM' && h < 12) finalH += 12;
        if (ap === 'AM' && h === 12) finalH = 0;
        
        const timeString = `${finalH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        onChange(timeString);
    };

    const adjustTime = (type, delta) => {
        if (type === 'h') {
            let next = hours + delta;
            if (next > 23) next = 0;
            if (next < 0) next = 23;
            setHours(next);
            setAmPm(next >= 12 ? 'PM' : 'AM');
            handleUpdate(next > 12 ? next - 12 : next === 0 ? 12 : next, minutes, next >= 12 ? 'PM' : 'AM');
        } else {
            let next = minutes + delta;
            if (next > 59) next = 0;
            if (next < 0) next = 59;
            setMinutes(next);
            handleUpdate(displayHours, next, ampm);
        }
    };

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
                <ClockIcon style={{ width: '1.1rem', height: '1.1rem', color: 'var(--gold)' }} />
                <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {displayHours}:{minutes.toString().padStart(2, '0')} {ampm}
                </span>
            </div>

            {isOpen && (
                <div style={{ 
                    position: 'absolute', 
                    top: 'calc(100% + 8px)', 
                    right: 0, 
                    zIndex: 4000,
                    background: '#0d1b2e',
                    border: '1.5px solid var(--gold)',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,160,23,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    animation: 'calendarAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    {/* Hours */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <button type="button" onClick={() => adjustTime('h', 1)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}><ChevronUpIcon style={{ width: '1.2rem' }} /></button>
                        <input 
                            type="text"
                            value={hStr}
                            onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 2) val = val.slice(-2);
                                setHStr(val);
                                
                                if (val !== '') {
                                    let h = parseInt(val);
                                    if (h > 12) h = 12;
                                    if (h < 1) h = 1;
                                    setHours(ampm === 'PM' && h < 12 ? h + 12 : ampm === 'AM' && h === 12 ? 0 : h);
                                    handleUpdate(h, minutes, ampm);
                                }
                            }}
                            onBlur={() => {
                                if (hStr === '' || parseInt(hStr) < 1) {
                                    setHStr(displayHours.toString());
                                } else {
                                    let h = parseInt(hStr);
                                    if (h > 12) h = 12;
                                    setHStr(h.toString());
                                }
                            }}
                            style={{ 
                                width: '3.5rem',
                                textAlign: 'center',
                                fontSize: '1.5rem', 
                                fontWeight: 800, 
                                color: 'var(--text-primary)',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                outline: 'none',
                                padding: '0.2rem 0'
                            }}
                        />
                        <button type="button" onClick={() => adjustTime('h', -1)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}><ChevronDownIcon style={{ width: '1.2rem' }} /></button>
                    </div>

                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold)', opacity: 0.5 }}>:</div>

                    {/* Minutes */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <button type="button" onClick={() => adjustTime('m', 5)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}><ChevronUpIcon style={{ width: '1.2rem' }} /></button>
                        <input 
                            type="text"
                            value={mStr}
                            onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 2) val = val.slice(-2);
                                setMStr(val);
                                
                                if (val !== '') {
                                    let m = parseInt(val);
                                    if (m > 59) m = 59;
                                    setMinutes(m);
                                    handleUpdate(displayHours, m, ampm);
                                }
                            }}
                            onBlur={() => {
                                if (mStr === '') {
                                    setMStr(minutes.toString().padStart(2, '0'));
                                } else {
                                    let m = parseInt(mStr);
                                    if (m > 59) m = 59;
                                    setMStr(m.toString().padStart(2, '0'));
                                    setMinutes(m);
                                }
                            }}
                            style={{ 
                                width: '3.5rem',
                                textAlign: 'center',
                                fontSize: '1.5rem', 
                                fontWeight: 800, 
                                color: 'var(--text-primary)',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                outline: 'none',
                                padding: '0.2rem 0'
                            }}
                        />
                        <button type="button" onClick={() => adjustTime('m', -5)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}><ChevronDownIcon style={{ width: '1.2rem' }} /></button>
                    </div>

                    {/* AM/PM */}
                    <div style={{ marginLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {['AM', 'PM'].map(ap => (
                            <button 
                                key={ap}
                                type="button"
                                onClick={() => {
                                    setAmPm(ap);
                                    handleUpdate(displayHours, minutes, ap);
                                }}
                                style={{ 
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    background: ampm === ap ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                                    color: ampm === ap ? '#000' : 'var(--text-secondary)'
                                }}
                            >
                                {ap}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
