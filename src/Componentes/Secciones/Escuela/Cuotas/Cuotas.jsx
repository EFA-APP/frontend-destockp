import { useState, useEffect } from "react";
import { useAlumnos } from "../../../../Backend/Contactos/hooks/useAlumnos";
import { useConfiguracionContactos } from "../../../../Backend/Contactos/hooks/useConfiguracionContactos";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { CuotasIcono } from "../../../../assets/Icons";
import { AlertCircle, CheckCircle, Save, TrendingUp } from "lucide-react";
import TablaCuotas from "../../../Tablas/Escuela/Cuotas/TablaCuotas";

const Cuotas = () => {
  const {
    alumnos,
    cargandoAlumnos,
    emitirCuotasMensuales,
    cargarInteresesMensuales,
    busqueda,
    setBusqueda,
    mesSeleccionado,
    setMesSeleccionado,
  } = useAlumnos();
  const { configs, actualizarConfiguracion } = useConfiguracionContactos();

  // Determinar si hay cuotas vencidas en el mes seleccionado para mostrar el botón de interés
  const tieneVencidos = (alumnos || []).some(
    (a) => a.cuotas?.[mesSeleccionado]?.estado === "vencido",
  );

  // Local state for prices
  const [precios, setPrecios] = useState({ interno: 0, externo: 0 });
  const [preciosMora, setPreciosMora] = useState({ interno: 0, externo: 0 });
  const [cargando, setCargando] = useState(false);
  const [cargandoMora, setCargandoMora] = useState(false);
  const [guardadoExitosa, setGuardadoExitosa] = useState(false);
  const [guardadoMoraExitosa, setGuardadoMoraExitosa] = useState(false);

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

  const formatARS = (val) => {
    if (!val) return "0";
    return Number(val).toLocaleString("es-AR").replace(/,/g, ".");
  };

  const parseARS = (val) => {
    return val.replace(/\./g, "").replace(/\D/g, "");
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white p-4 overflow-hidden">
      <EncabezadoSeccion
        ruta="GESTIÓN DE CUOTAS"
        icono={<CuotasIcono size={18} />}
      />

      <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => emitirCuotasMensuales(mesSeleccionado)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-lg text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <TrendingUp size={14} />
            Emitir Cuotas del Mes
          </button>

          {tieneVencidos && (
            <button
              onClick={() => cargarInteresesMensuales(mesSeleccionado)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-rose-400 transition-all shadow-[0_0_20px_rgba(244,63,94,0.2)]"
            >
              <AlertCircle size={14} />
              Cargar Interés
            </button>
          )}
        </div>

        {/* Panel de Configuración Rápida */}
        <div className="flex flex-wrap items-center gap-4">
          {/* GRUPO: PRECIOS BASE */}
          <div className="flex items-center gap-4 p-3 bg-[var(--surface)] border border-white/5 rounded-xl">
            <div className="flex flex-col gap-1 -mt-1 mr-2">
              <span className="text-[7px] font-black text-[var(--primary)] uppercase tracking-tighter">
                Configuración
              </span>
              <span className="text-[10px] font-black text-white/90 uppercase leading-none">
                Cuotas
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-white/50 uppercase ml-1">
                  Interno
                </label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-md px-2 py-1">
                  <span className="text-[10px] text-white/70 font-bold">$</span>
                  <input
                    type="text"
                    value={formatARS(precios.interno)}
                    onChange={(e) =>
                      setPrecios({
                        ...precios,
                        interno: parseARS(e.target.value),
                      })
                    }
                    className="bg-transparent border-none text-xs font-black text-[var(--primary)] w-20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-white/50 uppercase ml-1">
                  Externo
                </label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-md px-2 py-1">
                  <span className="text-[10px] text-white/70 font-bold">$</span>
                  <input
                    type="text"
                    value={formatARS(precios.externo)}
                    onChange={(e) =>
                      setPrecios({
                        ...precios,
                        externo: parseARS(e.target.value),
                      })
                    }
                    className="bg-transparent border-none text-xs font-black text-blue-400 w-20 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleGuardarPrecios}
                className={`flex items-center gap-2 ml-1 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  guardadoExitosa
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-blue-600 text-white hover:bg-blue-500"
                }`}
              >
                {cargando ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : guardadoExitosa ? (
                  <CheckCircle size={12} />
                ) : (
                  <Save size={12} />
                )}
                {guardadoExitosa ? "OK" : "GUARDAR"}
              </button>
            </div>
          </div>

          {/* GRUPO: INTERESES POR MORA */}
          <div className="flex items-center gap-4 p-3 bg-[var(--surface)] border border-white/5 rounded-xl">
            <div className="flex flex-col gap-1 -mt-1 mr-2">
              <span className="text-[7px] font-black text-amber-500 uppercase tracking-tighter">
                Interés Diario
              </span>
              <span className="text-[10px] font-black text-white/90 uppercase leading-none">
                Mora
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-white/50 uppercase ml-1">
                  Interno
                </label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-md px-2 py-1">
                  <span className="text-[10px] text-white/70 font-bold">$</span>
                  <input
                    type="text"
                    value={formatARS(preciosMora.interno)}
                    onChange={(e) =>
                      setPreciosMora({
                        ...preciosMora,
                        interno: parseARS(e.target.value),
                      })
                    }
                    className="bg-transparent border-none text-xs font-black text-amber-500 w-16 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-white/50 uppercase ml-1">
                  Externo
                </label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-md px-2 py-1">
                  <span className="text-[10px] text-white/70 font-bold">$</span>
                  <input
                    type="text"
                    value={formatARS(preciosMora.externo)}
                    onChange={(e) =>
                      setPreciosMora({
                        ...preciosMora,
                        externo: parseARS(e.target.value),
                      })
                    }
                    className="bg-transparent border-none text-xs font-black text-amber-400 w-16 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleGuardarMora}
                className={`flex items-center gap-2 ml-1 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  guardadoMoraExitosa
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-600 text-white hover:bg-amber-500"
                }`}
              >
                {cargandoMora ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : guardadoMoraExitosa ? (
                  <CheckCircle size={12} />
                ) : (
                  <Save size={12} />
                )}
                {guardadoMoraExitosa ? "OK" : "GUARDAR"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {/* Componente Principal de Cuotas */}
        <div className="bg-[#0a0a0a] rounded-xl border border-white/5 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          <TablaCuotas
            alumnos={alumnos}
            cargando={cargandoAlumnos}
            mesSeleccionado={mesSeleccionado}
            setMesSeleccionado={setMesSeleccionado}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            precios={precios}
            preciosMora={preciosMora}
          />
        </div>
      </div>
    </div>
  );
};

export default Cuotas;
