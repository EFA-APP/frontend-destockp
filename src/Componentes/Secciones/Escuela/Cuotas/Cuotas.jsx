import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAlumnos } from "../../../../Backend/Contactos/hooks/useAlumnos";
import { useConfiguracionContactos } from "../../../../Backend/Contactos/hooks/useConfiguracionContactos";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
  AumentarCuotaIcono,
  CuotasIcono,
  EmitirCuotasIcono,
  GuardarIcono,
} from "../../../../assets/Icons";
import {
  AlertCircle,
  CheckCircle,
  Save,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import TablaCuotas from "../../../Tablas/Escuela/Cuotas/TablaCuotas";
import ModalPagoCuota from "./ModalPagoCuota";
import ModalEmisionIndividual from "./ModalEmisionIndividual";

const Cuotas = () => {
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
  const {
    alumnos,
    cargandoAlumnos,
    emitirCuotasMensuales,
    cargarInteresesMensuales,
    busqueda,
    setBusqueda,
    mesSeleccionado,
    setMesSeleccionado,
    movimientos: todosLosMovimientos,
    refetchAlumnos,
    refetchMovimientos,
    emitirCuotaIndividual,
    paginas,
    paginaActual,
    total,
    setPagina,
  } = useAlumnos();

  const { configs, actualizarConfiguracion } = useConfiguracionContactos();
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    new Date().getFullYear(),
  );
  
  // Aseguramos que mesSeleccionado sea tratado como número para evitar concatenaciones (ej: "2" + 1 = "21")
  const periodoSeleccionado = `${anioSeleccionado}-${String(Number(mesSeleccionado) + 1).padStart(2, "0")}`;

  const [mostrarModalEmision, setMostrarModalEmision] = useState(false);
  const [alumnoParaEmitir, setAlumnoParaEmitir] = useState(null);

  const location = useLocation();

  // Refrescar datos cuando el usuario vuelve a esta ruta (ej: desde Comprobantes)
  useEffect(() => {
    refetchMovimientos();
    refetchAlumnos();
  }, [location.pathname]);

  useEffect(() => {
    console.log("[Cuotas] Refrescando datos...");
    refetchAlumnos();
    refetchMovimientos();

    const onFocus = () => {
      console.log("[Cuotas] Ventana recuperó foco, refrescando...");
      refetchAlumnos();
      refetchMovimientos();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Determinar si el periodo es pasado
  const hoy = new Date();
  const periodoActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const esPeriodoPasado = periodoSeleccionado < periodoActual;

  // Determinar si hay cuotas vencidas o deuda en periodo pasado
  const tieneVencidos = (alumnos || []).some(
    (a) => {
      const cuota = a.cuotas?.[periodoSeleccionado];
      return cuota?.estado === "vencido" || (esPeriodoPasado && cuota?.monto > 0);
    }
  );

  // Local state for prices
  const [precios, setPrecios] = useState({ interno: 0, externo: 0 });
  const [preciosMora, setPreciosMora] = useState({ interno: 0, externo: 0 });
  const [cargando, setCargando] = useState(false);
  const [cargandoMora, setCargandoMora] = useState(false);
  const [emitirCargando, setEmitirCargando] = useState(false);
  const [interesesCargando, setInteresesCargando] = useState(false);
  const [guardadoExitosa, setGuardadoExitosa] = useState(false);
  const [guardadoMoraExitosa, setGuardadoMoraExitosa] = useState(false);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [alumnoParaPagar, setAlumnoParaPagar] = useState(null);

  const handlePagarCuota = (alumno) => {
    setAlumnoParaPagar(alumno);
    setMostrarModalPago(true);
  };

  // Load current values from formula
  useEffect(() => {
    // 1. Cargar Cuota Base
    const confCuota = configs.find((c) => c.claveCampo === "cuota");
    if (confCuota?.formula) {
      const match = confCuota.formula.match(/\?\s*(\d+)\s*:\s*(\d+)/);
      if (match) {
        setPrecios({
          interno: parseInt(match[1]),
          externo: parseInt(match[2]),
        });
      }
    }

    // 2. Cargar Interés por Mora
    const confMora = configs.find((c) => c.claveCampo === "aplicar_interes");
    if (confMora?.formula) {
      const match = confMora.formula.match(/\?\s*(\d+)\s*:\s*(\d+)/);
      if (match) {
        setPreciosMora({
          interno: parseInt(match[1]),
          externo: parseInt(match[2]),
        });
      }
    }
  }, [configs]);

  const handleGuardarPrecios = async () => {
    const conf = configs.find((c) => c.claveCampo === "cuota");
    if (!conf) return;

    setCargando(true);
    try {
      const nuevaFormula = `{tipo_alumno} == "INTERNO" ? ${precios.interno} : ${precios.externo}`;
      await actualizarConfiguracion({
        codigoSecuencial: conf.codigoSecuencial,
        data: {
          ...conf,
          formula: nuevaFormula,
          codigoEmpresa: 2,
        },
      });
      setGuardadoExitosa(true);
      setTimeout(() => setGuardadoExitosa(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const handleGuardarMora = async () => {
    const conf = configs.find((c) => c.claveCampo === "aplicar_interes");
    if (!conf) return;

    setCargandoMora(true);
    try {
      // Mantenemos lowercase "interno" para consistencia con la función de guardado de cuotas
      const nuevaFormula = `{tipo_alumno} == "INTERNO" ? ${preciosMora.interno} : ${preciosMora.externo}`;
      await actualizarConfiguracion({
        codigoSecuencial: conf.codigoSecuencial,
        data: {
          ...conf,
          formula: nuevaFormula,
          codigoEmpresa: 2,
        },
      });
      setGuardadoMoraExitosa(true);
      setTimeout(() => setGuardadoMoraExitosa(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoMora(false);
    }
  };

  const handleEmitirMasivo = async () => {
    setEmitirCargando(true);
    try {
      await emitirCuotasMensuales(periodoSeleccionado);
    } finally {
      setEmitirCargando(false);
    }
  };

  const handleCargarInteresesMasivo = async () => {
    setInteresesCargando(true);
    try {
      await cargarInteresesMensuales(periodoSeleccionado);
    } finally {
      setInteresesCargando(false);
    }
  };

  const handleAbrirEmisionIndividual = (alumno) => {
    setAlumnoParaEmitir(alumno);
    setMostrarModalEmision(true);
  };

  const formatARS = (val) => {
    if (!val) return "0";
    return Number(val).toLocaleString("es-AR").replace(/,/g, ".");
  };

  const parseARS = (val) => {
    return val.replace(/\./g, "").replace(/\D/g, "");
  };

  return (
    <div className="flex flex-col min-h-screen text-black p-4">
      <EncabezadoSeccion
        ruta="GESTIÓN DE CUOTAS"
        icono={<CuotasIcono size={18} />}
      />

      <div className="flex flex-col gap-6 mb-8">
        {/* Acciones Principales */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleEmitirMasivo}
              disabled={emitirCargando}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] hover:border hover:border-[var(--primary)] transition-all shadow-md shadow-[var(--primary)]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emitirCargando ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <EmitirCuotasIcono size={20} />
              )}
              <div className="flex flex-col items-start leading-none">
                <span>{emitirCargando ? "Emitiendo..." : "Emitir Cuotas"}</span>
                <span className="text-[9px] opacity-60 lowercase font-bold mt-1">
                  {anioSeleccionado}-{String(Number(mesSeleccionado) + 1).padStart(2, "0")}
                </span>
              </div>
            </button>

            {tieneVencidos && (
              <button
                onClick={handleCargarInteresesMasivo}
                disabled={interesesCargando}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--text-green)] text-white rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-[var(--text-green)]/20 hover:text-[var(--text-green)] hover:border hover:border-[var(--text-green)] transition-all shadow-md shadow-[var(--text-green)]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {interesesCargando ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <AumentarCuotaIcono size={20} />
                )}
                <div className="flex flex-col items-start leading-none">
                  <span>{interesesCargando ? "Cargando..." : "Cargar Interés"}</span>
                  <span className="text-[9px] opacity-60 lowercase font-bold mt-1">
                    {anioSeleccionado}-{String(Number(mesSeleccionado) + 1).padStart(2, "0")}
                  </span>
                </div>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-black/30 uppercase tracking-[0.2em] bg-black/5 px-4 py-2 rounded-full w-full sm:w-auto justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate">Periodo: {meses[mesSeleccionado].toUpperCase()} {anioSeleccionado}</span>
          </div>
        </div>

        {/* Panel de Configuración de Precios */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* GRUPO: PRECIOS BASE */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--primary)]/10 rounded-md text-[var(--primary)]">
                <EmitirCuotasIcono size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">
                  Configuración
                </span>
                <span className="text-[14px] font-black text-black uppercase leading-tight">
                  Valor Cuotas
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                <label className="text-[9px] font-black text-black/40 uppercase ml-1">
                  Interno
                </label>
                <div className="flex items-center gap-2 bg-[var(--fill-secondary)]/30 border border-[var(--border-subtle)] rounded-md px-3 py-1.5 focus-within:border-[var(--primary)]/50 transition-colors">
                  <span className="text-[11px] text-black/40 font-bold">$</span>
                  <input
                    type="text"
                    value={formatARS(precios.interno)}
                    onChange={(e) =>
                      setPrecios({
                        ...precios,
                        interno: parseARS(e.target.value),
                      })
                    }
                    className="bg-transparent border-none text-[13px] font-black text-[var(--primary)] w-full sm:w-20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                <label className="text-[9px] font-black text-black/40 uppercase ml-1">
                  Externo
                </label>
                <div className="flex items-center gap-2 bg-[var(--fill-secondary)]/30 border border-[var(--border-subtle)] rounded-md px-3 py-1.5 focus-within:border-[var(--primary)]/50 transition-colors">
                  <span className="text-[11px] text-black/40 font-bold">$</span>
                  <input
                    type="text"
                    value={formatARS(precios.externo)}
                    onChange={(e) =>
                      setPrecios({
                        ...precios,
                        externo: parseARS(e.target.value),
                      })
                    }
                    className="bg-transparent border-none text-[13px] font-black text-blue-600 w-full sm:w-20 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleGuardarPrecios}
                className={`p-2.5 rounded-md transition-all cursor-pointer h-[42px] mt-4 sm:mt-0 ${
                  guardadoExitosa
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-[var(--primary)] text-white hover:text-[var(--primary)] hover:bg-[var(--primary)]/20 shadow-lg shadow-[var(--primary)]/10 hover:border hover:border-[var(--primary)]"
                }`}
              >
                {cargando ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : guardadoExitosa ? (
                  <CheckCircle size={16} />
                ) : (
                  <GuardarIcono size={16} />
                )}
              </button>
            </div>
          </div>

          {/* GRUPO: INTERESES POR MORA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-md text-amber-600">
                <AlertCircle size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                  Interés Diario
                </span>
                <span className="text-[14px] font-black text-black uppercase leading-tight">
                  Mora
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                <label className="text-[9px] font-black text-black/40 uppercase ml-1">
                  Interno
                </label>
                <div className="flex items-center gap-2 bg-[var(--fill-secondary)]/30 border border-[var(--border-subtle)] rounded-md px-3 py-1.5 focus-within:border-amber-500/50 transition-colors">
                  <span className="text-[11px] text-black/40 font-bold">$</span>
                  <input
                    type="text"
                    value={formatARS(preciosMora.interno)}
                    onChange={(e) =>
                      setPreciosMora({
                        ...preciosMora,
                        interno: parseARS(e.target.value),
                      })
                    }
                    className="bg-transparent border-none text-[13px] font-black text-amber-700 w-full sm:w-16 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                <label className="text-[9px] font-black text-black/40 uppercase ml-1">
                  Externo
                </label>
                <div className="flex items-center gap-2 bg-[var(--fill-secondary)]/30 border border-[var(--border-subtle)] rounded-md px-3 py-1.5 focus-within:border-amber-500/50 transition-colors">
                  <span className="text-[11px] text-black/40 font-bold">$</span>
                  <input
                    type="text"
                    value={formatARS(preciosMora.externo)}
                    onChange={(e) =>
                      setPreciosMora({
                        ...preciosMora,
                        externo: parseARS(e.target.value),
                      })
                    }
                    className="bg-transparent border-none text-[13px] font-black text-amber-600 w-full sm:w-16 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleGuardarMora}
                className={`p-2.5 rounded-md transition-all cursor-pointer h-[42px] mt-4 sm:mt-0 ${
                  guardadoMoraExitosa
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-amber-600 text-white hover:text-amber-600 hover:bg-amber-600/20 shadow-lg shadow-amber-600/10 hover:border hover:border-amber-600"
                }`}
              >
                {cargandoMora ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : guardadoMoraExitosa ? (
                  <CheckCircle size={16} />
                ) : (
                  <GuardarIcono size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 pr-1">
        {/* Componente Principal de Cuotas */}
        <div className="rounded-md overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          <TablaCuotas
            alumnos={alumnos}
            cargando={cargandoAlumnos}
            mesSeleccionado={mesSeleccionado}
            setMesSeleccionado={setMesSeleccionado}
            anioSeleccionado={anioSeleccionado}
            setAnioSeleccionado={setAnioSeleccionado}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            precios={precios}
            preciosMora={preciosMora}
            handlePagarCuota={handlePagarCuota}
            handleEmitirIndividual={handleAbrirEmisionIndividual}
            paginas={paginas}
            paginaActual={paginaActual}
            total={total}
            setPagina={setPagina}
          />
        </div>
      </div>

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
          }}
        />
      )}
    </div>
  );
};

export default Cuotas;
