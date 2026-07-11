import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useListarAsientosQuery } from "../../../../Backend/Contabilidad/queries/useAsientos.query";
import { formatearARS } from "../../../../utils/formatearMoneda";
import ModalEmitirIndividual from "./ModalEmitirIndividual";
import ModalDeudaAlumno from "./ModalDeudaAlumno";
import ModalCambioTipoAlumno from "./ModalCambioTipoAlumno";
import ModalReglasCuota from "./ModalReglasCuota";
import ModalSeleccionarCobro from "./ModalSeleccionarCobro";
import DashboardCuotas from "./DashboardCuotas";
import { Package, Pin } from "lucide-react";
import { InlineEnteFacturacion } from "../../Contactos/GestionContactos/ListaContactos";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { useAlertas } from "../../../../store/useAlertas";

const ChipEstado = ({ estado }) => {
  if (estado === "ABONADO") {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
        ABONADO
      </span>
    );
  }
  if (estado === "PARCIALMENTE_ABONADO") {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200">
        PARCIAL
      </span>
    );
  }
  if (estado === "VENCIDA") {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-700 border border-rose-200">
        VENCIDA
      </span>
    );
  }
  if (estado === "ANULADO") {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-gray-200 text-gray-600 border border-gray-300">
        ANULADA
      </span>
    );
  }
  if (estado === "EMITIDA") {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
        EMITIDA
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-[var(--fill-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
      SIN EMITIR
    </span>
  );
};

/**
 * R99, R100, R107, R108: reemplaza el cálculo de estado basado en
 * `useListarAsientosQuery` + `calcularEstadoCuota` por `filas` ya armadas
 * en `GestionCuotas.jsx` a partir de `cuotas.listar` (estado real del
 * comprobante). "VENCIDA" se sigue derivando acá mismo (R97), a partir de
 * `estado` + `fechaVto`.
 *
 * `ModalCambioTipoAlumno.jsx` quedó FUERA de alcance explícito de esta
 * sesión (no está en la lista de archivos de `design.md` §8) — se le sigue
 * pasando `asientos` (mecanismo viejo, `origenModulo: "ESCUELA"`) solo para
 * no romper su funcionamiento actual. Limitación documentada: ese modal no
 * va a reflejar cuotas emitidas con el mecanismo NUEVO (que no tagea
 * `origenModulo`/`referencia`), solo el historial viejo — ver
 * progress/impl_cuotas-rediseno-contable.md.
 *
 * `ModalDeudaAlumno.jsx` SÍ fue migrado a la fuente de verdad real
 * (`comprobantes.listarCuotasContacto`, sin pasar por asientos) — ver
 * progress/impl_cuotas-deudas-y-verificacion-cobrar.md. Recibe
 * `codigoCuentaContable` directamente (`cuentaSeleccionada.codigoSecuencial`),
 * no `asientos`.
 */
const TablaCuotas = ({
  filas,
  cargando,
  cuentaSeleccionada,
  tipoEntidadObligado,
  mes,
  anio,
  codigoUnidadNegocio,
  refetch,
  formula,
  tipoOpciones = [],
}) => {
  const { usuario } = useAuthStore();
  const navigate = useNavigate();
  const [alumnoEmitirIndividual, setAlumnoEmitirIndividual] = useState(null);
  const [alumnoDeuda, setAlumnoDeuda] = useState(null);
  const [alumnoCambioTipo, setAlumnoCambioTipo] = useState(null);
  const [alumnoReglaContacto, setAlumnoReglaContacto] = useState(null);
  const [alumnoCobrarComprobante, setAlumnoCobrarComprobante] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  const { actualizarContacto } = useContactos();
  const { agregarAlerta } = useAlertas();

  const handleActualizarContactoInline = async (codigo, payloadActualizado) => {
    try {
      const {
        codigoEmpresa,
        codigo: _,
        fechaCreacion,
        updatedAt,
        estado,
        tipoAlumno,
        curso,
        monto,
        montoSugerido,
        tieneReglaContacto,
        totalDeuda,
        nombreCompleto,
        tutorNombre,
        documentoAlumno,
        documentoTutor,
        codigoComprobante,
        puntoVenta,
        numeroComprobante,
        total,
        saldoPendiente,
        fechaVto,
        ...dtoLimpio
      } = payloadActualizado;

      await actualizarContacto({ id: codigo, dto: dtoLimpio });
      agregarAlerta({
        title: "Actualizado",
        message: "Tutor actualizado correctamente.",
        type: "success",
      });
      refetch();
    } catch (error) {
      console.error("Error al actualizar contacto en línea:", error);
      agregarAlerta({
        title: "Error",
        message: "No se pudo actualizar el tutor.",
        type: "error",
      });
    }
  };

  const hoy = new Date();
  const hoyNormalizado = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  // Solo para no romper ModalDeudaAlumno.jsx/ModalCambioTipoAlumno.jsx (ver
  // nota arriba) — NO se usa para calcular el estado mostrado en esta tabla.
  const { data: asientosRaw = [] } = useListarAsientosQuery(
    usuario?.codigoEmpresa
      ? {
          codigoEmpresa: usuario.codigoEmpresa,
          origenModulo: "ESCUELA",
        }
      : {},
  );

  const filasEnriquecidas = useMemo(() => {
    return filas.map((fila) => {
      const tipoAlumno = fila.atributos?.tipo_alumno ?? "";
      const curso = fila.atributos?.curso ?? "";
      const nombreCompleto =
        fila.razonSocial || `${fila.nombre ?? ""} ${fila.apellido ?? ""}`.trim();
      const ef = fila.enteFacturacion;
      const tutorNombre = ef ? `${ef.nombre ?? ""} ${ef.apellido ?? ""}`.trim() : "";
      const documentoAlumno = fila.documento ?? "";
      const documentoTutor = ef?.documento ?? "";

      let estadoMostrado = fila.estado;
      if (
        (fila.estado === "PENDIENTE_PAGO" || fila.estado === "PARCIALMENTE_ABONADO") &&
        fila.fechaVto &&
        new Date(fila.fechaVto) < hoyNormalizado
      ) {
        estadoMostrado = "VENCIDA";
      } else if (fila.estado === "PENDIENTE_PAGO") {
        estadoMostrado = "EMITIDA";
      }

      const monto = fila.total ?? fila.montoSugerido ?? 0;
      const totalDeuda = fila.saldoPendiente ?? 0;

      return {
        ...fila,
        tipoAlumno,
        curso,
        nombreCompleto,
        tutorNombre,
        documentoAlumno,
        documentoTutor,
        estadoMostrado,
        monto,
        totalDeuda,
      };
    });
  }, [filas, hoyNormalizado]);

  const filasFiltradas = useMemo(() => {
    if (!filtroBusqueda.trim()) return filasEnriquecidas;
    const query = filtroBusqueda.toLowerCase().trim();
    return filasEnriquecidas.filter(
      (f) =>
        f.nombreCompleto?.toLowerCase().includes(query) ||
        f.tutorNombre?.toLowerCase().includes(query) ||
        f.documentoAlumno?.toLowerCase().includes(query) ||
        f.documentoTutor?.toLowerCase().includes(query)
    );
  }, [filasEnriquecidas, filtroBusqueda]);

  if (!cuentaSeleccionada) {
    return (
      <div className="bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] py-20 flex flex-col items-center gap-3 text-[var(--text-muted)]">
        <Package size={40} className="opacity-20" />
        <p className="text-[13px] font-bold uppercase tracking-widest">
          Elegí un tipo de cuota para ver el listado
        </p>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-[var(--fill-secondary)]">
            <tr>
              {[
                "Alumno",
                "Tutor",
                "Tipo",
                "Curso",
                "Monto Cuota",
                "Estado",
                "Saldo Pendiente",
                "Acciones",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--border-subtle)]">
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-black/5 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (filasEnriquecidas.length === 0) {
    return (
      <div className="bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] py-20 flex flex-col items-center gap-3 text-[var(--text-muted)]">
        <Package size={40} className="opacity-20" />
        <p className="text-[13px] font-bold uppercase tracking-widest">
          No hay alumnos registrados
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard */}
      <DashboardCuotas
        filas={filasEnriquecidas.map((f) => ({ ...f, estado: f.estadoMostrado }))}
        mes={mes}
        anio={anio}
        asientosRaw={asientosRaw}
      />

      {/* Buscador */}
      <div className="flex items-center gap-2 max-w-sm mb-4">
        <input
          type="text"
          placeholder="Buscar por alumno o tutor..."
          value={filtroBusqueda}
          onChange={(e) => setFiltroBusqueda(e.target.value)}
          className="w-full text-sm px-4 py-2.5 border border-[var(--border-subtle)] bg-white text-gray-800 rounded-md outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all font-semibold placeholder:text-gray-400 placeholder:font-medium shadow-sm"
        />
        {filtroBusqueda && (
          <button
            onClick={() => setFiltroBusqueda("")}
            className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest cursor-pointer px-2 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[var(--border-subtle)] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-max">
            <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left">
                  Alumno
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left">
                  Tutor
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left">
                  Tipo
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left">
                  Curso
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                  Monto Cuota
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                  Estado
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                  Saldo Pendiente
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[var(--text-muted)] text-[12px] font-bold uppercase tracking-widest">
                    No se encontraron coincidencias
                  </td>
                </tr>
              ) : (
                filasFiltradas.map((fila) => (
                  <tr
                    key={fila.codigo}
                    className={`transition-colors group ${
                      fila.estadoMostrado === "VENCIDA"
                        ? "border-l-4 border-l-rose-500 bg-rose-50/30"
                        : "hover:bg-gray-50/80"
                    }`}
                    data-estado={fila.estadoMostrado}
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-gray-800">
                          {fila.nombreCompleto ||
                            `Alumno #${fila.codigo}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 relative">
                      <div className="min-w-[150px]">
                        <InlineEnteFacturacion
                          contacto={fila}
                          onActualizar={handleActualizarContactoInline}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-gray-500">
                        {fila.tipoAlumno || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-gray-500">
                        {fila.curso || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center justify-end gap-1.5">
                        {fila.tieneReglaContacto && (
                          <span
                            title="Regla de cuota fija (por contacto) activa para este alumno"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-violet-100 text-violet-700 border border-violet-200"
                          >
                            <Pin size={10} />
                            Fija
                          </span>
                        )}
                        <span className="text-sm font-bold text-gray-700">
                          {formatearARS(fila.monto)}
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <ChipEstado estado={fila.estadoMostrado} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-base font-black text-rose-600">
                        {formatearARS(fila.totalDeuda)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        {fila.estado === "SIN_EMITIR" && (
                          <button
                            onClick={() => setAlumnoEmitirIndividual(fila)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-all cursor-pointer"
                          >
                            Emitir
                          </button>
                        )}
                        {fila.totalDeuda > 0 && (
                          <button
                            onClick={() => setAlumnoCobrarComprobante(fila)}
                            className="px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--primary)]/20 transition-all cursor-pointer"
                          >
                            Cobrar
                          </button>
                        )}
                        <button
                          onClick={() => setAlumnoDeuda(fila)}
                          className="px-3 py-1.5 bg-white text-gray-600 border border-[var(--border-subtle)] rounded text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          Ver deudas
                        </button>
                        {(fila.estado === "ABONADO" || fila.estado === "PARCIALMENTE_ABONADO") && (
                          <button
                            title="Ver/anular el Recibo que cobró esta cuota (R89/R107)"
                            onClick={() =>
                              navigate("/panel/comprobantes/listados", {
                                state: {
                                  tipoInicial: "RECIBO",
                                  busquedaInicial: fila.nombreCompleto,
                                },
                              })
                            }
                            className="px-3 py-1.5 bg-white text-gray-600 border border-[var(--border-subtle)] rounded text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all cursor-pointer"
                          >
                            Recibos
                          </button>
                        )}
                        <button
                          onClick={() => setAlumnoCambioTipo(fila)}
                          className="px-3 py-1.5 bg-white text-gray-600 border border-[var(--border-subtle)] rounded text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          Cambiar tipo
                        </button>
                        <button
                          onClick={() => setAlumnoReglaContacto(fila)}
                          className={`px-3 py-1.5 border rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                            fila.tieneReglaContacto
                              ? "bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100"
                              : "bg-white text-gray-600 border-[var(--border-subtle)] hover:bg-gray-50"
                          }`}
                        >
                          Cuota fija
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {alumnoEmitirIndividual && (
        <ModalEmitirIndividual
          fila={alumnoEmitirIndividual}
          cuenta={cuentaSeleccionada}
          tipoEntidadObligado={tipoEntidadObligado}
          mes={mes}
          anio={anio}
          codigoUnidadNegocio={codigoUnidadNegocio}
          onClose={() => setAlumnoEmitirIndividual(null)}
          onExito={() => {
            setAlumnoEmitirIndividual(null);
            refetch();
          }}
        />
      )}

      {alumnoDeuda && (
        <ModalDeudaAlumno
          alumno={alumnoDeuda}
          codigoCuentaContable={cuentaSeleccionada?.codigoSecuencial}
          onClose={() => setAlumnoDeuda(null)}
        />
      )}

      {alumnoCambioTipo && (
        <ModalCambioTipoAlumno
          alumno={alumnoCambioTipo}
          formula={formula}
          tipoOpciones={tipoOpciones}
          mes={mes}
          anio={anio}
          asientos={asientosRaw}
          onClose={() => setAlumnoCambioTipo(null)}
          onExito={() => {
            setAlumnoCambioTipo(null);
            refetch();
          }}
        />
      )}

      {alumnoReglaContacto && (
        <ModalReglasCuota
          cuenta={cuentaSeleccionada}
          codigoContactoInicial={alumnoReglaContacto.codigo}
          nombreContactoInicial={alumnoReglaContacto.nombreCompleto}
          onClose={() => {
            setAlumnoReglaContacto(null);
            refetch();
          }}
        />
      )}

      {alumnoCobrarComprobante && (
        <ModalSeleccionarCobro
          alumno={alumnoCobrarComprobante}
          onClose={() => setAlumnoCobrarComprobante(null)}
        />
      )}
    </>
  );
};

export default TablaCuotas;
