'use client'

import { logger } from '@/lib/logger'

export const fileService = {
  // Extract text from file using API
  async extractTextFromFile(file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to extract text')
      }

      return result.text
    } catch (error) {
      logger.error('FileService', error)
      throw error
    }
  },

  // Validate file type
  isValidResumeFile(file: File): boolean {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    return validTypes.includes(file.type)
  },

  // Validate file size (max 10MB)
  isValidFileSize(file: File): boolean {
    const maxSize = 10 * 1024 * 1024 // 10MB
    return file.size <= maxSize
  },

  // Legacy methods kept for compatibility
  async extractTextFromPDF(file: File): Promise<string> {
    return this.extractTextFromFile(file)
  },

  async extractTextFromDOCX(file: File): Promise<string> {
    return this.extractTextFromFile(file)
  },
}
