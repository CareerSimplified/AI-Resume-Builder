import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/services/ai.service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question, promptType } = body

    if (!question) {
      return NextResponse.json({ error: 'Missing question/topic' }, { status: 400 })
    }

    console.log(`[API/essay] Generating essay for topic: ${question.substring(0, 50)}...`)
    
    const essay = await aiService.generateEssay(question, promptType || 'Standard Academic')

    return NextResponse.json({ 
      success: true, 
      essay 
    })
  } catch (error: any) {
    console.error('[API/essay] Fatal Error:', error.message)
    return NextResponse.json({ error: error.message || 'Essay generation failed' }, { status: 500 })
  }
}
