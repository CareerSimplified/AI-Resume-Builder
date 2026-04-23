import React from 'react'
import { CheckCircle } from 'lucide-react'
import { clsx } from 'clsx'

interface Step {
  id: number
  label: string
  icon: any
}

interface WizardStepperProps {
  steps: Step[]
  currentStep: number
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <div className="mb-12">
      <div className="text-center mb-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Step {currentStep} of 4</p>
      </div>
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center relative z-10">
            <div className={clsx(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
              currentStep >= s.id 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20" 
                : "bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-100 dark:border-slate-700"
            )}>
              {currentStep > s.id ? <CheckCircle className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
            </div>
            <span className={clsx(
              "mt-3 text-xs font-bold uppercase tracking-wider text-center",
              currentStep >= s.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
            )}>
              {s.label}
            </span>
          </div>
        ))}
        {/* Progress Line */}
        <div className="absolute top-6 left-0 w-full h-[2px] bg-slate-100 dark:bg-slate-800 -z-10">
          <div 
            className="h-full bg-indigo-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
