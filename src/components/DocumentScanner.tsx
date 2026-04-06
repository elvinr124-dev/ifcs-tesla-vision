import { useState, useRef } from "react";
import { Upload, FileText, X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentScannerProps {
  onFilesProcessed: (files: File[]) => void;
  existingFiles?: File[];
}

const DocumentScanner = ({ onFilesProcessed, existingFiles = [] }: DocumentScannerProps) => {
  const [files, setFiles] = useState<{ file: File; status: "checking" | "ok" | "blurry"; preview: string }[]>(
    existingFiles.map(f => ({ file: f, status: "ok" as const, preview: URL.createObjectURL(f) }))
  );
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const checkBlurriness = async (file: File): Promise<boolean> => {
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: { imageBase64: base64, fileName: file.name },
      });

      if (error) return false; // If analysis fails, allow the upload
      return data?.isBlurry === true;
    } catch {
      return false; // On error, allow upload
    }
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
      const entry = { file, status: "checking" as const, preview };
      newEntries.push(entry);
    }

    const updatedFiles = [...files, ...newEntries];
    setFiles(updatedFiles);

    // Check each new file for blurriness
    for (let i = 0; i < newEntries.length; i++) {
      const entry = newEntries[i];
      if (entry.file.type.startsWith("image/")) {
        const isBlurry = await checkBlurriness(entry.file);
        const idx = files.length + i;
        setFiles(prev => prev.map((f, j) => j === idx ? { ...f, status: isBlurry ? "blurry" : "ok" } : f));
        if (isBlurry) {
          setError("One or more images appear blurry or unclear. Please re-upload a clearer photo.");
        }
      } else {
        // PDFs pass through
        const idx = files.length + i;
        setFiles(prev => prev.map((f, j) => j === idx ? { ...f, status: "ok" } : f));
      }
    }

    // Update parent with only OK files
    setTimeout(() => {
      setFiles(prev => {
        const okFiles = prev.filter(f => f.status === "ok").map(f => f.file);
        onFilesProcessed(okFiles);
        return prev;
      });
    }, 100);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesProcessed(updated.filter(f => f.status === "ok").map(f => f.file));
      return updated;
    });
    setError("");
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
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20">
          <AlertTriangle size={16} className="text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-destructive font-medium">{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((entry, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
              entry.status === "blurry" ? "border-destructive/40 bg-destructive/5" :
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
                <p className="text-[10px] text-muted-foreground">
                  {entry.status === "checking" && "Checking image quality..."}
                  {entry.status === "ok" && "Ready"}
                  {entry.status === "blurry" && "Image is blurry or unclear — please re-upload"}
                </p>
              </div>
              {entry.status === "checking" && <Loader2 size={16} className="text-accent animate-spin" />}
              {entry.status === "ok" && <CheckCircle2 size={16} className="text-accent" />}
              {entry.status === "blurry" && <AlertTriangle size={16} className="text-destructive" />}
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
