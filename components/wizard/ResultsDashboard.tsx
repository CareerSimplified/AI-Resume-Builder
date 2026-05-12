import { Edit3, Target, Search, FileSearch, MessageSquare, Copy, Zap, GraduationCap, Sparkles, Download } from 'lucide-react'
import { Card, CardBody } from '@/components/Card'
import { Badge, Button } from '@/components/ui'
import { clsx } from 'clsx'
import { useRouter } from 'next/navigation'
import { ResumePreview, ResumePreviewHandle } from './ResumePreview'

interface ResultsDashboardProps {
   analysisResult: any
   mode: string
   jdData: any
   activeResultTab: string
   setActiveResultTab: (tab: string) => void
   onStartOver: () => void
   resumePreviewRef?: React.RefObject<ResumePreviewHandle | null>
   onDownloadPdf?: () => void
   onDownloadDocx?: () => void
}

export function ResultsDashboard({
   analysisResult,
   mode,
   jdData,
   activeResultTab,
   setActiveResultTab,
   onStartOver,
   resumePreviewRef,
   onDownloadPdf,
   onDownloadDocx
}: ResultsDashboardProps) {
   const router = useRouter()

   if (!analysisResult) return null

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
               <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  {mode === 'JD_ALIGNMENT' ? `${jdData?.company} ${jdData?.role}` : 'MBA Master Resume'}
               </h1>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <Button variant="secondary" onClick={onStartOver} className="rounded-xl h-11 px-6 font-black scale-90 flex-1 md:flex-none">← Start over</Button>
            </div>
         </div>

         <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-x-auto scrollbar-hide -mx-2 px-2">
            {[
               { id: 'resume', label: 'AI Resume', icon: Edit3 },
               { id: 'score', label: 'Score', icon: Target },
               { id: 'gaps', label: 'Gaps', icon: Search },
               { id: 'cover', label: 'Cover', icon: FileSearch },
               { id: 'prep', label: 'Interview', icon: MessageSquare },
               { id: 'plan', label: 'Career Plan', icon: GraduationCap },
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveResultTab(tab.id)}
                  className={clsx(
                     "flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-black whitespace-nowrap transition-all text-xs sm:text-sm flex-shrink-0",
                     activeResultTab === tab.id ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
                  )}
               >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
               </button>
            ))}
         </div>

         <div className="min-h-[500px]">
            {activeResultTab === 'resume' && (
               <div className="grid lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden h-[400px] sm:h-[600px] lg:h-[900px]">
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-6 border-b dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-400">AI-Optimized Professional Preview</h3>
                        <div className="flex gap-2">
                           <button onClick={() => {
                              if (analysisResult.rewrittenResume) {
                                 navigator.clipboard.writeText(analysisResult.rewrittenResume);
                              }
                           }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500" title="Copy Raw Text"><Copy className="w-4 h-4" /></button>
                           <button onClick={onDownloadPdf} className="flex items-center gap-1 sm:gap-2 bg-indigo-600 text-white px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-black shadow-lg shadow-indigo-600/20"><Download className="w-3 h-3 sm:w-4 sm:h-4" /> PDF</button>
                           <button onClick={onDownloadDocx} className="flex items-center gap-1 sm:gap-2 bg-slate-800 text-white px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-black shadow-lg shadow-slate-800/20">↓ DOCX</button>
                        </div>
                     </div>
                     <CardBody className="p-0 h-[calc(100%-80px)]">
                        <ResumePreview
                           ref={resumePreviewRef}
                           data={analysisResult.rewrittenResumeData}
                           rawText={analysisResult.rewrittenResume}
                        />
                     </CardBody>
                  </Card>

                  <div className="space-y-6">

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
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <Card className="border-none shadow-xl rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900">
                     <div className="relative w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center mb-6">
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

                  <Card className="border-none shadow-xl rounded-3xl p-6 sm:p-10 space-y-8 bg-white dark:bg-slate-900">
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
                              <div className={clsx("h-full", item.color)} style={{ width: `${((item.val || 0) / item.max) * 100}%` }}></div>
                           </div>
                        </div>
                     ))}
                  </Card>
               </div>
            )}

            {activeResultTab === 'gaps' && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <Card className="p-4 sm:p-8 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl">
                     <h3 className="text-xl font-black mb-4">Strengths</h3>
                     <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                        {analysisResult.strengths?.map((s: string, i: number) => <li key={i} className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" /><span>{s}</span></li>) || <li>No strengths listed.</li>}
                     </ul>
                  </Card>
                  <Card className="p-4 sm:p-8 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl">
                     <h3 className="text-xl font-black mb-4 text-red-500">Weaknesses</h3>
                     <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                        {analysisResult.weaknesses?.map((s: string, i: number) => <li key={i} className="flex items-start gap-2"><Target className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" /><span>{s}</span></li>) || <li>No weaknesses listed.</li>}
                     </ul>
                  </Card>
                  <Card className="p-4 sm:p-8 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl sm:col-span-2">
                     <h3 className="text-xl font-black mb-4 text-indigo-500">Missing Skills & Keywords</h3>
                     <div className="flex flex-wrap gap-2">
                        {analysisResult.missing_skills?.map((s: string, i: number) => <Badge key={i} variant="secondary" className="bg-slate-100 dark:bg-slate-800 border-none px-3 py-1">{s}</Badge>) || <span>None detected.</span>}
                        {analysisResult.gaps?.missing_keywords?.map((s: string, i: number) => <Badge key={`k-${i}`} variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 border-none px-3 py-1">{s}</Badge>)}
                     </div>
                  </Card>
               </div>
            )}

            {activeResultTab === 'cover' && (
               <Card className="p-8 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl font-sans text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
                  <div className="flex justify-end mb-4">
                     <button onClick={() => navigator.clipboard.writeText(analysisResult.coverLetter || '')} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg transition-colors"><Copy className="w-4 h-4" /> Copy Letter</button>
                  </div>
                  <div className="whitespace-pre-wrap">
                     {analysisResult.coverLetter || "No cover letter generated."}
                  </div>
               </Card>
            )}

            {activeResultTab === 'prep' && (
               <Card className="p-8 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl font-sans max-w-4xl mx-auto">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b dark:border-slate-800">
                     <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-indigo-600" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black">Interview Preparation</h3>
                        <p className="text-slate-500 text-sm">15 AI-generated Q&A based on your resume and JD</p>
                     </div>
                  </div>
                  <div className="space-y-6">
                     {(() => {
                        let questions: any[] = [];
                        try { questions = JSON.parse(analysisResult.interviewPrep || '[]'); } catch { questions = []; }
                        if (Array.isArray(questions) && questions.length > 0) {
                           return questions.map((q: any, i: number) => (
                              <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                 <div className="flex items-start gap-3 mb-3">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 font-black text-sm flex items-center justify-center">Q{q.id || i + 1}</span>
                                    <div className="flex-1">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1 block">{q.type || 'general'}</span>
                                       <p className="font-bold text-slate-900 dark:text-white leading-snug">{q.question}</p>
                                    </div>
                                 </div>
                                 <div className="ml-11 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{q.answer}</p>
                                 </div>
                              </div>
                           ));
                        }
                        // Fallback: render as plain text
                        return <div className="whitespace-pre-wrap prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">{analysisResult.interviewPrep || "No interview prep generated. Please run analysis again."}</div>;
                     })()}
                  </div>
               </Card>
            )}

            {activeResultTab === 'plan' && (
               <Card className="p-8 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl font-sans max-w-4xl mx-auto">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b dark:border-slate-800">
                     <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-emerald-600" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black">30/60/90 Day Success Plan</h3>
                        <p className="text-slate-500 text-sm">A strategic roadmap for your first 3 months</p>
                     </div>
                  </div>
                  <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                     {(() => {
                        if (!analysisResult.plan306090) return "Career plan generation failed. Please run analysis again.";
                        if (typeof analysisResult.plan306090 === 'string') return analysisResult.plan306090;
                        
                        // If it's an object, format it nicely
                        const p = analysisResult.plan306090;
                        return `
### Strategic Overview
${p.strategic_overview || p.overview || ''}

### 30 Days: Learning & Integration
${Array.isArray(p.thirty_day_goals) ? p.thirty_day_goals.map((g: string) => `- ${g}`).join('\n') : (p.thirty_day_goals || '')}

### 60 Days: Execution & Quick Wins
${Array.isArray(p.sixty_day_goals) ? p.sixty_day_goals.map((g: string) => `- ${g}`).join('\n') : (p.sixty_day_goals || '')}

### 90 Days: Ownership & Strategy
${Array.isArray(p.ninety_day_goals) ? p.ninety_day_goals.map((g: string) => `- ${g}`).join('\n') : (p.ninety_day_goals || '')}

### Key Performance Indicators
${Array.isArray(p.key_performance_indicators) ? p.key_performance_indicators.map((g: string) => `- ${g}`).join('\n') : (p.key_performance_indicators || '')}
                        `.trim();
                     })()}
                  </div>
                  <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                     <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-2">Pro Tip</p>
                     <p className="text-sm text-emerald-600 dark:text-emerald-300">Bring this plan to your final interview to demonstrate proactive leadership and immediate value-add potential.</p>
                  </div>
               </Card>
            )}
         </div>

         <div className="flex justify-center gap-6 pt-12 border-t dark:border-slate-800">
            <button onClick={() => navigator.clipboard.writeText(analysisResult.rewrittenResume || '')} className="text-slate-400 font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-all"><Copy className="w-4 h-4" /> Copy plain text</button>
            <button onClick={onDownloadDocx} className="text-indigo-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:text-indigo-700 transition-all">↓ Download DOCX</button>
         </div>

      </div>
   )
}
