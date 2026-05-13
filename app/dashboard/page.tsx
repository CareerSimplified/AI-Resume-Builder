'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Plus, BarChart3, Settings, Home, AlertCircle, RefreshCw, Target, Upload } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { resumeService, userService, reportService } from '@/services/database.service'
import { Resume } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { userSidebarItems as sidebarItems } from '@/config/sidebar'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [isProUser, setIsProUser] = useState(false)
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
      
      const [resumesRes, statsRes, reportsRes, userRes] = await Promise.all([
        resumeService.getByUserId(userId).catch(err => {
          console.error('[Dashboard] Error fetching resumes:', err)
          return { data: [], error: err }
        }),
        userService.getUserStats(userId).catch(err => {
          console.error('[Dashboard] Error fetching stats:', err)
          return { totalResumes: 0, totalReports: 0, totalJobDescriptions: 0 }
        }),
        reportService.getByUserId(userId).catch((err: any) => ({ data: [], error: err })),
        userService.getUserById(userId)
      ])
      
      setResumes(resumesRes.data || [])
      setReports(reportsRes.data || [])
      setIsProUser((userRes.data as any)?.is_pro || false)
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
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              Howdy, <span className="text-indigo-600">{user?.name?.split(' ')[0] || 'User'}</span>!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">
              Your career trajectory at a glance.
            </p>
          </div>
          <div className="flex gap-2">
             <Button asChild variant="outline" className="h-12 rounded-xl border-2 font-black px-6">
               <Link href="/dashboard/profile" className="flex items-center gap-2">
                 <Settings className="w-4 h-4" /> Account
               </Link>
             </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden group border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2rem]">
            <CardBody className="p-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Resumes</p>
                  <p className="text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tighter">{stats.totalResumes}</p>
                </div>
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:rotate-12 transition-transform shadow-inner">
                  <FileText className="w-7 h-7" />
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="relative overflow-hidden group border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2rem]">
            <CardBody className="p-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Reports Done</p>
                  <p className="text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tighter">{stats.totalReports}</p>
                </div>
                <div className="w-14 h-14 bg-violet-50 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center text-violet-600 group-hover:-rotate-12 transition-transform shadow-inner">
                  <BarChart3 className="w-7 h-7" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="relative overflow-hidden group border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2rem] sm:col-span-2 lg:col-span-1">
            <CardBody className="p-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Stored JDs</p>
                  <p className="text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tighter">{stats.totalJobDescriptions}</p>
                </div>
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-inner">
                  <Plus className="w-7 h-7" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/wizard" className="group">
            <div className="flex items-center gap-4 p-6 bg-white dark:bg-[#0b0f1a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Job Description</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add a new JD to analyze against your resumes.</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/wizard" className="group">
             <div className="flex items-center gap-4 p-6 bg-white dark:bg-[#0b0f1a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload New Resume</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Scan and analyze a new resume using AI.</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Analysis History */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
               Analysis History
               <Badge variant="secondary" className="ml-2 font-normal text-xs">{reports.length}</Badge>
            </h2>
            {!isProUser && reports.length > 3 && (
                <Badge variant="primary" className="bg-amber-100 text-amber-800 border-amber-200">
                    Pro gets full history
                </Badge>
            )}
          </div>
          
          {reports.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent border-gray-200 dark:border-gray-800 rounded-2xl">
              <CardBody>
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No analyses found</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">Run your first resume analysis via the AI Wizard!</p>
                  <Button asChild>
                    <Link href="/dashboard/wizard">Start AI Wizard</Link>
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid gap-4">
              {(isProUser ? reports : reports.slice(0, 3)).map((report) => (
                <Card key={report.id} className="group hover:ring-1 hover:ring-primary/20 hover:shadow-lg transition-all border-none bg-white dark:bg-[#0b0f1a] shadow-sm rounded-2xl">
                  <CardBody className="p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors flex-shrink-0">
                          <BarChart3 className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                              <h3 className="font-bold text-gray-900 dark:text-white truncate">Analysis Run</h3>
                              <Badge variant="secondary" className="bg-[#533AB7]/10 text-[#533AB7] dark:bg-[#533AB7]/20 border-none">
                                  {report.mode === 'MBA_POLISH' ? 'MBA Polish' : 'JD Alignment'}
                              </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                             <p className="text-xs text-gray-500 font-medium">ATS: <span className="text-gray-900 dark:text-white">{report.ats_score}</span></p>
                             <p className="text-xs text-gray-500 font-medium">Match: <span className="text-blue-500">{report.match_score || 0}%</span></p>
                             <p className="text-xs text-gray-400">
                               {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
                        <Button size="sm" variant="primary" asChild className="rounded-xl shadow-none font-medium w-full md:w-auto">
                          <Link href={`/dashboard/reports/${report.id}`}>View Results</Link>
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
              {!isProUser && reports.length > 3 && (
                 <div className="text-center mt-4">
                     <p className="text-sm text-gray-500 mb-2">You have {reports.length - 3} older reports hidden.</p>
                     <Button variant="outline" asChild><Link href="/dashboard/profile">Upgrade to Pro to view all</Link></Button>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}