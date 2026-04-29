'use client'

import { useState, useEffect } from 'react'
import { Home, FileText, Plus, BarChart3, Settings, Download, Eye, Trash2, Loader2, CheckCircle, Clock, AlertCircle, Upload } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge, ProgressBar, ConfirmDialog } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { resumeService } from '@/services/database.service'
import { Resume } from '@/types'
import Link from 'next/link'

import { userSidebarItems as sidebarItems } from '@/config/sidebar'

interface ResumeWithReport {
  id: string
  user_id: string
  jd_id: string
  file_url: string
  file_name: string
  extracted_text: string
  created_at: string
  report?: {
    id: string
    match_score: number
    ats_score: number
    created_at: string
  } | null
}

export default function MyResumesPage() {
  const { user, loading: authLoading, mounted } = useAuth()
  const { success, error } = useToast()
  const [resumes, setResumes] = useState<ResumeWithReport[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (mounted && !authLoading && user?.id) {
      fetchResumes()
    } else if (mounted && !authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading, mounted])

  const fetchResumes = async () => {
    try {
      setLoading(true)
      setApiError(null)
      console.log('Fetching resumes for user:', user?.id)

      // Try new API endpoint first
      const apiResponse = await fetch(`/api/resumes?userId=${user!.id}`)
      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        console.log('Resumes from API:', apiData)
        if (apiData.success && apiData.data) {
          setResumes(apiData.data)
          return
        }
      }

      // Fallback to direct service call
      console.log('API failed, using fallback service')
      const { data, error: fetchError } = await resumeService.getByUserId(user!.id)

      if (fetchError) {
        console.error('Resume fetch error:', fetchError)
        setApiError('Failed to load resumes')
        setResumes([])
        return
      }

      const resumeArray = Array.isArray(data) ? data : (data ? [data] : [])
      console.log('Setting resumes:', resumeArray)
      setResumes(resumeArray)
    } catch (err: any) {
      console.error('Error fetching resumes:', err)
      setApiError('Failed to load resumes')
      setResumes([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return

    try {
      setDeleting(deleteConfirmId)
      setDeleteConfirmId(null)
      const { error: deleteError } = await resumeService.delete(deleteConfirmId)
      if (deleteError) {
        error('Failed to delete resume')
        return
      }
      setResumes(resumes.filter((r) => r.id !== deleteConfirmId))
      success('Resume deleted successfully')
    } catch (err: any) {
      console.error('Error deleting resume:', err)
      error('Error deleting resume')
    } finally {
      setDeleting(null)
    }
  }

  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    success('Download started')
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">My Resumes</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and track all your uploaded resumes</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={fetchResumes} variant="secondary" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
            <Button asChild>
              <Link href="/dashboard/upload-resume">
                <Plus className="w-4 h-4 mr-2" />
                Upload New Resume
              </Link>
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse">
                <div />
              </Card>
            ))}
          </div>
        ) : apiError ? (
          /* Error State */
          <Card className="border-l-4 border-l-red-500">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Failed to Load Resumes</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{apiError}</p>
              <Button onClick={fetchResumes} variant="secondary">
                Try Again
              </Button>
            </CardBody>
          </Card>
        ) : resumes.length === 0 ? (
          /* Empty State */
          <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800">
            <CardBody className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Resumes Yet</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">Upload your first resume to get started with AI-powered analysis</p>
              <Button asChild size="lg">
                <Link href="/dashboard/upload-resume">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Resume
                </Link>
              </Button>
            </CardBody>
          </Card>
        ) : (
          /* Resumes Grid */
          <div className="grid gap-4 md:gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
                  {/* Resume Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{resume.file_name}</h3>
                        <p className="text-xs text-gray-500">Uploaded {new Date(resume.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Report Status */}
                    {resume.report ? (
                      <div className="flex items-center gap-4 mt-3 flex-nowrap flex-wrap">
                        <Badge variant="success" className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 whitespace-nowrap">
                          <CheckCircle className="w-3 h-3" />
                          Analysis Complete
                        </Badge>
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Match: </span>
                            <span className="font-semibold text-gray-900 dark:text-white">{resume.report.match_score}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">ATS: </span>
                            <span className="font-semibold text-gray-900 dark:text-white">{resume.report.ats_score}%</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="warning" className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700 w-fit mt-2">
                        <Clock className="w-3 h-3" />
                        Pending Analysis
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 w-full md:w-auto md:flex-col lg:flex-row">
                    {resume.report && (
                      <Button size="sm" variant="primary" href={`/dashboard/reports/${resume.id}`} leftIcon={<Eye className="w-4 h-4" />} className="flex-1 md:flex-none">
                        View Report
                      </Button>
                    )}
                    
                    {resume.file_url && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadFile(resume.file_url, resume.file_name)}
                        className="flex-1 md:flex-none"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="danger"
                      disabled={deleting === resume.id}
                      onClick={() => handleDeleteClick(resume.id)}
                      className="flex-1 md:flex-none"
                    >
                      {deleting === resume.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-1" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? This action cannot be undone."
        confirmText="Delete"
        loading={!!deleting}
      />
    </DashboardLayout>
  )
}