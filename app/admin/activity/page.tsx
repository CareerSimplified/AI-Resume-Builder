'use client'

import { useState, useEffect } from 'react'
import { Clock, FileSearch, BarChart3, User, Calendar, ExternalLink } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/ui'
import { useRequireAdmin } from '@/hooks/useAuth'
import { adminSidebarItems as sidebarItems } from '@/config/sidebar'
import Link from 'next/link'

export default function AdminActivityPage() {
  const { user, loading } = useRequireAdmin()
  const [activities, setActivities] = useState<any[]>([])
  const [loadingActivity, setLoadingActivity] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    setLoadingActivity(true)
    try {
      const [resumesRes, reportsRes] = await Promise.all([
        fetch('/api/admin/resumes'),
        fetch('/api/admin/reports')
      ])
      
      const resData = await resumesRes.json()
      const repData = await reportsRes.json()

      const combined = [
        ...(resData.data || []).map((r: any) => ({ ...r, type: 'resume' })),
        ...(repData.data || []).map((r: any) => ({ ...r, type: 'report' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setActivities(combined.slice(0, 50)) // Show last 50
    } catch (err) {
      console.error('Error fetching activities:', err)
    } finally {
      setLoadingActivity(false)
    }
  }

  if (loading) return null

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
       <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            Global Activity Feed
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Monitor all document uploads and AI analysis events across the system.</p>
        </div>

        {loadingActivity ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Tracking system events...</p>
          </div>
        ) : activities.length === 0 ? (
          <Card className="text-center py-20 grayscale opacity-50 border-none bg-white dark:bg-[#0b0f1a]">
             <Clock className="w-16 h-16 mx-auto mb-4" />
             <p className="text-xl font-bold">No Activity Detected</p>
          </Card>
        ) : (
          <div className="relative">
             <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800 hidden md:block" />
             <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="relative flex flex-col md:flex-row gap-4">
                    <div className="hidden md:flex absolute left-6 w-4 h-4 rounded-full bg-white dark:bg-[#030712] border-2 border-blue-600 -translate-x-1/2 z-10" />
                    
                    <div className="md:ml-12 flex-1">
                      <Card className="border-none shadow hover:shadow-lg transition-all bg-white dark:bg-[#0b0f1a]">
                        <CardBody className="p-5 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${activity.type === 'resume' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'}`}>
                                 {activity.type === 'resume' ? <FileSearch className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                       {activity.type === 'resume' ? 'New Resume Uploaded' : 'AI Analysis Generated'}
                                    </span>
                                    <Badge variant={activity.type === 'resume' ? 'primary' : 'success'} size="sm">
                                       {activity.type}
                                    </Badge>
                                 </div>
                                 <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    <User className="w-3 h-3" /> {activity.user_id.slice(0, 8)}... 
                                    <Calendar className="w-3 h-3 ml-2" /> {new Date(activity.created_at).toLocaleString()}
                                 </p>
                              </div>
                           </div>
                           
                           {activity.type === 'report' ? (
                             <Link href={`/dashboard/reports/${activity.resume_id}`}>
                                <Button variant="ghost" size="sm">
                                   <ExternalLink className="w-4 h-4" />
                                </Button>
                             </Link>
                           ) : (
                             <Link href="/admin/resumes">
                                <Button variant="ghost" size="sm">
                                   <Eye className="w-4 h-4" />
                                </Button>
                             </Link>
                           )}
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function Eye({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
}
