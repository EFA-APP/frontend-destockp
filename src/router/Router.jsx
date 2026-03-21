import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import RutaProtegida from "./RutaProtegida";
import RutaPublica from "./RutaPublica";

// Lazy Pages
const Error = lazy(() => import("../pages/Error"));
const Panel = lazy(() => import("../pages/Panel"));
const IniciarSesion = lazy(() => import("../pages/IniciarSesion"));

// Lazy Components/Sections
const Configuracion = lazy(() => import("../Componentes/Secciones/Configuracion/Configuracion"));
const RolesPermisos = lazy(() => import("../Componentes/Secciones/Configuracion/RolesPermisos/TablaUsuarioRoles/RolesPermisos"));
const Productos = lazy(() => import("../Componentes/Secciones/Articulos/Productos/Productos"));
const MateriaPrima = lazy(() => import("../Componentes/Secciones/Articulos/MateriaPrima/MateriaPrima"));
const Facturas = lazy(() => import("../Componentes/Secciones/Ventas/Facturas/Facturas"));
const CrearFactura = lazy(() => import("../Componentes/Secciones/Ventas/CrearVentas/CrearFactura/CrearFactura"));
const OrdenDeVentas = lazy(() => import("../Componentes/Secciones/Ventas/OrdenDeVentas/OrdenDeVentas"));
const CrearOrdenDeVentas = lazy(() => import("../Componentes/Secciones/Ventas/CrearVentas/CrearOrdenDeVenta/CrearOrdeDeVenta"));
const NotaDeCredito = lazy(() => import("../Componentes/Secciones/Ventas/NotaDeCredito/NotaDeCredito"));
const CrearNotaCredito = lazy(() => import("../Componentes/Secciones/Ventas/CrearVentas/CrearNotaCredito/CrearNotaCredito"));
const NotaDeDebito = lazy(() => import("../Componentes/Secciones/Ventas/NotaDeDebito/NotaDeDebito"));
const CrearNotaDebito = lazy(() => import("../Componentes/Secciones/Ventas/CrearVentas/CrearNotaDebito/CrearNotaDebito"));
const FacturasProveedor = lazy(() => import("../Componentes/Secciones/Compras/FacturaProveedor/FacturaProveedor"));
const CrearFacturaProveedor = lazy(() => import("../Componentes/Secciones/Compras/CrearFacturaProveedor/CrearFacturaProveedor"));
const PlanDeCuentas = lazy(() => import("../Componentes/Secciones/Contabilidad/PlanDeCuentas/PlanDeCuentas"));
const CrearPlanDeCuenta = lazy(() => import("../Componentes/Secciones/Contabilidad/CrearContabilidad/CrearPlanDeCuenta.jsx/CrearPlanDeCuenta"));
const Asientos = lazy(() => import("../Componentes/Secciones/Contabilidad/Asientos/Asientos"));
const LibroDiario = lazy(() => import("../Componentes/Secciones/Contabilidad/LibroDiario/LibroDiario"));
const LibroMayor = lazy(() => import("../Componentes/Secciones/Contabilidad/LibroMayor/LibroMayor"));
const SistemaContable = lazy(() => import("../pages/Demo"));
const Alumnos = lazy(() => import("../Componentes/Secciones/Escuela/Alumnos/Alumnos"));
const CrearAlumnos = lazy(() => import("../Componentes/Secciones/Escuela/CrearEscuela/CrearAlumnos/CrearAlumnos"));
const Clientes = lazy(() => import("../Componentes/Secciones/Contactos/Cliente/Clientes"));
const Proveedores = lazy(() => import("../Componentes/Secciones/Contactos/Proveedores/Proveedores"));
const CrearProductos = lazy(() => import("../Componentes/Secciones/Articulos/CrearArticulos/CrearProductos"));
const CrearMateriaPrima = lazy(() => import("../Componentes/Secciones/Articulos/CrearArticulos/CrearMateriaPrima"));
const CrearClientes = lazy(() => import("../Componentes/Secciones/Contactos/CrearContactos/CrearClientes"));
const CrearProveedores = lazy(() => import("../Componentes/Secciones/Contactos/CrearContactos/CrearProveedores"));
const Cuotas = lazy(() => import("../Componentes/Secciones/Escuela/Cuotas/Cuotas"));
const Recibos = lazy(() => import("../Componentes/Secciones/Escuela/Recibos/Recibos"));
const CrearRecibo = lazy(() => import("../Componentes/Secciones/Escuela/CrearEscuela/CrearRecibo/CrearRecibo"));
const CrearAsientos = lazy(() => import("../Componentes/Secciones/Contabilidad/CrearContabilidad/CrearAsientos/CrearAsientos"));
const Balance = lazy(() => import("../Componentes/Secciones/Contabilidad/Balance/Balance"));
const Bienvenida = lazy(() => import("../Componentes/Secciones/Inicio/Bienvenida"));
const MisComprobantesAFIP = lazy(() => import("../Componentes/Secciones/MisComprobantesAFIP/MisComprobantesAFIP"));
const CrearRolesPermisos = lazy(() => import("../Componentes/Secciones/Configuracion/RolesPermisos/CrearRoles/CrearRolesPermisos"));
const Deposito = lazy(() => import("../Componentes/Secciones/Articulos/Deposito/Deposito"));
const GestionarDeposito = lazy(() => import("../Componentes/Secciones/Articulos/Deposito/GestionarDeposito"));
const HistorialStockPage = lazy(() => import("../Componentes/Secciones/Articulos/HistorialStockPage"));
const AjusteStockPage = lazy(() => import("../Componentes/Secciones/Articulos/AjusteStockPage"));
const ProduccionPage = lazy(() => import("../Componentes/Secciones/Articulos/ProduccionPage"));
const ProduccionSeleccionPage = lazy(() => import("../Componentes/Secciones/Articulos/ProduccionSeleccionPage"));
const ProduccionReportePage = lazy(() => import("../Componentes/Secciones/Articulos/ProduccionReportePage"));
const GestionProducto = lazy(() => import("../Componentes/Secciones/Articulos/Productos/GestionProducto"));
const GestionMateriaPrima = lazy(() => import("../Componentes/Secciones/Articulos/MateriaPrima/GestionMateriaPrima"));


export default function Router() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen bg-[var(--surface)] text-[var(--text-muted)]">Cargando...</div>}>
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
    </Suspense>
  );
}
