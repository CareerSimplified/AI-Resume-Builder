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
    if (user) {
      fetchResumes()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])


  const fetchResumes = async () => {
    try {
      setError(null)
      const { data, error: fetchError } = await resumeService.getByUserId(user!.id)
      if (fetchError) {
        console.error('Resume fetch error:', fetchError)
        setError('Failed to load resumes')
        return
      }
      setResumes(data || [])
    } catch (err: any) {
      console.error('Error fetching resumes:', err)
      setError('Failed to load resumes')
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
            <p className="text-dark-gray mt-2">Manage all your uploaded resumes</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/upload-resume">Upload New Resume</Link>
          </Button>
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