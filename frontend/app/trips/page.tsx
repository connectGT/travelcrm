import Link from 'next/link';

export default function TripsKanban() {
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
            <span className="kanban-badge">2</span>
          </div>
          
          <Link href="/trips/1" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="kanban-card">
              <div className="kanban-card-title">Family of 4 to Kashmir</div>
              <div className="kanban-card-subtitle">John Doe • May 12 - May 18</div>
              <div className="kanban-card-footer">
                <span>Created today</span>
                <div className="agent-avatar">AK</div>
              </div>
            </div>
          </Link>

          <Link href="/trips/2" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="kanban-card">
              <div className="kanban-card-title">Honeymoon in Bali</div>
              <div className="kanban-card-subtitle">Sarah Smith • Sep 1 - Sep 10</div>
              <div className="kanban-card-footer">
                <span>Created yesterday</span>
                <div className="agent-avatar">JD</div>
              </div>
            </div>
          </Link>
        </div>

        {/* IN PROGRESS Column */}
        <div className="kanban-column">
          <div className="kanban-column-header">
            <span>In Progress (Quoted)</span>
            <span className="kanban-badge">1</span>
          </div>
          
          <Link href="/trips/3" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="kanban-card">
              <div className="kanban-card-title">Corporate Retreat</div>
              <div className="kanban-card-subtitle">Tech Corp • Oct 5 - Oct 8</div>
              <div className="kanban-card-footer">
                <span>Follow-up: Tomorrow</span>
                <div className="agent-avatar">AK</div>
              </div>
            </div>
          </Link>
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
            <span className="kanban-badge">1</span>
          </div>

          <Link href="/trips/4" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="kanban-card" style={{ borderLeft: '3px solid #10b981' }}>
              <div className="kanban-card-title">Swiss Alps Ski Trip</div>
              <div className="kanban-card-subtitle">Michael Chang • Dec 12 - Dec 20</div>
              <div className="kanban-card-footer">
                <span style={{ color: '#10b981', fontWeight: 500 }}>Deposit Paid</span>
                <div className="agent-avatar">JD</div>
              </div>
            </div>
          </Link>
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
