import { Routes, Route } from "react-router-dom";
import Error from "../pages/Error";
import Panel from "../pages/Panel";
import IniciarSesion from "../pages/IniciarSesion";

import Configuracion from "../Componentes/Secciones/Configuracion/Configuracion";
import Productos from "../Componentes/Secciones/Articulos/Productos/Productos";
import MateriaPrima from "../Componentes/Secciones/Articulos/MateriaPrima/MateriaPrima";
import Facturas from "../Componentes/Secciones/Ventas/Facturas/Facturas";
import CrearFactura from "../Componentes/Secciones/Ventas/CrearFactura/CrearFactura";
import OrdenDeVentas from "../Componentes/Secciones/Ventas/OrdenDeVentas/OrdenDeVentas";
import CrearOrdenDeVentas from "../Componentes/Secciones/Ventas/CrearOrdenDeVenta/CrearOrdeDeVenta";
import NotaDeCredito from "../Componentes/Secciones/Ventas/NotaDeCredito/NotaDeCredito";
import CrearNotaCredito from "../Componentes/Secciones/Ventas/CrearNotaCredito/CrearNotaCredito";
import NotaDeDebito from "../Componentes/Secciones/Ventas/NotaDeDebito/NotaDeDebito";
import CrearNotaDebito from "../Componentes/Secciones/Ventas/CrearNotaDebito/CrearNotaDebito";
import FacturasProveedor from "../Componentes/Secciones/Compras/FacturaProveedor/FacturaProveedor";
import CrearFacturaProveedor from "../Componentes/Secciones/Compras/CrearFacturaProveedor/CrearFacturaProveedor";
import PlanDeCuentas from "../Componentes/Secciones/Contabilidad/PlanDeCuentas/PlanDeCuentas";
import CrearPlanDeCuenta from "../Componentes/Secciones/Contabilidad/CrearPlanDeCuenta.jsx/CrearPlanDeCuenta";
import Asientos from "../Componentes/Secciones/Contabilidad/Asientos/Asientos";
import LibroDiario from "../Componentes/Secciones/Contabilidad/LibroDiario/LibroDiario";
import LibroMayor from "../Componentes/Secciones/Contabilidad/LibroMayor/LibroMayor";
import SistemaContable from "../pages/Demo";
import Alumnos from "../Componentes/Secciones/Escuela/Alumnos/Alumnos";
import CrearAlumnos from "../Componentes/Secciones/Escuela/CrearAlumnos/CrearAlumnos";
import Clientes from "../Componentes/Secciones/Contactos/Cliente/Clientes";
import Proveedores from "../Componentes/Secciones/Contactos/Proveedores/Proveedores";
import CrearProductos from "../Componentes/Secciones/Articulos/CrearArticulos/CrearProductos";
import CrearMateriaPrima from "../Componentes/Secciones/Articulos/CrearArticulos/CrearMateriaPrima";
import CrearClientes from "../Componentes/Secciones/Contactos/CrearContactos/CrearClientes";
import CrearProveedores from "../Componentes/Secciones/Contactos/CrearContactos/CrearProveedores";
import Cuotas from "../Componentes/Secciones/Escuela/Cuotas/Cuotas";
import Recibos from "../Componentes/Secciones/Escuela/Recibos/Recibos";
import CrearRecibo from "../Componentes/Secciones/Escuela/CrearRecibo/CrearRecibo";
import CrearAsientos from "../Componentes/Secciones/Contabilidad/CrearAsientos/CrearAsientos";

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

        {/* ESCUELA */}
        <Route path="escuela/alumnos" element={<Alumnos />} />
        <Route path="escuela/alumnos/nuevo" element={<CrearAlumnos />} />
        <Route path="escuela/cuotas" element={<Cuotas />} />
        <Route path="escuela/recibos" element={<Recibos />} />
        <Route path="escuela/recibos/nuevo" element={<CrearRecibo />} />

        {/* CONTABILIDAD */}
        <Route path="contabilidad/cuentas" element={<PlanDeCuentas />} />
        <Route
          path="contabilidad/cuentas/nueva"
          element={<CrearPlanDeCuenta />}
        />
        <Route path="contabilidad/asientos" element={<Asientos />} />
        <Route path="contabilidad/asientos/nuevo" element={<CrearAsientos />} />

        <Route path="contabilidad/libro-diario" element={<LibroDiario />} />
        <Route path="contabilidad/libro-mayor" element={<LibroMayor />} />
        <Route path="demo" element={<SistemaContable />} />
      </Route>

      {/* ERROR */}
      <Route path="*" element={<Error />} />
    </Routes>
  );
}
