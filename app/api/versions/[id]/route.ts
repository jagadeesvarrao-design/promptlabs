import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { tag } = body

    const validTags = ['draft', 'staging', 'production']
    if (!tag || !validTags.includes(tag)) {
      return NextResponse.json({ error: 'Valid tag required: draft | staging | production' }, { status: 400 })
    }

    const version = await prisma.promptVersion.update({
      where: { id },
      data: { tag },
    })
    return NextResponse.json(version)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update version tag' }, { status: 500 })
  }
}
