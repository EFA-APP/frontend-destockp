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
  AdvertenciaIcono,
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
import ModalCargarImagenProducto from "../../../Modales/Articulos/ModalCargarImagenProducto";
import DrawerActualizarStock from "../../../Modales/Articulos/ModalActualizarStock";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import { usePermisosDeUsuario } from "../../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { formatNumber, formatPrice } from "../../../../utils/formatters";
// Eliminamos formatVal local para usar las utilidades globales

const TablaProductos = () => {
  const navigate = useNavigate();
  const { tieneAccion } = usePermisosDeUsuario("ARTICULOS");
  const unidadActiva = useAuthStore((state) => state.unidadActiva);
  // Estados locales para filtros API y paginación
  const [filtros, setFiltros] = useState({
    pagina: 1,
    limite: 10,
    tipoArticulo: "PRODUCTO",
  });
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
              <div className="flex items-center gap-3">
                {fila.imagen ? (
                  <div className="w-10 h-10 rounded-md overflow-hidden border border-black/5 shadow-sm shrink-0">
                    <img
                      src={fila.imagen}
                      alt={valor}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-md bg-amber-700/5 border border-amber-700/10 flex items-center justify-center shrink-0">
                    <InventarioIcono size={18} className="text-amber-700/30" />
                  </div>
                )}
                <div>
                  <div className="font-extrabold text-[15px] text-[var(--text-primary)] leading-tight uppercase tracking-tight ">
                    {valor}
                  </div>
                  {fila.descripcion && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[12px] text-[var(--primary)] truncate font-medium opacity-70">
                        • {fila.descripcion}
                      </span>
                    </div>
                  )}
                </div>
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
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 ${config.bg} ${config.color} ${config.border} ${config.glow}  `}
                >
                  <span className="text-[14px] font-black tracking-tight">
                    {valor}
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
        const esPrecio = c.claveCampo?.toLowerCase().includes("precioventa");

        if (esPrecio && valor !== null && valor !== undefined) {
          return (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-700/10 border border-emerald-700/20 text-emerald-700 font-black text-[14px] shadow-sm">
              {formatPrice(valor)}
            </div>
          );
        }

        return (
          <div className="text-[14px] text-[var(--text-secondary)] font-bold tracking-tight">
            {valor === true
              ? "SÍ"
              : valor === false
                ? "NO"
                : formatNumber(valor) || "-"}
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
  const [modalImagen, setModalImagen] = useState({
    open: false,
    producto: null,
  });

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

  const handleAgregarImagen = useCallback((producto) => {
    setModalImagen({
      open: true,
      producto,
    });
  }, []);

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

  if (
    configCargada &&
    (!Array.isArray(camposDinamicos) || camposDinamicos.length === 0)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full ">
        <div className="max-w-lg w-full bg-[var(--fill)] border border-black/5 rounded-md p-10 text-center shadow-2xl relative overflow-hidden group">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[var(--primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--primary)]/10  "></div>

          <div className="relative z-10">
            {/* Contenedor del Icono */}
            <div className="w-20 h-20 bg-yellow-500/10 rounded-md flex items-center justify-center mx-auto mb-6 border border-yellow-500/50 rotate-3 group-hover:rotate-6  ">
              <div className="text-yellow-600">
                <AdvertenciaIcono size={35} />
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

            <p className="text-[var(--text-theme)]/80 text-sm leading-relaxed mb-10 max-w-[280px] mx-auto font-medium">
              Es necesario que hables con el administrador del sistema para
              configurar los campos del producto.
            </p>

            {/* Botones de Acción */}
            <div className="flex justify-center items-center">
              <button
                onClick={() => navigate("/panel")}
                className="px-10 py-4 bg-[var(--primary)]/10 text-[var(--primary)]/90 font-bold uppercase tracking-[0.15em] text-xs rounded-md hover:bg-[var(--primary)]/20  border border-[var(--primary)]/80 hover:border-[var(--primary)]/10 w-full sm:w-max cursor-pointer"
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
    <div className="space-y-6 ">
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

      <div className="block">
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
            handleAgregarImagen,
            tieneAccion,
          })}
          botonAgregar={{
            texto: "Crear",
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
                        <div className="absolute top-full left-0 mt-2 w-72 z-50 bg-[var(--fill)] border border-[var(--text-theme)] rounded-md shadow-2xl p-4   ">
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

      <TieneAccion accion="EDITAR_STOCK_MANUAL">
        <DrawerActualizarStock
          isOpen={drawerData.isOpen}
          onClose={cerrarDrawer}
          fila={drawerData.fila}
          depositosRaw={dataDepositosRaw}
          tipoArticulo="PRODUCTO"
        />
      </TieneAccion>

      <ModalCargarImagenProducto
        isOpen={modalImagen.open}
        onClose={() => setModalImagen({ open: false, producto: null })}
        producto={modalImagen.producto}
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
      className="bg-[var(--fill)]rounded-md border border-black/10 overflow-hidden shadow-2xl flex flex-col    "
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
              className="w-10 h-10 rounded-md bg-black/5 flex items-center justify-center border border-black/10 shadow-inner text-[var(--primary)]/60 active:scale-90 "
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

        {(prod.stockPorDeposito || []).map((sp) => {
          const stockDep = sp.stock || 0;
          const tieneStock = stockDep > 0;
          const dep = sp.deposito || {};

          return (
            <div
              key={dep.codigoSecuencial || Math.random()}
              onClick={() =>
                onAbrirDrawer({
                  ...prod,
                  depositoInicial: dep.codigoSecuencial?.toString(),
                })
              }
              className={`group flex items-center justify-between p-3 rounded-md cursor-pointer   active:scale-[0.98] ${
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
                  {dep.nombre || "DEPÓSITO"}
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
      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-black/5  text-left group"
    >
      <div className="w-8 h-8 rounded-md bg-[var(--primary)]/10 flex items-center justify-center text-[12px] font-black text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white">
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
