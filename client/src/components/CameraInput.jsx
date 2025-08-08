import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCcw, X } from 'lucide-react';

const CameraCapture = ({ onCapture, onBack }) => {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [isReady, setIsReady] = useState(false);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  const onUserMediaError = useCallback((error) => {
    console.error("Error accessing webcam:", error);
  }, []);

  const onUserMedia = useCallback(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        const track = stream.getVideoTracks()[0];
        console.log("Camera settings:", track.getSettings());
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
      });
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#f9fafb] text-gray-800 relative max-h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Scan Your Card</h2>
          <p className='text-sm text-gray-600'>Position your card in front of the camera</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Close camera"
          >
            <X size={20} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Camera Container */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden min-h-0 bg-[#f9fafb]">
        <div className="relative w-full h-full max-w-4xl">
          {/* Loading overlay */}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg z-10 shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077b8] mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading camera...</p>
              </div>
            </div>
          )}
          
          {/* Webcam */}
          <div className="relative rounded-lg overflow-hidden shadow-lg bg-black w-full h-full border border-gray-200">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              screenshotQuality={1}
              mirrored={true}
              onUserMedia={onUserMedia}
              onUserMediaError={onUserMediaError}
              videoConstraints={{
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode,
                frameRate: { ideal: 30 },
              }}
              className="w-full h-full object-cover"
            />
            
            {/* Card outline overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white border-dashed rounded-lg w-4/5 h-3/5 flex items-center justify-center">
                <p className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm font-medium">
                  Position card here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6">
        <div className="flex justify-center items-center gap-6 max-w-md mx-auto">
          {/* Switch Camera Button */}
          <button
            onClick={toggleCamera}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0077b8]"
            aria-label="Switch camera"
          >
            <RotateCcw size={18} className="text-gray-700" />
          </button>

          {/* Capture Button */}
          <button
            onClick={capture}
            disabled={!isReady}
            className="flex items-center justify-center gap-3 px-8 py-3 bg-[#0077b8] hover:bg-[#005f8f] disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0077b8] font-medium text-white"
          >
            <Camera size={18} />
            Take Photo
          </button>

          {/* Facing mode indicator */}
          <div className="text-xs text-gray-500 text-center min-w-[60px]">
            <div className="text-xs leading-tight">
              {facingMode === "user" ? "Front" : "Back"}
              <br />
              Camera
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function CameraInput({ onBack }) {
  const [capturedImage, setCapturedImage] = useState(null);

  const handleCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleUsePhoto = () => {
    console.log("Using captured image:", capturedImage);
    if (onBack) onBack();
  };

  // If image is captured, show preview
  if (capturedImage) {
    return (
      <div className="flex flex-col h-full w-full bg-[#f9fafb] text-gray-800 max-h-[calc(100vh-180px)]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Preview Captured Image</h2>
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="flex-1 flex items-center justify-center p-6 min-h-0 bg-[#f9fafb]">
          <div className="relative max-w-4xl h-full flex items-center justify-center">
            <img
              src={capturedImage}
              alt="Captured card"
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg border border-gray-200"
            />
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6">
          <div className="flex justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={handleRetake}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium"
            >
              Retake
            </button>
            <button
              onClick={handleUsePhoto}
              className="flex-1 px-6 py-3 bg-[#0077b8] hover:bg-[#005f8f] text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#0077b8] font-medium"
            >
              Use Photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show camera capture interface
  return <CameraCapture onCapture={handleCapture} onBack={onBack} />;
}

export default CameraInput;
