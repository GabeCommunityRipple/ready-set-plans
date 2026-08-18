import Anthropic from '@anthropic-ai/sdk'

// Base64 inflates payload by ~33%, and the Messages API caps a request at 32MB.
export const MAX_PDF_BYTES = 20 * 1024 * 1024

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 4000
// Per-request cap, in MILLISECONDS (the TypeScript SDK's unit). Sits inside the
// route's 300s maxDuration so the SDK aborts and logs before Vercel kills the
// function.
const REQUEST_TIMEOUT_MS = 240_000

const SYSTEM_PROMPT = `You are a materials estimator for a deck building company. Analyze this deck plan PDF and calculate a complete materials list using these exact specifications:

DECKING (5/4x6 Trex):
- Calculate grooved edge and square edge quantities separately
- Determine best mix of 12ft, 16ft, and 20ft boards based on deck dimensions to minimize waste
- Add 15% waste factor

FRAMING (2x10 #1 Pressure Treated):
- Joists at 16" OC plus rim board
- Include beams
- Add 15% waste factor

SUPPORT POSTS & FOOTINGS:
- 6x6 PT posts - exact count from plan
- Concrete bags per footing hole (decks)
- Poured concrete footings for porches - 3 bags per hole

RAILINGS (Westbury aluminum):
- Calculate best combination of 6ft and 8ft sections to minimize waste
- Exact count - no waste factor
- Include exact railing post count

STAIRS:
- 2x12 stringers
- 2x8 toe kick boards
- 2x4 blocking
- Hardie 8" and 12" for stair bands, stringers, toe kicks

TRIM:
- Hardie 12" fascia/band
- Hardie 8" fascia/band

Return a clean, organized materials list with quantities. Format it clearly so a builder can read it and hand it to a lumber yard. Show your dimension assumptions at the top so the builder can verify them.`

/**
 * Sends a deck plan PDF to Claude and returns the estimated materials list as
 * plain text.
 *
 * Runs without extended thinking and with a bounded output so the call returns
 * well inside the route's function budget.
 */
export async function generateMaterialsList(pdfBase64: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // DEBUG: verbose console.error tracing around the Anthropic call.
  // Remove once the failure has been identified.
  const startedAt = Date.now()
  console.error('[materials] STEP 7 calling Anthropic', {
    model: MODEL,
    maxTokens: MAX_TOKENS,
    thinking: 'off',
    timeoutMs: REQUEST_TIMEOUT_MS,
    base64Length: pdfBase64.length,
    approxRequestMB: ((pdfBase64.length / (1024 * 1024))).toFixed(2),
    apiKeyPresent: Boolean(process.env.ANTHROPIC_API_KEY),
  })

  let message: Anthropic.Message
  try {
    message = await client.messages.create(
      {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              // The document block must precede the text block.
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: pdfBase64,
                },
              },
              {
                type: 'text',
                text: 'Analyze the attached deck plan and produce the complete materials list.',
              },
            ],
          },
        ],
      },
      { timeout: REQUEST_TIMEOUT_MS }
    )
  } catch (error) {
    // Anthropic SDK errors carry status/headers/error alongside the message.
    console.error('[materials] STEP 7 FAILED Anthropic request threw', {
      model: MODEL,
      elapsedMs: Date.now() - startedAt,
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : undefined,
      status: (error as { status?: number })?.status,
      requestId: (error as { request_id?: string })?.request_id,
      errorBody: (error as { error?: unknown })?.error,
      stack: error instanceof Error ? error.stack : undefined,
      rawError: error,
    })
    throw error
  }

  console.error('[materials] STEP 7 Anthropic response received', {
    id: message.id,
    model: message.model,
    stop_reason: message.stop_reason,
    stop_sequence: message.stop_sequence,
    contentBlockCount: message.content.length,
    contentBlockTypes: message.content.map((block) => block.type),
    usage: message.usage,
    elapsedMs: Date.now() - startedAt,
  })

  // Thinking blocks come back alongside the answer; keep only the text.
  const materialsText = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim()

  console.error('[materials] STEP 7 extracted text', {
    textBlockCount: message.content.filter((block) => block.type === 'text').length,
    textLength: materialsText.length,
    preview: materialsText.slice(0, 300),
  })

  if (!materialsText) {
    console.error('[materials] STEP 7 FAILED no text in response', {
      contentBlockTypes: message.content.map((block) => block.type),
      fullContent: message.content,
    })
    throw new Error('Claude returned an empty materials list')
  }

  if (message.stop_reason === 'max_tokens') {
    console.error('[materials] STEP 7 FAILED hit max_tokens', {
      usage: message.usage,
      textLength: materialsText.length,
    })
    throw new Error('The materials list was cut off before it finished. Please try again.')
  }

  return materialsText
}
