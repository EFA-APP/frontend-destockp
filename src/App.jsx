import "./App.css";
import { ContenedorAlerta } from "./Componentes/UI/Alertas/ContenedorAlerta";
import Router from "./router/Router";
import Cargador from "./Componentes/UI/Cargador/Cargador";
import { useVerificarToken } from "./Backend/Autenticacion/queries/Usuario/useVerificarToken.query";

export default function App() {
  // Inicializamos el hook de verificación de token
  useVerificarToken();

  return (
    <>
      <Cargador />
      <ContenedorAlerta />
      <Router />
    </>
  );
}
