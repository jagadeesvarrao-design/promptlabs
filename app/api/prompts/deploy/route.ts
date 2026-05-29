import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]

    const apiKey = await prisma.apiKey.findUnique({ where: { key: token } })
    if (!apiKey) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 })
    }

    // Update lastUsed asynchronously
    prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } }).catch(() => {})

    const { searchParams } = new URL(req.url)
    const promptId = searchParams.get('promptId')
    const tag = searchParams.get('tag') || 'production'

    if (!promptId) {
      return NextResponse.json({ error: 'promptId is required' }, { status: 400 })
    }

    const version = await prisma.promptVersion.findFirst({
      where: {
        promptId,
        tag,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        versionNumber: true,
        systemMessage: true,
        userTemplate: true,
        model: true,
        temperature: true,
        maxTokens: true,
        tag: true,
      },
    })

    if (!version) {
      return NextResponse.json({ error: `No version found with tag: ${tag}` }, { status: 404 })
    }

    return NextResponse.json(version)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deployed prompt' }, { status: 500 })
  }
}
