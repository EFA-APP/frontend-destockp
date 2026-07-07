import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import RutaProtegida from "./RutaProtegida";
import RutaPublica from "./RutaPublica";
// Lazy Pages
const Error = lazy(() => import("../pages/Error"));
const Panel = lazy(() => import("../pages/Panel"));
const IniciarSesion = lazy(() => import("../pages/IniciarSesion"));
const SeleccionarUnidad = lazy(() => import("../pages/SeleccionarUnidad"));
const LandingPage = lazy(() => import("../pages/LandingPage"));
const ConfiguracionPaginaWeb = lazy(
  () =>
    import("../Componentes/Secciones/PaginaWeb/ConfiguracionGeneral/ConfiguracionPaginaWeb"),
);

// Lazy Components/Sections
const Configuracion = lazy(
  () => import("../Componentes/Secciones/Configuracion/Configuracion"),
);
const Productos = lazy(
  () => import("../Componentes/Secciones/Articulos/Productos/Productos"),
);
const MateriaPrima = lazy(
  () => import("../Componentes/Secciones/Articulos/MateriaPrima/MateriaPrima"),
);

const CrearComprobante = lazy(
  () =>
    import("../Componentes/Secciones/Comprobantes/CrearComprobante/CrearComprobante"),
);

const ListadosComprobante = lazy(
  () =>
    import("../Componentes/Secciones/Comprobantes/Listados/ListadoComprobante"),
);
const PlanDeCuentas = lazy(
  () =>
    import("../Componentes/Secciones/Contabilidad/PlanDeCuentas/PlanDeCuentas"),
);
const CrearPlanDeCuenta = lazy(
  () =>
    import("../Componentes/Secciones/Contabilidad/CrearContabilidad/CrearPlanDeCuenta"),
);
const Asientos = lazy(
  () => import("../Componentes/Secciones/Contabilidad/Asientos/Asientos"),
);
const LibroDiario = lazy(
  () => import("../Componentes/Secciones/Contabilidad/LibroDiario/LibroDiario"),
);
const LibroMayor = lazy(
  () => import("../Componentes/Secciones/Contabilidad/LibroMayor/LibroMayor"),
);
const DashboardContactos = lazy(
  () =>
    import("../Componentes/Secciones/Contactos/GestionContactos/DashboardContactos"),
);
const CrearProductos = lazy(
  () =>
    import("../Componentes/Secciones/Articulos/CrearArticulos/CrearProductos"),
);
const CrearMateriaPrima = lazy(
  () =>
    import("../Componentes/Secciones/Articulos/CrearArticulos/CrearMateriaPrima"),
);

const CrearAsientos = lazy(
  () =>
    import("../Componentes/Secciones/Contabilidad/CrearContabilidad/CrearAsientos/CrearAsientos"),
);
const Bienvenida = lazy(
  () => import("../Componentes/Secciones/Inicio/Bienvenida"),
);
const MisComprobantesAFIP = lazy(
  () =>
    import("../Componentes/Secciones/MisComprobantesAFIP/MisComprobantesAFIP"),
);
// const CrearRolesPermisos = lazy(
//   () =>
//     import("../Componentes/Secciones/Configuracion/RolesPermisos/CrearRoles/CrearRolesPermisos"),
// );
const Deposito = lazy(
  () => import("../Componentes/Secciones/Articulos/Deposito/Deposito"),
);
const GestionarDeposito = lazy(
  () => import("../Componentes/Secciones/Articulos/Deposito/GestionarDeposito"),
);
const HistorialStockPage = lazy(
  () => import("../Componentes/Secciones/Articulos/HistorialStockPage"),
);
const AjusteStockPage = lazy(
  () => import("../Componentes/Secciones/Articulos/AjusteStockPage"),
);
const ProduccionPage = lazy(
  () => import("../Componentes/Secciones/Articulos/ProduccionPage"),
);
const ProduccionSeleccionPage = lazy(
  () => import("../Componentes/Secciones/Articulos/ProduccionSeleccionPage"),
);
const ProduccionReportePage = lazy(
  () => import("../Componentes/Secciones/Articulos/ProduccionReportePage"),
);
const GestionProducto = lazy(
  () => import("../Componentes/Secciones/Articulos/Productos/GestionProducto"),
);
const GestionMateriaPrima = lazy(
  () =>
    import("../Componentes/Secciones/Articulos/MateriaPrima/GestionMateriaPrima"),
);
const ImportadorPrecios = lazy(
  () =>
    import("../Componentes/Secciones/Articulos/Importacion/ImportadorPrecios"),
);
const Empresas = lazy(
  () => import("../Componentes/Secciones/Sistema/Empresas"),
);

const NuevoIngreso = lazy(
  () => import("../Componentes/Secciones/Articulos/Movimientos/NuevoIngreso"),
);
const NuevoEgreso = lazy(
  () => import("../Componentes/Secciones/Articulos/Movimientos/NuevoEgreso"),
);
const HistorialMovimientos = lazy(
  () =>
    import("../Componentes/Secciones/Articulos/Movimientos/HistorialMovimientos"),
);
const ReportePorCliente = lazy(
  () => import("../Componentes/Secciones/Articulos/Reportes/ReportePorCliente"),
);
const ReportePorLote = lazy(
  () => import("../Componentes/Secciones/Articulos/Reportes/ReportePorLote"),
);
const ReporteUbicacionProducto = lazy(
  () =>
    import("../Componentes/Secciones/Articulos/Reportes/ReporteUbicacionProducto"),
);
const ReporteUbicacionGeneral = lazy(
  () =>
    import("../Componentes/Secciones/Articulos/Reportes/ReporteUbicacionGeneral"),
);
const MovimientosTesoreria = lazy(
  () =>
    import("../Componentes/Secciones/Tesoreria/Movimientos/MovimientosTesoreria"),
);
const LotesTarjeta = lazy(
  () => import("../Componentes/Secciones/Tesoreria/LotesTarjeta/LotesTarjeta"),
);
const ChequeTercero = lazy(
  () =>
    import("../Componentes/Secciones/Tesoreria/ChequeTercero/ChequeTercero"),
);
const CajaDiaria = lazy(
  () => import("../Componentes/Secciones/Tesoreria/CajaDiaria/CajaDiaria"),
);

const VistaCuentasCorrientes = lazy(
  () =>
    import("../Componentes/Secciones/CuentasCorrientes/VistaCuentasCorrientes"),
);

export default function Router() {
  return (
    <Suspense>
      <Routes>
        {/* 🌐 RUTAS LIBRES (Sin importar si está logueado) */}
        <Route path="/pagina/:slug" element={<LandingPage />} />

        {/* 🔓 RUTAS PÚBLICAS (Solo si NO está logueado) */}
        <Route element={<RutaPublica />}>
          <Route path="/" element={<IniciarSesion />} />
          <Route path="/seleccionar-unidad" element={<SeleccionarUnidad />} />
        </Route>

        {/* 🔐 PANEL (Solo si está logueado) */}
        <Route element={<RutaProtegida />}>
          <Route path="/panel" element={<Panel />}>
            <Route index element={<Bienvenida />} />

            {/* CONFIGURACION */}
            <Route element={<RutaProtegida />}>
              <Route path="configuracion" element={<Configuracion />} />
            </Route>

            {/* PAGINA WEB */}
            <Route element={<RutaProtegida />}>
              <Route
                path="pagina-web/configuracion"
                element={<ConfiguracionPaginaWeb />}
              />
            </Route>

            {/* INVENTARIO */}
            <Route element={<RutaProtegida />}>
              <Route path="inventario/productos" element={<Productos />} />
              <Route
                path="inventario/productos/nuevo"
                element={<CrearProductos />}
              />
              <Route
                path="inventario/productos/:id/acciones"
                element={<GestionProducto />}
              />
              <Route path="inventario/especies" element={<MateriaPrima />} />
              <Route
                path="inventario/especies/nuevo"
                element={<CrearMateriaPrima />}
              />
              <Route
                path="inventario/especies/:id/acciones"
                element={<GestionMateriaPrima />}
              />
              <Route
                path="inventario/especies/:id/editar"
                element={<CrearMateriaPrima />}
              />
              <Route
                path="inventario/materia-prima"
                element={<MateriaPrima />}
              />
              <Route
                path="inventario/materia-prima/nuevo"
                element={<CrearMateriaPrima />}
              />
              <Route
                path="inventario/materia-prima/:id/acciones"
                element={<GestionMateriaPrima />}
              />
              <Route path="inventario/depositos" element={<Deposito />} />
              <Route
                path="inventario/depositos/nuevo"
                element={<GestionarDeposito />}
              />
              <Route
                path="inventario/depositos/editar/"
                element={<GestionarDeposito />}
              />
              <Route path="inventario/galpones" element={<Deposito />} />
              <Route
                path="inventario/galpones/nuevo"
                element={<GestionarDeposito />}
              />
              <Route
                path="inventario/galpones/editar"
                element={<GestionarDeposito />}
              />
              <Route
                path="inventario/ajuste-stock/:tipo"
                element={<AjusteStockPage />}
              />
              <Route
                path="inventario/historial-stock/:tipo"
                element={<HistorialStockPage />}
              />
              <Route
                path="inventario/produccion/:id"
                element={<ProduccionPage />}
              />
              <Route
                path="inventario/produccion/nueva"
                element={<ProduccionSeleccionPage />}
              />
              <Route
                path="inventario/produccion/reporte"
                element={<ProduccionReportePage />}
              />
              <Route
                path="inventario/productos/:id/editar"
                element={<CrearProductos />}
              />
              <Route
                path="inventario/materia-prima/:id/editar"
                element={<CrearMateriaPrima />}
              />
              <Route
                path="inventario/importar-precios"
                element={<ImportadorPrecios />}
              />

              {/* MOVIMIENTOS DE STOCK (INGRESOS / EGRESOS / HISTORIAL) */}
              <Route path="movimientos/ingreso" element={<NuevoIngreso />} />
              <Route path="movimeintos/ingreso" element={<NuevoIngreso />} />

              <Route path="movimientos/egreso" element={<NuevoEgreso />} />
              <Route path="movimeintos/egreso" element={<NuevoEgreso />} />
              <Route path="movimeintos/egeso" element={<NuevoEgreso />} />

              <Route
                path="movimientos/historial-movimientos"
                element={<HistorialMovimientos />}
              />
              <Route
                path="movimeintos/historial-movimeitnos"
                element={<HistorialMovimientos />}
              />
              <Route
                path="movimientos/historial-movimeitnos"
                element={<HistorialMovimientos />}
              />

              {/* REPORTES DE GRANO */}
              <Route path="reportes/cliente" element={<ReportePorCliente />} />
              <Route path="reportes/lote" element={<ReportePorLote />} />
              <Route
                path="reportes/ubicacion-producto"
                element={<ReporteUbicacionProducto />}
              />
              <Route
                path="reportes/ubicacion-general"
                element={<ReporteUbicacionGeneral />}
              />
            </Route>

            {/* CONTACTOS */}
            <Route element={<RutaProtegida />}>
              <Route path="contactos" element={<DashboardContactos />} />
              <Route
                path="contactos/cuenta-corriente"
                element={<VistaCuentasCorrientes />}
              />
            </Route>
            {/* VENTAS */}
            <Route element={<RutaProtegida />}>
              <Route
                path="comprobantes/listados"
                element={<ListadosComprobante />}
              />
              <Route path="comprobantes/crear" element={<CrearComprobante />} />
            </Route>

            {/* CONTABILIDAD */}
            <Route element={<RutaProtegida />}>
              <Route path="contabilidad/cuentas" element={<PlanDeCuentas />} />
              <Route
                path="contabilidad/cuentas/nueva"
                element={<CrearPlanDeCuenta />}
              />
              <Route path="contabilidad/asientos" element={<Asientos />} />
              <Route
                path="contabilidad/asientos/nuevo"
                element={<CrearAsientos />}
              />
              <Route
                path="contabilidad/libro-diario"
                element={<LibroDiario />}
              />
              <Route path="contabilidad/libro-mayor" element={<LibroMayor />} />
            </Route>

            {/* AFIP */}
            <Route element={<RutaProtegida />}>
              <Route
                path="comprobantes-afip"
                element={<MisComprobantesAFIP />}
              />
            </Route>



            {/* TESORERÍA */}
            <Route element={<RutaProtegida />}>
              <Route
                path="tesoreria/movimientos"
                element={<MovimientosTesoreria />}
              />
              <Route
                path="tesoreria/lotes-tarjeta"
                element={<LotesTarjeta />}
              />
              <Route
                path="tesoreria/cheque-tercero"
                element={<ChequeTercero />}
              />
              <Route
                path="tesoreria/caja-diaria"
                element={<CajaDiaria />}
              />
            </Route>

            {/* SISTEMA */}
            <Route element={<RutaProtegida />}>
              <Route path="sistema/empresa" element={<Empresas />} />
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
