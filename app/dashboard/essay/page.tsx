'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { userSidebarItems as sidebarItems } from '@/config/sidebar'
import { 
  Sparkles, Send, Copy, Download, BookOpen, Loader2, 
  RefreshCw, FileText, CheckCircle2, ArrowRight, ArrowLeft,
  MessageSquare, HelpCircle, PenTool, Layout
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { clsx } from 'clsx'

type Step = 'TOPIC' | 'QUESTIONS' | 'PROMPTS' | 'RESULTS'

export default function EssayPage() {
  const [step, setStep] = useState<Step>('TOPIC')
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ question: string, answer: string }[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [prompts, setPrompts] = useState<{ id: string, title: string, description: string }[]>([])
  const [selectedPromptId, setSelectedPromptId] = useState('')
  const [essay, setEssay] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { success, error } = useToast()

  const handleStartQuestions = async () => {
    if (!topic.trim()) {
      error('Please enter a topic first.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/generate-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GET_QUESTIONS', topic })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate questions')
      
      setQuestions(data.questions)
      setStep('QUESTIONS')
      success('Let\'s refine your thoughts with a few questions.')
    } catch (err: any) {
      error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextQuestion = () => {
    if (!currentAnswer.trim()) {
      error('Please provide an answer.')
      return
    }

    const newAnswers = [...answers, { question: questions[currentQuestionIndex], answer: currentAnswer }]
    setAnswers(newAnswers)
    setCurrentAnswer('')

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      handleGeneratePrompts(newAnswers)
    }
  }

  const handleGeneratePrompts = async (finalAnswers: { question: string, answer: string }[]) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/generate-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GET_PROMPTS', topic, answers: finalAnswers })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate prompts')
      
      setPrompts(data.prompts)
      setStep('PROMPTS')
      success('Prompts generated! Select one to start writing.')
    } catch (err: any) {
      error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateEssay = async () => {
    if (!selectedPromptId) {
      error('Please select a prompt.')
      return
    }

    setIsLoading(true)
    try {
      const selectedPrompt = prompts.find(p => p.id === selectedPromptId)
      const res = await fetch('/api/generate-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'GENERATE_ESSAY', 
          topic, 
          answers, 
          selectedPrompt: selectedPrompt?.title 
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate essay')
      
      setEssay(data.essay)
      setStep('RESULTS')
      success('Your masterpiece is ready!')
    } catch (err: any) {
      error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setStep('TOPIC')
    setTopic('')
    setQuestions([])
    setCurrentQuestionIndex(0)
    setAnswers([])
    setCurrentAnswer('')
    setPrompts([])
    setSelectedPromptId('')
    setEssay('')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(essay)
    success('Copied to clipboard!')
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 sm:mb-12 overflow-x-auto py-4 scrollbar-hide">
      {[
        { id: 'TOPIC', label: 'Topic', icon: BookOpen },
        { id: 'QUESTIONS', label: 'Inquiry', icon: HelpCircle },
        { id: 'PROMPTS', label: 'Select', icon: PenTool },
        { id: 'RESULTS', label: 'Finish', icon: CheckCircle2 },
      ].map((s, idx, arr) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center group flex-shrink-0">
            <div className={clsx(
              "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
              step === s.id ? "bg-indigo-600 text-white scale-110 shadow-indigo-500/30 ring-4 ring-indigo-500/10" : 
              arr.findIndex(x => x.id === step) > idx ? "bg-emerald-500 text-white" : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-100 dark:border-slate-700"
            )}>
              <s.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className={clsx(
              "mt-2 text-[10px] font-black uppercase tracking-widest transition-colors",
              step === s.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-600"
            )}>{s.label}</span>
          </div>
          {idx < arr.length - 1 && (
            <div className={clsx(
              "w-8 sm:w-12 md:w-20 lg:w-32 h-[2px] mx-2 sm:mx-4 mb-4 transition-colors duration-500 flex-shrink-0",
              arr.findIndex(x => x.id === step) > idx ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] p-4 sm:p-6 md:p-10 lg:p-16 font-sans selection:bg-indigo-500/30">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Advanced AI Suite</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight sm:leading-none mb-4">
              Master <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">Manuscript</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-base sm:text-lg max-w-2xl mx-auto px-4">
              From raw concept to structured masterpiece. Our multi-step linguistic engine crafts high-impact essays through guided inquiry.
            </p>
          </div>

          {renderStepIndicator()}

          <div className="transition-all duration-500 ease-in-out">
            {/* STEP 1: TOPIC */}
            {step === 'TOPIC' && (
              <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto">
                <CardBody className="p-6 sm:p-10 md:p-12 space-y-8">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Step 1: Define Your Core Theme
                    </label>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">What is your essay topic?</h3>
                    <textarea
                      className="w-full h-48 sm:h-56 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 placeholder:font-normal leading-relaxed text-lg"
                      placeholder="e.g., The ethical implications of neural-link technologies on human identity and privacy..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <Button
                    fullWidth
                    size="lg"
                    className="h-16 rounded-3xl font-black text-lg shadow-2xl shadow-indigo-600/30 bg-gradient-to-br from-indigo-600 to-violet-700 hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
                    disabled={isLoading || !topic.trim()}
                    onClick={handleStartQuestions}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Initializing Engine...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span>Continue to Inquiry</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </CardBody>
              </Card>
            )}

            {/* STEP 2: QUESTIONS */}
            {step === 'QUESTIONS' && (
              <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/20 animate-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
                <CardBody className="p-6 sm:p-10 md:p-12 space-y-8">
                  <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      Inquiry Phase ({currentQuestionIndex + 1}/{questions.length})
                    </label>
                    <div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {questions[currentQuestionIndex]}
                    </h3>
                    <textarea
                      className="w-full h-40 sm:h-48 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 placeholder:font-normal leading-relaxed text-lg"
                      placeholder="Share your thoughts here..."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="h-16 px-8 rounded-3xl font-black border-2"
                      onClick={() => {
                        if (currentQuestionIndex > 0) {
                          setCurrentQuestionIndex(prev => prev - 1)
                          setCurrentAnswer(answers[currentQuestionIndex - 1]?.answer || '')
                          const newAnswers = [...answers]
                          newAnswers.pop()
                          setAnswers(newAnswers)
                        } else {
                          setStep('TOPIC')
                        }
                      }}
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" /> Back
                    </Button>
                    <Button
                      fullWidth
                      size="lg"
                      className="h-16 rounded-3xl font-black text-lg bg-indigo-600 shadow-xl shadow-indigo-600/20"
                      disabled={isLoading || !currentAnswer.trim()}
                      onClick={handleNextQuestion}
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                       currentQuestionIndex === questions.length - 1 ? 'Generate Prompts' : 'Next Question'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* STEP 3: PROMPTS */}
            {step === 'PROMPTS' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">Select Your Thesis Direction</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">We've synthesized 3 potential prompts based on your insights.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {prompts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPromptId(p.id)}
                      className={clsx(
                        "text-left p-6 sm:p-8 rounded-[2.5rem] border-2 transition-all duration-500 relative group min-h-[250px] flex flex-col justify-between",
                        selectedPromptId === p.id 
                          ? "border-indigo-500 bg-white dark:bg-slate-900 shadow-2xl shadow-indigo-500/20 scale-105 z-10" 
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-indigo-200 dark:hover:border-indigo-800"
                      )}
                    >
                      <div className="space-y-4">
                        <div className={clsx(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                          selectedPromptId === p.id ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 shadow-sm"
                        )}>
                          <PenTool className="w-6 h-6" />
                        </div>
                        <h3 className={clsx("text-xl font-black leading-tight", selectedPromptId === p.id ? "text-indigo-600" : "text-slate-900 dark:text-white")}>
                          {p.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                          {p.description}
                        </p>
                      </div>
                      <div className={clsx(
                        "mt-6 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest",
                        selectedPromptId === p.id ? "text-indigo-600" : "text-slate-400 opacity-0 group-hover:opacity-100"
                      )}>
                        {selectedPromptId === p.id ? 'Selected' : 'Select Prompt'} <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-center pt-8">
                  <Button
                    size="lg"
                    className="h-16 px-12 rounded-3xl font-black text-lg bg-gradient-to-r from-indigo-600 to-violet-600 shadow-2xl shadow-indigo-600/30"
                    disabled={isLoading || !selectedPromptId}
                    onClick={handleGenerateEssay}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Composing Masterpiece...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5" />
                        <span>Craft Final Manuscript</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: RESULTS */}
            {step === 'RESULTS' && (
              <div className="space-y-8 animate-in zoom-in-95 duration-700">
                <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden min-h-[800px] flex flex-col relative">
                  <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]" />
                  
                  <div className="relative z-10 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-md p-6 sm:p-8 md:px-10 border-b dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-700">
                         <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Final Manuscript</h3>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Synthesized with Elite AI</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                      <button
                        onClick={handleReset}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-3 sm:px-6 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl text-slate-500 shadow-sm transition-all border border-slate-100 dark:border-slate-700 text-xs font-black uppercase tracking-widest"
                      >
                        <RefreshCw className="w-4 h-4" /> New
                      </button>
                      <button
                        onClick={handleCopy}
                        className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl text-slate-500 shadow-sm transition-all border border-slate-100 dark:border-slate-700"
                        title="Copy to Clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl text-xs font-black shadow-lg hover:translate-y-[-1px] active:translate-y-0 transition-all uppercase tracking-widest"
                        onClick={() => {
                          const blob = new Blob([essay], { type: 'text/markdown' })
                          const url = window.URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `Essay_${new Date().getTime()}.md`
                          a.click()
                        }}
                      >
                        <Download className="w-4 h-4" /> Export
                      </button>
                    </div>
                  </div>

                  <CardBody className="relative z-10 flex-1 p-6 sm:p-12 md:p-16 lg:p-24 overflow-y-auto custom-scrollbar">
                    <div className="prose dark:prose-invert max-w-none prose-headings:font-black prose-p:font-medium prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:text-slate-900 dark:prose-headings:text-white prose-indigo prose-lg leading-relaxed">
                      <div className="whitespace-pre-wrap">{essay}</div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
