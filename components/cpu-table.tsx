"use client"

import { useState, Fragment } from "react"
import type { CpuItem } from "./cpu-browser"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function CpuTable({ items }: { items: CpuItem[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableCaption className="sr-only">CPU price comparison table</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead className="hidden md:table-cell">Brand</TableHead>
            <TableHead className="hidden md:table-cell">Generation</TableHead>
            <TableHead className="hidden md:table-cell">Series</TableHead>
            <TableHead className="hidden lg:table-cell">C/T</TableHead>
            <TableHead className="hidden lg:table-cell">Boost</TableHead>
            <TableHead>Best Price</TableHead>
            <TableHead className="hidden sm:table-cell">Stores</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((cpu) => {
            const isOpen = !!expanded[cpu.id]
            const storeCount = cpu.offers.length
            return (
              <Fragment key={cpu.id}>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{cpu.model}</span>
                      <span className="text-xs text-muted-foreground md:hidden">
                        {cpu.brand} • {cpu.generation} • {cpu.series}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{cpu.brand}</TableCell>
                  <TableCell className="hidden md:table-cell">{cpu.generation}</TableCell>
                  <TableCell className="hidden md:table-cell">{cpu.series}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {cpu.cores}/{cpu.threads}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {cpu.boostClockGHz ? `${cpu.boostClockGHz.toFixed(2)} GHz` : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-semibold text-blue-600">
                    ${cpu.bestPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary">{storeCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => toggle(cpu.id)} aria-expanded={isOpen}>
                      {isOpen ? "Hide offers" : "View offers"}
                    </Button>
                  </TableCell>
                </TableRow>

                {isOpen && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Card className="p-3">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {cpu.offers
                            .slice()
                            .sort((a, b) => a.price - b.price)
                            .map((o) => (
                              <div key={`${cpu.id}-${o.store}`} className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-medium">{o.store}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Seen {new Date(o.lastSeen).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold tabular-nums">${o.price.toFixed(2)}</span>
                                  <Badge
                                    variant={o.inStock ? "default" : "secondary"}
                                    className={o.inStock ? "bg-green-600 text-white hover:bg-green-600" : ""}
                                  >
                                    {o.inStock ? "In stock" : "Out of stock"}
                                  </Badge>
                                  <a
                                    className="text-sm text-blue-600 underline underline-offset-4"
                                    href={o.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Open ${o.store} listing`}
                                  >
                                    Open
                                  </a>
                                </div>
                              </div>
                            ))}
                        </div>
                      </Card>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
