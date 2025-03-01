import React, { useRef, useState, useEffect } from "react";
import jsQR from "jsqr";
import "./qr.css"
const QRScanner = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [qrData, setQrData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            } catch (err) {
                console.error("Error accessing the camera:", err);
                setError("Camera access is denied or unavailable.");
            }
        };

        startCamera();

        return () => {
            // Stop the camera stream on component unmount
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const scanCode = () => {
        if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);

            if (code) {
                setQrData(code.data); // Save the decoded QR code data
                console.log("QR Code Data:", code.data);
            } else {
                requestAnimationFrame(scanCode); // Continue scanning if no QR code found
            }
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            scanCode();
        }, 500); // Scan every 500ms
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1>QR Code Scanner</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <video ref={videoRef} style={{ width: "100%" }} muted playsInline></video>
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
            {qrData && (
                <div>
                    <h2>QR Code Data:</h2>
                    <p>{qrData}</p>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
