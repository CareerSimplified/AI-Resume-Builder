'use client'

import { useState, useEffect } from 'react'
import { FileText, BarChart3, Search, Eye, Trash2, Calendar, User, ArrowUpRight } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge, ProgressBar } from '@/components/ui'
import { useRequireAdmin } from '@/hooks/useAuth'
import { adminSidebarItems as sidebarItems } from '@/config/sidebar'
import Link from 'next/link'

export default function AdminReportsPage() {
  const { user, loading } = useRequireAdmin()
  const [reports, setReports] = useState<any[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoadingReports(true)
    try {
      const res = await fetch('/api/admin/reports')
      const result = await res.json()
      if (result.success) {
        setReports(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching admin reports:', error)
    } finally {
      setLoadingReports(false)
    }
  }

  const filteredReports = reports.filter(r => 
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-blue-500'
    return 'text-orange-500'
  }

  if (loading) return null

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
       <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">System Reports</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Monitor all AI-generated analysis reports across the platform.</p>
          </div>
          <Badge variant="primary">{filteredReports.length} Reports Total</Badge>
        </div>

        <Card className="border-none shadow-lg bg-white dark:bg-[#0b0f1a]">
          <CardBody>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Report ID or User ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#030712] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardBody>
        </Card>

        {loadingReports ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading platform reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="border-none bg-white dark:bg-[#0b0f1a] py-20 text-center">
             <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Reports Found</h3>
             <p className="text-gray-500 max-w-xs mx-auto mt-2">There are no analysis reports matching your criteria in the database.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="border-none shadow hover:shadow-md transition-all bg-white dark:bg-[#0b0f1a]">
                <CardBody className="p-0">
                   <div className="flex flex-col lg:flex-row items-stretch">
                      {/* Left: Score & Meta */}
                      <div className="p-6 lg:w-48 bg-gray-50 dark:bg-[#030712]/50 flex flex-col justify-center items-center text-center border-r border-gray-100 dark:border-gray-800">
                         <div className={`text-3xl font-black mb-1 ${getScoreColor(report.match_score)}`}>
                            {report.match_score}%
                         </div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Match Score</p>
                         <div className="mt-4 flex gap-1">
                            <Badge variant="secondary" size="sm">ATS: {report.ats_score}%</Badge>
                         </div>
                      </div>

                      {/* Middle: Info */}
                      <div className="p-6 flex-1 grid md:grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                               <User className="w-4 h-4" />
                               <span className="font-mono text-xs">{report.user_id}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                               <FileText className="w-4 h-4" />
                               <span className="font-mono text-xs">{report.resume_id}</span>
                            </div>
                         </div>
                         <div className="space-y-3 flex flex-col justify-center">
                             <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar className="w-4 h-4" />
                                Created: {new Date(report.created_at).toLocaleString()}
                             </div>
                             <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600" style={{ width: `${report.match_score}%` }}></div>
                             </div>
                         </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="p-6 lg:w-48 flex items-center justify-center gap-3">
                         <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/reports/${report.resume_id}`}>
                               <Eye className="w-4 h-4 mr-2" /> View
                            </Link>
                         </Button>
                         <Button variant="danger" size="sm">
                            <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                   </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
