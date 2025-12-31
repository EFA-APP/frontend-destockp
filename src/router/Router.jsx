import { Routes, Route } from "react-router-dom";
import Error from "../pages/Error";
import Panel from "../pages/Panel";
import IniciarSesion from "../pages/IniciarSesion";

import Configuracion from "../Componenetes/Secciones/Configuracion/Configuracion";
import Clientes from "../Componenetes/Secciones/Contactos/Clientes";
import Productos from "../Componenetes/Secciones/Articulos/Productos/Productos";
import MateriaPrima from "../Componenetes/Secciones/Articulos/MateriaPrima/MateriaPrima";
import Proveedores from "../Componenetes/Secciones/Contactos/Proveedores";
import CrearProductos from "../Componenetes/Secciones/CrearArticulos/CrearProductos";
import CrearMateriaPrima from "../Componenetes/Secciones/CrearArticulos/CrearMateriaPrima";
import CrearClientes from "../Componenetes/Secciones/CrearContactos/CrearClientes";
import CrearProveedores from "../Componenetes/Secciones/CrearContactos/CrearProveedores";
import Facturas from "../Componenetes/Secciones/Ventas/Facturas/Facturas";
import CrearFactura from "../Componenetes/Secciones/Ventas/CrearFactura/CrearFactura";
import OrdenDeVentas from "../Componenetes/Secciones/Ventas/OrdenDeVentas/OrdenDeVentas";
import CrearOrdenDeVentas from "../Componenetes/Secciones/Ventas/CrearOrdenDeVenta/CrearOrdeDeVenta";
import NotaDeCredito from "../Componenetes/Secciones/Ventas/NotaDeCredito/NotaDeCredito";
import CrearNotaCredito from "../Componenetes/Secciones/Ventas/CrearNotaCredito/CrearNotaCredito";
import NotaDeDebito from "../Componenetes/Secciones/Ventas/NotaDeDebito/NotaDeDebito";
import CrearNotaDebito from "../Componenetes/Secciones/Ventas/CrearNotaDebito/CrearNotaDebito";
import FacturasProveedor from "../Componenetes/Secciones/Compras/FacturaProveedor/FacturaProveedor";
import CrearFacturaProveedor from "../Componenetes/Secciones/Compras/CrearFacturaProveedor/CrearFacturaProveedor";
import PlanDeCuentas from "../Componenetes/Secciones/Contabilidad/PlanDeCuentas/PlanDeCuentas";
import CrearPlanDeCuenta from "../Componenetes/Secciones/Contabilidad/CrearPlanDeCuenta.jsx/CrearPlanDeCuenta";
import Asientos from "../Componenetes/Secciones/Contabilidad/Asientos/Asientos";
import LibroDiario from "../Componenetes/Secciones/Contabilidad/LibroDiario/LibroDiario";

export default function Router() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/" element={<IniciarSesion />} />

      {/* PANEL (LAYOUT) */}
      <Route path="/panel" element={<Panel />}>
        {/* LAYOUT INTERNO */}
        <Route index element={<Configuracion />} />

        {/* CONFIGURACION */}
        <Route path="configuracion" element={<Configuracion />} />

        {/* INVENTARIO */}
        <Route path="inventario/productos" element={<Productos />} />
        <Route path="inventario/productos/nuevo" element={<CrearProductos />} />
        <Route path="inventario/materia-prima" element={<MateriaPrima />} />
        <Route
          path="inventario/materia-prima/nuevo"
          element={<CrearMateriaPrima />}
        />

        {/* CONTACTOS */}
        <Route path="contactos/clientes" element={<Clientes />} />
        <Route path="contactos/clientes/nuevo" element={<CrearClientes />} />
        <Route path="contactos/proveedores" element={<Proveedores />} />
        <Route
          path="contactos/proveedores/nuevo"
          element={<CrearProveedores />}
        />

        {/* VENTAS */}
        <Route path="ventas/facturas" element={<Facturas />} />
        <Route path="ventas/facturas/nueva" element={<CrearFactura />} />
        <Route path="ventas/orden-ventas" element={<OrdenDeVentas />} />
        <Route
          path="ventas/orden-ventas/nueva"
          element={<CrearOrdenDeVentas />}
        />
        <Route path="ventas/notas-creditos" element={<NotaDeCredito />} />
        <Route
          path="ventas/notas-creditos/nueva"
          element={<CrearNotaCredito />}
        />
        <Route path="ventas/notas-debitos" element={<NotaDeDebito />} />
        <Route
          path="ventas/notas-debitos/nueva"
          element={<CrearNotaDebito />}
        />

        {/* COMPRAS */}
        <Route
          path="compras/facturas-proveedores"
          element={<FacturasProveedor />}
        />

        <Route
          path="compras/facturas-proveedores/nueva"
          element={<CrearFacturaProveedor />}
        />

        {/* CONTABILIDAD */}
        <Route path="contabilidad/cuentas" element={<PlanDeCuentas />} />
        <Route
          path="contabilidad/cuentas/nueva"
          element={<CrearPlanDeCuenta />}
        />
        <Route path="contabilidad/asientos" element={<Asientos />} />
        <Route path="contabilidad/libro-diario" element={<LibroDiario />} />
      </Route>

      {/* ERROR */}
      <Route path="*" element={<Error />} />
    </Routes>
  );
}
