import { PDFDocument } from "pdf-lib";

const COMPRESS_THRESHOLD = 2 * 1024 * 1024; // try compression if > 2MB
export const MAX_PDF_BYTES  = 5 * 1024 * 1024; // hard limit 5MB

/**
 * Attempts to reduce PDF size via pdf-lib object-stream compression.
 * Effective for text-heavy PDFs; returns the smaller of original vs compressed.
 * Returns null if the result still exceeds MAX_PDF_BYTES.
 */
export async function compressPdf(file: File): Promise<{ file: File; compressed: boolean } | null> {
  let candidate = file;

  if (file.size > COMPRESS_THRESHOLD) {
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const out  = await doc.save({ useObjectStreams: true });
      const compressedFile = new File([out], file.name, { type: "application/pdf" });
      // Only use the compressed version if it's actually smaller
      if (compressedFile.size < file.size) candidate = compressedFile;
    } catch {
      // leave candidate = original file
    }
  }

  if (candidate.size > MAX_PDF_BYTES) return null;
  return { file: candidate, compressed: candidate !== file };
}
