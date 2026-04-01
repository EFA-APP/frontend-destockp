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
import { FileSpreadsheet } from "lucide-react";
import ModalCargaMasivaProductos from "../../../Modales/Articulos/ModalCargaMasivaProductos";
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

  const [camposDinamicos, setCamposDinamicos] = useState([]);

  useEffect(() => {
    const cargarConfigs = async () => {
      try {
        const data = await ListarConfiguracionCamposApi("PRODUCTO");
        setCamposDinamicos(data);
      } catch (e) {
        console.error("Error cargando configs dinámicas:", e);
      }
    };
    cargarConfigs();
  }, [unidadActiva?.codigoSecuencial]);
// ☝️ Ahora las columnas cambian solas al cambiar de unidad

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
      if (col.key === "stock" && camposDinamicos.length > 0) {
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
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border backdrop-blur-md ${config.bg} ${config.color} ${config.border} ${config.glow} transition-all duration-300`}
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

      <DataTable
        id_tabla="productos"
        llaveTituloMobile="nombre"
        columnas={columnasAMostrar}
        datos={productos}
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

      <ModalCargaMasivaProductos
        open={modalMasivoOpen}
        onClose={() => setModalMasivoOpen(false)}
        onExito={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default TablaProductos;
