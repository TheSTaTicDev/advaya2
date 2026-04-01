import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

export default function QRScanner({ onScanStart, onScanComplete }) {
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();
  const scannerRef = useRef(null); // Keep a reference to prevent double-init

  useEffect(() => {
    // Only run if scanning is true AND the div actually exists in the DOM
    if (scanning && document.getElementById("reader")) {
      if (onScanStart) onScanStart();

      // Small timeout to ensure React has finished painting the DOM
      const timer = setTimeout(() => {
        if (!scannerRef.current) {
          scannerRef.current = new Html5QrcodeScanner(
            "reader",
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0 
            },
            false
          );

          scannerRef.current.render(
            (decodedText) => {
              console.log("🔍 Scanned Content:", decodedText);
              
              // Handle both Full URLs and Raw IDs
              let batchId = decodedText;
              if (decodedText.includes('/verify/')) {
                const parts = decodedText.split('/');
                batchId = parts[parts.length - 1];
              }

              // Cleanup
              scannerRef.current.clear().then(() => {
                scannerRef.current = null;
                setScanning(false);
                
                if (onScanComplete) {
                  onScanComplete(batchId);
                } else {
                  navigate(`/verify/${batchId}`);
                }
              }).catch(err => console.error("Failed to clear scanner", err));
            },
            (error) => {
              // Silence noisy "no QR found" logs
            }
          );
        }
      }, 300);

      return () => clearTimeout(timer);
    }

    // Cleanup when component unmounts or scanning stops
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().then(() => {
          scannerRef.current = null;
        }).catch(err => console.log("Cleanup error:", err));
      }
    };
  }, [scanning, navigate, onScanStart, onScanComplete]);

  return (
    <div className="w-full max-w-md mx-auto">
      {!scanning ? (
        <button
          onClick={() => setScanning(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="text-xl">📷</span> Open Camera & Scan QR
        </button>
      ) : (
        <div className="relative bg-neutral-900 rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-2xl animate-in zoom-in duration-300">
          <div id="reader" className="w-full"></div>
          <button 
            onClick={() => setScanning(false)}
            className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold border-t border-white/10 transition-colors"
          >
            Cancel Scanning
          </button>
        </div>
      )}
    </div>
  );
}