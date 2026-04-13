import React from 'react'
import { Upload, FileText, BarChart3, Sparkles, Target, Lightbulb } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeader } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'

const features = [
  {
    icon: Upload,
    title: 'Resume Upload & Parsing',
    description: 'Upload your resume in PDF or DOCX format. Our AI instantly extracts and analyzes your content with precision.',
    color: 'blue',
  },
  {
    icon: Target,
    title: 'Job Description Matching',
    description: 'Compare your resume against any job description to see how well you match the requirements.',
    color: 'green',
  },
  {
    icon: BarChart3,
    title: 'ATS Score Generator',
    description: 'Get an accurate ATS compatibility score to see how your resume will perform in applicant tracking systems.',
    color: 'purple',
  },
  {
    icon: Lightbulb,
    title: 'AI Suggestions & Improvements',
    description: 'Receive personalized recommendations to improve your resume content, keywords, and formatting.',
    color: 'orange',
  },
]

const colorStyles = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-400',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    icon: 'text-orange-600 dark:text-orange-400',
  },
}

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-24 bg-white dark:bg-gray-900">
      <Container>
        <SectionHeader
          title="Powerful Features"
          subtitle="Everything you need to optimize your resume and increase your chances of landing interviews"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const colors = colorStyles[feature.color as keyof typeof colorStyles]

            return (
              <Card key={index} className="group hover:border-blue-300 dark:hover:border-blue-600">
                <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${colors.icon}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
