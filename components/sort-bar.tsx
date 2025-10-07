"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Props = {
  count: number
  sort: string
  onSortChange: (v: string) => void
}

export function SortBar({ count, sort, onSortChange }: Props) {
  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-sm text-muted-foreground">{count} results</p>
      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="brand">Brand</SelectItem>
          <SelectItem value="generation">Generation</SelectItem>
          <SelectItem value="series">Series</SelectItem>
          {/* Additional sort options can be added here */}
        </SelectContent>
      </Select>
    </div>
  )
}
