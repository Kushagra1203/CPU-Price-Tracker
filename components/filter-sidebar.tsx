"use client"

import { useMemo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ListFilter, ChevronLeft, ChevronRight } from "lucide-react"

export type FilterState = {
  brands: string[]
  generations: string[]
  series: string[]
  vendors: string[]
  search: string
  inStockOnly: boolean
  minPrice?: number
  maxPrice?: number
  // Specs
  minBaseClockGHz?: number
  maxBaseClockGHz?: number
  minTdpW?: number
  maxTdpW?: number
  cores: number[]
  threads: number[]
}

type Props = {
  allBrands: string[]
  allGenerations: string[]
  allSeries: string[]
  allVendors: string[]
  allCores: number[]
  allThreads: number[]
  priceRange: [number, number]
  value: FilterState
  onChange: (next: FilterState) => void
  onReset: () => void
  isOpen?: boolean
  onToggle?: () => void
}

export function FilterSidebar({
  allBrands,
  allGenerations,
  allSeries,
  allVendors,
  allCores,
  allThreads,
  priceRange,
  value,
  onChange,
  onReset,
  isOpen = true,
  onToggle,
}: Props) {
  const toggle = (key: keyof FilterState, item: string) => {
    const arr = new Set([...(value[key] as string[])])
    if (arr.has(item)) arr.delete(item)
    else arr.add(item)
    onChange({ ...value, [key]: Array.from(arr) })
  }

  const toggleNum = (key: "cores" | "threads", n: number) => {
    const set = new Set([...(value[key] as number[])])
    if (set.has(n)) set.delete(n)
    else set.add(n)
    onChange({ ...value, [key]: Array.from(set).sort((a, b) => a - b) })
  }

  const setSearch = (s: string) => onChange({ ...value, search: s })
  const setInStock = (checked: boolean) => onChange({ ...value, inStockOnly: checked })

  const hasActiveFilters = useMemo(() => {
    const {
      brands,
      generations,
      series,
      vendors,
      search,
      inStockOnly,
      minPrice,
      maxPrice,
      minBaseClockGHz,
      maxBaseClockGHz,
      minTdpW,
      maxTdpW,
      cores,
      threads,
    } = value
    return (
      brands.length ||
      generations.length ||
      series.length ||
      vendors.length ||
      !!search ||
      inStockOnly ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      minBaseClockGHz !== undefined ||
      maxBaseClockGHz !== undefined ||
      minTdpW !== undefined ||
      maxTdpW !== undefined ||
      cores.length > 0 ||
      threads.length > 0
    )
  }, [value])

  const baseRange: [number, number] = [0.5, 6]
  const tdpRange: [number, number] = [15, 300]
  const baseMin = value.minBaseClockGHz ?? baseRange[0]
  const baseMax = value.maxBaseClockGHz ?? baseRange[1]
  const tdpMin = value.minTdpW ?? tdpRange[0]
  const tdpMax = value.maxTdpW ?? tdpRange[1]

  const priceMinBound = priceRange[0]
  const priceMaxBound = priceRange[1]
  const priceMin = value.minPrice ?? priceMinBound
  const priceMax = value.maxPrice ?? priceMaxBound

  const asideClasses = isOpen
    ? "w-full md:w-64 shrink-0 md:sticky md:top-4 border-b md:border-b-0 md:border-r border-border p-4 md:p-6 bg-background/60"
    : "w-10 shrink-0 md:sticky md:top-4 border-b md:border-b-0 md:border-r border-border p-2 bg-background/60 flex items-center justify-center"

  return (
    <aside className={asideClasses}>
      {isOpen ? (
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Filters</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onReset} disabled={!hasActiveFilters}>
              Reset
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              aria-label="Collapse filters"
              title="Collapse filters"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label="Expand filters"
          title="Expand filters"
          className="rounded-md"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {isOpen && (
        <div className="mt-4 grid gap-4 md:max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
          <div className="grid gap-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="e.g. 7800X3D"
              value={value.search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Separator />

          <section className="grid gap-2">
            <Label className="text-xs">Price (₹)</Label>
            <Slider
              value={[priceMin, priceMax]}
              min={priceMinBound}
              max={priceMaxBound}
              step={100}
              onValueChange={([min, max]) =>
                onChange({
                  ...value,
                  minPrice: min,
                  maxPrice: max,
                })
              }
              aria-label="Price range"
              className="mt-1"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {`₹${priceMin.toLocaleString("en-IN")} — ₹${priceMax.toLocaleString("en-IN")}`}
            </div>
          </section>

          <Separator />

          <section className="grid gap-2">
            <Label>Brand</Label>
            <div className="grid gap-2">
              {allBrands.map((b) => (
                <label key={b} className="flex items-center gap-2">
                  <Checkbox
                    checked={value.brands.includes(b)}
                    onCheckedChange={() => toggle("brands", b)}
                    aria-label={`Filter by ${b}`}
                  />
                  <span className="text-sm text-muted-foreground">{b}</span>
                </label>
              ))}
            </div>
          </section>

          <Accordion type="multiple" defaultValue={[]} className="w-full">
            <AccordionItem value="generation">
              <AccordionTrigger className="text-sm">Generation</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2 pt-1">
                  {allGenerations.map((g) => (
                    <label key={g} className="flex items-center gap-2">
                      <Checkbox
                        checked={value.generations.includes(g)}
                        onCheckedChange={() => toggle("generations", g)}
                        aria-label={`Filter by ${g}`}
                      />
                      <span className="text-sm text-muted-foreground">{g}</span>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="series">
              <AccordionTrigger className="text-sm">Series</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2 pt-1">
                  {allSeries.map((s) => (
                    <label key={s} className="flex items-center gap-2">
                      <Checkbox
                        checked={value.series.includes(s)}
                        onCheckedChange={() => toggle("series", s)}
                        aria-label={`Filter by ${s}`}
                      />
                      <span className="text-sm text-muted-foreground">{s}</span>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="vendor">
              <AccordionTrigger className="text-sm">Vendor</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2 pt-1">
                  {allVendors.map((v) => (
                    <label key={v} className="flex items-center gap-2">
                      <Checkbox
                        checked={value.vendors.includes(v)}
                        onCheckedChange={() => toggle("vendors", v)}
                        aria-label={`Filter by ${v}`}
                      />
                      <span className="text-sm text-muted-foreground">{v}</span>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="specs">
              <AccordionTrigger className="text-sm">Specs</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3 pt-1">
                  <div className="grid gap-2">
                    <Label className="text-xs">Base clock (GHz)</Label>
                    <Slider
                      value={[baseMin, baseMax]}
                      min={baseRange[0]}
                      max={baseRange[1]}
                      step={0.1}
                      onValueChange={([min, max]) => {
                        onChange({
                          ...value,
                          minBaseClockGHz: min,
                          maxBaseClockGHz: max,
                        })
                      }}
                      aria-label="Base clock range"
                      className="mt-1"
                    />
                    <div className="text-xs text-muted-foreground mt-1">{`${baseMin.toFixed(1)} — ${baseMax.toFixed(1)} GHz`}</div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs">TDP (W)</Label>
                    <Slider
                      value={[tdpMin, tdpMax]}
                      min={tdpRange[0]}
                      max={tdpRange[1]}
                      step={5}
                      onValueChange={([min, max]) => {
                        onChange({
                          ...value,
                          minTdpW: min,
                          maxTdpW: max,
                        })
                      }}
                      aria-label="TDP range"
                      className="mt-1"
                    />
                    <div className="text-xs text-muted-foreground mt-1">{`${tdpMin} — ${tdpMax} W`}</div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs">Cores & Threads</Label>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="justify-between gap-2 bg-transparent">
                            <span className="inline-flex items-center gap-1">
                              <ListFilter className="h-4 w-4" />
                              Cores
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-70" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-40">
                          {allCores.map((c) => {
                            const checked = value.cores.includes(c)
                            return (
                              <DropdownMenuCheckboxItem
                                key={c}
                                checked={checked}
                                onCheckedChange={() => toggleNum("cores", c)}
                                className="text-sm"
                              >
                                {c}
                              </DropdownMenuCheckboxItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="justify-between gap-2 bg-transparent">
                            <span className="inline-flex items-center gap-1">
                              <ListFilter className="h-4 w-4" />
                              Threads
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-70" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-44">
                          {allThreads.map((t) => {
                            const checked = value.threads.includes(t)
                            return (
                              <DropdownMenuCheckboxItem
                                key={t}
                                checked={checked}
                                onCheckedChange={() => toggleNum("threads", t)}
                                className="text-sm"
                              >
                                {t}
                              </DropdownMenuCheckboxItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator />

          <label className="flex items-center gap-2 mt-1">
            <Checkbox checked={value.inStockOnly} onCheckedChange={(c) => setInStock(Boolean(c))} />
            <span className="text-sm text-muted-foreground">In stock only</span>
          </label>
        </div>
      )}
    </aside>
  )
}
