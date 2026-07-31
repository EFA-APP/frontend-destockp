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
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Contabilidad</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Libro Mayor</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <FileText color="var(--primary)" size={28} strokeWidth={2.5} />
            Libro Mayor
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Explorá el saldo acumulado y el detalle de movimientos por cuenta
            contable.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/panel/contabilidad/libro-menor"
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          >
            <User size={14} />
            Ver Libro Menor
          </Link>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 rounded-t-xl">
          <FiltroIcono size={14} className="text-[#1FAE6D]" />
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">
            Parámetros de Consulta
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Layers size={12} className="text-[#1FAE6D]" /> Unidad de
                Negocio
              </label>
              <select
                value={codigoUnidadNegocio}
                onChange={(e) => setCodigoUnidadNegocio(e.target.value)}
                className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all"
              >
                <option value="">Todas las Unidades</option>
                {usuario?.unidadesNegocio?.map((u) => (
                  <option key={u.codigo} value={u.codigo}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Calendar size={12} className="text-[#1FAE6D]" /> Rango de
                Fechas
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fechaDesde || ""}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all"
                />
                <div className="text-gray-400 font-bold">→</div>
                <input
                  type="date"
                  value={fechaHasta || ""}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {!codigoCuenta ? (
        // VISTA 1: LISTADO DE CUENTAS CON MOVIMIENTOS
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 text-white rounded-md flex items-center justify-center">
                <Layers size={16} />
              </div>
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                Cuentas con Movimientos
              </h4>
            </div>
          </div>
          <DataTable
            columnas={[
              {
                key: "codigoCuentaContable",
                etiqueta: "Código",
                renderizar: (val) => (
                  <span className="font-mono text-gray-500 text-[12px] font-bold">
                    {val}
                  </span>
                ),
              },
              {
                key: "nombreCuentaContable",
                etiqueta: "Cuenta Contable",
                renderizar: (val) => (
                  <span className="font-bold text-[13px] text-gray-800">
                    {val}
                  </span>
                ),
              },
              {
                key: "totalDebe",
                etiqueta: "Total Debe",
                renderizar: (val) => (
                  <span className="font-mono text-emerald-700 text-[13px] font-black">
                    {formatPrice(val)}
                  </span>
                ),
              },
              {
                key: "totalHaber",
                etiqueta: "Total Haber",
                renderizar: (val) => (
                  <span className="font-mono text-rose-700 text-[13px] font-black">
                    {formatPrice(val)}
                  </span>
                ),
              },
              {
                key: "saldo",
                etiqueta: "Saldo (Variación)",
                renderizar: (val) => (
                  <span className="font-mono font-black text-[13px] text-gray-900">
                    {formatPrice(val)}
                  </span>
                ),
              },
              {
                key: "acciones",
                etiqueta: "",
                renderizar: (_, row) => (
                  <button
                    onClick={() => setCodigoCuenta(row.codigoCuentaContable)}
                    className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 text-[10px] uppercase font-bold text-gray-700 transition-colors cursor-pointer"
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
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setCodigoCuenta(null)}
              className="px-4 py-2 rounded-md bg-white border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer shadow-sm"
            >
              ← Volver al Listado
            </button>
            <div className="text-sm font-black text-gray-900 flex items-center gap-2">
              <span className="text-gray-400 font-mono text-xs">
                {datosMayor?.cuenta?.codigoSecuencial}
              </span>
              {datosMayor?.cuenta?.nombre || "Cargando..."}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-32 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                Consultando Movimientos...
              </p>
            </div>
          ) : datosMayor && Array.isArray(datosMayor.movimientos) ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* TOOLBAR DE ACCIONES */}
              <div className="flex justify-end items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
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
                  className="flex items-center gap-2 bg-[#1FAE6D] text-white px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-[#178F58] transition-all shadow-sm no-underline"
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
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ArrowDownLeft size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Débitos Totales
                    </span>
                  </div>
                  <p className="text-2xl font-black text-gray-900 font-mono tracking-tight">
                    {formatPrice(totalDebe)}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                      <ArrowUpRight size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Créditos Totales
                    </span>
                  </div>
                  <p className="text-2xl font-black text-gray-900 font-mono tracking-tight">
                    {formatPrice(totalHaber)}
                  </p>
                </div>

                {/* KPI HERO NEGRO */}
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl relative overflow-hidden text-white">
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="w-10 h-10 rounded-md bg-white/10 text-white flex items-center justify-center">
                      <Wallet size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Saldo Final
                    </span>
                  </div>
                  <p className="text-3xl font-black text-white font-mono tracking-tight relative z-10">
                    {formatPrice(saldoFinal)}
                  </p>
                  <div className="flex items-center gap-2 mt-4 relative z-10">
                    <span className="w-2 h-2 rounded-full bg-[#1FAE6D]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {saldoFinal >= 0 ? "Saldo Deudor" : "Saldo Acreedor"}
                    </span>
                  </div>
                </div>
              </div>

              {/* TABLA PRINCIPAL */}
              <div className="bg-white border border-[var(--border-subtle)] rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-md flex items-center justify-center text-emerald-600">
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
