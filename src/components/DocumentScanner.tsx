import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle2, X, ZoomIn, RotateCw, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ScannedDocument {
  id: string;
  originalFile: File;
  originalUrl: string;
  processedUrl: string;
  fileName: string;
  status: "processing" | "done" | "error";
}

interface DocumentScannerProps {
  onFilesProcessed: (files: File[]) => void;
  existingFiles?: File[];
}

const DocumentScanner = ({ onFilesProcessed, existingFiles = [] }: DocumentScannerProps) => {
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [previewDoc, setPreviewDoc] = useState<ScannedDocument | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original
        ctx.drawImage(img, 0, 0);

        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply adaptive thresholding / contrast enhancement for scanned look
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Convert to grayscale
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          
          // Increase contrast (scanned document look)
          let enhanced = gray;
          if (gray < 128) {
            enhanced = Math.max(0, gray * 0.7);
          } else {
            enhanced = Math.min(255, gray * 1.2 + 30);
          }
          
          data[i] = enhanced;
          data[i + 1] = enhanced;
          data[i + 2] = enhanced;
        }

        ctx.putImageData(imageData, 0, 0);

        // Add slight border shadow effect
        const gradient = ctx.createLinearGradient(0, 0, 10, 0);
        gradient.addColorStop(0, "rgba(0,0,0,0.08)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 10, canvas.height);

        resolve(canvas.toDataURL("image/png"));
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const newDocs: ScannedDocument[] = files.map((file) => ({
      id: crypto.randomUUID(),
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      processedUrl: "",
      fileName: file.name,
      status: "processing" as const,
    }));

    setDocuments((prev) => [...prev, ...newDocs]);

    // Process each file
    for (const doc of newDocs) {
      try {
        const isImage = doc.originalFile.type.startsWith("image/");
        let processedUrl = doc.originalUrl;
        
        if (isImage) {
          processedUrl = await processImage(doc.originalFile);
        }

        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, processedUrl, status: "done" } : d
          )
        );
      } catch {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, status: "error" } : d
          )
        );
      }
    }

    // Pass original files to parent
    onFilesProcessed([...existingFiles, ...files]);
  }, [existingFiles, onFilesProcessed, processImage]);

  const removeDocument = (id: string) => {
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      const remainingFiles = updated.map((d) => d.originalFile);
      onFilesProcessed(remainingFiles);
      return updated;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center w-full py-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          dragOver
            ? "border-accent bg-accent/10 scale-[1.02]"
            : "border-border bg-muted/30 hover:bg-muted/50 hover:border-accent/50"
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-3">
          <Upload size={24} className="text-accent" />
        </div>
        <p className="text-sm font-semibold text-foreground">Drag & drop documents or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">Supports images, PDFs — auto-enhanced for clarity</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
      </div>

      {/* Scanned Documents Grid */}
      {documents.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="relative group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="aspect-[3/4] bg-muted/50 flex items-center justify-center overflow-hidden">
                {doc.status === "processing" ? (
                  <div className="flex flex-col items-center gap-2 animate-pulse">
                    <RotateCw size={20} className="text-accent animate-spin" />
                    <span className="text-[10px] text-muted-foreground font-medium">Scanning...</span>
                  </div>
                ) : doc.originalFile.type.startsWith("image/") ? (
                  <img
                    src={doc.processedUrl || doc.originalUrl}
                    alt={doc.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={28} className="text-accent" />
                    <span className="text-[10px] text-muted-foreground">PDF</span>
                  </div>
                )}
              </div>

              {/* Info bar */}
              <div className="px-2 py-2 flex items-center gap-2">
                {doc.status === "done" && <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />}
                <span className="text-[10px] text-foreground font-medium truncate flex-1">{doc.fileName}</span>
              </div>

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }}
                  className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ZoomIn size={14} className="text-foreground" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeDocument(doc.id); }}
                  className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Maximize2 size={16} /> {previewDoc?.fileName}
            </DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="rounded-lg overflow-hidden border border-border bg-muted/30">
              {previewDoc.originalFile.type.startsWith("image/") ? (
                <img
                  src={previewDoc.processedUrl || previewDoc.originalUrl}
                  alt={previewDoc.fileName}
                  className="w-full h-auto"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <FileText size={48} className="text-accent mb-3" />
                  <p className="text-sm text-muted-foreground">{previewDoc.fileName}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default DocumentScanner;
