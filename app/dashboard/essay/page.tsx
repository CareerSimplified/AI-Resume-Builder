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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                AI <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Essay</span> Generator
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                Transform your ideas into professionally structured essays in seconds.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-none shadow-xl bg-white dark:bg-gray-900 rounded-3xl overflow-hidden">
                <CardBody className="p-6 sm:p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Topic or Question</label>
                    <textarea
                      className="w-full h-48 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-white font-medium"
                      placeholder="e.g., The impact of AI on modern healthcare and patient outcomes..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Essay Style</label>
                    <div className="space-y-3">
                      {PROMPT_TYPES.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPrompt(p.id)}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all group ${
                            selectedPrompt === p.id
                              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                              : 'border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 bg-white dark:bg-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <BookOpen className={`w-4 h-4 ${selectedPrompt === p.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-400'}`} />
                            <span className={`font-black text-sm ${selectedPrompt === p.id ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'}`}>
                              {p.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium pl-7">
                            {p.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    fullWidth
                    size="lg"
                    className="h-14 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20"
                    disabled={isGenerating || !question.trim()}
                    onClick={handleGenerate}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Essay
                      </>
                    )}
                  </Button>
                </CardBody>
              </Card>
            </div>

            {/* Output Section */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-2xl bg-white dark:bg-gray-900 rounded-3xl overflow-hidden min-h-[600px] flex flex-col">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6 border-b dark:border-gray-800 flex items-center justify-between">
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">Generated Manuscript</h3>
                  {essay && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-500 transition-colors"
                        title="Copy Text"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black"
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
                  )}
                </div>

                <CardBody className="flex-1 p-8 sm:p-12 overflow-y-auto">
                  {isGenerating ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                      <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center animate-pulse">
                        <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">Composing your essay...</h4>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Our AI is structuring arguments and refining prose.</p>
                      </div>
                    </div>
                  ) : essay ? (
                    <div className="prose dark:prose-invert max-w-none prose-headings:font-black prose-p:font-medium prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-headings:text-gray-900 dark:prose-headings:text-white prose-indigo">
                      <div className="whitespace-pre-wrap">{essay}</div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
                      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                        <BookOpen className="w-12 h-12 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-black text-gray-400 uppercase tracking-tighter">Enter a topic to begin</h4>
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
