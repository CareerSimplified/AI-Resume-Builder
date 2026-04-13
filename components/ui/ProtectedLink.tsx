'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function ProtectedLink({ href, children, className, onClick }: ProtectedLinkProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    if (loading) {
      e.preventDefault()
      return
    }

    if (!user) {
      e.preventDefault()
      router.push(`/auth/login?redirect=${encodeURIComponent(href)}`)
      return
    }

    if (onClick) {
      onClick()
    }
  }

  if (!user && !loading) {
    return (
      <Link href={`/auth/login?redirect=${encodeURIComponent(href)}`} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
