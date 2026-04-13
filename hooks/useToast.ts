'use client'

import { useCallback } from 'react'
import toast from 'react-hot-toast'

export const useToast = () => {
  const success = useCallback((message: string) => {
    toast.success(message)
  }, [])

  const error = useCallback((message: string) => {
    toast.error(message)
  }, [])

  const loading = useCallback((message: string) => {
    return toast.loading(message)
  }, [])

  const dismiss = useCallback((id?: string) => {
    if (id) {
      toast.dismiss(id)
    } else {
      toast.dismiss()
    }
  }, [])

  return { success, error, loading, dismiss }
}
