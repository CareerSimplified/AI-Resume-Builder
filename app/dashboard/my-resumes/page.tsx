'use client'

import { useState, useEffect } from 'react'
import { Home, FileText, Plus, BarChart3, Settings } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { resumeService } from '@/services/database.service'
import { Resume } from '@/types'
import Link from 'next/link'

import { userSidebarItems as sidebarItems } from '@/config/sidebar'


export default function MyResumesPage() {
  const { user, loading: authLoading } = useAuth()
  const { error: errorToast } = useToast()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !authLoading) {
      fetchResumes()
    }
  }, [user, authLoading])


  const fetchResumes = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await resumeService.getByUserId(user!.id)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Resume fetch response:', { data, fetchError })
      }
      
      if (fetchError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Resume fetch error:', fetchError)
        }
        setError('Failed to load resumes')
        setResumes([])
        return
      }
      
      const resumeArray = Array.isArray(data) ? data : (data ? [data] : [])
      if (process.env.NODE_ENV === 'development') {
        console.log('Setting resumes:', resumeArray)
      }
      setResumes(resumeArray)
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching resumes:', err)
      }
      setError('Failed to load resumes')
      setResumes([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      await resumeService.delete(id)
      setResumes(resumes.filter((r) => r.id !== id))
    } catch (error) {
      console.error('Error deleting resume:', error)
    }
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
        <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">My Resumes</h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">Manage all your uploaded resumes</p>
          </div>
          <div className="flex gap-3 flex-wrap md:flex-nowrap">
            <Button onClick={fetchResumes} variant="secondary">Refresh</Button>
            <Button asChild>
              <Link href="/dashboard/upload-resume">Upload New Resume</Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardBody>Loading...</CardBody>
          </Card>
        ) : error ? (
          <Card>
            <CardBody>
              <p className="text-center text-red-600 py-8">{error}</p>
              <div className="text-center"><Button onClick={fetchResumes}>Retry</Button></div>
            </CardBody>
          </Card>
        ) : resumes.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-dark-gray py-8">No resumes uploaded yet</p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4">
            {resumes.map((resume) => (
              <Card key={resume.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{resume.file_name}</h3>
                    <p className="text-sm text-dark-gray">
                      Uploaded {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`/dashboard/reports/${resume.id}`}>View Report</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(resume.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}