import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle2, X, ZoomIn, RotateCw, Maximize2, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { jsPDF } from "jspdf";

interface ScannedDocument {
  id: string;
  originalFile: File;
  originalUrl: string;
  processedUrl: string;
  pdfUrl: string;
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

  const processImageToScanned = useCallback((file: File): Promise<{ processedUrl: string; pdfUrl: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Get image data for CamScanner-style processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Step 1: Adaptive contrast enhancement + shadow removal
        // Calculate average brightness for adaptive thresholding
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          totalBrightness += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        const avgBrightness = totalBrightness / (data.length / 4);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;

          // Adaptive enhancement: boost whites, deepen darks
          let enhanced: number;
          const threshold = avgBrightness * 0.65;

          if (gray < threshold) {
            // Dark regions (text, lines) — make darker
            enhanced = Math.max(0, gray * 0.5);
          } else if (gray > avgBrightness * 1.1) {
            // Light regions (paper background) — push to white
            enhanced = Math.min(255, 240 + (gray - avgBrightness) * 0.3);
          } else {
            // Mid-tones — increase contrast
            enhanced = gray < avgBrightness ? gray * 0.7 : Math.min(255, gray * 1.15 + 20);
          }

          data[i] = enhanced;
          data[i + 1] = enhanced;
          data[i + 2] = enhanced;
        }

        ctx.putImageData(imageData, 0, 0);

        // Step 2: Add subtle page edge shadow for scanned doc feel
        const edgeGradientLeft = ctx.createLinearGradient(0, 0, 8, 0);
        edgeGradientLeft.addColorStop(0, "rgba(0,0,0,0.06)");
        edgeGradientLeft.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = edgeGradientLeft;
        ctx.fillRect(0, 0, 8, canvas.height);

        const edgeGradientTop = ctx.createLinearGradient(0, 0, 0, 8);
        edgeGradientTop.addColorStop(0, "rgba(0,0,0,0.04)");
        edgeGradientTop.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = edgeGradientTop;
        ctx.fillRect(0, 0, canvas.width, 8);

        const processedUrl = canvas.toDataURL("image/png");

        // Step 3: Generate PDF from the processed image
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Standard page: fit to A4 or Letter proportions
        const pdfWidth = 210; // mm (A4)
        const pdfHeight = (imgHeight / imgWidth) * pdfWidth;

        const pdf = new jsPDF({
          orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
          unit: "mm",
          format: [pdfWidth, pdfHeight],
        });

        pdf.addImage(processedUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        const pdfBlob = pdf.output("bloburl") as unknown as string;

        resolve({ processedUrl, pdfUrl: pdfBlob });
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
      pdfUrl: "",
      fileName: file.name,
      status: "processing" as const,
    }));

    setDocuments((prev) => [...prev, ...newDocs]);

    for (const doc of newDocs) {
      try {
        const isImage = doc.originalFile.type.startsWith("image/");
        let processedUrl = doc.originalUrl;
        let pdfUrl = "";

        if (isImage) {
          const result = await processImageToScanned(doc.originalFile);
          processedUrl = result.processedUrl;
          pdfUrl = result.pdfUrl;
        }

        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, processedUrl, pdfUrl, status: "done" } : d
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

    onFilesProcessed([...existingFiles, ...files]);
  }, [existingFiles, onFilesProcessed, processImageToScanned]);

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
        <p className="text-xs text-muted-foreground mt-1">Images auto-enhanced & converted to PDF</p>
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
              <div className="aspect-[3/4] bg-muted/50 flex items-center justify-center overflow-hidden">
                {doc.status === "processing" ? (
                  <div className="flex flex-col items-center gap-2 animate-pulse">
                    <RotateCw size={20} className="text-accent animate-spin" />
                    <span className="text-[10px] text-muted-foreground font-medium">Scanning & converting...</span>
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
                {doc.pdfUrl && (
                  <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">PDF</span>
                )}
              </div>

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }}
                  className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                  title="Preview"
                >
                  <ZoomIn size={14} className="text-foreground" />
                </button>
                {doc.pdfUrl && (
                  <a
                    href={doc.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                    title="Open PDF"
                  >
                    <Download size={14} />
                  </a>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeDocument(doc.id); }}
                  className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                  title="Remove"
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
              {previewDoc?.pdfUrl && (
                <a
                  href={previewDoc.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-full font-semibold hover:bg-accent/90 transition-colors inline-flex items-center gap-1"
                >
                  <Download size={12} /> Open PDF
                </a>
              )}
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
    </div>
  );
};

export default DocumentScanner;
