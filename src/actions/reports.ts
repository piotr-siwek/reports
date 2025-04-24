'use server';

import { z } from 'zod';
import {
  GenerateReportCommand,
  ReportPreviewDto,
  CreateReportCommand,
  CreateReportResponseDto,
  ReportDto,
} from '@/types';
// Use correct Supabase client import
import { createClient } from '@/lib/supabase-server';

// Helper type for errors with a potential status property
// interface ApiError extends Error { // No longer needed as apiClient is removed
//   status?: number;
// }

// // Placeholder apiClient removed as it's no longer used
// async function apiClient<T>(method: string, path: string, body?: unknown): Promise<T> { ... }

// --- OpenAI Generation --- //

const OpenAIResponseSchema = z.object({
  summary: z.string(),
  conclusions: z.string().or(z.array(z.string())),
  keyData: z.string(),
});

export async function generateReportPreview(
  command: GenerateReportCommand
): Promise<{ success: boolean; data?: ReportPreviewDto; error?: string }> {
  const validation = z.object({ originalText: z.string().min(100) }).safeParse(command);

  if (!validation.success) {
    return { success: false, error: "Tekst źródłowy musi mieć co najmniej 100 znaków." };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OpenAI API key is not configured.");
    return { success: false, error: "Konfiguracja AI nie jest dostępna." };
  }

  const prompt = `
You are an analytical assistant. Your task is to analyze the text below and return a JSON object with exactly three keys:
  • "summary" (string): a concise summary of the text,
  • "conclusions" (array of strings): a list of key conclusions,
  • "keyData" (string): a single string containing ONLY all critical data points, separated by dashes or commas.

In particular, do NOT omit any information related to:
  - dates (day, month, year, or time ranges),
  - amounts (including currency and units),
  - tasks and actions ("what needs to be done"),
  - decisions to be made,
  - deadlines,
  - people, departments, or roles responsible for decisions,
  - locations,
  - reference numbers or identifiers,
  - execution conditions, requirements, or KPIs.

Text to analyze:
---
${command.originalText}
---

**The response MUST be a valid JSON object and MUST be written in Polish.**  
No additional text or comments are allowed—only the JSON.`;

  

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: prompt }],
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`, errorBody);
      return { success: false, error: `Błąd podczas komunikacji z AI (${response.status}). Spróbuj ponownie.` };
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      console.error("OpenAI response missing content:", result);
      return { success: false, error: "AI nie zwróciło oczekiwanej treści." };
    }

    let parsedContentJson;
    try {
        parsedContentJson = JSON.parse(content);
    } catch (parseError) {
        console.error("Failed to parse JSON from OpenAI response:", content, parseError);
        return { success: false, error: "AI zwróciło nieprawidłowy format danych." };
    }

    const validationResult = OpenAIResponseSchema.safeParse(parsedContentJson);
    if (!validationResult.success) {
      console.error("OpenAI response validation failed AFTER prompt update:", validationResult.error.errors, parsedContentJson);
      const keyDataError = validationResult.error.errors.find(e => e.path.includes('keyData'));
      if (keyDataError) {
           return { success: false, error: `AI zwróciło nieprawidłowy format dla Kluczowych Danych (oczekiwano tekstu): ${keyDataError.message}` };
      }
      return { success: false, error: "AI zwróciło niekompletne lub nieprawidłowe dane." };
    }

    // Normalize the conclusions field to an array
    const rawConclusions = validationResult.data.conclusions;
    const conclusionsArray = Array.isArray(rawConclusions) ? rawConclusions : [rawConclusions];
    const previewData: ReportPreviewDto = {
      originalText: command.originalText,
      summary: validationResult.data.summary,
      conclusions: conclusionsArray,
      keyData: validationResult.data.keyData,
    };

    return { success: true, data: previewData };

  } catch (error: unknown) {
    console.error("Error calling OpenAI API:", error);
    const message = error instanceof Error ? error.message : "Nieznany błąd";
    return { success: false, error: `Wystąpił nieoczekiwany błąd podczas generowania raportu: ${message}` };
  }
}

// --- Supabase Saving --- //

export async function saveReport(
  command: CreateReportCommand
): Promise<{ success: boolean; data?: CreateReportResponseDto; error?: string }> {

  // Add debug logging
  console.log("SaveReport received command:", JSON.stringify(command, null, 2));

  // Enhanced validation with better error messages
  const validation = z.object({
    title: z.string().min(1, "Tytuł jest wymagany."),
    originalText: z.string().min(1, "Tekst źródłowy jest wymagany."),
    summary: z.string().min(1, "Podsumowanie jest wymagane."),
    conclusions: z.union([
      z.string().min(1, "Wnioski są wymagane."),
      z.array(z.string()).min(1, "Wnioski są wymagane.")
    ]),
    keyData: z.string().min(1, "Kluczowe dane są wymagane."),
  }).safeParse(command);

  if (!validation.success) {
    const formattedErrors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
    console.error("Validation errors:", formattedErrors);
    return { success: false, error: `Błąd walidacji przed zapisem:\n${formattedErrors}` };
  }

  // --- Supabase Integration ---
  let supabase;
  let userId: string;

  try {
    supabase = await createClient(); 
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated.');
    userId = user.id;

  } catch (error: unknown) {
    console.error("Supabase auth error:", error);
    const message = error instanceof Error ? error.message : "Unknown auth error";
    return { success: false, error: `Błąd autoryzacji: ${message}` };
  }

  // Normalize conclusions format if it's an array
  const conclusionsForDB = Array.isArray(command.conclusions) 
    ? command.conclusions.join('\n- ') 
    : command.conclusions;

  // Prepare data for insertion using the user ID directly
  const reportDataToInsert = {
    user_id: userId, // Use the Supabase auth user ID directly
    title: command.title.trim(),
    original_text: command.originalText,
    summary: command.summary.trim(),
    conclusions: conclusionsForDB,
    key_data: command.keyData.trim(),
  };

  try {
    console.log("Inserting report to DB:", reportDataToInsert);
    
    // Insert the report data
    const { data: insertedReport, error: insertError } = await supabase
      .from('reports') 
      .insert(reportDataToInsert) 
      .select() 
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return { success: false, error: `Błąd zapisu do bazy danych: ${insertError.message}` };
    }

    if (!insertedReport) {
      return { success: false, error: "Nie udało się pobrać zapisanego raportu z bazy danych." };
    }

    // Map the DB response to our DTO format
    const savedReportDto: ReportDto = {
      id: insertedReport.id,
      userId: insertedReport.user_id,
      title: insertedReport.title || '',
      originalText: insertedReport.original_text || '',
      summary: insertedReport.summary || '',
      conclusions: insertedReport.conclusions || '',
      keyData: insertedReport.key_data || '',
      createdAt: insertedReport.created_at,
      updatedAt: insertedReport.updated_at,
    };

    console.log("Report saved successfully:", savedReportDto.id);

    return {
      success: true,
      data: {
        message: "Raport zapisany pomyślnie.",
        report: savedReportDto,
      },
    };

  } catch (error: unknown) {
    console.error("Error saving report to Supabase:", error);
    const message = error instanceof Error ? error.message : "Nieznany błąd bazy danych";
    return { success: false, error: `Wystąpił nieoczekiwany błąd podczas zapisu: ${message}` };
  }
} 