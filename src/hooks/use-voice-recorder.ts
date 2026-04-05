"use client"

import { useState, useRef, useCallback } from "react"

interface UseVoiceRecorderOptions {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
}

export function useVoiceRecorder({ onTranscript, onError }: UseVoiceRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      })

      chunksRef.current = []
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop())

        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        if (blob.size < 1000) {
          onError?.("Запись слишком короткая")
          return
        }

        setIsTranscribing(true)
        try {
          const formData = new FormData()
          formData.append("audio", blob, "recording.webm")

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          })

          if (!res.ok) throw new Error("Transcription failed")

          const data = await res.json()
          if (data.text?.trim()) {
            onTranscript(data.text.trim())
          } else {
            onError?.("Не удалось распознать речь")
          }
        } catch {
          onError?.("Ошибка распознавания речи")
        } finally {
          setIsTranscribing(false)
        }
      }

      mediaRecorder.start(250) // collect chunks every 250ms
      setIsRecording(true)
    } catch {
      onError?.("Нет доступа к микрофону")
    }
  }, [onTranscript, onError])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }, [])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  return {
    isRecording,
    isTranscribing,
    toggleRecording,
    startRecording,
    stopRecording,
  }
}
