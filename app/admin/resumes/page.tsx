'use client'

import { useState, useEffect } from 'react'
import { FileText, Search, Trash2, Calendar, User, Download, ExternalLink } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge, ConfirmDialog } from '@/components/ui'
import { useRequireAdmin } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { adminSidebarItems as sidebarItems } from '@/config/sidebar'

export default function AdminResumesPage() {
  const { user, loading } = useRequireAdmin()
  const { success, error } = useToast()
  const [resumes, setResumes] = useState<any[]>([])
  const [resumesLoading, setResumesLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ resumeId: string; fileName: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    setResumesLoading(true)
    try {
      const res = await fetch('/api/admin/resumes')
      const result = await res.json()
      if (result.success) setResumes(result.data || [])
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setResumesLoading(false)
    }
  }

  const handleDeleteResumeClick = (resumeId: string, fileName: string) => {
    setDeleteConfirm({ resumeId, fileName })
  }

  const handleDeleteResumeConfirm = async () => {
    if (!deleteConfirm) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/admin/resumes?id=${deleteConfirm.resumeId}`, { method: 'DELETE' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setResumes(resumes.filter((r) => r.id !== deleteConfirm.resumeId))
      success('Resume deleted successfully')
    } catch (err: any) {
      console.error('Error deleting resume:', err)
      error(err.message || 'Error deleting resume')
    } finally {
      setIsDeleting(false)
      setDeleteConfirm(null)
    }
  }

  const filteredResumes = resumes.filter(r => 
    r.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return null

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
       <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Resume Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Manage and monitor all uploaded files across the system.</p>
          </div>
          <Badge variant="primary" className="flex-shrink-0">{filteredResumes.length} Files Total</Badge>
        </div>

        <Card className="border-none shadow-lg bg-white dark:bg-[#0b0f1a]">
          <CardBody>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by file name or User ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#030712] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardBody>
        </Card>

        {resumesLoading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading platform resumes...</p>
          </div>
        ) : filteredResumes.length === 0 ? (
          <Card className="border-none bg-white dark:bg-[#0b0f1a] py-20 text-center">
             <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Resumes Found</h3>
             <p className="text-gray-500 max-w-xs mx-auto mt-2">Zero resumes discovered in the database matching your query.</p>
          </Card>
        ) : (
          <Card padding="none" className="border-none shadow-xl bg-white dark:bg-[#0b0f1a] overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead className="bg-gray-50 dark:bg-[#030712] border-b border-gray-100 dark:border-gray-800">
                   <tr>
                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Document</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Owner</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                     <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                   {filteredResumes.map((r) => (
                     <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                             <FileText className="w-5 h-5" />
                           </div>
                           <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{r.file_name}</span>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                           <User className="w-4 h-4" />
                           <span className="font-mono text-xs">{r.user_id.slice(0, 12)}...</span>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-sm text-gray-500">
                           <Calendar className="w-4 h-4" />
                           {new Date(r.created_at).toLocaleDateString()}
                         </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" title="View PDF">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                           </a>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteResumeClick(r.id, r.file_name)}
                              title="Delete"
                            >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </Card>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteResumeConfirm}
        title="Delete Resume"
        message={`Are you sure you want to delete "${deleteConfirm?.fileName}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={isDeleting}
      />
    </DashboardLayout>
  )
}