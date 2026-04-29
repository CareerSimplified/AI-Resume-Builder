'use client'

import { useState, useEffect } from 'react'
import { Home, FileText, Plus, BarChart3, Settings, Download, Eye, RefreshCw, Sparkles, Wand2 } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge, ProgressBar } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { reportService } from '@/services/database.service'
import { Report } from '@/types'
import Link from 'next/link'
import clsx from 'clsx'

import { userSidebarItems as sidebarItems } from '@/config/sidebar'

export default function ReportsPage() {
  const { user, loading: authLoading, mounted } = useAuth()
  const { success, error } = useToast()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mounted && !authLoading && user?.id) {
      fetchReports()
    } else if (mounted && !authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading, mounted])

  const fetchReports = async () => {
    setLoading(true)
    try {
      // Try client-side first
      const { data, error: dbError } = await reportService.getByUserId(user!.id)
      
      if (dbError) {
        console.log('Client query failed, trying API fallback')
        // Try via API as fallback
        const apiRes = await fetch(`/api/reports?userId=${user!.id}`)
        if (apiRes.ok) {
          const apiData = await apiRes.json()
          if (apiData.success && apiData.data) {
            setReports(apiData.data || [])
            setLoading(false)
            return
          }
        }
        throw dbError
      }
      
      setReports(data || [])
    } catch (err: any) {
      console.error('Error fetching reports:', err)
      error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (report: Report) => {
    const reportText = `
RESUME ANALYSIS REPORT
==============================================
Generated: ${new Date(report.created_at).toLocaleDateString()} ${new Date(report.created_at).toLocaleTimeString()}

SCORES
==============================================
Match Score:  ${report.match_score}%
ATS Score:    ${report.ats_score}%

KEY STRENGTHS
==============================================
${report.strengths && report.strengths.length > 0 ? report.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'No data available'}

GROWTH AREAS
==============================================
${report.weaknesses && report.weaknesses.length > 0 ? report.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n') : 'No data available'}

MISSING CORE SKILLS
==============================================
${report.missing_skills && report.missing_skills.length > 0 ? report.missing_skills.join(', ') : 'No missing skills identified'}

ACTIONABLE ADVICE
==============================================
${report.suggestions && report.suggestions.length > 0 ? report.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'No suggestions available'}
    `.trim()

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportText))
    element.setAttribute('download', `resume-analysis-${report.id.slice(0, 8)}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    success('Report downloaded!')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-blue-500'
    return 'text-orange-500'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    return 'bg-orange-500'
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Report Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Unlock insights into your career potential with AI-driven resume auditing.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="secondary" onClick={fetchReports} disabled={loading}>
                <RefreshCw className={clsx("w-4 h-4 mr-2", loading && "animate-spin")} />
                Refresh
             </Button>
             <Button asChild>
                <Link href="/dashboard/wizard">
                  <Plus className="w-4 h-4 mr-2" /> New Analysis
                </Link>
             </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent">
            <CardBody className="py-20 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No Reports Found</h3>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">Upload your first resume to get a detailed breakdown of your skills and matching scores.</p>
              <Button asChild size="lg">
                <Link href="/dashboard/wizard">Upload Now</Link>
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border-none bg-white dark:bg-gray-900">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge variant="primary" className="bg-blue-600/10 text-blue-600 border-none px-3 py-1">
                        #{report.id.slice(0, 6)}
                    </Badge>
                  </div>

                  <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm font-bold mb-2 uppercase tracking-tighter text-gray-400">
                            <span>Match Score</span>
                            <span className={getScoreColor(report.match_score)}>{report.match_score}%</span>
                        </div>
                        <ProgressBar value={report.match_score} color={getScoreBg(report.match_score)} height="h-1.5" />
                    </div>

                    <div>
                        <div className="flex justify-between text-sm font-bold mb-2 uppercase tracking-tighter text-gray-400">
                            <span>ATS Accuracy</span>
                            <span className={getScoreColor(report.ats_score)}>{report.ats_score}%</span>
                        </div>
                        <ProgressBar value={report.ats_score} color={getScoreBg(report.ats_score)} height="h-1.5" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-50 dark:border-gray-800">
                    <Button variant="primary" fullWidth href={`/dashboard/reports/${report.id}`} leftIcon={<Eye className="w-4 h-4" />} className="rounded-xl shadow-lg shadow-blue-500/20">
                      Analysis
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleDownload(report)} className="rounded-xl p-2">
                      <Download className="w-4 h-4" />
                    </Button>
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