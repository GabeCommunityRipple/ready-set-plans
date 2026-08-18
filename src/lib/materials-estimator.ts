import Anthropic from '@anthropic-ai/sdk'

// Base64 inflates payload by ~33%, and the Messages API caps a request at 32MB.
export const MAX_PDF_BYTES = 20 * 1024 * 1024

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
 * Streams the response: plan PDFs are large inputs and the estimate involves
 * board-length optimization, so a non-streaming call risks an HTTP timeout.
 */
export async function generateMaterialsList(pdfBase64: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    // Minimizing board waste is real arithmetic — let Claude reason it through.
    thinking: { type: 'adaptive' },
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
  })

  const message = await stream.finalMessage()

  // Thinking blocks come back alongside the answer; keep only the text.
  const materialsText = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim()

  if (!materialsText) {
    throw new Error('Claude returned an empty materials list')
  }

  if (message.stop_reason === 'max_tokens') {
    throw new Error('The materials list was cut off before it finished. Please try again.')
  }

  return materialsText
}
