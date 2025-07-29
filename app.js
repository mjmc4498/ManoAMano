// app.js - Lógica principal de la aplicación Mano a Mano

import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.js";
import { Gestures, isPeaceSign, isHelloSign, isThankYouSign, isIlySign } from './classifier.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Referencias a los elementos del DOM
    const videoElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('output-canvas');
    const canvasCtx = canvasElement.getContext('2d');
    const resultText = document.getElementById('result-text');
    const audioToggleButton = document.getElementById('audio-toggle');

    let handLandmarker;
    let lastVideoTime = -1;
    let lastSpokenGesture = null;
    let isAudioEnabled = false;

    /**
     * Usa la Web Speech API para pronunciar un texto.
     * @param {string} text - El texto a pronunciar.
     */
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            // Limpia la cola de síntesis para evitar que se acumulen frases.
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES'; // Configura el idioma a español
            window.speechSynthesis.speak(utterance);
        } else {
            console.error("La API de Síntesis de Voz no es soportada en este navegador.");
        }
    };

    /**
     * Inicializa el modelo HandLandmarker de MediaPipe.
     * Carga el modelo y lo configura para ejecutarse en modo video,
     * utilizando la GPU si está disponible.
     */
    const createHandLandmarker = async () => {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO", // Procesar un stream de video
            numHands: 2 // Detectar hasta 2 manos
        });
        resultText.textContent = "¡Listo! Muestra tus manos a la cámara.";
    };

    // Inicializa el modelo al cargar la página
    await createHandLandmarker();

    // Configura el botón de audio
    audioToggleButton.classList.add('off'); // Estado inicial apagado
    audioToggleButton.addEventListener('click', () => {
        isAudioEnabled = !isAudioEnabled;
        audioToggleButton.classList.toggle('off');

        // Si se apaga el audio, cancela cualquier locución pendiente
        if (!isAudioEnabled) {
            window.speechSynthesis.cancel();
        }
    });

    // Activa la cámara web del usuario
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
            .then((stream) => {
                videoElement.srcObject = stream;
                // Una vez que los datos del video se han cargado, comienza el bucle de predicción.
                videoElement.addEventListener("loadeddata", predictWebcam);
            })
            .catch((err) => {
                console.error("Error al acceder a la cámara: ", err);
                resultText.textContent = 'Error: No se pudo acceder a la cámara.';
            });
    }

    /**
     * El bucle principal de la aplicación. Se ejecuta en cada frame de animación.
     * Detecta las manos en el frame actual del video, las dibuja en el canvas
     * y las pasa al clasificador de gestos.
     */
    const predictWebcam = () => {
        // Ajusta el tamaño del canvas para que coincida con las dimensiones del video
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;

        // Solo procesa si el video está activo y el modelo está cargado
        if (lastVideoTime !== videoElement.currentTime && handLandmarker) {
            lastVideoTime = videoElement.currentTime;
            const results = handLandmarker.detectForVideo(videoElement, performance.now());

            // Limpia el canvas antes de dibujar el nuevo frame
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            // Si se detectan manos...
            if (results.landmarks && results.landmarks.length > 0) {
                // Dibuja los puntos de referencia de las manos
                for (const landmarks of results.landmarks) {
                    // Aquí se usaría `drawConnectors` y `drawLandmarks` de MediaPipe si se importaran.
                    // Por ahora, una simple visualización de puntos.
                    for (const point of landmarks) {
                        canvasCtx.beginPath();
                        canvasCtx.arc(point.x * canvasElement.width, point.y * canvasElement.height, 5, 0, 2 * Math.PI);
                        canvasCtx.fillStyle = 'aqua';
                        canvasCtx.fill();
                    }
                }

                // Clasifica el gesto de la primera mano detectada
                const firstHandLandmarks = results.landmarks[0];
                let detectedGesture = "No se detecta seña";

                if (isIlySign(firstHandLandmarks)) {
                    detectedGesture = Gestures.I_LOVE_YOU;
                } else if (isThankYouSign(firstHandLandmarks)) {
                    detectedGesture = Gestures.THANK_YOU;
                } else if (isPeaceSign(firstHandLandmarks)) {
                    detectedGesture = Gestures.PEACE;
                } else if (isHelloSign(firstHandLandmarks)) {
                    detectedGesture = Gestures.HELLO;
                }

                // Muestra el resultado
                resultText.textContent = detectedGesture;

                // Habla el resultado si el audio está activado, es una seña nueva y no es la de "no detecta"
                if (isAudioEnabled && detectedGesture !== "No se detecta seña" && detectedGesture !== lastSpokenGesture) {
                    speak(detectedGesture);
                    lastSpokenGesture = detectedGesture;
                } else if (detectedGesture === "No se detecta seña") {
                    lastSpokenGesture = null; // Resetea si no hay seña
                }

            } else {
                resultText.textContent = "No se detectan manos";
                lastSpokenGesture = null; // Resetea si no hay manos
            }
            canvasCtx.restore();
        }

        // Vuelve a llamar a la función en el siguiente frame para crear un bucle continuo
        window.requestAnimationFrame(predictWebcam);
    };
});
