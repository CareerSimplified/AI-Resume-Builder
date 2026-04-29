'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, BarChart3, TrendingUp, Activity, Shield, ArrowRight } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button, Badge } from '@/components/ui'
import { useRequireAdmin } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { adminSidebarItems as sidebarItems } from '@/config/sidebar'
import Link from 'next/link'

export default function AdminDashboardPage() {
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
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      error('Failed to load analytics data')
    } finally {
      setStatsLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-600', textColor: 'text-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Total Resumes', value: stats.totalResumes, icon: FileText, color: 'bg-green-600', textColor: 'text-green-600', bgLight: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Total Reports', value: stats.totalReports, icon: BarChart3, color: 'bg-purple-600', textColor: 'text-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Job Descriptions', value: stats.totalJobDescriptions, icon: TrendingUp, color: 'bg-orange-600', textColor: 'text-orange-600', bgLight: 'bg-orange-50 dark:bg-orange-900/20' },
  ]

  const quickLinks = [
    { label: 'Manage Users', href: '/admin/users', icon: Users, desc: 'View and manage all platform users' },
    { label: 'View Resumes', href: '/admin/resumes', icon: FileText, desc: 'Browse uploaded resume files' },
    { label: 'Job Descriptions', href: '/admin/job-descriptions', icon: BarChart3, desc: 'Manage saved job descriptions' },
    { label: 'Pricing Plans', href: '/admin/plans', icon: Shield, desc: 'Configure subscription plans' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name || 'Admin'}</p>
        </div>

        {/* Stats Grid */}
        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardBody>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statCards.map((stat, index) => (
              <Card key={index}>
                <CardBody className="p-4 sm:p-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgLight} rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
                    <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.textColor}`} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className={`text-3xl sm:text-4xl font-bold ${stat.textColor}`}>{statsLoading ? '-' : stat.value}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <Card>
          <CardHeader title="Quick Access" />
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <link.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{link.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{link.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Insights */}
        {!statsLoading && (
          <Card>
            <CardHeader title="Platform Insights" />
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className={`p-4 sm:p-6 ${stats.totalUsers > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'} rounded-xl`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Average Resumes per User</h3>
                  <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                    {stats.totalUsers > 0 ? (stats.totalResumes / stats.totalUsers).toFixed(1) : '0'}
                  </p>
                </div>
                <div className={`p-4 sm:p-6 ${stats.totalResumes > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'} rounded-xl`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Analysis Rate</h3>
                  <p className="text-3xl sm:text-4xl font-bold text-green-600">
                    {stats.totalResumes > 0 ? Math.round((stats.totalReports / stats.totalResumes) * 100) : 0}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {stats.totalReports} of {stats.totalResumes} resumes analyzed
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
