import AdminPage from './pages/AdminPage'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <img src="/logo-small.png" alt="Moltworker" className="header-logo" />
        <h1>Samwise 🥔</h1>
        <p style={{ fontSize: '0.9em', opacity: 0.8, margin: '0.25rem 0 0 0' }}>
          Moltbot Admin
        </p>
      </header>
      <main className="app-main">
        <AdminPage />
      </main>
    </div>
  )
}
