import React from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

interface ProcessingScreenProps {
  processingStatus: string[]
}

export function ProcessingScreen({ processingStatus }: ProcessingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 animate-in fade-in duration-700">
       <div className="text-center max-w-md mx-auto mb-16">
         <h2 className="text-4xl font-black mb-4">Building your <span className="text-indigo-600">results…</span></h2>
         <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Analyzing and rewriting your resume</p>
         <p className="text-slate-400 mt-2 text-xs">5 parallel tasks running · estimated 45 seconds</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {processingStatus.map((status, i) => (
          <div key={i} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 animate-in slide-in-from-left-4 fade-in duration-300">
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center",
              i === processingStatus.length - 1 ? "bg-indigo-600 text-white" : "bg-emerald-500 text-white"
            )}>
              {i === processingStatus.length - 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            </div>
            <span className={clsx(
              "text-sm font-black",
              i === processingStatus.length - 1 ? "text-slate-900 dark:text-white" : "text-slate-400 line-through decoration-2"
            )}>
              {status}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-16 w-full max-w-md bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
         <div className="h-full bg-indigo-600 animate-pulse pointer-events-none" style={{ width: '92%' }}></div>
      </div>
    </div>
  )
}
