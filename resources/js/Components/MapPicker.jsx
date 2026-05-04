import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

export default function MapPicker({ latitude, longitude, locationName, onChange, onLocationNameChange, height = '300px' }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!mapInstance.current) {
            // Default baseline: Manila
            const initialLat = parseFloat(latitude) || 14.5995;
            const initialLng = parseFloat(longitude) || 120.9842;
            const initialZoom = latitude && longitude ? 15 : 12;

            mapInstance.current = L.map(mapRef.current).setView([initialLat, initialLng], initialZoom);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance.current);

            mapInstance.current.on('click', (e) => {
                const { lat, lng } = e.latlng;
                updateMarker(lat, lng);
            });
        }

        if (latitude && longitude && !markerRef.current) {
            updateMarker(latitude, longitude, false);
        }
    }, []);

    useEffect(() => {
        if (latitude && longitude && mapInstance.current) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            
            if (markerRef.current) {
                const currentPos = markerRef.current.getLatLng();
                if (currentPos.lat !== lat || currentPos.lng !== lng) {
                    markerRef.current.setLatLng([lat, lng]);
                }
            } else {
                updateMarker(lat, lng, false);
            }

            // Fallback: If we have coords but no name, try to fetch it once
            if (!locationName && onLocationNameChange) {
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.display_name) {
                            onLocationNameChange(stripZipCode(data.display_name));
                        }
                    })
                    .catch(e => console.error("Reverse geocode failed:", e));
            }
        }
    }, [latitude, longitude]);

    const stripZipCode = (address) => {
        if (!address) return '';
        // Remove 4-5 digit numbers that are likely zip codes, along with surrounding spaces/commas
        return address.replace(/,?\s*\b\d{4,5}\b\s*,?/g, ', ').replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim();
    };

    const handleSearch = async (e) => {
        if (e.key !== 'Enter' || !searchQuery.trim()) return;
        e.preventDefault();
        
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ph`);
            const results = await response.json();

            if (results && results.length > 0) {
                const { lat, lon, display_name } = results[0];
                const targetLat = parseFloat(lat);
                const targetLon = parseFloat(lon);

                // Cinematic reset to Manila
                mapInstance.current.setView([14.5995, 120.9842], 8, { animate: false });
                
                setTimeout(() => {
                    mapInstance.current.flyTo([targetLat, targetLon], 16, {
                        duration: 3,
                        easeLinearity: 0.25
                    });
                }, 150);

                updateMarker(targetLat, targetLon);
                if (onLocationNameChange) {
                    onLocationNameChange(stripZipCode(display_name));
                }
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const updateMarker = (lat, lng, triggerChange = true) => {
        const fixedLat = parseFloat(lat).toFixed(8);
        const fixedLng = parseFloat(lng).toFixed(8);

        if (markerRef.current) {
            markerRef.current.setLatLng([fixedLat, fixedLng]);
        } else {
            markerRef.current = L.marker([fixedLat, fixedLng], { draggable: true })
                .addTo(mapInstance.current);

            markerRef.current.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                updateMarker(pos.lat, pos.lng);
            });
        }

        if (triggerChange) {
            onChange(fixedLat, fixedLng);
        }
    };

    return (
        <div className="map-picker-container" style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Location Header / Search Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {locationName ? (
                    <div style={{ 
                        background: 'linear-gradient(90deg, #162945 0%, #0d1b2e 100%)',
                        border: '1px solid var(--gold)',
                        borderRadius: '0.875rem',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ 
                            background: 'var(--gold)', 
                            color: '#000', 
                            width: '32px', height: '32px', 
                            borderRadius: '8px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem',
                            flexShrink: 0,
                            boxShadow: '0 0 15px rgba(212,160,23,0.3)'
                        }}>📍</div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.15rem' }}>
                                    Exact Assigned Location
                                </div>
                                <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600, lineHeight: '1.5' }}>
                                    {locationName}
                                </div>
                            </div>
                            
                            {/* Search Bar inside Header, but with more space */}
                            <div style={{ position: 'relative', marginTop: '0.25rem' }}>
                                <input 
                                    type="text"
                                    className="form-input"
                                    placeholder="Click here to change location..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    style={{ 
                                        width: '100%',
                                        padding: '0.6rem 1rem 0.6rem 2.5rem', 
                                        borderRadius: '0.75rem',
                                        fontSize: '0.8rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                />
                                <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>
                                    {isSearching ? (
                                        <div className="animate-spin" style={{ width: '0.9rem', height: '0.9rem', border: '2px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                    ) : (
                                        <svg style={{ width: '1rem', height: '1rem', color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text"
                            className="form-input"
                            placeholder="Search place to set location..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            style={{ 
                                padding: '0.8rem 1rem 0.8rem 2.75rem', 
                                borderRadius: '0.875rem',
                                fontSize: '0.9rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: isSearching ? '1px solid var(--gold)' : '1px solid var(--navy-border)'
                            }}
                        />
                        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }}>
                            {isSearching ? (
                                <div className="animate-spin" style={{ width: '1rem', height: '1rem', border: '2px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                            ) : (
                                <svg style={{ width: '1.1rem', height: '1.1rem', color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div 
                ref={mapRef} 
                style={{ 
                    height, 
                    width: '100%', 
                    borderRadius: '0.875rem', 
                    border: '1px solid var(--navy-border)',
                    zIndex: 1,
                    overflow: 'hidden',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)'
                }} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--gold)' }}>📍</span> Click map or drag marker to refine
                </p>
                {latitude && longitude && (
                    <div style={{ background: 'rgba(212, 160, 23, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(212, 160, 23, 0.2)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700 }}>
                            {latitude}, {longitude}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
