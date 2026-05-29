import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const promptId = searchParams.get('promptId')
    if (!promptId) return NextResponse.json({ error: 'promptId required' }, { status: 400 })

    const experiments = await prisma.experiment.findMany({
      where: { promptId },
      orderBy: { createdAt: 'desc' },
      include: {
        versionA: { select: { versionNumber: true, model: true, tag: true } },
        versionB: { select: { versionNumber: true, model: true, tag: true } },
        _count: { select: { testCases: true, results: true } },
      },
    })
    return NextResponse.json(experiments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch experiments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, promptId, versionAId, versionBId, testCases } = body

    if (!name?.trim() || !promptId || !versionAId || !versionBId) {
      return NextResponse.json({ error: 'name, promptId, versionAId, versionBId required' }, { status: 400 })
    }
    if (!testCases || testCases.length < 1) {
      return NextResponse.json({ error: 'At least one test case required' }, { status: 400 })
    }

    const experiment = await prisma.experiment.create({
      data: {
        name: name.trim(),
        promptId,
        versionAId,
        versionBId,
        status: 'pending',
        testCases: {
          create: testCases.map((tc: { inputVariables: Record<string, string>; expectedOutput?: string }) => ({
            inputVariables: JSON.stringify(tc.inputVariables || {}),
            expectedOutput: tc.expectedOutput?.trim() || null,
          })),
        },
      },
      include: { testCases: true },
    })

    return NextResponse.json(experiment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create experiment' }, { status: 500 })
  }
}
