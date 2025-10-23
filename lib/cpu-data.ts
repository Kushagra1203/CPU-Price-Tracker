import processorsData from "@/data/processors.json"

type Offer = {
  store: string
  price: number
  url: string
  inStock: boolean
  lastSeen: string
}

type Cpu = {
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
}

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

const now = () => new Date().toISOString()

function toStoreSlug(store: string) {
  return store
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function offerIdFor(cpuId: string, store: string) {
  return `${cpuId}__${toStoreSlug(store)}`
}

function mockPriceHistory(base: number, days = 30) {
  const out: { date: string; price: number }[] = []
  let price = base
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const jitter = (Math.random() - 0.5) * 0.1
    price = Math.max(1, price * (1 + jitter))
    out.push({ date: d.toISOString().slice(0, 10), price: Math.round(price * 100) / 100 })
  }
  return out
}

function buildCpuData() {
  const cpuMap = new Map<string, Cpu>()

  processorsData.forEach((item: any) => {
    const standard = item.standard_name || ""
    const cpuId = standard.toLowerCase().replace(/\s+/g, "-")

    if (!cpuMap.has(cpuId)) {
      cpuMap.set(cpuId, {
        id: cpuId,
        brand: item.brand === "AMD" ? "AMD" : "Intel",
        model: item.standard_name || item.name,
        generation: item.generation || "",
        series: item.series || "",
        cores: Number.parseInt(item.cores) || 0,
        threads: Number.parseInt(item.threads) || 0,
        baseClockGHz: item.base_clock_ghz ? Number.parseFloat(item.base_clock_ghz) : undefined,
        tdpW: item.tdp_watt ? Number.parseFloat(item.tdp_watt) : undefined,
        offers: [],
      })
    }

    const cpu = cpuMap.get(cpuId)!
    cpu.offers.push({
      store: item.vendor,
      price: item.price,
      url: item.link,
      inStock: true,
      lastSeen: now(),
    })
  })

  return Array.from(cpuMap.values())
}

const sampleCpus = buildCpuData()

export function getOffersBySlug(slug: string) {
  const cpu = sampleCpus.find((c) => c.id === slug)
  if (!cpu) return []
  return cpu.offers.map((o) => ({
    id: offerIdFor(cpu.id, o.store),
    slug: cpu.id,
    brand: cpu.brand,
    series: cpu.series,
    model: cpu.model,
    vendor: o.store,
    url: o.url,
    inStock: o.inStock,
    priceHistory: mockPriceHistory(o.price, 30),
  }))
}

export function getOfferById(offerId: string) {
  const [slug, storeSlug] = offerId.split("__")
  const cpu = sampleCpus.find((c) => c.id === slug)
  if (!cpu) return undefined
  const match = cpu.offers.find((o) => toStoreSlug(o.store) === storeSlug)
  if (!match) return undefined
  return {
    id: offerIdFor(cpu.id, match.store),
    slug: cpu.id,
    brand: cpu.brand,
    series: cpu.series,
    model: cpu.model,
    vendor: match.store,
    url: match.url,
    inStock: match.inStock,
    priceHistory: mockPriceHistory(match.price, 30),
  }
}

export { sampleCpus }
