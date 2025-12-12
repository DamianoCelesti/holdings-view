import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
    const [symbol, setSymbol] = useState('AAPL')
    const navigate = useNavigate()

    return (
        <div className="card">
            <h2>Search ticker</h2>

            <div className="input-row">
                <input
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                />
                <button onClick={() => navigate(`/ticker/${symbol}`)}>
                    Vai
                </button>
            </div>
        </div>
    )
}
