'use client';

import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/shared/RichTextEditor"; // Assuming this path
import { cn } from "@/lib/utils";

interface ReportSectionEditorProps<TFieldValues extends FieldValues> {
  label: string;
  fieldName: FieldPath<TFieldValues>; // Ensures fieldName matches the form schema
  control: Control<TFieldValues>;
  className?: string;
}

export default function ReportSectionEditor<TFieldValues extends FieldValues>({ 
  label, 
  fieldName, 
  control, 
  className 
}: ReportSectionEditorProps<TFieldValues>) {
  return (
    <div className={cn("mb-6", className)}> {/* Added margin bottom */} 
      <Controller
        name={fieldName}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <Label htmlFor={fieldName} className={cn(error ? 'text-destructive' : '')}>
              {label}
            </Label>
            <RichTextEditor
              value={field.value || ''} // Ensure value is a string
              onChange={field.onChange}
              // Consider adding aria-invalid and describedby for accessibility
            />
            {error && <p className="text-sm font-medium text-destructive mt-1">{error.message}</p>}
          </>
        )}
      />
    </div>
  );
} 