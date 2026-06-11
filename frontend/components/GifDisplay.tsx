"use client";

import { cn } from "@/lib/utils";
import { getMediaSrc } from "@/lib/media";

interface GifDisplayProps {
  src?: string | null;
  mediaId?: string | null;
  alt: string;
  title?: string;
  caption?: string;
  className?: string;
  frameClassName?: string;
  mediaClassName?: string;
  placeholderClassName?: string;
  imageClassName?: string;
  compact?: boolean;
}

export function GifDisplay({
  src,
  mediaId,
  alt,
  title,
  caption,
  className,
  frameClassName,
  mediaClassName,
  placeholderClassName,
  imageClassName,
  compact = false,
}: GifDisplayProps) {
  const resolvedSrc = src ?? getMediaSrc(mediaId);

  return (
    <figure className={cn("overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800", className)}>
      <div className={cn("flex items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-700", compact ? "h-20 w-20" : "h-40 w-full", frameClassName, mediaClassName)}>
        {resolvedSrc ? <img src={resolvedSrc} alt={alt} className={cn("h-full w-full object-cover", imageClassName)} loading="lazy" /> : <span className={cn("text-xs font-bold", placeholderClassName)}>بدون GIF</span>}
      </div>
      {title || caption ? (
        <figcaption className="space-y-1 px-3 py-2">
          {title ? <p className="text-sm font-bold text-slate-700 dark:text-slate-100">{title}</p> : null}
          {caption ? <p className="text-xs text-slate-500 dark:text-slate-300">{caption}</p> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
