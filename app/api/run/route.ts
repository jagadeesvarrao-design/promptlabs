import { NextRequest, NextResponse } from 'next/server'
import { runPrompt } from '@/lib/llm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { systemMessage, userTemplate, variables, model, temperature, maxTokens } = body

    if (!userTemplate?.trim()) {
      return NextResponse.json({ error: 'userTemplate is required' }, { status: 400 })
    }

    const result = await runPrompt({
      systemMessage: systemMessage || null,
      userTemplate,
      variables: variables || {},
      modelId: model || 'gemini-2.5-flash',
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 500,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to run prompt'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
