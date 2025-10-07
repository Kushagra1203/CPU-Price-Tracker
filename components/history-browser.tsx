"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import { PriceHistoryChart, type Series } from "@/components/charts/price-history"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Offer = {
  id: string
  slug: string
  brand: string
  series: string
  model: string
  vendor: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function HistoryBrowser() {
  const { data: cpus } = useSWR<{ offers: Offer[] }>("/api/cpus", fetcher)
  const [slug, setSlug] = useState<string | undefined>(undefined)
  const products = useMemo(() => {
    const bySlug = new Map<string, { slug: string; label: string }>()
    cpus?.offers.forEach((o) => {
      const label = `${o.brand} ${o.series} ${o.model}`
      if (!bySlug.has(o.slug)) bySlug.set(o.slug, { slug: o.slug, label })
    })
    return Array.from(bySlug.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [cpus])

  const vendorsForSelected = useMemo(() => {
    if (!slug || !cpus?.offers) return []
    const vendors = Array.from(new Set(cpus.offers.filter((o) => o.slug === slug).map((o) => o.vendor)))
    return vendors.sort()
  }, [cpus, slug])

  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const toggleVendor = (v: string) =>
    setSelectedVendors((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))

  const vendorsQuery = selectedVendors.length ? `&vendors=${encodeURIComponent(selectedVendors.join(","))}` : ""
  const { data: history } = useSWR<{ kind: string; title: string; series: Series[] }>(
    slug ? `/api/history?slug=${encodeURIComponent(slug)}${vendorsQuery}` : null,
    fetcher,
  )

  const reset = () => {
    setSlug(undefined)
    setSelectedVendors([])
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-card/80 backdrop-blur border-border">
        <CardHeader>
          <CardTitle className="text-pretty">Price History</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cpu">Product</Label>
              <Select onValueChange={setSlug} value={slug}>
                <SelectTrigger id="cpu" className="bg-background">
                  <SelectValue placeholder="Select a CPU" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.slug} value={p.slug}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Vendors</Label>
              <div className="flex flex-wrap gap-3">
                {vendorsForSelected.map((v) => (
                  <label key={v} className="inline-flex items-center gap-2">
                    <Checkbox checked={selectedVendors.includes(v)} onCheckedChange={() => toggleVendor(v)} />
                    <span className="text-sm text-muted-foreground">{v}</span>
                  </label>
                ))}
                {!vendorsForSelected.length && <span className="text-sm text-muted-foreground">Select a product</span>}
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={reset}>
                Reset
              </Button>
              {history?.title && (
                <Badge variant="outline" className="ml-auto">
                  {history.title}
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-2">
            {history?.series?.length ? (
              <PriceHistoryChart series={history.series} />
            ) : (
              <div className="text-sm text-muted-foreground">Choose a product to view its price history.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
