'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

interface ABBarChartProps {
  data: Array<{ metric: string; A: number; B: number; unit?: string }>
  labelA: string
  labelB: string
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; dataKey: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-3 py-2.5 text-xs shadow-2xl" style={{ background: '#0f0f1e', border: '1px solid rgba(124,58,237,0.3)' }}>
        <p className="font-semibold text-slate-200 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.dataKey === 'A' ? '#a78bfa' : '#06b6d4' }}>
            {p.name}: {p.value.toFixed(3)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ABBarChart({ data, labelA, labelB }: ABBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="metric"
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="A" name={labelA} fill="#7c3aed" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill="#7c3aed" fillOpacity={0.85} />
          ))}
        </Bar>
        <Bar dataKey="B" name={labelB} fill="#06b6d4" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill="#06b6d4" fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
