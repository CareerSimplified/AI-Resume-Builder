import { ReportAnalysis, ScoreBreakdown, Gaps } from "@/types";
// Implements PRD v1.0 AI Engine (Claude Sonnet 3.5 integration & Fallbacks)

const STANDARD_SECTION_ORDER = [
  "SUMMARY",
  "EXPERIENCE",
  "EDUCATION",
  "LEADERSHIP",
  "PROJECTS",
  "CERTIFICATIONS",
  "SKILLS",
  "ADDITIONAL INFORMATION",
] as const;

const RESUME_REWRITE_RULES = `
Hard requirements for rewrittenResume:
- Preserve all factual user information from the original resume (names, employers, titles, dates, degrees, certifications, locations, technologies, achievements).
- Do not invent or fabricate new employers, achievements, awards, education, metrics, or dates.
- Use ATS-friendly plain text only (no tables, no icons, no emojis, no markdown bullets).
- Use this exact section ordering:
  1. NAME & CONTACT (Centered, Bold)
  2. PROFESSIONAL SUMMARY
  3. PROFESSIONAL EXPERIENCE (Company, Role, Dates, Location)
  4. EDUCATION
  5. LEADERSHIP & ACTIVITIES
  6. PROJECTS
  7. SKILLS & CERTIFICATIONS
  8. ADDITIONAL INFORMATION
- Use strong action verbs (e.g., Spearheaded, Orchestrated, Optimized, Engineered) and concise MBA-style bullets.
- Every bullet should follow the XYZ structure or Impact-First structure:
  [Accomplished X] as measured by [Y], by doing [Z].
- OR: [Action Verb] + [What you did] + [How/Scope] + [Measurable outcome when available].
- Keep bullets to one line where possible.
- If a metric is not present in source text, add a placeholder like [QUANTIFY: e.g. % increase in efficiency] to prompt the user to fill it in.
- Use horizontal lines (---) or Uppercase Headings to clearly separate sections.
`;

function parseJSON(text: string) {
  try {
    let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("[aiService] JSON Parse Error:", e);
    return null;
  }
}

function normalizeBulletStyle(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (/^[-*•]\s+/.test(trimmed)) {
        return `- ${trimmed.replace(/^[-*•]\s+/, "")}`;
      }
      return line;
    })
    .join("\n");
}

function reorderResumeSections(text: string): string {
  const lines = text.split("\n");
  const headingRegex = /^([A-Z][A-Z\s&/]+)$/;
  const normalizedOrder = new Map<string, number>(STANDARD_SECTION_ORDER.map((name, idx) => [name, idx]));
  const sections: { heading: string; lines: string[]; index: number }[] = [];
  let current: { heading: string; lines: string[]; index: number } | null = null;
  let inferredIndex = STANDARD_SECTION_ORDER.length + 1;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const headingMatch = line.match(headingRegex);
    const candidateHeading = headingMatch ? headingMatch[1].replace(/\s+/g, " ").trim() : null;
    const isKnownHeading = candidateHeading && normalizedOrder.has(candidateHeading);

    if (isKnownHeading) {
      if (current) sections.push(current);
      current = {
        heading: candidateHeading as string,
        lines: [candidateHeading as string],
        index: normalizedOrder.get(candidateHeading as string) as number,
      };
      continue;
    }

    if (!current) {
      current = {
        heading: "__INTRO__",
        lines: [],
        index: -1,
      };
    }
    current.lines.push(rawLine);
  }
  if (current) sections.push(current);

  const knownCount = sections.filter((s) => normalizedOrder.has(s.heading)).length;
  if (knownCount < 2) {
    return text;
  }

  const normalizedSections = sections.map((s) => {
    if (s.heading !== "__INTRO__" && normalizedOrder.has(s.heading)) {
      return s;
    }
    return { ...s, index: inferredIndex++ };
  });

  return normalizedSections
    .sort((a, b) => a.index - b.index)
    .map((s) => s.lines.join("\n").trimEnd())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function normalizeRewrittenResume(text?: string): string {
  if (!text) return "";
  const bulletNormalized = normalizeBulletStyle(text);
  return reorderResumeSections(bulletNormalized);
}

const COMMON_SKILLS = [
  "react", "next.js", "nextjs", "redux", "javascript", "typescript", "node.js", "nodejs",
  "express", "mongodb", "sql", "aws", "docker", "kubernetes", "git", "github",
  "rest api", "api", "html", "css", "bootstrap", "testing", "leadership", "mentoring",
  "agile", "jira", "ci/cd"
];

function detectSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const matched = COMMON_SKILLS.filter((skill) => lower.includes(skill));
  return Array.from(new Set(matched.map((s) => s.replace("nextjs", "next.js").replace("nodejs", "node.js"))));
}

function detectQuantificationHints(text: string): string[] {
  const metrics: string[] = [];
  if (!/\d+%/.test(text)) metrics.push("Add percentage impact (e.g., performance, conversion, delivery speed)");
  if (!/\b\d+\+?\s*(years?|yrs?)\b/i.test(text)) metrics.push("Mention total years of relevant experience per role");
  if (!/\b(team|interns?|engineers?)\b/i.test(text)) metrics.push("Highlight team size or mentoring scope where applicable");
  return metrics;
}

async function callAI(systemPrompt: string, userPrompt: string, useJsonFormat = true): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const maxTokens = 4000;
  const timeoutMsg = "AI request timed out";

  const fetchWithTimeout = async (url: string, options: any, timeout = 90000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (err: any) {
      clearTimeout(id);
      throw new Error(err.name === 'AbortError' ? timeoutMsg : err.message);
    }
  };

  if (anthropicKey) {
    console.log("[aiService] Using Claude API");
    const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022", // Using valid Sonnet model name
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Anthropic error");
    return data.content[0].text;
  }

  if (geminiKey) {
    console.log("[aiService] Using Gemini API fallback");
    const generationConfig = useJsonFormat ? { responseMimeType: "application/json" } : {};
    const candidateModels = [
      "gemini-2.0-flash",
      "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-pro-latest",
    ];
    let lastError = "Gemini request failed";

    for (const model of candidateModels) {
      for (const apiVersion of ["v1beta", "v1"]) {
        try {
          const response = await fetchWithTimeout(
            `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }]
              }),
            }
          ).then(res => res.json());

          if (response.error) {
            lastError = response.error.message || "Gemini error";
            console.warn(`[aiService] Gemini ${apiVersion}/${model} failed: ${lastError}`);
            continue;
          }

          if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
            return response.candidates[0].content.parts[0].text;
          }
        } catch (e: any) {
          lastError = e.message;
          continue;
        }
      }
    }

    throw new Error(lastError);
  }

  throw new Error("No AI API keys configured");
}

export const aiService = {
  // Analyze resume using Google Gemini or Anthropic API
  async analyzeResume(
    resumeText: string,
    mode: 'MBA_POLISH' | 'JD_ALIGNMENT' = 'JD_ALIGNMENT',
    jobDescription?: string,
    isPro: boolean = false,
    targetStandard?: string
  ): Promise<ReportAnalysis> {
    try {
      console.log(`[aiService] Starting analysis in ${mode} mode. Resume length: ${resumeText.length}`);
      if (jobDescription) console.log(`[aiService] JD provided, length: ${jobDescription.length}`);

      if (mode === 'MBA_POLISH') {
        const systemPrompt = "You are a premium resume optimization engine. You must return ONLY a valid JSON object. Every analysis must be 100% unique and strictly tailored to the specific text provided. Avoid generic templates.";
        const userPrompt = `Analyze this resume for MBA-level formatting and polish.
Focus on: Action verbs, metrics (quantification), STAR structure, and consulting-style language.
Target standard: ${targetStandard || 'Auto Detect'}

${RESUME_REWRITE_RULES}

RESUME:
${resumeText}

Return exactly this JSON structure with real data populated (do not use example values):
{
  "match_score": { "score": "[CALCULATED_SCORE]", "alignment": 0, "quantification": "[SCORE]", "keywords": "[SCORE]", "structure": "[SCORE]", "formatting": "[SCORE]", "impact": "[SCORE]" },
  "ats_score": "[CALCULATED_ATS_SCORE]",
  "strengths": ["[STRENGTH_1]", "[STRENGTH_2]"],
  "weaknesses": ["[WEAKNESS_1]"],
  "missing_skills": ["[SKILL_1]", "[SKILL_2]"],
  "suggestions": ["[SUGGESTION_1]"],
  "rewrittenResume": "[FULL_REWRITTEN_TEXT_HERE]",
  "rewrittenResumeData": {
    "header": { "name": "[NAME]", "email": "[EMAIL]", "phone": "[PHONE]", "location": "[LOCATION]", "links": ["[LINK_1]"] },
    "summary": "[PROFESSIONAL_SUMMARY]",
    "sections": [
      { 
        "title": "EXPERIENCE", 
        "items": [ 
          { "company": "[COMPANY]", "role": "[ROLE]", "dates": "[DATES]", "location": "[LOCATION]", "bullets": ["[BULLET_1]"] } 
        ] 
      },
      { "title": "EDUCATION", "items": [ { "institution": "[INSTITUTION]", "degree": "[DEGREE]", "dates": "[DATES]", "location": "[LOCATION]", "details": "[DETAILS]" } ] },
      { "title": "PROJECTS", "items": [ { "name": "[PROJECT]", "technologies": "[TECH]", "bullets": ["[BULLET]"] } ] },
      { "title": "SKILLS", "items": [ { "category": "[CATEGORY]", "skills": ["[SKILL]"] } ] }
    ]
  }
}`;

        // Fire all MBA tasks in parallel: resume rewrite + cover letter + interview prep + career plan
        const mbaTasks = [
          callAI(systemPrompt, userPrompt).then(res => ({ type: 'main', data: parseJSON(res) })),
          callAI(
            "You are a professional career coach. Return ONLY valid JSON.",
            `Write a professional, compelling cover letter for this candidate. The letter should highlight their key strengths, quantified achievements, and career narrative. Make it ready to send.\n\nRESUME:\n${resumeText}\n\nReturn JSON: {"coverLetter": "Dear Hiring Manager,\\n\\n[Full 3-4 paragraph cover letter]\\n\\nSincerely,\\n[Name]"}`
          ).then(res => ({ type: 'cover', data: parseJSON(res) })),
          callAI(
            "You are a senior interview coach. Return ONLY valid JSON.",
            `Based on this resume, generate EXACTLY 15 high-stakes interview questions with detailed STAR-format answers. Include a mix of behavioral, technical, and situational questions. You MUST return exactly 15 items.\n\nRESUME:\n${resumeText}\n\nReturn JSON: {"questions": [{"id": 1, "type": "behavioral", "question": "...", "answer": "Situation: ... Task: ... Action: ... Result: ..."}, ...15 total items]}`
          ).then(res => ({ type: 'interview', data: parseJSON(res) })),
          callAI(
            "You are a strategic career advisor. Return ONLY valid JSON.",
            `Generate a high-impact 30/60/90 day onboarding and success plan for this candidate based on their resume profile. 
             Focus on: Learning, Quick Wins, and Long-term Value.
             Return JSON: {"plan": "### 30 Days: Learning & Integration\\n- ...\\n\\n### 60 Days: Execution & Quick Wins\\n- ...\\n\\n### 90 Days: Ownership & Strategy\\n- ..."}`
          ).then(res => ({ type: 'plan', data: parseJSON(res) }))
        ];

        const mbaResults = await Promise.all(mbaTasks);
        const mainData = mbaResults.find(r => r.type === 'main')?.data;
        const coverData = mbaResults.find(r => r.type === 'cover')?.data;
        const interviewData = mbaResults.find(r => r.type === 'interview')?.data;
        const planData = mbaResults.find(r => r.type === 'plan')?.data;

        if (!mainData) throw new Error("Failed to parse MBA Polish JSON");

        return {
          match_score: mainData.match_score || { score: 85, alignment: 0, quantification: 25, keywords: 15, structure: 15 },
          ats_score: mainData.ats_score || 85,
          strengths: mainData.strengths || [],
          weaknesses: mainData.weaknesses || [],
          missing_skills: mainData.missing_skills || [],
          suggestions: mainData.suggestions || [],
          qualityVerdict: mainData.qualityVerdict,
          rewrittenResume: normalizeRewrittenResume(mainData.rewrittenResume || ""),
          rewrittenResumeData: mainData.rewrittenResumeData,
          coverLetter: coverData?.coverLetter || "Cover letter generation failed. Please try again.",
          interviewPrep: interviewData?.questions ? JSON.stringify(interviewData.questions) : "Interview prep generation failed.",
          plan306090: planData?.plan || planData || "Career plan generation failed.",
          gaps: { missing_skills: [], missing_frameworks: [], missing_keywords: [], missing_metrics: [], missing_leadership: [] }
        };
      } else {
        // Mode 2: JD_ALIGNMENT
        const baseSystemPrompt = "You are an expert ATS optimization engine. Return ONLY valid JSON.";
        const tasks = [];

        // 1. Resume rewrite
        tasks.push(
          callAI(baseSystemPrompt, `You are a high-precision career engineer. Your task is to BIND the following Resume and Job Description together into a perfectly tailored professional document.
          
${RESUME_REWRITE_RULES}

STRICT ALIGNMENT RULES:
- Identify key technical skills and soft skills in the JD and ensure they are woven naturally into the resume's experience and skills sections.
- Rephrase achievement bullets to use the industry-specific terminology found in the JD.
- Mirror the 'voice' and priority of the company specified in the JD.
- Ensure the Professional Summary directly addresses the core requirements of the role.

RESUME:
${resumeText}

JD:
${jobDescription}

Return EXACTLY this JSON structure (do not use example values):
{
  "rewrittenResume": "Full document plain text...",
  "rewrittenResumeData": {
    "header": { "name": "[NAME]", "email": "[EMAIL]", "phone": "[PHONE]", "location": "[LOCATION]", "links": ["[LINK_1]"] },
    "summary": "[PROFESSIONAL_SUMMARY]",
    "sections": [
      { 
        "title": "EXPERIENCE", 
        "items": [ 
          { "company": "[COMPANY]", "role": "[ROLE]", "dates": "[DATES]", "location": "[LOCATION]", "bullets": ["[BULLET_1]"] } 
        ] 
      },
      { "title": "EDUCATION", "items": [ { "institution": "[INSTITUTION]", "degree": "[DEGREE]", "dates": "[DATES]", "location": "[LOCATION]", "details": "[DETAILS]" } ] },
      { "title": "PROJECTS", "items": [ { "name": "[PROJECT]", "technologies": "[TECH]", "bullets": ["[BULLET]"] } ] },
      { "title": "SKILLS", "items": [ { "category": "[CATEGORY]", "skills": ["[SKILL]"] } ] },
      { "title": "LEADERSHIP & ACTIVITIES", "items": [ { "name": "[ACTIVITY]", "role": "[ROLE]", "bullets": ["[BULLET]"] } ] }
    ]
  }
}`).then(res => ({ type: 'rewrite', data: parseJSON(res) }))
        );

        // 2. Match score
        tasks.push(
          callAI(baseSystemPrompt, `Analyze this resume against the JD and compute a match score out of 100.
RESUME: ${resumeText}
JD: ${jobDescription}
Return JSON: { 
  "match_score": { "score": "[CALCULATED]", "alignment": "[CALCULATED]", "quantification": "[CALCULATED]", "keywords": "[CALCULATED]", "structure": "[CALCULATED]" }, 
  "ats_score": "[CALCULATED]", 
  "gaps": { 
    "missing_skills": ["[SKILL_1]", "[SKILL_2]"], 
    "missing_frameworks": [], 
    "missing_keywords": ["[KEYWORD_1]"], 
    "missing_metrics": ["[METRIC_HINT]"], 
    "missing_leadership": [] 
  } 
}`)
            .then(res => ({ type: 'score', data: parseJSON(res) }))
        );

        // 3. Keyword analysis
        tasks.push(
          callAI(baseSystemPrompt, `Extract strengths, weaknesses, missing skills, and suggestions.
RESUME: ${resumeText}
JD: ${jobDescription}
Return JSON: {"strengths": [...], "weaknesses": [...], "missing_skills": [...], "suggestions": [...]}`)
            .then(res => ({ type: 'keywords', data: parseJSON(res) }))
        );

        // 4. Cover Letter
        tasks.push(
          callAI("You are a professional career coach. Return ONLY valid JSON.",
            `Write a tailored cover letter for this JD.
RESUME: ${resumeText}
JD: ${jobDescription}
Return JSON: {"coverLetter": "..."}`).then(res => ({ type: 'coverLetter', data: parseJSON(res) }))
        );

        // 5. Interview Prep - 15 Q&A
        tasks.push(
          callAI("You are a senior interview coach. Return ONLY valid JSON.",
            `Based on this resume and target JD, generate EXACTLY 15 high-stakes interview questions with detailed STAR-format answers. 
            Include a mix of:
            - Behavioral (Tell me about a time...)
            - Technical/Domain-specific (How would you handle...)
            - Strategic/Situational (Imagine if...)
            
            You MUST return exactly 15 items.
            
RESUME: ${resumeText}
JD: ${jobDescription}

Return JSON: {"questions": [{"id": 1, "type": "behavioral", "question": "...", "answer": "Situation: ... Task: ... Action: ... Result: ..."}, ...15 total items]}`).then(res => ({ type: 'interview', data: parseJSON(res) }))
        );

        // 6. 30/60/90 Day Plan
        tasks.push(
          callAI("You are a strategic onboarding expert. Return ONLY valid JSON.",
            `Generate a 30/60/90 day success plan for this specific role and candidate.
RESUME: ${resumeText}
JD: ${jobDescription}
Return JSON: {"plan": "..."}`).then(res => ({ type: 'plan', data: parseJSON(res) }))
        );

        const results = await Promise.all(tasks);

        let analysis: ReportAnalysis = {
          match_score: { score: 60, alignment: 20, quantification: 15, keywords: 15, structure: 10 },
          ats_score: 75,
          strengths: [],
          weaknesses: [],
          missing_skills: [],
          suggestions: [],
          rewrittenResume: "",
          rewrittenResumeData: null,
          coverLetter: "",
          interviewPrep: "",
          plan306090: "",
          gaps: { missing_skills: [], missing_frameworks: [], missing_keywords: [], missing_metrics: [], missing_leadership: [] }
        };

        for (const r of results) {
          if (r.type === 'rewrite' && r.data?.rewrittenResume) {
            analysis.rewrittenResume = normalizeRewrittenResume(r.data.rewrittenResume);
            analysis.rewrittenResumeData = r.data.rewrittenResumeData;
          }
          if (r.type === 'score' && r.data) {
            if (r.data.match_score) analysis.match_score = r.data.match_score;
            if (r.data.ats_score) analysis.ats_score = r.data.ats_score;
            if (r.data.gaps) analysis.gaps = { ...analysis.gaps, ...r.data.gaps };
          }
          if (r.type === 'keywords' && r.data) {
            analysis.strengths = r.data.strengths || [];
            analysis.weaknesses = r.data.weaknesses || [];
            analysis.missing_skills = r.data.missing_skills || [];
            analysis.suggestions = r.data.suggestions || [];
          }
          if (r.type === 'coverLetter' && r.data?.coverLetter) analysis.coverLetter = r.data.coverLetter;
          if (r.type === 'interview' && r.data?.questions) analysis.interviewPrep = JSON.stringify(r.data.questions);
          if (r.type === 'plan' && r.data) {
            analysis.plan306090 = r.data.plan || r.data;
          }
        }

        return analysis;
      }

    } catch (error: any) {
      console.error("Error in aiService:", error);
      return this.getDynamicFallback(resumeText, mode, jobDescription);
    }
  },

  // Dynamic fallback when API fails
  getDynamicFallback(resumeText: string, mode: string, jd?: string): ReportAnalysis {
    const nameMatch = resumeText.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
    const name = nameMatch ? nameMatch[1] : "Candidate";
    const resumeSkills = detectSkills(resumeText);
    const jdSkills = jd ? detectSkills(jd) : [];
    const missingSkills = jdSkills.filter((skill) => !resumeSkills.includes(skill)).slice(0, 6);
    const metricHints = detectQuantificationHints(resumeText).slice(0, 4);
    const strengths = [
      "Clean contact information",
      `Readable structure detected for ${name}`,
      ...(resumeSkills.length ? [`Detected technical stack: ${resumeSkills.slice(0, 5).join(", ")}`] : []),
    ];
    const suggestions = [
      "AI provider was temporarily unavailable; fallback analysis was used",
      "Rewrite bullets to action + scope + measurable result format",
      ...(metricHints.length ? metricHints : ["Add measurable outcomes ($, %, time, scale) to each major project"]),
    ];

    return {
      match_score: {
        score: 65,
        alignment: mode === 'MBA_POLISH' ? 0 : 20,
        quantification: 15,
        keywords: 15,
        structure: 15
      },
      ats_score: 70,
      strengths,
      weaknesses: ["AI analysis service temporarily unavailable", "Resume needs stronger quantified outcomes"],
      missing_skills: missingSkills.length ? missingSkills : ["No critical missing keywords detected from provided JD text"],
      suggestions,
      gaps: {
        missing_skills: missingSkills.length ? missingSkills : [],
        missing_frameworks: missingSkills.filter((s) => ["react", "next.js", "redux", "express"].includes(s)),
        missing_keywords: missingSkills,
        missing_metrics: metricHints.length ? metricHints : ["Add at least 2 quantified achievements in recent role"],
        missing_leadership: /\b(lead|mentor|managed|team)\b/i.test(resumeText) ? [] : ["Add one bullet showing ownership/leadership"]
      },
      rewrittenResume: resumeText, // Fallback to original
      rewrittenResumeData: null // ResumePreview handles null
    };
  },

  async generateEssayQuestions(topic: string): Promise<string[]> {
    const systemPrompt = "You are an expert academic interviewer. Your goal is to ask 15 deep, insightful questions to help a student clarify their thoughts for a high-quality essay. Return ONLY a valid JSON array of 15 strings.";
    const userPrompt = `The essay topic is: "${topic}". Generate 15 questions that will help the student provide specific details, examples, and personal insights for their essay.`;
    
    try {
      const response = await callAI(systemPrompt, userPrompt, true);
      const questions = parseJSON(response);
      return Array.isArray(questions) ? questions : [];
    } catch (error) {
      console.error("[aiService] Question generation failed:", error);
      return [];
    }
  },

  async generateEssayPrompts(topic: string, answers: { question: string, answer: string }[]): Promise<{ id: string, title: string, description: string }[]> {
    const systemPrompt = "You are a professional essay consultant. Based on a topic and a user's detailed answers, generate 3 unique and compelling essay prompts/titles. Return ONLY a valid JSON array of 3 objects with keys: id, title, description.";
    const userPrompt = `Topic: ${topic}\n\nUser Answers:\n${answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n')}\n\nGenerate 3 distinct essay prompts that the user could choose from.`;
    
    try {
      const response = await callAI(systemPrompt, userPrompt, true);
      const prompts = parseJSON(response);
      return Array.isArray(prompts) ? prompts : [];
    } catch (error) {
      console.error("[aiService] Prompt generation failed:", error);
      return [];
    }
  },

  async generateEssay(topic: string, selectedPrompt: string, answers: { question: string, answer: string }[]): Promise<string> {
    const systemPrompt = "You are a world-class essay writer. Use the provided topic, selected prompt, and the user's detailed answers to write a masterpiece essay. Return the essay in Markdown format.";
    const userPrompt = `
      Topic: ${topic}
      Selected Prompt: ${selectedPrompt}
      
      User's Detailed Insights:
      ${answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n')}
      
      Please write a comprehensive, well-structured, and deeply insightful essay (approx 1000-1500 words). Use academic yet accessible language.
    `;
    
    try {
      const response = await callAI(systemPrompt, userPrompt, false);
      return response;
    } catch (error) {
      console.error("[aiService] Essay generation failed:", error);
      throw new Error("Failed to generate essay. Please try again.");
    }
  }
};
