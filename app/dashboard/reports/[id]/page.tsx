'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Home, FileText, Plus, BarChart3, Settings, ArrowLeft, Copy, Download, CheckCircle, AlertCircle, Sparkles, Wand2, Lightbulb } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge, ProgressBar } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { reportService, resumeService } from '@/services/database.service'
import { Report, Resume } from '@/types'
import Link from 'next/link'
import clsx from 'clsx'

import { userSidebarItems as sidebarItems } from '@/config/sidebar'


export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, mounted } = useAuth()
  const { success, error } = useToast()
  const resumeId = params.id as string

  const [report, setReport] = useState<Report | null>(null)
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  useEffect(() => {
    if (mounted && user?.id && resumeId) {
      fetchData()
    } else if (mounted && !user) {
      setLoading(false)
    }
  }, [user, resumeId, mounted])

  const fetchData = async () => {
    try {
      // Fetch resume and report in parallel via API (bypasses RLS)
      const [resumeRes, reportRes] = await Promise.all([
        fetch(`/api/resumes/${resumeId}`),
        fetch(`/api/reports/${resumeId}`)
      ])

      const resumeData = await resumeRes.json()
      const reportData = await reportRes.json()

      if (resumeData.success && resumeData.data) {
        setResume(resumeData.data)
      }

      if (reportData.success && reportData.data) {
        setReport(reportData.data)
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      error('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    success(`${section} copied to clipboard!`)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const handleCopyAll = () => {
    if (!report) return
    const fullReport = `
RESUME ANALYSIS REPORT
==============================================
File: ${resume?.file_name || 'Unknown'}
Generated: ${new Date(report.created_at).toLocaleDateString()} ${new Date(report.created_at).toLocaleTimeString()}

SCORES
==============================================
Match Score:  ${report.match_score}%
ATS Score:    ${report.ats_score}%

KEY STRENGTHS
==============================================
${report.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

GROWTH AREAS
==============================================
${report.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

MISSING CORE SKILLS
==============================================
${report.missing_skills.join(', ')}

ACTIONABLE ADVICE
==============================================
${report.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}
    `.trim()
    copyToClipboard(fullReport, 'Full Report')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-blue-500'
    if (score >= 40) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative w-20 h-20 mb-4">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">AI is compiling your analysis...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!report || !resume) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="max-w-md mx-auto text-center py-20">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the analysis report you're looking for.</p>
          <Button asChild>
            <Link href="/dashboard/reports">Return to Dashboard</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard/reports" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Reports
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              AI Analysis Result
              <Badge variant="primary">Beta</Badge>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {resume.file_name}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleCopyAll}>
              <Copy className="w-4 h-4 mr-2" />
              {copiedSection === 'Full Report' ? 'Copied!' : 'Copy Analysis'}
            </Button>
            <Button onClick={() => window.print()} className="hidden md:flex">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="overflow-hidden border-t-4 border-t-blue-500">
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Match Accuracy</h3>
                  <p className="text-sm text-gray-500">Correlation with job requirements</p>
                </div>
                <div className={clsx("text-4xl font-bold", getScoreColor(report.match_score))}>
                  {report.match_score}%
                </div>
              </div>
              <ProgressBar value={report.match_score} color="bg-blue-600" />
            </CardBody>
          </Card>

          <Card className="overflow-hidden border-t-4 border-t-purple-500">
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ATS Compatibility</h3>
                  <p className="text-sm text-gray-500">Readability for automated systems</p>
                </div>
                <div className={clsx("text-4xl font-bold", getScoreColor(report.ats_score))}>
                  {report.ats_score}%
                </div>
              </div>
              <ProgressBar value={report.ats_score} color="bg-purple-600" />
            </CardBody>
          </Card>
        </div>

        {/* Detailed Analysis Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Strengths */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Key Strengths
              </h3>
              <button 
                onClick={() => copyToClipboard(report.strengths.join('\n'), 'Strengths')}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Copy section"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="grid gap-3">
              {report.strengths.map((item, i) => (
                <div key={i} className="p-4 bg-white dark:bg-[#0b0f1a] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex gap-3">
                  <span className="text-green-500 font-bold"># {i+1}</span>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Improvement areas */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-orange-500" />
                Growth Areas
              </h3>
              <button 
                onClick={() => copyToClipboard(report.weaknesses.join('\n'), 'Growth Areas')}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Copy section"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="grid gap-3">
              {report.weaknesses.map((item, i) => (
                <div key={i} className="p-4 bg-white dark:bg-[#0b0f1a] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex gap-3">
                  <span className="text-orange-500 font-bold">!</span>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Missing Skills */}
          <section className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                Missing Core Skills
              </h3>
              <button 
                onClick={() => copyToClipboard(report.missing_skills.join(', '), 'Missing Skills')}
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-[#0b0f1a]/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap gap-2">
                {report.missing_skills.map((skill, i) => (
                  <Badge key={i} variant="danger" className="text-sm py-1.5 px-3 bg-white dark:bg-gray-900 border-red-100 dark:border-red-900/30 text-red-600">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          {/* AI Suggestions */}
          <section className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                Actionable Advice
              </h3>
            </div>
            <div className="space-y-4">
              {report.suggestions.map((suggestion, i) => (
                <div key={i} className="group relative p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 transition-all hover:shadow-md">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Step {i+1}</span>
                     <button 
                        onClick={() => copyToClipboard(suggestion, 'Suggestion')}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-600"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                   </div>
                   <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                     {suggestion}
                   </p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  )
}
