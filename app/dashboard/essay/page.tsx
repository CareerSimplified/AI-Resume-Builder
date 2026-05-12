'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { userSidebarItems as sidebarItems } from '@/config/sidebar'
import { Sparkles, Send, Copy, Download, BookOpen, Loader2, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

const PROMPT_TYPES = [
  { id: 'academic', label: 'Standard Academic', description: 'Formal tone, objective analysis, and scholarly structure.' },
  { id: 'narrative', label: 'Personal Narrative', description: 'Story-driven, reflective, and focuses on personal experience.' },
  { id: 'argumentative', label: 'Argumentative/Persuasive', description: 'Strong thesis, evidence-based arguments, and counter-points.' },
  { id: 'analytical', label: 'Analytical Review', description: 'Deep dive into a specific topic, breaking down complex ideas.' },
  { id: 'creative', label: 'Creative/Exploratory', description: 'Experimental style, unique perspectives, and evocative language.' }
]

export default function EssayPage() {
  const [question, setQuestion] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPT_TYPES[0].id)
  const [isGenerating, setIsGenerating] = useState(false)
  const [essay, setEssay] = useState('')
  const { success, error } = useToast()

  const handleGenerate = async () => {
    if (!question.trim()) {
      error('Please enter a question or topic first.')
      return
    }

    setIsGenerating(true)
    setEssay('')

    try {
      const res = await fetch('/api/generate-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question, 
          promptType: PROMPT_TYPES.find(p => p.id === selectedPrompt)?.label 
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate essay')

      setEssay(data.essay)
      success('Essay generated successfully!')
    } catch (err: any) {
      error(err.message || 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(essay)
    success('Copied to clipboard!')
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] p-4 sm:p-8 lg:p-12 font-sans selection:bg-indigo-500/30">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header section with refined typography and background glow */}
          <div className="relative">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
            
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Advanced AI Suite</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.9]">
                  Master <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">Manuscript</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl">
                  Transform raw concepts into scholarly, structured essays with elite AI precision.
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Input & Prompt Control Section (4 cols) */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/20">
                <CardBody className="p-8 space-y-8">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Topic & Context
                    </label>
                    <textarea
                      className="w-full h-56 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 placeholder:font-normal leading-relaxed"
                      placeholder="e.g., The ethical implications of neural-link technologies on human identity and privacy..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      Scholarly Style
                    </label>
                    <div className="space-y-2.5">
                      {PROMPT_TYPES.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPrompt(p.id)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative group ${
                            selectedPrompt === p.id
                              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/5'
                              : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 bg-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${selectedPrompt === p.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500'}`}>
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <span className={`font-black text-xs uppercase tracking-tight block ${selectedPrompt === p.id ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                {p.label}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {p.description.split(',')[0]}
                              </span>
                            </div>
                          </div>
                          {selectedPrompt === p.id && (
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    fullWidth
                    size="lg"
                    className="h-16 rounded-3xl font-black text-lg shadow-2xl shadow-indigo-600/30 bg-gradient-to-br from-indigo-600 to-violet-700 hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
                    disabled={isGenerating || !question.trim()}
                    onClick={handleGenerate}
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Architecting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Masterpiece</span>
                      </div>
                    )}
                  </Button>
                </CardBody>
              </Card>
            </div>

            {/* Output Canvas (8 cols) */}
            <div className="lg:col-span-8">
              <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden min-h-[750px] flex flex-col border border-white/10 relative">
                {/* Visual texture for the paper feel */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]" />
                
                <div className="relative z-10 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-md p-6 sm:px-10 border-b dark:border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                       <FileText className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Manuscript Preview</h3>
                      {essay && <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Analysis Complete</p>}
                    </div>
                  </div>
                  
                  {essay && (
                    <div className="flex gap-3">
                      <button
                        onClick={handleCopy}
                        className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl text-slate-500 shadow-sm transition-all border border-slate-100 dark:border-slate-700"
                        title="Copy to Clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        className="flex items-center gap-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl text-xs font-black shadow-lg hover:translate-y-[-1px] active:translate-y-0 transition-all"
                        onClick={() => {
                          const blob = new Blob([essay], { type: 'text/markdown' })
                          const url = window.URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `Essay_${new Date().getTime()}.md`
                          a.click()
                        }}
                      >
                        <Download className="w-4 h-4" /> Export MD
                      </button>
                    </div>
                  )}
                </div>

                <CardBody className="relative z-10 flex-1 p-8 sm:p-14 lg:p-20 overflow-y-auto custom-scrollbar">
                  {isGenerating ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
                        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex items-center justify-center relative">
                          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Composing Manuscript</h4>
                        <div className="flex justify-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                          ))}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-sm mx-auto">
                          Our linguistic engines are structuring your arguments and refining semantic coherence.
                        </p>
                      </div>
                    </div>
                  ) : essay ? (
                    <div className="prose dark:prose-invert max-w-none prose-headings:font-black prose-p:font-medium prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:text-slate-900 dark:prose-headings:text-white prose-indigo prose-lg leading-relaxed">
                      <div className="whitespace-pre-wrap">{essay}</div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-20">
                      <div className="relative group">
                         <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 blur-2xl rounded-full group-hover:bg-indigo-500/10 transition-colors" />
                         <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center mb-6 relative border border-slate-200 dark:border-slate-800">
                            <BookOpen className="w-14 h-14 text-slate-300 dark:text-slate-600" />
                         </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Awaiting Command</h4>
                        <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">Input a topic to synthesize a scholarly manuscript.</p>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
