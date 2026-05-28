'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTripById } from '../../../lib/api';

type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
};

type Tag = {
  id: number;
  name: string;
  color: string;
};

type FollowUp = {
  id: number;
  due_date: string;
  note: string;
  is_completed: boolean;
  created_at: string;
  agent_details?: User;
};

type Trip = {
  id: number;
  primary_contact_name: string;
  phone: string;
  email: string;
  destination: string;
  start_date: string;
  no_of_nights: number;
  no_of_adults: number;
  no_of_children: number;
  salutation: string;
  status: string;
  assigned_agent_details?: User;
  tags_details?: Tag[];
  follow_ups?: FollowUp[];
  comments?: any[];
  reference_id?: string;
};

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getTripById(id)
      .then((res) => {
        setTrip(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch trip:', err);
        setLoading(false);
      });
  }, [id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const absDiffMs = Math.abs(diffMs);
    const diffMins = Math.floor(absDiffMs / (1000 * 60));
    const diffHrs = Math.floor(absDiffMs / (1000 * 60 * 60));
    
    let timeText = '';
    if (diffMins < 60) timeText = `a few seconds`;
    else if (diffHrs < 24) timeText = `${diffHrs} hours`;
    else timeText = `${Math.floor(diffHrs / 24)} days`;

    return diffMs > 0 ? `in ${timeText}` : `${timeText} ago`;
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading trip details...</div>;
  }

  if (!trip) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>Trip not found</div>;
  }

  const agentName = trip.assigned_agent_details?.first_name 
    ? `${trip.assigned_agent_details.first_name} ${trip.assigned_agent_details.last_name || ''}` 
    : 'Unassigned';

  const nights = trip.no_of_nights || 0;
  const days = nights > 0 ? nights + 1 : 0;
  const adults = trip.no_of_adults || 0;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#f1f5f9', minHeight: 'calc(100vh - 64px)', margin: '-24px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Breadcrumb */}
      <div style={{ padding: '24px 32px 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0f172a', padding: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '16px' }}>
          Trip Details
          <span style={{ fontSize: '14px', fontWeight: 400, color: '#94a3b8' }}>
            Trips <span style={{ margin: '0 4px' }}>&gt;</span> Current
          </span>
        </div>
      </div>

      <div style={{ padding: '0 32px 32px', display: 'flex', gap: '24px', flex: 1, alignItems: 'flex-start' }}>
        
        {/* Left Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Hero Header Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
              
              {/* Left Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                
                {/* Row 1 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                    #{trip.id} <span style={{ color: '#cbd5e1' }}>•</span> {trip.salutation || 'Mr.'} {trip.primary_contact_name} <span style={{ color: '#cbd5e1' }}>•</span> {trip.destination || 'TBD'} <span style={{ color: '#cbd5e1' }}>•</span> Direct Query
                    {trip.status === 'NEW' && (
                      <span style={{ marginLeft: '4px', padding: '2px 8px', fontSize: '12px', fontWeight: 600, background: '#e0f2fe', color: '#0284c7', borderRadius: '99px' }}>
                        New
                      </span>
                    )}
                  </div>
                  <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>
                </div>
                
                {/* Row 2 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📅 {formatDate(trip.start_date) || 'TBD'} <span style={{ color: '#cbd5e1' }}>•</span> {nights}N, {days}D
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    👥 {adults} Adult
                  </span>
                </div>
                
                {/* Row 3 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontSize: '14px', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    👤 {trip.salutation || 'Mr.'} {trip.primary_contact_name}
                  </span>
                  <span style={{ color: '#e2e8f0' }}>|</span>
                  <span>{trip.phone}</span>
                  <span style={{ color: '#e2e8f0' }}>|</span>
                  <span style={{ color: '#64748b' }}>({adults}A)</span>
                  <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: 0, marginLeft: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Right Side (Tags and Sales Team) */}
              <div style={{ display: 'flex', gap: '48px', minWidth: '300px' }}>
                {/* Tags Column */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Tags
                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {trip.tags_details && trip.tags_details.length > 0 ? (
                      trip.tags_details.map(tag => (
                        <span key={tag.id} style={{ padding: '2px 10px', fontSize: '12px', fontWeight: 500, backgroundColor: tag.color ? `${tag.color}15` : '#f1f5f9', color: tag.color || '#475569', borderRadius: '99px', border: `1px solid ${tag.color ? `${tag.color}30` : '#e2e8f0'}` }}>
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '13px', color: '#cbd5e1' }}>-</span>
                    )}
                  </div>
                </div>
                
                {/* Sales Team Column */}
                <div style={{ minWidth: '120px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Sales Team
                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                    {agentName}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons Row */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, fontSize: '14px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              Create Custom Quotation
            </button>
            <button style={{ background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              Request Package
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
          </div>

          {/* Main Body Content Placeholders */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 2, background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Quotation Builder Area Placeholder
            </div>
            <div style={{ flex: 1, background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Guest Info Placeholder
            </div>
          </div>

        </div>

        {/* Right Sidebar - Tasks & Comments */}
        <div style={{ width: '320px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#0f172a' }}>Tasks &amp; Comments</h2>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {trip.follow_ups && trip.follow_ups.length > 0 ? (
              trip.follow_ups.map((followup, idx) => (
                <div key={followup.id || idx} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                  <div style={{ marginTop: '2px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #cbd5e1', cursor: 'pointer', background: followup.is_completed ? '#3b82f6' : 'white', borderColor: followup.is_completed ? '#3b82f6' : '#cbd5e1' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#334155', fontWeight: 500, lineHeight: '1.4' }}>{followup.note}</p>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {formatRelativeTime(followup.due_date)} by {followup.agent_details?.first_name || agentName}
                    </span>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginTop: '20px' }}>
                No tasks or comments yet.
              </div>
            )}
            
            {/* Add Button */}
            <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#3b82f6', fontWeight: 500, fontSize: '14px', cursor: 'pointer', padding: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
