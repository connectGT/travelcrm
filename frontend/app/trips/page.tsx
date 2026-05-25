'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTrips } from '../../lib/api';

export default function TripsKanban() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrips()
      .then((res) => {
        setTrips(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch trips:', err);
        setLoading(false);
      });
  }, []);

  // For visual testing when DB is empty, use dummy data if real data is empty
  const displayTrips = trips.length > 0 ? trips : [
    { id: 1, primary_contact_name: 'John Doe', destination: 'Kashmir', start_date: '2024-05-12', end_date: '2024-05-18', status: 'NEW', assigned_agent_details: { first_name: 'Amit', last_name: 'K' } },
    { id: 2, primary_contact_name: 'Sarah Smith', destination: 'Bali', start_date: '2024-09-01', end_date: '2024-09-10', status: 'NEW', assigned_agent_details: { first_name: 'Jane', last_name: 'D' } },
    { id: 3, primary_contact_name: 'Tech Corp', destination: 'Goa', start_date: '2024-10-05', end_date: '2024-10-08', status: 'IN_PROGRESS', assigned_agent_details: { first_name: 'Amit', last_name: 'K' } },
    { id: 4, primary_contact_name: 'Michael Chang', destination: 'Swiss Alps', start_date: '2024-12-12', end_date: '2024-12-20', status: 'CONVERTED', assigned_agent_details: { first_name: 'Jane', last_name: 'D' } },
  ];

  const getInitials = (agent: any) => {
    if (!agent) return 'U';
    return `${agent.first_name?.[0] || ''}${agent.last_name?.[0] || ''}`.toUpperCase();
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Trips Pipeline</h1>
        <button className="btn-primary">+ New Lead</button>
      </div>

      <div className="kanban-board">
        {/* NEW Column */}
        <div className="kanban-column">
          <div className="kanban-column-header">
            <span>New Inquiries</span>
            <span className="kanban-badge">{displayTrips.filter(t => t.status === 'NEW').length}</span>
          </div>
          
          {displayTrips.filter(t => t.status === 'NEW').map(trip => (
            <Link key={trip.id} href={`/trips/${trip.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="kanban-card">
                <div className="kanban-card-title">{trip.primary_contact_name} to {trip.destination || 'TBD'}</div>
                <div className="kanban-card-subtitle">{trip.start_date || 'Dates TBD'} - {trip.end_date || 'Dates TBD'}</div>
                <div className="kanban-card-footer">
                  <span>New Lead</span>
                  <div className="agent-avatar">{getInitials(trip.assigned_agent_details)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* IN PROGRESS Column */}
        <div className="kanban-column">
          <div className="kanban-column-header">
            <span>In Progress (Quoted)</span>
            <span className="kanban-badge">{displayTrips.filter(t => t.status === 'IN_PROGRESS').length}</span>
          </div>
          
          {displayTrips.filter(t => t.status === 'IN_PROGRESS').map(trip => (
            <Link key={trip.id} href={`/trips/${trip.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="kanban-card">
                <div className="kanban-card-title">{trip.primary_contact_name} to {trip.destination || 'TBD'}</div>
                <div className="kanban-card-subtitle">{trip.start_date || 'Dates TBD'} - {trip.end_date || 'Dates TBD'}</div>
                <div className="kanban-card-footer">
                  <span>Quoted</span>
                  <div className="agent-avatar">{getInitials(trip.assigned_agent_details)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ON HOLD Column */}
        <div className="kanban-column">
          <div className="kanban-column-header">
            <span>On Hold</span>
            <span className="kanban-badge">0</span>
          </div>
        </div>

        {/* CONVERTED Column */}
        <div className="kanban-column">
          <div className="kanban-column-header">
            <span>Converted (Booked)</span>
            <span className="kanban-badge">{displayTrips.filter(t => t.status === 'CONVERTED').length}</span>
          </div>

          {displayTrips.filter(t => t.status === 'CONVERTED').map(trip => (
            <Link key={trip.id} href={`/trips/${trip.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="kanban-card" style={{ borderLeft: '3px solid #10b981' }}>
                <div className="kanban-card-title">{trip.primary_contact_name} to {trip.destination || 'TBD'}</div>
                <div className="kanban-card-subtitle">{trip.start_date || 'Dates TBD'} - {trip.end_date || 'Dates TBD'}</div>
                <div className="kanban-card-footer">
                  <span style={{ color: '#10b981', fontWeight: 500 }}>Deposit Paid</span>
                  <div className="agent-avatar">{getInitials(trip.assigned_agent_details)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* DROPPED Column */}
        <div className="kanban-column" style={{ opacity: 0.6 }}>
          <div className="kanban-column-header">
            <span>Dropped / Cancelled</span>
            <span className="kanban-badge">0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
