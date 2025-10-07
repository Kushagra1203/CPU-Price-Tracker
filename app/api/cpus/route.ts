import { NextResponse } from "next/server"
import processors from "@/data/processors.json"
import { normalizeProcessors, enrichForApi } from "@/lib/ingest/processors"

export async function GET() {
  // Normalize the provided dataset to our Cpu/Offer shape.
  const cpus = normalizeProcessors((processors as any[]) || [])

  // Compute bestPrice and generationRank; also flatten offers when useful.
  const { enriched, offers } = enrichForApi(cpus)

  return NextResponse.json({
    cpus: enriched,
    offers, // kept for future use; UI currently flattens client-side
    updatedAt: new Date().toISOString(),
  })
}
