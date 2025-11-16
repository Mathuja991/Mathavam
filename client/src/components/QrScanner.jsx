import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { FaTimes, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
//import "./styles/qr-scanner.css";

function QrScanner({ onScanSuccess, onClose }) {
  const [scanError, setScanError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const scannerRef = useRef(null);
  const scannerContainerId = "qr-reader-container";

  const successCallbackRef = useRef(onScanSuccess);
  const closeCallbackRef = useRef(onClose);
  useEffect(() => {
    successCallbackRef.current = onScanSuccess;
    closeCallbackRef.current = onClose;
  }, [onScanSuccess, onClose]);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (cameras && cameras.length > 0) {
          if (!scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(
              scannerContainerId,
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                rememberLastUsedCamera: true,
                aspectRatio: 1.0,
                formatsToSupport: ["QR_CODE"],
              },
              false
            );

            const handleSuccess = (decodedText) => {
              successCallbackRef.current(decodedText);
              if (scannerRef.current) {
                scannerRef.current.clear().catch((error) => {
                  console.error("Failed to clear scanner on success:", error);
                });
              }
              closeCallbackRef.current();
              setScanError(null); // Clear any existing error
            };

            // Important: This callback runs on frames where no QR is decoded.
            // These are not fatal camera errors. Surfacing UI here is misleading.
            let lastLog = 0;
            const handleError = (error) => {
              const now = Date.now();
              if (now - lastLog > 5000) {
                console.debug("QR decode miss:", error);
                lastLog = now;
              }
            };

            scannerRef.current.render(handleSuccess, handleError);
          }
        } else {
          setScanError("No cameras detected on this device.");
        }
        setIsInitializing(false);
      })
      .catch((error) => {
        console.error("Failed to enumerate cameras:", error);
        setScanError(
          "Unable to access cameras. Please check your device and browser settings."
        );
        setIsInitializing(false);
      });

    const container = document.getElementById(scannerContainerId);
    const observer = new MutationObserver(() => {
      const errorElement = container?.querySelector(".html5-qrcode-error");
      if (errorElement) {
        errorElement.remove(); // This line removes the element
        observer.disconnect(); // Disconnect the observer as we are done
      }
    });

    if (container) {
      observer.observe(container, { childList: true, subtree: true });
    }

    const initializationTimeout = setTimeout(() => {
      setIsInitializing(false);
    }, 5000);

    return () => {
      clearTimeout(initializationTimeout);
      observer.disconnect();
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch((error) => {
            console.error("Failed to clear scanner on unmount:", error);
          });
        } catch (e) {
          console.debug("Scanner already cleared or not initialized.");
        }
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20"
          aria-label="Close scanner"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Scan QR Code
        </h2>

        <div className="w-full min-h-[300px] rounded-lg overflow-hidden relative bg-gray-100">
          {scanError ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-red-600 p-6">
              <FaExclamationTriangle className="w-12 h-12 mb-4" />
              <p className="font-semibold mb-2">Camera Error</p>
              <p className="text-sm text-gray-600">{scanError}</p>
            </div>
          ) : (
            <>
              {isInitializing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-10">
                  <FaSpinner className="animate-spin w-8 h-8 text-blue-500 mb-3" />
                  <p className="text-gray-600 font-medium">
                    Initializing camera...
                  </p>
                </div>
              )}
              <div
                id={scannerContainerId}
                className="w-full h-full"
                style={{ minHeight: "300px" }}
              ></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default QrScanner;
