import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

    const prompts = await prisma.prompt.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { versions: true, experiments: true } },
        versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
      },
    })
    return NextResponse.json(prompts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, projectId } = body
    if (!name?.trim() || !projectId) {
      return NextResponse.json({ error: 'name and projectId are required' }, { status: 400 })
    }

    const prompt = await prisma.prompt.create({
      data: { name: name.trim(), description: description?.trim() || null, projectId },
    })
    return NextResponse.json(prompt, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
  }
}
