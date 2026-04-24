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

export default function WizardPage() {
    const { user, loading: authLoading, mounted } = useAuth()
    const router = useRouter()
    const { success, error, loading: loadingToast } = useToast()

    // Add user limits/pro status state
    const [isPro, setIsPro] = useState(false)
    const [mode1Uses, setMode1Uses] = useState(0)
    const [mode2Uses, setMode2Uses] = useState(0)

    // Wizard State
    const [step, setStep] = useState<'MODE' | 'UPLOAD' | 'JD' | 'PROCESSING' | 'RESULTS'>('MODE')
    const [mode, setMode] = useState<'MBA_POLISH' | 'JD_ALIGNMENT'>('MBA_POLISH')
    const [targetStandard, setTargetStandard] = useState('Auto Detect')

    // Resume State
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [resumeText, setResumeText] = useState('')
    const [isDragging, setIsDragging] = useState(false)
    const [isExtracting, setIsExtracting] = useState(false)

    // JD State
    const [jdText, setJdText] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [roleTitle, setRoleTitle] = useState('')

    // Processing State
    const [processingStep, setProcessingStep] = useState(0)
    const [analysisError, setAnalysisError] = useState<string | null>(null)

    // Result State
    const [analysisResult, setAnalysisResult] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'RESUME' | 'MATCH' | 'KEYWORDS' | 'COVERLETTER' | 'INTERVIEW'>('RESUME')
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [showLimitModal, setShowLimitModal] = useState(false)

    useEffect(() => {
        if (mounted && !authLoading && user) {
            checkUserStatus(user.id)
        } else if (mounted && !authLoading && !user) {
            router.push('/auth/login?redirect=/dashboard/wizard')
        }
    }, [user, authLoading, mounted, router])

    const checkUserStatus = async (userId: string) => {
        const { data } = await supabase.from('users').select('is_pro, mode1_uses_today, mode2_uses_today').eq('id', userId).maybeSingle() as { data: any }
        if (data) {
            setIsPro(!!data.is_pro)
            setMode1Uses(data.mode1_uses_today || 0)
            setMode2Uses(data.mode2_uses_today || 0)
        }
    }

    const handleFileSelect = async (file: File) => {
        if (file.size > 5 * 1024 * 1024) return error('File too large (Max 5MB)')
        setSelectedFile(file)

        setIsExtracting(true)
        try {
            const extracted = await fileService.extractTextFromFile(file);
            setResumeText(extracted);
        } catch (err) {
            error('Failed to extract text. You can paste it manually.');
        } finally {
            setIsExtracting(false)
        }
    }

    const startProcessing = async () => {
        // Enforce limits for free users before sending API request
        if (!isPro) {
            if (mode === 'MBA_POLISH' && mode1Uses >= 2) {
                setShowLimitModal(true)
                return
            }
            if (mode === 'JD_ALIGNMENT' && mode2Uses >= 2) {
                setShowLimitModal(true)
                return
            }
        }

        setStep('PROCESSING')
        setProcessingStep(0)
        setAnalysisError(null)

        // Processing animation loop
        const totalSteps = mode === 'MBA_POLISH' ? 5 : 6;
        const processInterval = setInterval(() => {
            setProcessingStep(prev => {
                if (prev >= totalSteps) {
                    clearInterval(processInterval);
                    return prev;
                }
                return prev + 1;
            })
        }, 1500)

        try {
            const analysisResponse = await fetch('/api/analyze-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText,
                    jobDescription: mode === 'JD_ALIGNMENT' ? jdText : undefined,
                    mode,
                    isPro,
                    userId: user?.id,
                    targetStandard: mode === 'MBA_POLISH' ? targetStandard : undefined
                }),
            })

            const result = await analysisResponse.json()
            if (!analysisResponse.ok) {
                if (result.error === 'LIMIT_REACHED') {
                    setStep('MODE')
                    setShowLimitModal(true)
                    clearInterval(processInterval)
                    return
                }
                throw new Error(result.error || 'API Error')
            }

            setAnalysisResult(result.analysis)
            // wait a little bit to finish animation if it was too fast
            setTimeout(() => {
                clearInterval(processInterval)
                setStep('RESULTS')
            }, 1000)

        } catch (err: any) {
            clearInterval(processInterval)
            setAnalysisError(err.message || 'Operation failed')
        }
    }

    const handleDownloadDocx = async () => {
        if (!isPro) {
            setShowUpgradeModal(true)
            return
        }

        try {
            loadingToast('Preparing your DOCX...')
            const res = await fetch('/api/resume/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: analysisResult.rewrittenResume })
            })

            if (!res.ok) throw new Error('Download failed')

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Optimized_Resume_${new Date().getFullYear()}.docx`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            success('Downloaded successfully!')
        } catch (err) {
            error('Failed to download DOCX')
        }
    }

    // Handlers mapped safely into functional components inline below
    const renderModeSelect = () => (
        <div className="max-w-4xl mx-auto py-10 px-4 text-center animate-in fade-in slide-in-from-bottom-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">Choose Your AI Wizard</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">Select the analysis engine you need today.</p>

            <div className="grid md:grid-cols-2 gap-8 text-left mb-10">
                {/* MBA Mode Card */}
                <Card
                    className={`cursor-pointer transition-all border-2 ${mode === 'MBA_POLISH' ? 'border-[#533AB7] shadow-lg shadow-[#533AB7]/20 bg-[#533AB7]/5' : 'border-gray-200 dark:border-gray-800 hover:border-[#533AB7]/50'}`}
                    onClick={() => setMode('MBA_POLISH')}
                >
                    <CardBody className="p-8 relative">
                        {mode === 'MBA_POLISH' && <div className="absolute top-4 right-4 text-[#533AB7]"><CheckCircle2 className="w-8 h-8 fill-current text-white" /></div>}
                        <div className="w-14 h-14 rounded-2xl bg-[#533AB7]/10 flex items-center justify-center mb-6">
                            <Wand2 className="w-8 h-8 text-[#533AB7]" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">MBA Format Polish</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Transform your resume into a top-tier consulting and executive standard format.</p>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Executive formatting</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Action verb upgrades</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Metric quantification</div>
                        </div>
                    </CardBody>
                </Card>

                {/* JD Alignment Card */}
                <Card
                    className={`cursor-pointer transition-all border-2 ${mode === 'JD_ALIGNMENT' ? 'border-[#533AB7] shadow-lg shadow-[#533AB7]/20 bg-[#533AB7]/5' : 'border-gray-200 dark:border-gray-800 hover:border-[#533AB7]/50'}`}
                    onClick={() => setMode('JD_ALIGNMENT')}
                >
                    <CardBody className="p-8 relative">
                        {mode === 'JD_ALIGNMENT' && <div className="absolute top-4 right-4 text-[#533AB7]"><CheckCircle2 className="w-8 h-8 fill-current text-white" /></div>}
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                            <Target className="w-8 h-8 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">JD Alignment Suite</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Tailor your existing resume specifically for a target job description to beat the ATS.</p>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> ATS Keyword Matching</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Custom Cover Letter (Pro)</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Interview Prep Q&A (Pro)</div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {mode === 'MBA_POLISH' && (
                <div className="max-w-md mx-auto mb-10 text-left">
                    <Select
                        label="Target Resume Standard"
                        value={targetStandard}
                        onChange={(e) => setTargetStandard(e.target.value)}
                        options={[
                            { value: 'Auto Detect', label: 'Auto Detect' },
                            { value: 'ISB / IIM A·B·C', label: 'ISB / IIM A·B·C' },
                            { value: 'Global MBA', label: 'Global MBA' },
                            { value: 'Lateral Hire ATS', label: 'Lateral Hire ATS' }
                        ]}
                    />
                </div>
            )}

            <Button size="lg" className="px-12 py-6 text-lg bg-[#533AB7] hover:bg-[#432A97]" onClick={() => setStep('UPLOAD')}>
                Continue <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
    )

    const renderUpload = () => (
        <div className="max-w-3xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4">
            <Button variant="ghost" onClick={() => setStep('MODE')} className="mb-6"><ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back</Button>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Upload Resume</h2>
            <p className="text-gray-500 mb-8">Upload your current resume (PDF, DOCX) or paste the text below. Max 5MB.</p>

            <div className={`group relative border-2 border-dashed rounded-3xl p-10 md:p-14 text-center transition-all cursor-pointer mb-6 ${isDragging ? 'border-[#533AB7] bg-[#533AB7]/10' : 'border-gray-200 dark:border-gray-800 hover:border-[#533AB7] hover:bg-gray-50/10'
                }`}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files[0]); }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => document.getElementById('wizard-file')?.click()}
            >
                <input id="wizard-file" type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={(e) => handleFileSelect(e.target.files?.[0]!)} />
                {isExtracting ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-[#533AB7] animate-spin mb-4" />
                        <p>Extracting text...</p>
                    </div>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-[#533AB7]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform">
                            <Upload className="w-10 h-10 text-[#533AB7]" />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white mb-2">
                            {selectedFile ? selectedFile.name : "Drag & Drop your Resume"}
                        </h3>
                        <p className="text-gray-500 text-sm">PDF, DOCX or TXT files supported</p>
                    </>
                )}
            </div>

            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Or Verify / Paste Text Directly</label>
                <textarea
                    className="w-full h-48 p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#533AB7]"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume text here..."
                />
                {resumeText.length > 0 && resumeText.length < 100 && (
                    <p className="text-red-500 text-sm mt-2">Minimum 100 characters required. Current: {resumeText.length}</p>
                )}
            </div>

            <Button
                size="lg"
                fullWidth
                className="bg-[#533AB7] hover:bg-[#432A97]"
                disabled={resumeText.length < 100 || isExtracting}
                onClick={() => {
                    if (mode === 'JD_ALIGNMENT') {
                        setStep('JD')
                        return
                    }
                    void startProcessing()
                }}
            >
                {mode === 'JD_ALIGNMENT' ? 'Next: Enter Job Description' : 'Analyze & Polish Resume'}
            </Button>
        </div>
    )

    const renderJDEntry = () => (
        <div className="max-w-3xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4">
            <Button variant="ghost" onClick={() => setStep('UPLOAD')} className="mb-6"><ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back</Button>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Target Job Description</h2>
            <p className="text-gray-500 mb-8">Paste the job description you want to align your resume with.</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Company Name (Optional)</label>
                    <input type="text" className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Role Title (Optional)</label>
                    <input type="text" className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} />
                </div>
            </div>

            <div className="mb-8">
                <label className="block text-sm font-medium mb-2">Full Job Description</label>
                <textarea
                    className="w-full h-64 p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-[#533AB7]"
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the full job description here..."
                />
                <div className="flex justify-between items-center mt-2">
                    <p className="text-gray-500 text-sm">More detail improves keyword matching accuracy.</p>
                    <p className={`text-sm ${jdText.length < 50 ? 'text-red-500' : jdText.length < 500 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {jdText.length} chars (Recommended: 500+)
                    </p>
                </div>
            </div>

            <Button
                size="lg"
                fullWidth
                className="bg-[#533AB7] hover:bg-[#432A97]"
                disabled={jdText.length < 50}
                onClick={startProcessing}
            >
                Analyze & Generate
            </Button>
        </div>
    )

    const renderProcessing = () => {
        const mbaSteps = [
            "Parsing resume structure",
            "Identifying hierarchy",
            "Upgrading verbs",
            "Quantifying achievements",
            "Applying MBA formatting",
            "Final polish"
        ];
        // Processing screen shows 7-step progress list
        const jdSteps = [
            "Parsing resume and JD",
            "Calculating Match Score",
            "Rewrite generation",
            "Extracting Keyword Analysis (Pro)",
            "Drafting Cover Letter (Pro)",
            "Preparing Interview Q&A (Pro)",
            "Finalizing package"
        ];
        const currentSteps = mode === 'MBA_POLISH' ? mbaSteps : jdSteps;

        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-in fade-in">
                {analysisError ? (
                    <div className="text-center max-w-md">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Analysis Failed</h3>
                        <p className="text-red-500 mb-6">{analysisError}</p>
                        <Button onClick={() => setStep(mode === 'JD_ALIGNMENT' ? 'JD' : 'UPLOAD')}>Try Again</Button>
                    </div>
                ) : (
                    <div className="w-full max-w-md">
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <div className="w-32 h-32 border-4 border-[#533AB7]/20 rounded-full animate-ping absolute inset-0"></div>
                                <div className="w-32 h-32 border-4 border-t-[#533AB7] rounded-full animate-spin flex items-center justify-center relative bg-white dark:bg-gray-900 shadow-xl">
                                    <Sparkles className="w-12 h-12 text-[#533AB7] animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-center mb-8">Generating Your Resume Package...</h2>
                        <div className="space-y-4">
                            {currentSteps.map((s, idx) => (
                                <div key={idx} className={`flex items-center gap-4 transition-opacity duration-500 ${idx <= processingStep ? 'opacity-100' : 'opacity-30'}`}>
                                    {idx < processingStep ? (
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                                    ) : idx === processingStep ? (
                                        <Loader2 className="w-6 h-6 text-[#533AB7] animate-spin flex-shrink-0" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-700 flex-shrink-0" />
                                    )}
                                    <span className={`text-lg ${idx === processingStep ? 'font-bold text-[#533AB7]' : ''}`}>{s}</span>
                                </div>
                            ))}
                        </div>
                        {!isPro && mode === 'JD_ALIGNMENT' && (
                            <p className="text-sm text-center text-gray-500 mt-8 italic">Free users: Only 2 API calls fire (Match Score & Rewrite). Unlock Pro for full suite.</p>
                        )}
                    </div>
                )}
            </div>
        )
    }

    const highlightQuantify = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(\[QUANTIFY:[^\]]+\])/g);
        return parts.map((part, i) => {
            if (part.startsWith('[QUANTIFY:')) {
                return <span key={i} className="bg-amber-200 dark:bg-amber-900/50 px-1 rounded text-amber-900 dark:text-amber-200 font-medium">{part}</span>
            }
            return <span key={i}>{part}</span>
        });
    }

    const renderResults = () => {
        if (!analysisResult) return null;

        if (mode === 'MBA_POLISH') {
            const verdict = analysisResult.qualityVerdict;
            const verdictColor = verdict?.rating === 'weak' ? 'red' : verdict?.rating === 'moderate' ? 'amber' : 'emerald';
            return (
                <div className="max-w-7xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-extrabold">MBA Format Polish Results</h2>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(analysisResult.rewrittenResume); success("Copied to clipboard!"); }}>
                                <Copy className="w-4 h-4 mr-2" /> Copy Text
                            </Button>
                            <Button className="bg-[#533AB7] hover:bg-[#432A97]" onClick={handleDownloadDocx}>
                                <Download className="w-4 h-4 mr-2" /> Download DOCX
                            </Button>
                        </div>
                    </div>

                    {/* Quality Verdict Banner */}
                    {verdict && (
                        <div className={`mb-8 p-6 rounded-2xl border-2 ${
                            verdict.rating === 'weak' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                            verdict.rating === 'moderate' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                            'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                        }`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    verdict.rating === 'weak' ? 'bg-red-100 text-red-600' :
                                    verdict.rating === 'moderate' ? 'bg-amber-100 text-amber-600' :
                                    'bg-emerald-100 text-emerald-600'
                                }`}>
                                    {verdict.rating === 'weak' ? <AlertCircle className="w-6 h-6" /> :
                                     verdict.rating === 'moderate' ? <Wand2 className="w-6 h-6" /> :
                                     <CheckCircle2 className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold capitalize">
                                        Original Resume Quality: <span className={
                                            verdict.rating === 'weak' ? 'text-red-600' :
                                            verdict.rating === 'moderate' ? 'text-amber-600' :
                                            'text-emerald-600'
                                        }>{verdict.rating}</span>
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {verdict.rating === 'weak' ? 'Your resume needed significant improvements. We rebuilt it with ATS-optimized formatting.' :
                                         verdict.rating === 'moderate' ? 'Your resume had some areas for improvement. We enhanced it for better ATS performance.' :
                                         'Your resume was already strong! We applied minor executive-level polish.'}
                                    </p>
                                </div>
                            </div>
                            {verdict.issues && verdict.issues.length > 0 && (
                                <div className="grid md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Issues Found</h4>
                                        <ul className="space-y-1">{verdict.issues.map((issue: string, i: number) => (
                                            <li key={i} className="text-sm flex items-start gap-2"><span className="text-red-500 mt-0.5">✕</span> {issue}</li>
                                        ))}</ul>
                                    </div>
                                    {verdict.improvementsMade && verdict.improvementsMade.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Improvements Applied</h4>
                                            <ul className="space-y-1">{verdict.improvementsMade.map((imp: string, i: number) => (
                                                <li key={i} className="text-sm flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> {imp}</li>
                                            ))}</ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="w-5 h-5 text-[#533AB7]" />
                                <h3 className="text-lg font-bold">AI-Improved Resume Preview</h3>
                            </div>
                            <Card className="h-[800px] overflow-y-auto bg-white dark:bg-gray-900 p-8 shadow-xl">
                                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-sans text-sm md:text-base">
                                    {highlightQuantify(analysisResult.rewrittenResume)}
                                </div>
                            </Card>
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="border-[#533AB7]">
                                <CardBody className="bg-gradient-to-br from-[#533AB7]/10 to-transparent p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold">ATS Score Card</h3>
                                        <div className="w-16 h-16 rounded-full bg-white dark:bg-[#0b0f1a] flex items-center justify-center shadow-lg">
                                            <span className="text-2xl font-black text-[#533AB7]">{analysisResult.ats_score}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Formatting /20</span><span className="font-bold">{analysisResult.match_score?.formatting || 18}</span></div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2"><div className="bg-[#533AB7] h-2 rounded-full" style={{ width: `${(18 / 20) * 100}%` }}></div></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Keywords /30</span><span className="font-bold">{analysisResult.match_score?.keywords || 25}</span></div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2"><div className="bg-[#533AB7] h-2 rounded-full" style={{ width: `${(25 / 30) * 100}%` }}></div></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Structure /25</span><span className="font-bold">{analysisResult.match_score?.structure || 22}</span></div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2"><div className="bg-[#533AB7] h-2 rounded-full" style={{ width: `${(22 / 25) * 100}%` }}></div></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Content /25</span><span className="font-bold">{analysisResult.match_score?.quantification || 20}</span></div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2"><div className="bg-[#533AB7] h-2 rounded-full" style={{ width: `${(20 / 25) * 100}%` }}></div></div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="p-6">
                                    <h4 className="font-bold text-emerald-600 mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Strengths</h4>
                                    <ul className="list-disc pl-5 mb-6 space-y-1 text-sm">{analysisResult.strengths?.map((s: any, i: number) => <li key={i}>{s}</li>)}</ul>
                                    <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Areas to Improve</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">{analysisResult.missing_skills?.map((s: any, i: number) => <li key={i}>{s}</li>)}</ul>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </div>
            )
        }

        // Mode 2 Results (Tabs)
        return (
            <div className="max-w-7xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-extrabold flex items-center gap-3"><Target className="text-blue-500" /> JD Alignment Suite</h2>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleDownloadDocx}>
                        <Download className="w-4 h-4 mr-2" /> Download DOCX
                    </Button>
                </div>

                {/* Tabs Header */}
                <div className="flex space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-gray-200 dark:border-gray-800">
                    <button onClick={() => setActiveTab('RESUME')} className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-xl transition-colors ${activeTab === 'RESUME' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <FileText className="w-4 h-4" /> Tweaked Resume
                    </button>
                    <button onClick={() => setActiveTab('MATCH')} className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-xl transition-colors ${activeTab === 'MATCH' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <BarChart3 className="w-4 h-4" /> Match Score
                    </button>
                    <button onClick={() => setActiveTab('KEYWORDS')} className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-xl transition-colors ${activeTab === 'KEYWORDS' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <Tag className="w-4 h-4" /> Keywords {!isPro && <Lock className="w-3 h-3 text-amber-500" />}
                    </button>
                    <button onClick={() => setActiveTab('COVERLETTER')} className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-xl transition-colors ${activeTab === 'COVERLETTER' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <AlignLeft className="w-4 h-4" /> Cover Letter {!isPro && <Lock className="w-3 h-3 text-amber-500" />}
                    </button>
                    <button onClick={() => setActiveTab('INTERVIEW')} className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-xl transition-colors ${activeTab === 'INTERVIEW' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <GraduationCap className="w-4 h-4" /> Interview Prep {!isPro && <Lock className="w-3 h-3 text-amber-500" />}
                    </button>
                </div>

                {/* Tabs Content */}
                <div className="bg-white dark:bg-gray-950 min-h-[600px] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8">
                    {activeTab === 'RESUME' && (
                        <div className="grid lg:grid-cols-3 gap-8 h-full">
                            <div className="lg:col-span-2">
                                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-sans text-sm md:text-base border border-gray-200 dark:border-gray-800 p-8 rounded-xl bg-gray-50 dark:bg-[#0b0f1a]">
                                    {analysisResult.rewrittenResume}
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <Card className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900">
                                    <CardBody className="p-6">
                                        <h4 className="font-bold mb-4">JD Alignment Report</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                                                <span className="text-gray-600 dark:text-gray-400 text-sm">Match Score</span>
                                                <span className="font-black text-blue-600">{analysisResult.match_score?.score || 0}%</span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed italic">
                                                Resume has been optimized to pass the ATS filter. Compare this version against the original.
                                            </p>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'MATCH' && (
                        <div className="grid lg:grid-cols-2 gap-10">
                            <div>
                                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-8 overflow-hidden relative">
                                    <h3 className="text-xl font-medium opacity-90 mb-6">Total Match Score</h3>
                                    <div className="text-7xl font-black mb-4">{analysisResult.match_score?.score || 0}<span className="text-3xl opacity-50">%</span></div>
                                    <p className="opacity-80">This resume has a {analysisResult.match_score?.score > 75 ? 'strong' : 'moderate'} chance of passing the ATS filter for this job description.</p>
                                </Card>
                            </div>
                            <div className="space-y-6 pt-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">JD Alignment /35</span><span className="font-bold">{analysisResult.match_score?.alignment || 0}</span></div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3"><div className="bg-blue-600 h-3 rounded-full" style={{ width: `${((analysisResult.match_score?.alignment || 0) / 35) * 100}%` }}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Quantification /30</span><span className="font-bold">{analysisResult.match_score?.quantification || 0}</span></div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3"><div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${((analysisResult.match_score?.quantification || 0) / 30) * 100}%` }}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Keywords /20</span><span className="font-bold">{analysisResult.match_score?.keywords || 0}</span></div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3"><div className="bg-purple-500 h-3 rounded-full" style={{ width: `${((analysisResult.match_score?.keywords || 0) / 20) * 100}%` }}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Structure /15</span><span className="font-bold">{analysisResult.match_score?.structure || 0}</span></div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3"><div className="bg-amber-500 h-3 rounded-full" style={{ width: `${((analysisResult.match_score?.structure || 0) / 15) * 100}%` }}></div></div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 mt-4">
                                <h4 className="font-bold mb-4 text-xl border-b pb-2">Gap Analysis Table</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900 text-sm">
                                                <th className="p-4 rounded-tl-xl font-semibold">Missing Category</th>
                                                <th className="p-4 rounded-tr-xl font-semibold">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            <tr className="border-b dark:border-gray-800">
                                                <td className="p-4 font-medium">Missing Skills</td>
                                                <td className="p-4">{analysisResult.gaps?.missing_skills?.join(', ') || 'None found'}</td>
                                            </tr>
                                            <tr className="border-b dark:border-gray-800">
                                                <td className="p-4 font-medium">Missing Frameworks</td>
                                                <td className="p-4">{analysisResult.gaps?.missing_frameworks?.join(', ') || 'None found'}</td>
                                            </tr>
                                            <tr className="border-b dark:border-gray-800">
                                                <td className="p-4 font-medium">Missing Lead/Metrics</td>
                                                <td className="p-4">{analysisResult.gaps?.missing_metrics?.join(', ') || 'None found'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isPro && ['KEYWORDS', 'COVERLETTER', 'INTERVIEW'].includes(activeTab) && (
                        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50">
                            <Lock className="w-16 h-16 text-amber-500 mb-6" />
                            <h3 className="text-2xl font-bold mb-3">Premium Feature Locked</h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                                To unlock {activeTab.toLowerCase()}, you need to upgrade to the Pro plan. Get unlimited parallel analyses and the complete Suite.
                            </p>
                            <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => router.push('/dashboard/profile')}>
                                Upgrade to Pro
                            </Button>
                        </div>
                    )}

                    {isPro && activeTab === 'KEYWORDS' && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="border-emerald-500/20 bg-emerald-50/10"><CardBody className="p-6">
                                <h4 className="font-bold text-emerald-600 mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Strengths</h4>
                                <ul className="list-disc pl-5 space-y-2">{analysisResult.strengths?.map((s: any, i: number) => <li key={i}>{s}</li>)}</ul>
                            </CardBody></Card>
                            <Card className="border-red-500/20 bg-red-50/10"><CardBody className="p-6">
                                <h4 className="font-bold text-red-500 mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Weaknesses</h4>
                                <ul className="list-disc pl-5 space-y-2">{analysisResult.weaknesses?.map((s: any, i: number) => <li key={i}>{s}</li>)}</ul>
                            </CardBody></Card>
                        </div>
                    )}

                    {isPro && activeTab === 'COVERLETTER' && (
                        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap border p-8 rounded-xl bg-gray-50 dark:bg-[#0b0f1a]">
                            {analysisResult.coverLetter}
                        </div>
                    )}

                    {isPro && activeTab === 'INTERVIEW' && (
                        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap border p-8 rounded-xl bg-gray-50 dark:bg-[#0b0f1a]">
                            {analysisResult.interviewPrep}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <div className="min-h-screen bg-gray-50/50 dark:bg-[#020817] pb-20">
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
                            <Button fullWidth size="lg" className="bg-[#533AB7] hover:bg-[#432A97] mb-3" onClick={() => router.push('/dashboard/profile')}>Unlock Unlimited (Pro)</Button>
                            <Button fullWidth variant="ghost" onClick={() => setShowLimitModal(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
