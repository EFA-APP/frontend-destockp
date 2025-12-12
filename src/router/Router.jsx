import { Routes, Route } from "react-router-dom";
import Error from "../pages/Error";
import Panel from "../pages/Panel";
import IniciarSesion from "../pages/IniciarSesion";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<IniciarSesion />} />
      <Route path="/panel" element={<Panel />} />

      <Route path="*" element={<Error />} />
    </Routes>
  );
}
