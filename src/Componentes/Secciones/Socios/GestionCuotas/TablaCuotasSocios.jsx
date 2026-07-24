import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEvolucionCuotas } from "../../../../Backend/Escuela/hooks/useEvolucionCuotas";
import { useResumenCuotas } from "../../../../Backend/Escuela/hooks/useResumenCuotas";
import { useConfiguracionCampos } from "../../../../Backend/Escuela/hooks/useConfiguracionCampos";
import { formatearARS } from "../../../../utils/formatearMoneda";
import ModalEmitirIndividual from "../../Escuela/GestionCuotas/ModalEmitirIndividual";
import ModalDeudaAlumno from "../../Escuela/GestionCuotas/ModalDeudaAlumno";
import ModalReglasCuota from "../../Escuela/GestionCuotas/ModalReglasCuota";
import ModalSeleccionarCobro from "../../Escuela/GestionCuotas/ModalSeleccionarCobro";
import DashboardCuotas from "../../Escuela/GestionCuotas/DashboardCuotas";
import { Package, Pin, ChevronLeft, ChevronRight } from "lucide-react";
import { InlineAtributo } from "../../Contactos/GestionContactos/ListaContactos";
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
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-600 border border-gray-200/60">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      SIN EMITIR
    </span>
  );
};

/**
 * Tabla de cuotas de Socios (feature 21, socios-gestion-cuotas).
 *
 * Paralela a `TablaCuotas.jsx` (Escuela/Alumnos), SIN heredar de ella
 * (R5): columnas Socio / Documento / Monto Cuota / Estado / Saldo
 * Pendiente / Acciones, sin "Tutor"/"Tipo"/"Curso" (R6) y SIN el botón
 * "Cambiar tipo"/`ModalCambioTipoAlumno.jsx` (R6, atado a
 * `atributos.tipo_alumno`, sin equivalente para Socios).
 *
 * Reutiliza sin modificarlos (R3, R7): `ModalEmitirIndividual.jsx`,
 * `ModalSeleccionarCobro.jsx`, `ModalDeudaAlumno.jsx`,
 * `ModalReglasCuota.jsx` y `DashboardCuotas.jsx` (aceptando el rótulo
 * cosmético "Estado Alumnos" en este último, ver R18).
 *
 * Optimización de performance (2026-07-14, PARTE 2/2 frontend, ver
 * progress/impl_cuotas-listado-performance-backend.md): mismo cambio que
 * `TablaCuotas.jsx` — `filas` ahora es solo la página actual, la búsqueda
 * ya se resuelve en el backend.
 *
 * Optimización de performance, PARTE 3 (2026-07-14, ver
 * progress/impl_cuotas-listado-performance-backend.md): el filtro de Estado
 * ya NO se aplica acá en memoria — lo resuelve el backend
 * (`ListarCuotas.casodeuso.ts`, contabilidad-ms) sobre el universo COMPLETO
 * antes de paginar (ver `GestionCuotasSocios.jsx`). `filas` ya llega
 * filtrada Y paginada; `estadoMostrado` también lo calcula el backend
 * (mismo criterio exacto) y viaja dentro de cada `fila`.
 */
const TablaCuotasSocios = ({
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
  const [socioEmitirIndividual, setSocioEmitirIndividual] = useState(null);
  const [socioDeuda, setSocioDeuda] = useState(null);
  const [socioReglaContacto, setSocioReglaContacto] = useState(null);
  const [socioCobrarComprobante, setSocioCobrarComprobante] = useState(null);

  const { actualizarContacto } = useContactos();
  const { agregarAlerta } = useAlertas();

  // "Tipo de socio" (atributos.tipo_socio, LISTA) — config real vía
  // ConfiguracionCampoContacto (entidadClave="SOCI"), sin cambios de código
  // si en el futuro cambian sus opciones.
  const { campos: camposSocio } = useConfiguracionCampos("SOCI");
  const confTipoSocio = camposSocio.find((c) => c.claveCampo === "tipo_socio");

  const handleActualizarContactoInline = async (codigo, payloadActualizado) => {
    try {
      // payloadActualizado ya es el delta exacto que arma InlineAtributo
      // (único componente inline usado en esta tabla) — no hace falta
      // ninguna blacklist de campos.
      await actualizarContacto({ id: codigo, dto: payloadActualizado });
      agregarAlerta({
        title: "Actualizado",
        message: "Tipo de socio actualizado correctamente.",
        type: "success",
      });
      refetch();
    } catch (error) {
      console.error("Error al actualizar contacto en línea:", error);
      agregarAlerta({
        title: "Error",
        message: "No se pudo actualizar el tipo de socio.",
        type: "error",
      });
    }
  };

  // R3: evolución mensual real (Facturas de cuota reales), mismo hook que
  // TablaCuotas.jsx, parametrizado por la cuenta de Socios seleccionada.
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
      const nombreCompleto =
        fila.razonSocial || `${fila.nombre ?? ""} ${fila.apellido ?? ""}`.trim();
      const documentoSocio = fila.documento ?? "";

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
      // recalcula acá, `...fila` ya lo incluye. Fallback a `fila.estado`
      // solo por robustez ante datos viejos en caché.
      return {
        ...fila,
        nombreCompleto,
        documentoSocio,
        estadoMostrado: fila.estadoMostrado ?? fila.estado,
        monto,
        totalDeuda,
      };
    });
  }, [filas]);

  if (!cuentaSeleccionada) {
    return (
      <div className="bg-white rounded-md border border-gray-200 py-20 flex flex-col items-center gap-3 text-gray-400 shadow-sm">
        <Package size={40} className="opacity-40" />
        <p className="text-[11px] font-black uppercase tracking-widest">
          Elegí un tipo de cuota para ver el listado
        </p>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Socio",
                "Documento",
                "Tipo de socio",
                "Monto Cuota",
                "Estado",
                "Saldo Pendiente",
                "Acciones",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 text-left"
                >
                  <div className="flex items-center gap-2">
                    {h}
                    {h === "Tipo de socio" && (
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
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-5 py-4">
                    <div className="h-4 bg-gray-100 rounded-md animate-pulse" />
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
      {/* Dashboard (Grupo A, reutilizado tal cual — R18: rótulo cosmético
          "Estado Alumnos" aceptado, no se modifica DashboardCuotas.jsx).
          Oculto por defecto, detrás del toggle "Ver métricas" del
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

      <div className="flex items-center gap-2 max-w-sm mb-4">
        <input
          type="text"
          placeholder="Buscar por socio..."
          value={busqueda}
          onChange={(e) => onCambiarBusqueda?.(e.target.value)}
          className="w-full text-sm font-semibold px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-md outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm transition-all placeholder:text-gray-400 placeholder:font-medium"
        />
        {busqueda && (
          <button
            onClick={() => onCambiarBusqueda?.("")}
            className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest cursor-pointer px-2 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {totalRegistros === 0 ? (
        <div className="bg-white rounded-md border border-gray-200 py-20 flex flex-col items-center gap-3 text-gray-400 shadow-sm">
          <Package size={40} className="opacity-40" />
          <p className="text-[11px] font-black uppercase tracking-widest">
            {busqueda ? "No se encontraron coincidencias" : "No hay socios registrados"}
          </p>
        </div>
      ) : (
      <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-max">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">
                  Socio
                </th>
                <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">
                  Documento
                </th>
                <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">
                  Tipo de socio
                </th>
                <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                  Monto Cuota
                </th>
                <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                  Estado
                </th>
                <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                  Saldo Pendiente
                </th>
                <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filasEnriquecidas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-[11px] font-black uppercase tracking-widest">
                    No se encontraron coincidencias
                  </td>
                </tr>
              ) : (
                filasEnriquecidas.map((fila) => (
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
                        <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">
                          {fila.nombreCompleto || `Socio #${fila.codigo}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-gray-500">
                        {fila.documentoSocio || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 relative">
                      <div className="min-w-[120px]">
                        {confTipoSocio ? (
                          <InlineAtributo
                            contacto={fila}
                            conf={confTipoSocio}
                            onActualizar={handleActualizarContactoInline}
                          />
                        ) : (
                          <span className="text-xs font-semibold text-gray-500">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center justify-end gap-1.5">
                        {fila.tieneReglaContacto && (
                          <span
                            title="Regla de cuota fija (por contacto) activa para este socio"
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
                      <span className="text-sm font-black text-rose-600 tracking-tight">
                        {formatearARS(fila.totalDeuda)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {(fila.estado === "SIN_EMITIR" || fila.estado === "ANULADO") && (
                          <button
                            onClick={() => setSocioEmitirIndividual(fila)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all cursor-pointer shadow-sm"
                          >
                            Emitir
                          </button>
                        )}
                        {fila.totalDeuda > 0 && (
                          <button
                            onClick={() => setSocioCobrarComprobante(fila)}
                            className="px-3 py-1.5 bg-[#1FAE6D]/10 text-[#178F58] border border-[#1FAE6D]/20 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-[#1FAE6D]/20 transition-all cursor-pointer shadow-sm"
                          >
                            Cobrar
                          </button>
                        )}
                        <button
                          onClick={() => setSocioDeuda(fila)}
                          className={`px-3 py-1.5 border rounded-md text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm ${
                            fila.tieneDeudaGlobal
                              ? 'bg-rose-50 text-rose-700 border-rose-200/60 hover:bg-rose-100'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {fila.tieneDeudaGlobal ? '¡Ver deudas!' : 'Historial'}
                        </button>
                        {(fila.estado === "ABONADO" || fila.estado === "PARCIALMENTE_ABONADO") && (
                          <button
                            title="Ver/anular el Recibo que cobró esta cuota"
                            onClick={() =>
                              navigate("/panel/comprobantes/listados", {
                                state: {
                                  tipoInicial: "RECIBO",
                                  busquedaInicial: fila.nombreCompleto,
                                },
                              })
                            }
                            className="px-3 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
                          >
                            Recibos
                          </button>
                        )}
                        <button
                          onClick={() => setSocioReglaContacto(fila)}
                          className={`px-3 py-1.5 border rounded-md text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm ${
                            fila.tieneReglaContacto
                              ? "bg-violet-50 text-violet-700 border-violet-200/60 hover:bg-violet-100"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
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

        {/* Paginación (mismo patrón que ListadoComprobante.jsx /
            TablaCuotas.jsx) */}
        {totalPaginas > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <button
              disabled={pagina <= 1}
              onClick={() => onCambiarPagina?.(pagina - 1)}
              className="flex items-center gap-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>

            <div className="flex items-center gap-1">
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
                    className={`w-8 h-8 rounded-md text-[11px] font-black transition cursor-pointer shadow-sm ${
                      page === pagina
                        ? "bg-gray-900 text-white border border-gray-900"
                        : "text-gray-600 hover:bg-gray-50 border border-gray-200"
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
              className="flex items-center gap-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              Siguiente
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
      )}

      {socioEmitirIndividual && (
        <ModalEmitirIndividual
          fila={socioEmitirIndividual}
          cuenta={cuentaSeleccionada}
          tipoEntidadObligado={tipoEntidadObligado}
          mes={mes}
          anio={anio}
          codigoUnidadNegocio={codigoUnidadNegocio}
          onClose={() => setSocioEmitirIndividual(null)}
          onExito={() => {
            setSocioEmitirIndividual(null);
            refetch();
          }}
        />
      )}

      {socioDeuda && (
        <ModalDeudaAlumno
          alumno={socioDeuda}
          codigoCuentaContable={cuentaSeleccionada?.codigoSecuencial}
          onClose={() => setSocioDeuda(null)}
        />
      )}

      {/* R6: SIN ModalCambioTipoAlumno.jsx (atado a atributos.tipo_alumno,
          sin equivalente para Socios en esta feature). */}

      {socioReglaContacto && (
        <ModalReglasCuota
          cuenta={cuentaSeleccionada}
          codigoContactoInicial={socioReglaContacto.codigo}
          nombreContactoInicial={socioReglaContacto.nombreCompleto}
          onClose={() => {
            setSocioReglaContacto(null);
            refetch();
          }}
        />
      )}

      {socioCobrarComprobante && (
        <ModalSeleccionarCobro
          alumno={socioCobrarComprobante}
          onClose={() => setSocioCobrarComprobante(null)}
        />
      )}
    </>
  );
};

export default TablaCuotasSocios;
