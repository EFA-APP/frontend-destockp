import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import RutaProtegida from "./RutaProtegida";
import RutaPublica from "./RutaPublica";

// Lazy Pages
const Error = lazy(() => import("../pages/Error"));
const Panel = lazy(() => import("../pages/Panel"));
const IniciarSesion = lazy(() => import("../pages/IniciarSesion"));
const SeleccionarUnidad = lazy(() => import("../pages/SeleccionarUnidad"));

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
const Comprobantes = lazy(
  () => import("../Componentes/Secciones/Ventas/Comprobantes/Comprobantes"),
);
const Listados = lazy(
  () => import("../Componentes/Secciones/Ventas/Listados/Listados"),
);

const ListadoFacturasProveedores = lazy(
  () =>
    import("../Componentes/Secciones/Compras/FacturaProveedor/FacturaProveedor"),
);
const RegistroFacturaProveedor = lazy(
  () =>
    import("../Componentes/Secciones/Compras/FacturasProveedores/FacturasProveedores"),
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
const Cuotas = lazy(
  () => import("../Componentes/Secciones/Escuela/Cuotas/Cuotas"),
);

const CrearAsientos = lazy(
  () =>
    import("../Componentes/Secciones/Contabilidad/CrearContabilidad/CrearAsientos/CrearAsientos"),
);
const Balance = lazy(
  () => import("../Componentes/Secciones/Contabilidad/Balance/Balance"),
);
const ConfiguracionContable = lazy(
  () =>
    import("../Componentes/Secciones/Contabilidad/Configuracion/ConfiguracionContable"),
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

export default function Router() {
  return (
    <Suspense>
      <Routes>
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
            </Route>

            {/* CONTACTOS */}
            <Route element={<RutaProtegida />}>
              <Route path="contactos" element={<DashboardContactos />} />
            </Route>

            {/* VENTAS */}
            <Route element={<RutaProtegida />}>
              <Route path="ventas/listados" element={<Listados />} />
              <Route path="ventas/comprobantes" element={<Comprobantes />} />
            </Route>

            {/* COMPRAS */}
            <Route element={<RutaProtegida />}>
              <Route
                path="compras/listados-proveedor"
                element={<ListadoFacturasProveedores />}
              />
              <Route
                path="compras/factura-proveedor"
                element={<RegistroFacturaProveedor />}
              />
            </Route>

            {/* ESCUELA */}
            <Route element={<RutaProtegida />}>
              <Route path="escuela/cuotas" element={<Cuotas />} />
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
              <Route path="contabilidad/balance" element={<Balance />} />
              <Route
                path="contabilidad/configuracion"
                element={<ConfiguracionContable />}
              />
            </Route>

            {/* AFIP */}
            <Route element={<RutaProtegida />}>
              <Route
                path="comprobantes-afip"
                element={<MisComprobantesAFIP />}
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
