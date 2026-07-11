import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useAlumnos } from "../../../Backend/Contactos/hooks/useAlumnos";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { CuotasIcono } from "../../../assets/Icons";
import { accionesReutilizables } from "../../UI/AccionesReutilizables/accionesReutilizables";
import {
  AlertCircle,
  BookOpen,
  X,
  Loader,
  Printer,
  TrendingUp,
  Users,
  DollarSign,
  BarChart2,
} from "lucide-react";
import ModalPagoCuota from "./Cuotas/ModalPagoCuota";
import ModalEmisionIndividual from "./Cuotas/ModalEmisionIndividual";
import { ListarMovimientosApi } from "../../../Backend/Contactos/api/contactos.api";
import DataTable from "../../UI/DataTable/DataTable";

// ─── helpers ─────────────────────────────────────────────────────────────────

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const formatARS = (val) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(val || 0);

// ─── KPI Card ────────────────────────────────────────────────────────────────

const KpiCard = ({ label, value, sub, Icon, colorCls = "text-[var(--primary)]", bgCls = "bg-[var(--primary)]/10" }) => (
  <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm flex items-center gap-4">
    <div className={`w-10 h-10 rounded-md ${bgCls} flex items-center justify-center shrink-0`}>
      <Icon size={18} className={colorCls} />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</p>
      <p className={`text-lg font-black leading-tight mt-0.5 ${colorCls}`}>{value}</p>
      {sub && <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── componente principal ─────────────────────────────────────────────────────

const AlumnosCtaCte = () => {
  const location = useLocation();
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

  const {
    alumnos: alumnosFiltrados,
    cargandoAlumnos,
    emitirCuotaIndividual,
    refetchAlumnos,
    refetchMovimientos,
    paginas,
    paginaActual,
    total,
    setPagina,
    busqueda,
    setBusqueda,
    mesSeleccionado,
    setMesSeleccionado,
    codigoCtaCte,
    alumnosCompletos,
    movimientos: todosLosMovimientos,
    metricasCuenta,
    metricasLote,
    obtenerEstadisticas,
  } = useAlumnos(anioSeleccionado);

  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  const periodoSeleccionado = useMemo(
    () => `${anioSeleccionado}-${String(Number(mesSeleccionado) + 1).padStart(2, "0")}`,
    [mesSeleccionado, anioSeleccionado],
  );

  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [alumnoParaPagar, setAlumnoParaPagar] = useState(null);
  const [mostrarModalEmision, setMostrarModalEmision] = useState(false);
  const [alumnoParaEmitir, setAlumnoParaEmitir] = useState(null);

  // Drawer libro mayor
  const [alumnoSeleccionadoMayor, setAlumnoSeleccionadoMayor] = useState(null);
  const [movimientosMayor, setMovimientosMayor] = useState([]);
  const [cargandoMayor, setCargandoMayor] = useState(false);
  const [mesSeleccionadoMayor, setMesSeleccionadoMayor] = useState(new Date().getMonth());
  const [anioSeleccionadoMayor, setAnioSeleccionadoMayor] = useState(new Date().getFullYear());

  useEffect(() => {
    refetchAlumnos();
    refetchMovimientos();
  }, [location.pathname]);

  // ── métricas ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    if (metricasLote?.stats) return metricasLote.stats;
    if (typeof obtenerEstadisticas === "function") return obtenerEstadisticas();
    return { totalAlumnos: 0, activos: 0, totalDeuda: 0, alumnosConDeuda: 0, totalRecaudado: 0 };
  }, [alumnosCompletos, obtenerEstadisticas, metricasLote]);

  const totalAlumnos = metricasLote?.totalAlumnosCount ?? alumnosCompletos?.length ?? 0;
  const countInternos = metricasLote?.countInternos ?? alumnosCompletos?.filter((a) => a.atributos?.tipo_alumno === "INTERNO").length ?? 0;
  const countExternos = totalAlumnos - countInternos;
  const pctInternos = totalAlumnos > 0 ? Math.round((countInternos / totalAlumnos) * 100) : 0;
  const pctExternos = totalAlumnos > 0 ? 100 - pctInternos : 0;

  // Serie de meses para gráficos
  const ultimosMeses = useMemo(() => {
    if (metricasCuenta?.ultimosMeses) return metricasCuenta.ultimosMeses;
    const list = [];
    for (let mIdx = 0; mIdx <= mesSeleccionado; mIdx++) {
      const periodStr = `${anioSeleccionado}-${String(mIdx + 1).padStart(2, "0")}`;
      const pagos = (todosLosMovimientos || [])
        .filter((m) => {
          const dateObj = new Date(m.fecha || m.fechaEmision);
          if (isNaN(dateObj)) return false;
          const mPeriodo = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
          return (m.periodo || mPeriodo) === periodStr && m.monto < 0;
        })
        .reduce((sum, m) => sum + Math.abs(m.monto), 0);
      const deuda = (alumnosCompletos || []).reduce((sum, a) => {
        const c = a.cuotas?.[periodStr];
        return sum + (c && c.estado !== "pagado" ? c.monto : 0);
      }, 0);
      list.push({ mesNombre: MESES[mIdx], periodo: periodStr, pagos, deuda });
    }
    return list;
  }, [anioSeleccionado, mesSeleccionado, todosLosMovimientos, alumnosCompletos, metricasCuenta]);

  const maxPagos = useMemo(() => Math.max(...ultimosMeses.map((m) => m.pagos), 1), [ultimosMeses]);
  const maxBarVal = useMemo(() => Math.max(...ultimosMeses.map((m) => m.pagos + m.deuda), 1), [ultimosMeses]);

  const totalPagadoMes = useMemo(
    () => ultimosMeses.reduce((s, m) => s + (m.pagos || 0), 0),
    [ultimosMeses],
  );

  const points = useMemo(() => {
    const divisor = Math.max(1, ultimosMeses.length - 1);
    return ultimosMeses
      .map((m, idx) => {
        const x = (idx / divisor) * 160;
        const y = 45 - (m.pagos / maxPagos) * 35;
        return `${x},${y}`;
      })
      .join(" ");
  }, [ultimosMeses, maxPagos]);

  // ── libro mayor ──────────────────────────────────────────────────────────

  const handleAbrirLibroMayor = async (alumno) => {
    setAlumnoSeleccionadoMayor(alumno);
    setCargandoMayor(true);
    setMesSeleccionadoMayor(mesSeleccionado);
    setAnioSeleccionadoMayor(anioSeleccionado);
    try {
      const res = await ListarMovimientosApi(alumno.codigo, {
        limite: 500,
        codigoCuenta: codigoCtaCte,
      });
      setMovimientosMayor(res || []);
    } catch (e) {
      console.error("Error al cargar libro mayor:", e);
      setMovimientosMayor([]);
    } finally {
      setCargandoMayor(false);
    }
  };

  const handleCerrarLibroMayor = () => {
    setAlumnoSeleccionadoMayor(null);
    setMovimientosMayor([]);
  };

  const movimientosMayorFiltrados = useMemo(() => {
    return movimientosMayor.filter((mov) => {
      let m, y;
      if (mov.periodo?.includes("-")) {
        const [py, pm] = mov.periodo.split("-");
        y = Number(py); m = Number(pm) - 1;
      } else if (mov.fecha) {
        const d = new Date(mov.fecha);
        m = d.getMonth(); y = d.getFullYear();
      } else return true;
      return y === Number(anioSeleccionadoMayor) && m <= Number(mesSeleccionadoMayor);
    });
  }, [movimientosMayor, mesSeleccionadoMayor, anioSeleccionadoMayor]);

  // ── tabla alumnos ────────────────────────────────────────────────────────

  const alumnosProcesados = useMemo(() => {
    return (alumnosFiltrados || []).map((alumno) => {
      const saldoBase = Object.values(alumno.cuotas || {})
        .filter((c) => c.periodo <= periodoSeleccionado && c.estado !== "pagado")
        .reduce((sum, c) => sum + (Number(c.monto) || 0), 0);

      const tieneVencidos = Object.values(alumno.cuotas || {})
        .filter((c) => c.periodo <= periodoSeleccionado)
        .some((c) => c.estado === "vencido" && c.monto > 0);

      let estado = "AL_DIA", estadoLabel = "Al Día";
      let badgeStyle = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";

      if (tieneVencidos) {
        estado = "EN_MORA"; estadoLabel = "Vencido";
        badgeStyle = "bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse";
      } else if (saldoBase > 0) {
        estado = "CON_DEUDA"; estadoLabel = "Deuda Pendiente";
        badgeStyle = "bg-amber-500/10 text-amber-600 border-amber-500/20";
      }

      return { ...alumno, saldoBase, estado, estadoLabel, badgeStyle };
    });
  }, [alumnosFiltrados, periodoSeleccionado]);

  const alumnosFiltradosPorEstado = useMemo(() => {
    if (filtroEstado === "TODOS") return alumnosProcesados;
    if (filtroEstado === "CON_DEUDA") return alumnosProcesados.filter((a) => a.estado === "CON_DEUDA" || a.estado === "EN_MORA");
    return alumnosProcesados.filter((a) => a.estado === filtroEstado);
  }, [alumnosProcesados, filtroEstado]);

  const columnasAlumnos = [
    {
      key: "codigo",
      etiqueta: "ID",
      renderizar: (val) => <span className="text-[10px] font-black text-black/30">{val}</span>,
    },
    {
      key: "nombre",
      etiqueta: "Alumno",
      renderizar: (_, alumno) => (
        <span className="font-black text-slate-800 uppercase text-[12.5px]">
          {alumno.nombre} {alumno.apellido}
        </span>
      ),
    },
    {
      key: "curso",
      etiqueta: "Curso",
      renderizar: (_, alumno) => (
        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase">
          {alumno.atributos?.curso || "N/A"}
        </span>
      ),
    },
    {
      key: "saldoBase",
      etiqueta: "Saldo Contable",
      renderizar: (val) => (
        <div className="text-right font-bold text-slate-700">{formatARS(val)}</div>
      ),
    },
    {
      key: "estado",
      etiqueta: "Estado",
      renderizar: (_, alumno) => (
        <div className="text-center">
          <span className={`inline-block px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${alumno.badgeStyle}`}>
            {alumno.estadoLabel}
          </span>
        </div>
      ),
    },
  ];

  const accionesAlumnos = [
    {
      ...accionesReutilizables.registrarPago,
      label: "Registrar Cobro",
      onClick: (alumno) => { setAlumnoParaPagar(alumno); setMostrarModalPago(true); },
      mostrar: (alumno) => alumno.saldoBase > 0,
    },
    {
      ...accionesReutilizables.verCuentaCorriente,
      label: "Ver Cuenta Corriente",
      onClick: (alumno) => handleAbrirLibroMayor(alumno),
    },
    {
      ...accionesReutilizables.aumentarCuota,
      label: "Emitir Cuota Individual",
      onClick: (alumno) => { setAlumnoParaEmitir(alumno); setMostrarModalEmision(true); },
    },
  ];

  // ── selector de período (control compartido) ──────────────────────────────

  const PeriodoSelector = (
    <div className="flex items-center gap-2 bg-black/5 border border-black/5 rounded-xl px-3 py-1.5 justify-center">
      <span className="text-[10px] font-black text-black/40 uppercase tracking-wider whitespace-nowrap">Período:</span>
      <select
        value={mesSeleccionado}
        onChange={(e) => setMesSeleccionado(Number(e.target.value))}
        className="bg-transparent border-none text-[12px] font-bold text-black/80 outline-none cursor-pointer focus:ring-0 py-0 pr-8 pl-1"
      >
        {MESES.map((mes, idx) => <option key={idx} value={idx}>{mes}</option>)}
      </select>
      <select
        value={anioSeleccionado}
        onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
        className="bg-transparent border-none text-[12px] font-bold text-black/80 outline-none cursor-pointer focus:ring-0 py-0 pr-8 pl-1 border-l border-black/10"
      >
        {[-2, -1, 0, 1, 2].map((offset) => {
          const yr = new Date().getFullYear() + offset;
          return <option key={yr} value={yr}>{yr}</option>;
        })}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen text-black p-4 gap-6">
      <EncabezadoSeccion ruta="CUENTAS CORRIENTES" icono={<CuotasIcono size={18} />} />

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Alumnos"
          value={totalAlumnos}
          sub={`${countInternos} int. · ${countExternos} ext.`}
          Icon={Users}
        />
        <KpiCard
          label="Con Deuda"
          value={alumnosProcesados.filter((a) => a.saldoBase > 0).length}
          sub="alumnos con saldo"
          Icon={AlertCircle}
          colorCls="text-amber-600"
          bgCls="bg-amber-500/10"
        />
        <KpiCard
          label="Deuda Total"
          value={formatARS(alumnosProcesados.reduce((s, a) => s + (a.saldoBase || 0), 0))}
          Icon={DollarSign}
          colorCls="text-rose-600"
          bgCls="bg-rose-500/10"
        />
        <KpiCard
          label="Recaudado (período)"
          value={formatARS(totalPagadoMes)}
          Icon={TrendingUp}
          colorCls="text-emerald-600"
          bgCls="bg-emerald-500/10"
        />
      </div>

      {/* ── GRÁFICOS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Donut: Distribución */}
        <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm flex flex-col items-center gap-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-full">Distribución</span>
          <div className="flex items-center gap-6 w-full justify-center">
            <div
              className="w-24 h-24 rounded-full relative flex items-center justify-center shadow-inner shrink-0"
              style={{ background: `conic-gradient(var(--primary) 0% ${pctInternos}%, #f97316 ${pctInternos}% 100%)` }}
            >
              <div className="w-16 h-16 rounded-full bg-white flex flex-col items-center justify-center shadow-sm">
                <span className="text-base font-black text-gray-950">{totalAlumnos}</span>
                <span className="text-[9px] font-black text-gray-400 uppercase">Total</span>
              </div>
            </div>
            <div className="text-[11px] font-black space-y-2 text-gray-500 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[var(--primary)]" />
                <span>Internos ({pctInternos}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500" />
                <span>Externos ({pctExternos}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line chart: Recaudación */}
        <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Recaudación</span>
              <span className="text-xl font-black text-gray-900 block mt-1 tracking-tight">{formatARS(totalPagadoMes)}</span>
            </div>
            <div className="p-2 bg-[var(--primary)]/10 rounded-md text-[var(--primary)]">
              <TrendingUp size={16} />
            </div>
          </div>
          <svg viewBox="0 0 160 50" className="w-full h-12 text-[var(--primary)]">
            <path d={`M 0,50 L ${points} L 160,50 Z`} fill="currentColor" opacity="0.08" />
            <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
          </svg>
        </div>

        {/* Bar chart: Pagos vs Deuda */}
        <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm flex flex-col gap-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Pagos vs. Deuda</span>
          <div className="flex h-24 items-end justify-between gap-2 pt-2 border-b border-gray-200/50">
            {ultimosMeses.map((m, idx) => {
              const pctPagos = maxBarVal > 0 ? (m.pagos / maxBarVal) * 100 : 0;
              const pctDeuda = maxBarVal > 0 ? (m.deuda / maxBarVal) * 100 : 0;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                  <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col bg-gray-900 text-white text-[8px] font-bold p-1 rounded shadow-md z-10 whitespace-nowrap">
                    <span>Pag: {formatARS(m.pagos)}</span>
                    <span>Deu: {formatARS(m.deuda)}</span>
                  </div>
                  <div className="w-full flex flex-col justify-end h-20 rounded-t bg-gray-100 overflow-hidden shrink-0">
                    <div className="w-full bg-orange-500" style={{ height: `${pctDeuda}%` }} />
                    <div className="w-full bg-[var(--primary)]" style={{ height: `${pctPagos}%` }} />
                  </div>
                  <span className="text-[9px] font-black text-gray-400 mt-1 uppercase">{m.mesNombre.slice(0, 3)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 text-[9px] font-black text-gray-400 uppercase">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[var(--primary)] inline-block" />Pagado</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" />Deuda</span>
          </div>
        </div>
      </div>

      {/* ── TABLA DE ALUMNOS ── */}
      <DataTable
        id_tabla="tabla-alumnos-ctacte"
        columnas={columnasAlumnos}
        datos={alumnosFiltradosPorEstado}
        loading={cargandoAlumnos}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Buscar por alumno, documento, curso..."
        meta={{ total, currentPage: paginaActual, lastPage: paginas, prev: paginaActual > 1 ? paginaActual - 1 : null, next: paginaActual < paginas ? paginaActual + 1 : null }}
        onPageChange={(page) => setPagina(page)}
        mostrarAcciones={true}
        acciones={accionesAlumnos}
        elementosSuperior={
          <div className="flex flex-wrap items-center gap-3">
            {/* Tabs estado */}
            <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl overflow-x-auto">
              {[
                { id: "TODOS", label: "Todos" },
                { id: "AL_DIA", label: "Al Día" },
                { id: "CON_DEUDA", label: "Con Deuda" },
                { id: "EN_MORA", label: "Vencido" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFiltroEstado(tab.id)}
                  className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    filtroEstado === tab.id
                      ? "bg-white text-black shadow-sm"
                      : "text-black/50 hover:text-black hover:bg-white/30"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {PeriodoSelector}
          </div>
        }
        emptyMessage="No se encontraron cuentas corrientes con los filtros seleccionados"
        llaveTituloMobile="nombre"
      />

      {/* ── MODAL COBRO ── */}
      {mostrarModalPago && alumnoParaPagar && (
        <ModalPagoCuota
          alumno={alumnoParaPagar}
          onClose={() => { setMostrarModalPago(false); setAlumnoParaPagar(null); refetchAlumnos(); }}
        />
      )}

      {/* ── MODAL EMISIÓN INDIVIDUAL ── */}
      {mostrarModalEmision && alumnoParaEmitir && (
        <ModalEmisionIndividual
          alumno={alumnoParaEmitir}
          periodoActual={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`}
          emitirCuota={emitirCuotaIndividual}
          onClose={() => { setMostrarModalEmision(false); setAlumnoParaEmitir(null); refetchAlumnos(); }}
        />
      )}

      {/* ── DRAWER LIBRO MAYOR ── */}
      {alumnoSeleccionadoMayor &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm">
            <div className="bg-white border-l border-black/10 w-full max-w-3xl h-full shadow-2xl flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gradient-to-r from-[var(--primary)]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-slate-800 uppercase tracking-tight leading-none">
                      Cuenta Corriente
                    </h3>
                    <span className="text-[11px] font-bold text-black/40 uppercase tracking-widest mt-1 block">
                      {alumnoSeleccionadoMayor.nombre} {alumnoSeleccionadoMayor.apellido} (Leg. {alumnoSeleccionadoMayor.codigo})
                    </span>
                  </div>
                </div>
                <button onClick={handleCerrarLibroMayor} className="p-2 hover:bg-black/5 rounded-full text-black/20 hover:text-black/60 transition cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {cargandoMayor ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader size={30} className="text-[var(--primary)] animate-spin" />
                    <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Cargando...</span>
                  </div>
                ) : movimientosMayor.length === 0 ? (
                  <div className="p-10 text-center bg-black/5 rounded-2xl border border-dashed border-black/10">
                    <AlertCircle size={40} className="mx-auto text-black/20 mb-3" />
                    <p className="text-[11px] font-black text-black/40 uppercase tracking-widest">Sin registros en cuenta {codigoCtaCte}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Saldo + filtro */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-black/5 p-4 rounded-xl border border-black/5 gap-3">
                      <div>
                        <span className="text-[9px] font-black text-black/40 uppercase tracking-wider block">Saldo Contable</span>
                        <span className="text-xl font-black text-[var(--primary)] leading-none mt-1 block">
                          {formatARS(alumnoSeleccionadoMayor.saldoBase)}
                        </span>
                      </div>
                      <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-black/10 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer hover:bg-black/5 self-start sm:self-auto">
                        <Printer size={12} />
                        Imprimir Ficha
                      </button>
                    </div>

                    {/* Filtro período */}
                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-black/5">
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider whitespace-nowrap">Hasta:</span>
                      <select value={mesSeleccionadoMayor} onChange={(e) => setMesSeleccionadoMayor(Number(e.target.value))} className="bg-white border border-black/10 rounded-lg px-2 py-1 text-[11px] font-bold outline-none cursor-pointer">
                        {MESES.map((mes, idx) => <option key={idx} value={idx}>{mes}</option>)}
                      </select>
                      <select value={anioSeleccionadoMayor} onChange={(e) => setAnioSeleccionadoMayor(Number(e.target.value))} className="bg-white border border-black/10 rounded-lg px-2 py-1 text-[11px] font-bold outline-none cursor-pointer">
                        {[-2, -1, 0, 1, 2].map((offset) => { const yr = new Date().getFullYear() + offset; return <option key={yr} value={yr}>{yr}</option>; })}
                      </select>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-hidden border border-black/5 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black/[0.01] border-b border-black/5 text-[9px] font-black text-slate-700 uppercase tracking-wider">
                            <th className="p-3">Fecha</th>
                            <th className="p-3">Concepto</th>
                            <th className="p-3">Ref</th>
                            <th className="p-3 text-right">Debe</th>
                            <th className="p-3 text-right">Haber</th>
                            <th className="p-3 text-right">Saldo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 text-[11px] font-bold text-black/75">
                          {movimientosMayorFiltrados.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-black/30 font-black uppercase text-[10px] tracking-wider">
                                Sin movimientos en el rango seleccionado
                              </td>
                            </tr>
                          ) : (
                            movimientosMayorFiltrados.map((mov, idx) => (
                              <tr key={idx} className="hover:bg-black/[0.005]">
                                <td className="p-3 font-mono text-black/50">{new Date(mov.fecha).toLocaleDateString("es-AR")}</td>
                                <td className="p-3 max-w-[180px] truncate" title={mov.concepto}>{mov.concepto}</td>
                                <td className="p-3 font-mono text-slate-500 text-[10px]">{mov.referencia || "—"}</td>
                                <td className="p-3 text-right text-emerald-600 font-bold">{mov.monto > 0 ? formatARS(mov.monto) : "—"}</td>
                                <td className="p-3 text-right text-slate-500">{mov.monto < 0 ? formatARS(Math.abs(mov.monto)) : "—"}</td>
                                <td className="p-3 text-right font-black text-slate-900">{formatARS(mov.saldoResultante)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-black/5 bg-black/[0.02] flex items-center justify-between">
                <span className="text-[9px] font-black text-black/30 uppercase tracking-widest">General Ledger · EFA Engine</span>
                <button onClick={handleCerrarLibroMayor} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-slate-700 transition cursor-pointer">
                  Cerrar
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default AlumnosCtaCte;
