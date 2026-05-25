export default function Dashboard() {
  return (
    <>
      <div className="dashboard-grid">
        {/* Trip Sales Stats */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Trip Sales Stats</h2>
            <div className="tabs">
              <span className="tab active">Today</span>
              <span className="tab">Week</span>
              <span className="tab">Month</span>
            </div>
          </div>
          <div className="stats-grid">
            <div>
              <div className="stat-label">Revenue</div>
              <div className="stat-value">
                <span className="stat-currency">AED</span> 15,277 +
              </div>
              <div className="stat-value" style={{ marginTop: '8px', fontSize: '18px' }}>
                <span className="stat-currency">INR</span> 2,76,050
              </div>
            </div>
            <div>
              <div className="stat-label">Leads</div>
              <div className="stat-value">4</div>
            </div>
            <div>
              <div className="stat-label">Quotes</div>
              <div className="stat-value">9</div>
            </div>
            <div>
              <div className="stat-label">Conversion</div>
              <div className="stat-value">4</div>
            </div>
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Pending Follow-ups</h2>
          </div>
          <div className="flex-row" style={{ justifyContent: 'flex-start', gap: '40px' }}>
            <div>
              <div className="sub-section-title">Today</div>
              <div style={{ color: 'green', fontSize: '18px' }}>✓</div>
            </div>
            <div>
              <div className="sub-section-title">Yesterday</div>
              <div style={{ color: 'green', fontSize: '18px' }}>✓</div>
            </div>
            <div>
              <div className="sub-section-title">Next 7 Days</div>
              <div style={{ color: 'green', fontSize: '18px' }}>✓</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-bottom">
        {/* Payments Due Incoming */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '20px' }}>Payments</h2>
          <div className="sub-section-title">Due Incoming</div>
          <div className="sub-section" style={{ marginTop: '16px' }}>
            <div className="stat-label">Today ›</div>
            <div className="stat-value"><span className="stat-currency">INR</span> 2,52,785.23 +</div>
            <div className="stat-value" style={{ fontSize: '18px' }}><span className="stat-currency">TRY</span> 25.38</div>
          </div>
          <div className="sub-section">
            <div className="stat-label">Yesterday ›</div>
            <div className="stat-value"><span className="stat-currency">USD</span> 1,498 +</div>
            <div className="stat-value" style={{ fontSize: '18px' }}><span className="stat-currency">INR</span> 2,61,974.44 +</div>
            <div className="stat-value" style={{ fontSize: '18px' }}><span className="stat-currency">AED</span> 7,639</div>
          </div>
        </div>

        {/* Payments Due Outgoing */}
        <div className="card" style={{ marginTop: '40px' }}>
          <div className="sub-section-title">Due Outgoing</div>
          <div className="sub-section" style={{ marginTop: '16px' }}>
            <div className="stat-label">Today ›</div>
            <div className="stat-value">
              <span className="stat-currency">INR</span> 26,560 + <span className="stat-currency" style={{ marginLeft: '8px' }}>AED</span> 25
            </div>
          </div>
          <div className="sub-section">
            <div className="stat-label">Yesterday ›</div>
            <div className="stat-value">
              <span className="stat-currency">INR</span> 57,580 + <span className="stat-currency" style={{ marginLeft: '8px' }}>TZS</span> 4,000
            </div>
          </div>
        </div>

        {/* Trips Starting */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '20px' }}>Trip Starting and Endings</h2>
          <div className="sub-section-title">Trips Starting</div>
          <div className="flex-row" style={{ marginTop: '16px', justifyContent: 'flex-start', gap: '40px' }}>
            <div>
              <div className="stat-label">Today ›</div>
              <div className="stat-value">6</div>
            </div>
            <div>
              <div className="stat-label">Yesterday ›</div>
              <div className="stat-value">10</div>
            </div>
          </div>
          <div className="sub-section" style={{ marginTop: '16px' }}>
            <div className="stat-label">Next 7 Days ›</div>
            <div className="stat-value">30</div>
          </div>
        </div>

        {/* Trips Ending */}
        <div className="card" style={{ marginTop: '40px' }}>
          <div className="sub-section-title">Trips Ending</div>
          <div className="flex-row" style={{ marginTop: '16px', justifyContent: 'flex-start', gap: '40px' }}>
            <div>
              <div className="stat-label">Today ›</div>
              <div className="stat-value">5</div>
            </div>
            <div>
              <div className="stat-label">Tomorrow ›</div>
              <div className="stat-value">8</div>
            </div>
          </div>
          <div className="sub-section" style={{ marginTop: '16px' }}>
            <div className="stat-label">Prev 7 Days ›</div>
            <div className="stat-value">55</div>
          </div>
        </div>
      </div>
    </>
  )
}
