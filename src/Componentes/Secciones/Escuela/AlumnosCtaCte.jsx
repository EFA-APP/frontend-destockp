import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useAlumnos } from "../../../Backend/Contactos/hooks/useAlumnos";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
  AumentarCuotaIcono,
  ComprobanteIcono,
  CuotasIcono,
  DineroIcono,
  EmitirCuotasIcono,
  OjosIcono,
} from "../../../assets/Icons";
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  Search,
  BookOpen,
  X,
  CreditCard,
  ChevronRight,
  TrendingUp,
  Loader,
  ArrowRight,
  Printer,
} from "lucide-react";
import ModalPagoCuota from "./Cuotas/ModalPagoCuota";
import ModalEmisionIndividual from "./Cuotas/ModalEmisionIndividual";
import { ListarMovimientosApi } from "../../../Backend/Contactos/api/contactos.api";

const AlumnosCtaCte = () => {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const location = useLocation();
  const {
    alumnos: alumnosFiltrados,
    alumnosCompletos,
    cargandoAlumnos,
    obtenerEstadisticas,
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
  } = useAlumnos();

  // Filtros rápidos locales
  const [filtroEstado, setFiltroEstado] = useState("TODOS"); // TODOS, AL_DIA, CON_DEUDA, EN_MORA
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    new Date().getFullYear(),
  );

  const periodoSeleccionado = useMemo(() => {
    return `${anioSeleccionado}-${String(Number(mesSeleccionado) + 1).padStart(2, "0")}`;
  }, [mesSeleccionado, anioSeleccionado]);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [alumnoParaPagar, setAlumnoParaPagar] = useState(null);
  const [mostrarModalEmision, setMostrarModalEmision] = useState(false);
  const [alumnoParaEmitir, setAlumnoParaEmitir] = useState(null);

  // Estados para el Drawer del Libro Mayor del Alumno
  const [alumnoSeleccionadoMayor, setAlumnoSeleccionadoMayor] = useState(null);
  const [movimientosMayor, setMovimientosMayor] = useState([]);
  const [cargandoMayor, setCargandoMayor] = useState(false);

  // Filtros de fecha para el Libro Mayor
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Recargar datos cuando cambia de vista
  useEffect(() => {
    refetchAlumnos();
    refetchMovimientos();
  }, [location.pathname]);

  // Cargar Libro Mayor contable del alumno para el Drawer
  const handleAbrirLibroMayor = async (alumno) => {
    setAlumnoSeleccionadoMayor(alumno);
    setCargandoMayor(true);
    setFechaDesde("");
    setFechaHasta("");
    try {
      const res = await ListarMovimientosApi(alumno.codigoSecuencial, {
        limite: 500,
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
    setFechaDesde("");
    setFechaHasta("");
  };

  // Filtrar los movimientos del Libro Mayor en tiempo real
  const movimientosMayorFiltrados = useMemo(() => {
    if (!fechaDesde && !fechaHasta) return movimientosMayor;
    return movimientosMayor.filter((mov) => {
      if (!mov.fecha) return true;
      const fMov = new Date(mov.fecha);
      const fMovInicio = new Date(
        fMov.getFullYear(),
        fMov.getMonth(),
        fMov.getDate(),
      );

      if (fechaDesde) {
        const fDesde = new Date(fechaDesde);
        const fDesdeInicio = new Date(
          fDesde.getFullYear(),
          fDesde.getMonth(),
          fDesde.getDate(),
        );
        if (fMovInicio < fDesdeInicio) return false;
      }
      if (fechaHasta) {
        const fHasta = new Date(fechaHasta);
        const fHastaInicio = new Date(
          fHasta.getFullYear(),
          fHasta.getMonth(),
          fHasta.getDate(),
        );
        if (fMovInicio > fHastaInicio) return false;
      }
      return true;
    });
  }, [movimientosMayor, fechaDesde, fechaHasta]);

  const handlePagarCuota = (alumno) => {
    setAlumnoParaPagar(alumno);
    setMostrarModalPago(true);
  };

  const handleAbrirEmisionIndividual = (alumno) => {
    setAlumnoParaEmitir(alumno);
    setMostrarModalEmision(true);
  };

  // 🧮 Mapeo y filtrado del listado con intereses y saldos contables dinámicos
  const alumnosProcesados = useMemo(() => {
    return (alumnosFiltrados || []).map((alumno) => {
      // Saldo base dinámico: suma de cuotas impagas hasta el periodo seleccionado
      const saldoBase = Object.values(alumno.cuotas || {})
        .filter(
          (c) => c.periodo <= periodoSeleccionado && c.estado !== "pagado",
        )
        .reduce((sum, c) => sum + (Number(c.monto) || 0), 0);

      // Suma total de intereses acumulados de todas las cuotas hasta el periodo seleccionado
      const totalIntereses = Object.values(alumno.cuotas || {})
        .filter(
          (c) => c.periodo <= periodoSeleccionado && c.estado !== "pagado",
        )
        .reduce((sum, c) => sum + (Number(c.interes) || 0), 0);

      // Deuda consolidada = Saldo base contable + Intereses dinámicos
      const deudaConsolidada = saldoBase + totalIntereses;

      // Determinar estado semántico
      let estado = "AL_DIA"; // Verde
      let estadoLabel = "Al Día";
      let badgeStyle =
        "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";

      const tieneVencidos = Object.values(alumno.cuotas || {})
        .filter((c) => c.periodo <= periodoSeleccionado)
        .some((c) => c.estado === "vencido" && c.monto > 0);

      if (tieneVencidos) {
        estado = "EN_MORA"; // Rojo
        estadoLabel = "En Mora / Vencido";
        badgeStyle =
          "bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse";
      } else if (saldoBase > 0) {
        estado = "CON_DEUDA"; // Amarillo
        estadoLabel = "Deuda Pendiente";
        badgeStyle = "bg-amber-500/10 text-amber-600 border-amber-500/20";
      }

      return {
        ...alumno,
        saldoBase,
        totalIntereses,
        deudaConsolidada,
        estado,
        estadoLabel,
        badgeStyle,
      };
    });
  }, [alumnosFiltrados, periodoSeleccionado]);

  // Aplicar filtro de estado
  const alumnosFiltradosPorEstado = useMemo(() => {
    if (filtroEstado === "TODOS") return alumnosProcesados;
    if (filtroEstado === "CON_DEUDA") {
      return alumnosProcesados.filter(
        (a) => a.estado === "CON_DEUDA" || a.estado === "EN_MORA",
      );
    }
    return alumnosProcesados.filter((a) => a.estado === filtroEstado);
  }, [alumnosProcesados, filtroEstado]);

  // Métricas generales contables consolidadas
  const metricas = useMemo(() => {
    let totalSaldoBase = 0;
    let totalMora = 0;
    let alumnosMoraCount = 0;
    let alumnosDeudaCount = 0;

    alumnosCompletos.forEach((a) => {
      const saldo = Object.values(a.cuotas || {})
        .filter(
          (c) => c.periodo <= periodoSeleccionado && c.estado !== "pagado",
        )
        .reduce((sum, c) => sum + (Number(c.monto) || 0), 0);

      const mora = Object.values(a.cuotas || {})
        .filter(
          (c) => c.periodo <= periodoSeleccionado && c.estado !== "pagado",
        )
        .reduce((sum, c) => sum + (Number(c.interes) || 0), 0);

      totalSaldoBase += saldo;
      totalMora += mora;

      const tieneVencidos = Object.values(a.cuotas || {})
        .filter((c) => c.periodo <= periodoSeleccionado)
        .some((c) => c.estado === "vencido" && c.monto > 0);

      if (saldo > 0 || tieneVencidos) {
        alumnosDeudaCount++;
      }
      if (tieneVencidos) {
        alumnosMoraCount++;
      }
    });

    return {
      totalSaldoBase,
      totalMora,
      deudaTotalConsolidada: totalSaldoBase + totalMora,
      alumnosMoraCount,
      alumnosDeudaCount,
      totalAlumnos: alumnosCompletos.length,
    };
  }, [alumnosCompletos, periodoSeleccionado]);

  const formatARS = (val) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);
  };

  return (
    <div className="flex flex-col min-h-screen text-black p-4">
      <EncabezadoSeccion
        ruta="CUENTAS CORRIENTES"
        icono={<CuotasIcono size={18} />}
      />

      {/* METRICAS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Alumnos */}
        <div className="p-5 bg-white border border-[var(--border-subtle)] rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-none">
              Mostrando
            </span>
            <span className="text-[26px] font-black text-black mt-2 leading-none">
              {metricas.totalAlumnos}
            </span>
            <span className="text-[10px] text-black/30 font-bold mt-2 lowercase">
              alumnos del sistema
            </span>
          </div>
        </div>

        {/* Saldo Base Contable */}
        <div className="p-5 bg-white border border-[var(--border-subtle)] rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-none">
              Saldo Contable (1106)
            </span>
            <span className="text-[26px] font-black text-[var(--primary)] mt-2 leading-none">
              {formatARS(metricas.totalSaldoBase)}
            </span>
          </div>
        </div>

        {/* Intereses por Mora Acumulados */}
        <div className="p-5 bg-white border border-[var(--border-subtle)] rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-none">
              Mora Diaria Acumulada
            </span>
            <span className="text-[26px] font-black text-rose-600 mt-2 leading-none animate-pulse">
              {formatARS(metricas.totalMora)}
            </span>
            <span className="text-[10px] text-rose-500 font-black mt-2 uppercase tracking-wide">
              {metricas.alumnosMoraCount} alumnos en mora
            </span>
          </div>
        </div>

        {/* Deuda Total Consolidada */}
        <div className="p-5 bg-white border border-[var(--border-subtle)] rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-none">
              Deuda Total Consolidada
            </span>
            <span className="text-[26px] font-black text-slate-800 mt-2 leading-none">
              {formatARS(metricas.deudaTotalConsolidada)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold mt-2 lowercase">
              deuda base + mora calculada
            </span>
          </div>
        </div>
      </div>

      {/* FILTROS Y BUSQUEDA */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 bg-white border border-[var(--border-subtle)] rounded-2xl shadow-sm mb-6">
        {/* Pestañas de Filtro de Estado */}
        <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl overflow-x-auto self-start lg:self-auto">
          {[
            { id: "TODOS", label: "Todos" },
            { id: "AL_DIA", label: "Al Día" },
            { id: "CON_DEUDA", label: "Con Deuda" },
            { id: "EN_MORA", label: "En Mora" },
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

        {/* Filtros de Período y Búsqueda */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Select de Período */}
          <div className="flex items-center gap-2 bg-black/5 border border-black/5 rounded-xl px-3 py-1.5 w-full sm:w-auto justify-center">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-wider whitespace-nowrap">
              Período:
            </span>
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(Number(e.target.value))}
              className="bg-transparent border-none text-[12px] font-bold text-black/80 outline-none cursor-pointer focus:ring-0 py-0 pr-8 pl-1"
            >
              {meses.map((mes, idx) => (
                <option key={idx} value={idx}>
                  {mes}
                </option>
              ))}
            </select>
            <select
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
              className="bg-transparent border-none text-[12px] font-bold text-black/80 outline-none cursor-pointer focus:ring-0 py-0 pr-8 pl-1 border-l border-black/10"
            >
              {[-2, -1, 0, 1, 2].map((offset) => {
                const yr = new Date().getFullYear() + offset;
                return (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Input de Búsqueda */}
          <div className="flex items-center gap-2 bg-black/5 border border-black/5 rounded-xl px-4 py-2.5 focus-within:border-[var(--primary)]/30 focus-within:bg-white transition-all w-full lg:max-w-md">
            <Search size={16} className="text-black/40" />
            <input
              type="text"
              placeholder="Buscar por alumno, documento, curso..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-transparent border-none text-[12px] font-bold text-black/80 w-full outline-none focus:ring-0"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="text-black/30 hover:text-black/60 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GRILLA PRINCIPAL */}
      <div className="flex-1 bg-white border border-[var(--border-subtle)] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-x-auto">
          {cargandoAlumnos ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader
                size={36}
                className="text-[var(--primary)] animate-spin"
              />
              <span className="text-[11px] font-black text-black/40 uppercase tracking-widest">
                Cargando Cuentas Corrientes...
              </span>
            </div>
          ) : alumnosFiltradosPorEstado.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <AlertCircle size={48} className="text-black/20 mb-4" />
              <h3 className="text-sm font-black text-black/70 uppercase tracking-widest">
                No se encontraron cuentas corrientes
              </h3>
              <p className="text-[11px] font-bold text-black/40 uppercase tracking-wider mt-1">
                Probá modificando los filtros de búsqueda o el estado
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/[0.02] border-b border-black/5 text-[9px] font-black text-black/40 uppercase tracking-[0.15em] select-none">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-4">Alumno</th>
                  <th className="py-4 px-4">Curso</th>
                  <th className="py-4 px-4 text-right">
                    Saldo Contable (Base)
                  </th>
                  <th className="py-4 px-4 text-right">Mora Acumulada</th>
                  <th className="py-4 px-4 text-right">Deuda Consolidada</th>
                  <th className="py-4 px-4 text-center">Estado</th>
                  <th className="py-4 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {alumnosFiltradosPorEstado.map((a) => (
                  <tr
                    key={a.codigoSecuencial}
                    className="hover:bg-black/[0.01] transition-colors group text-[12px] font-bold text-black/80"
                  >
                    <td className="py-3.5 px-6 text-[10px] font-black text-black/30">
                      {a.codigoSecuencial}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-800 uppercase">
                      {a.nombre} {a.apellido}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase">
                        {a.atributos?.curso || "N/A"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                      {formatARS(a.saldoBase)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                      {a.totalIntereses > 0 ? formatARS(a.totalIntereses) : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[13px] text-slate-900">
                      {formatARS(a.deudaConsolidada)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${a.badgeStyle}`}
                      >
                        {a.estadoLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* BOTÓN COBRAR */}
                        {a.deudaConsolidada > 0 && (
                          <button
                            onClick={() => handlePagarCuota(a)}
                            className="p-2 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] hover:border hover:border-[var(--primary)]/40 rounded-lg transition-all cursor-pointer"
                            title="Registrar Cobro"
                          >
                            <DineroIcono size={15} />
                          </button>
                        )}

                        {/* BOTÓN VER LIBRO MAYOR */}
                        <button
                          onClick={() => handleAbrirLibroMayor(a)}
                          className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-all cursor-pointer"
                          title="Ver Cuenta Corriente Contable"
                        >
                          <OjosIcono size={15} />
                        </button>

                        {/* BOTÓN EMITIR INDIVIDUAL */}
                        <button
                          onClick={() => handleAbrirEmisionIndividual(a)}
                          className="p-2 bg-green-100 text-green-600 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] rounded-lg transition-all cursor-pointer font-bold text-[14px]"
                          title="Emitir Cuota individual"
                        >
                          <AumentarCuotaIcono size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINACIÓN */}
        {paginas > 1 && !busqueda && (
          <div className="p-4 border-t border-black/5 bg-black/[0.01] flex items-center justify-between">
            <span className="text-[11px] font-bold text-black/40 uppercase tracking-wider">
              Página {paginaActual} de {paginas} ({total} alumnos en total)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPagina(paginaActual - 1)}
                className="px-3 py-1.5 bg-white border border-black/10 text-[11px] font-black uppercase rounded-lg hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Anterior
              </button>
              <button
                disabled={paginaActual === paginas}
                onClick={() => setPagina(paginaActual + 1)}
                className="px-3 py-1.5 bg-white border border-black/10 text-[11px] font-black uppercase rounded-lg hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL COBRO DE CUOTA */}
      {mostrarModalPago && alumnoParaPagar && (
        <ModalPagoCuota
          alumno={alumnoParaPagar}
          onClose={() => {
            setMostrarModalPago(false);
            setAlumnoParaPagar(null);
            refetchAlumnos();
          }}
        />
      )}

      {/* MODAL EMISIÓN INDIVIDUAL */}
      {mostrarModalEmision && alumnoParaEmitir && (
        <ModalEmisionIndividual
          alumno={alumnoParaEmitir}
          periodoActual={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`}
          emitirCuota={emitirCuotaIndividual}
          onClose={() => {
            setMostrarModalEmision(false);
            setAlumnoParaEmitir(null);
            refetchAlumnos();
          }}
        />
      )}

      {/* DRAWER / DETALLE LIBRO MAYOR CONTABLE DEL ALUMNO */}
      {alumnoSeleccionadoMayor &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white border-l border-black/10 w-full max-w-3xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              {/* Header Drawer */}
              <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gradient-to-r from-[var(--primary)]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
                    <BookOpen size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[16px] font-black text-slate-800 uppercase tracking-tight leading-none">
                      Cuenta Corriente Contable
                    </h3>
                    <span className="text-[11px] font-bold text-black/40 uppercase tracking-widest mt-1">
                      {alumnoSeleccionadoMayor.nombre}{" "}
                      {alumnoSeleccionadoMayor.apellido} (Legajo:{" "}
                      {alumnoSeleccionadoMayor.codigoSecuencial})
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCerrarLibroMayor}
                  className="p-2 hover:bg-black/5 rounded-full text-black/20 hover:text-black/60 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Listado de Asientos / Libro Mayor */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {cargandoMayor ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader
                      size={30}
                      className="text-[var(--primary)] animate-spin"
                    />
                    <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                      Cargando Libro Mayor General...
                    </span>
                  </div>
                ) : movimientosMayor.length === 0 ? (
                  <div className="p-10 text-center bg-black/5 rounded-2xl border border-dashed border-black/10">
                    <AlertCircle
                      size={40}
                      className="mx-auto text-black/20 mb-3"
                    />
                    <p className="text-[11px] font-black text-black/40 uppercase tracking-widest">
                      Sin registros contables en cuenta 1106
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-black/5 p-4 rounded-xl border border-black/5 gap-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-black/40 uppercase tracking-wider">
                          Saldo Contable Real
                        </span>
                        <span className="text-[20px] font-black text-[var(--primary)] leading-none mt-1">
                          {formatARS(alumnoSeleccionadoMayor.saldoBase)}
                        </span>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-black/5 border border-black/10 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        <Printer size={12} />
                        <span>Imprimir Ficha</span>
                      </button>
                    </div>

                    {/* Filtro de Fechas Premium */}
                    <div className="flex flex-col sm:flex-row items-end gap-3 bg-slate-50 p-4 rounded-xl border border-black/5">
                      <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <label className="text-[9px] font-black text-black/40 uppercase tracking-wider">
                          Fecha Desde
                        </label>
                        <input
                          type="date"
                          value={fechaDesde}
                          onChange={(e) => setFechaDesde(e.target.value)}
                          className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-[12px] font-bold outline-none focus:border-[var(--primary)]/40 transition-colors"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <label className="text-[9px] font-black text-black/40 uppercase tracking-wider">
                          Fecha Hasta
                        </label>
                        <input
                          type="date"
                          value={fechaHasta}
                          onChange={(e) => setFechaHasta(e.target.value)}
                          className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-[12px] font-bold outline-none focus:border-[var(--primary)]/40 transition-colors"
                        />
                      </div>
                      {(fechaDesde || fechaHasta) && (
                        <button
                          onClick={() => {
                            setFechaDesde("");
                            setFechaHasta("");
                          }}
                          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer w-full sm:w-auto h-[38px] flex items-center justify-center"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>

                    <div className="overflow-hidden border border-black/5 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black/[0.01] border-b border-black/5 text-[9px] font-black text-black/40 uppercase tracking-wider select-none">
                            <th className="p-3">Fecha</th>
                            <th className="p-3">Concepto</th>
                            <th className="p-3">Ref / Asiento</th>
                            <th className="p-3 text-right">Debe</th>
                            <th className="p-3 text-right">Haber</th>
                            <th className="p-3 text-right">Saldo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 text-[11px] font-bold text-black/75">
                          {movimientosMayorFiltrados.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="p-8 text-center text-black/30 font-black uppercase text-[10px] tracking-wider"
                              >
                                No hay movimientos registrados en el rango de
                                fechas seleccionado
                              </td>
                            </tr>
                          ) : (
                            movimientosMayorFiltrados.map((mov, idx) => (
                              <tr key={idx} className="hover:bg-black/[0.005]">
                                <td className="p-3 font-mono text-black/50">
                                  {new Date(mov.fecha).toLocaleDateString(
                                    "es-AR",
                                  )}
                                </td>
                                <td
                                  className="p-3 max-w-[200px] truncate"
                                  title={mov.concepto}
                                >
                                  {mov.concepto}
                                </td>
                                <td className="p-3 font-mono text-slate-500 text-[10px] select-all">
                                  {mov.referencia || `-`}
                                </td>
                                <td className="p-3 text-right text-emerald-600 font-bold">
                                  {mov.monto > 0 ? formatARS(mov.monto) : "-"}
                                </td>
                                <td className="p-3 text-right text-slate-500">
                                  {mov.monto < 0
                                    ? formatARS(Math.abs(mov.monto))
                                    : "-"}
                                </td>
                                <td className="p-3 text-right font-black text-slate-900">
                                  {formatARS(mov.saldoResultante)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Drawer */}
              <div className="p-6 border-t border-black/5 bg-black/[0.02] flex items-center justify-between">
                <span className="text-[9px] font-black text-black/30 uppercase tracking-widest">
                  General Ledger audit track (EFA Engine)
                </span>
                <button
                  onClick={handleCerrarLibroMayor}
                  className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cerrar Ficha
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
