'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, BarChart3, PieChart, TrendingUp, Clock, UserCheck, ShieldAlert } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Badge } from '@/components/ui'
import { useRequireAdmin } from '@/hooks/useAuth'
import { adminSidebarItems as sidebarItems } from '@/config/sidebar'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user, loading } = useRequireAdmin()
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalResumes: 0, 
    totalReports: 0,
    totalJobDescriptions: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setStatsLoading(true)
    try {
      const statsRes = await fetch('/api/admin/analytics')
      const statsData = await statsRes.json()
      setStats(statsData)

      const usersRes = await fetch('/api/admin/users')
      const usersData = await usersRes.json()
      if (usersData.success) {
        setRecentUsers((usersData.data || []).slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading || statsLoading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading Analytics...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              Platform Overview
              <Badge variant="danger">Administrator</Badge>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Global system health and user engagement metrics.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={<Users className="w-6 h-6" />}
            color="blue"
            href="/admin/users"
          />
          <StatCard 
            title="Resumes" 
            value={stats.totalResumes} 
            icon={<FileText className="w-6 h-6" />}
            color="purple"
            href="/admin/resumes"
          />
          <StatCard 
            title="AI Reports" 
            value={stats.totalReports} 
            icon={<BarChart3 className="w-6 h-6" />}
            color="green"
            href="/admin/reports"
          />
          <StatCard 
            title="Job Postings" 
            value={stats.totalJobDescriptions} 
            icon={<TrendingUp className="w-6 h-6" />}
            color="orange"
            href="/admin/analytics"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Users List */}
          <Card className="lg:col-span-2 border-none shadow-xl shadow-blue-500/5 bg-white dark:bg-[#0b0f1a]">
            <CardHeader 
              title="Recent Registrations" 
              subtitle="Latest users to join the platform"
              action={
                <Link href="/admin/users" className="text-blue-600 hover:underline text-sm font-semibold">
                  View All
                </Link>
              }
            />
            <CardBody>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentUsers.map((u, i) => (
                  <div key={u.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                        {(u.name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{u.name || 'Anonymous User'}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{new Date(u.created_at).toLocaleDateString()}</p>
                       <Badge variant="success" size="sm">Active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Quick Info & Actions */}
          <div className="space-y-6">
             <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl shadow-blue-600/20">
                <CardBody className="p-8">
                   <div className="flex items-start justify-between mb-6">
                      <ShieldAlert className="w-10 h-10 opacity-50" />
                      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md text-xs font-bold uppercase">System Secure</div>
                   </div>
                   <h3 className="text-2xl font-bold mb-2">Admin Security</h3>
                   <p className="text-blue-50 text-sm mb-6 leading-relaxed">
                      You are logged in with full administrative privileges. Be cautious when deleting system data.
                   </p>
                   <Link href="/admin/settings">
                     <button className="w-full bg-white text-blue-700 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-50 transition-colors">
                        Security Settings
                     </button>
                   </Link>
                </CardBody>
             </Card>

             <Card className="border-none bg-white dark:bg-[#0b0f1a] shadow-lg">
                <CardBody>
                   <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-4">Platform Health</h4>
                   <div className="space-y-4">
                      <HealthBar label="Supabase DB" status="online" progress={100} />
                      <HealthBar label="Gemini AI API" status="online" progress={98} />
                      <HealthBar label="Storage Service" status="online" progress={100} />
                   </div>
                </CardBody>
             </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ title, value, icon, color, href }: any) {
  const colorMap: any = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-blue-500/5',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-purple-500/5',
    green: 'text-green-600 bg-green-50 dark:bg-green-900/20 shadow-green-500/5',
    orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 shadow-orange-500/5',
  }

  return (
    <Link href={href}>
      <Card className="group hover:shadow-2xl transition-all duration-300 border-none bg-white dark:bg-[#0b0f1a] overflow-hidden">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
               <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 capitalize">{title}</p>
               <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white group-hover:scale-110 transition-transform origin-left">{value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${colorMap[color]} group-hover:rotate-12 transition-transform`}>
              {icon}
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}

function HealthBar({ label, status, progress }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
         <span className="font-bold text-gray-700 dark:text-gray-300 capitalize">{label}</span>
         <span className="text-green-500 font-bold uppercase">{status}</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
         <div className="h-full bg-green-500" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )
}