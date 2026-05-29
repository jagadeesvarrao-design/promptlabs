import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { runPrompt, judgeQuality, fillTemplate } from '@/lib/llm'

export const maxDuration = 120

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const useJudge = body.useJudge ?? true

    // Fetch experiment with all required data
    const experiment = await prisma.experiment.findUnique({
      where: { id },
      include: { versionA: true, versionB: true, testCases: true },
    })
    if (!experiment) return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    if (experiment.status === 'completed') {
      return NextResponse.json({ error: 'Experiment already completed' }, { status: 400 })
    }

    // Mark as running
    await prisma.experiment.update({ where: { id }, data: { status: 'running' } })

    const versions = [experiment.versionA, experiment.versionB]

    // Run all test cases for both versions
    for (const testCase of experiment.testCases) {
      const variables = JSON.parse(testCase.inputVariables) as Record<string, string>

      for (const version of versions) {
        try {
          const result = await runPrompt({
            systemMessage: version.systemMessage,
            userTemplate: version.userTemplate,
            variables,
            modelId: version.model,
            temperature: version.temperature,
            maxTokens: version.maxTokens,
          })

          let qualityScore: number | null = null
          if (useJudge) {
            const userInput = fillTemplate(version.userTemplate, variables)
            qualityScore = await judgeQuality({
              userInput,
              output: result.output,
              expectedOutput: testCase.expectedOutput || undefined,
              rubric: experiment.evaluationRubric || undefined,
            })
          }

          await prisma.result.create({
            data: {
              experimentId: id,
              testCaseId: testCase.id,
              versionId: version.id,
              output: result.output,
              latencyMs: result.latencyMs,
              promptTokens: result.promptTokens,
              completionTokens: result.completionTokens,
              estimatedCostUsd: result.estimatedCostUsd,
              qualityScore,
            },
          })
        } catch (err) {
          // Log error but continue running other test cases
          console.error(`Failed test case ${testCase.id} for version ${version.id}:`, err)
        }
      }
    }

    // Mark as completed
    await prisma.experiment.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
    })

    return NextResponse.json({ success: true, message: 'Experiment completed' })
  } catch (error: unknown) {
    await prisma.experiment.update({ where: { id: (await params).id }, data: { status: 'pending' } })
    const message = error instanceof Error ? error.message : 'Failed to run experiment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
