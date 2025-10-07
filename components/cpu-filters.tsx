"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CpuFiltersState = {
  brand: "All" | "Intel" | "AMD" | (string & {})
  generation: "All" | (string & {})
  series: "All" | (string & {})
}

export function CpuFilters({
  value,
  onChange,
  options,
}: {
  value: CpuFiltersState
  onChange: (v: CpuFiltersState) => void
  options: {
    brands: string[]
    generations: string[]
    series: string[]
  }
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 w-full">
      <Select value={value.brand} onValueChange={(v) => onChange({ ...value, brand: v as CpuFiltersState["brand"] })}>
        <SelectTrigger aria-label="Filter by brand">
          <SelectValue placeholder="Brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All brands</SelectItem>
          {options.brands.map((b) => (
            <SelectItem key={b} value={b}>
              {b}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.generation}
        onValueChange={(v) => onChange({ ...value, generation: v as CpuFiltersState["generation"] })}
      >
        <SelectTrigger aria-label="Filter by generation">
          <SelectValue placeholder="Generation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All generations</SelectItem>
          {options.generations.map((g) => (
            <SelectItem key={g} value={g}>
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.series}
        onValueChange={(v) => onChange({ ...value, series: v as CpuFiltersState["series"] })}
      >
        <SelectTrigger aria-label="Filter by series">
          <SelectValue placeholder="Series" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All series</SelectItem>
          {options.series.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
