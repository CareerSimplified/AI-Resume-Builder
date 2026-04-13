import { Navbar, Hero, Features, HowItWorks, ReportPreview, Testimonials, CTA, Footer } from '@/components/landing'

export default function Home() {
  return (
    <main className="flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <ReportPreview />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
