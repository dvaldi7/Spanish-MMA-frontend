import React, { useEffect, useRef, useState } from 'react';

// <img> con aparición suave al cargar (fade-in) sin saltos de diseño:
// el navegador reserva el tamaño por las clases CSS del caller.
// Respeta prefers-reduced-motion vía CSS (.img-fade).
const FadeImage = ({ className = '', ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // Imágenes ya en caché que completaron antes del efecto (no siempre disparan onLoad)
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <img
      {...props}
      ref={ref}
      className={`img-fade ${loaded ? 'img-fade-loaded' : ''} ${className}`}
      onLoad={() => setLoaded(true)}
    />
  );
};

export default FadeImage;
