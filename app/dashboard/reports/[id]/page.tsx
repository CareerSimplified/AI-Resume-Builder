'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Home, FileText, Plus, BarChart3, Settings, ArrowLeft, Copy, Download, CheckCircle, AlertCircle, Sparkles, Wand2, Lightbulb, FileDown, HelpCircle, Target } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
// Service imports if needed in future
// import { reportService, resumeService } from '@/services/database.service'
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
  const [activeTab, setActiveTab] = useState<'resume' | 'score' | 'gaps' | 'cover' | 'interview'>('resume')
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
    success(`${section} copied to clipboard!`)
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
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] p-4 sm:p-6 md:p-10 lg:p-16 font-sans selection:bg-indigo-500/30">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Navigation & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <Link href="/dashboard/reports" className="text-indigo-600 hover:text-indigo-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4 group transition-all">
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                Back to History
              </Link>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
                {report.mode === 'MBA_POLISH' ? 'Executive Report' : 'JD Alignment'}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 border-none px-3 py-1 uppercase text-[10px] font-black">
                  {report.mode || 'Standard'}
                </Badge>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  {resume.file_name}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleDownloadResume} className="h-12 rounded-xl border-2 font-black text-xs">
                <FileDown className="w-4 h-4 mr-2" /> Original
              </Button>
              <Button variant="secondary" onClick={handleCopyAll} className="h-12 rounded-xl font-black text-xs">
                <Copy className="w-4 h-4 mr-2" /> Copy All
              </Button>
              <Button onClick={() => window.print()} className="h-12 rounded-xl font-black text-xs bg-slate-900 shadow-xl shadow-slate-900/20">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </div>

          {/* Dynamic Tabs */}
          <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] overflow-x-auto scrollbar-hide">
            {[
              { id: 'resume', label: 'AI Resume', icon: FileText },
              { id: 'score', label: 'Score', icon: BarChart3 },
              { id: 'gaps', label: 'Gaps', icon: Target },
              { id: 'cover', label: 'Cover Letter', icon: Sparkles, condition: !!report.cover_letter },
              { id: 'interview', label: 'Interview Prep', icon: HelpCircle, condition: !!report.interview_prep },
            ].map(tab => (
              (!('condition' in tab) || tab.condition) && (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    "flex items-center gap-2.5 px-6 py-3.5 font-black rounded-[1.25rem] transition-all whitespace-nowrap text-[11px] uppercase tracking-widest",
                    activeTab === tab.id
                      ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-xl shadow-slate-200 dark:shadow-none"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              )
            ))}
          </div>

          {/* Tabs Content */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 lg:p-16 border border-white/20 shadow-2xl min-h-[600px]">

            {/* TAB: RESUME */}
            {activeTab === 'resume' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b dark:border-slate-800 pb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Wand2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">AI-Optimized Version</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Re-engineered for peak ATS performance</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="rounded-xl font-black px-6 flex-1 sm:flex-none h-12 border-2" onClick={() => copyToClipboard(report.rewritten_resume || '', 'Resume')}>
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0b0f1a] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="p-8 sm:p-12 md:p-16 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-serif min-h-[800px]">
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                      {report.rewritten_resume || "No rewritten version available for this report."}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SCORE */}
            {activeTab === 'score' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-2xl rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/20">
                  <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="552.6" strokeDashoffset={552.6 - (552.6 * (report.match_score || 0) / 100)} className="text-indigo-600 transition-all duration-1000" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{report.match_score}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</span>
                    </div>
                  </div>
                  <h3 className={clsx("text-3xl font-black mb-2 tracking-tight", getScoreColor(report.match_score))}>
                    {report.match_score >= 80 ? 'Exceptional' : report.match_score >= 60 ? 'Strong Match' : 'Optimization Needed'}
                  </h3>
                  <p className="text-slate-500 font-medium">Your resume's overall alignment with the target requirements.</p>
                </Card>

                <div className="space-y-8">
                  <section className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Actionable Suggestions</h4>
                    <div className="space-y-3">
                      {report.suggestions?.map((s, i) => (
                        <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex-shrink-0 flex items-center justify-center text-[10px] mt-0.5">!</div>
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{s}</p>
                        </div>
                      )) || <p className="text-slate-400">No suggestions available.</p>}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* TAB: GAPS */}
            {activeTab === 'gaps' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-right-4 duration-500">
                <section className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" /> Strengths
                  </h3>
                  <div className="space-y-4">
                    {report.strengths?.map((s, i) => (
                      <div key={i} className="p-5 rounded-[2rem] bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{s}</p>
                      </div>
                    )) || <p>None</p>}
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500" /> Weaknesses
                  </h3>
                  <div className="space-y-4">
                    {report.weaknesses?.map((s, i) => (
                      <div key={i} className="p-5 rounded-[2rem] bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{s}</p>
                      </div>
                    )) || <p>None</p>}
                  </div>
                </section>

                <section className="md:col-span-2 p-10 bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-widest">Missing Skills & Keywords</h3>
                  <div className="flex flex-wrap gap-3">
                    {report.missing_skills?.map((s, i) => <Badge key={i} variant="secondary" className="px-4 py-2 bg-white dark:bg-slate-900 border-none rounded-xl text-xs font-black uppercase tracking-wider">{s}</Badge>)}
                  </div>
                </section>
              </div>
            )}

            {/* TAB: COVER LETTER */}
            {activeTab === 'cover' && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-indigo-600">Tailored Cover Letter</h3>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(report.cover_letter || '', 'Cover Letter')}>
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </Button>
                </div>
                <div className="max-w-[8.5in] mx-auto p-12 sm:p-20 bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] font-serif leading-relaxed text-lg min-h-[900px] border dark:border-slate-800">
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                    {report.cover_letter || "No cover letter was generated for this report."}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INTERVIEW PREP */}
            {activeTab === 'interview' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Interview Suite</h3>
                  <Button variant="secondary" size="sm" onClick={() => copyToClipboard(typeof report.interview_prep === 'string' ? report.interview_prep : JSON.stringify(report.interview_prep), 'Interview Prep')}>
                    <Copy className="w-4 h-4 mr-2" /> Copy All
                  </Button>
                </div>
                <div className="grid gap-6">
                  {(() => {
                    let questions: any[] = [];
                    try { questions = typeof report.interview_prep === 'string' ? JSON.parse(report.interview_prep) : (report.interview_prep || []); } catch { questions = []; }

                    if (Array.isArray(questions) && questions.length > 0) {
                      return questions.map((q, i) => (
                        <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 group">
                          <div className="flex items-start gap-4 mb-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">Q{i + 1}</span>
                            <p className="font-black text-slate-900 dark:text-white text-lg leading-tight">{q.question}</p>
                          </div>
                          <div className="ml-14 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{q.answer}</p>
                          </div>
                        </div>
                      ));
                    }

                    return <div className="p-10 bg-slate-100 dark:bg-slate-800 rounded-3xl text-center font-bold text-slate-500">Detailed Q&A data not available for this legacy report.</div>;
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
