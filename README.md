# Mano a Mano - Prototipo de Traductor de Lengua de Señas

Este es un prototipo de una aplicación web diseñada para traducir la Lengua de Señas Americana (ASL) a texto en tiempo real, utilizando la cámara de un dispositivo. El objetivo del proyecto "Mano a Mano" es promover la inclusión y facilitar la comunicación entre personas sordas y oyentes.

## Características Actuales

- **Detección de Manos en Tiempo Real:** Utiliza MediaPipe Hands para detectar y rastrear los puntos de referencia de las manos a través de la cámara web.
- **Visualización de Puntos de Referencia:** Dibuja los puntos de las manos detectadas sobre un canvas para una visualización clara de lo que la aplicación está "viendo".
- **Clasificador Básico de Señas:** Incluye un clasificador simple basado en reglas (heurísticas) que puede reconocer las siguientes señas estáticas:
    - **Paz** (✌️)
    - **Hola** (mano abierta 👋)
- **Interfaz Web Simple:** Una interfaz de usuario limpia que muestra el stream de la cámara y el resultado de la traducción de texto.

## Cómo Ejecutarlo

1.  Debido a las políticas de seguridad de los navegadores para `getUserMedia` (acceso a la cámara), no puedes simplemente abrir el `index.html` desde el sistema de archivos. Necesitas servir los archivos a través de un servidor web local.
2.  Si tienes Python instalado, la forma más sencilla es ejecutar el siguiente comando en la raíz del proyecto:
    ```bash
    python -m http.server
    ```
3.  Luego, abre tu navegador y ve a `http://localhost:8000`.
4.  Otorga el permiso para acceder a la cámara cuando el navegador te lo solicite.

## Tecnologías Utilizadas

- **HTML5, CSS3, JavaScript (ES Modules)**
- **MediaPipe Tasks for Vision:** Para la detección de manos.
- **Sin dependencias de frameworks.** Es vainilla JS.

## Próximos Pasos

Este prototipo es la base para futuras mejoras, que podrían incluir:
- Entrenar un modelo de Machine Learning (con TensorFlow.js) para reconocer un vocabulario de señas mucho más amplio y complejo.
- Añadir más señas al clasificador heurístico actual.
- Implementar la síntesis de voz para leer el texto traducido.
- Desarrollar la funcionalidad de traducción de texto a señas mediante avatares.
