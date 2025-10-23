import fs from "fs"
import path from "path"

// Read the processors JSON
const processorsPath = path.join(process.cwd(), "data", "processors.json")
const processorsData = JSON.parse(fs.readFileSync(processorsPath, "utf-8"))

// Extract unique CPUs and vendors with their current prices
const cpuVendorMap = new Map<string, Map<string, number>>()

processorsData.forEach((item: any) => {
  const cpuName = item.standard_name || item.name
  const vendor = item.vendor
  const price = item.price || 0

  if (!cpuVendorMap.has(cpuName)) {
    cpuVendorMap.set(cpuName, new Map())
  }
  cpuVendorMap.get(cpuName)!.set(vendor, price)
})

// Generate dummy price history with dates and price variations
const priceHistory: Record<string, any> = {}

cpuVendorMap.forEach((vendors, cpuName) => {
  priceHistory[cpuName] = {}

  vendors.forEach((startPrice, vendor) => {
    const history = []
    const baseDate = new Date("2024-01-01")

    // Generate 30 days of price history
    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate)
      date.setDate(date.getDate() + i)

      // Generate price variation (±10% of start price)
      const variation = (Math.random() - 0.5) * 0.2 * startPrice
      const price = Math.round((startPrice + variation) * 100) / 100

      history.push({
        date: date.toISOString().split("T")[0],
        price: Math.max(price, startPrice * 0.8), // Don't go below 80% of start price
      })
    }

    priceHistory[cpuName][vendor] = history
  })
})

// Write to file
const outputPath = path.join(process.cwd(), "data", "price-history.json")
fs.writeFileSync(outputPath, JSON.stringify(priceHistory, null, 2))

console.log("[v0] Price history generated successfully!")
console.log(`[v0] Total CPUs: ${cpuVendorMap.size}`)
console.log(`[v0] File saved to: ${outputPath}`)
