'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, BarChart3, Settings, TrendingUp } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { useRequireAdmin } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { adminSidebarItems as sidebarItems } from '@/config/sidebar'

export default function AdminAnalyticsPage() {
  const { user, loading } = useRequireAdmin()
  const { error } = useToast()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResumes: 0,
    totalReports: 0,
    totalJobDescriptions: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      error('Failed to load analytics data')
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="w-8 h-8" />,
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Resumes',
      value: stats.totalResumes,
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-green-600',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'bg-purple-600',
      textColor: 'text-purple-600',
    },
    {
      title: 'Job Descriptions',
      value: stats.totalJobDescriptions,
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'bg-orange-600',
      textColor: 'text-orange-600',
    },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-2">View platform-wide statistics and insights</p>
        </div>

        {statsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardBody>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded w-1/3 mb-2"></div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <Card key={index}>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg text-white`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-4xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Additional Analytics */}
        <Card>
          <CardHeader title="Platform Insights" />
          <CardBody>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Average Resumes per User</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalUsers > 0
                    ? (stats.totalResumes / stats.totalUsers).toFixed(1)
                    : '0'}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Analysis Rate</h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.totalResumes > 0
                    ? Math.round((stats.totalReports / stats.totalResumes) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.totalReports} of {stats.totalResumes} resumes analyzed
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
}
