import { Routes, Route, Navigate } from "react-router-dom";
import Error from "../pages/Error";
import Panel from "../pages/Panel";
import IniciarSesion from "../pages/IniciarSesion";

import Configuracion from "../Componentes/Secciones/Configuracion/Configuracion";
import RolesPermisos from "../Componentes/Secciones/Configuracion/RolesPermisos/TablaUsuarioRoles/RolesPermisos";
import Productos from "../Componentes/Secciones/Articulos/Productos/Productos";
import MateriaPrima from "../Componentes/Secciones/Articulos/MateriaPrima/MateriaPrima";
import Facturas from "../Componentes/Secciones/Ventas/Facturas/Facturas";
import CrearFactura from "../Componentes/Secciones/Ventas/CrearVentas/CrearFactura/CrearFactura";
import OrdenDeVentas from "../Componentes/Secciones/Ventas/OrdenDeVentas/OrdenDeVentas";
import CrearOrdenDeVentas from "../Componentes/Secciones/Ventas/CrearVentas/CrearOrdenDeVenta/CrearOrdeDeVenta";
import NotaDeCredito from "../Componentes/Secciones/Ventas/NotaDeCredito/NotaDeCredito";
import CrearNotaCredito from "../Componentes/Secciones/Ventas/CrearVentas/CrearNotaCredito/CrearNotaCredito";
import NotaDeDebito from "../Componentes/Secciones/Ventas/NotaDeDebito/NotaDeDebito";
import CrearNotaDebito from "../Componentes/Secciones/Ventas/CrearVentas/CrearNotaDebito/CrearNotaDebito";
import FacturasProveedor from "../Componentes/Secciones/Compras/FacturaProveedor/FacturaProveedor";
import CrearFacturaProveedor from "../Componentes/Secciones/Compras/CrearFacturaProveedor/CrearFacturaProveedor";
import PlanDeCuentas from "../Componentes/Secciones/Contabilidad/PlanDeCuentas/PlanDeCuentas";
import CrearPlanDeCuenta from "../Componentes/Secciones/Contabilidad/CrearContabilidad/CrearPlanDeCuenta.jsx/CrearPlanDeCuenta";
import Asientos from "../Componentes/Secciones/Contabilidad/Asientos/Asientos";
import LibroDiario from "../Componentes/Secciones/Contabilidad/LibroDiario/LibroDiario";
import LibroMayor from "../Componentes/Secciones/Contabilidad/LibroMayor/LibroMayor";
import SistemaContable from "../pages/Demo";
import Alumnos from "../Componentes/Secciones/Escuela/Alumnos/Alumnos";
import CrearAlumnos from "../Componentes/Secciones/Escuela/CrearEscuela/CrearAlumnos/CrearAlumnos";
import Clientes from "../Componentes/Secciones/Contactos/Cliente/Clientes";
import Proveedores from "../Componentes/Secciones/Contactos/Proveedores/Proveedores";
import CrearProductos from "../Componentes/Secciones/Articulos/CrearArticulos/CrearProductos";
import CrearMateriaPrima from "../Componentes/Secciones/Articulos/CrearArticulos/CrearMateriaPrima";
import CrearClientes from "../Componentes/Secciones/Contactos/CrearContactos/CrearClientes";
import CrearProveedores from "../Componentes/Secciones/Contactos/CrearContactos/CrearProveedores";
import Cuotas from "../Componentes/Secciones/Escuela/Cuotas/Cuotas";
import Recibos from "../Componentes/Secciones/Escuela/Recibos/Recibos";
import CrearRecibo from "../Componentes/Secciones/Escuela/CrearEscuela/CrearRecibo/CrearRecibo";
import CrearAsientos from "../Componentes/Secciones/Contabilidad/CrearContabilidad/CrearAsientos/CrearAsientos";
import Balance from "../Componentes/Secciones/Contabilidad/Balance/Balance";
// import Inicio from "../Componentes/Secciones/Inicio/Inicio";
import Bienvenida from "../Componentes/Secciones/Inicio/Bienvenida";
import MisComprobantesAFIP from "../Componentes/Secciones/MisComprobantesAfip/MisComprobantesAFIP";
import CrearRolesPermisos from "../Componentes/Secciones/Configuracion/RolesPermisos/CrearRoles/CrearRolesPermisos";
import Deposito from "../Componentes/Secciones/Articulos/Deposito/Deposito";
import GestionarDeposito from "../Componentes/Secciones/Articulos/Deposito/GestionarDeposito";
import HistorialStockPage from "../Componentes/Secciones/Articulos/HistorialStockPage";
import AjusteStockPage from "../Componentes/Secciones/Articulos/AjusteStockPage";
import ProduccionPage from "../Componentes/Secciones/Articulos/ProduccionPage";
import ProduccionSeleccionPage from "../Componentes/Secciones/Articulos/ProduccionSeleccionPage";
import ProduccionReportePage from "../Componentes/Secciones/Articulos/ProduccionReportePage";
import SeleccionarProductoGestionPage from "../Componentes/Secciones/Articulos/Productos/SeleccionarProductoGestionPage";
import SeleccionarMateriaPrimaGestionPage from "../Componentes/Secciones/Articulos/MateriaPrima/SeleccionarMateriaPrimaGestionPage";

import RutaProtegida from "./RutaProtegida";
import RutaPublica from "./RutaPublica";
import GestionProducto from "../Componentes/Secciones/Articulos/Productos/GestionProducto";
import GestionMateriaPrima from "../Componentes/Secciones/Articulos/MateriaPrima/GestionMateriaPrima";

export default function Router() {
  return (
    <Routes>
      {/* 🔓 RUTAS PÚBLICAS (Solo si NO está logueado) */}
      <Route element={<RutaPublica />}>
        <Route path="/" element={<IniciarSesion />} />
      </Route>

      {/* 🔐 PANEL (Solo si está logueado) */}
      <Route element={<RutaProtegida />}>
        <Route path="/panel" element={<Panel />}>
          <Route index element={<Bienvenida />} />

          {/* CONFIGURACION */}
          <Route element={<RutaProtegida />}>
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="configuracion/roles" element={<RolesPermisos />} />
            <Route path="configuracion/roles/nuevo" element={<CrearRolesPermisos />} />
            <Route path="configuracion/roles/editar" element={<CrearRolesPermisos />} />
          </Route>

          {/* INVENTARIO */}
          <Route element={<RutaProtegida />}>
            <Route path="inventario/productos" element={<Productos />} />
            <Route path="inventario/productos/nuevo" element={<CrearProductos />} />
            <Route path="inventario/productos/:id/acciones" element={<GestionProducto />} />
            <Route path="inventario/materia-prima" element={<MateriaPrima />} />
            <Route path="inventario/materia-prima/nuevo" element={<CrearMateriaPrima />} />
            <Route path="inventario/materia-prima/:id/acciones" element={<GestionMateriaPrima />} />
            <Route path="inventario/depositos" element={<Deposito />} />
            <Route path="inventario/depositos/nuevo" element={<GestionarDeposito />} />
            <Route path="inventario/depositos/editar/" element={<GestionarDeposito />} />
            <Route path="inventario/ajuste-stock/:tipo" element={<AjusteStockPage />} />
            <Route path="inventario/historial-stock/:tipo" element={<HistorialStockPage />} />
            <Route path="inventario/produccion/:id" element={<ProduccionPage />} />
            <Route path="inventario/produccion/nueva" element={<ProduccionSeleccionPage />} />
            <Route path="inventario/produccion/reporte" element={<ProduccionReportePage />} />
            <Route path="inventario/productos/:id/editar" element={<CrearProductos />} />
            <Route path="inventario/materia-prima/:id/editar" element={<CrearMateriaPrima />} />
            <Route path="inventario/editar/productos" element={<SeleccionarProductoGestionPage />} />
            <Route path="inventario/editar/materia-prima" element={<SeleccionarMateriaPrimaGestionPage />} />
          </Route>

          {/* CONTACTOS */}
          <Route element={<RutaProtegida />}>
            <Route path="contactos/clientes" element={<Clientes />} />
            <Route path="contactos/clientes/nuevo" element={<CrearClientes />} />
            <Route path="contactos/proveedores" element={<Proveedores />} />
            <Route path="contactos/proveedores/nuevo" element={<CrearProveedores />} />
          </Route>

          {/* VENTAS */}
          <Route element={<RutaProtegida />}>
            <Route path="ventas/facturas" element={<Facturas />} />
            <Route path="ventas/facturas/nueva" element={<CrearFactura />} />

            <Route path="ventas/orden-ventas" element={<OrdenDeVentas />} />
            <Route path="ventas/orden-ventas/nueva" element={<CrearOrdenDeVentas />} />
            <Route path="ventas/notas-creditos" element={<NotaDeCredito />} />
            <Route path="ventas/notas-creditos/nueva" element={<CrearNotaCredito />} />
            <Route path="ventas/notas-debitos" element={<NotaDeDebito />} />
            <Route path="ventas/notas-debitos/nueva" element={<CrearNotaDebito />} />
          </Route>

          {/* COMPRAS */}
          <Route element={<RutaProtegida />}>
            <Route path="compras/facturas-proveedores" element={<FacturasProveedor />} />
            <Route path="compras/facturas-proveedores/nueva" element={<CrearFacturaProveedor />} />
          </Route>

          {/* ESCUELA */}
          <Route element={<RutaProtegida />}>
            <Route path="escuela/alumnos" element={<Alumnos />} />
            <Route path="escuela/alumnos/nuevo" element={<CrearAlumnos />} />
            <Route path="escuela/cuotas" element={<Cuotas />} />
            <Route path="escuela/recibos" element={<Recibos />} />
            <Route path="escuela/recibos/nuevo" element={<CrearRecibo />} />
          </Route>

          {/* CONTABILIDAD */}
          <Route element={<RutaProtegida />}>
            <Route path="contabilidad/cuentas" element={<PlanDeCuentas />} />
            <Route path="contabilidad/cuentas/nueva" element={<CrearPlanDeCuenta />} />
            <Route path="contabilidad/asientos" element={<Asientos />} />
            <Route path="contabilidad/asientos/nuevo" element={<CrearAsientos />} />
            <Route path="contabilidad/libro-diario" element={<LibroDiario />} />
            <Route path="contabilidad/libro-mayor" element={<LibroMayor />} />
            <Route path="contabilidad/balance" element={<Balance />} />
          </Route>

          {/* AFIP */}
          <Route element={<RutaProtegida />}>
            <Route path="comprobantes-afip" element={<MisComprobantesAFIP />} />
          </Route>

          {/* <Route path="demo" element={<SistemaContable />} /> */}
        </Route>
      </Route>

      {/* ERROR */}
      <Route path="*" element={<Error />} />
    </Routes>
  );
}
