import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extension from stored media path, e.g. materials/vi/2025/abc.pdf → PDF */
export function fileExtensionFromPath(storedPath: string | null | undefined): string | null {
  if (!storedPath?.trim()) return null;
  const base = storedPath.split(/[/\\]/).pop() || '';
  const dot = base.lastIndexOf('.');
  if (dot <= 0 || dot >= base.length - 1) return null;
  const ext = base
    .slice(dot + 1)
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 12);
  return ext ? ext.toUpperCase() : null;
}

/** Format `file_size_mb` from API (already in MB). */
export function formatFileSizeMb(mb: number | null | undefined): string | null {
  if (mb == null || Number.isNaN(Number(mb))) return null;
  const n = Number(mb);
  if (!Number.isFinite(n) || n < 0) return null;
  return `${n.toFixed(2)} MB`;
}

/** MB from DB → hiển thị MB hoặc GB khi ≥ 1024 MB (ví dụ 5120 MB → 5 GB). */
export function formatFileSizeFromMb(mb: number | null | undefined): string | null {
  if (mb == null || Number.isNaN(Number(mb))) return null;
  const n = Number(mb);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n >= 1024) {
    const gb = n / 1024;
    const s = gb >= 10 ? gb.toFixed(1) : gb.toFixed(2);
    return `${s.replace(/\.?0+$/, '')} GB`;
  }
  const s = n.toFixed(2);
  return `${s.replace(/\.?0+$/, '')} MB`;
}
