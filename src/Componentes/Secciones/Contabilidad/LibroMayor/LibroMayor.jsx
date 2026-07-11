import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LibroMayorIcono,
  CalendarioIcono,
  FiltroIcono,
  DescargarIcono,
} from "../../../../assets/Icons";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Calendar,
  User,
  Layers,
  ArrowRightLeft,
  FileText,
  Search,
} from "lucide-react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { useLibroMayor } from "../../../../Backend/hooks/Contabilidad/LibroMayor/useLibroMayor";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import DataTable from "../../../UI/DataTable/DataTable";
import { formatPrice, formatDate } from "../../../../utils/formatters";
import { PDFDownloadLink } from "@react-pdf/renderer";
import LibroMayorPDF from "./LibroMayorPDF";

const LibroMayor = () => {
  const { usuario } = useAuthStore();
  const {
    codigoCuenta,
    setCodigoCuenta,
    codigoContacto,
    codigoUnidadNegocio,
    setCodigoUnidadNegocio,
    cuentasConMovimientos,
    loadingCuentas,
    datosMayor,
    loading,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
  } = useLibroMayor();

  const [paginaActual, setPaginaActual] = React.useState(1);
  const [filasPorPagina, setFilasPorPagina] = React.useState(15);

  React.useEffect(() => {
    setPaginaActual(1);
  }, [codigoCuenta, codigoContacto, fechaDesde, fechaHasta]);

  const movimientosPaginados = useMemo(() => {
    if (!datosMayor?.movimientos) return [];
    const inicio = (paginaActual - 1) * filasPorPagina;
    return datosMayor.movimientos.slice(inicio, inicio + filasPorPagina);
  }, [datosMayor?.movimientos, paginaActual, filasPorPagina]);

  const metaPaginacion = useMemo(() => {
    if (!datosMayor?.movimientos) return null;
    const totalItems = datosMayor.movimientos.length;
    const totalPaginas = Math.ceil(totalItems / filasPorPagina) || 1;
    return {
      total: totalItems,
      perPage: filasPorPagina,
      currentPage: paginaActual,
      lastPage: totalPaginas,
      prev: paginaActual > 1 ? paginaActual - 1 : null,
      next: paginaActual < totalPaginas ? paginaActual + 1 : null,
    };
  }, [datosMayor?.movimientos, paginaActual, filasPorPagina]);

  const columnas = [
    {
      key: "fecha",
      etiqueta: "Fecha",
      renderizar: (val, row) => (
        <div className="flex items-center gap-2 py-1">
          <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-500">
            <Calendar size={14} />
          </div>
          <span className="text-[13px] font-black text-slate-900">
            {formatDate(row?.asiento?.fecha)}
          </span>
        </div>
      ),
    },
    {
      key: "descripcion",
      etiqueta: "Descripción / Concepto",
      renderizar: (val, row) => (
        <div className="flex flex-col py-1">
          <span className="font-black text-[14px] text-black leading-tight uppercase tracking-tight">
            {row?.asiento?.descripcion || "-"}
          </span>
          {row?.asiento?.origenModulo && (
            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-0.5 opacity-70">
              Origen: {row.asiento.origenModulo}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "referencia",
      etiqueta: "Referencia",
      renderizar: (val, row) => {
        const ref = row?.asiento?.referencia;
        return ref ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 w-fit">
            <FileText size={12} />
            <span className="text-[11px] font-black uppercase tracking-wider">
              {ref}
            </span>
          </div>
        ) : (
          <span className="text-slate-300">-</span>
        );
      },
    },
    {
      key: "debe",
      etiqueta: "Debe",
      renderizar: (val) => {
        const num = Number(val);
        return num > 0 ? (
          <div className="text-right pr-4">
            <span className="font-black text-[14px] text-emerald-600 font-mono">
              {formatPrice(num)}
            </span>
          </div>
        ) : (
          <div className="text-right pr-4 opacity-10 font-mono">-</div>
        );
      },
    },
    {
      key: "haber",
      etiqueta: "Haber",
      renderizar: (val) => {
        const num = Number(val);
        return num > 0 ? (
          <div className="text-right pr-4">
            <span className="font-black text-[14px] text-rose-600 font-mono">
              {formatPrice(num)}
            </span>
          </div>
        ) : (
          <div className="text-right pr-4 opacity-10 font-mono">-</div>
        );
      },
    },
    {
      key: "saldo",
      etiqueta: "Saldo Acum.",
      renderizar: (val) => {
        const num = Number(val) || 0;
        return (
          <div className="text-right">
            <span
              className={`font-black text-[14px] font-mono px-3 py-1 rounded ${
                num >= 0
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-rose-700 bg-rose-50"
              }`}
            >
              {formatPrice(num)}
            </span>
          </div>
        );
      },
    },
  ];

  const totalDebe = useMemo(() => {
    if (!datosMayor?.movimientos) return 0;
    return datosMayor.movimientos.reduce(
      (acc, m) => acc + (Number(m.debe) || 0),
      0,
    );
  }, [datosMayor]);

  const totalHaber = useMemo(() => {
    if (!datosMayor?.movimientos) return 0;
    return datosMayor.movimientos.reduce(
      (acc, m) => acc + (Number(m.haber) || 0),
      0,
    );
  }, [datosMayor]);

  const saldoFinal = useMemo(
    () => Number(datosMayor?.saldoFinal) || 0,
    [datosMayor],
  );

  const contactoSeleccionadoLabel = null;

  return (
    <div className="w-full flex flex-col gap-6 p-6 md:p-8 animate-fade-in bg-slate-50/50 min-h-screen">
      <EncabezadoSeccion
        ruta="Libro Mayor"
        icono={<LibroMayorIcono size={22} className="text-[var(--primary)]" />}
        titulo="Libro Mayor"
        descripcion="Explorá el saldo acumulado y el detalle de movimientos por cuenta contable."
        acciones={
          <Link
            to="/panel/contabilidad/libro-menor"
            className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
          >
            <User size={14} />
            Ver Libro Menor
          </Link>
        }
      />

      {/* FILTROS ELEGANTES */}
      <div className="bg-white border border-[var(--border-subtle)] rounded-xl shadow-sm mb-2">
        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2 rounded-t-xl">
          <FiltroIcono size={14} className="text-[var(--primary)]" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--primary)]/60">
            Parámetros de Consulta
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                <Layers size={12} className="text-[var(--primary)]" /> Unidad de Negocio
              </label>
              <select
                value={codigoUnidadNegocio}
                onChange={(e) => setCodigoUnidadNegocio(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[var(--border-subtle)] rounded-xl text-[12px] font-black uppercase tracking-wider focus:border-[var(--primary)] focus:outline-none transition-all shadow-sm"
              >
                <option value="">Todas las Unidades</option>
                {usuario?.unidadesNegocio?.map((u) => (
                  <option key={u.codigo} value={u.codigo}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                <Calendar size={12} className="text-[var(--primary)]" /> Rango de Fechas
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fechaDesde || ""}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[var(--border-subtle)] rounded-xl text-[13px] font-black focus:border-[var(--primary)] focus:outline-none transition-all shadow-sm"
                />
                <div className="text-slate-300">→</div>
                <input
                  type="date"
                  value={fechaHasta || ""}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[var(--border-subtle)] rounded-xl text-[13px] font-black focus:border-[var(--primary)] focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {!codigoCuenta ? (
        // VISTA 1: LISTADO DE CUENTAS CON MOVIMIENTOS
        <div className="bg-white border border-[var(--border-subtle)] rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600">
                <Layers size={16} />
              </div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                Cuentas con Movimientos
              </h4>
            </div>
          </div>
          <DataTable
            columnas={[
              {
                key: "codigoCuentaContable",
                etiqueta: "Código",
                renderizar: (val) => <span className="font-mono text-slate-500 text-[12px]">{val}</span>,
              },
              {
                key: "nombreCuentaContable",
                etiqueta: "Cuenta Contable",
                renderizar: (val) => <span className="font-bold text-[13px] text-slate-800">{val}</span>,
              },
              {
                key: "totalDebe",
                etiqueta: "Total Debe",
                renderizar: (val) => <span className="font-mono text-emerald-600 text-[13px] font-black">{formatPrice(val)}</span>,
              },
              {
                key: "totalHaber",
                etiqueta: "Total Haber",
                renderizar: (val) => <span className="font-mono text-rose-600 text-[13px] font-black">{formatPrice(val)}</span>,
              },
              {
                key: "saldo",
                etiqueta: "Saldo (Variación)",
                renderizar: (val) => <span className="font-mono font-black text-[13px]">{formatPrice(val)}</span>,
              },
              {
                key: "acciones",
                etiqueta: "",
                renderizar: (_, row) => (
                  <button
                    onClick={() => setCodigoCuenta(row.codigoCuentaContable)}
                    className="text-[11px] font-black uppercase text-[var(--primary)] bg-[var(--primary)]/10 px-4 py-2 rounded-lg hover:bg-[var(--primary)]/20 transition-colors"
                  >
                    Ver Detalle
                  </button>
                ),
              },
            ]}
            datos={cuentasConMovimientos}
            mostrarBuscador={true}
            isLoading={loadingCuentas}
            emptyMessage="No hay cuentas con movimientos en el período y unidad seleccionados."
          />
        </div>
      ) : (
        // VISTA 2: DETALLE DEL LIBRO MAYOR
        <>
          <div className="flex items-center gap-2 mb-2">
             <button
                onClick={() => setCodigoCuenta(null)}
                className="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-white border border-[var(--border-subtle)] px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                ← Volver al Listado
             </button>
             <div className="text-[14px] font-black text-slate-800 ml-4 flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[12px]">{datosMayor?.cuenta?.codigoSecuencial}</span>
                {datosMayor?.cuenta?.nombre || "Cargando..."}
             </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-32 bg-white rounded-xl border border-[var(--border-subtle)] shadow-sm">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 bg-emerald-500/20"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 relative"></div>
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-900/40 mt-8 animate-pulse">
                Consultando Movimientos
              </p>
            </div>
          ) : datosMayor && Array.isArray(datosMayor.movimientos) ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* TOOLBAR DE ACCIONES */}
              <div className="flex justify-end items-center gap-4 bg-white/50 p-4 rounded-xl border border-[var(--border-subtle)] shadow-sm backdrop-blur-sm">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Reportes Disponibles
                  </p>
                </div>
                <PDFDownloadLink
                  document={
                    <LibroMayorPDF
                      datosMayor={datosMayor}
                      empresa={{ nombre: usuario?.nombreEmpresa }}
                      filtros={{ fechaDesde, fechaHasta }}
                      contacto={contactoSeleccionadoLabel}
                    />
                  }
                  fileName={`Libro_Mayor_${datosMayor?.cuenta?.nombre || "reporte"}.pdf`}
                  className="flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#178F58] transition-all shadow-md active:scale-95 no-underline"
                >
                  {({ loading }) => (
                    <>
                      <DescargarIcono size={16} />
                      {loading ? "Generando..." : "Descargar Detalle (PDF)"}
                    </>
                  )}
                </PDFDownloadLink>
              </div>

              {/* STAT CARDS PREMIUM */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm group hover:border-emerald-200 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <ArrowDownLeft size={20} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                      Débitos Totales
                    </span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">
                    {formatPrice(totalDebe)}
                  </p>
                  <div className="w-full h-1 bg-slate-50 mt-4 rounded-full">
                    <div className="h-full bg-emerald-500 w-full opacity-20 rounded-full" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm group hover:border-rose-200 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                      <ArrowUpRight size={20} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                      Créditos Totales
                    </span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">
                    {formatPrice(totalHaber)}
                  </p>
                  <div className="w-full h-1 bg-slate-50 mt-4 rounded-full">
                    <div className="h-full bg-rose-500 w-full opacity-20 rounded-full" />
                  </div>
                </div>

                <div
                  className={`p-6 rounded-xl border shadow-sm group transition-all ${
                    saldoFinal >= 0
                      ? "bg-emerald-600 border-emerald-500"
                      : "bg-rose-600 border-rose-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-sm group-hover:rotate-12 transition-transform">
                      <Wallet size={20} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-white/70">
                      Saldo Final
                    </span>
                  </div>
                  <p className="text-3xl font-black text-white font-mono tracking-tighter drop-shadow-sm">
                    {formatPrice(saldoFinal)}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-80">
                      Cuenta Conciliada
                    </span>
                  </div>
                </div>
              </div>

              {/* TABLA PRINCIPAL */}
              <div className="bg-white border border-[var(--border-subtle)] rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600">
                      <ArrowRightLeft size={16} />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                      Movimientos Detallados
                    </h4>
                  </div>
                </div>
                <DataTable
                  columnas={columnas}
                  datos={movimientosPaginados}
                  mostrarBuscador={false}
                  mostrarAcciones={false}
                  meta={metaPaginacion}
                  onPageChange={(pagina) => setPaginaActual(pagina)}
                  onLimitChange={(limite) => {
                    setFilasPorPagina(limite);
                    setPaginaActual(1);
                  }}
                  emptyMessage="No hay movimientos registrados en el detalle de esta cuenta."
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center py-40 bg-white rounded-xl border border-[var(--border-subtle)] shadow-sm animate-in fade-in duration-700">
              <h3 className="text-lg font-black text-slate-500 uppercase tracking-[0.2em] mb-2 text-center">
                Sin Resultados
              </h3>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LibroMayor;
