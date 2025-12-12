import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function HoldersChart({ holders = [] }) {
    if (!holders.length) return <p className="muted">No data</p>

    const data = holders.map(h => ({
        name: h.name,
        value: h.pct
    }))

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                    <XAxis type="number" unit="%" />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="value" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
