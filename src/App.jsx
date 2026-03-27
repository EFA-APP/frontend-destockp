import React, { useEffect } from "react";
import "./App.css";
import { ContenedorAlerta } from "./Componentes/UI/Alertas/ContenedorAlerta";
import Router from "./router/Router";
import Cargador from "./Componentes/UI/Cargador/Cargador";
import { useVerificarToken } from "./Backend/Autenticacion/queries/Usuario/useVerificarToken.query";
import { useLocation } from "react-router-dom";
import useCargadorStore from "./store/useCargadorStore";
import { useAuthStore } from "./Backend/Autenticacion/store/authenticacion.store";
import { ControladorVersiones } from "./Componentes/UI/ControladorVersiones/ControladorVersiones";

const hexToHsl = (hex) => {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#"))
    return { h: 0, s: 0, l: 0 };
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export default function App() {
  const location = useLocation();
  const setCargando = useCargadorStore((state) => state.setCargando);
  const usuario = useAuthStore((state) => state.usuario);

  // Inicializamos el hook de verificación de token
  useVerificarToken();

  useEffect(() => {
    const config = usuario?.configuracionVisual; // En el token lo pusimos en usuario.configuracionVisual o usuario.empresa?
    // Wait! IniciarSesion.casodeuso set: usuario.configuracionVisual = usuario.empresa?.configuracionVisual
    // Let me check that
    if (config?.colorPrimario) {
      const { h, s, l } = hexToHsl(config.colorPrimario);
      document.documentElement.style.setProperty("--p-h", String(h));
      document.documentElement.style.setProperty("--p-s", `${s}%`);
      document.documentElement.style.setProperty("--p-l", `${l}%`);
    }
    if (config?.colorSecundario) {
      const { h, s, l } = hexToHsl(config.colorSecundario);
      document.documentElement.style.setProperty("--s-h", String(h));
      document.documentElement.style.setProperty("--s-s", `${s}%`);
      document.documentElement.style.setProperty("--s-l", `${l}%`);
    }
  }, [usuario?.configuracionVisual]);

  // 🔄 Detener loader en cada cambio de ruta
  useEffect(() => {
    setCargando(false);
  }, [location.pathname, setCargando]);

  return (
    <>
      <Cargador />
      <ContenedorAlerta />
      <ControladorVersiones />
      <Router />
    </>
  );
}
