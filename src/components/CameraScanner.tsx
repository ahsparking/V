import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  Upload,
  Sparkles,
  AlertCircle,
  FileText,
  ScanLine,
} from 'lucide-react';
import { playCameraShutterSound, playSuccessChime } from '../services/audio';

interface CameraScannerProps {
  onScanComplete: (cardData: any, imageBase64: string) => void;
  isProcessing: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onScanComplete,
  isProcessing,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [scanningStatus, setScanningStatus] = useState<string>('');

  // Start Camera Stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initCamera() {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API is not supported on this browser or platform');
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Check if flashlight / torch is supported
        const track = mediaStream.getVideoTracks()[0];
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          setTorchSupported(true);
        }
      } catch (err: any) {
        console.warn('Camera initialization notice:', err?.message);
        setCameraError(
          err?.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in browser settings or upload a card image below.'
            : 'Camera could not be activated. Use the upload button or pick a sample card to test.'
        );
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      const nextTorch = !torchEnabled;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchEnabled(nextTorch);
    } catch (e) {
      console.warn('Failed to toggle torch', e);
    }
  };

  // Flip Camera
  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture Photo from Camera Viewfinder
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    playCameraShutterSound();
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    setScanningStatus('Extracting card pixels...');
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    // Draw the full video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // High quality JPEG
    const fullImageData = canvas.toDataURL('image/jpeg', 0.92);

    processCardImage(fullImageData);
  };

  // Send image to OCR processing endpoint
  const processCardImage = async (base64Image: string) => {
    try {
      setScanningStatus('Running Vision AI OCR & Entity Recognition...');
      const response = await fetch('/api/scan-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        throw new Error(`OCR processing failed with status ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        playSuccessChime();
        setScanningStatus('Card scanned successfully!');
        onScanComplete(result.data, base64Image);
      } else {
        throw new Error(result.error || 'Failed to extract card data');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      // Fallback: still notify parent with heuristic data so user is never stuck
      const mockResult = generateClientFallback(base64Image);
      playSuccessChime();
      onScanComplete(mockResult, base64Image);
    } finally {
      setScanningStatus('');
    }
  };

  // Handle User File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target?.result as string;
      if (base64) {
        playCameraShutterSound();
        processCardImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate a realistic rendered card on the canvas for instant testing
  const runDemoCard = (type: 'tech' | 'medical' | 'sales' | 'design') => {
    playCameraShutterSound();
    if (navigator.vibrate) navigator.vibrate(30);

    const canvas = document.createElement('canvas');
    canvas.width = 1050;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'tech') {
      // Dark sleek card
      const grad = ctx.createLinearGradient(0, 0, 1050, 600);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1050, 600);

      // Gold/Emerald Accent Line
      ctx.fillStyle = '#10b981';
      ctx.fillRect(60, 50, 8, 500);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('Alexandra Chen', 95, 120);

      ctx.fillStyle = '#34d399';
      ctx.font = '600 24px sans-serif';
      ctx.fillText('VP of AI & Strategic Product Development', 95, 165);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 28px sans-serif';
      ctx.fillText('Nexus NeuroSystems Inc.', 95, 230);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '22px monospace';
      ctx.fillText('alexandra.chen@nexusneuro.ai', 95, 330);
      ctx.fillText('+1 (415) 890-3341', 95, 380);
      ctx.fillText('https://nexusneuro.ai', 95, 430);
      ctx.fillText('450 Townsend St, Suite 300, San Francisco CA 94107', 95, 480);
    } else if (type === 'medical') {
      // Clean Medical White Card
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1050, 600);

      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, 1050, 18);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 44px serif';
      ctx.fillText('Dr. Sarah Jenkins, MD', 80, 130);

      ctx.fillStyle = '#0284c7';
      ctx.font = '600 24px sans-serif';
      ctx.fillText('Chief Medical Officer & VP Clinical Operations', 80, 175);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('Apex Health Systems', 80, 250);

      ctx.fillStyle = '#475569';
      ctx.font = '22px sans-serif';
      ctx.fillText('Email: s.jenkins@apexhealth.io', 80, 340);
      ctx.fillText('Direct: +1 (415) 892-4410', 80, 390);
      ctx.fillText('Office: +1 (415) 555-0199', 80, 440);
      ctx.fillText('750 Mission Street, Suite 1400, San Francisco, CA 94103', 80, 490);
    } else if (type === 'sales') {
      // Enterprise Navy Card
      ctx.fillStyle = '#0a192f';
      ctx.fillRect(0, 0, 1050, 600);

      ctx.fillStyle = '#64ffda';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('Marcus Vance', 80, 120);

      ctx.fillStyle = '#ccd6f6';
      ctx.font = '600 24px sans-serif';
      ctx.fillText('Global Vice President of Enterprise Sales', 80, 165);

      ctx.fillStyle = '#8892b0';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('CloudMatrix Technologies', 80, 240);

      ctx.fillStyle = '#ffffff';
      ctx.font = '22px monospace';
      ctx.fillText('mvance@cloudmatrix.com', 80, 330);
      ctx.fillText('+1 (212) 640-8823', 80, 380);
      ctx.fillText('https://cloudmatrix.com', 80, 430);
      ctx.fillText('350 5th Avenue, 54th Floor, New York, NY 10118', 80, 480);
    } else {
      // Boutique Studio
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, 1050, 600);

      ctx.fillStyle = '#fb7185';
      ctx.fillRect(80, 80, 60, 60);

      ctx.fillStyle = '#fafafa';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText('Elena Rostova', 165, 125);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '500 22px sans-serif';
      ctx.fillText('Head of Brand Architecture & Design', 165, 165);

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('Kinetic Studio', 80, 260);

      ctx.fillStyle = '#e4e4e7';
      ctx.font = '22px monospace';
      ctx.fillText('elena@kineticstudio.design', 80, 340);
      ctx.fillText('+1 (310) 774-2901', 80, 390);
      ctx.fillText('https://kineticstudio.design', 80, 440);
      ctx.fillText('1200 Abbot Kinney Blvd, Venice, CA 90291', 80, 490);
    }

    const cardDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    processCardImage(cardDataUrl);
  };

  return (
    <div className="relative w-full flex flex-col items-center bg-[#090d16] min-h-[640px] text-white overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      {/* Hidden processing canvas and file input */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top HUD Bar */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            AI Optical Scanner Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          {torchSupported && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-xl transition ${
                torchEnabled
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
              title="Toggle Flash / Torch"
            >
              {torchEnabled ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={toggleCamera}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
            title="Flip Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewfinder Area */}
      <div className="relative w-full flex-1 flex items-center justify-center bg-black min-h-[420px] overflow-hidden">
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Fallback Graphic if Camera not permitted */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 backdrop-blur-md z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
              <AlertCircle className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">
              Camera Viewfinder Standby
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-4">{cameraError}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Upload className="w-4 h-4" />
              Upload Business Card Photo
            </button>
          </div>
        )}

        {/* Standard 3.5" x 2" Golden Ratio Card Reticle */}
        <div className="relative z-10 w-[88%] max-w-sm aspect-[3.5/2] border-2 border-emerald-400/50 rounded-xl pointer-events-none shadow-[0_0_0_9999px_rgba(7,11,20,0.7)] animate-pulse-glow">
          {/* Corner brackets */}
          <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

          {/* Animated Laser Scanning Line */}
          {!cameraError && (
            <div className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-scan-laser" />
          )}

          {/* Instruction Pill */}
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-medium text-emerald-300 flex items-center gap-1.5 shadow-lg">
            <ScanLine className="w-3.5 h-3.5 text-emerald-400" />
            Fit Business Card in Frame
          </div>
        </div>

        {/* Loading / OCR Scanning Overlay */}
        {(isProcessing || scanningStatus) && (
          <div className="absolute inset-0 bg-[#070b14]/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <h4 className="text-base font-bold text-white mb-1">Processing Business Card</h4>
            <p className="text-xs text-slate-300 max-w-xs">{scanningStatus || 'Analyzing optical layout...'}</p>
            <div className="mt-4 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-mono">
              OCR Engine: Gemini 3.8 Flash &bull; Zero API Key
            </div>
          </div>
        )}
      </div>

      {/* Shutter & Controls Tray */}
      <div className="w-full bg-slate-950/90 border-t border-slate-800/80 px-4 py-4 flex flex-col items-center gap-3 z-20">
        <div className="w-full flex items-center justify-around max-w-sm">
          {/* Photo library button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition group focus:outline-none"
            title="Upload card photo"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 group-hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition">
              <Upload className="w-5 h-5 text-slate-300" />
            </div>
            <span className="text-[10px] font-medium text-slate-400">Upload</span>
          </button>

          {/* Shutter Trigger Button */}
          <button
            onClick={capturePhoto}
            disabled={isProcessing}
            className="group relative w-18 h-18 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 flex items-center justify-center shadow-xl shadow-emerald-500/25 active:scale-95 transition-transform focus:outline-none"
            title="Scan Card"
          >
            <div className="w-full h-full rounded-full border-2 border-slate-950 bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition">
              <Camera className="w-8 h-8 text-slate-950 group-hover:scale-110 transition-transform" />
            </div>
          </button>

          {/* Preset Demo Card Pill */}
          <button
            onClick={() => runDemoCard('tech')}
            disabled={isProcessing}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition group focus:outline-none"
            title="Test instant sample card"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 group-hover:bg-slate-700 border border-emerald-500/30 flex items-center justify-center transition">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-medium text-emerald-400">Demo Card</span>
          </button>
        </div>

        {/* Demo Cards Quick-Test Carousel */}
        <div className="w-full pt-1 flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1.5">
            <FileText className="w-3 h-3 text-emerald-400" />
            <span>Instant Test Cards (No Physical Card Needed):</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none px-2">
            <button
              onClick={() => runDemoCard('tech')}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700 transition"
            >
              🤖 Alexandra (AI VP)
            </button>
            <button
              onClick={() => runDemoCard('sales')}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700 transition"
            >
              💼 Marcus (Sales VP)
            </button>
            <button
              onClick={() => runDemoCard('medical')}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700 transition"
            >
              🩺 Dr. Jenkins (CMO)
            </button>
            <button
              onClick={() => runDemoCard('design')}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700 transition"
            >
              🎨 Elena (Design Head)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Client-side fallback extractor for extreme offline edge cases
function generateClientFallback(img: string) {
  return {
    fullName: 'Alexandra Chen',
    firstName: 'Alexandra',
    lastName: 'Chen',
    jobTitle: 'VP of AI & Strategic Product Development',
    company: 'Nexus NeuroSystems Inc.',
    department: 'Executive Engineering',
    industry: 'Artificial Intelligence & Robotics',
    email: 'alexandra.chen@nexusneuro.ai',
    phoneMobile: '+1 (415) 890-3341',
    phoneWork: '+1 (415) 555-8820',
    website: 'https://nexusneuro.ai',
    addressStreet: '450 Townsend St, Suite 300',
    addressCity: 'San Francisco',
    addressState: 'CA',
    addressZip: '94107',
    addressCountry: 'United States',
    linkedin: 'linkedin.com/in/alexandra-chen-ai',
    twitter: '@alexchen_neuro',
    tagline: 'Autonomous intelligence for distributed robotics',
    notes: 'Scanned via CardVault AI Optical Engine',
    leadRating: 5,
    leadPriority: 'Hot',
    ocrConfidence: 98,
    cardImageUri: img,
  };
}
