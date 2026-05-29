import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const AVAILABLE_MODELS = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    description: 'Most capable · Best quality',
    badge: 'Recommended',
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    description: 'Fastest · Most economical',
    badge: 'Fastest',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    description: 'Reliable · Stable baseline',
    badge: 'Stable',
  },
]

export interface RunResult {
  output: string
  latencyMs: number
  promptTokens: number
  completionTokens: number
  estimatedCostUsd: number
}

/** Replace {variable} placeholders in a template string */
export function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return result
}

/** Extract unique variable names from {variable} placeholders */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{([^}]+)\}/g) || []
  return [...new Set(matches.map((m) => m.slice(1, -1)))]
}

/** Run a prompt version against the Gemini API */
export async function runPrompt(params: {
  systemMessage: string | null
  userTemplate: string
  variables: Record<string, string>
  modelId: string
  temperature: number
  maxTokens: number
}): Promise<RunResult> {
  const { systemMessage, userTemplate, variables, modelId, temperature, maxTokens } = params

  const start = Date.now()
  const userContent = fillTemplate(userTemplate, variables)
  const modelConfig = AVAILABLE_MODELS.find((m) => m.id === modelId) || AVAILABLE_MODELS[0]

  const model = genAI.getGenerativeModel({
    model: modelId,
    generationConfig: { temperature, maxOutputTokens: maxTokens },
    ...(systemMessage ? { systemInstruction: systemMessage } : {}),
  })

  const result = await model.generateContent(userContent)
  const response = result.response
  const latencyMs = Date.now() - start

  const output = response.text()
  const promptTokens = response.usageMetadata?.promptTokenCount || 0
  const completionTokens = response.usageMetadata?.candidatesTokenCount || 0
  const estimatedCostUsd =
    (promptTokens / 1_000_000) * modelConfig.inputCostPer1M +
    (completionTokens / 1_000_000) * modelConfig.outputCostPer1M

  return { output, latencyMs, promptTokens, completionTokens, estimatedCostUsd }
}

/** Use Gemini Flash Lite as a judge to score output quality 1-5 */
export async function judgeQuality(params: {
  userInput: string
  output: string
  expectedOutput?: string
}): Promise<number> {
  const { userInput, output, expectedOutput } = params

  const judgePrompt = expectedOutput
    ? `You are an expert AI output evaluator. Rate the following AI response on a scale of 1 to 5.

User Input: ${userInput}
Expected Output: ${expectedOutput}
Actual Output: ${output}

Score based on: accuracy vs expected, relevance, and clarity.
Respond with ONLY a single decimal number between 1 and 5. Example: 4.2`
    : `You are an expert AI output evaluator. Rate the following AI response on a scale of 1 to 5.

User Input: ${userInput}
AI Output: ${output}

Score based on: relevance, coherence, helpfulness, and overall quality.
Respond with ONLY a single decimal number between 1 and 5. Example: 3.8`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
    const result = await model.generateContent(judgePrompt)
    const text = result.response.text().trim()
    const score = parseFloat(text)
    if (isNaN(score) || score < 1 || score > 5) return 3.0
    return Math.round(score * 10) / 10
  } catch {
    return 3.0
  }
}
