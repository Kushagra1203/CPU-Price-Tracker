"use client"

import { CPUTile } from "./cpu-tile"
import type { CPUOffer } from "@/lib/cpu-data"

export function CPUTileGrid({ offers }: { offers: CPUOffer[] }) {
  if (!offers.length) {
    return <div className="text-sm text-muted-foreground py-8">No matching offers.</div>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {offers.map((o) => (
        <article key={o.id} className="animate-in fade-in slide-in-from-bottom-1 duration-200">
          <CPUTile offer={o} />
        </article>
      ))}
    </div>
  )
}
