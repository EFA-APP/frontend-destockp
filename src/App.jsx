import "./App.css";
import { ContenedorAlerta } from "./Componentes/UI/Alertas/ContenedorAlerta";
import Router from "./router/Router";
import Cargador from "./Componentes/UI/Cargador/Cargador";

export default function App() {
  return (
    <>
      <Cargador />
      <ContenedorAlerta />
      <Router />
    </>
  );
}
