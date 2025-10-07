"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getVendorColor } from "@/lib/vendor-colors" // use vendor color mapping

export type PricePoint = { date: string; price: number }
export type Series = { vendor: string; brand: string; data: PricePoint[] }

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

  const formatINR = (v: number) =>
    `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(v || 0))}`

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
          <Tooltip
            contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))", fill: "hsl(var(--muted-foreground))" }} />
          {series.map((s) => (
            <Line
              key={s.vendor}
              type="monotone"
              dataKey={s.vendor}
              stroke={getVendorColor(s.vendor)} // ensure vendor color applied to each line
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
