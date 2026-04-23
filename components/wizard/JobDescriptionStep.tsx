import React from 'react'
import { Zap } from 'lucide-react'
import { Card, CardBody } from '@/components/Card'
import { Button } from '@/components/ui'

interface JobDescriptionStepProps {
  jdData: {
    company: string
    role: string
    description: string
  }
  setJdData: (data: any) => void
  jdWordCount: number
  onBack: () => void
  onNext: () => void
}

export function JobDescriptionStep({ jdData, setJdData, jdWordCount, onBack, onNext }: JobDescriptionStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-4xl font-black mb-4">Add the job description</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400">The full JD gives the most accurate alignment — don't trim it.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="bg-white dark:bg-slate-900 shadow-xl border-none">
          <CardBody className="p-8 md:p-12 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Company name</label>
                <input 
                  type="text" 
                  placeholder="e.g. McKinsey & Company"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-emerald-500 transition-all font-bold"
                  value={jdData.company}
                  onChange={(e) => setJdData({...jdData, company: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Role title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Associate Consultant"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 focus:border-emerald-500 transition-all font-bold"
                  value={jdData.role}
                  onChange={(e) => setJdData({...jdData, role: e.target.value})}
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Full job description</label>
              <textarea 
                className="w-full h-80 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-3xl p-8 focus:border-emerald-500 transition-all placeholder:italic"
                placeholder="Paste the complete job description here. Include responsibilities, requirements, preferred qualifications, and any skills or tools mentioned…"
                value={jdData.description}
                onChange={(e) => setJdData({...jdData, description: e.target.value})}
              ></textarea>
               <div className="absolute bottom-6 right-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {jdWordCount} / ~500 minimum recommended
                </div>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-2xl flex gap-4 items-center">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center flex-shrink-0">
                   <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed">
                   More detail = better keyword matching, more accurate STAR answers, and a stronger cover letter.
                </p>
            </div>

            <div className="flex justify-between mt-12 gap-4">
              <Button variant="secondary" onClick={onBack} className="rounded-2xl h-14 px-8 font-black">← Back</Button>
              <Button 
                onClick={onNext} 
                disabled={!jdData.role || !jdData.description}
                className="flex-1 h-14 bg-emerald-600 text-white rounded-2xl font-black text-lg"
              >
                Analyze & Generate →
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
