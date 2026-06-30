import React from "react";
import "./App.css";
import { ContenedorAlerta } from "./Componentes/UI/Alertas/ContenedorAlerta";
import Router from "./router/Router";
import { useVerificarToken } from "./Backend/Autenticacion/queries/Usuario/useVerificarToken.query";
import { useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();
  useVerificarToken();
  return (
    <>
      <ContenedorAlerta />
      <Router />
    </>
  );
}
