'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, BarChart3, Settings, Home } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { resumeService, userService } from '@/services/database.service'
import { Resume } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { userSidebarItems as sidebarItems } from '@/config/sidebar'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalReports: 0,
    totalJobDescriptions: 0,
  })
  const [loadingContent, setLoadingContent] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (user) {
      fetchDashboardData()
    }
  }, [user, loading, router])

  const fetchDashboardData = async () => {
    try {
      setLoadingContent(true)
      const [resumesRes, statsRes] = await Promise.all([
        resumeService.getByUserId(user!.id),
        userService.getUserStats(user!.id)
      ])
      
      setResumes(resumesRes.data || [])
      setStats(statsRes)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoadingContent(false)
    }
  }

  if (loading || loadingContent) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name || 'User'}!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your resumes and get AI-powered analysis</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{stats.totalResumes}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm uppercase font-bold tracking-wider">Resumes Uploaded</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{stats.totalJobDescriptions}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm uppercase font-bold tracking-wider">Job Descriptions</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{stats.totalReports}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm uppercase font-bold tracking-wider">Reports Generated</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Button fullWidth size="lg" asChild className="h-16 text-lg">
              <Link href="/dashboard/create-jd" className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Create Job Description
              </Link>
            </Button>
            <Button variant="secondary" fullWidth size="lg" asChild className="h-16 text-lg">
              <Link href="/dashboard/upload-resume" className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" /> Upload Resume
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Resumes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold dark:text-white">Recent Resumes</h2>
            <Link href="/dashboard/my-resumes" className="text-primary text-sm font-medium hover:underline">View All</Link>
          </div>
          
          {resumes.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent">
              <CardBody>
                <div className="py-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No resumes uploaded yet</p>
                  <Button variant="ghost" asChild className="mt-2">
                    <Link href="/dashboard/upload-resume">Get started by uploading your first resume</Link>
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid gap-4">
              {resumes.slice(0, 5).map((resume) => (
                <Card key={resume.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{resume.file_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Uploaded {new Date(resume.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/reports/${resume.id}`}>View Analysis</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}