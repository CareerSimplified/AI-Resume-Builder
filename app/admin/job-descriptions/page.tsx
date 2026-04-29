'use client'

import { useEffect, useState } from 'react'
import { Briefcase, Calendar, Search, Trash2, User } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardBody } from '@/components/Card'
import { Badge, ConfirmDialog } from '@/components/ui'
import { Button } from '@/components/Button'
import { useRequireAdmin } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { adminSidebarItems as sidebarItems } from '@/config/sidebar'

export default function AdminJobDescriptionsPage() {
  const { loading } = useRequireAdmin()
  const { success, error } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    void fetchItems()
  }, [])

  const fetchItems = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/job-descriptions')
      const result = await res.json()
      if (result.success) setItems(result.data || [])
      else error(result.error || 'Failed to load job descriptions')
    } catch (err: any) {
      error(err.message || 'Failed to load job descriptions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteConfirm({ id, title })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/admin/job-descriptions?id=${deleteConfirm.id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setItems((prev) => prev.filter((x) => x.id !== deleteConfirm.id))
      success('Job description deleted successfully')
    } catch (err: any) {
      error(err.message || 'Error deleting job description')
    } finally {
      setIsDeleting(false)
      setDeleteConfirm(null)
    }
  }

  const filtered = items.filter((item) =>
    `${item.title || ''} ${item.company || ''} ${item.user_id || ''}`.toLowerCase().includes(query.toLowerCase())
  )

  if (loading) return null

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Job Description Management</h1>
          <Badge variant="primary">{filtered.length} Records</Badge>
        </div>

        <Card className="border-none shadow-lg">
          <CardBody>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, company, or user id..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#030712]"
              />
            </div>
          </CardBody>
        </Card>

        <Card padding="none" className="overflow-hidden border-none shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#030712]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">JD</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <tr><td className="px-4 py-6 text-sm text-gray-500" colSpan={4}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td className="px-4 py-6 text-sm text-gray-500" colSpan={4}>No job descriptions found.</td></tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-4 h-4 text-indigo-500" />
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.title || 'Untitled'}</p>
                            <p className="text-xs text-gray-500">{item.company || 'Unknown company'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2"><User className="w-4 h-4" />{String(item.user_id || '').slice(0, 12)}...</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(item.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button size="sm" variant="danger" onClick={() => handleDeleteClick(item.id, item.title || 'Untitled')}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Job Description"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={isDeleting}
      />
    </DashboardLayout>
  )
}

