'use client';

import React, { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportDocument from './ReportDocument';

import { generateReportPreview, saveReport } from '../../actions/reports';
import { ReportGenerateDto, CreateReportCommand, GenerateReportCommand } from '../../types';
// import { useToast } from '@/components/ui/use-toast';
import LoadingIndicator from '../ui/LoadingIndicator';
import RichTextEditor, { EditorContent } from '../ui/RichTextEditor';

export default function GenerateReportForm() {
  const [sourceText, setSourceText] = useState('');
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<ReportGenerateDto | null>(null);
  const [title, setTitle] = useState('');
  const [editorContent, setEditorContent] = useState<EditorContent>({ summary: '', conclusions: '', keyData: '' });
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const router = useRouter();
  // const { toast } = useToast();

  const handleEditorChange = useCallback((content: EditorContent) => {
    setEditorContent(content);
  }, []);

  const handleGenerate = () => {
    setGenerateError(null);
    setGeneratedContent(null);
    setTitle('');
    setSaveError(null);
    setEditorContent({ summary: '', conclusions: '', keyData: '' });

    const command: GenerateReportCommand = { originalText: sourceText };

    startGenerating(async () => {
      const result = await generateReportPreview(command);
      if (result.success && result.data) {
        // Log successful generation
        console.log('Generated Report Data:', result.data);

        // Process data to ensure correct formatting
        // Ensure conclusions are properly formatted
        let formattedConclusions = result.data.conclusions;
        if (Array.isArray(formattedConclusions)) {
          // Make sure each item doesn't start with a dash (will be added by the display formatter)
          formattedConclusions = formattedConclusions.map(item => 
            item.startsWith('-') ? item.substring(1).trim() : item
          );
        }

        // Ensure keyData is properly formatted
        let formattedKeyData = result.data.keyData;
        console.log("@", result.data.keyData)
        if (Array.isArray(formattedKeyData)) {
          // Make sure each item doesn't start with a dash (will be added by the display formatter)
          formattedKeyData = formattedKeyData.map(item => 
            item.startsWith('-') ? item.substring(1).trim() : item
          ) as string[];
          console.log({formattedKeyData})
        }
      

        // Store the generated content with properly formatted data
        setGeneratedContent({
          ...result.data,
          conclusions: formattedConclusions,
          keyData: formattedKeyData
        });
        
        // Update editor content with generated data
        setEditorContent({
          summary: result.data.summary,
          conclusions: formattedConclusions,
          keyData: formattedKeyData
        });
        
        // Default title from first sentence of summary (up to 50 chars)
        const firstSentence = result.data.summary.split('.')[0];
        const defaultTitle = firstSentence.length > 50 
          ? firstSentence.substring(0, 47) + '...' 
          : firstSentence;
        setTitle(defaultTitle);

        console.log('Toast placeholder: Podgląd raportu wygenerowany!');
        console.log('Editor content after generation:', {
          summary: result.data.summary,
          conclusions: formattedConclusions,
          keyData: formattedKeyData
        });
      } else {
        setGenerateError(result.error || 'Nieznany błąd podczas generowania.');
        console.error('Toast placeholder: Błąd generowania', result.error);
      }
    });
  };

  const handleSave = () => {
    if (!generatedContent) {
      setSaveError("Cannot save without generated content.");
      console.error('Toast placeholder: Błąd zapisu - Najpierw wygeneruj raport.');
      return;
    }
    setSaveError(null);

    // Debug logs to check the state
    console.log("Editor Content:", editorContent);
    console.log("Generated Content:", generatedContent);
    console.log("Title:", title);

    const command: CreateReportCommand = {
      title: title,
      originalText: generatedContent.originalText,
      summary: editorContent.summary,
      conclusions: editorContent.conclusions,
      keyData: editorContent.keyData,
    };

    console.log("Command to save:", command);

    // Simplified validation - just check if any content field is falsy
    if (!title.trim()) {
      setSaveError("Tytuł raportu nie może być pusty.");
      console.error('Toast placeholder: Błąd zapisu - Pusty tytuł');
      return;
    }

    // Ensure we have non-empty content in all required fields
    if (!editorContent.summary.trim()) {
      setSaveError("Podsumowanie nie może być puste.");
      return;
    }

    // For conclusions - handle both string and array types
    const hasConclusions = typeof editorContent.conclusions === 'string' 
      ? editorContent.conclusions.trim().length > 0
      : Array.isArray(editorContent.conclusions) && editorContent.conclusions.length > 0;
    
    if (!hasConclusions) {
      setSaveError("Wnioski nie mogą być puste.");
      return;
    }

    // For keyData - handle both string and array types
    const hasKeyData = typeof editorContent.keyData === 'string' 
      ? editorContent.keyData.trim().length > 0
      : Array.isArray(editorContent.keyData) && editorContent.keyData.length > 0;
    
    if (!hasKeyData) {
      setSaveError("Kluczowe Dane nie mogą być puste.");
      return;
    }

    startSaving(async () => {
      // NOTE: This uses the MOCK save action until Supabase is fixed
      const result = await saveReport(command);
      if (result.success && result.data) {
        console.log('Toast placeholder: Raport zapisany!', result.data.report.title);
        router.push('/reports');
      } else {
        setSaveError(result.error || 'Nieznany błąd podczas zapisywania.');
        console.error('Toast placeholder: Błąd zapisu', result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Source Text Input */}
      <div>
        <label htmlFor="sourceText" className="block text-sm font-medium text-gray-700 mb-1">
          Tekst źródłowy
        </label>
        <textarea
          id="sourceText"
          placeholder="Wklej tekst źródłowy (min. 100 znaków)"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          rows={10}
          className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          aria-describedby="sourceText-description"
          disabled={isGenerating}
        />
        <p className="mt-1 text-sm text-gray-500" id="sourceText-description">
          Minimalna długość: 100 znaków
        </p>
        {generateError && <p className="mt-1 text-sm text-red-600">{generateError}</p>}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || sourceText.trim().length < 100}
          className="mt-3 inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <><LoadingIndicator size={16} className="mr-2" /> Generowanie...</>
          ) : (
            'Generuj Raport'
          )}
        </button>
      </div>

      {/* Section 2: Results (Conditional) */}
      {generatedContent && (
        <div className="space-y-4 border-t pt-6 mt-6">
          <h2 className="text-xl font-semibold">Wygenerowany Raport</h2>
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Tytuł raportu
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Rich Text Editor Integration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Treść raportu (Podsumowanie, Wnioski, Kluczowe Dane)
            </label>
            <RichTextEditor
              initialContent={generatedContent}
              onChange={handleEditorChange}
              readOnly={isSaving}
            />
          </div>

          {saveError && <p className="mt-1 text-sm text-red-600">{saveError}</p>}
          {/* Action Buttons */}
          <div className="flex items-center space-x-3 mt-4">
            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !title.trim() || !generatedContent}
              className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <><LoadingIndicator size={16} className="mr-2" /> Zapisywanie...</>
              ) : (
                'Zapisz Raport'
              )}
            </button>
            {/* PDF Download Button replaced with PDFDownloadLink from react-pdf */}
            <PDFDownloadLink
              document={
                <ReportDocument
                  title={title}
                  summary={editorContent.summary}
                  conclusions={editorContent.conclusions}
                  keyData={editorContent.keyData}
                />
              }
              fileName={(title || 'raport').replace(/[^a-z0-9\-_]/gi, '_') + '.pdf'}
            >
              {({ loading }) => (
                <button
                  type="button"
                  title={loading ? "Tworzenie PDF..." : "Pobierz raport jako PDF"}
                  disabled={loading}
                  className="inline-flex items-center justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Tworzenie PDF..." : "Pobierz PDF"}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      )}
    </div>
  );
}