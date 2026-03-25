import Anthropic from '@anthropic-ai/sdk'

export interface AIJobCheckResult {
  complete: boolean
  missing_items: string[]
  message: string
}

const SYSTEM_PROMPT = `You are a drafting service intake specialist. Analyze this deck/screen porch job submission and identify any missing critical information needed to create permit-ready plans. Check for: dimensions (length x width), height off ground, footer depth, post size (4x4 or 6x6), ledger attachment type, decking material, railing requirements, stair details, and local jurisdiction. For screen porches also check: roof type, screen vs glass, door locations, electrical needs. Return a JSON object with: {complete: boolean, missing_items: string[], message: string}`

export async function analyzeJobCompleteness(jobData: {
  job_name: string
  plan_type: string
  description: string | null
  job_site_address: string
}): Promise<AIJobCheckResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const userContent = `
Job Name: ${jobData.job_name}
Plan Type: ${jobData.plan_type}
Job Site Address: ${jobData.job_site_address}
Description: ${jobData.description || '(no description provided)'}
  `.trim()

  // Use tool_choice to force structured JSON output without requiring Zod
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
    tools: [
      {
        name: 'report_analysis',
        description: 'Report the job completeness analysis result',
        input_schema: {
          type: 'object' as const,
          properties: {
            complete: {
              type: 'boolean',
              description: 'Whether the job has all required information to create permit-ready plans',
            },
            missing_items: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of specific missing items (empty array if complete)',
            },
            message: {
              type: 'string',
              description: 'Human-readable summary of what is missing or confirmation that the submission is complete',
            },
          },
          required: ['complete', 'missing_items', 'message'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'report_analysis' },
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('AI did not return a structured analysis')
  }

  return toolUse.input as AIJobCheckResult
}
