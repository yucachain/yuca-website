"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import jsQR from "jsqr";
import {
  Camera,
  Upload,
  Search,
  Loader2,
  AlertCircle,
  LogIn,
  X,
  ScanLine,
  QrCode,
  FlipHorizontal,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Zap,
  ZapOff,
} from "lucide-react";
import type { BatchRecord } from "@/app/types/batchVaultDispatch";
import { extractBatchCode } from "@/app/Services/batchService";

export interface BatchScannerPanelProps {
  batch?: BatchRecord | null;
  loading?: boolean;
  onManualLookup?: (code: string) => void;
  onScan?: (code: string) => void;
  errorMessage?: string | null;
  onClearError?: () => void;
}

type ScanMode = "camera" | "upload" | "manual";

// Play an instant pleasant confirmation chime using Web Audio API
function playSuccessBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([60, 40, 60]);
    }
  } catch {
    // Audio context may be restricted by browser until user gesture
  }
}

/**
 * Decode QR code from HTMLVideoElement, HTMLImageElement, or Canvas.
 * Tries native BarcodeDetector API first, falls back to jsQR with multi-resolution scaling.
 */
async function decodeQrSource(
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<string | null> {
  // 1. Try native BarcodeDetector if supported
  if (typeof window !== "undefined" && "BarcodeDetector" in window) {
    try {
      const BarcodeDetectorClass = (window as unknown as { BarcodeDetector: any }).BarcodeDetector;
      const detector = new BarcodeDetectorClass({ formats: ["qr_code"] });
      const barcodes = await detector.detect(source);
      if (barcodes && barcodes.length > 0 && barcodes[0]?.rawValue) {
        return barcodes[0].rawValue;
      }
    } catch {
      // Fall through to jsQR
    }
  }

  // 2. Decode using jsQR on an in-memory canvas
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    let width = 0;
    let height = 0;

    if (source instanceof HTMLVideoElement) {
      width = source.videoWidth;
      height = source.videoHeight;
    } else if (source instanceof HTMLImageElement) {
      width = source.naturalWidth || source.width;
      height = source.naturalHeight || source.height;
    } else if (source instanceof HTMLCanvasElement) {
      width = source.width;
      height = source.height;
    }

    if (!width || !height) return null;

    const testCanvas = (targetW: number, targetH: number): string | null => {
      canvas.width = targetW;
      canvas.height = targetH;
      ctx.drawImage(source, 0, 0, targetW, targetH);
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const qr = jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: "attemptBoth",
      });
      return qr ? qr.data : null;
    };

    // If large photo, test scaled down first for speed and accuracy
    const maxDim = 1200;
    if (width > maxDim || height > maxDim) {
      const scale = Math.min(maxDim / width, maxDim / height);
      const res = testCanvas(Math.round(width * scale), Math.round(height * scale));
      if (res) return res;
    }

    // Test at native resolution
    const directRes = testCanvas(width, height);
    if (directRes) return directRes;

    // Test at 800px if original was very high-res
    if (width > 800 || height > 800) {
      const scale = Math.min(800 / width, 800 / height);
      const res = testCanvas(Math.round(width * scale), Math.round(height * scale));
      if (res) return res;
    }

    return null;
  } catch (err) {
    console.error("Error decoding QR:", err);
    return null;
  }
}

export default function BatchScannerPanel({
  batch,
  loading = false,
  onManualLookup,
  onScan,
  errorMessage,
  onClearError,
}: BatchScannerPanelProps) {
  const [mode, setMode] = useState<ScanMode>("camera");

  // Manual entry state
  const [manualCode, setManualCode] = useState("");

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // Upload state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Common detection state
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const captureInputRef = useRef<HTMLInputElement | null>(null);
  const lastScanTimestamp = useRef<number>(0);

  // Trigger batch lookup with cleaned code
  const triggerLookup = useCallback(
    (rawCode: string) => {
      const cleanCode = extractBatchCode(rawCode);
      const codeToSend = cleanCode || rawCode.trim();
      if (!codeToSend) return;

      setLastScannedCode(codeToSend);
      onClearError?.();

      if (onScan) {
        onScan(codeToSend);
      } else if (onManualLookup) {
        onManualLookup(codeToSend);
      }
    },
    [onScan, onManualLookup, onClearError]
  );

  // Stop camera media stream
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setCameraLoading(false);
    setTorchOn(false);
    setHasTorch(false);
  }, []);

  // Frame processing loop for camera
  const scanVideoFrame = useCallback(() => {
    if (!videoRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const now = Date.now();

    // Process a frame every ~120ms to conserve CPU
    if (now - lastScanTimestamp.current > 120) {
      lastScanTimestamp.current = now;

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        decodeQrSource(video).then((result) => {
          if (result) {
            playSuccessBeep();
            stopCamera();
            triggerLookup(result);
            return;
          }
        });
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  }, [isCameraActive, stopCamera, triggerLookup]);

  // Start camera media stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraLoading(true);

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported by your browser.");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
      }

      // Check torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack as any).getCapabilities?.() || {};
        setHasTorch(Boolean(capabilities.torch));
      }

      setIsCameraActive(true);
      setCameraLoading(false);
    } catch (err: any) {
      stopCamera();
      let msg = "Could not access the camera. ";
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        msg += "Permission was denied. Please allow camera permissions in your browser.";
      } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        msg += "No camera found on this device.";
      } else {
        msg += err?.message || "Please check your camera settings.";
      }
      setCameraError(msg);
    }
  }, [facingMode, stopCamera]);

  // Handle camera frame scanning lifecycle
  useEffect(() => {
    if (isCameraActive) {
      animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraActive, scanVideoFrame]);

  // Stop camera when unmounting or switching away from camera mode
  useEffect(() => {
    if (mode !== "camera" && isCameraActive) {
      stopCamera();
    }
  }, [mode, isCameraActive, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Toggle torch / flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextState = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (e) {
      console.error("Failed to toggle torch:", e);
    }
  };

  // Switch between front and back camera
  const flipCamera = () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    if (isCameraActive) {
      stopCamera();
      setTimeout(() => {
        setFacingMode(nextFacing);
        startCamera();
      }, 100);
    }
  };

  // Decode uploaded image file
  const processImageFile = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setPhotoError(null);
    setPhotoLoading(true);

    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Unable to load selected image."));
        img.src = objectUrl;
      });

      const detectedCode = await decodeQrSource(img);

      if (detectedCode) {
        playSuccessBeep();
        triggerLookup(detectedCode);
      } else {
        setPhotoError(
          "No QR code found in this photo. Please make sure the QR code is clearly visible and well-lit, or try another photo."
        );
      }
    } catch (err: any) {
      setPhotoError(err?.message || "Failed to analyze image for QR code.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Reset file input value so re-selecting same file triggers onChange
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleManualSearch = () => {
    if (!manualCode.trim()) return;
    triggerLookup(manualCode.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleManualSearch();
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanLine size={18} strokeWidth={1.8} className="text-[#226049]" />
          <h3 className="text-sm font-bold text-gray-900">
            Batch Scanner &amp; Verification
          </h3>
        </div>

        {lastScannedCode && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#226049] border border-emerald-200">
            <CheckCircle2 size={12} />
            Scanned: {lastScannedCode}
          </span>
        )}
      </div>

      {/* Mode Selector / Scan Bar */}
      <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-xl bg-gray-100/80 p-1 text-xs font-semibold text-gray-600">
        <button
          type="button"
          onClick={() => setMode("camera")}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all cursor-pointer ${
            mode === "camera"
              ? "bg-white text-[#226049] font-bold shadow-xs"
              : "hover:text-gray-900"
          }`}
        >
          <Camera size={14} />
          <span>Camera</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all cursor-pointer ${
            mode === "upload"
              ? "bg-white text-[#226049] font-bold shadow-xs"
              : "hover:text-gray-900"
          }`}
        >
          <Upload size={14} />
          <span>Upload Photo</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all cursor-pointer ${
            mode === "manual"
              ? "bg-white text-[#226049] font-bold shadow-xs"
              : "hover:text-gray-900"
          }`}
        >
          <Search size={14} />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Mode 1: Camera Scanner */}
      {mode === "camera" && (
        <div className="mt-4">
          {isCameraActive ? (
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-4/3 sm:aspect-16/10 flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                autoPlay
                playsInline
                muted
              />

              {/* Viewfinder Target Overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-48 w-48 sm:h-56 sm:w-56 rounded-2xl border-2 border-emerald-400/80 bg-emerald-500/5 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  {/* Corner Reticles */}
                  <div className="absolute -top-1 -left-1 h-6 w-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-md" />
                  <div className="absolute -top-1 -right-1 h-6 w-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-md" />
                  <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-md" />
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-4 border-r-4 border-emerald-400 rounded-br-md" />

                  {/* Animated Scanning Laser Line */}
                  <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-pulse"
                    style={{
                      animation: "scanSweep 2s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>

              {/* Camera Controls Bar (Top) */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between text-white z-10">
                <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Scanning QR...
                </div>

                <div className="flex items-center gap-2">
                  {hasTorch && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className="rounded-full bg-black/60 backdrop-blur-md p-2 text-white hover:bg-black/80 transition-colors"
                      title={torchOn ? "Turn off torch" : "Turn on torch"}
                    >
                      {torchOn ? <ZapOff size={16} /> : <Zap size={16} />}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={flipCamera}
                    className="rounded-full bg-black/60 backdrop-blur-md p-2 text-white hover:bg-black/80 transition-colors"
                    title="Flip camera"
                  >
                    <FlipHorizontal size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="rounded-full bg-black/60 backdrop-blur-md p-2 text-white hover:bg-black/80 transition-colors"
                    title="Close camera"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Instructions Bar (Bottom) */}
              <div className="absolute bottom-3 inset-x-4 text-center z-10">
                <p className="inline-block rounded-full bg-black/60 backdrop-blur-md px-4 py-1.5 text-xs text-gray-200">
                  Align farmer&apos;s batch QR code within the frame
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-800/20 bg-emerald-50/20 px-6 py-10 text-center">
              <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100/80 text-[#226049]">
                <QrCode size={36} strokeWidth={1.4} />
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#226049] text-white shadow-xs">
                  <Camera size={13} />
                </div>
              </div>

              <h4 className="text-sm font-bold text-gray-900">
                Live QR Code Scanner
              </h4>
              <p className="mt-1 text-xs text-gray-500 max-w-xs leading-relaxed">
                Open your device camera to scan the QR code printed on the farmer&apos;s delivery slip or harvest tag.
              </p>

              {cameraError && (
                <div className="mt-3 max-w-sm rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                  {cameraError}
                </div>
              )}

              <button
                type="button"
                onClick={startCamera}
                disabled={cameraLoading}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#226049] px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#1a4336] active:scale-98 shadow-sm cursor-pointer disabled:opacity-60"
              >
                {cameraLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Camera size={15} />
                )}
                Open Camera Scanner
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Photo Upload */}
      {mode === "upload" && (
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={captureInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
              isDragging
                ? "border-emerald-600 bg-emerald-50/50"
                : "border-emerald-800/20 bg-emerald-50/20"
            }`}
          >
            {photoPreview ? (
              <div className="flex flex-col items-center space-y-3 w-full max-w-xs">
                <div className="relative h-44 w-full overflow-hidden rounded-xl border border-gray-200 bg-black/5 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Uploaded QR Code"
                    className="h-full w-full object-contain"
                  />
                  {photoLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white backdrop-blur-xs">
                      <Loader2 size={24} className="animate-spin text-emerald-400" />
                      <span className="mt-2 text-xs font-medium">Scanning for QR code...</span>
                    </div>
                  )}
                </div>

                {photoError ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 text-left w-full">
                    <p className="font-semibold">Detection Notice</p>
                    <p className="mt-0.5">{photoError}</p>
                  </div>
                ) : !photoLoading && lastScannedCode ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-[#226049] text-left w-full flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold">QR Code Recognized</p>
                      <p className="font-mono text-[11px]">{lastScannedCode}</p>
                    </div>
                  </div>
                ) : null}

                <div className="flex gap-2 w-full pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoLoading}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    Choose Another Photo
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100/80 text-[#226049]">
                  <ImageIcon size={28} strokeWidth={1.5} />
                </div>

                <h4 className="text-sm font-bold text-gray-900">
                  Upload QR Code Photo
                </h4>
                <p className="mt-1 text-xs text-gray-500 max-w-xs leading-relaxed">
                  Drag and drop a photo of the batch QR code here, or browse files from your computer or phone.
                </p>

                {photoError && (
                  <div className="mt-3 max-w-sm rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                    {photoError}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#226049] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#1a4336] active:scale-98 shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {photoLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    Select Image File
                  </button>

                  <button
                    type="button"
                    onClick={() => captureInputRef.current?.click()}
                    disabled={photoLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
                  >
                    <Camera size={14} />
                    Snap Photo
                  </button>
                </div>

                <p className="mt-3 text-[11px] text-gray-400">
                  Supports JPG, PNG, WEBP, HEIC
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mode 3: Manual Code Entry */}
      {mode === "manual" && (
        <div className="mt-4 flex flex-col items-center justify-center gap-3.5 rounded-2xl border-2 border-dashed border-emerald-800/20 bg-emerald-50/20 px-6 py-8">
          <div className="text-center">
            <h4 className="text-sm font-bold text-gray-900">
              Manual Batch Code Lookup
            </h4>
            <p className="mt-0.5 text-xs text-gray-500">
              Enter the batch reference code (e.g. YC-2026-00142) or farmer name
            </p>
          </div>

          <div className="relative w-full max-w-sm">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. YC-2026-00142"
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-center text-sm font-mono text-gray-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={handleManualSearch}
            disabled={loading || !manualCode.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#226049] px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1a4336] disabled:opacity-60 cursor-pointer shadow-xs active:scale-98"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Search size={14} />
            )}
            Find Batch Details
          </button>
        </div>
      )}

      {/* Lookup Loading Indicator */}
      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-50/80 border border-emerald-200 p-3 text-xs font-semibold text-[#226049]">
          <Loader2 size={16} className="animate-spin" />
          <span>Fetching batch records from the network...</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-xs text-red-700 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <div className="flex-1 space-y-1.5">
              <p className="font-semibold text-red-900">Batch Verification Notice</p>
              <p className="leading-relaxed text-red-700">{errorMessage}</p>
              {(errorMessage.includes("401") ||
                errorMessage.toLowerCase().includes("session") ||
                errorMessage.toLowerCase().includes("unauthorized") ||
                errorMessage.toLowerCase().includes("log in")) && (
                <div className="pt-1">
                  <Link
                    href="/admin-login"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-2xs"
                  >
                    <LogIn size={13} />
                    Log In to Admin
                  </Link>
                </div>
              )}
            </div>
            {onClearError && (
              <button
                type="button"
                onClick={onClearError}
                className="text-red-400 hover:text-red-700 p-0.5 cursor-pointer"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Batch Summary */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Scanned Batch Summary
        </h4>

        {batch ? (
          <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Batch Code:</span>
              <span className="font-mono font-bold text-gray-900">{batch.batchCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Farmer / Supplier:</span>
              <span className="font-semibold text-gray-800">
                {batch.farmerName || batch.farmer || batch.sellerName || "Registered Farmer"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Est. Weight:</span>
              <span className="font-semibold text-gray-900">
                {(batch.weightKg || batch.estWeightKg || 0).toLocaleString()} kg
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Current Status:</span>
              <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-[#226049]">
                {batch.status}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2 italic">
            Scan a batch QR code, upload a photo, or enter the code manually to load details.
          </p>
        )}
      </div>

      {/* Embedded CSS for scan laser animation */}
      <style jsx>{`
        @keyframes scanSweep {
          0% {
            top: 8%;
            opacity: 0.7;
          }
          50% {
            top: 90%;
            opacity: 1;
          }
          100% {
            top: 8%;
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
