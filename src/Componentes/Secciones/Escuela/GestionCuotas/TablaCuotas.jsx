import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEvolucionCuotas } from "../../../../Backend/Escuela/hooks/useEvolucionCuotas";
import { useResumenCuotas } from "../../../../Backend/Escuela/hooks/useResumenCuotas";
import { useConfiguracionCampos } from "../../../../Backend/Escuela/hooks/useConfiguracionCampos";
import { formatearARS } from "../../../../utils/formatearMoneda";
import ModalEmitirIndividual from "./ModalEmitirIndividual";
import ModalDeudaAlumno from "./ModalDeudaAlumno";
import ModalReglasCuota from "./ModalReglasCuota";
import ModalSeleccionarCobro from "./ModalSeleccionarCobro";
import DashboardCuotas from "./DashboardCuotas";
import { Package, Pin, ChevronLeft, ChevronRight } from "lucide-react";
import { InlineEnteFacturacion, InlineAtributo } from "../../Contactos/GestionContactos/ListaContactos";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { useAlertas } from "../../../../store/useAlertas";

const ChipEstado = ({ estado }) => {
  if (estado === "ABONADO") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        ABONADA
      </span>
    );
  }
  if (estado === "PARCIALMENTE_ABONADO") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        PARCIAL
      </span>
    );
  }
  if (estado === "VENCIDA") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        VENCIDA
      </span>
    );
  }
  if (estado === "ANULADO") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        ANULADA
      </span>
    );
  }
  if (estado === "EMITIDA") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        EMITIDA
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-200/60">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
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
 * `ModalDeudaAlumno.jsx` SÍ fue migrado a la fuente de verdad real
 * (`comprobantes.listarCuotasContacto`, sin pasar por asientos) — ver
 * progress/impl_cuotas-deudas-y-verificacion-cobrar.md. Recibe
 * `codigoCuentaContable` directamente (`cuentaSeleccionada.codigoSecuencial`),
 * no `asientos`.
 *
 * Bugfix puntual "reemitir tras anulación" (2026-07-12, ver
 * progress/impl_cuotas-reemitir-tras-anulacion.md): el botón "Emitir" se
 * habilita también cuando `fila.estado === "ANULADO"` (backend ya soporta
 * la reemisión, `VerificarCuotaPeriodo.casodeuso.ts` excluye
 * `estado: { not: "ANULADO" }` de la verificación de idempotencia). El chip
 * visual sigue mostrando "ANULADA" sin cambios (`ChipEstado`, no tocado).
 *
 * Ajuste de UX (2026-07-13, mismo patrón que `TablaCuotasSocios.jsx`): la
 * columna "Tipo" (`atributos.tipo_alumno`) pasó de read-only a edición
 * inline vía `InlineAtributo` + `useConfiguracionCampos("ALUM")`, en vez del
 * botón "Cambiar tipo" / `ModalCambioTipoAlumno.jsx` (eliminado, sin otro
 * consumidor). `useConfigCuota`/`formula`/`tipoOpciones` (solo usados por ese
 * modal) también se sacaron de `GestionCuotas.jsx` y de las props de este
 * componente.
 *
 * Optimización de performance (2026-07-14, PARTE 2/2 frontend, ver
 * progress/impl_cuotas-listado-performance-backend.md): `filas` ahora es
 * solo la página actual (20 filas, no todos los contactos). El estado de
 * `busqueda`/`pagina` vive en `GestionCuotas.jsx` (pasado como props acá) —
 * la búsqueda ya se resuelve en el backend (`cuotas.listar` con
 * `busqueda`).
 *
 * Optimización de performance, PARTE 3 (2026-07-14, ver
 * progress/impl_cuotas-listado-performance-backend.md): el filtro de Estado
 * (`filtroEstado`) ya NO se aplica acá en memoria — lo resuelve el backend
 * (`ListarCuotas.casodeuso.ts`, contabilidad-ms) sobre el universo COMPLETO
 * de contactos antes de paginar (ver `GestionCuotas.jsx`, que ahora pasa
 * `filtroEstado` directo a `useListarCuotas`). `filas` ya llega filtrada Y
 * paginada — este componente solo renderiza. `estadoMostrado` también lo
 * calcula el backend (mismo criterio exacto, sin duplicar lógica acá) y
 * viaja dentro de cada `fila`.
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
  busqueda = "",
  onCambiarBusqueda,
  pagina = 1,
  totalPaginas = 1,
  totalRegistros = 0,
  onCambiarPagina,
  mostrarDashboard = false,
}) => {
  const navigate = useNavigate();
  const [alumnoEmitirIndividual, setAlumnoEmitirIndividual] = useState(null);
  const [alumnoDeuda, setAlumnoDeuda] = useState(null);
  const [alumnoReglaContacto, setAlumnoReglaContacto] = useState(null);
  const [alumnoCobrarComprobante, setAlumnoCobrarComprobante] = useState(null);

  const { actualizarContacto } = useContactos();
  const { agregarAlerta } = useAlertas();

  // "Tipo" (atributos.tipo_alumno, LISTA) — config real vía
  // ConfiguracionCampoContacto (entidadClave="ALUM"), mismo patrón que
  // `useConfiguracionCampos("SOCI")`/`confTipoSocio` en TablaCuotasSocios.jsx.
  const { campos: camposAlumno } = useConfiguracionCampos("ALUM");
  const confTipoAlumno = camposAlumno.find((c) => c.claveCampo === "tipo_alumno");

  const handleActualizarContactoInline = async (codigo, payloadActualizado) => {
    try {
      // payloadActualizado ya es el delta exacto que arman los componentes
      // inline (InlineEnteFacturacion para "Tutor", InlineAtributo para
      // "Tipo") — no hace falta ninguna blacklist de campos, ni siquiera de
      // los agregados por el enriquecimiento de `filasEnriquecidas`.
      await actualizarContacto({ id: codigo, dto: payloadActualizado });
      agregarAlerta({
        title: "Actualizado",
        message: "Contacto actualizado correctamente.",
        type: "success",
      });
      refetch();
    } catch (error) {
      console.error("Error al actualizar contacto en línea:", error);
      agregarAlerta({
        title: "Error",
        message: "No se pudo actualizar el contacto.",
        type: "error",
      });
    }
  };

  // Bugfix "cuotas-evolucion-facturas-reales": evolución mensual real desde
  // Facturas (comprobantes-ms vía contabilidad-ms), reemplaza el cálculo
  // client-side sobre `asientosRaw` que quedó sin datos post
  // cuotas-rediseno-contable.
  const { evolucion: evolucionReal } = useEvolucionCuotas({
    codigoCuentaContable: cuentaSeleccionada?.codigoSecuencial,
    mes,
    anio,
  });

  // KPIs agregados del dashboard (universo completo, independiente de
  // `pagina`/`busqueda` — ver useResumenCuotas.js).
  const { resumen } = useResumenCuotas({
    codigoCuentaContable: cuentaSeleccionada?.codigoSecuencial,
    tipoEntidadObligado,
    mes,
    anio,
    codigoUnidadNegocio,
  });

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

      // Bugfix puntual "monto cuota tras anulación" (2026-07-24): si el
      // comprobante fue anulado (`estado === "ANULADO"`) no hay comprobante
      // real activo (mismo criterio que el botón "Emitir" arriba), así que
      // se prioriza `montoSugerido` (recalculado en vivo) por sobre el
      // `total` congelado del comprobante anulado.
      const monto =
        fila.estado === "ANULADO"
          ? fila.montoSugerido ?? 0
          : fila.total ?? fila.montoSugerido ?? 0;
      const totalDeuda = fila.saldoPendiente ?? 0;

      // `estadoMostrado` (PARTE 3): ya viene calculado por el backend
      // (`fila.estadoMostrado`, ver `ListarCuotas.casodeuso.ts`) — no se
      // recalcula acá, `...fila` ya lo incluye. Se mantiene el fallback a
      // `fila.estado` solo por robustez ante datos viejos en caché.
      return {
        ...fila,
        tipoAlumno,
        curso,
        nombreCompleto,
        tutorNombre,
        documentoAlumno,
        documentoTutor,
        estadoMostrado: fila.estadoMostrado ?? fila.estado,
        monto,
        totalDeuda,
      };
    });
  }, [filas]);

  if (!cuentaSeleccionada) {
    return (
      <div className="bg-white rounded-md border border-gray-200 py-20 flex flex-col items-center gap-3 text-gray-400 shadow-sm">
        <Package size={40} className="opacity-20" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
          Elegí un tipo de cuota para ver el listado
        </p>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
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
                  className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left"
                >
                  <div className="flex items-center gap-2">
                    {h}
                    {h === "Tipo" && (
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100">
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="px-5 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }


  return (
    <>
      {/* Dashboard: oculto por defecto, detrás del toggle "Ver métricas" del
          encabezado (R14, R17, R18) — los hooks que lo alimentan
          (useResumenCuotas/useEvolucionCuotas) siguen incondicionales. */}
      {mostrarDashboard && (
        <DashboardCuotas
          resumen={resumen}
          mes={mes}
          anio={anio}
          evolucionReal={evolucionReal}
        />
      )}

      {/* Buscador */}
      <div className="flex items-center gap-2 max-w-sm mb-4">
        <input
          type="text"
          placeholder="Buscar por alumno o tutor..."
          value={busqueda}
          onChange={(e) => onCambiarBusqueda?.(e.target.value)}
          className="w-full h-11 px-4 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
        />
        {busqueda && (
          <button
            onClick={() => onCambiarBusqueda?.("")}
            className="text-[10px] font-black text-gray-400 hover:text-rose-500 hover:bg-rose-50 uppercase tracking-widest cursor-pointer px-3 py-2 rounded-md transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {totalRegistros === 0 ? (
        <div className="bg-white rounded-md border border-gray-200 py-20 flex flex-col items-center gap-3 text-gray-400 shadow-sm">
          <Package size={40} className="opacity-20" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
            {busqueda ? "No se encontraron coincidencias" : "No hay alumnos registrados"}
          </p>
        </div>
      ) : (
      <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-max">
            <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">
                  Alumno
                </th>
                <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">
                  Tutor
                </th>
                <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">
                  Tipo
                </th>
                <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">
                  Curso
                </th>
                <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                  Monto Cuota
                </th>
                <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                  Estado
                </th>
                <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                  Saldo Pendiente
                </th>
                <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filasEnriquecidas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-[11px] font-black uppercase tracking-widest">
                    No se encontraron coincidencias
                  </td>
                </tr>
              ) : (
                filasEnriquecidas.map((fila) => (
                  <tr
                    key={fila.codigo}
                    className={`transition-colors ${
                      fila.estadoMostrado === "VENCIDA"
                        ? "bg-rose-50/30"
                        : "hover:bg-gray-50/80"
                    }`}
                    data-estado={fila.estadoMostrado}
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-gray-900 tracking-tight">
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
                    <td className="px-5 py-4 relative">
                      <div className="min-w-[120px]">
                        {confTipoAlumno ? (
                          <InlineAtributo
                            contacto={fila}
                            conf={confTipoAlumno}
                            onActualizar={handleActualizarContactoInline}
                          />
                        ) : (
                          <span className="text-xs font-semibold text-gray-500">
                            {fila.tipoAlumno || "—"}
                          </span>
                        )}
                      </div>
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
                            title="Regla de cuota fija activa"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-violet-50 text-violet-700 border border-violet-200/60"
                          >
                            <Pin size={10} />
                            Fija
                          </span>
                        )}
                        <span className="text-sm font-black text-gray-900 tracking-tight">
                          {formatearARS(fila.monto)}
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <ChipEstado estado={fila.estadoMostrado} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-base font-black text-rose-600 tracking-tight">
                        {formatearARS(fila.totalDeuda)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        {(fila.estado === "SIN_EMITIR" || fila.estado === "ANULADO") && (
                          <button
                            onClick={() => setAlumnoEmitirIndividual(fila)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200/60 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all cursor-pointer"
                          >
                            Emitir
                          </button>
                        )}
                        {fila.totalDeuda > 0 && (
                          <button
                            onClick={() => setAlumnoCobrarComprobante(fila)}
                            className="px-3 py-1.5 bg-[#1FAE6D] text-white border border-[#1FAE6D] rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-[#178F58] transition-all cursor-pointer"
                          >
                            Cobrar
                          </button>
                        )}
                        <button
                          onClick={() => setAlumnoDeuda(fila)}
                          className={`px-3 py-1.5 border rounded-md text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                            fila.tieneDeudaGlobal
                              ? 'bg-rose-50 text-rose-600 border-rose-200/60 hover:bg-rose-100 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {fila.tieneDeudaGlobal ? '¡Ver deudas!' : 'Historial'}
                        </button>
                        {(fila.estado === "ABONADO" || fila.estado === "PARCIALMENTE_ABONADO") && (
                          <button
                            title="Ver/anular Recibos"
                            onClick={() =>
                              navigate("/panel/comprobantes/listados", {
                                state: {
                                  tipoInicial: "RECIBO",
                                  busquedaInicial: fila.nombreCompleto,
                                },
                              })
                            }
                            className="px-3 py-1.5 bg-white text-gray-600 border border-gray-200 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all cursor-pointer"
                          >
                            Recibos
                          </button>
                        )}
                        <button
                          onClick={() => setAlumnoReglaContacto(fila)}
                          className={`px-3 py-1.5 border rounded-md text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                            fila.tieneReglaContacto
                              ? "bg-violet-50 text-violet-600 border-violet-200/60 hover:bg-violet-100"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
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

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="px-5 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between bg-gray-50/50 gap-4">
            <button
              disabled={pagina <= 1}
              onClick={() => onCambiarPagina?.(pagina - 1)}
              className="flex items-center gap-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(totalPaginas, 7) }, (_, i) => {
                let page = i + 1;
                if (totalPaginas > 7) {
                  if (pagina <= 4) page = i + 1;
                  else if (pagina >= totalPaginas - 3) page = totalPaginas - 6 + i;
                  else page = pagina - 3 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => onCambiarPagina?.(page)}
                    className={`w-9 h-9 rounded-md text-[13px] font-black transition-all cursor-pointer ${
                      page === pagina
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              disabled={pagina >= totalPaginas}
              onClick={() => onCambiarPagina?.(pagina + 1)}
              className="flex items-center gap-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Siguiente
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
      )}

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
