import React from 'react'
import { Edit3, Target, Search, FileSearch, MessageSquare, Copy, Zap, GraduationCap, Sparkles } from 'lucide-react'
import { Card, CardBody } from '@/components/Card'
import { Badge, Button } from '@/components/ui'
import { clsx } from 'clsx'
import { useRouter } from 'next/navigation'

interface ResultsDashboardProps {
  analysisResult: any
  mode: string
  jdData: any
  activeResultTab: string
  setActiveResultTab: (tab: string) => void
  onStartOver: () => void
}

export function ResultsDashboard({
  analysisResult,
  mode,
  jdData,
  activeResultTab,
  setActiveResultTab,
  onStartOver
}: ResultsDashboardProps) {
  const router = useRouter()
  
  if (!analysisResult) return null

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
         <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {mode === 'JD_ALIGNMENT' ? `${jdData.company} ${jdData.role}` : 'MBA Master Resume'}
            </h1>
         </div>
         <div className="flex gap-2">
           <Button variant="secondary" onClick={onStartOver} className="rounded-xl h-11 px-6 font-black scale-90">← Start over</Button>
         </div>
      </div>

      <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-x-auto scroller-hidden">
         {[
           { id: 'resume', label: 'Tweaked resume', icon: Edit3, free: true },
           { id: 'score', label: 'Match score', icon: Target, free: true },
           { id: 'gaps', label: 'Keywords', icon: Search, free: false },
           { id: 'cover', label: 'Cover letter', icon: FileSearch, free: false },
           { id: 'prep', label: 'Interview prep', icon: MessageSquare, free: false },
         ].map(tab => (
           <button
            key={tab.id}
            onClick={() => setActiveResultTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-6 py-4 rounded-xl font-black whitespace-nowrap transition-all text-sm",
              activeResultTab === tab.id ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
            )}
           >
             {!tab.free && <Badge variant="primary" className="text-[8px] scale-75 -ml-2">Pro</Badge>} <tab.label />
           </button>
         ))}
      </div>

      <div className="min-h-[500px]">
         {activeResultTab === 'resume' && (
           <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b dark:border-slate-800 flex items-center justify-between">
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">JD-aligned resume · plain text</h3>
                      <div className="flex gap-2">
                          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500" title="Copy"><Copy className="w-4 h-4" /></button>
                          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-lg shadow-indigo-600/20">↓ DOCX</button>
                      </div>
                  </div>
                  <CardBody className="p-10">
                      <div className="font-serif text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap max-h-[800px] overflow-y-auto">
                         {analysisResult.rewrittenResume}
                      </div>
                  </CardBody>
              </Card>

              <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none rounded-3xl p-8 text-center">
                      <h4 className="text-xs font-black uppercase tracking-widest opacity-80 mb-6">Unlock keywords, cover letter & interview prep guide</h4>
                      <Button fullWidth variant="secondary" onClick={() => router.push('/dashboard/profile')} className="bg-white text-indigo-600 h-14 rounded-2xl font-black shadow-xl border-none">Upgrade to Pro →</Button>
                  </Card>

                  <div className="p-8 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-3xl bg-indigo-50/20 dark:bg-indigo-900/10">
                     <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4 text-sm">
                        <Zap className="w-4 h-4 text-indigo-600" /> Top priority fix
                     </h4>
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                        {analysisResult.suggestions?.[0] || "Add metrics to quantify your impact in recent roles."}
                     </p>
                  </div>
              </div>
           </div>
         )}

         {activeResultTab === 'score' && (
           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border-none shadow-xl rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900">
                 <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                     <svg className="w-full h-full -rotate-90">
                       <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                       <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="552.6" strokeDashoffset={552.6 - (552.6 * (analysisResult.match_score?.score || analysisResult.match_score) / 100)} className="text-indigo-600 transition-all duration-1000" />
                     </svg>
                     <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-black text-slate-900 dark:text-white">{analysisResult.match_score?.score || analysisResult.match_score}</span>
                        <span className="text-xs font-bold text-slate-400">/100</span>
                     </div>
                 </div>
                 <h3 className="text-2xl font-black mb-2 text-emerald-500">Good match</h3>
                 <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Match score</p>
              </Card>

              <Card className="border-none shadow-xl rounded-3xl p-10 space-y-8 bg-white dark:bg-slate-900">
                  {[
                     { label: 'JD alignment', val: analysisResult.match_score?.alignment, max: 35, color: 'bg-indigo-500' },
                     { label: 'Quantification', val: analysisResult.match_score?.quantification, max: 30, color: 'bg-indigo-500' },
                     { label: 'Keywords', val: analysisResult.match_score?.keywords, max: 20, color: 'bg-indigo-500' },
                     { label: 'Structure', val: analysisResult.match_score?.structure, max: 15, color: 'bg-indigo-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-3">
                       <div className="flex justify-between items-end">
                          <span className="font-black text-slate-900 dark:text-white text-sm">{item.label}</span>
                          <span className="text-xs font-bold text-slate-400">{item.val}/{item.max}</span>
                       </div>
                       <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={clsx("h-full", item.color)} style={{width: `${((item.val || 0)/item.max)*100}%`}}></div>
                       </div>
                    </div>
                  ))}
              </Card>
           </div>
         )}
         
         {(activeResultTab === 'gaps' || activeResultTab === 'cover' || activeResultTab === 'prep') && (
            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl p-16 flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-8">
                  <Sparkles className="w-12 h-12 text-indigo-600" />
               </div>
               <h3 className="text-2xl font-black mb-4 uppercase tracking-[0.2em] text-slate-400">Unlock Pro Insights</h3>
               <p className="max-w-md text-slate-500 dark:text-slate-400 mb-10 font-bold">
                  Upgrade to Pro to access high-precision keyword analysis, custom generated cover letters, and intensive interview preparation guides.
               </p>
               <Button size="lg" variant="primary" onClick={() => router.push('/dashboard/profile')} className="px-12 h-16 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-indigo-600/30">
                 Upgrade to Pro →
               </Button>
            </Card>
         )}
      </div>

       <div className="flex justify-center gap-6 pt-12 border-t dark:border-slate-800">
         <button className="text-slate-400 font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-all"><Copy className="w-4 h-4" /> Copy plain text</button>
         <button className="text-slate-400 font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-all text-indigo-600">↓ Download DOCX</button>
      </div>

    </div>
  )
}
