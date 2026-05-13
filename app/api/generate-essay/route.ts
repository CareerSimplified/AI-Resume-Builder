import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/services/ai.service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, topic, answers, selectedPrompt } = body

    if (!topic) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 })
    }

    if (action === 'GET_QUESTIONS') {
      const questions = await aiService.generateEssayQuestions(topic)
      return NextResponse.json({ success: true, questions })
    }

    if (action === 'GET_PROMPTS') {
      if (!answers || !Array.isArray(answers)) {
        return NextResponse.json({ error: 'Missing answers' }, { status: 400 })
      }
      const prompts = await aiService.generateEssayPrompts(topic, answers)
      return NextResponse.json({ success: true, prompts })
    }

    if (action === 'GENERATE_ESSAY') {
      if (!selectedPrompt || !answers) {
        return NextResponse.json({ error: 'Missing data' }, { status: 400 })
      }
      const essay = await aiService.generateEssay(topic, selectedPrompt, answers)
      return NextResponse.json({ success: true, essay })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('[API/essay] Fatal Error:', error.message)
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 })
  }
}
