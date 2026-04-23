import React from 'react'
import Link from 'next/link'
import { Upload, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export function Hero() {
  return (
    <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 bg-gradient-to-b from-blue-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <Container>
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            AI-Powered Resume Analysis
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Your ISB / IIM Resume, Built by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
              AI in 60 Seconds
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get instant insights on your ATS score, identify skill gaps, and receive
            AI-powered suggestions to improve your resume and land your dream job.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              href="/wizard"
              leftIcon={<Sparkles className="w-5 h-5" />}
            >
              Start AI Wizard
            </Button>
            <Button
              size="lg"
              variant="outline"
              href="/auth/signup"
            >
              Get Started Free
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span>Instant results</span>
            </div>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="mt-16 lg:mt-20 relative">
          <div className="relative mx-auto max-w-5xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-1">
              <div className="bg-gray-900 dark:bg-gray-800 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="p-8 min-h-[400px] flex items-center justify-center">
                  <div className="relative">
                    {/* Glowing background behind scores */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32 bg-blue-500/20 blur-[100px]" />
                    
                    <div className="relative text-center space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
                        Analysis Complete
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest opacity-80">Match Score</p>
                        <h2 className="text-white text-7xl font-black tracking-tighter">92<span className="text-blue-500">%</span></h2>
                      </div>

                      <div className="pt-4 flex items-center justify-center gap-8 border-t border-gray-800">
                        <div className="text-center">
                           <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">ATS Score</p>
                           <p className="text-xl font-bold text-gray-200">85%</p>
                        </div>
                        <div className="w-px h-10 bg-gray-800" />
                        <div className="text-center">
                           <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Status</p>
                           <p className="text-xl font-bold text-green-500 flex items-center gap-1">
                             <CheckCircle2 className="w-5 h-5" /> Optimized
                           </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 dark:bg-blue-900/30 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-300 dark:bg-blue-800/30 rounded-full blur-3xl opacity-50" />
        </div>
      </Container>
    </section>
  )
}
