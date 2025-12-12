import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../shared/api'
import HoldersChart from '../shared/HoldersChart'

export default function Ticker() {
    const { symbol } = useParams()
    const [data, setData] = useState(null)

    useEffect(() => {
        api.getHolders(symbol).then(setData)
    }, [symbol])

    if (!data) return <p>Loading...</p>

    return (
        <div className="card">
            <h2>{symbol} – Holdings</h2>
            <HoldersChart holders={data.holders} />
        </div>
    )
}
