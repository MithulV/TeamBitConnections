import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  RotateCcw,
  ArrowLeft,
  RefreshCw,
  X,
  Plus,
} from "lucide-react";
import { useAuthStore } from "../../store/AuthStore";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import Alert from "../Alert";
import axios from "axios";

function CameraInput() {
  const { id } = useAuthStore();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [currentView, setCurrentView] = useState("initial"); // 'initial', 'camera-active', 'captured'
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // 'environment' for back, 'user' for front
  const [isFromUpload, setIsFromUpload] = useState(false);

  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

  const showAlert = (severity, message) => {
    setAlert({
      isOpen: true,
      severity,
      message,
    });
  };

  const closeAlert = () => {
    setAlert((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  // Start camera with specified facing mode
  const startCamera = async () => {
    try {
      setLoading(true);

      // Stop existing stream first
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Wait for video to be ready and then play
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              .play()
              .then(resolve)
              .catch((e) => {
                console.error("Error playing video:", e);
                resolve();
              });
          };
        });
      }

      setCurrentView("camera-active");
      setIsFromUpload(false);
    } catch (error) {
      console.error("Error accessing camera:", error);
      if (error.name === "NotAllowedError") {
        showAlert(
          "error",
          "Camera access denied. Please allow camera permissions."
        );
      } else if (error.name === "NotFoundError") {
        showAlert("error", "No camera found on this device.");
      } else {
        showAlert("error", "Unable to access camera. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Stop camera and clean up
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
    }
  };

  // Switch between front and back camera
  const switchCamera = () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);
  };

  // Capture photo from video
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(imageData);
      stopCamera();
      setCurrentView("captured");
    }
  };

  // Handle back navigation
  const handleBack = () => {
    stopCamera();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // Go back to previous step
  const goBack = () => {
    if (currentView === "camera-active") {
      stopCamera();
      setCurrentView("initial");
    } else if (currentView === "captured") {
      setCapturedImage(null);
      setCurrentView("initial");
    } else {
      handleBack();
    }
  };

  // Handle retake
  const handleRetake = () => {
    if (isFromUpload) {
      // For uploaded images, trigger file selection again
      fileInputRef.current?.click();
    } else {
      // For camera captures, restart camera
      setCapturedImage(null);
      setCurrentView("camera-active");
      startCamera();
    }
  };

  // Handle cancel from captured state
  const handleCancel = () => {
    setCapturedImage(null);
    setCurrentView("initial");
    setIsFromUpload(false);
    stopCamera(); // Make sure camera is stopped
  };

  // Handle file selection from upload
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result);
        setCurrentView("captured");
        setIsFromUpload(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save photo (upload without event details)
  const handleSavePhoto = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      // Convert base64 to blob
      const base64Data = capturedImage.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      // Create FormData
      const formData = new FormData();
      formData.append("photo", blob, "business-card.jpg");
      formData.append("user_id", id);

      const response = await axios.post(
        "http://localhost:5000/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        showAlert("success", "Photo uploaded successfully!");
        // Reset state
        setCapturedImage(null);
        setCurrentView("initial");
        setIsFromUpload(false);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      showAlert("error", "Failed to upload photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Restart camera when facing mode changes
  useEffect(() => {
    if (currentView === "camera-active") {
      startCamera();
    }
  }, [facingMode, currentView]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#ffffff]">
      <Alert
        isOpen={alert.isOpen}
        severity={alert.severity}
        message={alert.message}
        onClose={closeAlert}
        position="bottom"
        duration={4000}
      />

      {/* Header with Back Button */}
      <div className="w-full bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <button
              onClick={goBack}
              className="px-4 py-2 ml-5 flex items-center gap-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
          <div className="flex-shrink-0">
            <Header />
          </div>
        </div>
      </div>

      <hr className="border-0 border-t border-gray-300 opacity-60" />

      {/* Camera Content */}
      <div className="flex-1 bg-[#F0F0F0] p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Scan Business Card
          </h2>

          {/* Initial State - Choose between Camera or Upload */}
          {currentView === "initial" && (
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Camera size={32} className="text-blue-600" />
                </div>

                <h3 className="text-lg font-semibold mb-2">Choose an Option</h3>
                <p className="text-gray-600 mb-6">
                  Take a photo or select from your device
                </p>

                <div className="space-y-3 max-w-md mx-auto">
                  <button
                    onClick={startCamera}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <Camera size={20} />
                    {loading ? "Starting Camera..." : "Use Camera"}
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <Upload size={20} />
                    Upload Photo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Camera Active State */}
          {currentView === "camera-active" && (
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-center">
                <div className="relative bg-black rounded-lg overflow-hidden mb-4 max-w-2xl mx-auto">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto max-h-96 object-cover"
                  />

                  {/* Camera Switch Button - Overlay */}
                  <button
                    onClick={switchCamera}
                    className="absolute top-3 right-3 px-3 py-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-75 transition-colors text-sm font-medium"
                  >
                    <RefreshCw size={16} className="inline mr-1" />
                    {facingMode === "environment" ? "Front" : "Back"}
                  </button>
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={capturePhoto}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Camera size={20} />
                    Take Photo
                  </button>

                  <button
                    onClick={() => {
                      stopCamera();
                      setCurrentView("initial");
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Image Captured State */}
          {currentView === "captured" && (
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <h3 className="text-lg font-semibold mb-4">
                Photo {isFromUpload ? "Selected" : "Captured"}
              </h3>

              <div className="mb-6">
                <img
                  src={capturedImage}
                  alt="Business card"
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-sm border border-gray-200"
                />
              </div>

              {/* Updated button layout with Cancel button */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() =>
                    navigate("/event-details", { state: { capturedImage } })
                  }
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Plus size={20} />
                  Add Event Details
                </button>

                <button
                  onClick={handleRetake}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  <RotateCcw size={20} />
                  {isFromUpload ? "Reupload" : "Retake"}
                </button>

                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default CameraInput;
