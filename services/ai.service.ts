import { ReportAnalysis } from "@/types";

export const aiService = {
  // Analyze resume using Google Gemini API
  async analyzeResume(
    resumeText: string,
    jobDescription: string,
  ): Promise<ReportAnalysis> {
    try {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!geminiApiKey) {
        console.warn("Gemini API key not found, using mock analysis");
        return this.getMockAnalysis(resumeText, jobDescription);
      }

      // Using Gemini 1.5 Flash for faster and more reliable analysis
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a professional resume analyst. Analyze the following resume against the job description and provide a detailed JSON response with the following structure:
{
  "match_score": <number 0-100>,
  "ats_score": <number 0-100>,
  "strengths": [<list of strengths>],
  "weaknesses": [<list of weaknesses>],
  "missing_skills": [<list of missing skills>],
  "suggestions": [<list of actionable suggestions>]
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Respond ONLY with valid JSON, no other text.`,
                  },
                ],
              },
            ],
            generationConfig: {
              response_mime_type: "application/json",
            }
          }),
        },
      ).then((res) => res.json());

      if (response.error) {
        console.error("Gemini API error:", response.error);
        return this.getMockAnalysis(resumeText, jobDescription);
      }

      // Extract JSON from response
      let content = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        return this.getMockAnalysis(resumeText, jobDescription);
      }

      let analysis;
      try {
        analysis = JSON.parse(content);
      } catch (e) {
        // Fallback: search for JSON block
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('Invalid AI response format');
        }
      }

      return {
        match_score: typeof analysis.match_score === 'number' ? analysis.match_score : 50,
        ats_score: typeof analysis.ats_score === 'number' ? analysis.ats_score : 50,
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
        weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
        missing_skills: Array.isArray(analysis.missing_skills) ? analysis.missing_skills : [],
        suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : [],
      };
    } catch (error) {
      console.error("Error analyzing resume:", error);
      return this.getMockAnalysis(resumeText, jobDescription);
    }
  },

  // Mock analysis for demonstration
  async getMockAnalysis(
    resumeText: string,
    jobDescription: string,
  ): Promise<ReportAnalysis> {
    return {
      match_score: 75,
      ats_score: 80,
      strengths: ["Clean contact information", "Clear job history"],
      weaknesses: ["Missing specific domain keywords", "Formatting could be tighter"],
      missing_skills: ["Advanced AI knowledge", "Custom framework experience"],
      suggestions: ["Add more metrics to your achievements", "Optimize for role-specific keywords"],
    };
  },
};
