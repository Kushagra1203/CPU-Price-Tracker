"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getVendorColor } from "@/lib/vendor-colors" // use vendor color mapping

export type PricePoint = { date: string; price: number }
export type Series = { vendor: string; brand: string; data: PricePoint[] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {formatINR(entry.value)}
        </p>
      ))}
    </div>
  )
}

const formatINR = (v: number) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(v || 0))}`

export function PriceHistoryChart({ series }: { series: Series[] }) {
  const data = useMemo(() => {
    const map = new Map<string, Record<string, any>>()
    for (const s of series) {
      for (const p of s.data) {
        const row = map.get(p.date) ?? { date: p.date }
        row[s.vendor] = p.price
        map.set(p.date, row)
      }
    }
    return Array.from(map.values()).sort((a, b) => (a.date < b.date ? -1 : 1))
  }, [series])

  if (!series || series.length === 0) {
    return (
      <div className="w-full h-[220px] md:h-[260px] flex items-center justify-center text-sm text-muted-foreground rounded-md border border-border">
        No price history available.
      </div>
    )
  }

  const colorFor = (vendor: string) => getVendorColor(vendor)

  return (
    <div className="w-full h-[380px] md:h-[460px] recharts-axis-beige">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tick={{ fill: "#fff1d0" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tick={{ fill: "#fff1d0" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            tickFormatter={(v) => formatINR(Number(v))}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          {series.map((s) => (
            <Line
              key={s.vendor}
              type="monotone"
              dataKey={s.vendor}
              stroke={getVendorColor(s.vendor)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
