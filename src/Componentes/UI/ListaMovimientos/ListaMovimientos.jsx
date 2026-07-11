import { useState } from "react";
import { useObtenerMovimientos } from "../../../Backend/Articulos/queries/Movimientos/useObtenerMovimientos.query";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import {
  CargandoIcono,
  ProduccionIcono,
  BorrarIcono,
  DescargarIcono,
} from "../../../assets/Icons";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReporteMovimientosPDF from "./ReporteMovimientosPDF";
import DateRangePicker from "../DateRangePicker/DateRangePicker";
import DataTable from "../DataTable/DataTable";
import { ColumnasMovimientos } from "./ColumnasMovimientos";
import { accionesMovimientos } from "./accionesMovimeintos";
import { useDepositos } from "../../../Backend/Articulos/queries/Deposito/useDepositos.query";
import { ChevronDown, RotateCcw, MapPin, Calendar } from "lucide-react";
import SearchableSelect from "../Select/SearchableSelect";

const ListaMovimientos = ({
  codigoArticulo,
  tipoArticulo,
  filtroOrigen = null,
}) => {
  const usuario = useAuthStore((state) => state.usuario);
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
  const [codigoDeposito, setCodigoDeposito] = useState("");
  const limite = 15;

  const { data: responseDepositos } = useDepositos();
  const rawDepositos = responseDepositos || [];
  const listaDepositos = (
    Array.isArray(rawDepositos)
      ? rawDepositos
      : Array.isArray(rawDepositos?.data)
        ? rawDepositos.data
        : []
  ).filter((d) => d.activo !== false);

  const { data: response, isLoading } = useObtenerMovimientos(
    codigoArticulo,
    tipoArticulo,
    fechaInicio,
    fechaFin,
    busqueda,
    pagina,
    limite,
    codigoDeposito,
  );

  const rawMovimientos = response?.movimientos || [];
  const totalItems = response?.total || 0;
  const totalPaginas = Math.ceil(totalItems / (limite || 15));

  const movimientos = filtroOrigen
    ? rawMovimientos?.filter((m) => m.origenMovimiento === filtroOrigen)
    : rawMovimientos;

  const clearFilters = () => {
    setFechaInicio("");
    setFechaFin("");
    setBusqueda("");
    setCodigoDeposito("");
    setPagina(1);
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
    <div className="pt-2 flex flex-col gap-5">
      {/* Panel de Filtros Siempre Visible */}
      <div className="relative bg-white border border-[var(--color-neutral-border)] rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] z-20">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--color-neutral-border)] bg-gray-50/50 rounded-t-[16px]">
          <MapPin size={16} className="text-[var(--color-neutral-text-main)]" />
          <h4 className="text-[13px] font-semibold text-[var(--color-neutral-text-main)]">
            Filtros del Historial
          </h4>
        </div>
        <div className="p-5 flex flex-wrap gap-4 items-end bg-white rounded-b-[16px]">
          <div className="flex flex-col gap-1 min-w-[280px]">
            <label className="text-[13px] font-semibold text-[var(--color-neutral-text-muted)] uppercase mb-1 ml-1 flex items-center gap-1.5">
              <Calendar className="text-[var(--color-brand-primary)]" size={12} />
              Periodo de Fechas
            </label>
            <DateRangePicker
              fechaDesde={fechaInicio}
              fechaHasta={fechaFin}
              onChange={(desde, hasta) => {
                setFechaInicio(desde);
                setFechaFin(hasta);
                setPagina(1);
              }}
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[250px] flex-1">
            <label className="text-[13px] font-semibold text-[var(--text-muted)] uppercase mb-1 ml-1 flex items-center gap-1.5">
              <MapPin size={12} className="text-[var(--primary)]" />
              Depósito
            </label>
            <SearchableSelect
              options={listaDepositos.map((dep) => ({
                value: dep.codigo,
                label: `${dep.nombre} ${dep.principal ? "(Principal)" : ""}`,
              }))}
              value={codigoDeposito ? Number(codigoDeposito) : ""}
              onChange={(e) => {
                setCodigoDeposito(e.target.value);
                setPagina(1);
              }}
              placeholder="Todos los Depósitos"
              className="w-full"
            />
          </div>

          <button
            onClick={clearFilters}
            type="button"
            className="flex items-center justify-center gap-2 h-[42px] px-5 py-2.5 bg-white hover:bg-gray-50 border border-[var(--color-neutral-border)] text-[var(--color-neutral-text-main)] rounded-[8px] font-semibold text-[13px] transition-colors cursor-pointer select-none active:scale-95 flex-shrink-0 group shadow-sm"
            title="Restablecer todos los filtros"
          >
            <RotateCcw
              size={16}
              className="transition-transform group-hover:-rotate-90 duration-300 text-[var(--color-neutral-text-muted)] group-hover:text-[var(--color-neutral-text-main)]"
            />
            Limpiar Filtros
          </button>
        </div>
      </div>

      <DataTable
        datos={movimientos}
        columnas={ColumnasMovimientos(busqueda)}
        mostrarAcciones={false}
        loading={isLoading}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Buscar por artículo, usuario u observación..."
        emptyMessage="No se registran eventos para este artículo"
        renderDetalle={(mov) =>
          mov.observacion ? (
            <div className="flex flex-col gap-2 p-2">
              <span className="text-[12px] font-semibold text-[var(--color-neutral-text-muted)]">
                Observaciones del Movimiento
              </span>
              <p className="text-[13px] text-[var(--color-neutral-text-main)] italic font-medium leading-relaxed">
                {busqueda ? (
                  <span>
                    {String(mov.observacion)
                      .split(new RegExp(`(${busqueda})`, "gi"))
                      .map((part, i) =>
                        part.toLowerCase() === busqueda.toLowerCase() ? (
                          <mark
                            key={i}
                            className="bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)] px-1 rounded-[4px] font-bold"
                          >
                            {part}
                          </mark>
                        ) : (
                          part
                        ),
                      )}
                  </span>
                ) : (
                  `"${mov.observacion}"`
                )}
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
        mostrarFiltros={false}
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
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-[var(--color-neutral-border)] rounded-[8px] font-semibold text-[13px] transition-colors cursor-pointer text-[var(--color-neutral-text-main)]"
                >
                  {loading ? (
                    <CargandoIcono size={16} className="animate-spin text-[var(--color-neutral-text-muted)]" />
                  ) : (
                    <DescargarIcono size={16} className="text-[var(--color-neutral-text-muted)]" />
                  )}
                  {loading ? "Generando..." : "Descargar Reporte"}
                </button>
              )}
            </PDFDownloadLink>
          )
        }
      />
    </div>
  );
};

export default ListaMovimientos;
