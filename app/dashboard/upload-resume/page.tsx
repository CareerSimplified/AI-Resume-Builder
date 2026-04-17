'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, FileText, Plus, BarChart3, Settings, Upload, File, Sparkles, Wand2, Loader2, Search, AlertCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Select } from '@/components/Form'
import { Badge } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

import { useToast } from '@/hooks/useToast'
import { jobDescriptionService, resumeService, reportService } from '@/services/database.service'
import { fileService } from '@/services/file.service'
import { supabase } from '@/lib/supabase'

import { userSidebarItems as sidebarItems } from '@/config/sidebar'

export default function UploadResumePage() {
  const { user, loading: authLoading, mounted } = useAuth()
  const router = useRouter()
  const { success, error, loading: loadingToast } = useToast()
  const [analyzing, setAnalyzing] = useState(false)
  const [jdId, setJdId] = useState('')
  const [jobDescriptions, setJobDescriptions] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [loadingJDs, setLoadingJDs] = useState(true)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  useEffect(() => {
    if (mounted && !authLoading && user?.id) {
      fetchJobDescriptions()
    } else if (mounted && !authLoading && !user) {
      setLoadingJDs(false)
    }
  }, [user, authLoading, mounted])

  const fetchJobDescriptions = async () => {
    try {
      setLoadingJDs(true)
      const { data, error: fetchError } = await jobDescriptionService.getByUserId(user!.id)
      if (fetchError) {
        console.error('Error fetching JDs:', fetchError)
        error('Failed to load job descriptions')
        return
      }
      const jds = data || []
      console.log('Fetched job descriptions:', jds)
      setJobDescriptions(jds)
      if (jds.length === 1) setJdId(jds[0].id)
    } catch (err: any) {
      console.error('Exception fetching JDs:', err)
      error('Failed to load job descriptions')
    } finally {
      setLoadingJDs(false)
    }
  }

  const handleFileSelect = (file: File) => {
    if (!fileService.isValidResumeFile(file)) return error('Invalid file type (PDF/DOCX/TXT)')
    if (!fileService.isValidFileSize(file)) return error('File too large (Max 10MB)')
    setSelectedFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedFile || !jdId) return

    setAnalyzing(true)
    setAnalysisStep(1) // Step 1: Extracting text

    try {
      // Verify session is valid before proceeding
      console.log('Verifying auth session...')
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData?.session) {
        throw new Error('Authentication session expired. Please refresh and try again.')
      }
      console.log('✓ Auth session verified, user:', sessionData.session.user.id)

      // Step 1: Extract Text (Internal API)
      setAnalysisStep(1)
      let extractedText = ''
      try {
        console.log('Step 1: Attempting text extraction...')
        extractedText = await fileService.extractTextFromFile(selectedFile)
        console.log('✓ Text extracted successfully, length:', extractedText.length)
      } catch (extractErr: any) {
        console.warn('Step 1: Client extraction failed, will attempt server-side fallback:', extractErr.message)
      }

      // Step 2: Upload File & Save to DB
      setAnalysisStep(2)
      console.log('Step 2: Uploading file and saving records...')
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('jdId', jdId)
      formData.append('userId', user.id)
      if (extractedText) {
        formData.append('extractedText', extractedText)
      }

      const uploadResponse = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResponse.ok) {
        console.error('Upload API error:', uploadResult)
        throw new Error(`Upload failed: ${uploadResult.error || 'Unknown error'}`)
      }

      console.log('✓ Resume uploaded and saved, ID:', uploadResult.resume.id)
      const resumeId = uploadResult.resume.id

      setAnalysisStep(3) // Step 3: AI Magic
      const jd = jobDescriptions.find(j => j.id === jdId)
      
      if (!jd) {
        throw new Error('Job description not found')
      }

      console.log('Step 3: Starting AI analysis...')
      const analysisResponse = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: extractedText,
          jobDescription: jd.description,
          resumeId: resumeId,
          userId: user.id,
          jdId: jdId,
        }),
      })

      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text()
        console.error('Analysis API error:', errorText)
        throw new Error(`AI Analysis failed: ${analysisResponse.status}`)
      }

      const analysisResult = await analysisResponse.json()
      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'AI analysis step failed')
      }
      console.log('✓ Analysis complete:', analysisResult)
      
      success('Analysis complete! Redirecting to report...')
      router.push(`/dashboard/reports/${resumeId}`)
    } catch (err: any) {
      console.error('Full error:', err)
      const errorMsg = err.message || 'Operation failed'
      setAnalysisError(errorMsg)
      error(errorMsg)
      setAnalyzing(false)
    }
  }

  if (authLoading) return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>

  if (analyzing) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
          {analysisError ? (
            <div className="max-w-md">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analysis Failed</h2>
              <p className="text-red-600 dark:text-red-400 mb-4 text-sm break-words">{analysisError}</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setAnalyzing(false)
                    setAnalysisError(null)
                    setSelectedFile(null)
                  }}
                >
                  Try Again
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mb-8">
                <div className="w-24 h-24 border-4 border-blue-500/20 rounded-full animate-ping absolute inset-0"></div>
                <div className="w-24 h-24 border-4 border-t-blue-600 rounded-full animate-spin flex items-center justify-center relative bg-white dark:bg-gray-900 shadow-xl">
                  <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {analysisStep === 1 && "Reading Passport to success..."}
                {analysisStep === 2 && "Securing document records..."}
                {analysisStep === 3 && "Consulting AI Career Expert..."}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
                Please wait while our Gemini-powered engine analyzes your skills against the job requirements.
              </p>
              
              <div className="w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-2 overflow-hidden">
                 <div className="h-full bg-blue-600 transition-all duration-[3000ms] ease-out" style={{width: `${(analysisStep / 3) * 100}%`}}></div>
              </div>
              <div className="flex justify-between w-full max-w-md text-xs font-bold uppercase tracking-widest text-gray-400">
                 <span className={analysisStep >= 1 ? "text-blue-500" : ""}>Extract</span>
                 <span className={analysisStep >= 2 ? "text-blue-500" : ""}>Secure</span>
                 <span className={analysisStep >= 3 ? "text-blue-500" : ""}>Analyze</span>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-10 text-center flex-col">
          <Badge variant="primary" className="mb-4">Step 2: Analysis</Badge>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Level Up Your Resume</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Upload your professional background and let our AI compare it with your target job description to find the perfect match.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          <div className="lg:col-span-3">
             <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-none shadow-2xl shadow-blue-500/5 bg-white dark:bg-[#0b0f1a]">
                   <CardBody className="p-8">
                      {loadingJDs ? (
                        <div className="text-center py-8">
                          <div className="flex items-center justify-center mb-4">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">Loading job descriptions...</p>
                        </div>
                      ) : jobDescriptions.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-600 dark:text-gray-400 mb-4">No job descriptions found. Create one first!</p>
                          <Button 
                            onClick={() => router.push('/dashboard/create-jd')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Create Job Description
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="mb-6">
                            <Select
                              label="Target Role"
                              value={jdId}
                              onChange={(e) => setJdId(e.target.value)}
                              options={jobDescriptions.map(jd => ({ value: jd.id, label: `${jd.title} at ${jd.company}` }))}
                              required
                            />
                          </div>

                    <div className={`group relative border-2 border-dashed rounded-2xl md:rounded-3xl p-8 md:p-16 text-center transition-all ${
                          isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:bg-gray-50/10'
                        }`}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files[0]); }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onClick={() => document.getElementById('file-input')?.click()}
                      >
                        <input id="file-input" type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={(e) => handleFileSelect(e.target.files?.[0]!)} />
                        
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform">
                          <Upload className="w-10 h-10 text-blue-600" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                           {selectedFile ? "Ready to analyze!" : "Drag & Drop your Resume"}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">PDF, DOCX or TXT files supported (Max 10MB)</p>
                        
                        {selectedFile && (
                          <div className="flex items-center gap-3 p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20 animate-in fade-in slide-in-from-bottom-2">
                            <File className="w-6 h-6" />
                            <span className="font-semibold text-sm truncate">{selectedFile.name}</span>
                          </div>
                        )}
                      </div>

                      <Button fullWidth size="lg" disabled={!selectedFile || !jdId} type="submit" className="mt-6 md:mt-8 h-12 md:h-14 text-base md:text-lg font-bold shadow-xl shadow-blue-500/20">
                         Generate AI Insights <Wand2 className="ml-2 w-5 h-5" />
                      </Button>
                        </>
                      )}
                   </CardBody>
                </Card>
             </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
             <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none">
                <CardBody className="p-8">
                   <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="w-6 h-6" /> Pro Tips
                   </h3>
                   <ul className="space-y-4 text-sm opacity-90">
                      <li className="flex gap-3"><span className="font-bold">01</span> Ensure your resume is in a readable format for the best AI accuracy.</li>
                      <li className="flex gap-3"><span className="font-bold">02</span> Double check that you've selected the correct Job Description for comparison.</li>
                      <li className="flex gap-3"><span className="font-bold">03</span> Our AI will find matching keywords to get you past ATS filters.</li>
                   </ul>
                </CardBody>
             </Card>
             
             <div className="p-8 border border-gray-100 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-950">
                <Search className="text-blue-600 mb-2" />
                <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-4">How it works</h4>
                <p className="text-sm text-gray-500">We extract text from your resume, cross-reference it with the Job Description skills, and use Google Gemini to generate actionable improvements.</p>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}