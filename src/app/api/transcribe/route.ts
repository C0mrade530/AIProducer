import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.COMET_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  const formData = await request.formData()
  const audio = formData.get("audio") as File | null
  if (!audio) {
    return NextResponse.json({ error: "No audio file" }, { status: 400 })
  }

  // Forward to Whisper API (OpenAI-compatible endpoint)
  const whisperForm = new FormData()
  whisperForm.append("file", audio, "recording.webm")
  whisperForm.append("model", "whisper-1")
  whisperForm.append("language", "ru")

  const res = await fetch("https://api.cometapi.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: whisperForm,
  })

  if (!res.ok) {
    const err = await res.text().catch(() => "Whisper API error")
    console.error("Whisper error:", err)
    return NextResponse.json({ error: "Transcription failed" }, { status: 502 })
  }

  const data = await res.json()
  return NextResponse.json({ text: data.text || "" })
}
