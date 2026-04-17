'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Home, FileText, BarChart3, Settings } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input, TextArea, Select } from '@/components/Form'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { jobDescriptionService } from '@/services/database.service'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'


import { userSidebarItems as sidebarItems } from '@/config/sidebar'


export default function CreateJDPage() {
  const { user, loading: authLoading } = useAuth()

  const router = useRouter()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    skills: '',
    experience: 'mid',
    description: '',
  })

  const experienceOptions = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' },
    { value: 'executive', label: 'Executive' },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user?.id) {
        error('User session not found. Please log in again.')
        return
      }

      const { error: submitError } = await jobDescriptionService.create(user.id, {
        title: formData.title,
        company: formData.company,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        experience: formData.experience,
        description: formData.description,
      })



      if (submitError) {
        error('Failed to create job description')
        return
      }

      success('Job description created successfully!')
      router.push('/dashboard/upload-resume')
    } catch (err: any) {
      error(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>

      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Job Description</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Enter the job details to analyze your resume against</p>
        </div>


        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Job Title"
                  type="text"
                  name="title"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Company Name"
                  type="text"
                  name="company"
                  placeholder="e.g., Tech Company Inc"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Required Skills (comma-separated)"
                type="text"
                name="skills"
                placeholder="e.g., React, Node.js, TypeScript, AWS"
                value={formData.skills}
                onChange={handleChange}
                required
              />

              <Select
                label="Experience Level"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                options={experienceOptions}
              />

              <TextArea
                label="Job Description"
                name="description"
                placeholder="Paste the full job description here..."
                rows={8}
                value={formData.description}
                onChange={handleChange}
                required
              />

              <div className="flex gap-4">
                <Button fullWidth loading={loading} type="submit">
                  Create Job Description
                </Button>
                <Button variant="secondary" fullWidth asChild>
                  <Link href="/dashboard">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
}