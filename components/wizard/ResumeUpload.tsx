import React from 'react'
import { Upload, CheckCircle2, ChevronLeft } from 'lucide-react'
import { Card, CardBody } from '@/components/Card'
import { Button } from '@/components/ui'
import { clsx } from 'clsx'

interface ResumeUploadProps {
  inputMethod: 'upload' | 'paste'
  setInputMethod: (method: 'upload' | 'paste') => void
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  pastedText: string
  setPastedText: (text: string) => void
  resumeWordCount: number
  onBack: () => void
  onNext: () => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ResumeUpload({
  inputMethod,
  setInputMethod,
  selectedFile,
  setSelectedFile,
  pastedText,
  setPastedText,
  resumeWordCount,
  onBack,
  onNext,
  handleFileChange
}: ResumeUploadProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-4xl font-black mb-4">Add your resume</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400">Upload a file or paste your resume text below.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="bg-white dark:bg-slate-900 shadow-xl border-none">
          <CardBody className="p-8 md:p-12">
             {inputMethod === 'upload' ? (
              <div className="group relative border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all cursor-pointer"
                   onClick={() => document.getElementById('file-input')?.click()}>
                <input id="file-input" type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {selectedFile ? <CheckCircle2 className="w-10 h-10 text-indigo-600" /> : <Upload className="w-10 h-10 text-indigo-600" />}
                </div>
                <h3 className="text-xl font-black mb-2">{selectedFile ? selectedFile.name : "Drop your file here"}</h3>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">PDF or DOCX · max 5 MB</p>
              </div>
            ) : (
              <div className="relative">
                <textarea 
                  className="w-full h-80 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-8 focus:ring-0 text-slate-700 dark:text-slate-200 font-medium placeholder:italic"
                  placeholder="Paste your resume text here — any format works. We'll extract the structure automatically…"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                ></textarea>
                <div className="absolute bottom-6 right-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {resumeWordCount} / ~2000 recommended
                </div>
              </div>
            )}

            <button 
              onClick={() => setInputMethod(inputMethod === 'upload' ? 'paste' : 'upload')}
              className="mt-6 text-indigo-600 font-black text-sm hover:underline"
            >
              {inputMethod === 'upload' ? "or paste text" : "or upload file"}
            </button>

            <div className="flex justify-between mt-12 gap-4">
              <Button variant="secondary" onClick={onBack} className="rounded-2xl h-14 px-8 font-black">← Back</Button>
              <Button 
                onClick={onNext} 
                disabled={inputMethod === 'upload' ? !selectedFile : !pastedText}
                className="flex-1 h-14 bg-indigo-600 text-white rounded-2xl font-black text-lg"
              >
                Continue →
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
