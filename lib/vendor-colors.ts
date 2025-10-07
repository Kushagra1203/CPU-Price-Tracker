// Palette constraint: neutrals + blue (Newegg), teal (Micro Center), amber (Amazon), gray fallback.
export function getVendorColor(vendor?: string): string {
  const v = (vendor || "").toLowerCase()

  // Indian retailers (neon-tuned where useful)
  if (v.includes("elitehubs")) return "#F5D649" // already bright
  if (v.includes("ezpz")) return "#FF6A00" // neon orange vs #B34700
  if (v.includes("vedant")) return "#00A6FF" // brighter cyan-blue vs #007ACC
  if (v.includes("vishal")) return "#5B3BEA" // neon indigo vs #2E1D6A
  if (v.includes("theitdepot") || v.includes("the it depot")) return "#FFA35A" // brighter amber
  if (v.includes("sclgaming") || v.includes("scl gaming")) return "#7CF8FF" // keep neon aqua
  if (v.includes("mdcomputers") || v.includes("md computers")) return "#FF3B2E" // brighter red vs #E33324
  if (v.includes("pcstudio") || v.includes("pc studio")) return "#E8D33A" // brighter yellow vs #B2A429
  if (v.includes("shweta")) return "#FF2A7A" // brighter pink vs #E91E63

  // Existing global retailers (tuned for pop)
  if (v.includes("amazon")) return "#FF861F" // brighter orange
  if (v.includes("best buy") || v.includes("bestbuy") || v.includes("best")) return "#FFD21A" // brighter yellow
  if (v.includes("micro")) return "#1FE3D6" // neon teal
  if (v.includes("newegg")) return "#4C8FFF" // brighter blue
  if (v.includes("b&h") || v.includes("bh")) return "#FF7F2A"

  return "#9ca3af" // gray fallback
}
