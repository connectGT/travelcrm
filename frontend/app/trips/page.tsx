'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getTrips } from '../../lib/api';

type Agent = { first_name?: string; last_name?: string };
type Tag = { id: number; name: string; color: string };
type Trip = {
  id: number;
  primary_contact_name: string;
  source?: string;
  phone?: string;
  email?: string;
  destination?: string;
  start_date?: string;
  no_of_nights?: number;
  no_of_adults?: number;
  no_of_children?: number;
  status: string;
  assigned_agent_details?: Agent;
  tags_details?: Tag[];
  created_at?: string;
};

const STATUSES = [
  { label: 'New Query', value: 'NEW' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'On Hold', value: 'ON_HOLD' },
  { label: 'Converted', value: 'CONVERTED' },
  { label: 'On Trip', value: 'ON_TRIP' },
  { label: 'Past Trips', value: 'PAST_TRIP' },
  { label: 'Canceled', value: 'CANCELLED' },
  { label: 'Dropped', value: 'DROPPED' },
  { label: 'All', value: 'ALL' },
];

function TripsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'NEW';

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTrips = (statusFilter: string) => {
    setLoading(true);
    const params: any = {};
    if (statusFilter !== 'ALL') {
      params.status = statusFilter;
    }
    
    getTrips(params)
      .then((res) => {
        setTrips(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch trips:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrips(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = (statusValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', statusValue);
    router.push(pathname + '?' + params.toString());
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return 'just now';
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} days ago`;
  };

  const filteredTrips = trips.filter(trip => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return trip.id.toString().includes(q) || 
           (trip.primary_contact_name && trip.primary_contact_name.toLowerCase().includes(q)) ||
           (trip.phone && trip.phone.includes(q));
  });

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: '#f8fafc', margin: '-24px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Left Sidebar */}
      <aside style={{ width: '220px', borderRight: '1px solid #e2e8f0', background: 'white', padding: '16px 0', flexShrink: 0 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {STATUSES.map((status) => {
            const isActive = currentStatus.toUpperCase() === status.value.toUpperCase();
            return (
              <li key={status.value}>
                <button
                  onClick={() => handleStatusChange(status.value)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 24px',
                    background: isActive ? '#f0f9ff' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
                    color: isActive ? '#1e40af' : '#475569',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  {status.label}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Trips</h1>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '10px' }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search by id, guest, phone numbers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  padding: '8px 16px 8px 36px', 
                  borderRadius: '6px', 
                  border: '1px solid #cbd5e1', 
                  width: '320px',
                  fontSize: '14px',
                  outline: 'none'
                }} 
              />
            </div>
            
            <button style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </button>
            
            <button className="btn-primary" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>
              Add New Query
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Table Subheader */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
              Showing {filteredTrips.length > 0 ? 1 : 0} - {filteredTrips.length} of {filteredTrips.length} Items
              <button onClick={() => fetchTrips(currentStatus)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button style={{ background: 'none', border: 'none', color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                Sort By
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 15l5 5 5-5"></path>
                  <path d="M7 9l5-5 5 5"></path>
                </svg>
              </button>
              <button style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '16px 24px', fontWeight: 600 }}>ID</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600 }}>Contact</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600 }}>Details</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600 }}>Team</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600 }}>Tags</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600 }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                      Loading trips...
                    </td>
                  </tr>
                ) : filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                      No trips found for this status.
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((trip) => (
                    <tr key={trip.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '16px 24px' }}>
                        <Link href={`/trips/${trip.id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {trip.id}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </Link>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>{trip.source || 'Direct Lead'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
                          {trip.primary_contact_name}
                          {trip.phone && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" title={trip.phone}>
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                          )}
                          {trip.email && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" title={trip.email}>
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '4px' }}>{trip.destination || 'Destination TBD'}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {formatDate(trip.start_date)} {trip.start_date && '•'} {trip.no_of_nights || 0}N {trip.no_of_adults || 0}A, {trip.no_of_children || 0}C
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '4px' }}>
                          {trip.assigned_agent_details?.first_name 
                            ? `${trip.assigned_agent_details.first_name} ${trip.assigned_agent_details.last_name || ''}` 
                            : 'Unassigned'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {trip.created_at ? formatRelativeTime(trip.created_at) : ''}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {trip.tags_details && trip.tags_details.length > 0 ? (
                            trip.tags_details.map((tag) => (
                              <span key={tag.id} style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                padding: '2px 8px', 
                                borderRadius: '99px', 
                                fontSize: '12px', 
                                fontWeight: 500, 
                                backgroundColor: tag.color ? `${tag.color}20` : '#f1f5f9', 
                                color: tag.color || '#475569',
                                border: `1px solid ${tag.color ? `${tag.color}40` : '#cbd5e1'}` 
                              }}>
                                {tag.name}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>-</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TripsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px' }}>Loading trips...</div>}>
      <TripsContent />
    </Suspense>
  );
}
