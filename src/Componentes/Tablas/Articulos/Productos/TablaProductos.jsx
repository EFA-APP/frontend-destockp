import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { useConfiguracionProducto } from "../../../../Backend/Articulos/queries/Producto/useConfiguracionProducto.query";
import { useNavigate } from "react-router-dom";
import { usePersistentState } from "../../../../hooks/usePersistentState";
import DataTable from "../../../UI/DataTable/DataTable";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import { columnasProductos } from "./ColumnaProductos";
import { accionesProductos } from "./AccionesProductos";
import {
  HistorialIcono,
  ProduccionIcono,
  InventarioIcono,
} from "../../../../assets/Icons";
import {
  FileSpreadsheet,
  Plus,
  ChevronRight,
  Package,
  Search,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import SkeletonFilaTabla from "../../../UI/Skeletons/SkeletonFilaTabla.jsx";
import ModalCargaMasivaProductos from "../../../Modales/Articulos/ModalCargaMasivaProductos";
import ModalImportarListaPrecios from "../../../Modales/Articulos/ModalImportarListaPrecios";
import DrawerActualizarStock from "../../../Modales/Articulos/ModalActualizarStock";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import { usePermisosDeUsuario } from "../../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
const formatVal = (val) => {
  if (val === null || val === undefined) return "";
  const parsed =
    typeof val === "string" && val.trim() !== "" && !isNaN(val)
      ? Number(val)
      : val;
  if (typeof parsed === "number" && !isNaN(parsed)) {
    return new Intl.NumberFormat("es-AR").format(parsed);
  }
  return val;
};

const TablaProductos = () => {
  const navigate = useNavigate();
  const { tieneAccion } = usePermisosDeUsuario("ARTICULOS");
  const unidadActiva = useAuthStore((state) => state.unidadActiva);
  // Estados locales para filtros API y paginación
  const [filtros, setFiltros] = useState({ pagina: 1, limite: 10 });
  // Estados persistentes para búsqueda
  const [busquedaInput, setBusquedaInput] = usePersistentState(
    "productos_busqueda_input",
    "",
  );

  const [provFiltro, setProvFiltro] = useState(null); // { codigoSecuencial, razonSocial }
  const [busquedaProv, setBusquedaProv] = useState("");
  const [mostrarSelectProv, setMostrarSelectProv] = useState(false);

  // Debounce para aplicar la búsqueda al backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros((prev) => {
        const nuevos = { ...prev, pagina: 1 };
        delete nuevos.buscarPorNombre;
        delete nuevos.buscarPorCodigo;
        delete nuevos.buscarPorGeneral;
        delete nuevos.filtrosAtributos;

        if (busquedaInput) {
          nuevos.buscarPorGeneral = busquedaInput;
        }

        // Agregar filtro de proveedor si está seleccionado
        if (provFiltro) {
          nuevos.filtrosAtributos = JSON.stringify({
            codigoProveedor: Number(provFiltro.codigoSecuencial),
          });
        }

        return nuevos;
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaInput, provFiltro]);

  const {
    matrizStock: productos,
    meta,
    eliminarProducto,
    cargandoStock: cargando,
    estaEliminandoProducto: estaEliminando,
    refetch,
    dataDepositosRaw,
  } = useDepositoUI(filtros);

  const productosConStock = productos; // Direct use of unified data

  const [drawerData, setDrawerData] = useState({
    isOpen: false,
    fila: null,
  });
  const mobileScrollRef = useRef(null);
  const [mobileScrollTop, setMobileScrollTop] = useState(0);
  const [mobileViewportHeight, setMobileViewportHeight] = useState(0);
  const MOBILE_ITEM_ESTIMATED_HEIGHT = 380;
  const MOBILE_OVERSCAN = 3;

  const handleAbrirDrawer = useCallback((fila) => {
    setDrawerData({ isOpen: true, fila });
  }, []);

  const cerrarDrawer = useCallback(() => {
    setDrawerData({ isOpen: false, fila: null });
  }, []);

  const { data: configData } = useConfiguracionProducto();

  const camposDinamicos = useMemo(() => {
    return Array.isArray(configData) ? configData : [];
  }, [configData]);

  const configCargada = !!configData;

  const columnasAMostrar = useMemo(() => {
    const estaticasModificadas = columnasProductos.map((col) => {
      if (col.key === "nombre" && camposDinamicos.length > 0) {
        return {
          ...col,
          renderizar: (valor, fila) => (
            <div className="py-2">
              <div className="flex items-center gap-2">
                <InventarioIcono size={14} className="text-amber-700/50 " />
                <div className="font-extrabold text-[15px] text-[var(--text-primary)] leading-tight uppercase tracking-tight ">
                  {valor}
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {fila.descripcion && (
                  <span className="text-[12px] text-[var(--primary)] truncate max-w-[150px] font-medium opacity-70">
                    • {fila.descripcion}
                  </span>
                )}
              </div>
            </div>
          ),
        };
      }

      if (col.key === "stock") {
        return {
          ...col,
          renderizar: (valor, fila) => {
            const getStockConfig = (val) => {
              if (val > 50)
                return {
                  color: "text-emerald-700",
                  bg: "bg-emerald-700/10",
                  border: "border-emerald-700/20",
                  glow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
                };
              if (val > 20)
                return {
                  color: "text-amber-700",
                  bg: "bg-amber-700/10",
                  border: "border-amber-700/20",
                  glow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]",
                };
              return {
                color: "text-rose-700",
                bg: "bg-rose-700/10",
                border: "border-rose-700/20",
                glow: "shadow-[0_0_15px_rgba(244,63,94,0.1)]",
              };
            };
            const config = getStockConfig(valor || 0);

            return (
              <div className="py-2">
                <div
                  onClick={() => handleAbrirDrawer(fila)}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 ${config.bg} ${config.color} ${config.border} ${config.glow}  `}
                >
                  <span className="text-[14px] font-black tracking-tight">
                    {formatVal(valor || 0)}
                  </span>
                </div>
              </div>
            );
          },
        };
      }
      return col;
    });

    const dinamicas = camposDinamicos.map((c) => ({
      key: c.claveCampo,
      etiqueta: c.nombreCampo,
      filtrable: true,
      renderizar: (_, fila) => {
        const valor = fila.atributos?.[c.claveCampo] ?? fila[c.claveCampo];
        return (
          <div className="text-[14px] text-[var(--text-secondary)] font-bold tracking-tight">
            {valor === true
              ? "SÍ"
              : valor === false
                ? "NO"
                : formatVal(valor) || "-"}
          </div>
        );
      },
    }));
    return [...estaticasModificadas, ...dinamicas];
  }, [camposDinamicos]);

  const [confirmarEliminar, setConfirmarEliminar] = useState({
    open: false,
    codigo: null,
    nombre: "",
  });

  const [modalMasivoOpen, setModalMasivoOpen] = useState(false);
  const [modalImportarListaOpen, setModalImportarListaOpen] = useState(false);

  useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;

    const updateViewport = () => setMobileViewportHeight(el.clientHeight || 0);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const mobileVirtualData = useMemo(() => {
    const total = productosConStock.length;
    if (total === 0) {
      return {
        startIndex: 0,
        endIndex: 0,
        topSpacer: 0,
        bottomSpacer: 0,
        visible: [],
      };
    }

    const viewport = mobileViewportHeight || MOBILE_ITEM_ESTIMATED_HEIGHT * 2;
    const startIndex = Math.max(
      0,
      Math.floor(mobileScrollTop / MOBILE_ITEM_ESTIMATED_HEIGHT) -
        MOBILE_OVERSCAN,
    );
    const endIndex = Math.min(
      total,
      Math.ceil((mobileScrollTop + viewport) / MOBILE_ITEM_ESTIMATED_HEIGHT) +
        MOBILE_OVERSCAN,
    );
    const topSpacer = startIndex * MOBILE_ITEM_ESTIMATED_HEIGHT;
    const bottomSpacer = Math.max(
      0,
      (total - endIndex) * MOBILE_ITEM_ESTIMATED_HEIGHT,
    );
    const visible = productosConStock.slice(startIndex, endIndex);

    return { startIndex, endIndex, topSpacer, bottomSpacer, visible };
  }, [productosConStock, mobileScrollTop, mobileViewportHeight]);

  const handleEliminarClick = useCallback((codigo, nombre) => {
    setConfirmarEliminar({
      open: true,
      codigo,
      nombre,
    });
  }, []);

  const handleEditarClick = useCallback(
    (item) => {
      const { codigoSecuencial } = item;
      navigate(`/panel/inventario/productos/${codigoSecuencial}/editar`, {
        state: { producto: item },
      });
    },
    [navigate],
  );

  const handleDuplicarClick = useCallback(
    (item) => {
      navigate(`/panel/inventario/productos/nuevo`, {
        state: { producto: item },
      });
    },
    [navigate],
  );

  const confirmarEliminacion = useCallback(async () => {
    try {
      await eliminarProducto(confirmarEliminar.codigo);
      setConfirmarEliminar({ open: false, codigo: null, nombre: "" });
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }, [eliminarProducto, confirmarEliminar.codigo]);

  const handleOpenHistorial = useCallback(() => {
    navigate("/panel/inventario/historial-stock/PRODUCTO");
  }, [navigate]);

  const handleOpenProduccion = useCallback(() => {
    navigate("/panel/inventario/produccion/nueva");
  }, [navigate]);

  const handleOpenImportarLista = useCallback(() => {
    setModalImportarListaOpen(true);
  }, []);

  const handleOpenCargaMasiva = useCallback(() => {
    setModalMasivoOpen(true);
  }, []);

  const handleCrearProducto = useCallback(() => {
    navigate("/panel/inventario/productos/nuevo");
  }, [navigate]);

  if (
    configCargada &&
    (!Array.isArray(camposDinamicos) || camposDinamicos.length === 0)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4">
        <div className="max-w-lg w-full bg-[#1a1a1a] border border-black/5 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden group">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[var(--primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--primary)]/10  "></div>

          <div className="relative z-10">
            {/* Contenedor del Icono */}
            <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-[var(--primary)]/20 rotate-3 group-hover:rotate-6  ">
              <div className="text-[var(--primary)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
            </div>

            {/* Texto Principal */}
            <h2 className="text-3xl font-black text-black mb-4 tracking-tight leading-tight">
              ¡Catálogo <br />{" "}
              <span className="text-[var(--primary)] italic font-medium">
                Requerido
              </span>
              !
            </h2>

            <p className="text-black/40 text-sm leading-relaxed mb-10 max-w-[280px] mx-auto font-medium">
              Es necesario que hables con el administrador del sistema para
              configurar los campos del producto.
            </p>

            {/* Botones de Acción */}
            <div className="flex justify-center items-center">
              <button
                onClick={() => navigate("/panel")}
                className="px-10 py-4 bg-black/5 text-black/70 font-bold uppercase tracking-[0.15em] text-xs rounded-2xl hover:bg-black/10  border border-black/5 hover:border-black/10 w-full sm:w-auto"
              >
                Ir al Inicio
              </button>
            </div>
          </div>

          {/* Línea decorativa inferior */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModalConfirmacion
        open={confirmarEliminar.open}
        onClose={() =>
          setConfirmarEliminar({ open: false, codigo: null, nombre: "" })
        }
        onConfirm={confirmarEliminacion}
        titulo="Eliminar Producto"
        mensaje={`¿Estás seguro de que deseas eliminar "${confirmarEliminar.nombre}"? No aparecerá en el listado activo.`}
        textoConfirmar={estaEliminando ? "Eliminando..." : "Eliminar"}
        textoCancelar="Cancelar"
        colorConfirmar="bg-red-600!"
      />

      {/* VISTA ESCRITORIO */}
      <div className="hidden md:block">
        <DataTable
          id_tabla="productos"
          llaveTituloMobile="nombre"
          columnas={columnasAMostrar}
          datos={productosConStock}
          loading={cargando}
          meta={meta}
          onPageChange={(pagina) => setFiltros((prev) => ({ ...prev, pagina }))}
          onLimitChange={(limite) =>
            setFiltros((prev) => ({ ...prev, limite, pagina: 1 }))
          }
          mostrarAcciones={true}
          acciones={accionesProductos({
            handleEditarClick,
            handleEliminarClick,
            handleDuplicarClick,
            tieneAccion,
          })}
          botonAgregar={{
            texto: "Nuevo Producto",
            ruta: "/panel/inventario/productos/nuevo",
            tieneAccion: "CREAR_PRODUCTO",
          }}
          elementosSuperior={
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* HISTORIAL */}
              <TieneAccion accion="HISTORIAL_PRODUCTO">
                <button
                  onClick={handleOpenHistorial}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 rounded-md text-[13px] font-bold text-[var(--primary)] uppercase tracking-wider  cursor-pointer shadow-lg shadow-amber-700/5 group"
                >
                  <HistorialIcono size={14} className=" " />
                  Historial
                </button>
              </TieneAccion>

              {/* IMPORTAR LISTA DE PRECIO (NUEVO) */}
              <TieneAccion accion="IMPORTAR_LISTA_PRODUCTO">
                <button
                  onClick={handleOpenImportarLista}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-700/20 rounded-md text-[13px] font-bold text-blue-400 uppercase tracking-wider  cursor-pointer shadow-lg shadow-blue-700/5 group"
                >
                  <FileSpreadsheet size={14} className=" " />
                  Importar Lista
                </button>
              </TieneAccion>

              {/* PRODUCCION */}
              <TieneAccion accion="PRODUCCION_PRODUCTO">
                <button
                  onClick={handleOpenProduccion}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-700/20 rounded-md text-[13px] font-bold text-purple-400 uppercase tracking-wider  cursor-pointer shadow-lg shadow-purple-700/5 group"
                >
                  <ProduccionIcono
                    size={14}
                    className="group-hover:rotate-12 "
                  />
                  Producción
                </button>
              </TieneAccion>

              {/* CARGA MASIVA */}
              <TieneAccion accion="CARGA_MASIVA_PRODUCTO">
                <button
                  onClick={handleOpenCargaMasiva}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-700/20 rounded-md text-[13px] font-bold text-emerald-400 uppercase tracking-wider  cursor-pointer shadow-lg shadow-emerald-700/5 group"
                >
                  <FileSpreadsheet size={14} className=" " />
                  Carga Masiva
                </button>
              </TieneAccion>

              {/* SELECTOR DE PROVEEDOR */}
              <TieneAccion accion="FILTRAR_POR_PROVEEDOR_PRODUCTO">
                <div className="relative">
                  {!provFiltro ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setMostrarSelectProv(!mostrarSelectProv)}
                        className="flex items-center gap-2 px-4 py-2 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold text-black/60 hover:bg-black/10  cursor-pointer group"
                      >
                        <User size={14} className="" />
                        Filtrar Proveedor
                      </button>
                      {mostrarSelectProv && (
                        <div className="absolute top-full left-0 mt-2 w-72 z-50 bg-[var(--fill)] border border-[var(--text-theme)] rounded-xl shadow-2xl p-4   ">
                          <input
                            autoFocus
                            type="text"
                            placeholder="Buscar proveedor..."
                            value={busquedaProv}
                            onChange={(e) => setBusquedaProv(e.target.value)}
                            className="w-full bg-[var(--surface-hover)] border border-[var(--text-theme)] rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-[var(--primary)]/50 placeholder:text-[var(--text-theme)]/70"
                          />
                          <div className="mt-3 max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                            <SelectorProveedoresInterno
                              busqueda={busquedaProv}
                              onSeleccion={(p) => {
                                setProvFiltro(p);
                                setMostrarSelectProv(false);
                                setBusquedaProv("");
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-700/10 border border-amber-700/30 rounded-md shadow-lg shadow-amber-700/5  ">
                      <div className="w-5 h-5 rounded-full bg-amber-700 flex items-center justify-center text-[12px] font-black text-black">
                        {provFiltro.razonSocial?.[0]?.toUpperCase() || "P"}
                      </div>
                      <span className="text-[13px] font-black text-amber-700 uppercase max-w-[120px] truncate">
                        {provFiltro.razonSocial.toUpperCase() ||
                          provFiltro.nombre.toUpperCase() ||
                          provFiltro.apellido.toUpperCase() +
                            " " +
                            provFiltro.nombre.toUpperCase()}
                      </span>
                      <button
                        onClick={() => setProvFiltro(null)}
                        className="p-1 hover:bg-amber-700/20 rounded-md text-amber-700  cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </TieneAccion>
            </div>
          }
          mostrarBuscador={true}
          busqueda={busquedaInput}
          setBusqueda={setBusquedaInput}
          placeholderBuscador="Escribe para buscar..."
        />
      </div>

      {/* VISTA MOBILE PREMIUM */}
      <div
        ref={mobileScrollRef}
        onScroll={(e) => setMobileScrollTop(e.currentTarget.scrollTop)}
        className="md:hidden flex flex-col gap-5 pb-28 overflow-y-auto"
      >
        {/* BUSCADOR MOBILE */}
        <div className="flex flex-col gap-3 bg-[#181818]/60 backdrop-blur-md p-4 rounded-2xl border border-black/5 shadow-xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
              />
              <input
                type="text"
                value={busquedaInput}
                onChange={(e) => setBusquedaInput(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full bg-black/30 border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-black focus:outline-none focus:border-[var(--primary)]/50  font-medium placeholder:text-black/20"
              />
            </div>
          </div>
          <TieneAccion accion="CREAR_PRODUCTO">
            <button
              type="button"
              onClick={handleCrearProducto}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-black rounded-xl font-black text-[13px] uppercase tracking-wider shadow-lg shadow-amber-700/20 active:scale-95 "
            >
              <Plus size={15} />
              Nuevo Producto
            </button>
          </TieneAccion>
        </div>

        {cargando ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonFilaTabla key={i} />
            ))}
          </div>
        ) : productosConStock.length > 0 ? (
          <div className="flex flex-col gap-4">
            {mobileVirtualData.topSpacer > 0 && (
              <div style={{ height: `${mobileVirtualData.topSpacer}px` }} />
            )}
            {mobileVirtualData.visible.map((prod, localIdx) => (
              <MobileProductoCard
                key={prod.codigoSecuencial}
                prod={prod}
                idx={mobileVirtualData.startIndex + localIdx}
                camposDinamicos={camposDinamicos}
                dataDepositosRaw={dataDepositosRaw}
                onEditar={handleEditarClick}
                onAbrirDrawer={handleAbrirDrawer}
              />
            ))}
            {mobileVirtualData.bottomSpacer > 0 && (
              <div style={{ height: `${mobileVirtualData.bottomSpacer}px` }} />
            )}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center opacity-20 text-center px-10">
            <Package size={64} className="mb-4 text-[var(--primary)]" />
            <span className="text-sm font-black uppercase tracking-[0.3em] text-black">
              No hay productos
            </span>
          </div>
        )}

        {/* Paginación Mobile */}
        {meta && (
          <div className="flex flex-col items-center gap-3 mt-4 pt-4 border-t border-black/5">
            <div className="flex items-center gap-1.5 bg-[#181818] border border-black/10 rounded-lg p-1">
              <button
                disabled={!meta.prev}
                onClick={() =>
                  setFiltros((prev) => ({ ...prev, pagina: meta.prev }))
                }
                className="p-1 rounded text-black/60 hover:bg-black/5 disabled:opacity-30  font-bold text-[13px] px-3"
              >
                Anterior
              </button>
              <span className="text-[13px] font-black text-black px-2">
                {meta.currentPage} / {meta.lastPage || 1}
              </span>
              <button
                disabled={!meta.next}
                onClick={() =>
                  setFiltros((prev) => ({ ...prev, pagina: meta.next }))
                }
                className="p-1 rounded text-black/60 hover:bg-black/5 disabled:opacity-30  font-bold text-[13px] px-3"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <ModalCargaMasivaProductos
        open={modalMasivoOpen}
        onClose={() => setModalMasivoOpen(false)}
        onExito={() => {
          refetch();
        }}
      />

      <ModalImportarListaPrecios
        open={modalImportarListaOpen}
        onClose={() => setModalImportarListaOpen(false)}
        onExito={() => {
          refetch();
          setModalImportarListaOpen(false);
        }}
      />

      <DrawerActualizarStock
        isOpen={drawerData.isOpen}
        onClose={cerrarDrawer}
        fila={drawerData.fila}
        depositosRaw={dataDepositosRaw}
      />
    </div>
  );
};

const MobileProductoCard = memo(
  ({
    prod,
    idx,
    camposDinamicos,
    dataDepositosRaw,
    onEditar,
    onAbrirDrawer,
  }) => (
    <div
      className="bg-[var(--fill)]rounded-2xl border border-black/10 overflow-hidden shadow-2xl flex flex-col    "
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      <div className="p-4 bg-gradient-to-br from-white/[0.06] to-transparent border-b border-black/5 relative">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-black text-[var(--primary)] px-1.5 py-0.5 bg-[var(--primary)]/10 rounded border border-[var(--primary)]/30 shadow-sm uppercase tracking-tighter">
                COD: {prod.codigoSecuencial?.toString().padStart(4, "0")}
              </span>
              <span className="text-[11px] font-black text-black/60 uppercase tracking-widest bg-black/10 px-1.5 py-0.5 rounded border border-black/5">
                {prod.unidadMedida}
              </span>
            </div>
            <h3
              onClick={() => onEditar(prod)}
              className="text-[17px] font-black text-black leading-[1.2] tracking-tight break-words cursor-pointer hover:text-[var(--primary)] "
            >
              {prod.nombre}
            </h3>
          </div>
          <div className="shrink-0 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditar(prod);
              }}
              className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center border border-black/10 shadow-inner text-[var(--primary)]/60 active:scale-90 "
            >
              <Package size={20} />
            </button>
          </div>
        </div>

        {camposDinamicos.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 pt-3 border-t border-black/5">
            {camposDinamicos.slice(0, 3).map((c) => {
              const val = prod.atributos?.[c.claveCampo];
              if (!val) return null;
              return (
                <div key={c.claveCampo} className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-black/20" />
                  <span className="text-[12px] font-bold text-black/40 uppercase tracking-tighter">
                    {c.nombreCampo}:
                  </span>
                  <span className="text-[12px] font-black text-black/80 uppercase">
                    {val === true ? "SÍ" : val === false ? "NO" : val}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 bg-black/30 flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em] flex items-center gap-2">
            <TrendingUp size={10} className="text-emerald-700/50" />
            Existencias por Depósito
          </span>
          <span className="text-[12px] font-black text-black/60">
            Total: <span className="text-emerald-400">{prod.stock || 0}</span>
          </span>
        </div>

        {dataDepositosRaw.map((dep) => {
          const stockDep = prod[`dep_${dep.codigoSecuencial}`] || 0;
          const tieneStock = stockDep > 0;

          return (
            <div
              key={dep.codigoSecuencial}
              onClick={() =>
                onAbrirDrawer({
                  ...prod,
                  depositoInicial: dep.codigoSecuencial.toString(),
                })
              }
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer   active:scale-[0.98] ${
                tieneStock
                  ? "bg-black/5 border border-black/10"
                  : "bg-white/[0.02] border border-transparent opacity-50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${tieneStock ? "bg-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-black/10"}`}
                />
                <span
                  className={`text-[13px] font-bold uppercase tracking-wider truncate  ${tieneStock ? "text-black" : "text-black/40"}`}
                >
                  {dep.nombre}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[16px] font-black tabular-nums ${tieneStock ? "text-emerald-400" : "text-black/10"}`}
                >
                  {stockDep}
                </span>
                <ChevronRight size={14} className="text-black/10" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ),
);

const SelectorProveedoresInterno = memo(({ busqueda, onSeleccion }) => {
  const { contactos: proveedores, cargandoContactos: loadingProvs } =
    useContactos({
      tipoEntidad: "PROV",
      busqueda: busqueda,
      pagina: 1,
      limite: 20,
    });

  if (loadingProvs) {
    return (
      <div className="py-4 text-center text-[12px] text-black/30 uppercase font-black ">
        Buscando...
      </div>
    );
  }

  if (!proveedores || proveedores.length === 0) {
    return (
      <div className="py-4 text-center text-[12px] text-black/20 uppercase font-black">
        No se encontraron proveedores
      </div>
    );
  }

  return proveedores.map((p) => (
    <button
      key={p.codigoSecuencial}
      onClick={() => onSeleccion(p)}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5  text-left group"
    >
      <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[12px] font-black text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white">
        {p.razonSocial?.[0]?.toUpperCase() || "P"}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-bold text-black/80 truncate group-hover:text-black ">
          {p.razonSocial.toUpperCase() ||
            p.nombre.toUpperCase() ||
            p.apellido.toUpperCase() + " " + p.nombre.toUpperCase()}
        </span>
        <span className="text-[11px] font-black text-[var(--primary)] uppercase mt-1 ">
          Código: {p.codigoSecuencial.toString().padStart(4, "0")}
        </span>
      </div>
    </button>
  ));
});

export default TablaProductos;
