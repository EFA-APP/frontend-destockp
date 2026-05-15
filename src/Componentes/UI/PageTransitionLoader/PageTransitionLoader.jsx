import React, { useState, useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const PageTransitionLoader = ({ children }) => {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  // Detectamos el cambio de ruta de forma INMEDIATA durante el renderizado
  if (location.pathname !== displayLocation.pathname && !isNavigating) {
    setIsNavigating(true);
    setDisplayLocation(location);
  }

  useEffect(() => {
    if (isNavigating) {
      // El timer asegura que el loader se vea al menos un tiempo mínimo
      // para evitar parpadeos, pero permite que la nueva vista se monte.
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isNavigating, location.pathname]);

  return (
    <div className="relative w-full h-full">
      {/* CONTENIDO */}
      <div
        className={`transition-all duration-300 ease-out ${
          isNavigating
            ? "opacity-0 blur-md scale-[0.99] pointer-events-none"
            : "opacity-100 blur-0 scale-100"
        }`}
      >
        {children}
      </div>

      {/* OVERLAY DE CARGA - Absolute para centrarse en el área de contenido */}
      {isNavigating && (
        <div className="absolute inset-0 z-[40] flex justify-center items-center pointer-events-none">
          {/* Fondo desenfocado que cubre todo pero queda "atrás" de los menús */}
          <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-sm animate-in fade-in duration-150" />

          <div className="relative flex flex-col items-center gap-3 animate-in zoom-in-95 duration-150">
            <div className="relative">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40 whitespace-nowrap">
                Cargando Sección
              </span>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageTransitionLoader;
