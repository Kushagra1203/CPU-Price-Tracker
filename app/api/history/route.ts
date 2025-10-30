import { NextResponse } from "next/server"
import { getOffersBySlug } from "@/lib/cpu-data"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("slug")
  const vendorsParam = searchParams.get("vendors")

  if (!slug) {
    return NextResponse.json({ error: "Provide ?slug=" }, { status: 400 })
  }

  let offers = getOffersBySlug(slug)

  if (!offers.length) {
    return NextResponse.json({ error: "No offers for slug" }, { status: 404 })
  }

  const vendorFilter = vendorsParam
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean)

  if (vendorFilter?.length) {
    offers = offers.filter((o) => vendorFilter.includes(o.vendor))
  }

  if (!offers.length) {
    return NextResponse.json({ error: "No offers for selected vendors" }, { status: 404 })
  }

  const title = `${offers[0].brand} ${offers[0].series} ${offers[0].model}`

  return NextResponse.json({
    kind: "multi",
    title,
    slug,
    series: offers.map((o) => ({
      vendor: o.vendor,
      brand: o.brand,
      data: o.priceHistory || [],
    })),
  })
}
