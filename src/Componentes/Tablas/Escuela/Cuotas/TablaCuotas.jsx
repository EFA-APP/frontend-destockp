import { AlertCircle, Check, ChevronDown, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import {
  BuscadorIcono,
  ComprobanteIcono,
  DescargarIcono,
  PagosIcono,
} from "../../../../assets/Icons";
import { Link } from "react-router-dom";

const estados = [
  {
    key: "todos",
    label: "Todos",
    active: "bg-[var(--primary)]/30! cursor-block",
  },
  {
    key: "pagado",
    label: "Pagados",
    icon: Check,
    active: "bg-green-600/30! cursor-block",
  },
  {
    key: "pendiente",
    label: "Pendientes",
    icon: AlertCircle,
    active: "bg-yellow-600/30! cursor-block",
  },
  {
    key: "vencido",
    label: "Vencidos",
    icon: X,
    active: "bg-red-400/30! cursor-block",
  },
];

const tipoBotonoesFiltradoStyles = {
  todos:
    "bg-[var(--primary)]/20! text-[var(--primary)]! border-[var(--primary)]/30!",
  pagado: "bg-green-500/20! text-green-400! border-green-400/30!",
  pendiente: "bg-yellow-500/20! text-yellow-400! border-yellow-400/30!",
  vencido: "bg-red-500/20! text-red-400! border-red-400/30!",
};

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
  onRegistrarPago,
  onGenerarRecibo,
}) => {
  const [mesExpandido, setMesExpandido] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // Colores por estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pagado":
        return "bg-green-500/20! text-green-400! border-green-400/30!";
      case "pendiente":
        return "bg-yellow-500/20! text-yellow-400! border-yellow-400/30!";
      case "vencido":
        return "bg-red-500/20! text-red-400! border-red-400/30!";
      default:
        return "bg-grey-500/20! text-grey-400! border-grey-400/30!";
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "pagado":
        return <Check className="w-4 h-4" />;
      case "pendiente":
        return <AlertCircle className="w-4 h-4" />;
      case "vencido":
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Calcular estadísticas por mes
  const getEstadisticasMes = (mesIndex) => {
    let pagados = 0,
      pendientes = 0,
      vencidos = 0,
      totalRecaudado = 0;

    alumnos.forEach((alumno) => {
      const cuota = alumno.cuotas?.[mesIndex];
      if (cuota) {
        if (cuota.estado === "pagado") {
          pagados++;
          totalRecaudado += cuota.monto || 0;
        } else if (cuota.estado === "pendiente") {
          pendientes++;
        } else if (cuota.estado === "vencido") {
          vencidos++;
        }
      }
    });

    return { pagados, pendientes, vencidos, totalRecaudado };
  };

  // Filtrar alumnos por mes y estado
  const alumnosFiltrados = (mesIndex) => {
    return alumnos.filter((alumno) => {
      const cuota = alumno.cuotas?.[mesIndex];
      if (!cuota) return false;

      // Filtro por búsqueda
      const textoBusqueda = busqueda.toLowerCase();
      const coincideBusqueda =
        alumno.nombre.toLowerCase().includes(textoBusqueda) ||
        alumno.apellido.toLowerCase().includes(textoBusqueda) ||
        alumno.curso.toLowerCase().includes(textoBusqueda);

      if (!coincideBusqueda) return false;

      // Filtro por estado
      if (filtroEstado === "todos") return true;
      return cuota.estado === filtroEstado;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="bg-[var(--fill)] rounded-md shadow-sm p-4">
        <div className="flex flex-col gap-4">
          {/* Título */}
          <div>
            <h2 className="text-2xl font-bold text-white">Gestión de Cuotas</h2>
            <p className="text-sm text-gray-400">
              Administra los pagos mensuales por alumno
            </p>
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="border-[.5px] border-gray-100/10 flex h-10 rounded-md! w-full pl-10 pr-4 
                bg-[var(--fill)] text-white placeholder:text-gray-400 
                focus:outline-none focus:border-2 focus:border-[var(--primary)] shadow-md"
              placeholder="Buscar alumno por nombre o curso..."
            />
            <div className="absolute top-2.5 left-3">
              <BuscadorIcono />
            </div>
          </div>

          {/* Filtros de estado */}
          <div className="flex flex-wrap gap-2">
            {estados.map(({ key, label, icon: Icon, active }) => (
              <button
                key={key}
                onClick={() => setFiltroEstado(key)}
                className={`cursor-pointer border px-4 py-2 rounded-md! font-medium transition-colors text-sm flex items-center gap-2 ${
                  tipoBotonoesFiltradoStyles[key]
                } ${filtroEstado === key ? active : ""}`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de meses expandibles */}
      <div className="bg-[var(--fill)] rounded-md shadow-md overflow-hidden">
        <div className="divide-y divide-gray-700/30">
          {meses.slice(0, 6).map((mes, index) => {
            const stats = getEstadisticasMes(index);
            const isExpanded = mesExpandido === index;
            const alumnosDelMes = alumnosFiltrados(index);

            return (
              <div
                key={index}
                className="border-b border-gray-700/30 last:border-b-0"
              >
                {/* Fila del Mes - Clickeable */}
                <div
                  onClick={() => setMesExpandido(isExpanded ? null : index)}
                  className="flex items-center justify-between p-4 hover:bg-gray-700/20 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[var(--primary)]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {mes} 2024
                      </h3>
                      <p className="text-xs text-gray-400">
                        Recaudado: $
                        {stats.totalRecaudado.toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>

                  {/* Badges de estadísticas */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">
                        {stats.pagados}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">
                        {stats.pendientes}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full border border-red-500/30">
                      <X className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-red-400">
                        {stats.vencidos}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detalle de Alumnos - Expandible */}
                {isExpanded && (
                  <div className="bg-[var(--fill2)] border-t border-gray-700/30">
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b border-gray-700/50">
                            <tr>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                                Alumno
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                                Curso
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                                Monto
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                                Estado
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                                Vencimiento
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                                Fecha de Pago
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {alumnosDelMes.map((alumno) => {
                              const cuota = alumno.cuotas[index];
                              return (
                                <tr
                                  key={alumno.id}
                                  className="border-b border-gray-700/30 hover:bg-gray-700/10 transition-colors"
                                >
                                  <td className="py-3 px-4">
                                    <div className="text-sm text-white font-medium">
                                      {alumno.nombre} {alumno.apellido}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-300">
                                    {alumno.curso}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-white font-mono font-semibold">
                                    $
                                    {cuota.monto?.toLocaleString("es-AR") ||
                                      "0"}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span
                                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(
                                        cuota.estado
                                      )}`}
                                    >
                                      {getEstadoIcon(cuota.estado)}
                                      {cuota.estado.charAt(0).toUpperCase() +
                                        cuota.estado.slice(1)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-300">
                                    {cuota.fechaVencimiento || "-"}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-300">
                                    {cuota.fechaPago || "-"}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex gap-2">
                                      {cuota.estado !== "pagado" && (
                                        <Link
                                          to={"/panel/escuela/recibos/nuevo"}
                                          className="p-1 text-green-400! rounded-md! bg-green-500/10! flex items-center gap-2 cursor-pointer hover:bg-green-400/5!"
                                        >
                                          <PagosIcono size={24} />
                                        </Link>
                                      )}
                                      {cuota.estado === "pagado" && (
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() =>
                                              onGenerarRecibo?.(
                                                alumno.id,
                                                index
                                              )
                                            }
                                            className="p-1 text-blue-400! rounded-md! bg-blue-500/10! flex items-center gap-2 cursor-pointer hover:bg-blue-400/5!"
                                          >
                                            <ComprobanteIcono size={20} />
                                          </button>

                                          <button
                                            onClick={() =>
                                              onGenerarRecibo?.(
                                                alumno.id,
                                                index
                                              )
                                            }
                                            className="p-1 text-purple-400! rounded-md! bg-purple-500/10! flex items-center gap-2 cursor-pointer hover:bg-purple-400/5!"
                                          >
                                            <DescargarIcono size={18} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {alumnosDelMes.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <p>
                              No hay alumnos que coincidan con los filtros en{" "}
                              {mes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen Total */}
      <div className="bg-[var(--fill)] rounded-md shadow-md p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Resumen General
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-green-400">
                Cuotas Pagadas
              </span>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {alumnos.reduce(
                (sum, a) =>
                  sum +
                  Object.values(a.cuotas || {}).filter(
                    (c) => c.estado === "pagado"
                  ).length,
                0
              )}
            </p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">
                Cuotas Pendientes
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">
              {alumnos.reduce(
                (sum, a) =>
                  sum +
                  Object.values(a.cuotas || {}).filter(
                    (c) => c.estado === "pendiente"
                  ).length,
                0
              )}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <X className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                Cuotas Vencidas
              </span>
            </div>
            <p className="text-2xl font-bold text-red-400">
              {alumnos.reduce(
                (sum, a) =>
                  sum +
                  Object.values(a.cuotas || {}).filter(
                    (c) => c.estado === "vencido"
                  ).length,
                0
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablaCuotas;
