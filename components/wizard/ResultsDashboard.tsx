import { Target, MessageSquare, Copy, Zap, Sparkles, Download, FileText, BarChart3, HelpCircle, Calendar } from 'lucide-react'
import { Card, CardBody } from '@/components/Card'
import { Badge, Button } from '@/components/ui'
import { clsx } from 'clsx'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
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
   const { success } = useToast()

   if (!analysisResult) return null

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
               <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  {mode === 'JD_ALIGNMENT' ? `${jdData?.company} ${jdData?.role}` : 'MBA Master Resume'}
               </h1>
               <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 border-none px-2 uppercase text-[10px] font-black">
                     {mode === 'JD_ALIGNMENT' ? 'JD Alignment' : 'MBA Polish'}
                  </Badge>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis Result</span>
               </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
               <Button variant="secondary" onClick={onStartOver} className="rounded-xl h-12 px-6 font-black flex-1 sm:flex-none">← Start over</Button>
            </div>
         </div>

         <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] overflow-x-auto scrollbar-hide -mx-2 px-4">
            {[
               { id: 'resume', label: 'AI Resume', icon: FileText },
               { id: 'score', label: 'Score', icon: BarChart3 },
               { id: 'gaps', label: 'Gaps', icon: Target },
               { id: 'cover', label: 'Cover Letter', icon: Sparkles },
               { id: 'interview', label: 'Interview Prep', icon: HelpCircle },
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveResultTab(tab.id)}
                  className={clsx(
                     "flex items-center gap-2.5 px-5 py-3.5 rounded-[1.25rem] font-black whitespace-nowrap transition-all text-[11px] sm:text-xs flex-shrink-0",
                     activeResultTab === tab.id
                        ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-xl shadow-slate-200 dark:shadow-none"
                        : "text-slate-500 hover:bg-white/50"
                  )}
               >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
               </button>
            ))}
         </div>

         <div className="min-h-[500px]">
            {activeResultTab === 'resume' && (
               <div className="grid lg:grid-cols-3 gap-8">                   <Card className="lg:col-span-2 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden h-[500px] sm:h-[700px] lg:h-[950px]">
                  <div className="bg-slate-50/50 dark:bg-slate-950/50 p-4 sm:p-8 border-b dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-700">
                           <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-400">Professional Preview</h3>
                     </div>
                     <div className="flex gap-2 w-full sm:w-auto justify-center">
                        <button
                           onClick={() => {
                              if (analysisResult.rewrittenResume) {
                                 navigator.clipboard.writeText(analysisResult.rewrittenResume);
                                 success('Plain text copied!');
                              }
                           }}
                           className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500 transition-colors"
                           title="Copy Raw Text"
                        >
                           <Copy className="w-5 h-5" />
                        </button>
                        <button
                           onClick={onDownloadPdf}
                           className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-[11px] font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                        >
                           <Download className="w-4 h-4" /> PDF
                        </button>
                        <button
                           onClick={onDownloadDocx}
                           className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl text-[11px] font-black shadow-xl shadow-slate-900/20 transition-all active:scale-95"
                        >
                           <FileText className="w-4 h-4" /> DOCX
                        </button>
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

                  <Card className="border-none shadow-2xl rounded-[2.5rem] p-6 sm:p-10 lg:p-12 bg-white dark:bg-slate-900 flex flex-col justify-between">
                     <div className="space-y-8">
                        {[
                           { label: 'JD Alignment', val: analysisResult.match_score?.alignment, max: 35, color: 'bg-indigo-500' },
                           { label: 'Quantification', val: analysisResult.match_score?.quantification, max: 30, color: 'bg-violet-500' },
                           { label: 'Keywords', val: analysisResult.match_score?.keywords, max: 20, color: 'bg-fuchsia-500' },
                           { label: 'Structure', val: analysisResult.match_score?.structure, max: 15, color: 'bg-blue-500' },
                        ].map((item, idx) => (
                           <div key={idx} className="space-y-3 group">
                              <div className="flex justify-between items-end">
                                 <span className="font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-[0.2em] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.label}</span>
                                 <span className="text-xs font-black text-slate-900 dark:text-white">{item.val}<span className="text-slate-400 font-bold">/{item.max}</span></span>
                              </div>
                              <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
                                 <div className={clsx("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${((item.val || 0) / item.max) * 100}%` }}></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </Card>
               </div>
            )}

            {activeResultTab === 'gaps' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                  <Card className="p-6 sm:p-10 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700" />
                     <h3 className="text-2xl font-black mb-8 text-emerald-500 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-sm">✓</div>
                        Strengths
                     </h3>
                     <div className="space-y-5">
                        {analysisResult.strengths?.map((s: string, i: number) => (
                           <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/30 group/item transition-all hover:bg-emerald-50/50">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{s}</p>
                           </div>
                        )) || <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No analysis available</p>}
                     </div>
                  </Card>

                  <Card className="p-6 sm:p-10 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700" />
                     <h3 className="text-2xl font-black mb-8 text-rose-500 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-sm">!</div>
                        Weaknesses
                     </h3>
                     <div className="space-y-5">
                        {analysisResult.weaknesses?.map((s: string, i: number) => (
                           <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50/30 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-800/30 group/item transition-all hover:bg-rose-50/50">
                              <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{s}</p>
                           </div>
                        )) || <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No analysis available</p>}
                     </div>
                  </Card>

                  <Card className="p-6 sm:p-10 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] md:col-span-2">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                           <Target className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-slate-900 dark:text-white">Keywords & Skills Gaps</h3>
                           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Identified from target Job Description</p>
                        </div>
                     </div>
                     <div className="flex flex-wrap gap-3">
                        {analysisResult.missing_skills?.map((s: string, i: number) => (
                           <Badge key={i} variant="secondary" className="bg-slate-100 dark:bg-slate-800 border-none px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl">
                              {s}
                           </Badge>
                        )) || <span className="text-slate-400">None detected.</span>}
                        {analysisResult.gaps?.missing_keywords?.map((s: string, i: number) => (
                           <Badge key={`k-${i}`} variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 border-none px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl">
                              {s}
                           </Badge>
                        ))}
                     </div>
                  </Card>
               </div>
            )}

            {activeResultTab === 'cover' && (
               <Card className="max-w-[8.5in] mx-auto border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                  <div className="p-1 sm:p-2 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 flex justify-end gap-2 px-6">
                     <Button variant="ghost" size="sm" onClick={() => {
                        navigator.clipboard.writeText(analysisResult.coverLetter || '');
                        success('Cover letter copied!');
                     }} className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Copy className="w-3 h-3 mr-2" /> Copy
                     </Button>
                  </div>
                  <div className="p-8 sm:p-16 md:p-20 lg:p-24 bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100 font-serif leading-relaxed text-base sm:text-lg min-h-[10in]">
                     <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                        {analysisResult.coverLetter}
                     </div>
                  </div>
               </Card>
            )}

            {activeResultTab === 'interview' && (<Card className="p-5 sm:p-8 md:p-12 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] font-sans max-w-4xl mx-auto">
               <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 pb-6 border-b dark:border-slate-800">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                     <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center shadow-inner">
                        <MessageSquare className="w-7 h-7 text-indigo-600" />
                     </div>
                     <div>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">Interview Prep</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">15 AI-Synthesized Questions</p>
                     </div>
                  </div>
                  <Button
                     variant="outline"
                     size="lg"
                     className="rounded-2xl font-black gap-2 w-full sm:w-auto h-14 border-2"
                     onClick={() => {
                        let questions: any[] = [];
                        try { questions = JSON.parse(analysisResult.interviewPrep || '[]'); } catch { questions = []; }
                        const text = questions.map((q: any, i: number) => `Q${i + 1}: ${q.question}\nA: ${q.answer}`).join('\n\n');
                        navigator.clipboard.writeText(text);
                        success('All Q&A copied!');
                     }}
                  >
                     <Copy className="w-5 h-5" /> Copy Suite
                  </Button>
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
                     return <div className="whitespace-pre-wrap prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">{analysisResult.interviewPrep || "No interview prep generated. Please run analysis again."}</div>;
                  })()}
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
