import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

export function CTA() {
  return (
    <section className="py-20 lg:py-24 bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Improve Your Resume?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Start your free analysis today and get personalized insights to land your dream job.
            No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              href="/auth/signup"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Sign Up Free
            </Button>
            <Button
              size="lg"
              variant="ghost"
              href="/auth/login"
              className="text-white hover:bg-white/10"
            >
              Sign In
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
