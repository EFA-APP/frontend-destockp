import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LibroMayorIcono,
  BuscadorIcono,
  CalendarioIcono,
  DineroIcono,
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
import { usePlanDeCuentas } from "../../../../Backend/hooks/Contabilidad/PlanDeCuenta/usePlanDeCuentas";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { useEntidades } from "../../../../Backend/Contactos/hooks/useEntidades";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import DataTable from "../../../UI/DataTable/DataTable";
import SearchableSelect from "../../../UI/Select/SearchableSelect";
import { formatPrice, formatDate } from "../../../../utils/formatters";
import { PDFDownloadLink } from "@react-pdf/renderer";
import LibroMayorPDF from "./LibroMayorPDF";

const LibroMayor = () => {
  const { usuario } = useAuthStore();
  const {
    codigoCuenta,
    setCodigoCuenta,
    codigoContacto,
    setCodigoContacto,
    datosMayor,
    loading,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
  } = useLibroMayor();

  const { cuentasImputables, isLoading: isLoadingCuentas } = usePlanDeCuentas();

  const [entidadSeleccionada, setEntidadSeleccionada] = React.useState("");
  const { entidades, cargandoEntidades } = useEntidades();
  const { contactos, isLoading: isLoadingContactos } = useContactos({
    tipoEntidad: entidadSeleccionada,
    limite: 100,
  });

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

  const contactoSeleccionadoLabel = useMemo(() => {
    if (!codigoContacto || !contactos) return null;
    const contacto = contactos.find(
      (c) => c.codigoSecuencial === Number(codigoContacto),
    );
    if (!contacto) return null;
    return contacto.razonSocial || `${contacto.nombre} ${contacto.apellido}`;
  }, [codigoContacto, contactos]);

  return (
    <div className="w-full py-6 px-8 bg-slate-50/50 min-h-screen">
      <EncabezadoSeccion
        ruta="Libro Mayor"
        icono={
          <div className="w-10 h-10 bg-indigo-500/10 rounded-md flex items-center justify-center text-indigo-600 shadow-inner">
            <LibroMayorIcono size={22} strokeWidth={2.5} />
          </div>
        }
        subTitulo=""
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-8">
        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
          <FiltroIcono size={14} className="text-indigo-500" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-900/60">
            Parámetros de Consulta
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                <Layers size={12} className="text-indigo-500" /> Cuenta
                Principal
              </label>
              <div className="bg-white border border-slate-200 rounded-md focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all shadow-sm">
                <SearchableSelect
                  options={cuentasImputables || []}
                  value={codigoCuenta}
                  onChange={(e) => setCodigoCuenta(e?.target?.value)}
                  placeholder="Seleccione cuenta contable..."
                  disabled={isLoadingCuentas}
                  className="border-none shadow-none font-bold"
                />
              </div>
            </div>

            <div className="lg:col-span-4 space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                <User size={12} className="text-indigo-500" /> Filtrar por
                Entidad
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={entidadSeleccionada}
                  onChange={(e) => {
                    setEntidadSeleccionada(e.target.value);
                    setCodigoContacto(null);
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-md text-[12px] font-black uppercase tracking-wider focus:border-indigo-400 focus:outline-none transition-all shadow-sm"
                  disabled={cargandoEntidades}
                >
                  <option value="">Todas</option>
                  {entidades.map((ent) => (
                    <option key={ent.clave} value={ent.clave}>
                      {ent.nombre}
                    </option>
                  ))}
                </select>
                <div className="bg-white border border-slate-200 rounded-md shadow-sm">
                  <SearchableSelect
                    options={(contactos || []).map((c) => ({
                      value: c.codigoSecuencial,
                      label: `${c.razonSocial || c.nombre + " " + c.apellido}`,
                    }))}
                    value={codigoContacto}
                    onChange={(e) => setCodigoContacto(e?.target?.value)}
                    placeholder="Contacto..."
                    disabled={!entidadSeleccionada || isLoadingContactos}
                    className="border-none shadow-none text-[11px] font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                <Calendar size={12} className="text-indigo-500" /> Rango de
                Fechas
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fechaDesde || ""}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-md text-[13px] font-black focus:border-indigo-400 focus:outline-none transition-all shadow-sm"
                />
                <div className="text-slate-300">→</div>
                <input
                  type="date"
                  value={fechaHasta || ""}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-md text-[13px] font-black focus:border-indigo-400 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-32 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 bg-indigo-500/20"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 relative"></div>
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-900/40 mt-8 animate-pulse">
            Sincronizando Libro Mayor
          </p>
        </div>
      ) : datosMayor && Array.isArray(datosMayor.movimientos) ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* TOOLBAR DE ACCIONES */}
          <div className="flex justify-end items-center gap-4 bg-white/50 p-4 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
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
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 no-underline active:scale-95"
            >
              {({ loading }) => (
                <>
                  <DescargarIcono size={16} />
                  {loading ? "Generando..." : "Descargar Libro Mayor (PDF)"}
                </>
              )}
            </PDFDownloadLink>
          </div>

          {/* STAT CARDS PREMIUM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-emerald-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
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
                <div className="h-full bg-emerald-500 w-full opacity-20" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-rose-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-md bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
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
                <div className="h-full bg-rose-500 w-full opacity-20" />
              </div>
            </div>

            <div
              className={`p-6 rounded-2xl border shadow-sm group transition-all ${
                saldoFinal >= 0
                  ? "bg-emerald-600 border-emerald-500"
                  : "bg-rose-600 border-rose-500"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center text-white backdrop-blur-sm group-hover:rotate-12 transition-transform">
                  <Wallet size={20} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-white/70">
                  Saldo Final de Gestión
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
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500/10 rounded flex items-center justify-center text-indigo-600">
                  <ArrowRightLeft size={16} />
                </div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                  Movimientos Detallados
                </h4>
              </div>
            </div>
            <DataTable
              columnas={columnas}
              datos={datosMayor.movimientos}
              mostrarBuscador={false}
              emptyMessage="No hay movimientos registrados para los criterios seleccionados"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center py-40 bg-white rounded-3xl border-2 border-slate-100 border-dashed animate-in fade-in duration-700">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 border border-slate-100 relative z-10">
              <Search size={48} strokeWidth={1} />
            </div>
          </div>
          <h3 className="text-lg font-black text-slate-500 uppercase tracking-[0.2em] mb-2 text-center">
            Inicie una Consulta
          </h3>
          <p className="text-sm font-black text-[var(--primary)]/60 text-center max-w-sm px-6 uppercase tracking-tighter">
            Seleccione una cuenta contable del listado superior para visualizar
            el historial completo de saldos y movimientos.
          </p>
        </div>
      )}
    </div>
  );
};

export default LibroMayor;
