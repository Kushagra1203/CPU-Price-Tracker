"use client"

import useSWR from "swr"
import { useMemo, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FilterSidebar, type FilterState } from "@/components/filter-sidebar"
import { SortBar } from "@/components/sort-bar"
import { CPUTileGrid } from "@/components/cpu-grid"

type Offer = {
  store: string
  price: number
  url: string
  inStock: boolean
  lastSeen: string
}

type ApiCpu = {
  id: string
  brand: "Intel" | "AMD"
  model: string
  generation: string
  series: string
  cores: number
  threads: number
  baseClockGHz?: number
  boostClockGHz?: number
  tdpW?: number
  offers: Offer[]
  bestPrice: number
  generationRank: number
}

type ApiResponse = {
  cpus: ApiCpu[]
  updatedAt: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export type CPUOffer = {
  id: string
  brand: "Intel" | "AMD"
  model: string
  generation: string
  series: string
  cores: number
  threads: number
  baseClockGHz?: number
  boostClockGHz?: number
  tdpW?: number
  vendor: string
  priceUSD: number
  url: string
  inStock: boolean
  generationRank: number
}

export function CpuBrowser() {
  const { data, isLoading, mutate } = useSWR<ApiResponse>("/api/cpus", fetcher, { revalidateOnFocus: false })
  const cpus = data?.cpus ?? []

  // flatten CPUs into vendor-level offers (each vendor offer is a separate tile)
  const offers = useMemo<CPUOffer[]>(() => {
    const list: CPUOffer[] = []
    for (const c of cpus) {
      for (const o of c.offers) {
        const id = `${c.id}-${o.store.toLowerCase().replace(/\s+/g, "-")}`
        list.push({
          id,
          brand: c.brand,
          model: c.model,
          generation: c.generation,
          series: c.series,
          cores: c.cores,
          threads: c.threads,
          baseClockGHz: c.baseClockGHz,
          boostClockGHz: c.boostClockGHz,
          tdpW: c.tdpW,
          vendor: o.store,
          priceUSD: o.price,
          url: o.url,
          inStock: o.inStock,
          generationRank: c.generationRank,
        })
      }
    }
    return list
  }, [cpus])

  // build filter options from offers
  const allBrands = useMemo(() => Array.from(new Set(offers.map((o) => o.brand))).sort(), [offers])
  const allSeries = useMemo(() => Array.from(new Set(offers.map((o) => o.series))).sort(), [offers])
  const allVendors = useMemo(() => Array.from(new Set(offers.map((o) => o.vendor))).sort(), [offers])
  const allGenerations = useMemo(() => {
    const byGen = new Map<string, number>()
    for (const o of offers) {
      if (!byGen.has(o.generation)) byGen.set(o.generation, o.generationRank)
      else byGen.set(o.generation, Math.max(byGen.get(o.generation) ?? 0, o.generationRank))
    }
    return Array.from(byGen.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([g]) => g)
  }, [offers])

  const allCores = useMemo(() => Array.from(new Set(offers.map((o) => o.cores))).sort((a, b) => a - b), [offers])
  const allThreads = useMemo(() => Array.from(new Set(offers.map((o) => o.threads))).sort((a, b) => a - b), [offers])

  const priceBounds = useMemo<[number, number]>(() => {
    if (offers.length === 0) return [0, 0]
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY
    for (const o of offers) {
      if (o.priceUSD < min) min = o.priceUSD
      if (o.priceUSD > max) max = o.priceUSD
    }
    return [Math.floor(min), Math.ceil(max)]
  }, [offers])

  // filter state
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    generations: [],
    series: [],
    vendors: [],
    search: "",
    inStockOnly: false,
    minPrice: undefined,
    maxPrice: undefined,
    minBaseClockGHz: undefined,
    maxBaseClockGHz: undefined,
    minTdpW: undefined,
    maxTdpW: undefined,
    cores: [],
    threads: [],
  })

  const [sort, setSort] = useState<string>("price-asc")
  const [filtersOpen, setFiltersOpen] = useState(true)

  const filtered = useMemo(() => {
    let arr = offers.slice()

    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
    const qRaw = filters.search.trim()
    const q = norm(qRaw)
    if (q) {
      arr = arr.filter((o) => {
        const fields = [
          o.model,
          o.brand,
          o.series,
          o.generation,
          o.vendor,
          // include combined strings to help matching compact queries
          `${o.brand} ${o.model}`,
          `${o.series} ${o.model}`,
        ]
        return fields.some((f) => norm(f).includes(q))
      })
    }

    if (filters.brands.length) arr = arr.filter((o) => filters.brands.includes(o.brand))
    if (filters.generations.length) arr = arr.filter((o) => filters.generations.includes(o.generation))
    if (filters.series.length) arr = arr.filter((o) => filters.series.includes(o.series))
    if (filters.vendors.length) arr = arr.filter((o) => filters.vendors.includes(o.vendor))
    if (filters.inStockOnly) arr = arr.filter((o) => o.inStock)
    if (filters.minPrice !== undefined) arr = arr.filter((o) => o.priceUSD >= (filters.minPrice as number))
    if (filters.maxPrice !== undefined) arr = arr.filter((o) => o.priceUSD <= (filters.maxPrice as number))

    if (filters.minBaseClockGHz !== undefined)
      arr = arr.filter((o) => (o.baseClockGHz ?? Number.NEGATIVE_INFINITY) >= (filters.minBaseClockGHz as number))
    if (filters.maxBaseClockGHz !== undefined)
      arr = arr.filter((o) => (o.baseClockGHz ?? Number.POSITIVE_INFINITY) <= (filters.maxBaseClockGHz as number))
    if (filters.minTdpW !== undefined)
      arr = arr.filter((o) => (o.tdpW ?? Number.POSITIVE_INFINITY) >= (filters.minTdpW as number))
    if (filters.maxTdpW !== undefined)
      arr = arr.filter((o) => (o.tdpW ?? Number.NEGATIVE_INFINITY) <= (filters.maxTdpW as number))
    if (filters.cores.length) arr = arr.filter((o) => filters.cores.includes(o.cores))
    if (filters.threads.length) arr = arr.filter((o) => filters.threads.includes(o.threads))

    const [key, dir = "asc"] = sort.split("-") as [string, "asc" | "desc"]
    const factor = dir === "asc" ? 1 : -1
    arr.sort((a, b) => {
      if (key === "price") return (a.priceUSD - b.priceUSD) * factor
      if (key === "brand") return a.brand.localeCompare(b.brand) * factor
      if (key === "generation") return (a.generationRank - b.generationRank) * factor
      if (key === "series") return a.series.localeCompare(b.series) * factor
      return 0
    })

    return arr
  }, [offers, filters, sort])

  const resetAll = () =>
    setFilters({
      brands: [],
      generations: [],
      series: [],
      vendors: [],
      search: "",
      inStockOnly: false,
      minPrice: undefined,
      maxPrice: undefined,
      minBaseClockGHz: undefined,
      maxBaseClockGHz: undefined,
      minTdpW: undefined,
      maxTdpW: undefined,
      cores: [],
      threads: [],
    })

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [filters.search])

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start">
      <FilterSidebar
        allBrands={allBrands}
        allGenerations={allGenerations}
        allSeries={allSeries}
        allVendors={allVendors}
        allCores={allCores}
        allThreads={allThreads}
        priceRange={priceBounds}
        value={filters}
        onChange={setFilters}
        onReset={resetAll}
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen((v) => !v)}
      />

      <div className="flex-1 grid gap-3">
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <SortBar count={filtered.length} sort={sort} onSortChange={setSort} />
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" onClick={() => mutate()} aria-label="Refresh prices">
                {isLoading ? "Refreshing…" : "Refresh"}
              </Button>
              <Button variant="ghost" onClick={resetAll} aria-label="Reset filters">
                Reset
              </Button>
            </div>
          </div>
        </Card>

        <CPUTileGrid key={`${filters.search}|${sort}`} offers={filtered} />

        {data?.updatedAt && (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-600/10 text-blue-700 border-blue-600/20">
              Updated
            </Badge>
            {new Date(data.updatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}
