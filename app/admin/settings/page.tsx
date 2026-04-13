'use client'

import { useState } from 'react'
import { Settings, Shield, Bell, Database, Mail, Save, Globe, Lock } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { useRequireAdmin } from '@/hooks/useAuth'
import { adminSidebarItems as sidebarItems } from '@/config/sidebar'
import { useToast } from '@/hooks/useToast'

export default function AdminSettingsPage() {
  const { user, loading } = useRequireAdmin()
  const { success } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      success('Settings updated successfully')
    }, 1000)
  }

  if (loading) return null

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
       <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Platform Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Configure core system behaviors and administrative policies.</p>
          </div>
          <Button onClick={handleSave} loading={saving}>
             <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Navigation Chips */}
           <div className="lg:col-span-1 space-y-2">
              <SettingsTab icon={<Globe className="w-5 h-5" />} label="General" active />
              <SettingsTab icon={<Shield className="w-5 h-5" />} label="Security & Roles" />
              <SettingsTab icon={<Database className="w-5 h-5" />} label="System & Data" />
              <SettingsTab icon={<Mail className="w-5 h-5" />} label="Email Templates" />
              <SettingsTab icon={<Bell className="w-5 h-5" />} label="Notifications" />
           </div>

           {/* Content */}
           <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-xl bg-white dark:bg-[#0b0f1a]">
                 <CardHeader title="General Configuration" subtitle="Universal platform settings" />
                 <CardBody className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Platform Name</label>
                       <input 
                         type="text" 
                         defaultValue="AI Resume Builder" 
                         className="w-full p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#030712] text-gray-900 dark:text-white"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Support Email</label>
                       <input 
                         type="email" 
                         defaultValue="support@airesumebuilder.com" 
                         className="w-full p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#030712] text-gray-900 dark:text-white"
                       />
                    </div>
                 </CardBody>
              </Card>

              <Card className="border-none shadow-xl bg-white dark:bg-[#0b0f1a]">
                 <CardHeader title="AI Analysis Engine" subtitle="Configure Gemini API behavior" />
                 <CardBody className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-600 rounded-lg text-white">
                             <Lock className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="font-bold text-blue-900 dark:text-blue-100 italic">Gemini 1.5 Pro Enabled</p>
                             <p className="text-xs text-blue-700 dark:text-blue-300">High precision mode for resume parsing</p>
                          </div>
                       </div>
                       <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full shadow" />
                       </div>
                    </div>
                 </CardBody>
              </Card>

              <Card className="border-none border-red-500/20 bg-red-50/10 dark:bg-red-900/5">
                 <CardBody>
                    <h4 className="text-red-600 font-bold mb-2">Danger Zone</h4>
                    <p className="text-sm text-gray-500 mb-4">Actions here are permanent and cannot be undone.</p>
                    <Button variant="danger" size="sm">Flush System Cache</Button>
                 </CardBody>
              </Card>
           </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function SettingsTab({ icon, label, active = false }: any) {
   return (
      <div className={`flex items-center gap-3 p-4 rounded-xl cursor-not-allowed transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
         {icon}
         <span className="font-semibold">{label}</span>
      </div>
   )
}
