// classifier.js - Lógica para el reconocimiento de señas simple (basado en heurísticas)

// Este archivo contiene funciones que analizan la geometría de los 21 puntos de referencia
// de la mano proporcionados por MediaPipe para determinar si se está realizando un gesto específico.
// Nota: El eje Y está invertido en las coordenadas de MediaPipe (menor Y = más arriba en la pantalla).

// Enum para las señas que reconoceremos
export const Gestures = {
    PEACE: 'Paz ✌️',
    HELLO: 'Hola 👋',
    THANK_YOU: 'Gracias 🙏',
    I_LOVE_YOU: 'Te Quiero 🤟',
    // Futuras señas se pueden añadir aquí
};

/**
 * Reconoce el gesto de "Paz" (dedos índice y corazón extendidos).
 * @param {Array} landmarks - Array de 21 puntos de referencia de la mano.
 * @returns {boolean} - True si el gesto es de paz, false en caso contrario.
 */
export function isPeaceSign(landmarks) {
    if (!landmarks || landmarks.length !== 21) return false;

    // Un dedo está "extendido" si la punta (tip) está más arriba que la articulación media (pip).
    const isIndexExtended = landmarks[8].y < landmarks[6].y;
    const isMiddleExtended = landmarks[12].y < landmarks[10].y;

    // Un dedo está "cerrado" si la punta está más abajo que la articulación media.
    const isRingCurled = landmarks[16].y > landmarks[14].y;
    const isPinkyCurled = landmarks[20].y > landmarks[18].y;

    return isIndexExtended && isMiddleExtended && isRingCurled && isPinkyCurled;
}

/**
 * Reconoce el gesto de "Hola" (mano abierta con todos los dedos extendidos).
 * @param {Array} landmarks - Array de 21 puntos de referencia de la mano.
 * @returns {boolean} - True si el gesto es de mano abierta, false en caso contrario.
 */
export function isHelloSign(landmarks) {
    if (!landmarks || landmarks.length !== 21) return false;

    // Para el pulgar, verificamos su posición horizontal respecto a la articulación anterior.
    // Esto es dependiente de si es la mano derecha o izquierda. Esta heurística es simple.
    const isThumbExtended = landmarks[4].x < landmarks[3].x; // Asumiendo mano derecha
    const isIndexExtended = landmarks[8].y < landmarks[6].y;
    const isMiddleExtended = landmarks[12].y < landmarks[10].y;
    const isRingExtended = landmarks[16].y < landmarks[14].y;
    const isPinkyExtended = landmarks[20].y < landmarks[18].y;

    return isThumbExtended && isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended;
}

/**
 * Reconoce el gesto de "Gracias" (mano plana, dedos juntos y extendidos).
 * @param {Array} landmarks - Array de 21 puntos de referencia de la mano.
 * @returns {boolean} - True si el gesto es de gracias, false en caso contrario.
 */
export function isThankYouSign(landmarks) {
    if (!landmarks || landmarks.length !== 21) return false;

    // 1. Todos los dedos (excepto el pulgar) están extendidos.
    const isIndexExtended = landmarks[8].y < landmarks[6].y;
    const isMiddleExtended = landmarks[12].y < landmarks[10].y;
    const isRingExtended = landmarks[16].y < landmarks[14].y;
    const isPinkyExtended = landmarks[20].y < landmarks[18].y;
    const allFingersExtended = isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended;

    if (!allFingersExtended) return false;

    // 2. Los dedos están juntos. Verificamos la distancia horizontal entre las puntas.
    const distanceIndexMiddle = Math.abs(landmarks[8].x - landmarks[12].x);
    const distanceMiddleRing = Math.abs(landmarks[12].x - landmarks[16].x);
    const distanceRingPinky = Math.abs(landmarks[16].x - landmarks[20].x);

    // El umbral es un valor pequeño, indica que los dedos no están muy separados.
    // Este valor puede necesitar ajuste.
    const threshold = 0.07; // 7% del ancho de la mano aprox.

    const fingersTogether = distanceIndexMiddle < threshold && distanceMiddleRing < threshold && distanceRingPinky < threshold;

    return fingersTogether;
}

/**
 * Reconoce el gesto de "Te Quiero" (I Love You).
 * @param {Array} landmarks - Array de 21 puntos de referencia de la mano.
 * @returns {boolean} - True si el gesto es ILY, false en caso contrario.
 */
export function isIlySign(landmarks) {
    if (!landmarks || landmarks.length !== 21) return false;

    // Pulgar, índice y meñique extendidos. Corazón y anular cerrados.
    const isThumbExtended = landmarks[4].x < landmarks[3].x; // Asumiendo mano derecha
    const isIndexExtended = landmarks[8].y < landmarks[6].y;
    const isPinkyExtended = landmarks[20].y < landmarks[18].y;

    const isMiddleCurled = landmarks[12].y > landmarks[10].y;
    const isRingCurled = landmarks[16].y > landmarks[14].y;

    return isThumbExtended && isIndexExtended && isPinkyExtended && isMiddleCurled && isRingCurled;
}
