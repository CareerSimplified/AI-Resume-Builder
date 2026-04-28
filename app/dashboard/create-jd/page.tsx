'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RedirectToWizard() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/wizard')
  }, [router])
  return null
}