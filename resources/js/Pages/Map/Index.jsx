import { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
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

const createCustomIcon = (color, size = 18) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.4);"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
};

const COLORS = {
    national: '#2563eb', // Blue
    conference: '#9333ea', // Purple
    district: '#16a34a', // Green
    society: '#dc2626', // Red
};

export default function ChurchMap({ national = [], conferences = [], districts = [], societies = [], defaultCenter = null }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersLayerRef = useRef(L.layerGroup());
    const tempMarkerRef = useRef(null);
 
    const [mode, setMode] = useState('view'); // 'view' or 'edit'
    const [selectedType, setSelectedType] = useState('society');
    const [selectedEntityId, setSelectedEntityId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
 
    const { data, setData, patch, processing } = useForm({
        latitude: '',
        longitude: '',
        location_name: '',
    });
 
    // Sync map when manual coordinates are typed
    useEffect(() => {
        if (data.latitude && data.longitude && mapInstance.current) {
            const lat = parseFloat(data.latitude);
            const lng = parseFloat(data.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                mapInstance.current.panTo([lat, lng]);
            }
        }
    }, [data.latitude, data.longitude]);
 
    useEffect(() => {
        if (!mapInstance.current) {
            // Default center: Use provided defaultCenter or fallback to Manila [14.5995, 120.9842]
            const startLat = defaultCenter ? defaultCenter.lat : 14.5995;
            const startLng = defaultCenter ? defaultCenter.lng : 120.9842;
            const startZoom = defaultCenter ? 15 : 12;

            mapInstance.current = L.map(mapRef.current).setView([startLat, startLng], startZoom);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance.current);

            markersLayerRef.current.addTo(mapInstance.current);
        }

        renderMarkers();
    }, [national, conferences, districts, societies, mode]);

    const handleSearch = async (e) => {
        if (e.key !== 'Enter' || !searchQuery.trim()) return;
        
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ph`);
            const results = await response.json();

            if (results && results.length > 0) {
                const { lat, lon } = results[0];
                const targetLat = parseFloat(lat);
                const targetLon = parseFloat(lon);

                // Start from Manila to create a long-distance flight effect
                mapInstance.current.setView([14.5995, 120.9842], 7, { animate: false });
                
                setTimeout(() => {
                    mapInstance.current.flyTo([targetLat, targetLon], 15, {
                        duration: 3.5,
                        easeLinearity: 0.25
                    });
                }, 150);

                if (tempMarkerRef.current) tempMarkerRef.current.remove();
                tempMarkerRef.current = L.marker([targetLat, targetLon])
                    .addTo(mapInstance.current)
                    .bindPopup(`<b>Search Result:</b><br/>${results[0].display_name}`)
                    .openPopup();
                
                if (mode === 'edit') {
                    setData(d => ({
                        ...d,
                        latitude: targetLat.toFixed(8),
                        longitude: targetLon.toFixed(8),
                        location_name: results[0].display_name
                    }));
                }
            }
        } catch (error) {
            console.error("Geocoding failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Restore zoom-sensitive labels
    useEffect(() => {
        if (!mapInstance.current) return;

        const onMapClick = (e) => {
            if (mode === 'edit') {
                const { lat, lng } = e.latlng;
                handleMapClick(lat, lng);
            }
        };

        const onZoom = () => {
            const zoom = mapInstance.current.getZoom();
            markersLayerRef.current.eachLayer(layer => {
                if (layer instanceof L.Marker && layer !== tempMarkerRef.current) {
                    if (zoom >= 13) {
                        layer.openTooltip();
                    } else {
                        layer.closeTooltip();
                    }
                }
            });
        };

        mapInstance.current.off('click');
        mapInstance.current.on('click', onMapClick);
        mapInstance.current.on('zoomend', onZoom);
        onZoom();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.off('click', onMapClick);
                mapInstance.current.off('zoomend', onZoom);
            }
        };
    }, [mode]);

    const handleMapClick = (lat, lng) => {
        setData(d => ({
            ...d,
            latitude: lat.toFixed(8),
            longitude: lng.toFixed(8),
        }));
        
        if (tempMarkerRef.current) {
            tempMarkerRef.current.setLatLng([lat, lng]);
        } else {
            tempMarkerRef.current = L.marker([lat, lng], { draggable: true })
                .addTo(mapInstance.current)
                .bindPopup('<b>New Assigned Location</b><br/>Drag to refine')
                .openPopup();
                
            tempMarkerRef.current.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                setData({
                    latitude: pos.lat.toFixed(8),
                    longitude: pos.lng.toFixed(8),
                });
            });
        }
    };

    const addMarkersForType = (entities, type, color, titlePrefix) => {
        entities.forEach(entity => {
            if (entity.latitude && entity.longitude) {
                const marker = L.marker([entity.latitude, entity.longitude], {
                    draggable: mode === 'edit',
                    icon: createCustomIcon(color),
                }).addTo(markersLayerRef.current);

                const popupContent = document.createElement('div');
                popupContent.style.minWidth = '180px';
                
                // Prioritize location_name (captured address) over manual address
                const displayLocation = entity.location_name || entity.address;
                
                popupContent.innerHTML = `
                    <div style="margin-bottom: 4px;">
                        <span style="background: ${color}; color: white; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; text-transform: uppercase;">
                            ${titlePrefix}
                        </span>
                    </div>
                    <div style="font-weight: 700; font-size: 1rem; color: #fff; margin-bottom: 4px;">${entity.name}</div>
                    ${displayLocation ? `<div style="font-size: 0.8rem; color: var(--gold); margin-bottom: 8px; line-height: 1.4;">${displayLocation}</div>` : ''}
                    ${mode === 'edit' ? '<div style="font-size: 0.7rem; color: #aaa; border-top: 1px solid #444; padding-top: 4px; margin-top: 4px;">Drag marker to update location</div>' : ''}
                `;

                marker.bindPopup(popupContent);
                marker.bindTooltip(entity.name, {
                    direction: 'top',
                    offset: [0, -12],
                    className: 'custom-tooltip',
                    permanent: mapInstance.current.getZoom() >= 13
                });

                if (mode === 'edit') {
                    marker.on('dragend', (e) => {
                        const pos = e.target.getLatLng();
                        setData(d => ({
                            ...d,
                            latitude: pos.lat.toFixed(8),
                            longitude: pos.lng.toFixed(8),
                        }));
                        setSelectedType(type);
                        setSelectedEntityId(entity.id.toString());
                    });
                }
            }
        });
    };

    const renderMarkers = () => {
        markersLayerRef.current.clearLayers();
        addMarkersForType(national, 'national', COLORS.national, 'National');
        addMarkersForType(conferences, 'conference', COLORS.conference, 'Conference');
        addMarkersForType(districts, 'district', COLORS.district, 'District');
        addMarkersForType(societies, 'society', COLORS.society, 'Society');
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!selectedEntityId) return;

        patch(route('map.location.update', { type: selectedType, id: selectedEntityId }), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedEntityId('');
                if (tempMarkerRef.current) {
                    tempMarkerRef.current.remove();
                    tempMarkerRef.current = null;
                }
                alert('Location assigned successfully!');
            },
            onError: (errors) => {
                console.error("Save failed:", errors);
                alert('Failed to save location. Please check your permissions or the selected entity.');
            }
        });
    };

    const getOptions = () => {
        switch (selectedType) {
            case 'national': return national;
            case 'conference': return conferences;
            case 'district': return districts;
            case 'society': return societies;
            default: return [];
        }
    };

    return (
        <AuthenticatedLayout header="Geographical Mapping">
            <Head title="Church Map" />

            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', gap: '1rem' }}>
                
                {/* Clean Top Bar */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'var(--navy-light)',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '1rem',
                    border: '1px solid var(--navy-border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1 }}>
                        {mode === 'view' && (
                            <div style={{ position: 'relative', width: '450px' }}>
                                <input 
                                    type="text"
                                    className="form-input"
                                    placeholder="Where to? Type a place and press Enter..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    style={{ 
                                        padding: '0.8rem 1rem 0.8rem 3rem', 
                                        borderRadius: '1rem',
                                        fontSize: '0.95rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: isSearching ? '2px solid var(--gold)' : '1px solid var(--navy-border)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }}>
                                    {isSearching ? (
                                        <div className="animate-spin" style={{ width: '1.2rem', height: '1.2rem', border: '2px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                    ) : (
                                        <svg style={{ width: '1.2rem', height: '1.2rem', color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.national }}></span> National
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.conference }}></span> Conf.
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.district }}></span> Dist.
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.society }}></span> Society
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', background: 'var(--navy-bg)', borderRadius: '0.8rem', padding: '0.4rem', border: '1px solid var(--navy-border)' }}>
                        <button 
                            onClick={() => setMode('view')}
                            style={{ 
                                padding: '0.6rem 1.2rem', 
                                borderRadius: '0.5rem', 
                                fontSize: '0.85rem',
                                border: 'none',
                                cursor: 'pointer',
                                background: mode === 'view' ? 'var(--gold)' : 'transparent',
                                color: mode === 'view' ? 'black' : 'var(--text-secondary)',
                                fontWeight: 700,
                                transition: 'all 0.2s'
                            }}
                        >
                            View All
                        </button>
                        <button 
                            onClick={() => setMode('edit')}
                            style={{ 
                                padding: '0.6rem 1.2rem', 
                                borderRadius: '0.5rem', 
                                fontSize: '0.85rem',
                                border: 'none',
                                cursor: 'pointer',
                                background: mode === 'edit' ? 'var(--gold)' : 'transparent',
                                color: mode === 'edit' ? 'black' : 'var(--text-secondary)',
                                fontWeight: 700,
                                transition: 'all 0.2s'
                            }}
                        >
                            Editor
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: 0 }}>
                    {/* Main Map */}
                    <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', border: '1px solid var(--navy-border)', position: 'relative' }}>
                        <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }}></div>
                        
                        {mode === 'edit' && !data.latitude && (
                            <div style={{ 
                                position: 'absolute', 
                                top: '1rem', 
                                left: '50%', 
                                transform: 'translateX(-50%)', 
                                zIndex: 1000,
                                background: 'rgba(0,0,0,0.8)',
                                color: 'var(--gold)',
                                padding: '0.5rem 1rem',
                                borderRadius: '2rem',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                border: '1px solid var(--gold)',
                                pointerEvents: 'none'
                            }}>
                                Click on the map to start assigning a location
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    {mode === 'edit' && (
                        <div className="card animate-fade-in" style={{ 
                            width: '380px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '2.5rem', 
                            padding: '2rem',
                            border: '1px solid var(--navy-border)',
                            background: 'rgba(28, 50, 84, 0.4)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Location Editor</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                    Assign or refine geographical coordinates for any entity by clicking the map.
                                </p>
                            </div>

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
                                <div className="form-group" style={{ gap: '0.75rem' }}>
                                    <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        1. Set Geographical Location
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            placeholder="Type a city or landmark..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            onKeyDown={handleSearch}
                                            style={{ 
                                                padding: '0.8rem 1rem 0.8rem 2.8rem', 
                                                borderRadius: '0.8rem',
                                                fontSize: '0.9rem',
                                                background: 'rgba(0,0,0,0.3)',
                                                border: isSearching ? '2px solid var(--gold)' : '1px solid var(--navy-border)',
                                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                            }}
                                        />
                                        <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }}>
                                            {isSearching ? (
                                                <div className="animate-spin" style={{ width: '1.1rem', height: '1.1rem', border: '2px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                            ) : (
                                                <svg style={{ width: '1.1rem', height: '1.1rem', color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            )}
                                        </div>
                                    </div>
                                    {data.latitude && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--gold)', display: 'flex', gap: '0.5rem' }}>
                                                <span>Lat: {parseFloat(data.latitude).toFixed(4)}</span>
                                                <span>Lng: {parseFloat(data.longitude).toFixed(4)}</span>
                                                <span style={{ color: 'var(--text-secondary)' }}>(Captured ✓)</span>
                                            </div>
                                            {data.location_name && (
                                                <div style={{ 
                                                    fontSize: '0.7rem', 
                                                    color: 'var(--text-primary)', 
                                                    background: 'rgba(28, 50, 84, 0.6)', 
                                                    padding: '0.4rem 0.6rem', 
                                                    borderRadius: '0.4rem',
                                                    borderLeft: '2px solid var(--gold)',
                                                    lineHeight: '1.3'
                                                }}>
                                                    {data.location_name}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group" style={{ gap: '0.75rem' }}>
                                    <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        2. Hierarchy Level
                                    </label>
                                    <select 
                                        className="form-select" 
                                        value={selectedType} 
                                        onChange={(e) => {
                                            setSelectedType(e.target.value);
                                            setSelectedEntityId('');
                                        }}
                                        style={{ padding: '0.75rem', borderRadius: '0.8rem' }}
                                    >
                                        <option value="society">Local Society (Church)</option>
                                        <option value="district">District Office</option>
                                        <option value="conference">Annual Conference</option>
                                        <option value="national">National Office</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{ gap: '0.75rem' }}>
                                    <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        3. Target Entity
                                    </label>
                                    <select 
                                        className="form-select" 
                                        value={selectedEntityId} 
                                        onChange={(e) => setSelectedEntityId(e.target.value)}
                                        required
                                        style={{ padding: '0.75rem', borderRadius: '0.8rem' }}
                                    >
                                        <option value="">— Select Target —</option>
                                        {getOptions().map(opt => (
                                            <option key={opt.id} value={opt.id}>
                                                {opt.name} {opt.latitude ? '✓' : '○'}
                                            </option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', padding: '0 0.25rem' }}>
                                        <span><span style={{color: 'var(--gold)'}}>✓</span> Mapped</span>
                                        <span><span style={{opacity: 0.5}}>○</span> Unmapped</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <button 
                                        type="submit" 
                                        className={`btn-primary ${data.latitude ? 'btn-bright' : ''}`} 
                                        disabled={processing || !selectedEntityId || !data.latitude} 
                                        style={{ width: '100%', padding: '1rem', fontSize: '0.9rem', borderRadius: '0.8rem' }}
                                    >
                                        {processing ? 'Applying...' : 'Save Location Assignment'}
                                    </button>
                                    
                                    {data.latitude && (
                                        <button 
                                            type="button" 
                                            className="btn-secondary" 
                                            onClick={() => {
                                                setData({ latitude: '', longitude: '' });
                                                setSearchQuery('');
                                                if (tempMarkerRef.current) {
                                                    tempMarkerRef.current.remove();
                                                    tempMarkerRef.current = null;
                                                }
                                            }}
                                            style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem', opacity: 0.8, borderRadius: '0.8rem' }}
                                        >
                                            Reset Location
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
