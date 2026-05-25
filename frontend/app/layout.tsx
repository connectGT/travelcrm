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
        <nav className="navbar">
          <div className="nav-left">
            <div className="nav-logo">
              {/* Using a simple globe/bird placeholder icon for logo */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div className="nav-links">
              <Link href="/">Dashboard</Link>
              <Link href="/trips" className="active">Trips</Link>
              <Link href="#">Bookings</Link>
              <Link href="#">Accounting</Link>
            </div>
            <input type="text" className="nav-search" placeholder="Search for trips..." />
          </div>
          <div className="nav-right">
            <div className="nav-links">
              <Link href="#">Services</Link>
              <Link href="#">Suppliers</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ cursor: 'pointer' }}>🔔</span>
              <button className="btn-whats-new">What&apos;s New</button>
              <span style={{ cursor: 'pointer' }}>🏠</span>
              <span style={{ cursor: 'pointer' }}>👤</span>
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
