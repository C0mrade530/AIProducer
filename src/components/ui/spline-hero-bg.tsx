"use client"

import { Suspense, lazy } from "react"
const Spline = lazy(() => import("@splinetool/react-spline"))

export function SplineHeroBackground() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto overflow-hidden">
      <Suspense
        fallback={
          <div className="w-full h-full bg-black" />
        }
      >
        <Spline
          style={{ width: "100%", height: "100%", pointerEvents: "auto" }}
          scene="https://prod.spline.design/us3ALejTXl6usHZ7/scene.splinecode"
        />
      </Suspense>
      {/* Gradient overlays for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to right, rgba(0,0,0,0.85), transparent 35%, transparent 65%, rgba(0,0,0,0.85)),
            linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.95))
          `,
        }}
      />
    </div>
  )
}
