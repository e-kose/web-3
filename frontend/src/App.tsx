import { useState } from 'react'
import './App.css'
import { CreateProfile } from './components/CreateProfile'
import { ViewProfile } from './components/ViewProfile'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'

function App() {
  const [view, setView] = useState<'home' | 'create' | 'view'>('home')
  const account = useCurrentAccount()
  const [profileId, setProfileId] = useState<string | null>(null)

  return (
    <div className="app-container">
      <header className="header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>🌳 Walrus LinkTree</h1>
            <ConnectButton />
          </div>
          <nav>
            <button onClick={() => setView('home')}>Home</button>
            <button onClick={() => setView('create')}>Create Profile</button>
            <button onClick={() => setView('view')}>View Profile</button>
          </nav>
          {account && (
            <p style={{ fontSize: '0.9em', opacity: 0.8, marginTop: '0.5rem' }}>
              Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </p>
          )}
        </div>
      </header>

      <main className="main-content">
        {view === 'home' && (
          <section className="home-section">
            <h2>Welcome to On-Chain LinkTree</h2>
            <div className="features">
              <div className="feature-card">
                <h3>🔗 Decentralized</h3>
                <p>Store your links on-chain on the Sui blockchain</p>
              </div>
              <div className="feature-card">
                <h3>🚀 Hosted on Walrus</h3>
                <p>Your profile is hosted on Walrus decentralized storage</p>
              </div>
              <div className="feature-card">
                <h3>📛 Branded with SuiNS</h3>
                <p>Get a .sui domain name for your profile</p>
              </div>
            </div>
          </section>
        )}

        {view === 'create' && (
          <CreateProfile onProfileCreated={(id: string) => {
            setProfileId(id)
            setView('view')
          }} />
        )}

        {view === 'view' && profileId && (
          <ViewProfile profileId={profileId} />
        )}

        {view === 'view' && !profileId && (
          <section className="view-section">
            <h2>View Profile</h2>
            <p>Enter a Profile Object ID to view:</p>
            <div style={{ marginTop: '1rem' }}>
              <input
                type="text"
                placeholder="0x..."
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  width: '100%',
                  maxWidth: '500px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement
                    if (input.value.trim()) {
                      setProfileId(input.value.trim())
                    }
                  }
                }}
              />
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
                Or create a profile first to see it here automatically.
              </p>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2025 On-Chain LinkTree. Built for Sui Hackathon.</p>
      </footer>
    </div>
  )
}

export default App
