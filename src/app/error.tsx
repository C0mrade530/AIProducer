"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-4">
        <h2 className="text-2xl font-bold">Что-то пошло не так</h2>
        <p className="text-muted-foreground">
          Произошла непредвиденная ошибка. Попробуй обновить страницу.
        </p>
        <Button onClick={reset}>Попробовать снова</Button>
      </div>
    </div>
  )
}
