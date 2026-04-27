import { useState } from "react";
import { useObtenerMovimientos } from "../../../Backend/Articulos/queries/Movimientos/useObtenerMovimientos.query";
import { useEliminarMovimiento } from "../../../Backend/Articulos/queries/Movimientos/useEliminarMovimiento.mutation";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import {
  CargandoIcono,
  ProduccionIcono,
  BorrarIcono,
  DescargarIcono,
} from "../../../assets/Icons";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReporteMovimientosPDF from "./ReporteMovimientosPDF";
import FechaInput from "../FechaInput/FechaInput";
import ModalConfirmacion from "../ModalConfirmacion/ModalConfirmacion";
import DataTable from "../DataTable/DataTable";
import { ColumnasMovimientos } from "./ColumnasMovimientos";
import { accionesMovimientos } from "./accionesMovimeintos";

const ListaMovimientos = ({
  codigoArticulo,
  tipoArticulo,
  filtroOrigen = null,
}) => {
  const usuario = useAuthStore((state) => state.usuario);
  const [movimientoAEliminar, setMovimientoAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatDateForInput(d);
  });
  const [fechaFin, setFechaFin] = useState(() =>
    formatDateForInput(new Date()),
  );
  const [pagina, setPagina] = useState(1);
  const limite = 15;

  const { data: response, isLoading } = useObtenerMovimientos(
    codigoArticulo,
    tipoArticulo,
    fechaInicio,
    fechaFin,
    busqueda,
    pagina,
    limite,
  );

  const rawMovimientos = response?.movimientos || [];
  const totalItems = response?.total || 0;
  const totalPaginas = Math.ceil(totalItems / (limite || 15));

  const { mutate: eliminarMovimiento, isPending: isEliminando } =
    useEliminarMovimiento();

  const movimientos = filtroOrigen
    ? rawMovimientos?.filter((m) => m.origenMovimiento === filtroOrigen)
    : rawMovimientos;

  const clearFilters = () => {
    setFechaInicio("");
    setFechaFin("");
    setBusqueda("");
  };

  const handleEliminar = () => {
    if (!movimientoAEliminar) return;

    eliminarMovimiento(
      {
        codigoEmpresa: usuario?.codigoEmpresa,
        codigoSecuencial: movimientoAEliminar.codigoSecuencial,
        tipoArticulo: tipoArticulo,
      },
      {
        onSuccess: () => setMovimientoAEliminar(null),
      },
    );
  };

  const formatFecha = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr);
      return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(fecha);
    } catch (e) {
      return fechaStr;
    }
  };

  const getTipoConfig = (tipo) => {
    switch (tipo) {
      case "INGRESO":
        return {
          estilo: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
          bullet: "bg-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.4)]",
          line: "bg-emerald-700/20",
          simbolo: "+",
        };
      case "EGRESO":
        return {
          estilo: "text-rose-400 bg-rose-400/10 border-rose-400/20",
          bullet: "bg-rose-700 shadow-[0_0_10px_rgba(244,63,94,0.4)]",
          line: "bg-rose-700/20",
          simbolo: "-",
        };
      case "AJUSTE":
        return {
          estilo: "text-amber-400 bg-amber-400/10 border-amber-400/20",
          bullet: "bg-[var(--primary)] shadow-[0_0_10px_rgba(245,158,11,0.4)]",
          line: "bg-[var(--primary)]/20",
          simbolo: "±",
        };
      default:
        return {
          estilo: "text-gray-400 bg-gray-400/10 border-gray-400/20",
          bullet: "bg-gray-400",
          line: "bg-gray-400/20",
          simbolo: "",
        };
    }
  };

  const inputClasses =
    "w-full bg-[var(--surface)] border border-black/10 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:border-[var(--primary)]/50  placeholder:text-black/20 px-4! py-2.5!";

  return (
    <div className="pt-2">
      <DataTable
        datos={movimientos}
        columnas={ColumnasMovimientos()}
        acciones={accionesMovimientos({ onAnular: setMovimientoAEliminar })}
        mostrarAcciones={true}
        loading={isLoading}
        mostrarBuscador={true}
        todasExpandidas={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Buscar por artículo, usuario u observación..."
        emptyMessage="No se registran eventos para este artículo"
        renderDetalle={(mov) =>
          mov.observacion ? (
            <div className="flex flex-col gap-2 p-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40">
                Observaciones del Movimiento
              </span>
              <p className="text-[13px] text-[var(--text-theme)]/70 italic font-medium leading-relaxed">
                "{mov.observacion}"
              </p>
            </div>
          ) : null
        }
        meta={{
          total: totalItems,
          perPage: limite,
          currentPage: pagina,
          lastPage: totalPaginas,
          prev: pagina > 1 ? pagina - 1 : null,
          next: pagina < totalPaginas ? pagina + 1 : null,
        }}
        onPageChange={setPagina}
        mostrarFiltros={true}
        filtrosElementos={
          <>
            <FechaInput
              label="Desde la fecha"
              value={fechaInicio}
              onChange={setFechaInicio}
              className={inputClasses}
              size="sm"
            />
            <FechaInput
              label="Hasta la fecha"
              value={fechaFin}
              onChange={setFechaFin}
              className={inputClasses}
              size="sm"
            />
          </>
        }
        elementosSuperior={
          movimientos &&
          movimientos.length > 0 && (
            <PDFDownloadLink
              document={
                <ReporteMovimientosPDF
                  movimientos={movimientos}
                  tipoArticulo={tipoArticulo}
                  fechaInicio={fechaInicio}
                  fechaFin={fechaFin}
                />
              }
              fileName={`reporte_${tipoArticulo.toLowerCase()}_${new Date().toISOString().split("T")[0]}.pdf`}
            >
              {({ loading }) => (
                <button
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary-subtle)] border border-[var(--primary)]/20 rounded-md font-bold text-[11px] uppercase tracking-wider cursor-pointer text-[var(--primary)]"
                >
                  {loading ? (
                    <CargandoIcono size={14} className="animate-spin" />
                  ) : (
                    <DescargarIcono size={14} />
                  )}
                  {loading ? "Generando..." : "Descargar Reporte"}
                </button>
              )}
            </PDFDownloadLink>
          )
        }
      />

      {/* Confirmation Modal */}
      <ModalConfirmacion
        open={!!movimientoAEliminar}
        onClose={() => setMovimientoAEliminar(null)}
        onConfirm={handleEliminar}
        isPending={isEliminando}
        titulo="Eliminar Movimiento"
        mensaje={
          movimientoAEliminar?.origenMovimiento === "PRODUCCION"
            ? "⚠️ Este es un movimiento de PRODUCCIÓN. Al eliminarlo se revertirá el stock del producto Y de todas las materias primas utilizadas. ¿Estás seguro?"
            : `¿Estás seguro de que deseas eliminar este movimiento? El stock de ${movimientoAEliminar?.nombreArticulo} será revertido automáticamente.`
        }
        textoConfirmar="Eliminar y Revertir"
      />
    </div>
  );
};

export default ListaMovimientos;
