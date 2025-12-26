import { Routes, Route } from "react-router-dom";
import Error from "../pages/Error";
import Panel from "../pages/Panel";
import IniciarSesion from "../pages/IniciarSesion";

import Configuracion from "../Componenetes/Secciones/Configuracion/Configuracion";
import Clientes from "../Componenetes/Secciones/Contactos/Clientes";
import Productos from "../Componenetes/Secciones/Articulos/Productos";
import MateriaPrima from "../Componenetes/Secciones/Articulos/MateriaPrima";
import Proveedores from "../Componenetes/Secciones/Contactos/Proveedores";
import CrearProductos from "../Componenetes/Secciones/CrearArticulos/CrearProductos";

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
        <Route path="inventario/productos" element={<Productos />} />
        <Route path="inventario/productos/nuevo" element={<CrearProductos />} />
        <Route path="inventario/materia-prima" element={<MateriaPrima />} />
        <Route path="contactos/clientes" element={<Clientes />} />
        <Route path="contactos/proveedores" element={<Proveedores />} />
      </Route>

      {/* ERROR */}
      <Route path="*" element={<Error />} />
    </Routes>
  );
}
