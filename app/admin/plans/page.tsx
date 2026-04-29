'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { adminSidebarItems } from '@/config/sidebar'
import { Card, CardBody } from '@/components/Card'
import { Button, Badge, ConfirmDialog } from '@/components/ui'
import { planService } from '@/services/database.service'
import { Plan } from '@/types'
import { useToast } from '@/hooks/useToast'

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Plan>>({})
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    fetchPlans()
  }, [])

  async function fetchPlans() {
    const { data, error: err } = await planService.getAll()
    if (!err && data) setPlans(data)
    setLoading(false)
  }

  async function handleSave() {
    if (!editingId) return
    const { error: err } = await planService.update(editingId, editForm)
    if (err) {
      error(err.message)
    } else {
      success('Plan updated successfully')
      setEditingId(null)
      fetchPlans()
    }
  }

  async function handleDeleteClick(id: string) {
    setDeleteConfirmId(id)
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirmId) return
    try {
      setIsDeleting(true)
      setDeleteConfirmId(null)
      const { error: err } = await planService.delete(deleteConfirmId)
      if (err) error(err.message)
      else {
        success('Plan deleted')
        fetchPlans()
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete plan')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleCreate() {
    const newPlan: any = {
      name: 'New Plan',
      price_inr: 0,
      description: 'Describe the plan...',
      features: ['Feature 1'],
      is_popular: false,
      credit_limit: 5
    }
    const { error: err } = await planService.create(newPlan)
    if (err) error(err.message)
    else {
      success('New plan created')
      fetchPlans()
    }
  }

  return (
    <DashboardLayout sidebarItems={adminSidebarItems}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
           <h1 className="text-3xl font-black italic tracking-tight">Manage <span className="text-indigo-600">Pricing</span></h1>
           <Button onClick={handleCreate} className="rounded-xl h-12 px-6 font-black w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Add Plan</Button>
        </div>

        <div className="grid gap-6">
           {plans.map(plan => (
             <Card key={plan.id} className="border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                 <CardBody className="p-4 sm:p-8">
                    {editingId === plan.id ? (
                      <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Plan Name</label>
                              <input 
                                className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold border-none focus:ring-2 focus:ring-indigo-600" 
                                value={editForm.name} 
                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                              />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Price (INR)</label>
                              <input 
                                type="number"
                                className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold border-none focus:ring-2 focus:ring-indigo-600" 
                                value={editForm.price_inr} 
                                onChange={e => setEditForm({...editForm, price_inr: parseInt(e.target.value)})}
                              />
                           </div>
                        </div>

                        <div>
                           <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 text-sm italic">Description</label>
                           <textarea 
                             className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold border-none focus:ring-2 focus:ring-indigo-600 h-24" 
                             value={editForm.description} 
                             onChange={e => setEditForm({...editForm, description: e.target.value})}
                           />
                        </div>

                        <div className="flex items-center gap-4">
                           <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={editForm.is_popular} 
                                onChange={e => setEditForm({...editForm, is_popular: e.target.checked})}
                                className="w-5 h-5 rounded border-none bg-slate-100 text-indigo-600 focus:ring-0"
                              />
                              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Highlight as Popular</span>
                           </label>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-3 justify-end pt-4 border-t dark:border-slate-800">
                           <Button variant="secondary" onClick={() => setEditingId(null)} className="rounded-xl h-12 px-6 font-black"><X className="w-4 h-4 mr-2" /> Cancel</Button>
                           <Button onClick={handleSave} className="bg-indigo-600 text-white rounded-xl h-12 px-6 font-black"><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
                        </div>
                     </div>
                   ) : (
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                           <div className="flex items-center gap-4 mb-2">
                              <h3 className="text-xl font-black uppercase tracking-tight">{plan.name}</h3>
                              <Badge variant="primary">₹{plan.price_inr}</Badge>
                              {plan.is_popular && <Badge variant="secondary">Popular</Badge>}
                           </div>
                           <p className="text-slate-400 text-sm font-medium">{plan.description}</p>
                           <div className="mt-4 flex flex-wrap gap-2">
                              {plan.features.map((f, i) => (
                                <span key={i} className="text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500">{f}</span>
                              ))}
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => { setEditingId(plan.id); setEditForm(plan); }}
                             className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
                           >
                             <Edit className="w-5 h-5" />
                           </button>
                            <button 
                              onClick={() => handleDeleteClick(plan.id)}
                              className="p-3 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-red-500 transition-colors"
                            >
                             <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                   )}
                </CardBody>
             </Card>
           ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Plan"
        message="Are you sure you want to delete this plan? This action cannot be undone."
        confirmText="Delete"
        loading={isDeleting}
      />
    </DashboardLayout>
  )
}
