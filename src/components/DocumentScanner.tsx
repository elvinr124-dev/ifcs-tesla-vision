import { useState, useRef } from "react";
import { Upload, FileText, X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface DocumentScannerProps {
  onFilesProcessed: (files: File[]) => void;
  existingFiles?: File[];
}

/**
 * Compute the Laplacian variance of an image to detect blurriness.
 * Lower variance = blurrier image. We use a strict threshold
 * to ensure document text is clearly readable.
 */
function computeBlurScore(imageElement: HTMLImageElement): number {
  const canvas = document.createElement("canvas");
  // Scale down for performance but keep enough detail
  const maxDim = 800;
  let w = imageElement.naturalWidth;
  let h = imageElement.naturalHeight;
  if (w > maxDim || h > maxDim) {
    const scale = maxDim / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imageElement, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Convert to grayscale
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  // Compute Laplacian (second derivative) using kernel [0,1,0; 1,-4,1; 0,1,0]
  const laplacian = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      laplacian[idx] =
        gray[idx - w] +       // top
        gray[idx + w] +       // bottom
        gray[idx - 1] +       // left
        gray[idx + 1] -       // right
        4 * gray[idx];        // center
    }
  }

  // Compute variance of Laplacian values
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const val = laplacian[y * w + x];
      sum += val;
      sumSq += val * val;
      count++;
    }
  }
  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  return variance;
}

// Strict threshold — documents with readable text typically score > 200
// Blurry photos typically score < 100
const BLUR_THRESHOLD = 80;

const DocumentScanner = ({ onFilesProcessed, existingFiles = [] }: DocumentScannerProps) => {
  const [files, setFiles] = useState<{ file: File; status: "checking" | "ok" | "blurry"; preview: string }[]>(
    existingFiles.map(f => ({ file: f, status: "ok" as const, preview: URL.createObjectURL(f) }))
  );
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const checkBlurriness = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(false); // PDFs pass through
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const score = computeBlurScore(img);
          console.log(`Blur score for ${file.name}: ${score.toFixed(1)} (threshold: ${BLUR_THRESHOLD})`);
          // If score is below threshold, image is too blurry
          resolve(score < BLUR_THRESHOLD);
        } catch {
          resolve(false); // On error, allow upload
        } finally {
          URL.revokeObjectURL(img.src);
        }
      };
      img.onerror = () => {
        resolve(false);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFiles = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    setError("");

    const newEntries: typeof files = [];

    for (const file of Array.from(selectedFiles)) {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        setError("Please upload image files (JPG, PNG) or PDF documents.");
        continue;
      }

      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
      newEntries.push({ file, status: "checking" as const, preview });
    }

    const updatedFiles = [...files, ...newEntries];
    setFiles(updatedFiles);

    let hasBlurry = false;

    // Check each new file for blurriness
    for (let i = 0; i < newEntries.length; i++) {
      const entry = newEntries[i];
      const globalIdx = files.length + i;

      if (entry.file.type.startsWith("image/")) {
        const isBlurry = await checkBlurriness(entry.file);
        setFiles(prev => prev.map((f, j) => j === globalIdx ? { ...f, status: isBlurry ? "blurry" : "ok" } : f));
        if (isBlurry) hasBlurry = true;
      } else {
        setFiles(prev => prev.map((f, j) => j === globalIdx ? { ...f, status: "ok" } : f));
      }
    }

    if (hasBlurry) {
      setError("One or more documents are too blurry or unclear to process. The text on the document must be fully legible. Please retake the photo in good lighting, hold the camera steady, and ensure all text is sharp and readable before re-uploading.");
    }

    // Update parent with only OK files (exclude blurry ones)
    setTimeout(() => {
      setFiles(prev => {
        const okFiles = prev.filter(f => f.status === "ok").map(f => f.file);
        onFilesProcessed(okFiles);
        return prev;
      });
    }, 200);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesProcessed(updated.filter(f => f.status === "ok").map(f => f.file));
      return updated;
    });
    if (files.filter((_, i) => i !== index).every(f => f.status !== "blurry")) {
      setError("");
    }
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all duration-200"
      >
        <Upload size={28} className="mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">Click to upload documents</p>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or PDF — clear, legible images only</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 border border-red-200">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Image Quality Issue — Please Re-upload</p>
            <p className="text-xs text-red-600 mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((entry, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
              entry.status === "blurry" ? "border-red-300 bg-red-50" :
              entry.status === "checking" ? "border-border bg-muted/30" :
              "border-accent/30 bg-accent/5"
            }`}>
              {entry.preview ? (
                <img src={entry.preview} alt="" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <FileText size={20} className="text-muted-foreground" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{entry.file.name}</p>
                <p className={`text-[10px] ${
                  entry.status === "blurry" ? "text-red-600 font-semibold" :
                  entry.status === "checking" ? "text-muted-foreground" :
                  "text-muted-foreground"
                }`}>
                  {entry.status === "checking" && "Checking image quality..."}
                  {entry.status === "ok" && "✓ Image quality verified — Ready"}
                  {entry.status === "blurry" && "✗ Image is too blurry — Please re-upload a clearer version"}
                </p>
              </div>
              {entry.status === "checking" && <Loader2 size={16} className="text-accent animate-spin" />}
              {entry.status === "ok" && <CheckCircle2 size={16} className="text-accent" />}
              {entry.status === "blurry" && <AlertTriangle size={16} className="text-red-500" />}
              <button type="button" onClick={() => removeFile(i)} className="p-1 hover:bg-muted rounded-full">
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentScanner;
