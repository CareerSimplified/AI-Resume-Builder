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
    const generationConfig = useJsonFormat ? { response_mime_type: "application/json" } : {};
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
                contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
                generationConfig
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
        const systemPrompt = "You are a premium resume optimization engine for MBA consulting and high-tier corporate roles. You must return ONLY a valid JSON object.";
        const userPrompt = `Analyze this resume for MBA-level formatting and polish.
Focus on: Action verbs, metrics (quantification), STAR structure, and consulting-style language.
Target standard: ${targetStandard || 'Auto Detect'}
${RESUME_REWRITE_RULES}

RESUME:
${resumeText}

Return exactly this JSON structure with real data populated:
{
  "match_score": { "score": 85, "alignment": 0, "quantification": 25, "keywords": 15, "structure": 15, "formatting": 15, "impact": 15 },
  "ats_score": 88,
  "strengths": ["Strong use of action verbs", "Clear chronological structure"],
  "weaknesses": ["Lack of specific metrics in recent roles"],
  "missing_skills": ["Tableau", "SQL"],
  "suggestions": ["Add % or $ values to achievements"],
  "qualityVerdict": {
    "rating": "moderate",
    "issues": ["Bullets are task-heavy and impact-light"],
    "improvementsMade": ["Reframed bullets with action + outcome structure", "Standardized section headers", "Applied impact-first narration"]
  },
  "rewrittenResume": "A full, professional version of the resume rewritten in executive consulting style with clear sections and improved bullet points..."
}`;

        const rawResponse = await callAI(systemPrompt, userPrompt);
        let parsed = parseJSON(rawResponse);
        if (!parsed) throw new Error("Failed to parse MBA Polish JSON");

        return {
          match_score: parsed.match_score || { score: 85, alignment: 0, quantification: 25, keywords: 15, structure: 15 },
          ats_score: parsed.ats_score || 85,
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          missing_skills: parsed.missing_skills || [],
          suggestions: parsed.suggestions || [],
          qualityVerdict: parsed.qualityVerdict,
          rewrittenResume: normalizeRewrittenResume(parsed.rewrittenResume || ""),
          gaps: { missing_skills: [], missing_frameworks: [], missing_keywords: [], missing_metrics: [], missing_leadership: [] }
        };
      } else {
        // Mode 2: JD_ALIGNMENT - Promises.all
        const baseSystemPrompt = "You are an expert ATS optimization engine. Return ONLY valid JSON.";

        const tasks = [];

        // 1. Resume rewrite (Free & Pro)
        tasks.push(
          callAI(baseSystemPrompt, `Rewrite this resume to closely align with the provided Job Description.
${RESUME_REWRITE_RULES}
RESUME:
${resumeText}
JD:
${jobDescription}
Return JSON: {"rewrittenResume": "Full document with section headings and bullet points..."}`)
            .then(res => ({ type: 'rewrite', data: parseJSON(res) }))
        );

        // 2. Match score (Free & Pro)
        tasks.push(
          callAI(baseSystemPrompt, `Analyze this resume against the JD and compute a match score out of 100.
RESUME:
${resumeText}
JD:
${jobDescription}
Return JSON: {
  "match_score": { "score": 85, "alignment": 30, "quantification": 20, "keywords": 20, "structure": 15 },
  "ats_score": 80,
  "gaps": {
    "missing_skills": ["AWS", "Docker"],
    "missing_frameworks": [],
    "missing_keywords": ["Scalability"],
    "missing_metrics": ["Cloud cost reduction %"],
    "missing_leadership": ["Direct reports"]
  }
}`)
            .then(res => ({ type: 'score', data: parseJSON(res) }))
        );

        if (isPro) {
          // 3. Keyword analysis (Pro)
          tasks.push(
            callAI(baseSystemPrompt, `Extract strengths, weaknesses, missing skills, and suggestions.
RESUME:
${resumeText}
JD:
${jobDescription}
Return JSON: {"strengths": [], "weaknesses": [], "missing_skills": [], "suggestions": []}`)
              .then(res => ({ type: 'keywords', data: parseJSON(res) }))
          );
          // 4. Cover Letter (Pro)
          tasks.push(
            callAI(baseSystemPrompt, `Write a professional cover letter specifically tailored to this JD using the candidate's resume.
RESUME:
${resumeText}
JD:
${jobDescription}
Return JSON: {"coverLetter": "Dear Hiring Manager..."}`)
              .then(res => ({ type: 'coverLetter', data: parseJSON(res) }))
          );
          // 5. Interview Prep (Pro)
          tasks.push(
            callAI(baseSystemPrompt, `Provide the top 5 likely interview questions the hiring manager will ask based on the gaps or key requirements, and suggest STAR answers.
RESUME:
${resumeText}
JD:
${jobDescription}
Return JSON: {"interviewPrep": "Detailed Q&A..."}`)
              .then(res => ({ type: 'interview', data: parseJSON(res) }))
          );
        }

        const results = await Promise.all(tasks);

        // Merge into ReportAnalysis
        let analysis: ReportAnalysis = {
          match_score: { score: 60, alignment: 20, quantification: 15, keywords: 15, structure: 10 },
          ats_score: 75,
          strengths: [],
          weaknesses: [],
          missing_skills: [],
          suggestions: [],
          rewrittenResume: "",
          coverLetter: isPro ? "Error generating cover letter." : "Unlock Pro to see cover letter.",
          interviewPrep: isPro ? "Error generating interview prep." : "Unlock Pro to see interview prep.",
          gaps: { missing_skills: [], missing_frameworks: [], missing_keywords: [], missing_metrics: [], missing_leadership: [] }
        };

        for (const r of results) {
          if (r.type === 'rewrite' && r.data?.rewrittenResume) {
            analysis.rewrittenResume = normalizeRewrittenResume(r.data.rewrittenResume);
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
          if (r.type === 'interview' && r.data?.interviewPrep) analysis.interviewPrep = r.data.interviewPrep;
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
      rewrittenResume: resumeText // Fallback to original
    };
  }
};
