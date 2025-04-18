'use client';

import React, { useState, useTransition, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { jsPDF } from 'jspdf'; // Uncommented

import { generateReportPreview, saveReport } from '../../actions/reports';
import { ReportPreviewDto, CreateReportCommand, GenerateReportCommand } from '../../types';
// import { useToast } from '@/components/ui/use-toast';
import LoadingIndicator from '../ui/LoadingIndicator';
import RichTextEditor, { EditorContent } from '../ui/RichTextEditor';

export default function GenerateReportForm() {
  const [sourceText, setSourceText] = useState('');
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<ReportPreviewDto | null>(null);
  const [title, setTitle] = useState('');
  const [editorContent, setEditorContent] = useState<EditorContent>({ summary: '', conclusions: '', keyData: '' });
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const router = useRouter();
  // const { toast } = useToast();

  // PDF State and Ref uncommented and typed
  const [isPdfLibLoaded, setIsPdfLibLoaded] = useState(false);
  const jsPdfInstance = useRef<jsPDF | null>(null);

  // useEffect for dynamic import uncommented
  useEffect(() => {
    console.log("Attempting to load jsPDF...");
    import('jspdf').then((module) => {
      const JsPDF = module.default;
      jsPdfInstance.current = new JsPDF();
      setIsPdfLibLoaded(true);
      console.log("jsPDF loaded successfully.");
    }).catch(error => {
        console.error("Failed to load jsPDF dynamically:", error);
        alert("Nie udało się załadować biblioteki PDF. Pobieranie nie będzie możliwe.");
        setIsPdfLibLoaded(false);
    });
  }, []);

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
        setGeneratedContent(result.data);
        console.log('Toast placeholder: Podgląd raportu wygenerowany!');
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

    const command: CreateReportCommand = {
      title: title,
      originalText: generatedContent.originalText,
      summary: editorContent.summary,
      conclusions: editorContent.conclusions,
      keyData: editorContent.keyData,
    };

    if (!command.summary || !command.conclusions || !command.keyData) {
        setSaveError("Podsumowanie, Wnioski i Kluczowe Dane nie mogą być puste.");
        console.error('Toast placeholder: Błąd zapisu - Puste pola edytora');
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

  // PDF Download Handler (Corrected Implementation)
  const handleDownloadPdf = () => {
    if (!isPdfLibLoaded || !generatedContent || !jsPdfInstance.current) {
      console.error("PDF library not loaded or no content available.");
      alert("Funkcja pobierania PDF nie jest gotowa lub wystąpił błąd. Spróbuj ponownie za chwilę.");
      return;
    }

    const doc = jsPdfInstance.current;
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    let yPos = 20;
    const margin = 15;
    const maxWidth = (doc.internal.pageSize.width || doc.internal.pageSize.getWidth()) - margin * 2;

    // Font handling (basic - assumes default fonts support characters or requires manual setup)
    try {
        // Optional: Add font supporting Polish characters if needed and available
        // Ensure the font file is accessible, e.g., in the public folder
        // await doc.addFont('/fonts/FreeSans.ttf', 'FreeSans', 'normal'); // Example path
        // doc.setFont('FreeSans');
        console.log("Using default PDF font. Add custom font logic if needed.");
    } catch (fontError) {
        console.error("Error during PDF font setup (optional step):", fontError);
        // Don't necessarily alert here, maybe just log
    }

    // Helper function to add text safely
    const addText = (text: string, options?: object | undefined) => {
      try {
        const lines = doc.splitTextToSize(text || "(brak)", maxWidth);
        // Calculate height carefully, considering potential for empty lines array
        const dimensions = lines.length > 0 ? doc.getTextDimensions(lines) : { h: 0 }; 
        const textHeight = dimensions.h;

        if (yPos + textHeight > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
        }
        doc.text(lines, margin, yPos, options || undefined);
        yPos += textHeight + 5; // Add some spacing after the text
      } catch (textError) {
          console.error("Error adding text segment to PDF:", textError, { text });
          // Attempt to continue drawing below the error
          try { doc.text("[Błąd renderowania tekstu]", margin, yPos); } catch {/* Ignore secondary error */}
          yPos += 10; 
      }
    };

    // Generate PDF Content
    try {
      doc.setFontSize(18);
      doc.setTextColor(0); // Black
      addText(title || "Niezatytułowany Raport");
      yPos += 5;

      doc.setFontSize(14);
      doc.setTextColor(100); // Grey
      addText("Podsumowanie:");
      doc.setFontSize(11);
      doc.setTextColor(0); // Black
      addText(editorContent.summary);

      doc.setFontSize(14);
      doc.setTextColor(100);
      addText("Wnioski:");
      doc.setFontSize(11);
      doc.setTextColor(0);
      addText(editorContent.conclusions);

      doc.setFontSize(14);
      doc.setTextColor(100);
      addText("Kluczowe Dane:");
      doc.setFontSize(11);
      doc.setTextColor(0);
      addText(editorContent.keyData);

      // Save the PDF
      const filename = (title || 'raport').replace(/[^a-z0-9\-_]/gi, '_') + '.pdf'; // Allow hyphens and underscores
      doc.save(filename);

    } catch (generationError) {
        console.error("Error during PDF generation process:", generationError);
        alert("Wystąpił błąd podczas generowania pliku PDF.");
    }
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
            {/* PDF Download Button (Re-enabled) */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              title={!isPdfLibLoaded ? "Biblioteka PDF się ładuje..." : "Pobierz raport jako PDF"}
               className="inline-flex items-center justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* TODO: Add PDF icon */}
              Pobierz PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}