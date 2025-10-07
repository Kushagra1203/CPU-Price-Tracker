"use client"

import { CPUTile } from "./cpu-tile"
import type { CPUOffer } from "@/lib/cpu-data"
import { AnimatePresence, motion } from "framer-motion"

export function CPUTileGrid({ offers }: { offers: CPUOffer[] }) {
  if (!offers.length) {
    return <div className="text-sm text-muted-foreground py-8">No matching offers.</div>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <AnimatePresence initial={false} mode="popLayout">
        {offers.map((o) => (
          <motion.div
            key={o.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <CPUTile offer={o} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
