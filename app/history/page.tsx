import HistoryBrowser from "@/components/history-browser"

export const metadata = {
  title: "Price History",
  description: "Explore price trends over time across vendors.",
}

export default function HistoryPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-pretty">CPU Price History</h1>
      </header>
      <HistoryBrowser />
      <p className="text-sm text-muted-foreground">
        Tip: Filter vendors to compare lines. Colors match brand (Intel = blue, AMD = amber).
      </p>
    </main>
  )
}
