import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Travel CRM',
  description: 'Manage trips, bookings, and accounting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar" style={{ background: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '64px', color: 'white', borderBottom: '1px solid #1e293b' }}>
          {/* Left section: Logo and Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div className="nav-links" style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: 500 }}>
              <Link href="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Dashboard</Link>
              <div className="nav-dropdown">
                <span className="nav-dropdown-trigger" style={{ color: 'white', cursor: 'pointer' }}>Trips ▾</span>
                <div className="nav-dropdown-menu">
                  <Link href="/trips">Trips Pipeline</Link>
                  <Link href="/requests">Trip Plan Requests</Link>
                  <Link href="/reports">Sales Report</Link>
                </div>
              </div>
              <Link href="/bookings" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Bookings</Link>
              <Link href="/accounting" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Accounting</Link>
              <Link href="/contacts" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Contacts</Link>
              <Link href="/settings" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Settings</Link>
            </div>
          </div>

          {/* Center section: Search Bar */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 24px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '10px' }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" placeholder="Search for trips..." style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 16px 8px 36px', color: 'white', fontSize: '14px', outline: 'none' }} />
            </div>
          </div>

          {/* Right section: Actions and Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px' }}>
            <div style={{ display: 'flex', gap: '16px', color: '#cbd5e1', fontWeight: 500 }}>
              <Link href="#" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Services</Link>
              <Link href="#" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Suppliers</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ cursor: 'pointer', fontSize: '18px' }}>🔔</span>
              <button style={{ background: '#fef08a', color: '#854d0e', border: 'none', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>What's New</button>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontWeight: 600, fontSize: '14px' }}>
                GT
              </div>
            </div>
          </div>
        </nav>
        <main className="dashboard-container">
          {children}
        </main>
      </body>
    </html>
  )
}
