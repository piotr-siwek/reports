'use client';

import React, { useState, useEffect } from 'react';
import { ReportPreviewDto } from '@/types'; // Using @ alias assuming it maps to src/

// Define the structure for the content being edited
export interface EditorContent {
  summary: string;
  conclusions: string | string[];
  keyData: string;
}

interface RichTextEditorProps {
  initialContent: ReportPreviewDto | null;
  onChange: (content: EditorContent) => void;
  readOnly?: boolean;
}

// Format conclusions for display, handling both string and array
const formatConclusionsForDisplay = (conclusions: string | string[] | undefined): string => {
  if (!conclusions) return '';
  if (typeof conclusions === 'string') return conclusions;
  // Format array as bullet points
  return conclusions.join('\n- ');
};

// Basic placeholder Rich Text Editor using textareas
const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent, onChange, readOnly = false }) => {
  const [summary, setSummary] = useState('');
  const [conclusions, setConclusions] = useState('');
  const [keyData, setKeyData] = useState('');

  // Update state when initialContent changes (e.g., after generation)
  useEffect(() => {
    if (initialContent) {
      console.log("RichTextEditor received initialContent:", initialContent);
      const summaryValue = initialContent.summary || '';
      const formattedConclusions = formatConclusionsForDisplay(initialContent.conclusions);
      const keyDataValue = initialContent.keyData || '';
      
      setSummary(summaryValue);
      setConclusions(formattedConclusions);
      setKeyData(keyDataValue);
      
      // Immediately notify parent component of content changes
      onChange({
        summary: summaryValue,
        // Keep original format for data model (string or array)
        conclusions: initialContent.conclusions || '',
        keyData: keyDataValue
      });
    } else {
      // Clear fields if initialContent is null
      setSummary('');
      setConclusions('');
      setKeyData('');
    }
  }, [initialContent, onChange]);

  // Handle user changes to conclusions text
  const handleConclusionsChange = (text: string) => {
    setConclusions(text);
    
    // If text contains line breaks with bullet points, convert to array
    if (text.includes('\n-')) {
      const lines = text.split('\n-').map(line => line.trim());
      // First line doesn't have a bullet
      const firstLine = lines.shift() || '';
      // If first line is not empty, add it as first item
      const conclusionsArray = firstLine ? [firstLine] : [];
      // Add the rest (which had bullet points)
      conclusionsArray.push(...lines.filter(line => line));
      
      onChange({
        summary,
        conclusions: conclusionsArray.length > 0 ? conclusionsArray : text,
        keyData
      });
    } else {
      // Regular text without bullet points
      onChange({
        summary,
        conclusions: text,
        keyData
      });
    }
  };

  return (
    <div className="space-y-4 border p-4 rounded-md shadow-sm bg-white">
      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
          Podsumowanie
        </label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => {
            const value = e.target.value;
            setSummary(value);
            onChange({ summary: value, conclusions, keyData });
          }}
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
          onChange={(e) => handleConclusionsChange(e.target.value)}
          rows={5}
          className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          readOnly={readOnly}
          disabled={readOnly}
          placeholder="Wpisz wnioski, każdy w nowej linii poprzedzony myślnikiem (-)."
        />
      </div>
      <div>
        <label htmlFor="keyData" className="block text-sm font-medium text-gray-700 mb-1">
          Kluczowe Dane
        </label>
        <textarea
          id="keyData"
          value={keyData}
          onChange={(e) => {
            const value = e.target.value;
            setKeyData(value);
            onChange({ summary, conclusions, keyData: value });
          }}
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