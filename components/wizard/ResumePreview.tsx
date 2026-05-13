import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Download, Copy, FileText, CheckCircle2, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResumePreviewProps {
  data: any;
  rawText: string;
}

export interface ResumePreviewHandle {
  downloadPdf: () => Promise<void>;
}

export const ResumePreview = forwardRef<ResumePreviewHandle, ResumePreviewProps>(({ data, rawText }, ref) => {
  const { success, error } = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    success('Resume copied to clipboard!');
  };

const downloadPdf = async () => {
    if (!resumeRef.current) {
      error("Resume preview element not found");
      return;
    }
    
    try {
      const element = resumeRef.current;
      
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.backgroundColor = '#ffffff';
      
      const allEls = clone.querySelectorAll('*');
      allEls.forEach(el => {
        const style = (el as HTMLElement).style;
        style.backgroundColor = '';
        style.color = '';
        style.borderColor = '';
      });
      
      document.body.appendChild(clone);
      
      const canvasFunc = html2canvas;
      if (!canvasFunc) {
        throw new Error('html2canvas not loaded');
      }
      
      const canvasResult = await canvasFunc(clone as HTMLElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      
      document.body.removeChild(clone);
      
      const imgData = canvasResult.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      
      const ratio = Math.min((pw - 10) / canvasResult.width, (ph - 20) / canvasResult.height);
      const fw = canvasResult.width * ratio;
      const fh = canvasResult.height * ratio;
      
      if (fh > ph) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 5, 10, fw, fh);
      pdf.save(`Optimized_Resume_${Date.now()}.pdf`);
      success('PDF downloaded successfully!');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      error(err?.message || 'Failed to generate PDF');
    }
  };

  useImperativeHandle(ref, () => ({
    downloadPdf
  }));

  if (!data) {
    return (
      <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-sans text-sm md:text-base p-8 bg-white dark:bg-gray-900 rounded-xl shadow-inner">
        {rawText}
      </div>
    );
  }

  const { header, summary, sections } = data;

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-950 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 bg-slate-50 dark:bg-[#020617]">
        <div 
          ref={resumeRef}
          className="bg-white text-slate-900 p-6 sm:p-12 md:p-[0.75in] lg:p-[1in] shadow-2xl mx-auto w-full max-w-[8.5in] font-serif border border-gray-100 min-h-[11in]"
          style={{ 
            color: '#1a202c',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold uppercase tracking-widest mb-3 border-b-4 border-slate-900 pb-2 inline-block px-4">{header?.name}</h1>
            <div className="text-[10pt] flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-slate-700">
              {header?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {header.location}</span>}
              {header?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {header.phone}</span>}
              {header?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {header.email}</span>}
              {header?.links?.map((link: string, i: number) => (
                <span key={i} className="flex items-center gap-1"><Globe className="w-3 h-3" /> {link}</span>
              ))}
            </div>
          </header>

          {/* Summary */}
          {summary && (
            <section className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest bg-slate-100 px-3 py-1 mb-3 border-l-4 border-slate-900">Professional Summary</h2>
              <p className="text-[10.5pt] leading-relaxed text-justify">{summary}</p>
            </section>
          )}

          {/* Dynamic Sections */}
          {sections?.map((section: any, idx: number) => {
            const title = (section.title || '').toUpperCase();
            const isExperience = title.includes('EXPERIENCE') || title.includes('WORK');
            const isEducation = title.includes('EDUCATION');
            const isProject = title.includes('PROJECT');
            const isSkills = title.includes('SKILL') || title.includes('CERTIFICATION') || title.includes('TECHNICAL');
            const isLeadership = title.includes('LEADERSHIP') || title.includes('ACTIVIT') || title.includes('EXTRACURRICULAR');

            return (
            <section key={idx} className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest bg-slate-100 px-3 py-1 mb-3 border-l-4 border-slate-900">{section.title}</h2>
              
              <div className="space-y-6">
                {section.items?.map((item: any, i: number) => (
                  <div key={i}>
                    {/* Experience Item */}
                    {isExperience && (
                      <div className="group">
                        <div className="flex justify-between font-bold text-[11pt] mb-0.5">
                          <span className="text-slate-900">{item.company}</span>
                          <span className="text-slate-700">{item.dates}</span>
                        </div>
                        <div className="flex justify-between italic text-[10pt] text-slate-600 mb-2">
                          <span>{item.role}</span>
                          <span>{item.location}</span>
                        </div>
                        <ul className="list-disc ml-5 text-[10pt] space-y-1.5 text-slate-800">
                          {item.bullets?.map((bullet: string, bIdx: number) => (
                            <li key={bIdx} className="pl-1">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Education Item */}
                    {isEducation && (
                      <div className="group">
                        <div className="flex justify-between font-bold text-[11pt] mb-0.5">
                          <span className="text-slate-900">{item.institution}</span>
                          <span className="text-slate-700">{item.dates}</span>
                        </div>
                        <div className="flex justify-between italic text-[10pt] text-slate-600">
                          <span>{item.degree}</span>
                          <span>{item.location}</span>
                        </div>
                        {item.details && <p className="text-[9.5pt] mt-1 text-slate-700 leading-snug">{item.details}</p>}
                      </div>
                    )}

                    {/* Project Item */}
                    {isProject && (
                      <div className="group">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-[11pt] text-slate-900">{item.name}</span>
                          {item.technologies && <span className="text-[9pt] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded italic">Tools: {item.technologies}</span>}
                        </div>
                        <ul className="list-disc ml-5 text-[10pt] space-y-1.5 text-slate-800">
                          {item.bullets?.map((bullet: string, bIdx: number) => (
                            <li key={bIdx} className="pl-1">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Skills Item */}
                    {isSkills && (
                      <div className="text-[10pt] flex gap-2 mb-1">
                        <span className="font-bold text-slate-900 min-w-[120px]">{item.category}:</span>
                        <span className="text-slate-800">{Array.isArray(item.skills) ? item.skills.join(', ') : item.skills}</span>
                      </div>
                    )}

                    {/* Leadership / Activities */}
                    {isLeadership && (
                      <div className="group">
                        {item.name && <div className="font-bold text-[11pt] text-slate-900 mb-1">{item.name}</div>}
                        {item.role && <div className="italic text-[10pt] text-slate-600 mb-1">{item.role}</div>}
                        {item.details && <div className="text-[10pt] mb-1 text-slate-700">{item.details}</div>}
                        {item.bullets && (
                          <ul className="list-disc ml-5 text-[10pt] space-y-1.5 text-slate-800">
                            {item.bullets.map((b: string, bi: number) => <li key={bi} className="pl-1">{b}</li>)}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Generic Fallback — only if no specific match */}
                    {!isExperience && !isEducation && !isProject && !isSkills && !isLeadership && (
                       <div className="text-[10pt]">
                          {item.name && <div className="font-bold text-slate-900 mb-1">{item.name}</div>}
                          {item.company && <div className="font-bold text-slate-900 mb-1">{item.company}</div>}
                          {item.details && <div className="mb-1 text-slate-700">{item.details}</div>}
                          {item.bullets && (
                            <ul className="list-disc ml-5 space-y-1.5 text-slate-800">
                              {item.bullets.map((b: string, bi: number) => <li key={bi} className="pl-1">{b}</li>)}
                            </ul>
                          )}
                       </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
            );
          })}
        </div>
      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
