import Link from 'next/link';

export default function QuoteBuilder() {
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link href="/trips/1" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Trip
        </Link>
      </div>

      <div className="profile-header">
        <div>
          <h1 className="profile-name">Build Quote</h1>
          <div className="profile-meta">
            <span>Trip: John Doe to Kashmir</span>
            <span>Pax: 2 Adults, 2 Children</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" style={{ backgroundColor: '#fff', color: '#1f2937', border: '1px solid #e5e7eb' }}>
            Save Draft
          </button>
          <button className="btn-primary" style={{ backgroundColor: '#10b981' }}>
            Generate PDF
          </button>
        </div>
      </div>

      <div className="quote-grid">
        {/* Left Side: Variants Builder */}
        <div>
          <div className="profile-tabs" style={{ marginBottom: '16px' }}>
            <div className="profile-tab active">Option A: 3-Star (Standard)</div>
            <div className="profile-tab">Option B: 4-Star (Premium)</div>
            <div className="profile-tab" style={{ color: 'var(--accent-blue-text)' }}>+ Add Variant</div>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>🏨 Hotels</h3>
            
            <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500 }}>Hotel Royal Srinagar</span>
                <span style={{ fontWeight: 600 }}>₹ 12,000</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                May 12 - May 14 • 2 Nights • Deluxe Room
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', backgroundColor: '#f3f4f6', color: '#1f2937', marginTop: '8px' }}>
              + Add Hotel Stay
            </button>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>🚕 Transport & Activities</h3>
            
            <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500 }}>Srinagar Airport Pickup (Innova)</span>
                <span style={{ fontWeight: 600 }}>₹ 2,500</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                May 12 • Cab Transfer
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', backgroundColor: '#f3f4f6', color: '#1f2937', marginTop: '8px' }}>
              + Add Transport/Activity
            </button>
          </div>
        </div>

        {/* Right Side: Pricing Engine */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '24px' }}>
            <h2 className="card-title">Pricing Engine</h2>
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Net Price:</span>
                <span style={{ fontWeight: 600 }}>₹ 14,500</span>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Markup %</label>
                <input type="number" className="form-input" defaultValue="15" />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Markup Amount:</span>
                <span style={{ fontWeight: 600 }}>₹ 2,175</span>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">GST % (on Markup)</label>
                <input type="number" className="form-input" defaultValue="18" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>GST Amount:</span>
                <span style={{ fontWeight: 600 }}>₹ 391.50</span>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '8px 0' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, color: 'var(--nav-bg)' }}>
                <span>Grand Total:</span>
                <span>₹ 17,066.50</span>
              </div>

              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '6px', border: '1px solid #10b981' }}>
                <div style={{ fontWeight: 600, color: '#065f46', marginBottom: '8px' }}>Agent Profit</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#047857' }}>₹ 2,175</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
