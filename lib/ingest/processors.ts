export type ProcessorRecord = {
  name: string
  link: string
  price: number | string
  vendor: string
  standard_name: string
  brand: string
  generation: string
  series: string
  cores?: string | number
  threads?: string | number
  base_clock_ghz?: string | number
  tdp_watt?: string | number
}

export type Offer = {
  id: string
  name: string
  url: string
  price: number
  vendor: string
  standardName: string
  brand: string
  generation: string
  series: string
  specs: {
    cores?: number
    threads?: number
    baseClockGhz?: number
    tdpWatt?: number
  }
}

function toNumber(v: string | number | undefined): number | undefined {
  if (v === undefined) return undefined
  if (typeof v === "number") return v
  const n = Number.parseFloat(String(v).replace(/[^\d.]/g, ""))
  return Number.isFinite(n) ? n : undefined
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export function normalizeRecord(rec: ProcessorRecord): Offer | null {
  const price = toNumber(rec.price)
  if (!price || !rec.link) return null

  const id = `${slugify(rec.standard_name || rec.name)}-${slugify(rec.vendor)}`
  return {
    id,
    name: rec.name,
    url: rec.link,
    price,
    vendor: rec.vendor,
    standardName: rec.standard_name || rec.name,
    brand: rec.brand,
    generation: rec.generation,
    series: rec.series,
    specs: {
      cores: toNumber(rec.cores),
      threads: toNumber(rec.threads),
      baseClockGhz: toNumber(rec.base_clock_ghz),
      tdpWatt: toNumber(rec.tdp_watt),
    },
  }
}

export function normalizeAll(records: ProcessorRecord[]): Offer[] {
  const out: Offer[] = []
  for (const r of records) {
    const n = normalizeRecord(r)
    if (n) out.push(n)
  }
  return out
}

export { normalizeAll as normalizeProcessors }

export type ApiOffer = {
  store: string
  price: number
  url: string
  inStock: boolean
  lastSeen: string
}

export type CpuForApi = {
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
  offers: ApiOffer[]
  bestPrice: number
  generationRank: number
}

function parseGenerationRank(brand: string, generation: string): number {
  // Examples: "Intel 13th Generation", "AMD 5th Generation"
  const m = /(\d+)/.exec(generation || "")
  return m ? Number.parseInt(m[1], 10) : 0
}

// Optionally useful if you also want a flattened list alongside grouped CPUs
export type FlattenedForApi = Offer & {
  model: string
  baseClockGHz?: number
  tdpW?: number
  brand: "Intel" | "AMD"
}

export function enrichForApi(normalizedOffers: Offer[]): { enriched: CpuForApi[]; offers: FlattenedForApi[] } {
  // Group normalized offers by normalized model (standardName), vendor-agnostic
  const byModel = new Map<string, Offer[]>()
  for (const o of normalizedOffers) {
    const key = o.standardName || o.name
    if (!byModel.has(key)) byModel.set(key, [])
    byModel.get(key)!.push(o)
  }

  const enriched: CpuForApi[] = []
  const flattened: FlattenedForApi[] = []

  for (const list of byModel.values()) {
    // Use first offer as canonical for model/spec metadata
    const first = list[0]
    const id = slugify(first.standardName || first.name)

    const offers: ApiOffer[] = list.map((o) => {
      // inStock not present in dataset; assume true if price present
      return {
        store: o.vendor,
        price: o.price,
        url: o.url,
        inStock: Number.isFinite(o.price) && o.price > 0,
        lastSeen: new Date().toISOString(),
      }
    })

    const bestPrice = offers.reduce((min, o) => Math.min(min, o.price), Number.POSITIVE_INFINITY)
    const generationRank = parseGenerationRank(first.brand, first.generation)

    enriched.push({
      id,
      brand: (first.brand as "Intel" | "AMD") ?? "Intel",
      model: first.standardName || first.name,
      generation: first.generation,
      series: first.series,
      cores: first.specs.cores ?? 0,
      threads: first.specs.threads ?? 0,
      baseClockGHz: first.specs.baseClockGhz,
      boostClockGHz: undefined, // not present in provided dataset
      tdpW: first.specs.tdpWatt,
      offers,
      bestPrice: Number.isFinite(bestPrice) ? bestPrice : 0,
      generationRank,
    })

    for (const o of list) {
      flattened.push({
        ...o,
        model: first.standardName || first.name,
        baseClockGHz: first.specs.baseClockGhz,
        tdpW: first.specs.tdpWatt,
        brand: (first.brand as "Intel" | "AMD") ?? "Intel",
      })
    }
  }

  // Sort enriched CPUs by bestPrice ascending for a stable default order
  enriched.sort((a, b) => a.bestPrice - b.bestPrice)

  return { enriched, offers: flattened }
}
