import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const experiment = await prisma.experiment.findUnique({
      where: { id },
      include: {
        versionA: true,
        versionB: true,
        testCases: {
          include: {
            results: {
              include: { version: { select: { versionNumber: true, model: true } } },
            },
          },
        },
        results: {
          include: {
            version: { select: { versionNumber: true, model: true } },
            testCase: { select: { inputVariables: true, expectedOutput: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!experiment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(experiment)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch experiment' }, { status: 500 })
  }
}
