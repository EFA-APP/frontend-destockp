import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAlumnos } from "../../../../Backend/Contactos/hooks/useAlumnos";
import { useConfiguracionContactos } from "../../../../Backend/Contactos/hooks/useConfiguracionContactos";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { CuotasIcono, EmitirCuotasIcono } from "../../../../assets/Icons";
import {
  Save,
  Search,
  X,
  Users,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Zap,
} from "lucide-react";
import ModalPagoCuota from "./ModalPagoCuota";
import ModalEmisionIndividual from "./ModalEmisionIndividual";

// ─── constantes ──────────────────────────────────────────────────────────────

const MESES = [
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

const ESTADO_CONFIG = {
  pagado: {
    label: "Pagado",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  vencido: {
    label: "Vencido",
    cls: "bg-rose-50 text-rose-700 border-rose-200",
  },
  parcial: {
    label: "Parcial",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
  pendiente: {
    label: "Pendiente",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmtARS = (v) =>
  `$ ${Number(v || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

const parseNum = (v) => v.replace(/\./g, "").replace(/\D/g, "");

const fmtInput = (v) =>
  Number(v || 0)
    .toLocaleString("es-AR")
    .replace(/,/g, ".");

// ─── componentes menores ─────────────────────────────────────────────────────

const FieldLabel = ({ children }) => (
  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
    {children}
  </span>
);

const EstadoBadge = ({ estado }) => {
  const cfg = ESTADO_CONFIG[estado] || {
    label: estado || "—",
    cls: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
};

const TipoBadge = ({ tipo }) => (
  <span
    className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
      tipo === "INTERNO"
        ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20"
        : "bg-orange-50 text-orange-700 border-orange-200"
    }`}
  >
    {tipo || "EXTERNO"}
  </span>
);

const SkeletonFila = () => (
  <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0">
    <div className="w-5 h-5 rounded bg-gray-100 animate-pulse shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
    </div>
    <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
    <div className="w-16 h-5 bg-gray-100 rounded animate-pulse" />
    <div className="w-24 h-7 bg-gray-100 rounded animate-pulse" />
  </div>
);

// ─── componente principal ─────────────────────────────────────────────────────

const Cuotas = () => {
  const location = useLocation();
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    new Date().getFullYear(),
  );

  const {
    alumnos,
    cargandoAlumnos,
    emitirCuotasMensuales,
    busqueda,
    setBusqueda,
    mesSeleccionado,
    setMesSeleccionado,
    refetchAlumnos,
    refetchMovimientos,
    emitirCuotaIndividual,
    paginas,
    paginaActual,
    setPagina,
    alumnosCompletos,
    metricasLote,
  } = useAlumnos(anioSeleccionado);

  const { configs, actualizarConfiguracion } = useConfiguracionContactos();

  const periodoSeleccionado = `${anioSeleccionado}-${String(Number(mesSeleccionado) + 1).padStart(2, "0")}`;
  const periodoLabel = `${MESES[mesSeleccionado].toUpperCase()} ${anioSeleccionado}`;

  // ── modales ──
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [alumnoParaPagar, setAlumnoParaPagar] = useState(null);
  const [mostrarModalEmision, setMostrarModalEmision] = useState(false);
  const [alumnoParaEmitir, setAlumnoParaEmitir] = useState(null);

  // ── precios ──
  const [precios, setPrecios] = useState({ interno: 0, externo: 0 });
  const [cargandoGuardar, setCargandoGuardar] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);

  // ── emisión ──
  const [emitirCargando, setEmitirCargando] = useState(false);
  const [selectedAlumnos, setSelectedAlumnos] = useState([]);

  // Refrescar al navegar
  useEffect(() => {
    refetchMovimientos();
    refetchAlumnos();
  }, [location.pathname]);

  useEffect(() => {
    refetchAlumnos();
    refetchMovimientos();
    const onFocus = () => {
      refetchAlumnos();
      refetchMovimientos();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Cargar precios desde configuración
  useEffect(() => {
    const conf = configs.find((c) => c.claveCampo === "cuota");
    if (conf?.formula) {
      const match = conf.formula.match(/\?\s*(\d+)\s*:\s*(\d+)/);
      if (match)
        setPrecios({
          interno: parseInt(match[1]),
          externo: parseInt(match[2]),
        });
    }
  }, [configs]);

  // ── métricas de lote ──
  const totalAlumnos =
    metricasLote?.totalAlumnosCount ?? alumnosCompletos?.length ?? 0;
  const countInternos =
    metricasLote?.countInternos ??
    alumnosCompletos?.filter((a) => a.atributos?.tipo_alumno === "INTERNO")
      .length ??
    0;
  const countExternos = totalAlumnos - countInternos;
  const totalProyectado =
    metricasLote?.totalEmitirSuma ??
    countInternos * precios.interno + countExternos * precios.externo;

  // ── handlers ──
  const handleGuardarPrecios = async () => {
    const conf = configs.find((c) => c.claveCampo === "cuota");
    if (!conf) return;
    setCargandoGuardar(true);
    try {
      await actualizarConfiguracion({
        codigoSecuencial: conf.codigoSecuencial,
        data: {
          ...conf,
          formula: `{tipo_alumno} == "INTERNO" ? ${precios.interno} : ${precios.externo}`,
          codigoEmpresa: 2,
        },
      });
      setGuardadoOk(true);
      setTimeout(() => setGuardadoOk(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoGuardar(false);
    }
  };

  const handleEmitirMasivo = async () => {
    setEmitirCargando(true);
    try {
      await emitirCuotasMensuales(periodoSeleccionado);
      refetchAlumnos();
    } finally {
      setEmitirCargando(false);
    }
  };

  const handleSelectAll = useCallback(() => {
    const emitibles = alumnos.filter((a) => !a.cuotas?.[periodoSeleccionado]);
    if (selectedAlumnos.length === emitibles.length && emitibles.length > 0) {
      setSelectedAlumnos([]);
    } else {
      setSelectedAlumnos(emitibles.map((a) => a.id));
    }
  }, [alumnos, periodoSeleccionado, selectedAlumnos]);

  const handleSelectOne = (id) =>
    setSelectedAlumnos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleEmitirSeleccionados = async () => {
    if (!selectedAlumnos.length) return;
    setEmitirCargando(true);
    try {
      for (const id of selectedAlumnos) {
        const alum = alumnos.find((a) => a.id === id);
        if (!alum) continue;
        await emitirCuotaIndividual(
          alum.id,
          periodoSeleccionado,
          alum.montoCuotaActual,
          `CUOTA PERIODO ${periodoLabel}`,
          `${anioSeleccionado}-${String(Number(mesSeleccionado) + 1).padStart(2, "0")}-10`,
        );
      }
      setSelectedAlumnos([]);
      refetchAlumnos();
    } catch (err) {
      console.error(err);
    } finally {
      setEmitirCargando(false);
    }
  };

  // Alumnos emitibles para el período seleccionado
  const alumnosEmitibles = alumnos.filter(
    (a) => !a.cuotas?.[periodoSeleccionado],
  );
  const allEmitiblesSelected =
    alumnosEmitibles.length > 0 &&
    selectedAlumnos.length === alumnosEmitibles.length;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] w-full p-3 md:p-6 font-sans gap-5">
      {/* ── HEADER ── */}
      <EncabezadoSeccion
        ruta="GESTIÓN DE CUOTAS"
        icono={<CuotasIcono size={18} />}
      >
        <div className="flex items-center gap-2">
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(Number(e.target.value))}
            className="h-10 bg-white border border-gray-200 rounded-md px-3 text-xs font-black uppercase tracking-wider text-gray-700 focus:outline-none focus:border-[var(--primary)] transition cursor-pointer"
          >
            {MESES.map((m, idx) => (
              <option key={idx} value={idx}>
                {m.toUpperCase()}
              </option>
            ))}
          </select>
          <select
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
            className="h-10 bg-white border border-gray-200 rounded-md px-3 text-xs font-black uppercase tracking-wider text-gray-700 focus:outline-none focus:border-[var(--primary)] transition cursor-pointer"
          >
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - 2 + i,
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </EncabezadoSeccion>

      {/* ── PANEL SUPERIOR: CONFIG + LOTE ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Configuración de precios */}
        <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
          <FieldLabel>Valor de Cuotas</FieldLabel>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Interno
              </label>
              <input
                type="text"
                value={fmtInput(precios.interno)}
                onChange={(e) =>
                  setPrecios({ ...precios, interno: parseNum(e.target.value) })
                }
                className="w-full h-9 bg-gray-50 border border-gray-200 rounded-md px-3 text-xs font-black text-[var(--primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Externo
              </label>
              <input
                type="text"
                value={fmtInput(precios.externo)}
                onChange={(e) =>
                  setPrecios({ ...precios, externo: parseNum(e.target.value) })
                }
                className="w-full h-9 bg-gray-50 border border-gray-200 rounded-md px-3 text-xs font-black text-orange-600 focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>
          <button
            onClick={handleGuardarPrecios}
            disabled={cargandoGuardar}
            className="mt-3 w-full h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {cargandoGuardar ? (
              <div className="w-3.5 h-3.5 border-2 border-gray-400/30 border-t-gray-700 rounded-full animate-spin" />
            ) : guardadoOk ? (
              <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                <CheckCircle2 size={12} /> Guardado
              </span>
            ) : (
              <>
                <Save size={12} />
                <span>Guardar Precios</span>
              </>
            )}
          </button>
        </div>

        {/* Resumen de lote */}
        <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
          <FieldLabel>Resumen del Lote — {periodoLabel}</FieldLabel>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-600 border-b border-gray-100 pb-2">
              <span className="text-[var(--primary)]">
                Internos ({countInternos})
              </span>
              <span>{fmtARS(countInternos * precios.interno)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-600 border-b border-gray-100 pb-2">
              <span className="text-orange-600">
                Externos ({countExternos})
              </span>
              <span>{fmtARS(countExternos * precios.externo)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 pt-1">
              <span>Total Proyectado</span>
              <span className="text-[var(--primary)]">
                {fmtARS(totalProyectado)}
              </span>
            </div>
          </div>
        </div>

        {/* Emisión masiva */}
        <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm flex flex-col justify-between gap-3">
          <FieldLabel>Emisión Masiva</FieldLabel>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gray-900/5 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-gray-700" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-gray-900 uppercase leading-snug">
                Emitir todas las cuotas
              </p>
              <p className="text-[10px] font-semibold text-gray-400 mt-0.5 uppercase">
                {totalAlumnos} alumnos · {periodoLabel}
              </p>
            </div>
          </div>
          <button
            onClick={handleEmitirMasivo}
            disabled={emitirCargando}
            className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-md flex items-center justify-center gap-2 transition active:scale-95 font-black text-[11px] uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed"
          >
            {emitirCargando ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <EmitirCuotasIcono size={16} />
            )}
            <span>Confirmar y Emitir Todo</span>
          </button>
        </div>
      </div>

      {/* ── TABLA DE ALUMNOS ── */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-gray-50/60">
          <div className="flex items-center gap-2 shrink-0">
            <Users size={14} className="text-[var(--primary)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Listado de Alumnos
            </span>
          </div>

          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar alumno..."
              className="w-full h-9 bg-white border border-gray-200 rounded-md pl-7 pr-7 text-xs font-bold text-gray-700 focus:outline-none focus:border-[var(--primary)] placeholder:font-normal"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Paginación */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              disabled={paginaActual <= 1}
              onClick={() => setPagina(paginaActual - 1)}
              className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider px-2">
              {paginaActual} / {paginas || 1}
            </span>
            <button
              disabled={paginaActual >= paginas}
              onClick={() => setPagina(paginaActual + 1)}
              className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Emitir seleccionados */}
          <button
            onClick={handleEmitirSeleccionados}
            disabled={selectedAlumnos.length === 0 || emitirCargando}
            className="h-9 px-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white disabled:bg-gray-200 disabled:text-gray-400 rounded-md text-[10px] font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {emitirCargando ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <EmitirCuotasIcono size={13} />
            )}
            Emitir ({selectedAlumnos.length})
          </button>
        </div>

        {/* Cabecera de columnas */}
        <div className="hidden md:grid grid-cols-[40px_1fr_120px_100px_120px_140px] gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
          <div>
            <input
              type="checkbox"
              checked={allEmitiblesSelected}
              onChange={handleSelectAll}
              disabled={alumnosEmitibles.length === 0}
              className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer disabled:opacity-40"
            />
          </div>
          {["Alumno", "Tipo", "Cuota Base", "Estado", "Acción"].map((h) => (
            <div
              key={h}
              className="text-[9px] font-black uppercase tracking-widest text-gray-400"
            >
              {h}
            </div>
          ))}
        </div>

        {/* Filas */}
        <div>
          {cargandoAlumnos ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonFila key={i} />)
          ) : alumnos.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Users size={22} className="text-gray-300" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                {busqueda ? "Sin resultados" : "Sin alumnos"}
              </p>
            </div>
          ) : (
            alumnos.map((alumno) => {
              const cuota = alumno.cuotas?.[periodoSeleccionado];
              const yaEmitida = !!cuota;
              const isChecked = selectedAlumnos.includes(alumno.id);
              const tipo = alumno.atributos?.tipo_alumno || "EXTERNO";
              const montoEmitido = yaEmitida
                ? (cuota.montoOriginal ?? cuota.monto)
                : null;
              const monto = yaEmitida ? montoEmitido : alumno.montoCuotaActual;
              const estado = cuota?.estado;
              const campioTipo =
                yaEmitida &&
                montoEmitido != null &&
                alumno.montoCuotaActual != null &&
                Math.abs(montoEmitido - alumno.montoCuotaActual) > 0.01;

              return (
                <div
                  key={alumno.id}
                  className="grid md:grid-cols-[40px_1fr_120px_100px_120px_140px] gap-3 items-center px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/40 transition"
                >
                  {/* Checkbox */}
                  <div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleSelectOne(alumno.id)}
                      disabled={yaEmitida}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Nombre */}
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-gray-900 uppercase truncate">
                      {alumno.nombre} {alumno.apellido}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 truncate">
                      {alumno.atributos?.curso || "S/D"}
                    </p>
                  </div>

                  {/* Tipo alumno */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <TipoBadge tipo={tipo} />
                    {campioTipo && (
                      <span
                        title={`Cuota emitida: ${fmtARS(montoEmitido)} · Monto actual: ${fmtARS(alumno.montoCuotaActual)}`}
                      >
                        <AlertTriangle size={12} className="text-amber-500" />
                      </span>
                    )}
                  </div>

                  {/* Monto cuota */}
                  <div className="tabular-nums">
                    <span
                      className={`text-sm font-black ${campioTipo ? "text-amber-600" : "text-gray-900"}`}
                    >
                      {fmtARS(monto)}
                    </span>
                    {campioTipo && (
                      <p className="text-[9px] font-bold text-gray-400 mt-0.5">
                        Actual: {fmtARS(alumno.montoCuotaActual)}
                      </p>
                    )}
                  </div>

                  {/* Estado */}
                  <div>
                    {yaEmitida ? (
                      <EstadoBadge estado={estado || "pendiente"} />
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                        Sin Emitir
                      </span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5 justify-end md:justify-start">
                    {!yaEmitida ? (
                      <button
                        onClick={() => {
                          setAlumnoParaEmitir(alumno);
                          setMostrarModalEmision(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-[var(--primary)] hover:text-white text-gray-700 rounded-md text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                      >
                        <EmitirCuotasIcono size={11} />
                        Emitir
                      </button>
                    ) : estado !== "pagado" ? (
                      <button
                        onClick={() => {
                          setAlumnoParaPagar(alumno);
                          setMostrarModalPago(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white text-[var(--primary)] rounded-md text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                      >
                        <Receipt size={11} />
                        Facturar
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                        <CheckCircle2 size={11} />
                        Abonado
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── MODALES ── */}
      {mostrarModalPago && alumnoParaPagar && (
        <ModalPagoCuota
          alumno={alumnoParaPagar}
          onClose={() => {
            setMostrarModalPago(false);
            setAlumnoParaPagar(null);
          }}
        />
      )}

      {mostrarModalEmision && alumnoParaEmitir && (
        <ModalEmisionIndividual
          alumno={alumnoParaEmitir}
          periodoActual={periodoSeleccionado}
          emitirCuota={emitirCuotaIndividual}
          onClose={() => {
            setMostrarModalEmision(false);
            setAlumnoParaEmitir(null);
            refetchAlumnos();
          }}
        />
      )}
    </div>
  );
};

export default Cuotas;
