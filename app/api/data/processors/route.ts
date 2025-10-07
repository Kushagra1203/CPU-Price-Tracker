import processors from "@/data/processors.json"
import { normalizeAll, type ProcessorRecord } from "@/lib/ingest/processors"

export async function GET() {
  // processors is the imported JSON array; normalize before responding
  const offers = normalizeAll(processors as ProcessorRecord[])

  // Basic meta to help UIs build filters quickly without extra passes
  const brands = Array.from(new Set(offers.map((o) => o.brand).filter(Boolean))).sort()
  const generations = Array.from(new Set(offers.map((o) => o.generation).filter(Boolean))).sort()
  const series = Array.from(new Set(offers.map((o) => o.series).filter(Boolean))).sort()
  const vendors = Array.from(new Set(offers.map((o) => o.vendor).filter(Boolean))).sort()

  const priceMin = Math.min(...offers.map((o) => o.price))
  const priceMax = Math.max(...offers.map((o) => o.price))

  return Response.json({
    offers,
    meta: {
      count: offers.length,
      brands,
      generations,
      series,
      vendors,
      priceRange: [priceMin, priceMax],
    },
  })
}
