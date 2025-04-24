// Placeholder for RichTextEditor component
'use client';

import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  readOnly?: boolean;
}

// Format array or string to display text with dashes
function formatContentForDisplay(value: string | string[] | undefined): string {
  if (!value) return '';
  
  // If it's an array, format as bullet points
  if (Array.isArray(value)) {
    return '- ' + value.join('\n- ');
  }
  
  // If it's a string with commas and no line breaks, convert to bullet list
  if (typeof value === 'string' && value.includes(',') && !value.includes('\n')) {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    return '- ' + items.join('\n- ');
  }
  
  // Add dash to first line if needed
  if (typeof value === 'string' && value.includes('\n') && !value.startsWith('-')) {
    return '- ' + value.replace(/\n(?!-)/g, '\n- ');
  }
  
  // If it's a single line without dash, add it
  if (typeof value === 'string' && !value.startsWith('-') && value.trim().length > 0) {
    return '- ' + value;
  }
  
  // Return as is for other cases
  return value;
}

// Convert display text back to array or string for storage
function parseDisplayContent(text: string): string | string[] {
  if (!text.trim()) return '';
  
  // If it has bullet points, convert to array
  if (text.includes('\n-') || text.startsWith('-')) {
    // Split by newline and dash
    const lines = text.startsWith('-') 
      ? [text] 
      : text.split('\n').filter(line => line.trim().length > 0);
    
    // Process each line to remove dash prefix
    return lines.map(line => {
      if (line.startsWith('-')) {
        return line.substring(1).trim();
      }
      return line.trim();
    }).filter(item => item.length > 0);
  }
  
  // Return as is for plain text
  return text;
}

export default function RichTextEditor({ value, onChange, readOnly = false }: RichTextEditorProps) {
  // State for display text in textarea
  const [displayText, setDisplayText] = useState('');
  
  // Format value for display when component mounts or value changes
  useEffect(() => {
    const formattedText = formatContentForDisplay(value);
    setDisplayText(formattedText);
  }, [value]);
  
  // Handle user changes to text
  const handleTextChange = (newText: string) => {
    setDisplayText(newText);
    const parsedContent = parseDisplayContent(newText);
    onChange(parsedContent);
  };
  
  return (
    <textarea
      value={displayText}
      onChange={(e) => handleTextChange(e.target.value)}
      rows={10}
      className="w-full p-2 border rounded mt-1 bg-background text-foreground placeholder:text-muted-foreground"
      placeholder="Wpisz treść, każdy element w nowej linii poprzedzony myślnikiem (-)"
      readOnly={readOnly}
      disabled={readOnly}
    />
  );
} 