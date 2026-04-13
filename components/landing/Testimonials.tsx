import React from 'react'
import { Star } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeader } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'

interface Testimonial {
  name: string
  role: string
  company: string
  avatar: string
  text: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    company: 'TechCorp',
    avatar: 'SJ',
    text: 'The AI analysis helped me identify gaps in my resume. I landed 3 interviews within a week of using this tool!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Product Manager',
    company: 'Innovate Inc',
    avatar: 'MC',
    text: 'Detailed insights and actionable suggestions. My resume match score improved by 35% after following the recommendations.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Data Scientist',
    company: 'DataFlow',
    avatar: 'ER',
    text: 'Easy to use and incredibly accurate. The ATS score feature is a game-changer for job seekers in tech.',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
      <Container>
        <SectionHeader
          title="What Users Say"
          subtitle="Trusted by job seekers worldwide"
        />

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full flex flex-col">
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-700 dark:text-gray-300 mb-6 flex-grow italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
