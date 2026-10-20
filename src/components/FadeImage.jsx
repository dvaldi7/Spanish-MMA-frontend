import React, { useEffect, useRef, useState } from 'react';

// <img> con aparición suave al cargar (fade-in) sin saltos de diseño:
// el navegador reserva el tamaño por las clases CSS del caller.
// - Nunca queda invisible: onLoad y onError marcan la imagen como lista
//   (una imagen rota muestra su alt/estado de error, no desaparece).
// - Respeta prefers-reduced-motion vía CSS (.img-fade).
const FadeImage = ({ className = '', ...props }) => {
  const [ready, setReady] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // Imágenes ya completadas antes del efecto (caché o error previo)
    if (ref.current?.complete) setReady(true);
  }, []);

  return (
    <img
      {...props}
      ref={ref}
      className={`img-fade ${ready ? 'img-fade-loaded' : ''} ${className}`}
      onLoad={() => setReady(true)}
      onError={() => setReady(true)}
    />
  );
};

export default FadeImage;
