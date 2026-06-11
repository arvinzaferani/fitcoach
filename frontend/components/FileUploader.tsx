"use client";

import { cn } from "@/lib/utils";

interface FileUploaderProps {
  id: string;
  label: string;
  accept?: string;
  helpText?: string;
  file: File | null;
  disabled?: boolean;
  maxSizeBytes?: number;
  onChange: (file: File | null) => void;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(kilobytes >= 100 ? 0 : 1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

export function FileUploader({
  id,
  label,
  accept = "image/gif",
  helpText,
  file,
  disabled = false,
  maxSizeBytes,
  onChange,
}: FileUploaderProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className={cn(
          "rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800",
          disabled && "cursor-not-allowed opacity-60",
        )}
      />
      {helpText ? <p className="text-xs text-slate-500 dark:text-slate-300">{helpText}</p> : null}
      {file ? (
        <p className="text-xs text-slate-500 dark:text-slate-300">
          انتخاب شده: {file.name} ({formatFileSize(file.size)})
          {maxSizeBytes ? ` • حداکثر ${formatFileSize(maxSizeBytes)}` : ""}
        </p>
      ) : null}
    </div>
  );
}
