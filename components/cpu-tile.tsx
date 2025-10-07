"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CPUOffer } from "@/lib/cpu-data"
import { motion } from "framer-motion"
import Link from "next/link"
import { getVendorColor } from "@/lib/vendor-colors" // vendor color helper

export function CPUTile({ offer }: { offer: CPUOffer }) {
  const titleCase = (s: string) =>
    s
      .toLowerCase()
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ")

  const shortGeneration = (g?: string) => {
    if (!g) return null
    const stripped = g.replace(/^(intel|amd)\s*/i, "").trim()
    return titleCase(stripped)
  }

  const brandRing =
    offer.brand === "Intel"
      ? "ring-blue-500/20 hover:ring-blue-500/40"
      : offer.brand === "AMD"
        ? "ring-red-500/20 hover:ring-red-500/40"
        : "ring-gray-500/20 hover:ring-gray-500/40"

  const vendorAccent = getVendorColor(offer.vendor)

  // Derive product slug from offer.id format: "<cpuId>__<store-slug>"
  const productSlug = offer.id.includes("__") ? offer.id.split("__")[0] : undefined

  const rawPrice =
    // prefer INR-style fields if present, else fall back
    (offer as any).priceINR ?? (offer as any).price ?? (offer as any).priceRs ?? offer.priceUSD ?? 0
  const priceINR = Number.isFinite(rawPrice) ? Math.round(Number(rawPrice)) : 0
  const formattedINR = priceINR.toLocaleString("en-IN")

  const displayName = titleCase(offer.model)

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <Card
        className={`h-full bg-card border-border transition-all ring-1 ${brandRing} border-t-4`}
        style={{
          borderTopColor: vendorAccent,
          boxShadow: `0 0 14px 0 ${vendorAccent}26`, // subtle vendor glow
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-pretty">
                {productSlug ? (
                  <Link
                    href={`/history?slug=${encodeURIComponent(productSlug)}`}
                    className="hover:underline underline-offset-4"
                    aria-label={`View price history for ${displayName}`}
                  >
                    {displayName}
                  </Link>
                ) : (
                  <>{displayName}</>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">{shortGeneration((offer as any).generation || "")}</p>
            </div>
            <Badge variant="outline" className="uppercase" style={{ borderColor: vendorAccent, color: vendorAccent }}>
              {offer.vendor}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-md bg-primary/10 px-2 py-1">
            <span className="text-2xl font-semibold">
              {"₹"}
              {formattedINR}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-foreground bg-primary/30 px-1.5 py-0.5 rounded font-medium">
              INR
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {offer.baseClockGHz && (
              <>
                <dt>Base</dt>
                <dd>{offer.baseClockGHz} GHz</dd>
              </>
            )}
            {offer.tdpW && (
              <>
                <dt>TDP</dt>
                <dd>{offer.tdpW} W</dd>
              </>
            )}
            <dt>Cores</dt>
            <dd>{offer.cores}</dd>
            <dt>Threads</dt>
            <dd>{offer.threads}</dd>
          </dl>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex w-full gap-2">
            <Button asChild className="group relative overflow-hidden flex-1">
              <a
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${offer.brand} ${offer.model} on ${offer.vendor}`}
                className="relative inline-flex w-full items-center justify-center gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: vendorAccent }}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-md opacity-0 transition-opacity duration-200 group-hover:opacity-15"
                  style={{ backgroundColor: vendorAccent }}
                />
                <span className="relative z-10">View on {offer.vendor}</span>
              </a>
            </Button>
            {productSlug && (
              <Button asChild variant="outline" className="flex-none bg-transparent relative overflow-hidden group">
                <Link href={`/history?slug=${encodeURIComponent(productSlug)}`} aria-label="Open price history">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-md opacity-0 transition-opacity duration-200 group-hover:opacity-10"
                    style={{ backgroundColor: vendorAccent }}
                  />
                  <span className="relative z-10">History</span>
                </Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.article>
  )
}
