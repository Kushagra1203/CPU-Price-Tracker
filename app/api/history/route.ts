import { NextResponse } from "next/server"
import { getOfferById, getOffersBySlug } from "@/lib/cpu-data"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("slug")
  const offerId = searchParams.get("offerId")
  const vendorsParam = searchParams.get("vendors") // comma separated

  if (offerId) {
    const offer = getOfferById(offerId)
    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    return NextResponse.json({
      kind: "single",
      title: `${offer.brand} ${offer.series} ${offer.model} — ${offer.vendor}`,
      slug: offer.slug,
      vendor: offer.vendor,
      series: [
        {
          vendor: offer.vendor,
          brand: offer.brand,
          data: offer.priceHistory,
        },
      ],
    })
  }

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
        data: o.priceHistory,
      })),
    })
  }

  return NextResponse.json({ error: "Provide ?slug= or ?offerId=" }, { status: 400 })
}
