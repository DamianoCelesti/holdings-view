import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Ticker from './pages/Ticker'

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>holdings-view</h1>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ticker/:symbol" element={<Ticker />} />
      </Routes>
    </div>
  )
}
