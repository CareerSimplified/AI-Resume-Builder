import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeData, resumeText, fileName } = body;

    if (!resumeText && !resumeData) {
      return NextResponse.json({ error: 'No resume content provided' }, { status: 400 });
    }

    const content = resumeData || resumeText;
    const html = generateResumeHTML(content);
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${fileName || 'Optimized_Resume'}.html"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateResumeHTML(data: any): string {
  if (typeof data === 'string') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Optimized Resume</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      max-width: 8.5in; 
      margin: 40px auto; 
      padding: 0.75in; 
      line-height: 1.6; 
      white-space: pre-wrap; 
    }
  </style>
  <script>
    window.onload = function() { window.print(); }
  <\/script>
</head>
<body>${data}</body>
</html>`;
  }

  const { header, summary, sections } = data;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${header?.name || 'Resume'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Times New Roman', Times, serif; 
      max-width: 8.5in; 
      margin: 0 auto; 
      padding: 0.5in; 
      color: #1a202c; 
      line-height: 1.3; 
    }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { 
      font-size: 22px; 
      font-weight: bold;
      text-transform: uppercase; 
      letter-spacing: 2px; 
      border-bottom: 2px solid #1a202c; 
      padding-bottom: 6px; 
      display: inline-block;
      margin-bottom: 6px;
    }
    .contact { font-size: 10px; color: #475569; margin-top: 4px; }
    .contact span { margin: 0 4px; }
    section { margin-bottom: 14px; }
    section h2 { 
      font-size: 11px; 
      font-weight: bold;
      text-transform: uppercase; 
      letter-spacing: 1px; 
      background: #e2e8f0; 
      padding: 3px 8px; 
      border-left: 3px solid #1e293b; 
      margin-bottom: 8px; 
    }
    .summary { text-align: justify; font-size: 10px; }
    .exp-item { margin-bottom: 10px; }
    .exp-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 10px; }
    .exp-role { font-style: italic; color: #475569; font-size: 9px; margin-top: 1px; }
    .location { font-size: 9px; color: #64748b; }
    .details { font-size: 9px; color: #475569; font-style: italic; }
    .skill-item { font-size: 9px; margin-bottom: 3px; }
    .skill-item strong { font-weight: bold; }
    .tech { font-size: 8px; color: #64748b; font-style: italic; display: block; margin-top: 2px; }
    .project-header { display: flex; justify-content: space-between; align-items: baseline; font-weight: bold; font-size: 10px; margin-bottom: 3px; }
    .project-name { font-weight: bold; }
    ul { margin-left: 16px; font-size: 9px; }
    li { margin-bottom: 2px; }
    @media print {
@page {
      size: auto;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${header?.name || 'Name'}</h1>
    <div class="contact">
      ${header?.location ? `<span>${header.location}</span>` : ''}
      ${header?.phone ? `<span>${header.phone}</span>` : ''}
      ${header?.email ? `<span>${header.email}</span>` : ''}
      ${header?.links?.length ? `<span>${header.links.join(', ')}</span>` : ''}
    </div>
  </div>
  
  ${summary ? `
  <section>
    <h2>Professional Summary</h2>
    <p class="summary">${summary}</p>
  </section>
  ` : ''}
  
  ${sections?.map((section: any) => `
  <section>
    <h2>${section.title}</h2>
    ${section.items?.length > 0 ? section.items?.map((item: any) => {
      const title = (section.title || '').toLowerCase();
      
      if (title.includes('experien') || title.includes('work')) {
        return `
        <div class="exp-item">
          <div class="exp-header">
            <span>${item.company || item.name || ''}</span>
            <span>${item.dates || ''}</span>
          </div>
          <div class="exp-role">${item.role || item.title || ''}</div>
          ${item.location ? '<div class="location">' + item.location + '</div>' : ''}
          ${item.bullets ? '<ul>' + item.bullets.map((b: string) => '<li>' + b + '</li>').join('') + '</ul>' : ''}
        </div>`;
      }
      
      if (title.includes('educat')) {
        return `
        <div class="exp-item">
          <div class="exp-header">
            <span>${item.institution || item.name || ''}</span>
            <span>${item.dates || ''}</span>
          </div>
          <div class="exp-role">${item.degree || item.title || ''}</div>
          ${item.location ? '<div class="location">' + item.location + '</div>' : ''}
          ${item.details ? '<div class="details">' + item.details + '</div>' : ''}
        </div>`;
      }
      
      if (title.includes('projec')) {
        return `
        <div class="exp-item">
          <div class="project-header">
            <span class="project-name">${item.name || ''}</span>
            ${item.technologies ? '<span class="tech">' + item.technologies + '</span>' : ''}
          </div>
          ${item.bullets ? '<ul>' + item.bullets.map((b: string) => '<li>' + b + '</li>').join('') + '</ul>' : ''}
        </div>`;
      }
      
      if (title.includes('skill') || title.includes('certif') || title.includes('techn')) {
        return `
        <div class="skill-item">
          <strong>${item.category || item.title || ''}:</strong> 
          <span>${typeof item.skills === 'string' ? item.skills : (item.skills?.join(', ') || '')}</span>
        </div>`;
      }
      
      if (title.includes('addit') || title.includes('interest') || title.includes('lang')) {
        return `
        <div class="exp-item">
          <strong>${item.category || ''}:</strong> 
          <span>${item.details || item.name || ''}</span>
        </div>`;
      }
      
      if (title.includes('leader') || title.includes('activit') || title.includes('extracurri')) {
        return `
        <div class="exp-item">
          ${item.name ? '<div class="exp-header"><span>' + item.name + '</span></div>' : ''}
          ${item.role ? '<div class="exp-role">' + item.role + '</div>' : ''}
          ${item.details ? '<div>' + item.details + '</div>' : ''}
          ${item.bullets ? '<ul>' + item.bullets.map((b: string) => '<li>' + b + '</li>').join('') + '</ul>' : ''}
        </div>`;
      }
      
      return `
      <div class="exp-item">
        ${item.name ? '<div class="exp-header"><span>' + item.name + '</span></div>' : ''}
        ${item.company ? '<div class="exp-header"><span>' + item.company + '</span></div>' : ''}
        ${item.details ? '<div>' + item.details + '</div>' : ''}
        ${item.bullets ? '<ul>' + item.bullets.map((b: string) => '<li>' + b + '</li>').join('') + '</ul>' : ''}
      </div>`;
    }).join('') : '<p>No items available</p>'}
  </section>
  `).join('')}
</body>
</html>`;
}