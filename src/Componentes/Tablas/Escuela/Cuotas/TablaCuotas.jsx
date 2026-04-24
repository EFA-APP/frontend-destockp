import {
  AlertCircle,
  Check,
  X,
  Search,
  MoreHorizontal,
  CreditCard,
  Receipt,
  Download,
  FileText,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import TarjetaMes from "../../../Secciones/Escuela/Cuotas/TarjetaMes";
import { DineroIcono } from "../../../../assets/Icons";

const estados = [
  { key: "todos", label: "Todos", color: "blue" },
  { key: "pagado", label: "Pagados", color: "emerald", icon: Check },
  { key: "pendiente", label: "Pendientes", color: "amber", icon: AlertCircle },
  { key: "vencido", label: "Vencidos", color: "rose", icon: X },
];

const TablaCuotas = ({
  alumnos = [],
  meses = [
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
  ],
  mesSeleccionado,
  setMesSeleccionado,
  busqueda,
  setBusqueda,
  cargando,
  precios,
  preciosMora,
}) => {
  const navigate = useNavigate();

  // Los alumnos ya vienen filtrados por el backend,
  // solo aseguramos que tengan la estructura esperada para el mes.
  const alumnosDelMes = useMemo(() => {
    return alumnos;
  }, [alumnos]);

  // Lista estática de cursos si no queremos recalcular
  const cursosDisponibles = [
    "1er Año",
    "2do Año",
    "3er Año",
    "4to Año",
    "5to Año",
    "6to Año",
  ];

  const handleLimpiarFiltros = () => {
    setBusqueda("");
  };

  const handlePagarCuota = (alumno, cuota) => {
    const mesNombre = meses[mesSeleccionado];
    const anio = new Date().getFullYear();
    const periodoStr = `${mesNombre} ${anio}`;

    const items = [
      {
        nombre: `CUOTA ESCOLAR - ${periodoStr.toUpperCase()}`,
        cantidad: 1,
        precioUnitario: cuota.monto - (cuota.interes || 0),
        tasaIva: 0,
        manual: true,
      },
    ];

    if (cuota.interes > 0) {
      items.push({
        nombre: `INTERESES POR MORA - ${periodoStr.toUpperCase()} (${cuota.diasAtraso} DÍAS)`,
        cantidad: 1,
        precioUnitario: cuota.interes,
        tasaIva: 0,
        manual: true,
      });
    }

    // Redirigir al POS con el estado
    navigate("/panel/ventas/comprobantes", {
      state: {
        cliente: alumno,
        itemsCobro: items,
        origen: "ESCUELA_CUOTAS",
        periodo: periodoStr,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 1. Selector de Meses */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-12 gap-2">
        {meses.slice(0, 12).map((nombre, idx) => (
          <TarjetaMes
            key={idx}
            index={idx}
            mes={nombre}
            activo={mesSeleccionado === idx}
            onClick={() => setMesSeleccionado(idx)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4 bg-white/[0.02] border border-black/5 p-5 rounded-2xl backdrop-blur-md shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Buscador Pro */}
            <div className="relative w-full md:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black/20 group-focus-within:text-[var(--primary)] ">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Nombre o curso..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-black/5 border border-black/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30  placeholder:text-black/10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="p-2.5 rounded-xl bg-orange-700/10 text-orange-400 border border-orange-700/20 hover:bg-orange-700/20  shrink-0 uppercase text-[11px] font-black tracking-widest px-4"
              >
                Limpiar Búsqueda
              </button>
            )}
          </div>
        </div>

        {/* Info de resultados */}
        <div className="flex items-center justify-between border-t border-black/5 pt-3">
          <div className="flex items-center gap-4 text-[12px] font-bold text-black/30 uppercase tracking-[0.2em]">
            <span>
              Mes:{" "}
              <span className="text-black/60">{meses[mesSeleccionado]}</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-black/10" />
            <span>
              Mostrando:{" "}
              <span className="text-[var(--primary)]">
                {alumnosDelMes.length}
              </span>{" "}
              de <span className="text-black/60">{alumnos.length}</span> alumnos
            </span>
          </div>
        </div>
      </div>

      {/* 3. Contenedor de la Tabla Premium */}
      <div className="overflow-hidden border border-black/5 rounded-xl bg-white/[0.01]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-white/[0.03] text-[12px] font-black text-black/60 uppercase tracking-[0.2em]">
                <th className="px-6 py-4 border-b border-black/5">
                  Alumno / Curso
                </th>
                <th className="px-6 py-4 border-b border-black/5">
                  Responsable de Pago
                </th>
                <th className="px-6 py-4 border-b border-black/5">
                  Monto de Cuota
                </th>
                <th className="px-6 py-4 border-b border-black/5 font-center">
                  Estado
                </th>
                <th className="px-6 py-4 border-b border-black/5">
                  Vencimiento
                </th>
                <th className="px-6 py-4 border-b border-black/5 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {cargando
                ? // --- SKELETON SCREEN ---
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className=" border-b border-black/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-black/5" />
                          <div className="flex flex-col gap-2">
                            <div className="h-3 w-32 bg-black/5 rounded" />
                            <div className="h-2 w-20 bg-black/5 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 w-40 bg-black/5 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-black/10 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-20 bg-black/5 rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 w-16 bg-black/5 rounded" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <div className="w-8 h-8 rounded-lg bg-black/5" />
                          <div className="w-8 h-8 rounded-lg bg-black/5" />
                        </div>
                      </td>
                    </tr>
                  ))
                : // --- FILAS REALES ---
                  alumnosDelMes.map((alumno) => {
                    const cuota = alumno.cuotas[mesSeleccionado];
                    const edo =
                      estados.find((e) => e.key === cuota.estado) || estados[2];

                    return (
                      <tr
                        key={alumno.id}
                        className="group hover:bg-white/[0.03]  relative"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-[12px] font-black">
                              {alumno.nombre.charAt(0)}
                              {alumno.apellido.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-black  uppercase">
                                  {alumno.nombre} {alumno.apellido}
                                </span>
                                {alumno.atributos?.tipo_alumno && (
                                  <span
                                    className={`text-[9px] px-1 rounded border font-black uppercase ${
                                      alumno.atributos.tipo_alumno === "INTERNO"
                                        ? "text-purple-400 border-purple-400/30 bg-purple-400/5"
                                        : "text-blue-400 border-blue-400/30 bg-blue-400/5"
                                    }`}
                                  >
                                    {alumno.atributos.tipo_alumno}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-black text-black/20 uppercase tracking-widest">
                                {alumno.curso}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            {alumno.enteFacturacion?.razonSocial ||
                            (alumno.enteFacturacion?.nombre &&
                              `${alumno.enteFacturacion.nombre} ${alumno.enteFacturacion.apellido}`) ? (
                              <span className="text-[12px] text-black/40 font-medium">
                                {alumno.enteFacturacion?.razonSocial ||
                                  `${alumno.enteFacturacion?.nombre?.toUpperCase()} ${alumno.enteFacturacion?.apellido?.toUpperCase()}`}
                              </span>
                            ) : alumno.enteFacturacion?.nombre ? (
                              <span className="text-[12px] text-black/40 font-medium">
                                {alumno.enteFacturacion.nombre?.toUpperCase()}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-black text-black">
                                $ {cuota.monto.toLocaleString("es-AR")}
                              </span>
                            </div>
                            {cuota.interes > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-black text-rose-400 uppercase">
                                  +{cuota.interes.toLocaleString("es-AR")} MORA
                                </span>
                              </div>
                            ) : (
                              // Si no hay interés pero es por que está bloqueado (aplicar_interes = false)
                              alumno.atributos?.aplicar_interes === false &&
                              cuota.estado !== "pagado" && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-black text-black/30 uppercase tracking-tighter">
                                    Mora Congelada
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border  ${
                              cuota.estado === "pagado"
                                ? "bg-emerald-700/10 text-emerald-400 border-emerald-700/20"
                                : cuota.estado === "vencido"
                                  ? "bg-rose-700/10 text-rose-400 border-rose-700/20"
                                  : "bg-amber-700/10 text-amber-400 border-amber-700/20"
                            }`}
                          >
                            <div
                              className={`w-1 h-1 rounded-full  ${
                                cuota.estado === "pagado"
                                  ? "bg-emerald-400"
                                  : cuota.estado === "vencido"
                                    ? "bg-rose-400"
                                    : "bg-amber-400"
                              }`}
                            />
                            {cuota.estado}
                            {cuota.estado === "vencido" &&
                              cuota.diasAtraso > 0 && (
                                <span className="ml-1 opacity-70">
                                  ({cuota.diasAtraso} días)
                                </span>
                              )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-black/70">
                              {cuota.fechaVencimiento}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 ">
                            {["pendiente", "vencido"].includes(cuota.estado) ? (
                              <button
                                onClick={() => handlePagarCuota(alumno, cuota)}
                                className="p-2 rounded-lg bg-emerald-700/10 text-emerald-400 hover:bg-emerald-700/20 border border-emerald-700/10  flex items-center justify-center"
                                title="Cobrar en Punto de Venta"
                              >
                                <DineroIcono size={14} />
                              </button>
                            ) : cuota.estado === "pagado" ? (
                              <>
                                {cuota.comprobante && (
                                  <button
                                    className="p-2 rounded-lg bg-blue-700/10 text-blue-400 hover:bg-blue-700/20 border border-blue-700/10 "
                                    title={`Ver Comprobante: ${cuota.referencia}`}
                                    onClick={() =>
                                      window.open(
                                        `/panel/ventas/comprobantes/ver/${cuota.comprobante.codigoSecuencial}`,
                                        "_blank",
                                      )
                                    }
                                  >
                                    <FileText size={14} />
                                  </button>
                                )}
                                <button className="p-2 rounded-lg bg-purple-700/10 text-purple-400 hover:bg-purple-700/20 border border-purple-700/10 ">
                                  <Download size={14} />
                                </button>
                              </>
                            ) : null}
                            <button className="p-2 rounded-lg bg-black/5 text-black/40 hover:bg-black/10 border border-black/5 ">
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {alumnosDelMes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01]">
            <Search size={48} className="text-black/5 mb-4" />
            <p className="text-sm font-black text-black/20 uppercase tracking-widest">
              No se encontraron resultados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TablaCuotas;
