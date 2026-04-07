import { useState, useEffect, useMemo } from "react";
import { ListarConfiguracionCamposApi } from "../../../../Backend/Articulos/api/Producto/producto.api";
import { useNavigate } from "react-router-dom";
import { useProductoUI } from "../../../../Backend/Articulos/hooks/Producto/useProductoUI";
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
import { FileSpreadsheet, ChevronRight, Package, Search, MoreHorizontal, Database, TrendingUp } from "lucide-react";
import SkeletonFilaTabla from "../../../UI/Skeletons/SkeletonFilaTabla.jsx";
import ModalCargaMasivaProductos from "../../../Modales/Articulos/ModalCargaMasivaProductos";
import DrawerActualizarStock from "../../../Modales/Articulos/ModalActualizarStock";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import { usePermisosDeUsuario } from "../../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
// import ModalCargaMasivaMovimientos from "../../../Modales/Articulos/ModalCargaMasivaMovimientos";
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
  const [busquedaClave, setBusquedaClave] = usePersistentState(
    "productos_busqueda_clave",
    "nombre",
  ); // 'nombre' o 'codigo'

  // Debounce para aplicar la búsqueda al backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros((prev) => {
        const nuevos = { ...prev, pagina: 1 }; // Reset page on new search
        delete nuevos.buscarPorNombre;
        delete nuevos.buscarPorCodigo;

        if (busquedaInput) {
          if (busquedaClave === "nombre")
            nuevos.buscarPorNombre = busquedaInput;
          if (busquedaClave === "codigo") {
            const num = Number(busquedaInput);
            if (!isNaN(num)) nuevos.buscarPorCodigo = num;
          }
        }
        return nuevos;
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaInput, busquedaClave]);

  const {
    productos,
    meta,
    eliminarProducto,
    cargando,
    estaEliminando,
    refetch,
  } = useProductoUI(filtros);

  const { dataDepositosRaw, matrizStock } = useDepositoUI(filtros);

  // Mapeamos los productos para que tengan la estructura que necesita el Drawer
  const productosConStock = useMemo(() => {
    return productos.map((prod) => {
      // Buscamos si existe en la matriz de stock para obtener el desglose por depósito
      const stockInfo = matrizStock.find(
        (m) => m.codigoProducto === prod.codigoSecuencial,
      );
      return {
        ...prod,
        ...stockInfo, // Trae los dep_X
        codigoProducto: prod.codigoSecuencial, // El drawer espera codigoProducto
      };
    });
  }, [productos, matrizStock]);

  const [drawerData, setDrawerData] = useState({
    isOpen: false,
    fila: null,
  });

  const handleAbrirDrawer = (fila) => {
    setDrawerData({ isOpen: true, fila });
  };

  const cerrarDrawer = () => {
    setDrawerData({ isOpen: false, fila: null });
  };

  const [camposDinamicos, setCamposDinamicos] = useState([]);
  const [configCargada, setConfigCargada] = useState(false);

  useEffect(() => {
    const cargarConfigs = async () => {
      try {
        const data = await ListarConfiguracionCamposApi("PRODUCTO");
        if (Array.isArray(data)) {
          setCamposDinamicos(data);
        }
      } catch (e) {
        console.error("Error cargando configs dinámicas:", e);
      } finally {
        setConfigCargada(true);
      }
    };
    cargarConfigs();
  }, [unidadActiva?.codigoSecuencial]);



  const columnasAMostrar = useMemo(() => {
    const estaticasModificadas = columnasProductos.map((col) => {
      if (col.key === "nombre" && camposDinamicos.length > 0) {
        return {
          ...col,
          renderizar: (valor, fila) => (
            <div className="py-2 group">
              <div className="flex items-center gap-2">
                <InventarioIcono
                  size={14}
                  className="text-amber-500/50 group-hover:text-amber-500 transition-colors"
                />
                <div className="font-extrabold text-[13px] text-[var(--text-primary)] leading-tight uppercase tracking-tight group-hover:text-[var(--primary)] transition-colors">
                  {valor}
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {fila.descripcion && (
                  <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[150px] font-medium opacity-70">
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
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                  border: "border-emerald-500/20",
                  glow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
                };
              if (val > 20)
                return {
                  color: "text-amber-500",
                  bg: "bg-amber-500/10",
                  border: "border-amber-500/20",
                  glow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]",
                };
              return {
                color: "text-rose-500",
                bg: "bg-rose-500/10",
                border: "border-rose-500/20",
                glow: "shadow-[0_0_15px_rgba(244,63,94,0.1)]",
              };
            };
            const config = getStockConfig(valor || 0);

            return (
              <div className="py-2">
                <div
                  onClick={() => handleAbrirDrawer(fila)}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 ${config.bg} ${config.color} ${config.border} ${config.glow} transition-all duration-300`}
                >
                  <span className="text-[12px] font-black tracking-tight">
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
        const valor = fila.atributos?.[c.claveCampo];
        return (
          <div className="text-[12px] text-[var(--text-secondary)] font-bold tracking-tight">
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

  const handleEliminarClick = (codigo, nombre) => {
    setConfirmarEliminar({
      open: true,
      codigo,
      nombre,
    });
  };

  const handleEditarClick = (item) => {
    const { codigoSecuencial } = item;
    navigate(`/panel/inventario/productos/${codigoSecuencial}/editar`, {
      state: { producto: item },
    });
  };

  const handleDuplicarClick = (item) => {
    navigate(`/panel/inventario/productos/nuevo`, {
      state: { producto: item },
    });
  };

  const confirmarEliminacion = async () => {
    try {
      await eliminarProducto(confirmarEliminar.codigo);
      setConfirmarEliminar({ open: false, codigo: null, nombre: "" });
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  if (configCargada && (!Array.isArray(camposDinamicos) || camposDinamicos.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4">
        <div className="max-w-lg w-full bg-[#1a1a1a] border border-white/5 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden group">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[var(--primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--primary)]/10 transition-all duration-700"></div>

          <div className="relative z-10">
            {/* Contenedor del Icono */}
            <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-[var(--primary)]/20 rotate-3 group-hover:rotate-6 transition-transform duration-500">
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
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight leading-tight">
              ¡Catálogo <br />{" "}
              <span className="text-[var(--primary)] italic font-medium">
                Requerido
              </span>
              !
            </h2>

            <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-[280px] mx-auto font-medium">
              Es necesario que hables con el administrador del sistema para
              configurar los campos del producto.
            </p>

            {/* Botones de Acción */}
            <div className="flex justify-center items-center">
              <button
                onClick={() => navigate("/panel")}
                className="px-10 py-4 bg-white/5 text-white/70 font-bold uppercase tracking-[0.15em] text-xs rounded-2xl hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 w-full sm:w-auto"
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
                  onClick={() =>
                    navigate("/panel/inventario/historial-stock/PRODUCTO")
                  }
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 rounded-md text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/5 group"
                >
                  <HistorialIcono
                    size={14}
                    className="group-hover:scale-110 transition-transform"
                  />
                  Historial
                </button>
              </TieneAccion>

              {/* PRODUCCION */}
              <TieneAccion accion="PRODUCCION_PRODUCTO">
                <button
                  onClick={() => navigate("/panel/inventario/produccion/nueva")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 rounded-md text-[11px] font-bold text-purple-400 uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-500/5 group"
                >
                  <ProduccionIcono
                    size={14}
                    className="group-hover:rotate-12 transition-transform"
                  />
                  Producción
                </button>
              </TieneAccion>

              {/* CARGA MASIVA */}
              <TieneAccion accion="CARGA_MASIVA_PRODUCTO">
                <button
                  onClick={() => setModalMasivoOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 rounded-md text-[11px] font-bold text-emerald-400 uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/5 group"
                >
                  <FileSpreadsheet
                    size={14}
                    className="group-hover:scale-110 transition-transform"
                  />
                  Carga Masiva
                </button>
              </TieneAccion>
            </div>
          }
          mostrarBuscador={true}
          busqueda={busquedaInput}
          setBusqueda={setBusquedaInput}
          opcionesBusqueda={[
            { label: "Por Nombre", value: "nombre" },
            { label: "Por Código", value: "codigo" },
          ]}
          busquedaClave={busquedaClave}
          setBusquedaClave={setBusquedaClave}
          placeholderBuscador="Escribe para buscar..."
        />
      </div>

      {/* VISTA MOBILE PREMIUM */}
      <div className="md:hidden flex flex-col gap-5 pb-28">
        {/* BUSCADOR MOBILE */}
        <div className="flex flex-col gap-3 bg-[#181818]/60 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl">
          <div className="flex gap-2">
            <select
              value={busquedaClave}
              onChange={(e) => setBusquedaClave(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black text-white/80 focus:outline-none focus:border-[var(--primary)]/50 appearance-none cursor-pointer uppercase tracking-tighter"
            >
              <option value="nombre" className="bg-[#181818]">NOM</option>
              <option value="codigo" className="bg-[#181818]">COD</option>
            </select>
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                value={busquedaInput}
                onChange={(e) => setBusquedaInput(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all font-medium placeholder:text-white/20"
              />
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonFilaTabla key={i} />
            ))}
          </div>
        ) : productosConStock.length > 0 ? (
          productosConStock.map((prod, idx) => (
            <div
              key={prod.codigoSecuencial}
              className="bg-[#181818] rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Header: Identidad del Producto */}
              <div className="p-4 bg-gradient-to-br from-white/[0.06] to-transparent border-b border-white/5 relative">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-black text-[var(--primary)] px-1.5 py-0.5 bg-[var(--primary)]/10 rounded border border-[var(--primary)]/30 shadow-sm uppercase tracking-tighter">
                        COD: {prod.codigoSecuencial?.toString().padStart(4, "0")}
                      </span>
                      <span className="text-[9px] font-black text-white/60 uppercase tracking-widest bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
                        {prod.unidadMedida}
                      </span>
                    </div>
                    <h3 onClick={() => handleEditarClick(prod)} className="text-[15px] font-black text-white leading-[1.2] tracking-tight break-words cursor-pointer hover:text-[var(--primary)] transition-colors">
                      {prod.nombre}
                    </h3>
                  </div>
                  <div className="shrink-0 flex gap-2">
                    <button 
                       onClick={(e) => {
                          e.stopPropagation();
                          handleEditarClick(prod);
                       }}
                       className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner text-[var(--primary)]/60 active:scale-90 transition-all"
                    >
                      <Package size={20} />
                    </button>
                  </div>
                </div>

                {/* Atributos Dinámicos en Mobile */}
                {camposDinamicos.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 pt-3 border-t border-white/5">
                    {camposDinamicos.slice(0, 3).map(c => {
                      const val = prod.atributos?.[c.claveCampo];
                      if (!val) return null;
                      return (
                        <div key={c.claveCampo} className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">{c.nombreCampo}:</span>
                          <span className="text-[10px] font-black text-white/80 uppercase">
                            {val === true ? "SÍ" : val === false ? "NO" : val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sección de Stock con Desglose */}
              <div className="p-3 bg-black/30 flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                    <TrendingUp size={10} className="text-emerald-500/50" />
                    Existencias por Depósito
                  </span>
                  <span className="text-[10px] font-black text-white/60">
                    Total: <span className="text-emerald-400">{prod.stock || 0}</span>
                  </span>
                </div>

                {dataDepositosRaw.map((dep, dIdx) => {
                  const stockDep = prod[`dep_${dep.codigoSecuencial}`] || 0;
                  const tieneStock = stockDep > 0;
                  
                  return (
                    <div
                      key={dep.codigoSecuencial}
                      onClick={() => handleAbrirDrawer({ ...prod, depositoInicial: dep.codigoSecuencial.toString() })}
                      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                        tieneStock
                          ? "bg-white/5 border border-white/10"
                          : "bg-white/[0.02] border border-transparent opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${tieneStock ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-white/10"}`}
                        />
                        <span className={`text-[11px] font-bold uppercase tracking-wider truncate transition-colors ${tieneStock ? "text-white" : "text-white/40"}`}>
                          {dep.nombre}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[14px] font-black tabular-nums ${tieneStock ? "text-emerald-400" : "text-white/10"}`}>
                          {stockDep}
                        </span>
                        <ChevronRight size={14} className="text-white/10" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 flex flex-col items-center justify-center opacity-20 text-center px-10">
            <Package size={64} className="mb-4 text-[var(--primary)]" />
            <span className="text-sm font-black uppercase tracking-[0.3em] text-white">No hay productos</span>
          </div>
        )}

        {/* Paginación Mobile */}
        {meta && (
          <div className="flex flex-col items-center gap-3 mt-4 pt-4 border-t border-white/5">
             <div className="flex items-center gap-1.5 bg-[#181818] border border-white/10 rounded-lg p-1">
                <button
                  disabled={!meta.prev}
                  onClick={() => setFiltros(prev => ({ ...prev, pagina: meta.prev }))}
                  className="p-1 rounded text-white/60 hover:bg-white/5 disabled:opacity-30 transition-all font-bold text-[11px] px-3"
                >
                  Anterior
                </button>
                <span className="text-[11px] font-black text-white px-2">
                  {meta.currentPage} / {meta.lastPage || 1}
                </span>
                <button
                  disabled={!meta.next}
                  onClick={() => setFiltros(prev => ({ ...prev, pagina: meta.next }))}
                  className="p-1 rounded text-white/60 hover:bg-white/5 disabled:opacity-30 transition-all font-bold text-[11px] px-3"
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

      <DrawerActualizarStock
        isOpen={drawerData.isOpen}
        onClose={cerrarDrawer}
        fila={drawerData.fila}
        depositosRaw={dataDepositosRaw}
      />
    </div>
  );
};

export default TablaProductos;
