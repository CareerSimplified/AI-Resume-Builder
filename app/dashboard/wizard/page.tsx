'use client'
// Implements PRD v1.0 wizard flow, including REQ-M2-03 for Mode 2 Tabs and Locked states

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Upload, File, Wand2, Loader2, Target, CheckCircle2, Copy, Download,
    AlignLeft, BarChart3, Tag, FileText, GraduationCap, Lock, AlertCircle, ArrowRight, Sparkles
} from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Select } from '@/components/Form'
import { Badge } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { fileService } from '@/services/file.service'
import { supabase } from '@/lib/supabase'
import { userSidebarItems as sidebarItems } from '@/config/sidebar'
import { ResumePreview, ResumePreviewHandle } from '@/components/wizard/ResumePreview'
import { ResultsDashboard } from '@/components/wizard/ResultsDashboard'
import { resumeService, jobDescriptionService, reportService } from '@/services/database.service'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function WizardPage() {
    const { user, loading: authLoading, mounted } = useAuth()
    const router = useRouter()
    const { success, error, loading: loadingToast } = useToast()

    // Add user limits/pro status state
    const [isPro, setIsPro] = useState(false)
    const [analysesCount, setAnalysesCount] = useState({ JD_ALIGNMENT: 0, MBA_POLISH: 0 })
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [showLimitModal, setShowLimitModal] = useState(false)

    // Wizard state
    const [mode, setMode] = useState<'JD_ALIGNMENT' | 'MBA_POLISH'>('JD_ALIGNMENT')
    const [step, setStep] = useState<'MODE' | 'UPLOAD' | 'JD' | 'PROCESSING' | 'RESULTS'>('MODE')
    const [file, setFile] = useState<File | null>(null)
    const [companyName, setCompanyName] = useState('')
    const [roleTitle, setRoleTitle] = useState('')
    const [jobDescription, setJobDescription] = useState('')

    // Analysis state
    const [processingStep, setProcessingStep] = useState(0)
    const [analysisResult, setAnalysisResult] = useState<any>(null)
    const [analysisError, setAnalysisError] = useState<string | null>(null)
    const [activeResultTab, setActiveResultTab] = useState('resume')

    useEffect(() => {
        if (!mounted || authLoading) return
        if (!user) {
            router.push('/auth/login?redirect=/dashboard/wizard')
            return
        }

        // Fetch user plan and limits
        const fetchUserData = async () => {
            try {
                // Get plan
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('plan_id, reports_count')
                    .eq('id', user.id)
                    .single()

                if ((profile as any)?.plan_id) {
                    const { data: plan } = await supabase
                        .from('plans')
                        .select('slug')
                        .eq('id', (profile as any).plan_id)
                        .single()

                    if ((plan as any)?.slug === 'pro' || (plan as any)?.slug === 'enterprise') {
                        setIsPro(true)
                    }
                }

                // Get today's counts
                const today = new Date().toISOString().split('T')[0]
                const { data: reports } = await supabase
                    .from('reports')
                    .select('mode')
                    .eq('user_id', user.id)
                    .gte('created_at', today)

                const counts = { JD_ALIGNMENT: 0, MBA_POLISH: 0 };
                (reports as any[])?.forEach((r: any) => {
                    if (r.mode === 'MBA_POLISH') counts.MBA_POLISH++
                    else counts.JD_ALIGNMENT++
                })
                setAnalysesCount(counts)

            } catch (err) {
                console.error('Error fetching user data:', err)
            }
        }

        fetchUserData()
    }, [user, authLoading, mounted, router])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            if (selectedFile.size > 5 * 1024 * 1024) {
                error('File size must be under 5MB')
                return
            }
            if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
                error('Only PDF and DOCX files are supported')
                return
            }
            setFile(selectedFile)
            setStep(mode === 'JD_ALIGNMENT' ? 'JD' : 'PROCESSING')
            if (mode === 'MBA_POLISH') {
                startAnalysis(selectedFile)
            }
        }
    }

    const startAnalysis = async (selectedFile: File) => {
        if (!user) return;
        // Check limits - bypassed per request
        // if (!isPro && analysesCount[mode] >= 2) {
        //     setShowLimitModal(true)
        //     return
        // }

        setStep('PROCESSING')
        setAnalysisError(null)
        setProcessingStep(0)

        const processInterval = setInterval(() => {
            setProcessingStep(prev => (prev < 3 ? prev + 1 : prev))
        }, 3000)

        try {
            // 1. Extract text
            const text = await fileService.extractTextFromFile(selectedFile)

            let jdId = null;
            let resumeId = null;

            // 2. Save JD if Alignment mode
            if (mode === 'JD_ALIGNMENT') {
                const { data: jdData, error: jdError } = await jobDescriptionService.create(user.id, {
                    company: companyName || 'Not Specified',
                    title: roleTitle || 'Not Specified',
                    description: jobDescription,
                    skills: [],
                    experience: 'mid'
                })
                if (jdError) console.error("Error saving JD:", jdError)
                jdId = (jdData as any)?.id;
            }

            // 3. Save Resume
            const { data: resumes, error: resumeError } = await resumeService.create(
                user.id,
                jdId || null,
                '', // fileUrl placeholder
                text,
                selectedFile.name
            )
            if (resumeError) console.error("Error saving resume:", resumeError)
            resumeId = (resumes as any[])?.[0]?.id;

            // 4. Call AI API
            const response = await fetch('/api/analyze-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText: text,
                    jobDescription: mode === 'JD_ALIGNMENT' ? jobDescription : undefined,
                    resumeId: resumeId,
                    userId: user.id,
                    jdId: jdId,
                    mode: mode,
                    isPro: true // Bypassing Pro check for now
                })
            })

            const result = await response.json()
            if (!result.success) throw new Error(result.error || 'Analysis failed')

            setAnalysisResult(result.analysis)
            clearInterval(processInterval)
            setProcessingStep(4)

            // Increment local count
            setAnalysesCount(prev => ({
                ...prev,
                [mode]: prev[mode] + 1
            }))

            success('Analysis complete and saved to your history!')

            setTimeout(() => {
                setStep('RESULTS')
            }, 1000)

        } catch (err: any) {
            clearInterval(processInterval)
            setAnalysisError(err.message || 'Operation failed')
        }
    }

    const resumePreviewRef = useRef<ResumePreviewHandle>(null);

    const handleDownloadDocx = async () => {
        // Bypassing Pro check for now
        // if (!isPro) {
        //     setShowUpgradeModal(true)
        //     return
        // }

        try {
            loadingToast('Preparing your DOCX...')
            const res = await fetch('/api/resume/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: analysisResult.rewrittenResume,
                    firstName: user?.name?.split(' ')[0] || 'Optimized',
                    lastName: user?.name?.split(' ').slice(1).join(' ') || 'Resume'
                })
            })

            if (!res.ok) throw new Error('Download failed')

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Optimized_Resume_${new Date().getTime()}.docx`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            success('DOCX downloaded!')
        } catch (err: any) {
            error(err.message || 'Failed to download DOCX')
        }
    }

    const handleDownloadPdf = async () => {
        if (!analysisResult) {
            error("No resume data available");
            return;
        }
        try {
            const res = await fetch('/api/resume/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData: analysisResult.rewrittenResumeData,
                    fileName: 'Optimized_Resume'
                })
            });
            if (!res.ok) throw new Error('Failed to generate');

            const html = await res.text();
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Resume_${Date.now()}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            error(err.message || 'Failed to generate PDF');
        }
    }

    const handleStartOver = () => {
        setStep('MODE')
        setFile(null)
        setJobDescription('')
        setAnalysisResult(null)
        setProcessingStep(0)
    }

    const renderModeSelect = () => (
        <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4">
            <div className="text-center mb-10 sm:mb-14">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">
                    Resume <span className="bg-gradient-to-r from-indigo-600  bg-clip-text text-transparent">AI.</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto">
                    Whether you're polishing for a top-tier MBA or aligning for a specific role, we've got you covered.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div
                    className={`cursor-pointer transition-all duration-300 rounded-2xl sm:rounded-3xl border-2 p-6 sm:p-8 ${mode === 'JD_ALIGNMENT'
                        ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/30 shadow-xl shadow-indigo-500/10 scale-[1.02]'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-300 hover:shadow-lg'
                        }`}
                    onClick={() => setMode('JD_ALIGNMENT')}
                >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 ${mode === 'JD_ALIGNMENT' ? 'bg-indigo-500 text-white' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                        }`}>
                        <Target className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3">JD Alignment</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed">Tailor your resume for a specific job description. High-precision keyword matching and skill gap analysis.</p>
                    <Button variant={mode === 'JD_ALIGNMENT' ? 'primary' : 'outline'} fullWidth className="h-12 sm:h-14 rounded-xl font-bold">Select Mode</Button>
                </div>

                <div
                    className={`cursor-pointer transition-all duration-300 rounded-2xl sm:rounded-3xl border-2 p-6 sm:p-8 ${mode === 'MBA_POLISH'
                        ? 'border-violet-500 bg-violet-50/80 dark:bg-violet-950/30 shadow-xl shadow-violet-500/10 scale-[1.02]'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-violet-300 hover:shadow-lg'
                        }`}
                    onClick={() => setMode('MBA_POLISH')}
                >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 ${mode === 'MBA_POLISH' ? 'bg-violet-500 text-white' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600'
                        }`}>
                        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3">MBA Format Polish</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed">Standardize your resume for elite business school applications. Impact-first narration and quantifiable metrics.</p>
                    <Button variant={mode === 'MBA_POLISH' ? 'primary' : 'outline'} fullWidth className="h-12 sm:h-14 rounded-xl font-bold">Select Mode</Button>
                </div>
            </div>

            <div className="mt-10 sm:mt-14 text-center">
                <Button size="lg" className="h-14 sm:h-16 px-10 sm:px-14 rounded-2xl font-black text-lg sm:text-xl text-white shadow-2xl shadow-indigo-500/25 border-none" onClick={() => setStep('UPLOAD')}>
                    Continue <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
            </div>
        </div>
    )

    const renderUpload = () => (
        <div className="max-w-2xl mx-auto py-10 sm:py-20 px-4 animate-in fade-in slide-in-from-bottom-4">
            <Button variant="ghost" onClick={() => setStep('MODE')} className="mb-6"><ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back</Button>
            <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">Upload your resume</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">PDF or DOCX, max 5MB. We'll handle the rest.</p>
            </div>

            <label className="block">
                <div className="border-3 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center hover:border-indigo-500 transition-colors cursor-pointer group bg-white dark:bg-gray-900 shadow-sm">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                    </div>
                    <span className="text-lg sm:text-xl font-black text-gray-400 group-hover:text-indigo-600 transition-colors">Click to browse or drag & drop</span>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
                </div>
            </label>
        </div>
    )

    const renderJDEntry = () => (
        <div className="max-w-3xl mx-auto py-8 sm:py-10 px-4 animate-in fade-in slide-in-from-bottom-4">
            <Button variant="ghost" onClick={() => setStep('UPLOAD')} className="mb-6"><ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back</Button>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Target Job Description</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 sm:mb-8">Upload a JD file or paste the text you want to align your resume with.</p>

            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Company Name (Optional)</label>
                    <input type="text" className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Role Title (Optional)</label>
                    <input type="text" className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} />
                </div>
            </div> */}

            <div className="mb-8">
                <label className="block text-sm font-medium mb-2">Upload Job Description (PDF/DOCX) OR Paste Below</label>
                <div className="mb-4">
                    <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 dark:bg-slate-800 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
                        onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                                try {
                                    const text = await fileService.extractTextFromFile(e.target.files[0]);
                                    setJobDescription(text);
                                } catch (err) {
                                    console.error("Could not read JD file", err);
                                }
                            }
                        }}
                    />
                </div>
                <textarea
                    className="w-full h-64 p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent resize-none font-sans"
                    placeholder="Paste the JD here..."
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                />
            </div>

            <Button
                fullWidth
                size="lg"
                className="h-16 rounded-2xl font-black text-xl"
                disabled={!jobDescription}
                onClick={() => startAnalysis(file!)}
            >
                Launch Analysis <Wand2 className="ml-2 w-6 h-6" />
            </Button>
        </div>
    )

    const renderProcessing = () => {
        const steps = ['Extracting text...', 'Analyzing structure...', 'Generating improvements...', 'Finalizing report...']
        return (
            <div className="max-w-xl mx-auto py-20 px-4 text-center">
                <div className="mb-12 relative">
                    <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <Wand2 className="w-16 h-16 text-indigo-600 animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-black mb-4">Magic in progress...</h2>
                    <p className="text-slate-500 font-medium">Our AI is re-engineering your career story.</p>
                </div>

                {analysisError ? (
                    <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl">
                        <p className="text-red-600 font-bold mb-4">{analysisError}</p>
                        <Button onClick={() => setStep('UPLOAD')}>Try Again</Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            {steps.map((s, idx) => (
                                <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${idx === processingStep ? 'bg-white dark:bg-slate-900 shadow-md scale-105' : 'opacity-40'}`}>
                                    {idx < processingStep ? (
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                                    ) : idx === processingStep ? (
                                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin flex-shrink-0" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-800 flex-shrink-0" />
                                    )}
                                    <span className={`text-lg font-bold ${idx === processingStep ? 'text-indigo-600' : ''}`}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderResults = () => {
        if (!analysisResult) return null

        return (
            <ResultsDashboard
                analysisResult={analysisResult}
                mode={mode}
                jdData={{ company: companyName, role: roleTitle }}
                activeResultTab={activeResultTab}
                setActiveResultTab={setActiveResultTab}
                onStartOver={handleStartOver}
                resumePreviewRef={resumePreviewRef}
                onDownloadPdf={handleDownloadPdf}
                onDownloadDocx={handleDownloadDocx}
            />
        )
    }

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
                {step === 'MODE' && renderModeSelect()}
                {step === 'UPLOAD' && renderUpload()}
                {step === 'JD' && renderJDEntry()}
                {step === 'PROCESSING' && renderProcessing()}
                {step === 'RESULTS' && renderResults()}

                {/* PRO Upgrade Modal */}
                {showUpgradeModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-in zoom-in-95">
                            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">✕</button>
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500"><Lock className="w-8 h-8" /></div>
                            <h3 className="text-2xl font-bold text-center mb-2">Pro Feature</h3>
                            <p className="text-center text-gray-500 mb-8">
                                Downloading the polished DOCX directly requires a Pro plan. Upgrade now to save time and get the full suite of career tools!
                            </p>
                            <Button fullWidth size="lg" className="bg-amber-500 hover:bg-amber-600 mb-3" onClick={() => router.push('/dashboard/profile')}>Upgrade to Pro</Button>
                            <Button fullWidth variant="ghost" onClick={() => setShowUpgradeModal(false)}>Maybe Later</Button>
                        </div>
                    </div>
                )}

                {/* Limit Modal */}
                {showLimitModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-in zoom-in-95">
                            <button onClick={() => setShowLimitModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">✕</button>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500"><AlertCircle className="w-8 h-8" /></div>
                            <h3 className="text-2xl font-bold text-center mb-2">Daily Limit Reached</h3>
                            <p className="text-center text-gray-500 mb-8">
                                Free users can only perform 2 analyses per mode each day. You've hit your limit!
                            </p>
                            <Button fullWidth size="lg" className="bg-indigo-600 hover:bg-indigo-700 mb-3" onClick={() => router.push('/dashboard/profile')}>Unlock Unlimited (Pro)</Button>
                            <Button fullWidth variant="ghost" onClick={() => setShowLimitModal(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
