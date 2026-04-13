import React from 'react'
import Link from 'next/link'
import { Button } from './Button'

export const Navbar = () => {
  return (
    <nav className="bg-white border-b border-border-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-primary">
              AI Resume Builder
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/#features" className="text-gray-700 hover:text-primary">
                Features
              </Link>
              <Link href="/#how-it-works" className="text-gray-700 hover:text-primary">
                How It Works
              </Link>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login" className="inline-block">
              <Button variant="secondary" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup" className="inline-block">
              <Button size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
