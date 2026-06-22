import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAlumnos } from "../../../../Backend/Contactos/hooks/useAlumnos";
import { useConfiguracionContactos } from "../../../../Backend/Contactos/hooks/useConfiguracionContactos";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
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
  Search,
  ChevronDown,
  User,
  Clock,
} from "lucide-react";
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
    movimientos: todosLosMovimientos,
    refetchAlumnos,
    refetchMovimientos,
    emitirCuotaIndividual,
    paginas,
    paginaActual,
    total,
    setPagina,
    alumnosCompletos,
    obtenerEstadisticas,
    metricasCuenta,
    metricasLote,
  } = useAlumnos(anioSeleccionado);

  const { configs, actualizarConfiguracion } = useConfiguracionContactos();

  const periodoSeleccionado = `${anioSeleccionado}-${String(Number(mesSeleccionado) + 1).padStart(2, "0")}`;

  const [mostrarModalEmision, setMostrarModalEmision] = useState(false);
  const [alumnoParaEmitir, setAlumnoParaEmitir] = useState(null);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [alumnoParaPagar, setAlumnoParaPagar] = useState(null);

  // Precios
  const [precios, setPrecios] = useState({ interno: 0, externo: 0 });
  const [preciosMora, setPreciosMora] = useState({ interno: 0, externo: 0 });
  const [cargando, setCargando] = useState(false);
  const [cargandoMora, setCargandoMora] = useState(false);
  const [emitirCargando, setEmitirCargando] = useState(false);
  const [guardadoExitosa, setGuardadoExitosa] = useState(false);
  const [guardadoMoraExitosa, setGuardadoMoraExitosa] = useState(false);

  // Selección individual para emisión masiva en lote
  const [selectedAlumnos, setSelectedAlumnos] = useState([]);

  const location = useLocation();

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

  // Cargar valores iniciales desde fórmulas
  useEffect(() => {
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

  const handlePagarCuota = (alumno) => {
    setAlumnoParaPagar(alumno);
    setMostrarModalPago(true);
  };

  const handleAbrirEmisionIndividual = (alumno) => {
    setAlumnoParaEmitir(alumno);
    setMostrarModalEmision(true);
  };

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

  const handleSelectAll = () => {
    const alumnosEmitibles = alumnos.filter(
      (a) => !a.cuotas?.[periodoSeleccionado],
    );
    if (selectedAlumnos.length === alumnosEmitibles.length) {
      setSelectedAlumnos([]);
    } else {
      setSelectedAlumnos(alumnosEmitibles.map((a) => a.id));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedAlumnos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleEmitirSeleccionados = async () => {
    if (selectedAlumnos.length === 0) return;
    setEmitirCargando(true);
    try {
      for (const id of selectedAlumnos) {
        const alum = alumnos.find((a) => a.id === id);
        if (alum) {
          await emitirCuotaIndividual(
            alum.id,
            periodoSeleccionado,
            alum.montoCuotaActual,
            `CUOTA PERIODO ${meses[mesSeleccionado].toUpperCase()} ${anioSeleccionado}`,
            `${anioSeleccionado}-${String(Number(mesSeleccionado) + 1).padStart(2, "0")}-10`,
          );
        }
      }
      setSelectedAlumnos([]);
    } catch (err) {
      console.error(err);
    } finally {
      setEmitirCargando(false);
    }
  };

  const formatARS = (val) => {
    if (!val) return "0";
    return Number(val).toLocaleString("es-AR").replace(/,/g, ".");
  };

  const parseARS = (val) => {
    return val.replace(/\./g, "").replace(/\D/g, "");
  };

  const formatearPeriodoLocal = (periodo) => {
    if (!periodo) return "N/A";
    const [anio, mes] = periodo.split("-");
    const mesIdx = parseInt(mes) - 1;
    return `${meses[mesIdx]?.toUpperCase() || mes} ${anio}`;
  };

  // Cálculos de Lote y Gráficos obtenidos del backend (fallback local si cargando o vacío)
  const totalAlumnosCount = metricasLote
    ? metricasLote.totalAlumnosCount
    : alumnosCompletos?.length || 0;
  const countInternos = metricasLote
    ? metricasLote.countInternos
    : alumnosCompletos?.filter((a) => a.atributos?.tipo_alumno === "INTERNO")
        .length || 0;
  const countExternos = totalAlumnosCount - countInternos;

  const pctInternos =
    totalAlumnosCount > 0
      ? Math.round((countInternos / totalAlumnosCount) * 100)
      : 0;
  const pctExternos = totalAlumnosCount > 0 ? 100 - pctInternos : 0;

  const montoBaseInterno = precios.interno;
  const montoBaseExterno = precios.externo;
  const totalEmitirInternos = countInternos * montoBaseInterno;
  const totalEmitirExternos = countExternos * montoBaseExterno;
  const totalEmitirSuma = metricasLote
    ? metricasLote.totalEmitirSuma
    : totalEmitirInternos + totalEmitirExternos;

  // Serie de meses para gráficos (obtenida de contabilidad-ms o calculada localmente del 1er mes al actual)
  const ultimosMeses = useMemo(() => {
    if (metricasCuenta?.ultimosMeses) {
      return metricasCuenta.ultimosMeses;
    }
    // Fallback local: de Enero del año seleccionado hasta el mes seleccionado
    const list = [];
    for (let mIdx = 0; mIdx <= mesSeleccionado; mIdx++) {
      const periodStr = `${anioSeleccionado}-${String(mIdx + 1).padStart(2, "0")}`;

      const pagos = (todosLosMovimientos || [])
        .filter((m) => {
          const mPeriodo =
            m.periodo ||
            (m.fecha || m.fechaEmision
              ? (() => {
                  const dateObj = new Date(m.fecha || m.fechaEmision);
                  return isNaN(dateObj.getTime())
                    ? ""
                    : `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
                })()
              : "");
          return mPeriodo === periodStr && m.monto < 0;
        })
        .reduce((sum, m) => sum + Math.abs(m.monto), 0);

      const deuda = (alumnosCompletos || []).reduce((sum, a) => {
        const c = a.cuotas?.[periodStr];
        return sum + (c && c.estado !== "pagado" ? c.monto : 0);
      }, 0);

      list.push({
        mesNombre: meses[mIdx],
        periodo: periodStr,
        pagos,
        deuda,
      });
    }
    return list;
  }, [
    anioSeleccionado,
    mesSeleccionado,
    todosLosMovimientos,
    alumnosCompletos,
    metricasCuenta,
  ]);

  // Valores para el gráfico de Línea
  const maxPagos = useMemo(() => {
    return Math.max(...ultimosMeses.map((m) => m.pagos), 1);
  }, [ultimosMeses]);

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

  // Estadísticas y valores para Velocímetro
  const stats = useMemo(() => {
    if (metricasLote?.stats) {
      return metricasLote.stats;
    }
    if (typeof obtenerEstadisticas === "function") {
      return obtenerEstadisticas();
    }
    return {
      totalAlumnos: 0,
      activos: 0,
      totalDeuda: 0,
      saldoRealTotal: 0,
      alumnosConDeuda: 0,
      totalRecaudado: 0,
      recaudacionMesActual: 0,
    };
  }, [
    alumnosCompletos,
    todosLosMovimientos,
    obtenerEstadisticas,
    metricasLote,
  ]);

  const totalPagadoMes = useMemo(() => {
    return ultimosMeses.reduce((sum, m) => sum + (m.pagos || 0), 0);
  }, [ultimosMeses]);

  const moraAcumuladaMes = useMemo(() => {
    let totalMora = 0;
    (alumnosCompletos || []).forEach((a) => {
      for (let mIdx = 0; mIdx <= mesSeleccionado; mIdx++) {
        const periodStr = `${anioSeleccionado}-${String(mIdx + 1).padStart(2, "0")}`;
        const c = a.cuotas?.[periodStr];
        if (c && c.estado !== "pagado") {
          totalMora += Number(c.interes || 0);
        }
      }
    });
    return totalMora;
  }, [anioSeleccionado, mesSeleccionado, alumnosCompletos]);

  const ratioMora = useMemo(() => {
    const totalDeuda = stats.totalDeuda || 0;
    if (totalDeuda === 0) return 0;
    return Math.min(1, moraAcumuladaMes / totalDeuda);
  }, [moraAcumuladaMes, stats.totalDeuda]);

  const angle = useMemo(() => {
    return -90 + ratioMora * 180;
  }, [ratioMora]);

  // Alturas para gráfico de barras apiladas
  const maxBarVal = useMemo(() => {
    return Math.max(...ultimosMeses.map((m) => m.pagos + m.deuda), 1);
  }, [ultimosMeses]);

  // Línea de Actividad Reciente (obtenida de contabilidad-ms)
  const actividadesRecientes = useMemo(() => {
    const rawActividades =
      metricasCuenta?.actividadesRecientes ||
      [...(todosLosMovimientos || [])]
        .sort(
          (a, b) =>
            new Date(b.fecha || b.fechaEmision) -
            new Date(a.fecha || a.fechaEmision),
        )
        .slice(0, 10);

    return rawActividades.map((mov) => {
      const alumno = alumnosCompletos.find(
        (a) => Number(a.codigoSecuencial) === Number(mov.codigoContacto),
      );
      const alumnoNombre = alumno
        ? `${alumno.nombre} ${alumno.apellido}`
        : "Alumno";

      const esPago = mov.monto < 0;
      const hora = new Date(mov.fecha).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const fecha = new Date(mov.fecha).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
      });

      let titulo = "";
      if (esPago) {
        titulo = `Pago de $${formatARS(Math.abs(mov.monto))} de ${alumnoNombre} registrado`;
      } else {
        const periodStr =
          mov.periodo ||
          (mov.fecha
            ? `${new Date(mov.fecha).getFullYear()}-${String(new Date(mov.fecha).getMonth() + 1).padStart(2, "0")}`
            : "");
        titulo = `Emisión de cuota de ${formatearPeriodoLocal(periodStr)} registrada`;
      }

      return {
        id: mov.codigoSecuencial || mov.id,
        hora,
        fecha,
        titulo,
        esPago,
        alumnoNombre,
      };
    });
  }, [metricasCuenta, todosLosMovimientos, alumnosCompletos]);

  return (
    <div className="flex flex-col min-h-screen text-gray-800 p-4 space-y-6 w-full">
      {/* 1. SECCIÓN: CABECERA CON CONTROLES (Full Width integrando los selectores como children) */}
      <EncabezadoSeccion
        ruta="GESTIÓN DE CUOTAS"
        icono={<CuotasIcono size={18} />}
      >
        {/* Selectores de Período */}
        <div className="flex items-center gap-2">
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(Number(e.target.value))}
            className="h-10 bg-white border border-gray-250 rounded-md px-3 text-xs font-black uppercase tracking-wider text-gray-700 focus:outline-none focus:border-[var(--primary)] transition"
          >
            {meses.map((m, idx) => (
              <option key={idx} value={idx}>
                {m.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
            className="h-10 bg-white border border-gray-250 rounded-md px-3 text-xs font-black uppercase tracking-wider text-gray-700 focus:outline-none focus:border-[var(--primary)] transition"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </EncabezadoSeccion>

      {/* 2. REGISTROS ORGANIZADOS EN FILAS (STACK VERTICAL COMPLETO) */}
      <div className="flex flex-col gap-6 w-full">
        {/* FILA 1: ACCIONES Y CONFIGURACIÓN GENERAL (Full Width y tamaño de fuente incrementado) */}
        <div className="shadow-xl shadow-gray-100/40 space-y-6 w-full">
          {/* Grilla superior de acciones y configuraciones (3 Columnas con más padding y fuentes legibles) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Botón Emisión Masiva */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-5 min-h-[140px] flex flex-col justify-between gap-3 shadow-sm">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                Emisión de Cuotas
              </span>
              <div className="flex-1 flex items-center justify-center">
                <button
                  onClick={handleEmitirMasivo}
                  disabled={emitirCargando}
                  className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center gap-2 transition active:scale-95 shadow font-black text-[11px] uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed"
                >
                  {emitirCargando ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <EmitirCuotasIcono size={16} />
                  )}
                  <span>
                    Confirmar y Emitir (
                    {meses[mesSeleccionado].slice(0, 3).toUpperCase()}-
                    {String(Number(mesSeleccionado) + 1).padStart(2, "0")})
                  </span>
                </button>
              </div>
            </div>

            {/* Valor Cuotas Config */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-5 min-h-[140px] flex flex-col justify-between gap-3 shadow-sm">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                Configuración Valor Cuotas
              </span>
              <div className="grid grid-cols-2 gap-3 flex-1 items-center">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block pl-0.5 mb-1">
                    Interno
                  </label>
                  <input
                    type="text"
                    value={formatARS(precios.interno)}
                    onChange={(e) =>
                      setPrecios({
                        ...precios,
                        interno: parseARS(e.target.value),
                      })
                    }
                    className="w-full h-9 bg-white border border-gray-250 rounded px-3 text-xs font-black text-[var(--primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block pl-0.5 mb-1">
                    Externo
                  </label>
                  <input
                    type="text"
                    value={formatARS(precios.externo)}
                    onChange={(e) =>
                      setPrecios({
                        ...precios,
                        externo: parseARS(e.target.value),
                      })
                    }
                    className="w-full h-9 bg-white border border-gray-250 rounded px-3 text-xs font-black text-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleGuardarPrecios}
                disabled={cargando}
                className="w-full h-8 bg-gray-200/70 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {cargando ? (
                  <div className="w-3.5 h-3.5 border-2 border-gray-400/30 border-t-gray-700 rounded-full animate-spin" />
                ) : guardadoExitosa ? (
                  <span className="text-emerald-600 font-extrabold text-[10px]">
                    Guardado ✓
                  </span>
                ) : (
                  <>
                    <Save size={12} />
                    <span>Guardar</span>
                  </>
                )}
              </button>
            </div>

            {/* Mora Config */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-5 min-h-[140px] flex flex-col justify-between gap-3 shadow-sm">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                Interés Diario Mora
              </span>
              <div className="grid grid-cols-2 gap-3 flex-1 items-center">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block pl-0.5 mb-1">
                    Interno
                  </label>
                  <input
                    type="text"
                    value={formatARS(preciosMora.interno)}
                    onChange={(e) =>
                      setPreciosMora({
                        ...preciosMora,
                        interno: parseARS(e.target.value),
                      })
                    }
                    className="w-full h-9 bg-white border border-gray-250 rounded px-3 text-xs font-black text-amber-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block pl-0.5 mb-1">
                    Externo
                  </label>
                  <input
                    type="text"
                    value={formatARS(preciosMora.externo)}
                    onChange={(e) =>
                      setPreciosMora({
                        ...preciosMora,
                        externo: parseARS(e.target.value),
                      })
                    }
                    className="w-full h-9 bg-white border border-gray-250 rounded px-3 text-xs font-black text-amber-600 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleGuardarMora}
                disabled={cargandoMora}
                className="w-full h-8 bg-gray-200/70 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {cargandoMora ? (
                  <div className="w-3.5 h-3.5 border-2 border-gray-400/30 border-t-gray-700 rounded-full animate-spin" />
                ) : guardadoMoraExitosa ? (
                  <span className="text-emerald-600 font-extrabold text-[10px]">
                    Guardado ✓
                  </span>
                ) : (
                  <>
                    <Save size={12} />
                    <span>Guardar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* FILA 2: GRÁFICOS Y ANALÍTICAS (Se visualizan primero como solicitó el usuario) */}
        <div className="shadow-xl shadow-gray-100/40 space-y-6 w-full">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3.5">
            <div className="w-9 h-9 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">
                Resumen Financiero y Estadísticas de Lote
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                Visualización Analítica del Periodo
              </p>
            </div>
          </div>

          {/* Grilla de gráficos de emisión y detalle lote (2 Columnas grandes para más espacio) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Donut Chart (Proporción Alumnos) */}
            <div className="lg:col-span-2 bg-gray-50 border border-gray-200/80 rounded-xl p-5 flex flex-col items-center justify-center space-y-4 shadow-sm">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center w-full block">
                Resumen de Emisión
              </span>
              <div className="flex items-center gap-8 w-full justify-center">
                <div
                  className="w-28 h-28 rounded-full relative flex items-center justify-center shadow-inner shrink-0"
                  style={{
                    background: `conic-gradient(var(--primary) 0% ${pctInternos}%, #f97316 ${pctInternos}% 100%)`,
                  }}
                >
                  <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center shadow-sm">
                    <span className="text-lg font-black text-gray-950">
                      {totalAlumnosCount}
                    </span>
                    <span className="text-[9px] font-black text-gray-400 uppercase">
                      Alumnos
                    </span>
                  </div>
                </div>
                <div className="text-xs font-black space-y-2 text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-[var(--primary)]" />
                    <span>Internos ({pctInternos}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-orange-500" />
                    <span>Externos ({pctExternos}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen Batch Lote */}
            <div className="lg:col-span-3 bg-gray-50 border border-gray-200/80 rounded-xl p-5 space-y-3 shadow-sm">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                Detalle de Lote de Cuotas
              </span>
              <table className="w-full text-left border-collapse text-xs uppercase font-bold text-gray-500">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 text-[10px]">
                    <th className="pb-2">Concepto</th>
                    <th className="pb-2 text-center">Alumnos</th>
                    <th className="pb-2 text-right">Monto Base</th>
                    <th className="pb-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2.5 text-gray-700">Internos</td>
                    <td className="py-2.5 text-center">{countInternos}</td>
                    <td className="py-2.5 text-right">
                      ${formatARS(montoBaseInterno)}
                    </td>
                    <td className="py-2.5 text-right font-black text-gray-800">
                      ${formatARS(totalEmitirInternos)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-gray-700">Externos</td>
                    <td className="py-2.5 text-center">{countExternos}</td>
                    <td className="py-2.5 text-right">
                      ${formatARS(montoBaseExterno)}
                    </td>
                    <td className="py-2.5 text-right font-black text-gray-800">
                      ${formatARS(totalEmitirExternos)}
                    </td>
                  </tr>
                  <tr className="font-black text-gray-900 border-t border-gray-200">
                    <td className="pt-3">Total Proyectado</td>
                    <td className="pt-3 text-center">{totalAlumnosCount}</td>
                    <td className="pt-3 text-right">—</td>
                    <td className="pt-3 text-right text-sm text-[var(--primary)]">
                      ${formatARS(totalEmitirSuma)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Grillas de las 3 tarjetas financieras lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gráfico 1: Monto Total Pagado */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-5 flex flex-col justify-between gap-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest block leading-none">
                    Monto Total Pagado
                  </span>
                  <span className="text-2xl font-black text-gray-900 block mt-2 tracking-tight">
                    ${formatARS(totalPagadoMes)}
                  </span>
                </div>
                <div className="p-2.5 bg-[var(--primary)]/10 rounded-md text-[var(--primary)] animate-pulse">
                  <DollarSign size={18} />
                </div>
              </div>

              {/* Line Chart SVG */}
              <div>
                <svg
                  viewBox="0 0 160 50"
                  className="w-full h-14 text-[var(--primary)]"
                >
                  <path
                    d={`M 0,50 L ${points} L 160,50 Z`}
                    fill="url(#gradient-pagos-cuotas-row)"
                    opacity="0.1"
                  />
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    points={points}
                  />
                  <defs>
                    <linearGradient
                      id="gradient-pagos-cuotas-row"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="currentColor" />
                      <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Gráfico 2: Mora Acumulada */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-5 flex flex-col justify-between gap-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest block leading-none">
                    Mora Acumulada
                  </span>
                  <span className="text-2xl font-black text-amber-600 block mt-2 tracking-tight">
                    ${formatARS(moraAcumuladaMes)}
                  </span>
                </div>
                <div className="p-2.5 bg-amber-500/10 rounded-md text-amber-600">
                  <AlertCircle size={18} />
                </div>
              </div>

              {/* Gauge Chart SVG */}
              <div className="flex justify-center items-end pb-1">
                <svg viewBox="0 0 100 55" className="w-36 h-18">
                  {/* Background track */}
                  <path
                    d="M 10,50 A 40,40 0 0,1 90,50"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Active track */}
                  <path
                    d="M 10,50 A 40,40 0 0,1 90,50"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${ratioMora * 125.6} 125.6`}
                  />
                  {/* Needle */}
                  <line
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="15"
                    stroke="#475569"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    transform={`rotate(${angle} 50 50)`}
                  />
                  <circle cx="50" cy="50" r="4" fill="#475569" />
                </svg>
              </div>
            </div>

            {/* Gráfico 3: Pagos Recibidos vs Deuda Pendiente */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-5 flex flex-col justify-between gap-2 shadow-sm">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest block leading-none">
                Pagos Recibidos vs. Deuda Pendiente
              </span>
              <div className="flex h-28 items-end justify-between gap-3 pt-2 border-b border-gray-200/50">
                {ultimosMeses.map((m, idx) => {
                  const totalMonth = m.pagos + m.deuda;
                  const pctPagos =
                    totalMonth > 0 ? (m.pagos / maxBarVal) * 100 : 0;
                  const pctDeuda =
                    totalMonth > 0 ? (m.deuda / maxBarVal) * 100 : 0;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center flex-1 group relative h-full justify-end"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-gray-900 text-white text-[8px] font-bold p-1.5 rounded shadow-md z-10 whitespace-nowrap">
                        <span>Pagado: ${formatARS(m.pagos)}</span>
                        <span>Deuda: ${formatARS(m.deuda)}</span>
                      </div>

                      {/* Stacked bar */}
                      <div className="w-full flex flex-col justify-end h-20 rounded-t bg-gray-150 overflow-hidden shrink-0">
                        {/* Deuda (orange) */}
                        <div
                          className="w-full bg-orange-500"
                          style={{ height: `${pctDeuda}%` }}
                        />
                        {/* Pagos (blue) */}
                        <div
                          className="w-full bg-[var(--primary)]"
                          style={{ height: `${pctPagos}%` }}
                        />
                      </div>

                      {/* Label */}
                      <span className="text-[10px] font-black text-gray-400 mt-1.5 uppercase truncate max-w-full">
                        {m.mesNombre.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* FILA 3: LISTADO DE ALUMNOS (Ubicada después de los gráficos para mejor usabilidad) */}
        <div className="shadow-xl shadow-gray-100/40 space-y-6 w-full">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3.5">
            <div className="w-9 h-9 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">
                Listado y Grilla de Alumnos
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                Padrón del Período
              </p>
            </div>
          </div>

          {/* Grilla / Listado de Alumnos */}
          <div className="space-y-4">
            {/* Buscador y Paginador inferior */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar alumno..."
                  className="w-full h-10 bg-gray-50 border border-gray-200 rounded-md pl-9 pr-3 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[var(--primary)] transition"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3 shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    disabled={paginaActual <= 1}
                    onClick={() => setPagina(paginaActual - 1)}
                    className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-40 rounded-lg text-xs font-black uppercase transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    Ant.
                  </button>
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wider px-2">
                    {paginaActual} / {paginas || 1}
                  </span>
                  <button
                    disabled={paginaActual >= paginas}
                    onClick={() => setPagina(paginaActual + 1)}
                    className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-40 rounded-lg text-xs font-black uppercase transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    Sig.
                  </button>
                </div>

                <button
                  onClick={handleEmitirSeleccionados}
                  disabled={selectedAlumnos.length === 0 || emitirCargando}
                  className="h-10 px-5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white disabled:bg-gray-250 disabled:text-gray-400 rounded-lg text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 shadow shadow-[var(--primary)]/10 cursor-pointer disabled:cursor-not-allowed"
                >
                  Emitir ({selectedAlumnos.length})
                </button>
              </div>
            </div>

            <div className="border border-gray-200/80 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[11px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-200">
                      <th className="py-3 px-4 w-12">
                        <input
                          type="checkbox"
                          checked={
                            alumnos.filter(
                              (a) => !a.cuotas?.[periodoSeleccionado],
                            ).length > 0 &&
                            selectedAlumnos.length ===
                              alumnos.filter(
                                (a) => !a.cuotas?.[periodoSeleccionado],
                              ).length
                          }
                          onChange={handleSelectAll}
                          className="w-4 h-4 border-gray-300 rounded text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4">Alumno</th>
                      <th className="py-3 px-4">Curso</th>
                      <th className="py-3 px-4 text-right">Cuota Base</th>
                      <th className="py-3 px-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm font-bold text-gray-700">
                    {cargandoAlumnos ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-10 text-center text-gray-400 font-bold uppercase tracking-wide text-xs"
                        >
                          Cargando grilla de alumnos...
                        </td>
                      </tr>
                    ) : alumnos.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-10 text-center text-gray-400 font-bold uppercase tracking-wide italic text-xs"
                        >
                          No se encontraron alumnos
                        </td>
                      </tr>
                    ) : (
                      alumnos.map((alumno) => {
                        const cuota = alumno.cuotas?.[periodoSeleccionado];
                        const yaEmitida = !!cuota;
                        const isChecked = selectedAlumnos.includes(alumno.id);

                        let badgeColor = "bg-gray-100 text-gray-500";
                        let badgeLabel = "Sin Emitir";
                        if (yaEmitida) {
                          if (cuota.estado === "pagado") {
                            badgeColor =
                              "bg-emerald-50 text-emerald-600 border border-emerald-250/50";
                            badgeLabel = "Pagado";
                          } else if (cuota.estado === "vencido") {
                            badgeColor =
                              "bg-rose-50 text-rose-600 border border-rose-250/50";
                            badgeLabel = "Vencido";
                          } else if (cuota.estado === "parcial") {
                            badgeColor =
                              "bg-blue-50 text-blue-600 border border-blue-250/50";
                            badgeLabel = "Parcial";
                          } else {
                            badgeColor =
                              "bg-amber-50 text-amber-600 border border-amber-250/50";
                            badgeLabel = "Pendiente";
                          }
                        }

                        return (
                          <tr
                            key={alumno.id}
                            className="hover:bg-gray-50/40 transition"
                          >
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleSelectOne(alumno.id)}
                                disabled={yaEmitida}
                                className="w-4 h-4 border-gray-300 rounded text-[var(--primary)] focus:ring-[var(--primary)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-extrabold text-gray-900 uppercase">
                                  {alumno.nombre} {alumno.apellido}
                                </span>
                                <span className="text-[10px] font-black text-gray-400 uppercase mt-0.5">
                                  {alumno.atributos?.tipo_alumno || "EXTERNO"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-500 uppercase">
                              {alumno.atributos?.curso || "S/D"}
                            </td>
                            <td className="py-3 px-4 text-right font-extrabold text-gray-900">
                              $
                              {formatARS(
                                yaEmitida
                                  ? cuota.montoOriginal
                                  : alumno.montoCuotaActual,
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-center">
                                {!yaEmitida ? (
                                  <button
                                    onClick={() =>
                                      handleAbrirEmisionIndividual(alumno)
                                    }
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-[var(--primary)] hover:text-white rounded text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                                  >
                                    Emitir
                                  </button>
                                ) : cuota.estado !== "pagado" ? (
                                  <button
                                    onClick={() => handlePagarCuota(alumno)}
                                    className="px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white rounded text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                                  >
                                    Pagar
                                  </button>
                                ) : (
                                  <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-250/50">
                                    Abonado
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* FILA 4: ACTIVIDAD RECIENTE (Full Width - 2 Columnas de Historial) */}
        <div className="shadow-xl shadow-gray-100/40 space-y-6 w-full">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3.5">
            <div className="w-9 h-9 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black">
              <Clock size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">
                Actividad Reciente
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                Registro de Operaciones
              </p>
            </div>
          </div>

          {/* Línea de tiempo distribuida en grilla de 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
            {actividadesRecientes.length === 0 ? (
              <div className="col-span-2 py-6 text-center text-gray-400 italic text-[10px] uppercase font-bold tracking-wider">
                Sin actividad registrada
              </div>
            ) : (
              actividadesRecientes.map((act, idx) => (
                <div key={idx} className="flex gap-4 items-start relative pl-6">
                  {/* Pin circular */}
                  <div
                    className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white ${act.esPago ? "bg-[var(--primary)] animate-pulse" : "bg-orange-500"}`}
                  />
                  <div className="flex flex-col">
                    <span className="text-[8.5px] font-bold text-gray-400 leading-none">
                      {act.hora} - {act.fecha}
                    </span>
                    <span className="text-xs font-black text-gray-800 leading-tight mt-1.5 uppercase">
                      {act.titulo}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. MODALES COMPLEMENTARIOS */}
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
