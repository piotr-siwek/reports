'use client';

import React, { useState, useEffect } from 'react';
import { ReportPreviewDto } from '@/types'; // Using @ alias assuming it maps to src/

// Define the structure for the content being edited
export interface EditorContent {
  summary: string;
  conclusions: string;
  keyData: string;
}

interface RichTextEditorProps {
  initialContent: ReportPreviewDto | null;
  onChange: (content: EditorContent) => void;
  readOnly?: boolean;
}

// Basic placeholder Rich Text Editor using textareas
const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent, onChange, readOnly = false }) => {
  const [summary, setSummary] = useState('');
  const [conclusions, setConclusions] = useState('');
  const [keyData, setKeyData] = useState('');

  // Update state when initialContent changes (e.g., after generation)
  useEffect(() => {
    if (initialContent) {
      setSummary(initialContent.summary || '');
      setConclusions(initialContent.conclusions || '');
      setKeyData(initialContent.keyData || '');
    } else {
      // Clear fields if initialContent is null
      setSummary('');
      setConclusions('');
      setKeyData('');
    }
  }, [initialContent]);

  // Propagate changes upwards whenever local state changes
  useEffect(() => {
    // Avoid calling onChange on initial mount if initialContent was null
    // Also check if the actual content differs from initialContent before calling onChange
    // This prevents unnecessary updates if the user hasn't actually changed anything.
    const currentContent = { summary, conclusions, keyData };
    if (initialContent !== null || summary || conclusions || keyData) {
      // Simple check if content actually changed from initial state (if initial existed)
      const initial = initialContent ? { summary: initialContent.summary, conclusions: initialContent.conclusions, keyData: initialContent.keyData } : null;
      if (!initial || JSON.stringify(initial) !== JSON.stringify(currentContent)) {
         onChange(currentContent);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary, conclusions, keyData, initialContent]); // Add initialContent to deps, still exclude onChange

  return (
    <div className="space-y-4 border p-4 rounded-md shadow-sm bg-white">
      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
          Podsumowanie
        </label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={5}
          className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>
      <div>
        <label htmlFor="conclusions" className="block text-sm font-medium text-gray-700 mb-1">
          Wnioski
        </label>
        <textarea
          id="conclusions"
          value={conclusions}
          onChange={(e) => setConclusions(e.target.value)}
          rows={5}
          className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>
      <div>
        <label htmlFor="keyData" className="block text-sm font-medium text-gray-700 mb-1">
          Kluczowe Dane
        </label>
        <textarea
          id="keyData"
          value={keyData}
          onChange={(e) => setKeyData(e.target.value)}
          rows={5}
          className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>
    </div>
  );
};

export default RichTextEditor; 