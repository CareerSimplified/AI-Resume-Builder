import React from 'react'
import { FileText, Upload, Sparkles, BarChart3, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeader } from '@/components/ui/Section'
import clsx from 'clsx'

const steps = [
  {
    number: 1,
    title: 'Upload Resume',
    description: 'Upload your resume in PDF or DOCX format with our simple drag & drop interface.',
    icon: Upload,
  },
  {
    number: 2,
    title: 'Add Job Description',
    description: 'Paste the job description you want to match against or create a new one.',
    icon: FileText,
  },
  {
    number: 3,
    title: 'Generate AI Report',
    description: 'Our AI analyzes your resume against the job requirements and generates insights.',
    icon: Sparkles,
  },
  {
    number: 4,
    title: 'Improve Resume',
    description: 'Follow AI suggestions to optimize your resume and increase your chances of success.',
    icon: BarChart3,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
      <Container>
        <SectionHeader
          title="How It Works"
          subtitle="Get started in just 4 simple steps"
        />

        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isLast = index === steps.length - 1
              const isMiddle = index === 1 || index === 2

              return (
                <div key={step.number} className="relative">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
                    {/* Step Number */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold">
                        {step.number}
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Connector Arrow - Desktop */}
                  {!isLast && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                        <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}
