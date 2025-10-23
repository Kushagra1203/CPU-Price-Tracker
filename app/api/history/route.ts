import { NextResponse } from "next/server"
import { getOffersBySlug } from "@/lib/cpu-data"

function generatePriceHistory(basePrice: number, days = 30) {
  const history: { date: string; price: number }[] = []
  let price = basePrice

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)

    // Generate realistic price variation (±5-10% of base price)
    const variation = (Math.random() - 0.5) * 0.15 * basePrice
    price = Math.max(basePrice * 0.85, price * (1 + variation * 0.1))

    history.push({
      date: d.toISOString().slice(0, 10),
      price: Math.round(price * 100) / 100,
    })
  }

  return history
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("slug")
  const vendorsParam = searchParams.get("vendors")

  if (slug) {
    let offers = getOffersBySlug(slug)
    const vendorFilter = vendorsParam
      ?.split(",")
      .map((v) => v.trim())
      .filter(Boolean)
    if (vendorFilter?.length) {
      offers = offers.filter((o) => vendorFilter.includes(o.vendor))
    }
    if (!offers.length) return NextResponse.json({ error: "No offers for slug" }, { status: 404 })

    const title = `${offers[0].brand} ${offers[0].series} ${offers[0].model}`
    return NextResponse.json({
      kind: "multi",
      title,
      slug,
      series: offers.map((o) => ({
        vendor: o.vendor,
        brand: o.brand,
        data: generatePriceHistory(o.priceUSD, 30),
      })),
    })
  }

  return NextResponse.json({ error: "Provide ?slug=" }, { status: 400 })
}
