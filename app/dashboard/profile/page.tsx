'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Calendar, FileText, BarChart3, Edit2, Camera } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/ui/Form'
import { Badge } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { userSidebarItems } from '@/config/sidebar'
import { userService, resumeService, reportService, jobDescriptionService } from '@/services/database.service'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalReports: 0,
    totalJobDescriptions: 0,
  })

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const [resumesRes, reportsRes, jdRes] = await Promise.all([
        resumeService.getByUserId(user!.id),
        reportService.getByUserId(user!.id),
        jobDescriptionService.getByUserId(user!.id),
      ])

      setStats({
        totalResumes: resumesRes.data?.length || 0,
        totalReports: reportsRes.data?.length || 0,
        totalJobDescriptions: jdRes.data?.length || 0,
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      const { error: updateError } = await userService.updateUser(user.id, { name })
      if (updateError) {
        error('Failed to update profile')
        return
      }
      success('Profile updated successfully!')
      setEditing(false)
    } catch (err: any) {
      error(err.message || 'Failed to update profile')
    }
  }

  if (authLoading || loading) {
    return (
      <DashboardLayout sidebarItems={userSidebarItems}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebarItems={userSidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account information</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader 
                title="Personal Information" 
                action={
                  !editing && (
                    <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )
                }
              />
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                        {user?.name?.charAt(0).toUpperCase() || user?.email.charAt(0).toUpperCase()}
                      </div>
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</h2>
                      <Badge variant={user?.role === 'admin' ? 'danger' : 'success'}>
                        {user?.role || 'user'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <User className="w-4 h-4" />
                        Full Name
                      </label>
                      {editing ? (
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">{user?.name || 'Not set'}</p>
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <p className="text-gray-900 dark:text-white">{user?.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      Member Since
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>

                  {editing && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button onClick={handleSave}>Save Changes</Button>
                      <Button variant="secondary" onClick={() => {
                        setEditing(false)
                        setName(user?.name || '')
                      }}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Account Statistics" subtitle="Your activity overview" />
              <CardBody>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalResumes}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Resumes</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReports}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reports</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalJobDescriptions}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Job Descriptions</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Quick Actions" />
              <CardBody>
                <div className="space-y-3">
                  <Button variant="secondary" fullWidth className="justify-start" onClick={() => window.location.href = '/dashboard/upload-resume'}>
                    <FileText className="w-4 h-4 mr-2" />
                    Upload New Resume
                  </Button>
                  <Button variant="secondary" fullWidth className="justify-start" onClick={() => window.location.href = '/dashboard/create-jd'}>
                    <FileText className="w-4 h-4 mr-2" />
                    Create Job Description
                  </Button>
                  <Button variant="secondary" fullWidth className="justify-start" onClick={() => window.location.href = '/dashboard/reports'}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View All Reports
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Account Security" />
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Password</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Last changed: Never</p>
                    <Button variant="secondary" size="sm">
                      Change Password
                    </Button>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Email Verification</h4>
                    <Badge variant={user?.email ? 'success' : 'warning'}>
                      {user?.email ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
