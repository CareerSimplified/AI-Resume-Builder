import React from 'react'
import Link from 'next/link'
import { FileSearch, Mail, Github, Twitter, Linkedin } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const footerLinks = {
  product: [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQ', href: '/faq' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
  social: [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[#030712] text-gray-900 dark:text-gray-100 pt-16 pb-8 border-t border-gray-100 dark:border-gray-800">
      <Container>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <FileSearch className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">AI Resume Builder</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md leading-relaxed">
              AI-powered resume analysis to help you land your dream job. Get instant insights,
              ATS scores, and personalized suggestions to improve your chances.
            </p>
            <div className="flex gap-4">
              {footerLinks.social.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white dark:bg-gray-800 hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-center shadow-sm transition-colors border border-gray-100 dark:border-gray-700"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-bold mb-4 text-gray-900 dark:text-white uppercase text-xs tracking-widest">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold mb-4 text-gray-900 dark:text-white uppercase text-xs tracking-widest">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold mb-4 text-gray-900 dark:text-white uppercase text-xs tracking-widest">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} AI Resume Builder. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              <span>support@airesumebuilder.com</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
