export const metadata = {
  title: "About",
  description: "Learn more about this CPU price tracker.",
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-semibold text-pretty">About This CPU Price Tracker</h1>
      <p className="leading-relaxed text-muted-foreground">
        This project tracks CPU offers across multiple vendors and presents them in an elegant, dark interface. You can
        filter by brand, generation, series, and vendor, sort results, and view detailed price history over time for
        each product. The current dataset is mocked for demonstration, but the API has been designed to plug in real
        scrapers or price APIs later.
      </p>
      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
        <li>Tile-based grid where each vendor offer is its own card</li>
        <li>Sidebar filtering, sorting, and search</li>
        <li>Dedicated Price History page with multi-vendor comparison</li>
        <li>Accessible color palette and subtle animations</li>
      </ul>
      <p className="leading-relaxed text-muted-foreground">
        Want live data? We can add retailer adapters to the API to fetch real prices and update histories.
      </p>
    </main>
  )
}
