'use client'

import React, { useEffect, useState } from 'react'
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui'
import { Card, CardBody } from '@/components/Card'
import { planService } from '@/services/database.service'
import { Plan } from '@/types'
import { useAuth } from '@/hooks/useAuth'

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchPlans() {
      const { data, error: err } = await planService.getAll()
      if (!err && data) setPlans(data)
      setLoading(false)
    }
    fetchPlans()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-20 space-y-4">
           <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white">
             Choose your <span className="text-indigo-600">career edge.</span>
           </h1>
           <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
             Unlock high-conversion resume rewrites and interview prep tools. Simple, transparent pricing in INR.
           </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-[600px] bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl" />
             ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative border-none shadow-2xl transition-all duration-500 hover:scale-[1.02] ${
                  plan.is_popular ? 'ring-4 ring-indigo-600 ring-offset-4 dark:ring-offset-slate-950' : ''
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                    Best Value
                  </div>
                )}
                
                <CardBody className="p-10 flex flex-col h-full">
                   <div className="mb-8">
                      <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                      <p className="text-slate-500 text-sm font-medium">{plan.description}</p>
                   </div>
                   
                   <div className="mb-8">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-slate-900 dark:text-white">₹{plan.price_inr}</span>
                        <span className="text-slate-400 font-black uppercase text-xs tracking-widest">one-time</span>
                      </div>
                   </div>

                   <div className="space-y-4 mb-10 flex-grow">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                           <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                           {feature}
                        </div>
                      ))}
                   </div>

                   <Button 
                    fullWidth 
                    variant={plan.is_popular ? 'primary' : 'secondary'}
                    className={`h-16 rounded-2xl font-black text-lg ${plan.is_popular ? 'shadow-xl shadow-indigo-600/30' : ''}`}
                   >
                     {plan.price_inr === 0 ? 'Get Started' : 'Unlock Now'}
                   </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-24 grid md:grid-cols-3 gap-12 border-t dark:border-slate-800 pt-20">
            <div className="space-y-4">
               <Zap className="w-10 h-10 text-indigo-600" />
               <h4 className="text-xl font-black">Instant Delivery</h4>
               <p className="text-slate-500 dark:text-slate-400 font-medium">Get your rewritten resume and matching scores in under 60 seconds using Gemini 1.5 Flash.</p>
            </div>
            <div className="space-y-4">
               <ShieldCheck className="w-10 h-10 text-indigo-600" />
               <h4 className="text-xl font-black">ATS Optimized</h4>
               <p className="text-slate-500 dark:text-slate-400 font-medium">Every plan includes high-precision ATS scoring based on top recruitment software algorithms.</p>
            </div>
            <div className="space-y-4">
               <Sparkles className="w-10 h-10 text-indigo-600" />
               <h4 className="text-xl font-black">AI Rewrites</h4>
               <p className="text-slate-500 dark:text-slate-400 font-medium">Pro plans include dynamic cover letters and 30-60-90 day execution plans tailored to your role.</p>
            </div>
        </div>
      </main>
    </div>
  )
}
