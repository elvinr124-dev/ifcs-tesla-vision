import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle2, X, ZoomIn, RotateCw, Maximize2, Download, SunMedium, Contrast } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { jsPDF } from "jspdf";

interface ScannedDocument {
  id: string;
  originalFile: File;
  originalUrl: string;
  processedUrl: string;
  pdfUrl: string;
  fileName: string;
  status: "processing" | "done" | "error";
  ocrText?: string;
  brightness: number;
  contrast: number;
}

interface DocumentScannerProps {
  onFilesProcessed: (files: File[]) => void;
  existingFiles?: File[];
}

/* ── Perspective Transform Helpers ── */

interface Point { x: number; y: number }

/** Solve 8×8 system for perspective transform coefficients */
function getPerspectiveTransform(src: Point[], dst: Point[]): number[] {
  // Build matrix A and vector b for: Ax = b
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x: sx, y: sy } = src[i];
    const { x: dx, y: dy } = dst[i];
    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    b.push(dx);
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    b.push(dy);
  }
  // Gaussian elimination
  const n = 8;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];
    const pivot = M[col][col];
    if (Math.abs(pivot) < 1e-10) continue;
    for (let j = col; j <= n; j++) M[col][j] /= pivot;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row][col];
      for (let j = col; j <= n; j++) M[row][j] -= factor * M[col][j];
    }
  }
  return M.map(row => row[n]);
}

/** Auto-detect document edges using simple edge/gradient analysis */
function detectDocumentEdges(imageData: ImageData): Point[] | null {
  const { width, height, data } = imageData;

  // Convert to grayscale and compute gradient magnitude
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  // Compute Sobel gradients
  const gradient = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx = -gray[idx - width - 1] + gray[idx - width + 1]
        - 2 * gray[idx - 1] + 2 * gray[idx + 1]
        - gray[idx + width - 1] + gray[idx + width + 1];
      const gy = -gray[idx - width - 1] - 2 * gray[idx - width] - gray[idx - width + 1]
        + gray[idx + width - 1] + 2 * gray[idx + width] + gray[idx + width + 1];
      gradient[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // Find strong edges — threshold at 85th percentile
  const sorted = Array.from(gradient).filter(v => v > 0).sort((a, b) => a - b);
  const threshold = sorted[Math.floor(sorted.length * 0.85)] || 30;

  // Scan from edges to find document boundary
  const margin = Math.floor(Math.min(width, height) * 0.02);
  const scanStep = 3;

  const findEdge = (startX: number, startY: number, dx: number, dy: number, maxSteps: number): Point => {
    let x = startX, y = startY;
    for (let i = 0; i < maxSteps; i++) {
      const idx = Math.floor(y) * width + Math.floor(x);
      if (idx >= 0 && idx < gradient.length && gradient[idx] > threshold) {
        return { x: Math.floor(x), y: Math.floor(y) };
      }
      x += dx * scanStep;
      y += dy * scanStep;
    }
    return { x: startX, y: startY };
  };

  // Scan from corners inward
  const topLeft = findEdge(margin, margin, 1, 1, Math.floor(Math.min(width, height) / scanStep / 3));
  const topRight = findEdge(width - margin, margin, -1, 1, Math.floor(Math.min(width, height) / scanStep / 3));
  const bottomRight = findEdge(width - margin, height - margin, -1, -1, Math.floor(Math.min(width, height) / scanStep / 3));
  const bottomLeft = findEdge(margin, height - margin, 1, -1, Math.floor(Math.min(width, height) / scanStep / 3));

  // Validate: corners should form a reasonable quadrilateral
  const area = Math.abs(
    (topRight.x - topLeft.x) * (bottomLeft.y - topLeft.y) -
    (bottomLeft.x - topLeft.x) * (topRight.y - topLeft.y)
  ) / 2 + Math.abs(
    (bottomRight.x - topRight.x) * (bottomLeft.y - topRight.y) -
    (bottomLeft.x - topRight.x) * (bottomRight.y - topRight.y)
  ) / 2;

  const imageArea = width * height;
  if (area < imageArea * 0.15) return null; // Too small, probably noise

  return [topLeft, topRight, bottomRight, bottomLeft];
}

/** Apply adaptive thresholding for CamScanner-like clean look */
function applyAdaptiveThreshold(imageData: ImageData, brightness: number, contrast: number): ImageData {
  const { width, height, data } = imageData;
  const out = new ImageData(new Uint8ClampedArray(data), width, height);
  const d = out.data;

  // Compute local mean using integral image for adaptive processing
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  }

  // Compute global stats
  let totalBrightness = 0;
  for (let i = 0; i < gray.length; i++) totalBrightness += gray[i];
  const avgBrightness = totalBrightness / gray.length;

  // Contrast factor
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < width * height; i++) {
    let g = gray[i];

    // Apply brightness
    g += brightness;

    // Apply contrast
    g = contrastFactor * (g - 128) + 128;

    // Adaptive enhancement
    const threshold = avgBrightness * 0.6;
    if (g < threshold) {
      // Text/dark regions — deepen
      g = Math.max(0, g * 0.45);
    } else if (g > avgBrightness * 1.15) {
      // Background — whiten
      g = Math.min(255, 235 + (g - avgBrightness) * 0.4);
    } else {
      // Mid-tones — sharpen contrast
      g = g < avgBrightness ? g * 0.65 : Math.min(255, g * 1.2 + 15);
    }

    g = Math.max(0, Math.min(255, g));
    d[i * 4] = g;
    d[i * 4 + 1] = g;
    d[i * 4 + 2] = g;
  }

  return out;
}

/** Apply perspective warp using Canvas */
function applyPerspectiveWarp(
  srcCanvas: HTMLCanvasElement,
  corners: Point[],
  outputWidth: number,
  outputHeight: number
): HTMLCanvasElement {
  const outCanvas = document.createElement("canvas");
  outCanvas.width = outputWidth;
  outCanvas.height = outputHeight;
  const outCtx = outCanvas.getContext("2d")!;

  const srcCtx = srcCanvas.getContext("2d")!;
  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

  const dst: Point[] = [
    { x: 0, y: 0 },
    { x: outputWidth, y: 0 },
    { x: outputWidth, y: outputHeight },
    { x: 0, y: outputHeight },
  ];

  // Inverse transform: for each output pixel, find source pixel
  const coeffs = getPerspectiveTransform(dst, corners);
  const outData = outCtx.createImageData(outputWidth, outputHeight);

  for (let y = 0; y < outputHeight; y++) {
    for (let x = 0; x < outputWidth; x++) {
      const denom = coeffs[6] * x + coeffs[7] * y + 1;
      const srcX = (coeffs[0] * x + coeffs[1] * y + coeffs[2]) / denom;
      const srcY = (coeffs[3] * x + coeffs[4] * y + coeffs[5]) / denom;

      const sx = Math.round(srcX);
      const sy = Math.round(srcY);

      if (sx >= 0 && sx < srcCanvas.width && sy >= 0 && sy < srcCanvas.height) {
        const srcIdx = (sy * srcCanvas.width + sx) * 4;
        const dstIdx = (y * outputWidth + x) * 4;
        outData.data[dstIdx] = srcData.data[srcIdx];
        outData.data[dstIdx + 1] = srcData.data[srcIdx + 1];
        outData.data[dstIdx + 2] = srcData.data[srcIdx + 2];
        outData.data[dstIdx + 3] = srcData.data[srcIdx + 3];
      }
    }
  }

  outCtx.putImageData(outData, 0, 0);
  return outCanvas;
}

const DocumentScanner = ({ onFilesProcessed, existingFiles = [] }: DocumentScannerProps) => {
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [previewDoc, setPreviewDoc] = useState<ScannedDocument | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [ocrLoading, setOcrLoading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback((file: File, brightness = 30, contrast = 40): Promise<{ processedUrl: string; pdfUrl: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Draw original to canvas
        const srcCanvas = document.createElement("canvas");
        const srcCtx = srcCanvas.getContext("2d")!;
        srcCanvas.width = img.width;
        srcCanvas.height = img.height;
        srcCtx.drawImage(img, 0, 0);

        // Step 1: Edge detection + perspective warp
        const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
        const corners = detectDocumentEdges(srcData);

        let workCanvas: HTMLCanvasElement;
        if (corners) {
          // Calculate output dimensions from detected corners
          const topWidth = Math.sqrt(
            Math.pow(corners[1].x - corners[0].x, 2) + Math.pow(corners[1].y - corners[0].y, 2)
          );
          const bottomWidth = Math.sqrt(
            Math.pow(corners[2].x - corners[3].x, 2) + Math.pow(corners[2].y - corners[3].y, 2)
          );
          const leftHeight = Math.sqrt(
            Math.pow(corners[3].x - corners[0].x, 2) + Math.pow(corners[3].y - corners[0].y, 2)
          );
          const rightHeight = Math.sqrt(
            Math.pow(corners[2].x - corners[1].x, 2) + Math.pow(corners[2].y - corners[1].y, 2)
          );
          const outW = Math.round(Math.max(topWidth, bottomWidth));
          const outH = Math.round(Math.max(leftHeight, rightHeight));
          workCanvas = applyPerspectiveWarp(srcCanvas, corners, outW, outH);
        } else {
          workCanvas = srcCanvas;
        }

        // Step 2: Adaptive threshold + enhancement
        const workCtx = workCanvas.getContext("2d")!;
        const workData = workCtx.getImageData(0, 0, workCanvas.width, workCanvas.height);
        const enhanced = applyAdaptiveThreshold(workData, brightness, contrast);
        workCtx.putImageData(enhanced, 0, 0);

        // Step 3: Add subtle page edge shadows
        const edgeGradientLeft = workCtx.createLinearGradient(0, 0, 6, 0);
        edgeGradientLeft.addColorStop(0, "rgba(0,0,0,0.05)");
        edgeGradientLeft.addColorStop(1, "rgba(0,0,0,0)");
        workCtx.fillStyle = edgeGradientLeft;
        workCtx.fillRect(0, 0, 6, workCanvas.height);

        const edgeGradientTop = workCtx.createLinearGradient(0, 0, 0, 6);
        edgeGradientTop.addColorStop(0, "rgba(0,0,0,0.03)");
        edgeGradientTop.addColorStop(1, "rgba(0,0,0,0)");
        workCtx.fillStyle = edgeGradientTop;
        workCtx.fillRect(0, 0, workCanvas.width, 6);

        const processedUrl = workCanvas.toDataURL("image/png");

        // Step 4: Generate PDF
        const pdfWidth = 210; // A4 mm
        const pdfHeight = (workCanvas.height / workCanvas.width) * pdfWidth;
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
      brightness: 30,
      contrast: 40,
    }));

    setDocuments((prev) => [...prev, ...newDocs]);

    for (const doc of newDocs) {
      try {
        const isImage = doc.originalFile.type.startsWith("image/");
        let processedUrl = doc.originalUrl;
        let pdfUrl = "";

        if (isImage) {
          const result = await processImage(doc.originalFile);
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
  }, [existingFiles, onFilesProcessed, processImage]);

  /** Re-process a document with updated brightness/contrast */
  const reprocessDocument = useCallback(async (docId: string, brightness: number, contrast: number) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc || !doc.originalFile.type.startsWith("image/")) return;

    const result = await processImage(doc.originalFile, brightness, contrast);
    setDocuments(prev =>
      prev.map(d =>
        d.id === docId ? { ...d, processedUrl: result.processedUrl, pdfUrl: result.pdfUrl, brightness, contrast } : d
      )
    );
    // Update preview if open
    setPreviewDoc(prev =>
      prev?.id === docId ? { ...prev, processedUrl: result.processedUrl, pdfUrl: result.pdfUrl, brightness, contrast } : prev
    );
  }, [documents, processImage]);

  /** Run OCR on a document */
  const runOCR = useCallback(async (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    setOcrLoading(docId);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const imageUrl = doc.processedUrl || doc.originalUrl;
      const { data: { text } } = await worker.recognize(imageUrl);
      await worker.terminate();

      setDocuments(prev =>
        prev.map(d => d.id === docId ? { ...d, ocrText: text } : d)
      );
      setPreviewDoc(prev =>
        prev?.id === docId ? { ...prev, ocrText: text } : prev
      );
    } catch (err) {
      console.error("OCR failed:", err);
    } finally {
      setOcrLoading(null);
    }
  }, [documents]);

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
                    <span className="text-[10px] text-muted-foreground font-medium">Scanning & enhancing...</span>
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
                {doc.status === "done" && <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />}
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
                  title="Preview & Adjust"
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

      {/* Preview Dialog with Brightness/Contrast Sliders + OCR */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <Maximize2 size={16} /> {previewDoc?.fileName}
              {previewDoc?.pdfUrl && (
                <a
                  href={previewDoc.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-full font-semibold hover:bg-accent/90 transition-colors inline-flex items-center gap-1"
                >
                  <Download size={12} /> Download PDF
                </a>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="space-y-4">
              {/* Image preview */}
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

              {/* Adjustment controls — only for images */}
              {previewDoc.originalFile.type.startsWith("image/") && (
                <div className="space-y-4 p-4 rounded-2xl border border-border bg-muted/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground">Adjustments</p>

                  {/* Brightness slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <SunMedium size={14} className="text-accent" /> Brightness
                      </label>
                      <span className="text-xs text-muted-foreground font-mono">{previewDoc.brightness}</span>
                    </div>
                    <Slider
                      value={[previewDoc.brightness]}
                      min={-100}
                      max={100}
                      step={5}
                      onValueCommit={([val]) => reprocessDocument(previewDoc.id, val, previewDoc.contrast)}
                      onValueChange={([val]) => {
                        setPreviewDoc(prev => prev ? { ...prev, brightness: val } : null);
                      }}
                    />
                  </div>

                  {/* Contrast slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <Contrast size={14} className="text-accent" /> Contrast
                      </label>
                      <span className="text-xs text-muted-foreground font-mono">{previewDoc.contrast}</span>
                    </div>
                    <Slider
                      value={[previewDoc.contrast]}
                      min={-100}
                      max={100}
                      step={5}
                      onValueCommit={([val]) => reprocessDocument(previewDoc.id, previewDoc.brightness, val)}
                      onValueChange={([val]) => {
                        setPreviewDoc(prev => prev ? { ...prev, contrast: val } : null);
                      }}
                    />
                  </div>

                  {/* OCR button */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <button
                      onClick={() => runOCR(previewDoc.id)}
                      disabled={ocrLoading === previewDoc.id}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-all disabled:opacity-50"
                    >
                      {ocrLoading === previewDoc.id ? (
                        <><RotateCw size={12} className="animate-spin" /> Extracting Text...</>
                      ) : (
                        <><FileText size={12} /> Extract Text (OCR)</>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        // Save as sharpened PNG
                        if (previewDoc.processedUrl) {
                          const link = document.createElement("a");
                          link.download = `scanned-${previewDoc.fileName.replace(/\.[^/.]+$/, "")}.png`;
                          link.href = previewDoc.processedUrl;
                          link.click();
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/50 text-xs font-semibold text-foreground hover:bg-muted transition-all"
                    >
                      <Download size={12} /> Save as PNG
                    </button>
                  </div>

                  {/* OCR Result */}
                  {previewDoc.ocrText && (
                    <div className="mt-3 p-3 rounded-xl bg-card border border-border max-h-48 overflow-y-auto">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Extracted Text</p>
                      <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed font-mono">{previewDoc.ocrText}</p>
                    </div>
                  )}
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
