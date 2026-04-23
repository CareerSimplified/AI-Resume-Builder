'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import { authService } from '@/services/auth.service'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const { error } = await authService.resetPassword(email)
      if (error) {
        toast.error(error.message || 'Failed to send reset email')
        return
      }
      setSent(true)
      toast.success('Password reset email sent')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Forgot Password</h1>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
        Enter your email and we will send a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg" disabled={!email}>
          Send Reset Link
        </Button>
      </form>

      {sent && (
        <p className="mt-4 text-sm text-green-600 dark:text-green-400 text-center">
          Check your email for a password reset link.
        </p>
      )}

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Back to{' '}
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  )
}

