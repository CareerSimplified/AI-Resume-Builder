'use client'

import { Home, FileText, Plus, BarChart3, Settings } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Form'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'Create JD', href: '/dashboard/create-jd', icon: <Plus className="w-5 h-5" /> },
  { label: 'Upload Resume', href: '/dashboard/upload-resume', icon: <FileText className="w-5 h-5" /> },
  { label: 'My Resumes', href: '/dashboard/my-resumes', icon: <FileText className="w-5 h-5" /> },
  { label: 'Reports', href: '/dashboard/reports', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const router = useRouter()

  const handleChangePassword = async () => {
    try {
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      })
      if (resetError) {
        error('Failed to send email')
        return
      }
      success('Password reset email sent!')
    } catch (err: any) {
      error(err.message)
    }
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-dark-gray mt-2">Manage your account settings</p>
        </div>

        <Card>
          <CardHeader title="Profile Information" />
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={user?.name || ''}
                disabled
              />
              <Input
                label="Email"
                type="email"
                value={user?.email || ''}
                disabled
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Security" />
          <CardBody>
            <Button variant="secondary" onClick={handleChangePassword}>
              Change Password
            </Button>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
}