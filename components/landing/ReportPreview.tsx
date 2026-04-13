import React from 'react'
import { ArrowRight, TrendingUp, CheckCircle2, AlertCircle, Target } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeader } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'

interface ReportSample {
  title: string
  matchScore: number
  atsScore: number
  status: 'success' | 'warning' | 'danger'
  strengths: string[]
  improvements: string[]
}

const reportSamples: ReportSample[] = [
  {
    title: 'Senior Software Engineer',
    matchScore: 92,
    atsScore: 88,
    status: 'success',
    strengths: [
      'Strong React & TypeScript skills',
      '5+ years relevant experience',
      'AWS & cloud infrastructure',
    ],
    improvements: [],
  },
  {
    title: 'Product Manager',
    matchScore: 71,
    atsScore: 75,
    status: 'warning',
    strengths: [
      'Strong leadership experience',
      'Agile/Scrum methodology',
    ],
    improvements: [
      'Add data-driven achievements',
      'Include agile methodology',
    ],
  },
  {
    title: 'Data Scientist',
    matchScore: 54,
    atsScore: 60,
    status: 'danger',
    strengths: [],
    improvements: [
      'Add ML frameworks (TensorFlow, PyTorch)',
      'Include statistical modeling',
      'Add SQL & database experience',
    ],
  },
]

const statusConfig = {
  success: {
    badge: 'success' as const,
    label: '92% Match',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  warning: {
    badge: 'warning' as const,
    label: '71% Match',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  danger: {
    badge: 'danger' as const,
    label: '54% Match',
    borderColor: 'border-red-200 dark:border-red-800',
  },
}

export function ReportPreview() {
  return (
    <section className="py-20 lg:py-24 bg-white dark:bg-gray-900">
      <Container>
        <SectionHeader
          title="See AI Analysis in Action"
          subtitle="Get instant, detailed insights for every resume you upload"
        />

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {reportSamples.map((sample, index) => {
            const config = statusConfig[sample.status]

            return (
              <Card
                key={index}
                className={`border-2 ${config.borderColor} hover:shadow-2xl transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {sample.title}
                  </h3>
                  <Badge variant={config.badge}>{config.label}</Badge>
                </div>

                <div className="space-y-4 mb-6">
                  <ProgressBar
                    label="Match Score"
                    value={sample.matchScore}
                    showLabel
                  />
                  <ProgressBar
                    label="ATS Score"
                    value={sample.atsScore}
                    showLabel
                  />
                </div>

                {sample.strengths.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                        Top Strengths
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {sample.strengths.map((strength, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                        >
                          <span className="text-green-500 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sample.improvements.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                        Areas to Improve
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {sample.improvements.map((improvement, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                        >
                          <span className="text-yellow-500 mt-1">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            href="/auth/signup"
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Analyze Your Resume Now
          </Button>
        </div>
      </Container>
    </section>
  )
}
