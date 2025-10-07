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

// Helper utilities and missing exports for history + lookups
function toStoreSlug(store: string) {
  return store
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function offerIdFor(cpu: Cpu, store: string) {
  return `${cpu.id}__${toStoreSlug(store)}`
}

function mockPriceHistory(base: number, days = 30) {
  // Generate a simple mock history around the current price
  // Most recent first -> sort later as needed by consumers
  const out: { date: string; price: number }[] = []
  let price = base
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    // small random walk within +/- 5%
    const jitter = (Math.random() - 0.5) * 0.1 // +/-5%
    price = Math.max(1, price * (1 + jitter))
    out.push({ date: d.toISOString().slice(0, 10), price: Math.round(price * 100) / 100 })
  }
  return out
}

export function getOffersBySlug(slug: string) {
  // slug is currently the cpu.id in sampleCpus
  const cpu = sampleCpus.find((c) => c.id === slug)
  if (!cpu) return []
  return cpu.offers.map((o) => ({
    id: offerIdFor(cpu, o.store),
    slug: cpu.id,
    brand: cpu.brand,
    series: cpu.series,
    model: cpu.model,
    vendor: o.store,
    url: o.url,
    inStock: o.inStock,
    // Provide mock time-series based on current price
    priceHistory: mockPriceHistory(o.price, 30),
  }))
}

export function getOfferById(offerId: string) {
  // offerId format: `${cpu.id}__${store-slug}`
  const [slug, storeSlug] = offerId.split("__")
  const cpu = sampleCpus.find((c) => c.id === slug)
  if (!cpu) return undefined
  const match = cpu.offers.find((o) => toStoreSlug(o.store) === storeSlug)
  if (!match) return undefined
  return {
    id: offerIdFor(cpu, match.store),
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

export const sampleCpus: Cpu[] = [
  {
    id: "intel-i5-12400f",
    brand: "Intel",
    model: "Core i5-12400F",
    generation: "12th Gen",
    series: "Core i5",
    cores: 6,
    threads: 12,
    baseClockGHz: 2.5,
    boostClockGHz: 4.4,
    tdpW: 65,
    offers: [
      { store: "Newegg", price: 129.99, url: "https://www.newegg.com/", inStock: true, lastSeen: now() },
      { store: "Amazon", price: 134.99, url: "https://www.amazon.com/", inStock: true, lastSeen: now() },
      { store: "Best Buy", price: 139.99, url: "https://www.bestbuy.com/", inStock: true, lastSeen: now() },
    ],
  },
  {
    id: "intel-i7-13700k",
    brand: "Intel",
    model: "Core i7-13700K",
    generation: "13th Gen",
    series: "Core i7",
    cores: 16,
    threads: 24,
    baseClockGHz: 3.4,
    boostClockGHz: 5.4,
    tdpW: 125,
    offers: [
      { store: "Amazon", price: 349.99, url: "https://www.amazon.com/", inStock: true, lastSeen: now() },
      { store: "Micro Center", price: 329.99, url: "https://www.microcenter.com/", inStock: true, lastSeen: now() },
      { store: "Newegg", price: 339.99, url: "https://www.newegg.com/", inStock: false, lastSeen: now() },
    ],
  },
  {
    id: "amd-ryzen-5-5600",
    brand: "AMD",
    model: "Ryzen 5 5600",
    generation: "Ryzen 5000",
    series: "Ryzen 5",
    cores: 6,
    threads: 12,
    baseClockGHz: 3.5,
    boostClockGHz: 4.4,
    tdpW: 65,
    offers: [
      { store: "Best Buy", price: 119.99, url: "https://www.bestbuy.com/", inStock: true, lastSeen: now() },
      { store: "Newegg", price: 114.99, url: "https://www.newegg.com/", inStock: true, lastSeen: now() },
      { store: "Amazon", price: 124.99, url: "https://www.amazon.com/", inStock: true, lastSeen: now() },
    ],
  },
  {
    id: "amd-ryzen-7-7800x3d",
    brand: "AMD",
    model: "Ryzen 7 7800X3D",
    generation: "Ryzen 7000",
    series: "Ryzen 7",
    cores: 8,
    threads: 16,
    baseClockGHz: 4.2,
    boostClockGHz: 5.0,
    tdpW: 120,
    offers: [
      { store: "Amazon", price: 349.0, url: "https://www.amazon.com/", inStock: true, lastSeen: now() },
      { store: "Newegg", price: 359.99, url: "https://www.newegg.com/", inStock: true, lastSeen: now() },
      { store: "Micro Center", price: 339.99, url: "https://www.microcenter.com/", inStock: false, lastSeen: now() },
    ],
  },
  {
    id: "intel-i9-14900k",
    brand: "Intel",
    model: "Core i9-14900K",
    generation: "14th Gen",
    series: "Core i9",
    cores: 24,
    threads: 32,
    baseClockGHz: 3.2,
    boostClockGHz: 6.0,
    tdpW: 125,
    offers: [
      { store: "Amazon", price: 529.99, url: "https://www.amazon.com/", inStock: true, lastSeen: now() },
      { store: "Best Buy", price: 519.99, url: "https://www.bestbuy.com/", inStock: true, lastSeen: now() },
      { store: "Newegg", price: 524.99, url: "https://www.newegg.com/", inStock: true, lastSeen: now() },
    ],
  },
]
