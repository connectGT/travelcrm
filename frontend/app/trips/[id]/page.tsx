import Link from 'next/link';

export default function TripProfile({ params }: { params: { id: string } }) {
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link href="/trips" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Trips
        </Link>
      </div>

      <div className="profile-header">
        <div>
          <h1 className="profile-name">John Doe <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>#TRP-{params.id}</span></h1>
          <div className="profile-meta">
            <span>🌍 To: Kashmir</span>
            <span>📅 May 12 - May 18</span>
            <span>👥 4 Pax (2A, 2C)</span>
            <span className="kanban-badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Status: Quoted</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" style={{ backgroundColor: '#fff', color: '#1f2937', border: '1px solid #e5e7eb' }}>
            Add Follow-up
          </button>
          <button className="btn-primary">
            Create Quote
          </button>
        </div>
      </div>

      <div className="profile-tabs">
        <div className="profile-tab active">Details & Companions</div>
        <div className="profile-tab">Quotes (2)</div>
        <div className="profile-tab">Follow-ups (3)</div>
        <div className="profile-tab">Files</div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Primary Contact</h2>
          </div>
          <div className="sub-section">
            <div className="stat-label">Email</div>
            <div style={{ fontWeight: 500 }}>john.doe@example.com</div>
          </div>
          <div className="sub-section">
            <div className="stat-label">Phone</div>
            <div style={{ fontWeight: 500 }}>+91 98765 43210</div>
          </div>
          <div className="sub-section">
            <div className="stat-label">Assigned Agent</div>
            <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="agent-avatar">AK</div>
              Amit Kumar
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Companions (3)</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Jane Doe</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Relation: Wife • Veg Preference</div>
            </div>
            <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Tommy Doe</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Relation: Child (8y)</div>
            </div>
            <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Lily Doe</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Relation: Child (5y)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
