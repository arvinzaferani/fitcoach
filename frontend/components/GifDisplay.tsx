"use client";

import { cn } from "@/lib/utils";
import { getMediaSrc } from "@/lib/media";
import { ImageIcon } from "lucide-react";
import { useState } from "react";

interface GifDisplayProps {
  src?: string | null;
  mediaId?: string | null;
  alt: string;
  title?: string;
  caption?: string;
  className?: string;
  frameClassName?: string;
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
  imageClassName,
  compact = false,
}: GifDisplayProps) {
  const resolvedSrc = src ?? getMediaSrc(mediaId);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <figure className={cn("overflow-hidden rounded-xl bg-[var(--background-secondary)]", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden",
          compact ? "h-16 w-16" : "h-40 w-full",
          frameClassName,
        )}
      >
        {resolvedSrc && !error ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-5 w-5 animate-pulse rounded-full bg-[var(--border)]" />
              </div>
            )}
            <img
              src={resolvedSrc}
              alt={alt}
              className={cn(
                "h-full w-full object-cover transition-opacity duration-300",
                loaded ? "opacity-100" : "opacity-0",
                imageClassName,
              )}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-[var(--text-muted)]">
            <ImageIcon size={compact ? 16 : 24} />
            {!compact && <span className="text-xs font-medium">بدون تصویر</span>}
          </div>
        )}
      </div>
      {title || caption ? (
        <figcaption className="space-y-0.5 px-3 py-2">
          {title ? <p className="text-sm font-bold text-[var(--text-primary)]">{title}</p> : null}
          {caption ? <p className="text-xs text-[var(--text-muted)]">{caption}</p> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
