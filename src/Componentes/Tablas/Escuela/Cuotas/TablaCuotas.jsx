import {
  AlertCircle,
  Check,
  X,
  Search,
  MoreHorizontal,
  CreditCard,
  Receipt,
  Download,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
  onGenerarRecibo,
}) => {
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const alumnosDelMes = useMemo(() => {
    return alumnos.filter((alumno) => {
      const cuota = alumno.cuotas?.[mesSeleccionado];
      if (!cuota) return false;

      const texto = busqueda.toLowerCase();
      const coincideBusqueda =
        (alumno.nombre?.toLowerCase() || "").includes(texto) ||
        (alumno.apellido?.toLowerCase() || "").includes(texto) ||
        (alumno.atributos?.curso?.toLowerCase() || "").includes(texto);

      if (!coincideBusqueda) return false;
      if (filtroEstado === "todos") return true;
      return cuota.estado === filtroEstado;
    });
  }, [alumnos, mesSeleccionado, filtroEstado, busqueda]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 1. Selector de Meses (Grid de Tarjetas) */}
      {/* 1. Selector de Meses (Sleek Horizontal/Grid Selector) */}
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

      {/* 2. Barra de Herramientas de la Tabla */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-xl backdrop-blur-sm">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/20 group-focus-within:text-[var(--primary)] transition-colors">
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, curso o responsable..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all placeholder:text-white/20 uppercase tracking-widest"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {estados.map((e) => (
            <button
              key={e.key}
              onClick={() => setFiltroEstado(e.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                filtroEstado === e.key
                  ? `bg-${e.color}-500/20 text-${e.color}-400 border-${e.color}-500/30 shadow-lg shadow-${e.color}-500/10`
                  : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
              }`}
            >
              {e.icon && <e.icon size={12} />}
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Contenedor de la Tabla Premium */}
      <div className="overflow-hidden border border-white/5 rounded-xl bg-white/[0.01]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-white/[0.03] text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
                <th className="px-6 py-4 border-b border-white/5">
                  Alumno / Curso
                </th>
                <th className="px-6 py-4 border-b border-white/5">
                  Responsable de Pago
                </th>
                <th className="px-6 py-4 border-b border-white/5">
                  Monto de Cuota
                </th>
                <th className="px-6 py-4 border-b border-white/5 font-center">
                  Estado
                </th>
                <th className="px-6 py-4 border-b border-white/5">
                  Vencimiento
                </th>
                <th className="px-6 py-4 border-b border-white/5 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {alumnosDelMes.map((alumno) => {
                const cuota = alumno.cuotas[mesSeleccionado];
                const edo =
                  estados.find((e) => e.key === cuota.estado) || estados[2];

                return (
                  <tr
                    key={alumno.id}
                    className="group hover:bg-white/[0.03] transition-colors relative"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-[10px] font-black">
                          {alumno.nombre.charAt(0)}
                          {alumno.apellido.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-[var(--primary)] transition-colors uppercase">
                              {alumno.nombre} {alumno.apellido}
                            </span>
                            {alumno.atributos?.tipo_alumno && (
                              <span
                                className={`text-[7px] px-1 rounded border font-black uppercase ${
                                  alumno.atributos.tipo_alumno === "interno"
                                    ? "text-purple-400 border-purple-400/30 bg-purple-400/5"
                                    : "text-blue-400 border-blue-400/30 bg-blue-400/5"
                                }`}
                              >
                                {alumno.atributos.tipo_alumno}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
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
                          <span className="text-[10px] text-white/40 font-medium">
                            {alumno.enteFacturacion?.razonSocial ||
                              `${alumno.enteFacturacion?.nombre?.toUpperCase()} ${alumno.enteFacturacion?.apellido?.toUpperCase()}`}
                          </span>
                        ) : alumno.enteFacturacion?.nombre ? (
                          <span className="text-[10px] text-white/40 font-medium">
                            {alumno.enteFacturacion.nombre?.toUpperCase()}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-black text-white">
                            ${" "}
                            {(
                              cuota.monto + (cuota.interes || 0)
                            ).toLocaleString("es-AR")}
                          </span>
                        </div>
                        {cuota.interes > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black text-rose-400">
                              -{cuota.interes.toLocaleString("es-AR")} MORA
                            </span>
                            <span className="text-[8px] text-white/70">
                              ({cuota.diasAtraso} días)
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                          cuota.estado === "pagado"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : cuota.estado === "vencido"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        <div
                          className={`w-1 h-1 rounded-full animate-pulse ${
                            cuota.estado === "pagado"
                              ? "bg-emerald-400"
                              : cuota.estado === "vencido"
                                ? "bg-rose-400"
                                : "bg-amber-400"
                          }`}
                        />
                        {cuota.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/70">
                          {cuota.fechaVencimiento}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 transition-opacity">
                        {cuota.estado !== "pagado" ? (
                          <Link
                            to="/panel/escuela/recibos/nuevo"
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all"
                          >
                            <DineroIcono size={14} />
                          </Link>
                        ) : (
                          <>
                            <button className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/10 transition-all">
                              <Receipt size={14} />
                            </button>
                            <button className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/10 transition-all">
                              <Download size={14} />
                            </button>
                          </>
                        )}
                        <button className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 border border-white/5 transition-all">
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
            <Search size={48} className="text-white/5 mb-4" />
            <p className="text-sm font-black text-white/20 uppercase tracking-widest">
              No se encontraron resultados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TablaCuotas;
