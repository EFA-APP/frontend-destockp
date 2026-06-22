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
} from "lucide-react";
import ModalPagoCuota from "./Cuotas/ModalPagoCuota";
import ModalEmisionIndividual from "./Cuotas/ModalEmisionIndividual";
import { ListarMovimientosApi } from "../../../Backend/Contactos/api/contactos.api";
import DataTable from "../../UI/DataTable/DataTable";

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
    codigoCtaCte,
  } = useAlumnos();

  // Filtros rápidos locales
  const [filtroEstado, setFiltroEstado] = useState("TODOS"); // TODOS, AL_DIA, CON_DEUDA, EN_MORA
  const anioSeleccionado = new Date().getFullYear();

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
  const [mesSeleccionadoMayor, setMesSeleccionadoMayor] = useState(
    new Date().getMonth(),
  );
  const [anioSeleccionadoMayor, setAnioSeleccionadoMayor] = useState(
    new Date().getFullYear(),
  );

  // Recargar datos cuando cambia de vista
  useEffect(() => {
    refetchAlumnos();
    refetchMovimientos();
  }, [location.pathname]);

  // Cargar Libro Mayor contable del alumno para el Drawer
  const handleAbrirLibroMayor = async (alumno) => {
    setAlumnoSeleccionadoMayor(alumno);
    setCargandoMayor(true);
    setMesSeleccionadoMayor(mesSeleccionado);
    setAnioSeleccionadoMayor(anioSeleccionado);
    try {
      const res = await ListarMovimientosApi(alumno.codigoSecuencial, {
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

  // Filtrar los movimientos del Libro Mayor en tiempo real
  const movimientosMayorFiltrados = useMemo(() => {
    return movimientosMayor.filter((mov) => {
      let m, y;
      if (
        mov.periodo &&
        typeof mov.periodo === "string" &&
        mov.periodo.includes("-")
      ) {
        const parts = mov.periodo.split("-");
        y = Number(parts[0]);
        m = Number(parts[1]) - 1;
      } else if (mov.fecha) {
        const fMov = new Date(mov.fecha);
        m = fMov.getMonth();
        y = fMov.getFullYear();
      } else {
        return true;
      }
      return (
        y === Number(anioSeleccionadoMayor) && m <= Number(mesSeleccionadoMayor)
      );
    });
  }, [movimientosMayor, mesSeleccionadoMayor, anioSeleccionadoMayor]);

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

  const formatARS = (val) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);
  };

  const columnasAlumnos = [
    {
      key: "codigoSecuencial",
      etiqueta: "ID",
      renderizar: (val) => (
        <span className="text-[10px] font-black text-black/30">{val}</span>
      ),
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
      etiqueta: "Saldo Contable (Base)",
      renderizar: (val) => (
        <div className="text-right font-bold text-slate-700">
          {formatARS(val)}
        </div>
      ),
    },
    {
      key: "totalIntereses",
      etiqueta: "Mora Acumulada",
      renderizar: (val) => (
        <div className="text-right font-bold text-rose-600">
          {val > 0 ? formatARS(val) : "-"}
        </div>
      ),
    },
    {
      key: "deudaConsolidada",
      etiqueta: "Deuda Consolidada",
      renderizar: (val) => (
        <div className="text-right font-black text-[13px] text-slate-900">
          {formatARS(val)}
        </div>
      ),
    },
    {
      key: "estado",
      etiqueta: "Estado",
      renderizar: (_, alumno) => (
        <div className="text-center">
          <span
            className={`inline-block px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${alumno.badgeStyle}`}
          >
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
      onClick: (alumno) => handlePagarCuota(alumno),
      mostrar: (alumno) => alumno.deudaConsolidada > 0,
    },
    {
      ...accionesReutilizables.verCuentaCorriente,
      label: "Ver Cuenta Corriente Contable",
      onClick: (alumno) => handleAbrirLibroMayor(alumno),
    },
    {
      ...accionesReutilizables.aumentarCuota,
      label: "Emitir Cuota individual",
      onClick: (alumno) => handleAbrirEmisionIndividual(alumno),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen text-black p-4">
      <EncabezadoSeccion
        ruta="CUENTAS CORRIENTES"
        icono={<CuotasIcono size={18} />}
      />

      <DataTable
        id_tabla="tabla-alumnos-ctacte"
        columnas={columnasAlumnos}
        datos={alumnosFiltradosPorEstado}
        loading={cargandoAlumnos}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Buscar por alumno, documento, curso..."
        meta={{
          total: total,
          currentPage: paginaActual,
          lastPage: paginas,
          prev: paginaActual > 1 ? paginaActual - 1 : null,
          next: paginaActual < paginas ? paginaActual + 1 : null,
        }}
        onPageChange={(page) => setPagina(page)}
        mostrarAcciones={true}
        acciones={accionesAlumnos}
        elementosSuperior={
          <div className="flex flex-wrap items-center gap-3">
            {/* Pestañas de Filtro de Estado */}
            <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl overflow-x-auto">
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

            {/* Select de Período */}
            <div className="flex items-center gap-2 bg-black/5 border border-black/5 rounded-xl px-3 py-1.5 justify-center">
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
          </div>
        }
        emptyMessage="No se encontraron cuentas corrientes con los filtros seleccionados"
        llaveTituloMobile="nombre"
      />

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
                      Sin registros contables en cuenta {codigoCtaCte}
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

                    {/* Filtro de Período Premium */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-4 rounded-xl border border-black/5">
                      <div className="flex items-center gap-2 bg-white border border-black/10 rounded-xl px-4 py-2 w-full sm:w-auto justify-center shadow-sm">
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider whitespace-nowrap">
                          Hasta el Período:
                        </span>
                        <select
                          value={mesSeleccionadoMayor}
                          onChange={(e) =>
                            setMesSeleccionadoMayor(Number(e.target.value))
                          }
                          className="bg-transparent border-none text-[12px] font-bold text-black/80 outline-none cursor-pointer focus:ring-0 py-0 pr-8 pl-1"
                        >
                          {meses.map((mes, idx) => (
                            <option key={idx} value={idx}>
                              {mes}
                            </option>
                          ))}
                        </select>
                        <select
                          value={anioSeleccionadoMayor}
                          onChange={(e) =>
                            setAnioSeleccionadoMayor(Number(e.target.value))
                          }
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
                    </div>

                    <div className="overflow-hidden border border-black/5 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black/[0.01] border-b border-black/5 text-[9px] font-black text-slate-700 uppercase tracking-wider select-none">
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
