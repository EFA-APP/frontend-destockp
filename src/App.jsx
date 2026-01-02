import "./App.css";
import { ContenedorAlerta } from "./Componentes/UI/Alertas/ContenedorAlerta";
import Router from "./router/Router";

export default function App() {
  return (
    <>
      <ContenedorAlerta />
      <Router />
    </>
  );
}
