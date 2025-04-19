'use server';

import { z } from 'zod';
import {
  GenerateReportCommand,
  ReportPreviewDto,
  CreateReportCommand,
  CreateReportResponseDto,
  ReportDto,
} from '@/types';
// Use correct Supabase client import based on provided file
// import { createClient } from '@/lib/supabase-server'; // Commented out AGAIN - Fix DB types/schema mismatch

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
  - tasks and actions (“what needs to be done”),
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

    const previewData: ReportPreviewDto = {
      originalText: command.originalText,
      summary: validationResult.data.summary,
      conclusions: validationResult.data.conclusions,
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

  const validation = z.object({
    title: z.string().min(1, "Tytuł jest wymagany."),
    originalText: z.string().min(1),
    summary: z.string().min(1),
    conclusions: z.string().min(1),
    keyData: z.string().min(1),
  }).safeParse(command);

  if (!validation.success) {
    const formattedErrors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
    return { success: false, error: `Błąd walidacji przed zapisem:\n${formattedErrors}` };
  }

  // --- Supabase Integration (Commented Out - Requires Correct DB Types/Schema) ---
  /*
  let supabase;
  let numericUserId: number | undefined;

  try {
    supabase = await createClient(); 
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated.');
    const authUserId = user.id; 

    // TODO: Verify 'profiles' table name and columns ('id', 'user_id') are correct in your DB and generated types
    const { data: profile, error: profileError } = await supabase
      .from('profiles') // This caused error if 'profiles' not in generated types
      .select('id')      
      .eq('user_id', authUserId) 
      .single();

    if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw new Error('Could not fetch user profile information.');
    }
    if (!profile) {
        console.error(`Profile not found for auth user ID: ${authUserId}`);
        throw new Error('User profile not found.');
    }

    numericUserId = profile.id; 

  } catch (error: unknown) {
      console.error("Supabase auth/profile error:", error);
      const message = error instanceof Error ? error.message : "Unknown auth/profile error";
      return { success: false, error: `Błąd autoryzacji lub profilu użytkownika: ${message}` };
  }

  // Prepare data for insertion using the numeric user ID
  const reportDataToInsert = {
    user_id: numericUserId, // Use the numeric ID here
    title: command.title,
    original_text: command.originalText,
    summary: command.summary,
    conclusions: command.conclusions,
    key_data: command.keyData,
  };

  try {
    // TODO: Verify 'reports' table name and columns are correct in your DB and generated types
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

    // Mapping DB response (user_id should be number)
    // TODO: Ensure 'title' exists in insertedReport type after regenerating DB types
    const savedReportDto: ReportDto = {
      id: insertedReport.id,
      userId: insertedReport.user_id, // Should be number
      title: insertedReport.title ?? '', // This caused error if 'title' not in generated types
      originalText: insertedReport.original_text ?? '',
      summary: insertedReport.summary ?? '',
      conclusions: insertedReport.conclusions ?? '',
      keyData: insertedReport.key_data ?? '',
      createdAt: insertedReport.created_at,
      updatedAt: insertedReport.updated_at,
    };

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
  */

  // --- Placeholder response until Supabase is integrated (Re-added) ---
  console.warn("Supabase saving is commented out. Verify DB schema, regenerate types, and uncomment. Returning mock success.");
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
   const mockSavedReport: ReportDto = {
      id: Math.floor(Math.random() * 1000),
      userId: 1, // Placeholder numeric user ID
      title: command.title,
      originalText: command.originalText,
      summary: command.summary,
      conclusions: command.conclusions,
      keyData: command.keyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  return {
      success: true,
      data: {
        message: "Raport zapisany pomyślnie (MOCK).",
        report: mockSavedReport,
      },
    };
  // --- End Placeholder ---
} 