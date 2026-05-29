import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        versions: { orderBy: { versionNumber: 'desc' } },
        experiments: {
          orderBy: { createdAt: 'desc' },
          include: {
            versionA: { select: { versionNumber: true, tag: true } },
            versionB: { select: { versionNumber: true, tag: true } },
          },
        },
      },
    })
    if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(prompt)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.prompt.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 })
  }
}
