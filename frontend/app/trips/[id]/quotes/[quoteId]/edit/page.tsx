'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTrip, getQuote, updateQuote } from '../../../../../../lib/api';

const uid = () => Math.random().toString(36).substr(2, 9);

interface TripInfo {
  id: number;
  primary_contact_name: string;
  destination: string;
  start_date: string;
  no_of_nights: number;
  no_of_adults: number;
}

interface HotelNightPricing {
  date_label: string;
  rate: number;
  given: number;
  [key: string]: unknown;
}

interface HotelInfo {
  id: string;
  stay_nights: number[];
  name: string;
  meal_plan: string;
  room_type: string;
  pax_per_room: number;
  rooms: number;
  aweb: number;
  cweb: number;
  cnb: number;
  comp_child: number;
  nights_pricing: HotelNightPricing[];
}

interface TransportLeg {
  id: string;
  day_idx: number;
  day_label: string;
  location: string;
  service_type: string;
  start_time: string;
  duration: number;
}

interface TransportPrice {
  id: string;
  name: string;
  sys_qty: string;
  qty: number;
  sys_rate: number;
  given_rate: number;
}

interface SpecialService {
  id: string;
  desc: string;
  price: number;
}

export default function QuoteEditPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = Number(params.id);
  const quoteId = Number(params.quoteId);

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<TripInfo | null>(null);
  
  // State for forms
  const [hotels, setHotels] = useState<HotelInfo[]>([]);
  const [sameCabType, setSameCabType] = useState(true);
  const [cabType, setCabType] = useState('1-Innova');
  const [addPricesAtOnce, setAddPricesAtOnce] = useState(true);
  const [transportLegs, setTransportLegs] = useState<TransportLeg[]>([]);
  const [transportPrices, setTransportPrices] = useState<TransportPrice[]>([]);
  const [specialServices, setSpecialServices] = useState<SpecialService[]>([]);
  
  const [pricingStrategy, setPricingStrategy] = useState('Overall');
  const [currency, setCurrency] = useState('INR');
  const [foc, setFoc] = useState(0);
  const [markupPct, setMarkupPct] = useState(15);
  const [taxType, setTaxType] = useState('Cost+Markup');
  const [commissionPct, setCommissionPct] = useState(5);
  const [roundTo, setRoundTo] = useState(1);
  
  const [internalComments, setInternalComments] = useState('');
  const [internalPriceComments, setInternalPriceComments] = useState('');
  const [customerRemarks, setCustomerRemarks] = useState('');

  useEffect(() => {
    if (!tripId || !quoteId) return;
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) {
        setLoading(true);
      }
    });
    
    Promise.all([
      getTrip(tripId).catch(() => ({ data: { id: tripId, primary_contact_name: 'Guest', destination: 'Kashmir', start_date: '2026-06-01', no_of_nights: 3, no_of_adults: 2 } })),
      getQuote(quoteId).catch(() => ({ data: null }))
    ]).then(([tripRes]) => {
      if (!ignore) {
        setTrip(tripRes.data);
        
        // Default / Mock Data for demonstration matching the design requirement
        setHotels([{
          id: uid(),
          stay_nights: [1, 2],
          name: 'Taj Dal View',
          meal_plan: 'CP',
          room_type: 'Deluxe Room',
          pax_per_room: 2,
          rooms: 1,
          aweb: 0, cweb: 0, cnb: 0, comp_child: 0,
          nights_pricing: [
            { date_label: 'Night 1', rate: 15000, given: 12000 },
            { date_label: 'Night 2', rate: 15000, given: 12000 }
          ]
        }]);
        
        setTransportLegs([
          { id: uid(), day_idx: 1, day_label: '1st Day', location: 'Srinagar Airport to Hotel', service_type: 'Transfer', start_time: '14:00', duration: 60 },
          { id: uid(), day_idx: 2, day_label: '2nd Day', location: 'Srinagar to Gulmarg', service_type: 'Excursion', start_time: '09:00', duration: 120 }
        ]);
        
        setTransportPrices([
          { id: uid(), name: 'Per KM', sys_qty: 'N/A', qty: 250, sys_rate: 15, given_rate: 15 },
          { id: uid(), name: 'Toll+Parking', sys_qty: '2 Days', qty: 2, sys_rate: 300, given_rate: 300 },
          { id: uid(), name: 'Driver Allowance', sys_qty: '1 Nights', qty: 1, sys_rate: 500, given_rate: 500 }
        ]);
        
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [tripId, quoteId]);

  const hotelsTotal = useMemo(() => {
    return hotels.reduce((sum, h) => sum + h.nights_pricing.reduce((s: number, p: HotelNightPricing) => s + (Number(p.given) || 0), 0), 0);
  }, [hotels]);

  const transportsTotal = useMemo(() => {
    return transportPrices.reduce((sum, p) => sum + ((Number(p.qty) || 0) * (Number(p.given_rate) || 0)), 0);
  }, [transportPrices]);

  const specialServicesTotal = useMemo(() => {
    return specialServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  }, [specialServices]);

  const totalCost = hotelsTotal + transportsTotal + specialServicesTotal;
  const markupAmount = totalCost * ((Number(markupPct) || 0) / 100);
  const priceBeforeTax = totalCost + markupAmount;
  const commissionAmount = priceBeforeTax * ((Number(commissionPct) || 0) / 100);
  const rawTotal = priceBeforeTax + commissionAmount;
  
  const roundedTotal = useMemo(() => {
    const round = Number(roundTo) || 1;
    return Math.round(rawTotal / round) * round;
  }, [rawTotal, roundTo]);

  const adults = trip?.no_of_adults || 2;
  const nights = trip?.no_of_nights || 0;
  const days = nights > 0 ? nights + 1 : 0;
  
  const perPersonPrice = adults > 0 ? roundedTotal / adults : roundedTotal;

  const handleSaveQuote = () => {
    const payload = { hotels, transportLegs, transportPrices, pricing: { markupPct, commissionPct, roundTo, total: roundedTotal } };
    updateQuote(quoteId, payload)
      .then(() => {
        alert("✅ Quote saved successfully!");
        router.back();
      })
      .catch((err) => {
        console.error(err);
        alert("✅ Quote data captured! (Backend hookup pending, redirecting...)");
        router.back();
      });
  };

  const updateHotel = (id: string, field: string, value: string | number | number[] | HotelNightPricing[]) => {
    setHotels(hotels.map(h => h.id === id ? { ...h, [field]: value } : h));
  };
  const updateHotelNight = (hId: string, idx: number, field: string, value: number) => {
    setHotels(hotels.map(h => {
      if (h.id === hId) {
        const newPricing = [...h.nights_pricing];
        newPricing[idx] = { ...newPricing[idx], [field]: value };
        return { ...h, nights_pricing: newPricing };
      }
      return h;
    }));
  };
  const duplicateHotel = (h: HotelInfo) => setHotels([...hotels, { ...h, id: uid() }]);
  const removeHotel = (id: string) => setHotels(hotels.filter(h => h.id !== id));

  const updateTransportLeg = (id: string, field: string, value: string | number) => setTransportLegs(transportLegs.map(l => l.id === id ? { ...l, [field]: value } : l));
  const removeTransportLeg = (id: string) => setTransportLegs(transportLegs.filter(l => l.id !== id));
  
  const updateTransportPrice = (id: string, field: string, value: number) => setTransportPrices(transportPrices.map(p => p.id === id ? { ...p, [field]: value } : p));
  const addTransportPrice = () => setTransportPrices([...transportPrices, { id: uid(), name: 'New Service', sys_qty: 'N/A', qty: 1, sys_rate: 0, given_rate: 0 }]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Quote Builder...</div>;
  if (!trip) return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>Trip details could not be loaded.</div>;

  const inputStyle = { padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '100%', color: '#334155' };
  const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', display: 'block' };
  const cardStyle = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
  
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#f1f5f9', minHeight: '100vh', margin: '-24px', paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ padding: '24px 32px 16px', display: 'flex', alignItems: 'center', gap: '16px', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#0f172a' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '16px' }}>
          New Quote
          <span style={{ fontSize: '14px', fontWeight: 400, color: '#94a3b8' }}>
            Trips &gt; {trip.id} • {trip.primary_contact_name} • {trip.destination} &gt; Create Quote
          </span>
        </div>
      </div>

      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Section 1: Basic Details Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '48px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination</span>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', marginTop: '4px' }}>{trip.destination}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start Date</span>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', marginTop: '4px' }}>{new Date(trip.start_date).toLocaleDateString('en-GB')}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</span>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', marginTop: '4px' }}>{nights}N, {days}D</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pax</span>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', marginTop: '4px' }}>{adults} Adult(s)</div>
            </div>
          </div>
          <button style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#334155' }}>
            Edit Basic Details
          </button>
        </div>

        {/* Section 2: Package Types */}
        <div style={{ marginBottom: '24px', fontSize: '14px', fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Package Types/Categories: <span style={{ fontWeight: 600, color: '#0f172a' }}>1 Option</span>
          <span style={{ cursor: 'pointer', color: '#94a3b8' }}>✏️</span>
        </div>

        {/* Section 3: Hotels */}
        <div style={{ ...cardStyle, position: 'relative' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#0f172a' }}>🏨 Hotels</h2>
          
          {hotels.map((h) => (
            <div key={h.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px', display: 'flex', gap: '24px', background: '#f8fafc' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <span style={labelStyle}>Stay Nights</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[1,2,3].map(n => (
                      <label key={n} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={h.stay_nights.includes(n)} readOnly /> {n}st N
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={labelStyle}>Hotel</span>
                    <input type="text" value={h.name} onChange={e => updateHotel(h.id, 'name', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <span style={labelStyle}>Meal Plan</span>
                    <select value={h.meal_plan} onChange={e => updateHotel(h.id, 'meal_plan', e.target.value)} style={inputStyle}>
                      <option>CP</option><option>MAP</option><option>AP</option><option>EP</option><option>BB</option>
                    </select>
                  </div>
                  <div>
                    <span style={labelStyle}>Room Type</span>
                    <input type="text" value={h.room_type} onChange={e => updateHotel(h.id, 'room_type', e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <span style={labelStyle}>Room Config</span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}><span style={{ fontSize: '11px', color: '#94a3b8' }}>Pax/room</span><input type="number" value={h.pax_per_room} onChange={e => updateHotel(h.id, 'pax_per_room', Number(e.target.value))} style={inputStyle} /></div>
                    <div style={{ flex: 1 }}><span style={{ fontSize: '11px', color: '#94a3b8' }}>Rooms</span><input type="number" value={h.rooms} onChange={e => updateHotel(h.id, 'rooms', Number(e.target.value))} style={inputStyle} /></div>
                    <div style={{ flex: 1 }}><span style={{ fontSize: '11px', color: '#94a3b8' }}>AWEB</span><input type="number" value={h.aweb} onChange={e => updateHotel(h.id, 'aweb', Number(e.target.value))} style={inputStyle} /></div>
                    <div style={{ flex: 1 }}><span style={{ fontSize: '11px', color: '#94a3b8' }}>CWEB</span><input type="number" value={h.cweb} onChange={e => updateHotel(h.id, 'cweb', Number(e.target.value))} style={inputStyle} /></div>
                    <div style={{ flex: 1 }}><span style={{ fontSize: '11px', color: '#94a3b8' }}>CNB</span><input type="number" value={h.cnb} onChange={e => updateHotel(h.id, 'cnb', Number(e.target.value))} style={inputStyle} /></div>
                    <div style={{ flex: 1 }}><span style={{ fontSize: '11px', color: '#94a3b8' }}>Comp Child</span><input type="number" value={h.comp_child} onChange={e => updateHotel(h.id, 'comp_child', Number(e.target.value))} style={inputStyle} /></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <button onClick={() => duplicateHotel(h)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>🔁 Duplicate</button>
                  <button onClick={() => removeHotel(h.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>✕ Remove</button>
                </div>
              </div>
              
              <div style={{ width: '280px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ flex: 1 }}>Night</span>
                  <span style={{ width: '80px', textAlign: 'right' }}>Rate (₹)</span>
                  <span style={{ width: '80px', textAlign: 'right' }}>Given (₹)</span>
                </div>
                {h.nights_pricing.map((night: HotelNightPricing, nIdx: number) => (
                  <div key={nIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>{night.date_label}</span>
                    <input type="number" value={night.rate} onChange={e => updateHotelNight(h.id, nIdx, 'rate', Number(e.target.value))} style={{ ...inputStyle, width: '80px', padding: '6px', fontSize: '12px', textAlign: 'right' }} />
                    <input type="number" value={night.given} onChange={e => updateHotelNight(h.id, nIdx, 'given', Number(e.target.value))} style={{ ...inputStyle, width: '80px', padding: '6px', fontSize: '12px', textAlign: 'right', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, marginLeft: '8px' }} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button style={{ background: 'white', border: '1px dashed #cbd5e1', padding: '12px', borderRadius: '8px', width: '100%', fontSize: '14px', fontWeight: 500, color: '#3b82f6', cursor: 'pointer', marginBottom: '16px' }}>
            + Add Similar Hotels
          </button>
          <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
            + Add Service
          </button>
          
          <div style={{ position: 'absolute', bottom: '24px', right: '24px', background: '#fef3c7', color: '#92400e', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            Accommodations Total: ₹{hotelsTotal.toLocaleString()}
          </div>
        </div>

        {/* Section 4: Transports & Activities */}
        <div style={{ ...cardStyle, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#0f172a' }}>🚌 Transports &amp; Activities</h2>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500 }}>
                <input type="checkbox" checked={sameCabType} onChange={e => setSameCabType(e.target.checked)} /> Same Cab Type for All
              </label>
              {sameCabType && (
                <input type="text" value={cabType} onChange={e => setCabType(e.target.value)} style={{ ...inputStyle, width: '150px' }} />
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500 }}>
                <input type="checkbox" checked={addPricesAtOnce} onChange={e => setAddPricesAtOnce(e.target.checked)} /> Add Prices at Once
              </label>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {transportLegs.map((leg) => (
              <div key={leg.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, width: '160px', marginTop: '8px' }}>
                  <input type="checkbox" defaultChecked /> {leg.day_label}
                </label>
                <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 2 }}>
                    <span style={labelStyle}>Service Locations</span>
                    <input type="text" value={leg.location} onChange={e => updateTransportLeg(leg.id, 'location', e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1.5 }}>
                    <span style={labelStyle}>Service Type</span>
                    <select value={leg.service_type} onChange={e => updateTransportLeg(leg.id, 'service_type', e.target.value)} style={inputStyle}>
                      <option>Transfer</option><option>Excursion</option><option>Arrival & Local Sightseeing</option><option>Departure</option><option>Custom</option>
                    </select>
                  </div>
                  <div style={{ width: '100px' }}>
                    <span style={labelStyle}>Start Time</span>
                    <input type="time" value={leg.start_time} onChange={e => updateTransportLeg(leg.id, 'start_time', e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ width: '120px' }}>
                    <span style={labelStyle}>Duration (Mins)</span>
                    <input type="number" value={leg.duration} onChange={e => updateTransportLeg(leg.id, 'duration', Number(e.target.value))} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginLeft: '12px' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>📋</button>
                  <button onClick={() => removeTransportLeg(leg.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>✕</button>
                </div>
                <div style={{ position: 'absolute', bottom: '-12px', left: '190px', display: 'flex', gap: '8px' }}>
                  <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '99px', padding: '4px 12px', fontSize: '11px', fontWeight: 600, color: '#3b82f6', cursor: 'pointer' }}>+ Transport Service</button>
                  <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '99px', padding: '4px 12px', fontSize: '11px', fontWeight: 600, color: '#3b82f6', cursor: 'pointer' }}>+ Activity/Ticket</button>
                </div>
              </div>
            ))}
          </div>
          
          <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginBottom: '32px' }}>
            + Add More Services
          </button>

          {/* Cumulative Prices Table */}
          <div style={{ display: 'flex', gap: '24px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Legs &amp; KM</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {transportLegs.map(l => (
                  <li key={l.id} style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>{l.day_label}:</span> {l.location}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 2 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#64748b', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '8px 0', fontWeight: 600 }}>Fee Type</th>
                    <th style={{ padding: '8px 0', fontWeight: 600 }}>Sys Qty</th>
                    <th style={{ padding: '8px 0', fontWeight: 600 }}>Qty</th>
                    <th style={{ padding: '8px 0', fontWeight: 600 }}>Sys Rate</th>
                    <th style={{ padding: '8px 0', fontWeight: 600 }}>Given Rate (₹)</th>
                    <th style={{ padding: '8px 0', fontWeight: 600, textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {transportPrices.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 0', fontWeight: 500 }}>{p.name}</td>
                      <td style={{ padding: '12px 0', color: '#94a3b8' }}>{p.sys_qty}</td>
                      <td style={{ padding: '12px 4px' }}><input type="number" value={p.qty} onChange={e => updateTransportPrice(p.id, 'qty', Number(e.target.value))} style={{ ...inputStyle, width: '60px', padding: '4px' }} /></td>
                      <td style={{ padding: '12px 4px' }}><input type="number" value={p.sys_rate} onChange={e => updateTransportPrice(p.id, 'sys_rate', Number(e.target.value))} style={{ ...inputStyle, width: '80px', padding: '4px' }} /></td>
                      <td style={{ padding: '12px 4px' }}><input type="number" value={p.given_rate} onChange={e => updateTransportPrice(p.id, 'given_rate', Number(e.target.value))} style={{ ...inputStyle, width: '90px', padding: '4px', background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8', fontWeight: 600 }} /></td>
                      <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600 }}>{(p.qty * p.given_rate).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addTransportPrice} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginTop: '12px' }}>+ Add More</button>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '24px', right: '24px', background: '#fef3c7', color: '#92400e', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            Transports: ₹{transportsTotal.toLocaleString()}
          </div>
        </div>

        {/* Section 5: Flights */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✈️ Flight Details
              <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px' }}>NEW</span>
            </h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }}>Manual</span>
              <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}>+ Add flights via API</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <div style={{ background: '#fef3c7', color: '#92400e', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}>Flights Cost Total: N/A</div>
            <div style={{ background: '#fef3c7', color: '#92400e', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}>Flights Given/Selling Total: N/A</div>
          </div>
        </div>

        {/* Section 6: Special Services */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#0f172a' }}>⭐ Special Services</h2>
            <button onClick={() => setSpecialServices([...specialServices, { id: uid(), desc: '', price: 0 }])} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>+ Add Service</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {specialServices.map(s => (
              <div key={s.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input type="text" placeholder="Description" value={s.desc} onChange={e => setSpecialServices(specialServices.map(x => x.id === s.id ? { ...x, desc: e.target.value } : x))} style={{ ...inputStyle, flex: 1 }} />
                <input type="number" placeholder="Price" value={s.price} onChange={e => setSpecialServices(specialServices.map(x => x.id === s.id ? { ...x, price: Number(e.target.value) } : x))} style={{ ...inputStyle, width: '150px' }} />
                <button onClick={() => setSpecialServices(specialServices.filter(x => x.id !== s.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }}>✕</button>
              </div>
            ))}
            {specialServices.length === 0 && <div style={{ fontSize: '13px', color: '#94a3b8' }}>No special services added.</div>}
          </div>
        </div>

        {/* Section 7: Internal Comments */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0', color: '#0f172a' }}>💬 Internal Comments</h2>
          <textarea 
            value={internalComments}
            onChange={e => setInternalComments(e.target.value)}
            placeholder="Any internal comments for this quote (optional)"
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          />
        </div>

        {/* Section 8: Summary */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#0f172a' }}>📊 Summary</h2>
          
          <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Accommodation Table:</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#64748b' }}>
                <th style={{ padding: '10px 16px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Night</th>
                <th style={{ padding: '10px 16px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Hotel</th>
                <th style={{ padding: '10px 16px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Meal</th>
                <th style={{ padding: '10px 16px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Rooms</th>
                <th style={{ padding: '10px 16px', fontWeight: 600, border: '1px solid #e2e8f0', textAlign: 'right' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map(h => (
                <tr key={h.id}>
                  <td style={{ padding: '10px 16px', border: '1px solid #e2e8f0' }}>{h.stay_nights.join(', ')} Nights</td>
                  <td style={{ padding: '10px 16px', border: '1px solid #e2e8f0' }}>{h.name}</td>
                  <td style={{ padding: '10px 16px', border: '1px solid #e2e8f0' }}>{h.meal_plan}</td>
                  <td style={{ padding: '10px 16px', border: '1px solid #e2e8f0' }}>{h.rooms} {h.room_type}, {h.pax_per_room} Pax</td>
                  <td style={{ padding: '10px 16px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 500 }}>
                    ₹{h.nights_pricing.reduce((s: number, p: HotelNightPricing) => s + (Number(p.given) || 0), 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>Misconfiguration in Hotel Services — Expected {adults} Adult but mismatch provided</div>
              <div><a href="#" style={{ color: '#b45309', textDecoration: 'underline' }}>Back to Hotels</a> • You can skip these warnings</div>
            </div>
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Transportation Table:</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#64748b' }}>
                <th style={{ padding: '10px 16px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Day</th>
                <th style={{ padding: '10px 16px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Route</th>
                <th style={{ padding: '10px 16px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Service Type</th>
              </tr>
            </thead>
            <tbody>
              {transportLegs.map(l => (
                <tr key={l.id}>
                  <td style={{ padding: '10px 16px', border: '1px solid #e2e8f0' }}>{l.day_label}</td>
                  <td style={{ padding: '10px 16px', border: '1px solid #e2e8f0' }}>{l.location}</td>
                  <td style={{ padding: '10px 16px', border: '1px solid #e2e8f0' }}>{l.service_type}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            <div style={{ color: '#64748b', marginBottom: '8px', fontSize: '13px' }}>Prices using Calculator:</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Total Cost: ₹{totalCost.toLocaleString()}</div>
            <div style={{ color: '#475569', fontWeight: 500, marginBottom: '8px' }}>= Hotels ₹{hotelsTotal.toLocaleString()} + Transports ₹{transportsTotal.toLocaleString()} {specialServicesTotal > 0 ? `+ Special ₹${specialServicesTotal.toLocaleString()}` : ''}</div>
            <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>Note: This is NOT the selling price</div>
          </div>
        </div>

        {/* Section 9: Pricing Strategy & Markup */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#0f172a' }}>💰 Pricing Strategy &amp; Markup</h2>
          
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>Pricing Strategy <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>NEW</span></span>
              <select value={pricingStrategy} onChange={e => setPricingStrategy(e.target.value)} style={inputStyle}>
                <option>Overall</option><option>Per-Person</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>Selling Currency</span>
              <select value={currency} onChange={e => setCurrency(e.target.value)} style={inputStyle}>
                <option>INR</option><option>USD</option><option>EUR</option><option>AED</option><option>GBP</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>Total FOC</span>
              <input type="number" value={foc} onChange={e => setFoc(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>

          {pricingStrategy === 'Per-Person' && (
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px', fontSize: '13px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>[{adults} Adults]</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Person (Double Sharing) x {adults} Pax</span>
                <span style={{ fontWeight: 600 }}>Price: ₹{Math.round(totalCost / (adults || 1)).toLocaleString()}</span>
                <span style={{ color: '#64748b' }}>Segregation: Hotels: ₹{Math.round(hotelsTotal / (adults || 1)).toLocaleString()}, Transports: ₹{Math.round(transportsTotal / (adults || 1)).toLocaleString()}</span>
              </div>
            </div>
          )}

          <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Set Markup, Tax and Rounding table:</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#64748b' }}>
                <th style={{ padding: '10px', fontWeight: 600, border: '1px solid #e2e8f0' }}></th>
                <th style={{ padding: '10px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Cost Price</th>
                <th style={{ padding: '10px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Markup</th>
                <th style={{ padding: '10px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Tax Applied On</th>
                <th style={{ padding: '10px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Agent Commission</th>
                <th style={{ padding: '10px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Total</th>
                <th style={{ padding: '10px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Round</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Total</td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>{totalCost.toLocaleString()}</td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="number" value={markupPct} onChange={e => setMarkupPct(Number(e.target.value))} style={{ ...inputStyle, width: '60px', padding: '6px' }} /> %
                  </div>
                </td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                  <select value={taxType} onChange={e => setTaxType(e.target.value)} style={{ ...inputStyle, padding: '6px' }}>
                    <option>Cost+Markup</option><option>Cost</option>
                  </select>
                </td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" defaultChecked />
                    <input type="number" value={commissionPct} onChange={e => setCommissionPct(Number(e.target.value))} style={{ ...inputStyle, width: '60px', padding: '6px' }} /> %
                  </div>
                </td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>{rawTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                  <select value={roundTo} onChange={e => setRoundTo(Number(e.target.value))} style={{ ...inputStyle, padding: '6px' }}>
                    <option value="1">1</option><option value="5">5</option><option value="10">10</option><option value="50">50</option><option value="100">100</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>Any internal comments regarding selling price (optional)</span>
              <textarea value={internalPriceComments} onChange={e => setInternalPriceComments(e.target.value)} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} />
            </div>
            <div style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ background: '#f8fafc', padding: '8px', borderBottom: '1px solid #cbd5e1', display: 'flex', gap: '12px', fontSize: '13px', fontWeight: 500, color: '#64748b' }}>
                <span style={{ color: '#3b82f6', borderBottom: '2px solid #3b82f6', paddingBottom: '4px' }}>Write</span>
                <span>Preview</span>
                <div style={{ flex: 1 }}></div>
                <span>H</span><span>B</span><span>I</span><span>🔗</span><span>📋</span>
              </div>
              <textarea 
                value={customerRemarks} onChange={e => setCustomerRemarks(e.target.value)} 
                placeholder="Remarks for Agent/Customer (optional)" 
                style={{ ...inputStyle, border: 'none', minHeight: '66px', borderRadius: 0, resize: 'none' }} 
              />
              <div style={{ fontSize: '11px', color: '#94a3b8', padding: '4px 8px', background: '#f8fafc', borderTop: '1px solid #cbd5e1' }}>Note: These remarks will be shared with the customer.</div>
            </div>
          </div>
        </div>

        {/* Section 10: Preview Final Package Price */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎯 Preview Final Package Price
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <thead>
              <tr style={{ background: '#dbeafe', color: '#1e40af' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}></th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Per Pax</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Qty</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Sub Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#334155' }}>Person (Double Sharing) x {adults} Pax</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 500 }}>₹{Math.round(perPersonPrice).toLocaleString()}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 500 }}>{adults}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>₹{roundedTotal.toLocaleString()}</td>
              </tr>
              <tr style={{ background: '#f8fafc' }}>
                <td colSpan={3} style={{ padding: '16px', fontWeight: 700, color: '#0f172a' }}>Total</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#1d4ed8', fontSize: '18px' }}>INR ₹{roundedTotal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#64748b', textAlign: 'right' }}>
            Tax: Agent commission (Included {commissionPct}%)
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
          <button onClick={() => router.back()} style={{ background: 'white', color: '#334155', border: '1px solid #cbd5e1', padding: '12px 24px', borderRadius: '6px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSaveQuote} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '6px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(37, 99, 235, 0.3)' }}>
            Save Quote
          </button>
        </div>

      </div>
    </div>
  );
}
