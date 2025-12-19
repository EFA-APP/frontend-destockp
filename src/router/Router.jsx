import { Routes, Route } from "react-router-dom";
import Error from "../pages/Error";
import Panel from "../pages/Panel";
import IniciarSesion from "../pages/IniciarSesion";

import ContenidoPanel from "../Componenetes/ContenidoPanel/ContenidoPanel";
import Configuracion from "../Componenetes/Secciones/Configuracion/Configuracion";
import Inventario from "../Componenetes/Secciones/Inventario/Inventario";

export default function Router() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/" element={<IniciarSesion />} />

      {/* PANEL (LAYOUT) */}
      <Route path="/panel" element={<Panel />}>
        {/* LAYOUT INTERNO */}
        <Route index element={<Configuracion />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="inventario" element={<Inventario />} />
      </Route>

      {/* ERROR */}
      <Route path="*" element={<Error />} />
    </Routes>
  );
}
