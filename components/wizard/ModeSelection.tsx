import React from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Card, CardBody } from '@/components/Card'
import { Badge, Button } from '@/components/ui'
import { clsx } from 'clsx'

interface ModeSelectionProps {
  mode: 'MBA_POLISH' | 'JD_ALIGNMENT' | null
  setMode: (mode: 'MBA_POLISH' | 'JD_ALIGNMENT') => void
  targetStandard: string
  setTargetStandard: (std: string) => void
  onNext: () => void
}

export function ModeSelection({ mode, setMode, targetStandard, setTargetStandard, onNext }: ModeSelectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 lowercase italic">
          What would you like to do <span className="text-indigo-600">today?</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          Choose a mode — you can switch anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div 
          onClick={() => setMode('MBA_POLISH')}
          className="group relative cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
          <Card className={clsx(
            "relative h-full border-2 transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden",
            mode === 'MBA_POLISH' ? "border-indigo-600 shadow-2xl scale-[1.02]" : "border-transparent"
          )}>
            <CardBody className="p-10">
              <Badge variant="secondary" className="mb-4">Free · 2/day</Badge>
              <h3 className="text-2xl font-black mb-4">MBA Format Polish</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                Restructures your rough draft into ISB / IIM / INSEAD one-page standard. No job description needed.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Polished resume
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> ATS score card
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> DOCX download
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div 
          onClick={() => setMode('JD_ALIGNMENT')}
          className="group relative cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
          <Card className={clsx(
            "relative h-full border-2 transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden",
            mode === 'JD_ALIGNMENT' ? "border-emerald-500 shadow-2xl scale-[1.02]" : "border-transparent"
          )}>
            <CardBody className="p-10">
              <Badge variant="primary" className="mb-4">Free + Pro</Badge>
              <h3 className="text-2xl font-black mb-4">JD Alignment Suite</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                Aligns your resume to a specific job. Generates match score, keywords, cover letter, and interview prep.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Match score + gap analysis
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Keywords · Cover letter
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-400">
                  <Badge variant="primary" className="text-[10px] scale-90">Pro</Badge> Interview prep + 30-60-90
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Target Standard</label>
            <select 
              value={targetStandard}
              onChange={(e) => setTargetStandard(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-slate-200 focus:ring-0 focus:border-indigo-600 transition-all"
            >
              <option value="isb-iim">ISB / IIM A·B·C (recommended)</option>
              <option value="insead">INSEAD / Harvard / LBS</option>
              <option value="standard">Standard Global Corporate</option>
            </select>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-4">Free tier · 2 uses today</p>
            <Button 
              fullWidth 
              variant="primary"
              size="lg" 
              onClick={onNext}
              className="h-16 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 font-black text-lg"
            >
              Continue <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
      </div>
    </div>
  )
}
