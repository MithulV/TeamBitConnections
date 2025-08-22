import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import Tesseract from "tesseract.js";

import { Camera, RotateCcw, X, Upload, ImagePlus } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/AuthStore';

const CameraCapture = ({ onCapture, onBack }) => {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setIsReady(false); // Reset ready state when switching cameras
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current && isReady) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  }, [onCapture, isReady]);

  const onUserMediaError = useCallback((error) => {
    console.error("Error accessing webcam:", error);
    setHasError(true);
    setIsReady(false);
  }, []);

  const onUserMedia = useCallback((stream) => {
    console.log("Webcam stream started:", stream);
    setIsReady(true);
    setHasError(false);
  }, []);

  const handleBack = () => {
    if (onBack) onBack();
  };

  // Remove the manual getUserMedia call - let Webcam component handle it

  return (
    <div className="flex flex-col h-full w-full pt-4 bg-[#F0F0F0] text-gray-800 relative max-h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Scan Your Card</h2>
          <p className='text-sm text-gray-600'>Position your card in front of the camera</p>
        </div>
        {onBack && (
          <button
            onClick={handleBack}
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
          {!isReady && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg z-10 shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077b8] mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading camera...</p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg z-10 shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <Camera size={48} />
                </div>
                <p className="text-gray-800 font-medium mb-2">Camera Access Required</p>
                <p className="text-gray-600 text-sm mb-4">Please allow camera access to take photos</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#0077b8] text-white rounded-lg hover:bg-[#005f8f]"
                >
                  Retry
                </button>
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
                facingMode: facingMode,
                frameRate: { ideal: 30 },
              }}
              className="w-full h-full object-cover"
              style={{
                display: hasError ? 'none' : 'block'
              }}
            />

            {/* Card outline overlay - only show when camera is ready */}
            {isReady && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-white border-dashed rounded-lg w-4/5 h-3/5 flex items-center justify-center">
                  <p className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm font-medium">
                    Position card here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6">
        <div className="flex justify-center items-center gap-6 max-w-md mx-auto">
          {/* Switch Camera Button */}
          <button
            onClick={toggleCamera}
            disabled={!isReady || hasError}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0077b8]"
            aria-label="Switch camera"
          >
            <RotateCcw size={18} className="text-gray-700" />
          </button>

          {/* Capture Button */}
          <button
            onClick={capture}
            disabled={!isReady || hasError}
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

// Photo Option Selector Component
const PhotoOptionSelector = ({ onSelectCamera, onSelectUpload, onBack }) => {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onSelectUpload(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };



  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full w-full pt-4 bg-[#F0F0F0] text-gray-800 relative max-h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Add Card Photo</h2>
          <p className='text-sm text-gray-600'>Choose how you want to add your card photo</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <X size={20} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Options Container */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-0 bg-[#f9fafb]">
        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Camera Option */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Camera size={24} className="text-[#0077b8]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Take Photo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use your device camera to capture a photo of your card
              </p>
              <button
                onClick={onSelectCamera}
                className="w-full px-6 py-3 bg-[#0077b8] hover:bg-[#005f8f] text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#0077b8] font-medium"
              >
                Open Camera
              </button>
            </div>
          </div>

          {/* Upload Option */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Upload size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Photo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose an existing photo from your device
              </p>
              <button
                onClick={handleUploadClick}
                className="w-full mt-5 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 font-medium"
              >
                Choose File
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drag and Drop Area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragActive
            ? 'border-[#0077b8] bg-blue-50 text-[#0077b8]'
            : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <ImagePlus size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {isDragActive
              ? 'Drop your image here'
              : 'Or drag and drop an image file here'
            }
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

// Main CameraInput Component
// Main CameraInput Component
function CameraInput({ onBack }) {
  const [capturedImage, setCapturedImage] = useState(null);
  const [mode, setMode] = useState('select'); // 'select', 'camera', 'preview'
  const { id } = useAuthStore();

  const handleCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    setMode('preview');
  };

  const handleUpload = (imageSrc) => {
    setCapturedImage(imageSrc);
    setMode('preview');
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setMode('select');
  };

  const handleUsePhoto = async () => {
    try {
      let formData = new FormData();

      if (mode == 'select') {
        // If it's a file upload
        formData.append("image", uploadFile);
      } else if (capturedImage) {
        // If it's a camera capture (Base64 → Blob)
        const byteString = atob(capturedImage.split(",")[1]);
        const mimeString = capturedImage.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        
        // Tesseract.recognize(blob, "eng", {
        //   logger: (m) => console.log(m)  // progress
        // }).then(({ data: { text } }) => {
        //   console.log("OCR Result:", text);
        // });

        formData.append("image", blob, "photo.png");
        formData.append("user_id", id);
      }

      const res = await axios.post("http://localhost:8000/api/upload-contact", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload success:", res.data);
      if (onBack) onBack();
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const handleBackToSelect = () => {
    setMode('select');
  };

  // Remove the problematic useEffect cleanup

  // Show photo selection options
  if (mode === 'select') {
    return (
      <PhotoOptionSelector
        onSelectCamera={() => setMode('camera')}
        onSelectUpload={handleUpload}
        onBack={onBack}
      />
    );
  }

  // Show camera capture
  if (mode === 'camera') {
    return <CameraCapture onCapture={handleCapture} onBack={handleBackToSelect} />;
  }

  // Show image preview
  if (mode === 'preview' && capturedImage) {
    return (
      <div className="flex flex-col h-full w-full bg-[#F0F0F0] text-gray-800 max-h-[calc(100vh-180px)]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Preview Image</h2>
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
              alt="Card photo"
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
              Choose Different
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

  // Fallback to selection
  return (
    <PhotoOptionSelector
      onSelectCamera={() => setMode('camera')}
      onSelectUpload={handleUpload}
      onBack={onBack}
    />
  );
}


export default CameraInput;
