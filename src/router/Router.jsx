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
import CrearMateriaPrima from "../Componenetes/Secciones/CrearArticulos/CrearMateriaPrima";
import CrearClientes from "../Componenetes/Secciones/CrearContactos/CrearClientes";
import CrearProveedores from "../Componenetes/Secciones/CrearContactos/CrearProveedores";
import Facturas from "../Componenetes/Secciones/Ventas/Facturas/Facturas";
import CrearFactura from "../Componenetes/Secciones/Ventas/CrearFactura/CrearFactura";
import OrdenDeVentas from "../Componenetes/Secciones/Ventas/OrdenDeVentas/OrdenDeVentas";

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
        <Route
          path="inventario/materia-prima/nuevo"
          element={<CrearMateriaPrima />}
        />
        <Route path="contactos/clientes" element={<Clientes />} />
        <Route path="contactos/clientes/nuevo" element={<CrearClientes />} />
        <Route path="contactos/proveedores" element={<Proveedores />} />
        <Route
          path="contactos/proveedores/nuevo"
          element={<CrearProveedores />}
        />
        <Route path="ventas/facturas" element={<Facturas />} />
        <Route path="ventas/facturas/nueva" element={<CrearFactura />} />
        <Route path="ventas/orden-venta" element={<OrdenDeVentas />} />
      </Route>

      {/* ERROR */}
      <Route path="*" element={<Error />} />
    </Routes>
  );
}
