
import { GoogleGenAI } from "@google/genai";
import { DiagnosticReport, Patient } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDiagnosticInterpretation = async (patient: Patient, report: DiagnosticReport): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    As an expert veterinary diagnostic specialist, interpret the following lab results.
    Patient: ${patient.name} (${patient.species}, ${patient.breed}, ${patient.age} years old)
    Test Type: ${report.testType}
    Results:
    ${report.parameters.map(p => `- ${p.name}: ${p.value} ${p.unit} (Ref: ${p.refRange}) - Status: ${p.status}`).join('\n')}
    
    Please provide:
    1. A concise clinical interpretation of the abnormal findings.
    2. Potential differential diagnoses.
    3. Recommended next steps or further diagnostic tests.
    
    Keep the tone professional and helpful for a veterinarian. Format in Markdown.
  `;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    return result.text || "Unable to generate interpretation.";
  } catch (error) {
    console.error("AI Interpretation Error:", error);
    return "Error generating AI interpretation. Please review results manually.";
  }
};
