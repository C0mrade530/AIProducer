/**
 * Robust SSE stream reader for OpenAI-compatible streaming APIs.
 *
 * Handles two common bugs:
 *   1. UTF-8 multi-byte characters split across chunks (causes typos in Cyrillic)
 *      → Use TextDecoder with { stream: true }
 *   2. SSE lines split across chunks (loses last partial line before newline)
 *      → Buffer incomplete lines between reads
 */
export async function readSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onDelta: (delta: string) => void
): Promise<string> {
  const decoder = new TextDecoder("utf-8")
  let buffer = ""
  let fullContent = ""

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      // Flush any remaining bytes in the decoder
      buffer += decoder.decode()
      // Process any final complete line
      if (buffer.trim()) {
        const delta = parseSSELine(buffer)
        if (delta) {
          fullContent += delta
          onDelta(delta)
        }
      }
      break
    }

    // Decode with stream: true to preserve incomplete multi-byte sequences
    buffer += decoder.decode(value, { stream: true })

    // Process complete lines only; keep the partial tail for next iteration
    const lines = buffer.split("\n")
    buffer = lines.pop() || "" // last item might be incomplete

    for (const line of lines) {
      const delta = parseSSELine(line)
      if (delta) {
        fullContent += delta
        onDelta(delta)
      }
    }
  }

  return fullContent
}

function parseSSELine(line: string): string | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith("data: ")) return null
  if (trimmed === "data: [DONE]") return null

  try {
    const data = JSON.parse(trimmed.slice(6))
    return data.choices?.[0]?.delta?.content || null
  } catch {
    return null
  }
}
