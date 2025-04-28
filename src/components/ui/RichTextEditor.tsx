'use client';

import React, { useState, useEffect } from 'react';
import { ReportGenerateDto } from '@/types'; // Using @ alias assuming it maps to src/

// Define the structure for the content being edited
export interface EditorContent {
  summary: string;
  conclusions: string | string[];
  keyData: string | string[];
}

interface RichTextEditorProps {
  initialContent: ReportGenerateDto | null;
  onChange: (content: EditorContent) => void;
  readOnly?: boolean;
}

// Format array values for display, handling both string and array
const formatArrayForDisplay = (value: string | string[] | undefined): string => {
  if (!value) return '';
  
  // If it's already an array, format it with dashes
  if (Array.isArray(value)) {
    return '- ' + value.join('\n- ');
  }
  
  // If it's a string with commas, convert to bullet points
  if (typeof value === 'string' && value.includes(',') && !value.includes('\n')) {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    return '- ' + items.join('\n- ');
  }
  
  // If it's already properly formatted with newlines or it's a simple string
  return value;
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
      const formattedConclusions = formatArrayForDisplay(initialContent.conclusions);
      const formattedKeyData = formatArrayForDisplay(initialContent.keyData);
      
      setSummary(summaryValue);
      setConclusions(formattedConclusions);
      setKeyData(formattedKeyData);
      
      // Immediately notify parent component of content changes
      onChange({
        summary: summaryValue,
        // Keep original format for data model (string or array)
        conclusions: initialContent.conclusions || '',
        keyData: initialContent.keyData || ''
      });
    } else {
      // Clear fields if initialContent is null
      setSummary('');
      setConclusions('');
      setKeyData('');
    }
  }, [initialContent, onChange]);

  // Convert textarea text with bullets to array
  const textToArray = (text: string): string | string[] => {
    // Add dash to first line if it doesn't have one and there are line breaks
    if (text.includes('\n') && !text.startsWith('-')) {
      text = '- ' + text;
    }
    
    // If text contains line breaks with bullet points, convert to array
    if (text.includes('\n-')) {
      const lines = text.split('\n-').map(line => line.trim());
      // First line might have a dash when split
      const firstLine = lines.shift() || '';
      const firstItem = firstLine.startsWith('-') ? 
        firstLine.substring(1).trim() : firstLine;
      
      // If first line is not empty, add it as first item
      const itemsArray = firstItem ? [firstItem] : [];
      // Add the rest of the items
      itemsArray.push(...lines.filter(line => line));
      
      return itemsArray.length > 0 ? itemsArray : text;
    }
    
    // Single line case - remove dash if present and return as array
    if (text.startsWith('-')) {
      return [text.substring(1).trim()];
    }
    
    // Regular text without bullet points - return as is
    return text;
  };

  // Handle user changes to conclusions text
  const handleConclusionsChange = (text: string) => {
    setConclusions(text);
    onChange({
      summary,
      conclusions: textToArray(text),
      keyData
    });
  };

  // Handle user changes to keyData text
  const handleKeyDataChange = (text: string) => {
    setKeyData(text);
    onChange({
      summary,
      conclusions,
      keyData: textToArray(text)
    });
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
          onChange={(e) => handleKeyDataChange(e.target.value)}
          rows={5}
          className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          readOnly={readOnly}
          disabled={readOnly}
          placeholder="Wpisz kluczowe dane, każda w nowej linii poprzedzona myślnikiem (-)."
        />
      </div>
    </div>
  );
};

export default RichTextEditor; 