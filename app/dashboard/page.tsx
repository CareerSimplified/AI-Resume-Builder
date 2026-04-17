'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Plus, BarChart3, Settings, Home, AlertCircle, RefreshCw } from 'lucide-react'
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
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalReports: 0,
    totalJobDescriptions: 0,
  })
  const [loadingContent, setLoadingContent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async (userId: string) => {
    console.log('[Dashboard] fetchDashboardData started for:', userId)
    try {
      setLoadingContent(true)
      setError(null)
      
      const [resumesRes, statsRes] = await Promise.all([
        resumeService.getByUserId(userId).catch(err => {
          console.error('[Dashboard] Error fetching resumes:', err)
          return { data: [], error: err }
        }),
        userService.getUserStats(userId).catch(err => {
          console.error('[Dashboard] Error fetching stats:', err)
          return { totalResumes: 0, totalReports: 0, totalJobDescriptions: 0 }
        })
      ])
      
      setResumes(resumesRes.data || [])
      setStats(statsRes as any)
      console.log('[Dashboard] Data fetched successfully')
    } catch (err: any) {
      console.error('[Dashboard] Error in fetchDashboardData:', err)
      setError('Failed to load dashboard data. Please check your connection.')
    } finally {
      setLoadingContent(false)
    }
  }, [])

  useEffect(() => {
    console.log('[Dashboard] useEffect triggered, authLoading:', authLoading, 'user:', !!user)
    if (!authLoading) {
      if (!user) {
        console.log('[Dashboard] No user found, redirecting to login...')
        router.push('/auth/login')
      } else {
        fetchDashboardData(user.id)
      }
    }
  }, [user, authLoading, router, fetchDashboardData])

  if (authLoading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Authenticating...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loadingContent && !error) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 animate-pulse text-sm font-medium">Fetching dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md p-8 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Something went wrong</h2>
            <p className="text-red-600/80 dark:text-red-300/60 mb-6 text-sm">
              {error}
            </p>
            <Button 
              variant="primary" 
              onClick={() => user && fetchDashboardData(user.id)}
              className="flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8 pb-10">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Welcome back, <span className="text-primary">{user?.name || 'User'}</span>!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              Here is what is happening with your career progress.
            </p>
          </div>
          <div className="flex gap-3">
             <Button asChild variant="outline" size="sm">
               <Link href="/dashboard/profile" className="flex items-center gap-2">
                 <Settings className="w-4 h-4" /> Settings
               </Link>
             </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden group border-none bg-gradient-to-br from-blue-500/10 to-transparent dark:from-blue-500/5 dark:bg-[#0b0f1a] shadow-sm">
            <CardBody className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Resumes</p>
                  <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{stats.totalResumes}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="relative overflow-hidden group border-none bg-gradient-to-br from-purple-500/10 to-transparent dark:from-purple-500/5 dark:bg-[#0b0f1a] shadow-sm">
            <CardBody className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">Reports Done</p>
                  <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{stats.totalReports}</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="relative overflow-hidden group border-none bg-gradient-to-br from-emerald-500/10 to-transparent dark:from-emerald-500/5 dark:bg-[#0b0f1a] shadow-sm lg:col-span-1 sm:col-span-2">
            <CardBody className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">Stored JDs</p>
                  <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{stats.totalJobDescriptions}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/create-jd" className="group">
            <div className="flex items-center gap-4 p-6 bg-white dark:bg-[#0b0f1a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Job Description</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add a new JD to analyze against your resumes.</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/upload-resume" className="group">
             <div className="flex items-center gap-4 p-6 bg-white dark:bg-[#0b0f1a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload New Resume</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Scan and analyze a new resume using AI.</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Resumes */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
               Recent Resumes
               <Badge variant="secondary" className="ml-2 font-normal text-xs">{resumes.length}</Badge>
            </h2>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/5">
              <Link href="/dashboard/my-resumes">See all list</Link>
            </Button>
          </div>
          
          {resumes.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent border-gray-200 dark:border-gray-800 rounded-2xl">
              <CardBody>
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No resumes found</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">You haven't uploaded any resumes yet. Start by adding one!</p>
                  <Button asChild>
                    <Link href="/dashboard/upload-resume">Upload first resume</Link>
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid gap-4">
              {resumes.slice(0, 5).map((resume) => (
                <Card key={resume.id} className="group hover:ring-1 hover:ring-primary/20 hover:shadow-lg transition-all border-none bg-white dark:bg-[#0b0f1a] shadow-sm rounded-2xl">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors flex-shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 truncate">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">{resume.file_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <p className="text-xs text-gray-500 dark:text-gray-400">
                               Added {new Date(resume.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button size="sm" variant="primary" asChild className="rounded-xl shadow-none font-medium">
                          <Link href={`/dashboard/reports/${resume.id}`}>View Score</Link>
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}