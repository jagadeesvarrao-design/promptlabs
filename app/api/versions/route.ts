import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { promptId, systemMessage, userTemplate, model, temperature, maxTokens, commitMessage } = body

    if (!promptId || !userTemplate?.trim()) {
      return NextResponse.json({ error: 'promptId and userTemplate are required' }, { status: 400 })
    }

    // Get current highest version number for this prompt
    const latest = await prisma.promptVersion.findFirst({
      where: { promptId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    })

    const versionNumber = (latest?.versionNumber ?? 0) + 1

    const version = await prisma.promptVersion.create({
      data: {
        promptId,
        versionNumber,
        systemMessage: systemMessage?.trim() || null,
        userTemplate: userTemplate.trim(),
        model: model || 'gemini-2.5-flash',
        temperature: temperature ?? 0.7,
        maxTokens: maxTokens ?? 500,
        commitMessage: commitMessage?.trim() || null,
        tag: 'draft',
      },
    })

    // Update prompt's updatedAt
    await prisma.prompt.update({ where: { id: promptId }, data: { updatedAt: new Date() } })

    return NextResponse.json(version, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save version' }, { status: 500 })
  }
}
