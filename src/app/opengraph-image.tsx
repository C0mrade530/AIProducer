import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "GetProdi — AI-продюсер для экспертов"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #000000 0%, #0a0020 50%, #000000 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: "10%", right: "20%", width: 300, height: 300, borderRadius: "50%", background: "rgba(139,92,246,0.15)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "20%", width: 250, height: 250, borderRadius: "50%", background: "rgba(59,130,246,0.12)", filter: "blur(60px)" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#0a0a1a", border: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, borderTop: "14px solid transparent", borderBottom: "14px solid transparent", borderLeft: "22px solid white", marginLeft: 4 }} />
          </div>
          <span style={{ fontSize: 40, fontWeight: 700, color: "white" }}>GetProdi</span>
        </div>

        {/* Title */}
        <div style={{ fontSize: 52, fontWeight: 700, color: "white", textAlign: "center", lineHeight: 1.2, maxWidth: 800, marginBottom: 16 }}>
          AI-продюсер для экспертов
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 24, color: "#a0a0b0", textAlign: "center", maxWidth: 700 }}>
          Продукт, контент, воронка и продажи — за 7 шагов
        </div>

        {/* Bottom badge */}
        <div style={{ position: "absolute", bottom: 40, display: "flex", gap: 24, fontSize: 16, color: "#6a6a7a" }}>
          <span>getprodi.ru</span>
          <span>&#x2022;</span>
          <span>от 2 990 ₽/мес</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
