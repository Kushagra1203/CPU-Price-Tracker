import { CpuBrowser } from "@/components/cpu-browser"

export default function Page() {
  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">Browse CPU Deals</h1>
            <p className="text-muted-foreground text-pretty">
              Compare prices across stores and filter by brand, generation, and series. Sort to find the best deals.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <CpuBrowser />
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
          Demo data shown. Plug real sources into the API adapter.
        </div>
      </footer>
    </main>
  )
}
