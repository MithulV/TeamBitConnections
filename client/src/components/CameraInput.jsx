import React,{useRef,useState,useCallback,useEffect} from 'react'
import Webcam from 'react-webcam'
const CameraCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");

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
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/png"
        screenshotQuality={1}
        mirrored={true}
        videoConstraints={{
          width: { ideal: 4096 },
          height: { ideal: 2160 },
          facingMode,
          frameRate: { ideal: 30 },
          aspectRatio: { ideal: 16 / 9 },
        }}
        style={{ width: "100%", maxWidth: "100%", height: "auto", objectFit: "contain" }}
      />
      <div>
        <button variant="outlined"  onClick={capture}>
          Take Photo
        </button>
        <button variant="contained"  onClick={toggleCamera}>
          Switch Camera
        </button>
      </div>
    </div>
  );
};
function CameraInput() {
  return (
    <div>
      <CameraCapture/>
    </div>
  )
}

export default CameraInput