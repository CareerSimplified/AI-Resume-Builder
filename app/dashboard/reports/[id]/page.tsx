'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Home, FileText, Plus, BarChart3, Settings, ArrowLeft, Copy, Download, CheckCircle, AlertCircle, Sparkles, Wand2, Lightbulb, FileDown } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RESUME' | 'SUITE' | 'GAPS'>('OVERVIEW')
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
      // 1. Fetch report first (can be by report ID or resume ID)
      const reportRes = await fetch(`/api/reports/${resumeId}`)
      const reportData = await reportRes.json()

      if (reportData.success && reportData.data) {
        setReport(reportData.data)
        
        // 2. Now fetch the associated resume using the report's resume_id
        const actualResumeId = reportData.data.resume_id
        const resumeRes = await fetch(`/api/resumes/${actualResumeId}`)
        const resumeData = await resumeRes.json()
        
        if (resumeData.success && resumeData.data) {
          setResume(resumeData.data)
        }
      } else {
        throw new Error(reportData.error || 'Report not found')
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

  const handleDownloadResume = () => {
    if (!resume?.file_url) return
    const link = document.createElement('a')
    link.href = resume.file_url
    link.download = resume.file_name || 'resume.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    success('Resume downloaded!')
  }

  const handleCopyAll = () => {
    if (!report) return
    const fullReport = `
RESUME ANALYSIS REPORT
==============================================
File: ${resume?.file_name || 'Unknown'}
Mode: ${report.mode || 'JD Alignment'}
Generated: ${new Date(report.created_at).toLocaleDateString()} ${new Date(report.created_at).toLocaleTimeString()}

SCORES
==============================================
Match Score:  ${report.match_score}%
ATS Score:    ${report.ats_score}%

KEY STRENGTHS
==============================================
${report.strengths?.map((s, i) => `${i + 1}. ${s}`).join('\n') || 'None'}

GROWTH AREAS
==============================================
${report.weaknesses?.map((w, i) => `${i + 1}. ${w}`).join('\n') || 'None'}

MISSING CORE SKILLS
==============================================
${report.missing_skills?.join(', ') || 'None'}

AI SUGGESTIONS
==============================================
${report.suggestions?.map((s, i) => `${i + 1}. ${s}`).join('\n') || 'None'}
    `.trim()
    copyToClipboard(fullReport, 'Full Report')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-blue-500'
    if (score >= 40) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-600'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
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
          <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse tracking-tight">Compiling final report...</p>
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
            <Link href="/dashboard/reports">Return to Reports</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12 px-4 md:px-0">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <Link href="/dashboard/reports" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 mb-2 transition-all hover:gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Reports
            </Link>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              {report.mode === 'MBA_POLISH' ? 'MBA Executive Report' : 'JD Alignment Report'}
              <Badge variant="primary" className="bg-blue-600/10 text-blue-600 border-none px-2 uppercase text-[10px]">
                {report.mode || 'Standard'}
              </Badge>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 font-medium">
              <FileText className="w-4 h-4 text-blue-500" />
              {resume.file_name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button variant="outline" onClick={handleDownloadResume} size="sm" className="rounded-xl border-gray-200 dark:border-gray-800">
              <FileDown className="w-4 h-4 mr-2" />
              Original
            </Button>
            <Button variant="secondary" onClick={handleCopyAll} size="sm" className="rounded-xl">
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
            <Button onClick={() => window.print()} size="sm" className="rounded-xl shadow-lg shadow-blue-600/20">
              <Download className="w-4 h-4 mr-2" />
              PDF Export
            </Button>
          </div>
        </div>

        {/* Dynamic Tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-1 mb-2 scrollbar-hide border-b border-gray-200 dark:border-gray-800">
            <button 
                onClick={() => setActiveTab('OVERVIEW')} 
                className={clsx(
                    "flex items-center gap-2 px-6 py-4 font-bold rounded-t-2xl transition-all whitespace-nowrap",
                    activeTab === 'OVERVIEW' 
                        ? "bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600" 
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
            >
                <BarChart3 className="w-4 h-4" /> Overview
            </button>
            {report.rewritten_resume && (
                <button 
                    onClick={() => setActiveTab('RESUME')} 
                    className={clsx(
                        "flex items-center gap-2 px-6 py-4 font-bold rounded-t-2xl transition-all whitespace-nowrap",
                        activeTab === 'RESUME' 
                            ? "bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600" 
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                >
                    <Wand2 className="w-4 h-4" /> AI-Enhanced Resume
                </button>
            )}
            {(report.cover_letter || report.interview_prep) && (
                <button 
                    onClick={() => setActiveTab('SUITE')} 
                    className={clsx(
                        "flex items-center gap-2 px-6 py-4 font-bold rounded-t-2xl transition-all whitespace-nowrap",
                        activeTab === 'SUITE' 
                            ? "bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600" 
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                >
                    <Sparkles className="w-4 h-4" /> Career Suite
                </button>
            )}
            {report.gaps && (
                <button 
                    onClick={() => setActiveTab('GAPS')} 
                    className={clsx(
                        "flex items-center gap-2 px-6 py-4 font-bold rounded-t-2xl transition-all whitespace-nowrap",
                        activeTab === 'GAPS' 
                            ? "bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600" 
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                >
                    <AlertCircle className="w-4 h-4" /> Gap Analysis
                </button>
            )}
        </div>

        {/* Tabs Content */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none min-h-[600px]">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Global Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card className="bg-gray-50 dark:bg-gray-800/50 border-none overflow-hidden relative group">
                        <CardBody className="p-8">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Match Accuracy</h3>
                                    <p className="text-sm text-gray-500 font-medium">JD Alignment & Relevance</p>
                                </div>
                                <div className={clsx("text-4xl font-black", getScoreColor(report.match_score))}>
                                    {report.match_score}%
                                </div>
                            </div>
                            <ProgressBar value={report.match_score} color={getScoreBg(report.match_score)} height="h-3" />
                        </CardBody>
                    </Card>

                    <Card className="bg-gray-50 dark:bg-gray-800/50 border-none overflow-hidden relative group">
                        <CardBody className="p-8">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">ATS Compatibility</h3>
                                    <p className="text-sm text-gray-500 font-medium">Readability & Structure</p>
                                </div>
                                <div className={clsx("text-4xl font-black", getScoreColor(report.ats_score))}>
                                    {report.ats_score}%
                                </div>
                            </div>
                            <ProgressBar value={report.ats_score} color={getScoreBg(report.ats_score)} height="h-3" />
                        </CardBody>
                    </Card>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <h3 className="text-2xl font-black tracking-tight">Key Strengths</h3>
                        </div>
                        <div className="space-y-4">
                            {report.strengths?.map((item, i) => (
                                <div key={i} className="flex gap-4 items-start p-5 bg-green-50/30 dark:bg-green-900/10 rounded-2xl border border-green-100/50 dark:border-green-900/30 group transition-all hover:bg-green-50/50">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                                        {i + 1}
                                    </span>
                                    <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <Wand2 className="w-6 h-6 text-orange-500" />
                            <h3 className="text-2xl font-black tracking-tight">Growth Areas</h3>
                        </div>
                        <div className="space-y-4">
                            {report.weaknesses?.map((item, i) => (
                                <div key={i} className="flex gap-4 items-start p-5 bg-orange-50/30 dark:bg-orange-900/10 rounded-2xl border border-orange-100/50 dark:border-orange-900/30 group transition-all hover:bg-orange-50/50">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm italic">
                                        !
                                    </span>
                                    <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <h3 className="text-2xl font-black tracking-tight">Missing Core Skills</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {report.missing_skills?.map((skill, i) => (
                                <span key={i} className="px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl font-bold border border-red-100 dark:border-red-900/30">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <Lightbulb className="w-6 h-6 text-blue-500" />
                            <h3 className="text-2xl font-black tracking-tight">Actionable Advice</h3>
                        </div>
                        <div className="space-y-3">
                            {report.suggestions?.map((item, i) => (
                                <div key={i} className="p-4 bg-blue-50/20 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 font-medium text-sm text-gray-600 dark:text-gray-400 italic">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
          )}

          {/* TAB: AI-ENHANCED RESUME */}
          {activeTab === 'RESUME' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-blue-500" />
                        AI-Improved Resume
                    </h3>
                    <Button variant="secondary" size="sm" onClick={() => copyToClipboard(report.rewritten_resume || '', 'Resume')}>
                        <Copy className="w-4 h-4 mr-2" /> Copy Markdown
                    </Button>
                </div>
                <div className="bg-gray-50 dark:bg-[#0b0f1a] p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-inner max-h-[1000px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800">
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-300">
                        {report.rewritten_resume}
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                        This version follows the <b>MBA / XYZ Structure</b> (Accomplished X, as measured by Y, by doing Z).
                    </p>
                </div>
            </div>
          )}

          {/* TAB: CAREER SUITE */}
          {activeTab === 'SUITE' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {report.cover_letter && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                <FileText className="w-5 h-5 text-purple-500" />
                                Tailored Cover Letter
                            </h4>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(report.cover_letter || '', 'Cover Letter')}>
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="bg-purple-50/20 dark:bg-purple-950/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/30 whitespace-pre-wrap text-sm leading-relaxed font-medium text-gray-700 dark:text-gray-300">
                            {report.cover_letter}
                        </div>
                    </section>
                )}

                {report.interview_prep && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                <Home className="w-5 h-5 text-amber-500" />
                                Interview Preparation Guide
                            </h4>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(JSON.stringify(report.interview_prep), 'Interview Prep')}>
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="bg-amber-50/20 dark:bg-amber-950/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-sm leading-relaxed font-medium text-gray-700 dark:text-gray-300">
                             {typeof report.interview_prep === 'string' ? report.interview_prep : JSON.stringify(report.interview_prep, null, 2)}
                        </div>
                    </section>
                )}

                {report.plan_306090 && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                30-60-90 Day Strategy
                            </h4>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(report.plan_306090 || '', 'Plan')}>
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="bg-blue-50/20 dark:bg-blue-950/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 whitespace-pre-wrap text-sm leading-relaxed font-medium text-gray-700 dark:text-gray-300">
                            {report.plan_306090}
                        </div>
                    </section>
                )}
            </div>
          )}

          {/* TAB: GAP ANALYSIS */}
          {activeTab === 'GAPS' && report.gaps && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    Deep Gap Analysis
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border border-red-100 dark:border-red-900/20 bg-red-50/5 dark:bg-red-950/5">
                        <CardHeader className="font-bold p-4 bg-red-50/50 dark:bg-red-900/20 border-b dark:border-red-900/30">
                            Missing Skills & Keywords
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="flex flex-wrap gap-2">
                                {report.gaps.missing_skills?.map(s => <Badge key={s} variant="danger" className="rounded-lg">{s}</Badge>)}
                                {report.gaps.missing_keywords?.map(k => <Badge key={k} variant="secondary" className="rounded-lg">{k}</Badge>)}
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border border-purple-100 dark:border-purple-900/20 bg-purple-50/5 dark:bg-purple-950/5">
                        <CardHeader className="font-bold p-4 bg-purple-50/50 dark:bg-purple-900/20 border-b dark:border-purple-900/30">
                            Frameworks & Tools
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="flex flex-wrap gap-2">
                                {report.gaps.missing_frameworks?.map(f => <Badge key={f} variant="primary" className="rounded-lg">{f}</Badge>)}
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="md:col-span-2 border border-amber-100 dark:border-amber-900/20 bg-amber-50/5 dark:bg-amber-950/5">
                        <CardHeader className="font-bold p-4 bg-amber-50/50 dark:bg-amber-900/20 border-b dark:border-amber-900/30">
                            Inferred Missing Metrics / Leadership Evidence
                        </CardHeader>
                        <CardBody className="p-6">
                            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                {report.gaps.missing_metrics?.map((m, i) => <li key={i}>{m}</li>)}
                                {report.gaps.missing_leadership?.map((l, i) => <li key={i}>{l}</li>)}
                            </ul>
                        </CardBody>
                    </Card>
                </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  )
}
