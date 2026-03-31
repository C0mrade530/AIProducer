"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-xl font-bold">Ошибка загрузки</h2>
        <p className="text-muted-foreground">
          Не удалось загрузить страницу. Проверь подключение к интернету и
          попробуй снова.
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={reset}>Попробовать снова</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
            На главную
          </Button>
        </div>
      </div>
    </div>
  )
}
