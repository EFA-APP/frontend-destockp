import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useObtenerMovimientos } from "../../../../Backend/Articulos/queries/Movimientos/useObtenerMovimientos.query";
import { MovimientoIcono, HistorialIcono } from "../../../../assets/Icons";
import {
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
  Package,
} from "lucide-react";

import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import DataTable, { Highlight } from "../../../UI/DataTable/DataTable";
import FechaInput from "../../../UI/FechaInput/FechaInput";

const HistorialMovimientos = () => {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(20);
  const [fechaInicio, setFechaInicio] = useState(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [fechaFin, setFechaFin] = useState(() => {
    const hoy = new Date();
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  });

  const { data: responseMovs, isLoading } = useObtenerMovimientos(
    undefined,
    "MATERIA_PRIMA",
    fechaInicio || undefined,
    fechaFin || undefined,
    undefined,
    pagina,
    200,
  );

  const movimientos = useMemo(() => {
    return responseMovs?.movimientos || [];
  }, [responseMovs]);

  const movimientosProcesados = useMemo(() => {
    return movimientos.map((mov) => {
      let meta = {};

      try {
        if (mov.descripcion) {
          meta = JSON.parse(mov.descripcion);
        }
      } catch (e) {}

      return {
        ...mov,
        lote: meta.lote || "S/L",
        cliente: meta.cliente || "S/D",
        etapa: meta.etapa || "",
        chofer: meta.chofer || "",
        transporte: meta.transporte || "",
        patente: meta.patente || "",
        ctg: meta.ctg || "",
        cartaPorte: meta.cartaPorte || "",
        ticketBalanza: meta.ticketBalanza || "",
        facturaRef: meta.facturaRef || "",
        tipoEnvase: meta.tipoEnvase || "GRANEL",
        kgPorEnvase: meta.kgPorEnvase || 0,
        cantidadEnvases: meta.cantidadEnvases || 1,
        pano: meta.pano || "",
        depositoNombreMeta: meta.nombreDeposito || meta.depositoNombre || "",
      };
    });
  }, [movimientos]);

  const movimientosFiltrados = useMemo(() => {
    return movimientosProcesados.filter((mov) => {
      // Excluir los movimientos automáticos de alta de sistema
      if (mov.origenMovimiento === "ALTA_SISTEMA") return false;

      const matchTipo =
        filtroTipo === "TODOS" || mov.tipoMovimiento === filtroTipo;

      const searchStr =
        `${mov.lote} ${mov.cliente} ${mov.nombreArticulo} ${mov.materiaPrima?.nombre} ${mov.etapa || ""} ${mov.chofer} ${mov.patente} ${mov.ctg} ${mov.cartaPorte} ${mov.pano} ${mov.deposito?.nombre} ${mov.depositoNombreMeta}`.toLowerCase();

      const matchBusqueda = searchStr.includes(busqueda.toLowerCase());

      return matchTipo && matchBusqueda;
    });
  }, [movimientosProcesados, busqueda, filtroTipo]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroTipo, fechaInicio, fechaFin]);

  const totalKilosIngresados = useMemo(() => {
    return movimientosFiltrados
      .filter((m) => m.tipoMovimiento === "INGRESO")
      .reduce((sum, m) => sum + m.cantidad, 0);
  }, [movimientosFiltrados]);

  const totalKilosEgresados = useMemo(() => {
    return movimientosFiltrados
      .filter((m) => m.tipoMovimiento === "EGRESO")
      .reduce((sum, m) => sum + m.cantidad, 0);
  }, [movimientosFiltrados]);

  const totalItems = movimientosFiltrados.length;
  const totalPaginas = Math.ceil(totalItems / limite) || 1;

  const movimientosPaginados = useMemo(() => {
    const inicio = (pagina - 1) * limite;
    return movimientosFiltrados.slice(inicio, inicio + limite);
  }, [movimientosFiltrados, pagina, limite]);

  const columnas = useMemo(
    () => [
      {
        key: "fecha",
        etiqueta: "Fecha",
        renderizar: (valor) => {
          try {
            const fecha = new Date(valor);

            const fechaFormateada = fecha.toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            const horaFormateada = fecha.toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div className="flex flex-col">
                <span className="font-semibold text-slate-700 text-sm">
                  {fechaFormateada}
                </span>

                <span className="text-xs text-slate-400">
                  {horaFormateada} hs
                </span>
              </div>
            );
          } catch (e) {
            return valor;
          }
        },
      },

      {
        key: "tipoMovimiento",
        etiqueta: "Operación",
        renderizar: (valor) => {
          const esIngreso = valor === "INGRESO";

          return (
            <span
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium border ${
                esIngreso
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {esIngreso ? (
                <ArrowDownLeft size={14} />
              ) : (
                <ArrowUpRight size={14} />
              )}

              {valor}
            </span>
          );
        },
      },

      {
        key: "etapa",
        etiqueta: "Etapa",
        renderizar: (valor) => {
          if (!valor) return <span className="italic text-slate-400 text-xs">-</span>;

          let colorClase = "bg-slate-50 text-slate-600 border-slate-200";
          if (valor === "INGRESO") colorClase = "bg-emerald-50 text-emerald-700 border-emerald-100";
          else if (valor === "EGRESO") colorClase = "bg-rose-50 text-rose-700 border-rose-100";
          else if (valor === "EN PROCESO") colorClase = "bg-amber-50 text-amber-700 border-amber-100";
          else if (valor === "TERMINADO" || valor === "TERMINADO MOV. STOCK") colorClase = "bg-blue-50 text-blue-700 border-blue-100";

          return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${colorClase}`}>
              <Highlight text={valor} term={busqueda} />
            </span>
          );
        },
      },

      {
        key: "lote",
        etiqueta: "Lote",
        renderizar: (valor) => (
          <span className="text-slate-700 font-medium text-sm">
            <Highlight text={valor || "S/L"} term={busqueda} />
          </span>
        ),
      },

      {
        key: "cliente",
        etiqueta: "Cliente / Remitente",
        renderizar: (valor) => (
          <div
            className="max-w-[240px] truncate text-slate-700 font-medium text-sm"
            title={valor}
          >
            <Highlight text={valor || "S/D"} term={busqueda} />
          </div>
        ),
      },

      {
        key: "nombreArticulo",
        etiqueta: "Especie / Grano",
        renderizar: (valor, fila) => {
          const nombre = fila.materiaPrima?.nombre || valor || "S/N";

          return (
            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-md text-sm font-medium">
              <Highlight text={nombre} term={busqueda} />
            </span>
          );
        },
      },

      {
        key: "cantidad",
        etiqueta: "Kilos",
        renderizar: (valor, fila) => {
          const esIngreso = fila.tipoMovimiento === "INGRESO";

          return (
            <span
              className={`font-semibold text-sm ${
                esIngreso ? "text-green-700" : "text-red-700"
              }`}
            >
              {esIngreso ? "+" : "-"}
              {Number(valor).toLocaleString("es-AR")} kg
            </span>
          );
        },
      },

      {
        key: "pano",
        etiqueta: "Ubicación",
        renderizar: (valor, fila) => {
          const galpon =
            fila.deposito?.nombre || fila.depositoNombreMeta || "SIN GALPÓN";

          return (
            <div className="flex flex-col gap-1">
              <span className="text-slate-700 text-sm font-medium">
                {galpon}
              </span>

              {valor && (
                <span className="text-xs text-slate-500">
                  PAÑO: <Highlight text={valor} term={busqueda} />
                </span>
              )}
            </div>
          );
        },
      },

      {
        key: "patente",
        etiqueta: "Logística",
        renderizar: (valor, fila) => (
          <div className="space-y-1 text-sm">
            {fila.patente && (
              <div className="text-slate-700">
                <span className="text-slate-400">Pat:</span>{" "}
                <span className="font-medium">
                  <Highlight text={fila.patente} term={busqueda} />
                </span>
              </div>
            )}

            {fila.chofer && (
              <div className="truncate max-w-[160px] text-slate-700">
                <span className="text-slate-400">Chofer:</span>{" "}
                <span className="font-medium">
                  <Highlight text={fila.chofer} term={busqueda} />
                </span>
              </div>
            )}

            {fila.ctg && (
              <div className="text-slate-700">
                <span className="text-slate-400">CTG:</span>{" "}
                <span className="font-medium">
                  <Highlight text={fila.ctg} term={busqueda} />
                </span>
              </div>
            )}

            {!fila.patente && !fila.chofer && !fila.ctg && (
              <span className="italic text-slate-400 text-xs">
                Sin logística
              </span>
            )}
          </div>
        ),
      },
    ],
    [busqueda],
  );

  const renderDetalleMovimiento = (mov) => {
    const tieneDoc = !!(mov.ctg || mov.cartaPorte || mov.ticketBalanza || mov.facturaRef);

    return (
      <div className={`grid grid-cols-1 ${tieneDoc ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4 p-4 bg-slate-50 border border-slate-200 rounded-md`}>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-slate-500" />

            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Detalles de Carga
            </h4>
          </div>

          <ul className="space-y-3 text-sm">
            {mov.etapa && (
              <li className="flex justify-between">
                <span className="text-slate-500">Etapa</span>
                <span className="text-[var(--primary)] font-bold">{mov.etapa}</span>
              </li>
            )}

            <li className="flex justify-between">
              <span className="text-slate-500">Tipo Envase</span>

              <span className="text-slate-700 font-medium">
                {mov.tipoEnvase}
              </span>
            </li>

            {mov.tipoEnvase !== "GRANEL" && (
              <>
                <li className="flex justify-between">
                  <span className="text-slate-500">Envases</span>

                  <span className="text-slate-700 font-medium">
                    {mov.cantidadEnvases}
                  </span>
                </li>

                <li className="flex justify-between">
                  <span className="text-slate-500">Kg por Envase</span>

                  <span className="text-slate-700 font-medium">
                    {mov.kgPorEnvase.toLocaleString("es-AR")} kg
                  </span>
                </li>
              </>
            )}

            {mov.transporte && (
              <li className="flex flex-col gap-1">
                <span className="text-slate-500">Transporte</span>

                <span className="text-slate-700 font-medium">
                  {mov.transporte}
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Si no tiene informacion que no renderice la card */}
        {tieneDoc && (
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-slate-500" />

              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Documentación
              </h4>
            </div>

            <ul className="space-y-3 text-sm">
              {mov.ctg && (
                <li className="flex justify-between">
                  <span className="text-slate-500">CTG</span>

                  <span className="text-slate-700 font-medium">{mov.ctg}</span>
                </li>
              )}

              {mov.cartaPorte && (
                <li className="flex justify-between">
                  <span className="text-slate-500">Carta Porte</span>

                  <span className="text-slate-700 font-medium">
                    {mov.cartaPorte}
                  </span>
                </li>
              )}

              {mov.ticketBalanza && (
                <li className="flex justify-between">
                  <span className="text-slate-500">Ticket</span>

                  <span className="text-slate-700 font-medium">
                    {mov.ticketBalanza}
                  </span>
                </li>
              )}

              {mov.facturaRef && (
                <li className="flex justify-between">
                  <span className="text-slate-500">Factura</span>

                  <span className="text-slate-700 font-medium">
                    {mov.facturaRef}
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={16} className="text-slate-500" />

            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Observaciones
            </h4>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {mov.observacion || "Sin observaciones registradas."}
          </p>
        </div>
      </div>
    );
  };

  return (
    <ContenedorSeccion className="px-5 py-4 bg-[#f8fafc] min-h-screen">
      <EncabezadoSeccion
        ruta="Historial de Movimientos de Grano"
        icono={<HistorialIcono size={22} className="text-slate-700" />}
        volver={true}
        redireccionAnterior={-1}
      />

      <div className="space-y-6 mt-6 pb-20">
        {/* RESUMEN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-md border border-green-100 text-green-700">
              <ArrowDownLeft size={20} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Total Ingresos
              </p>

              <h3 className="text-2xl font-semibold text-slate-700 mt-1">
                {totalKilosIngresados.toLocaleString()} kg
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-md border border-red-100 text-red-700">
              <ArrowUpRight size={20} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Total Egresos
              </p>

              <h3 className="text-2xl font-semibold text-slate-700 mt-1">
                {totalKilosEgresados.toLocaleString()} kg
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-md border border-slate-200 text-slate-700">
              <MovimientoIcono size={20} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Balance Neto
              </p>

              <h3 className="text-2xl font-semibold text-slate-700 mt-1">
                {(totalKilosIngresados - totalKilosEgresados).toLocaleString()}{" "}
                kg
              </h3>
            </div>
          </div>
        </div>

        {/* TABLA */}
        <DataTable
          id_tabla="historial_movimientos_granos"
          llaveTituloMobile="lote"
          datos={movimientosPaginados}
          columnas={columnas}
          mostrarAcciones={false}
          loading={isLoading}
          emptyMessage="No se encontraron movimientos registrados"
          renderDetalle={renderDetalleMovimiento}
          meta={{
            total: totalItems,
            perPage: limite,
            currentPage: pagina,
            lastPage: totalPaginas,
            prev: pagina > 1 ? pagina - 1 : null,
            next: pagina < totalPaginas ? pagina + 1 : null,
          }}
          onPageChange={setPagina}
          onLimitChange={setLimite}
          mostrarBuscador={true}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          placeholderBuscador="Buscar movimientos..."
          mostrarFiltros={false}
          filtrosElementos={null}
          elementosSuperior={
            <div className="flex flex-wrap items-center gap-4">
              {/* Selector de Tipo */}
              <div className="flex items-center gap-2">
                {["TODOS", "INGRESO", "EGRESO"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFiltroTipo(t)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-md text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg group ${
                      filtroTipo === t
                        ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-[var(--primary)]/10"
                        : "bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border-[var(--primary)]/20 text-[var(--primary)] shadow-amber-700/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Separador */}
              <div className="h-6 w-px bg-slate-200 hidden lg:block" />

              {/* Filtros de Fecha Directos */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Desde</span>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="h-9 px-3 text-[13px] rounded-md bg-slate-50/60 focus:bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-[var(--primary)] transition-all cursor-pointer font-semibold"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hasta</span>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="h-9 px-3 text-[13px] rounded-md bg-slate-50/60 focus:bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-[var(--primary)] transition-all cursor-pointer font-semibold"
                  />
                </div>
                {(fechaInicio || fechaFin) && (
                  <button
                    onClick={() => {
                      setFechaInicio("");
                      setFechaFin("");
                    }}
                    className="h-9 px-3 text-[11px] font-bold uppercase tracking-wider text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 rounded-md transition-all cursor-pointer flex items-center justify-center"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          }
        />
      </div>
    </ContenedorSeccion>
  );
};

export default HistorialMovimientos;
