export default function SettingsPlaceholder() {
  return (
    <div style={{ padding: '20px' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-main)' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>This page is currently under construction. Please check back later!</p>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>⚙️</div>
        <a href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Back to Home</a>
      </div>
    </div>
  );
}
