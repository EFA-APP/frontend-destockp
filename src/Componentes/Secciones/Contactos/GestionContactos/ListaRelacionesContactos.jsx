import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Link2,
  Search,
  X,
  Package,
  ChevronDown,
  ChevronUp,
  Eye,
  ArrowRight,
  Trash2,
} from "lucide-react";
import PanelRelacionesContacto from "../Relaciones/PanelRelacionesContacto";
import { AdvertenciaIcono, BorrarIcono } from "../../../../assets/Icons";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { useConfiguracionRelaciones } from "../../../../Backend/Contactos/hooks/useConfiguracionRelaciones";
import { useEntidades } from "../../../../Backend/Contactos/hooks/useEntidades";
import {
  generarClaveAutoGenerada,
  esConflictoDeClaveDuplicada,
} from "../../../../Backend/Contactos/utils/relacionAutoGenerar";

const nombreContacto = (c) =>
  c?.razonSocial || `${c?.nombre || ""} ${c?.apellido || ""}`.trim() || "Sin Nombre";

/**
 * Modal para la entidad actualmente seleccionada en el sidebar: muestra qué
 * relaciones tiene configuradas y con qué otras entidades puede vincularse.
 * Reemplaza al botón global "Agregar Vínculo" (que antes abría
 * ModalVincularContacto sin contactoOrigenInicial) — no es un buscador de
 * contactos ni crea/elimina vínculos puntuales; esa acción sigue existiendo,
 * sin cambios, desde PanelRelacionesContacto.jsx (botón "Añadir relación"
 * por contacto puntual, R13/R14).
 *
 * Feature 38 (contactos-relaciones-tab-alta-baja-cascada, design.md §2, §5):
 * deja de ser de solo lectura. Gana:
 * - Un selector de "otra entidad" que crea (o reusa) una
 *   ConfiguracionRelacion sin formulario técnico (R1-R5).
 * - Una acción "Eliminar" por relación listada, con confirmación genérica,
 *   sin conteo de vínculos afectados (R6-R8).
 * Sin gateo de permiso nuevo (R11): contraste deliberado con
 * GestionRelaciones.jsx, que sigue detrás de CONFIGURAR_CONTACTO.
 */
const ModalRelacionesDisponibles = ({ open, onClose, entidad }) => {
  const {
    configuracionesRelacion,
    cargandoConfiguracionesRelacion,
    crearConfiguracionRelacion,
    eliminarConfiguracionRelacion,
  } = useConfiguracionRelaciones();
  const { entidades } = useEntidades();
  const queryClient = useQueryClient();

  // Feature 38: alta (R1-R5).
  const [entidadEnProceso, setEntidadEnProceso] = useState(null); // clave en resolución
  const [errorMensaje, setErrorMensaje] = useState("");

  // Feature 38: baja (R6-R9).
  const [relacionAEliminar, setRelacionAEliminar] = useState(null); // config completa
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    if (open) {
      setErrorMensaje("");
      setEntidadEnProceso(null);
      setRelacionAEliminar(null);
      setEliminando(false);
    }
  }, [open]);

  if (!open) return null;

  const nombreEntidad = (clave) =>
    entidades.find((e) => e.clave === clave)?.nombre || clave;

  const relacionesDeEntidad = configuracionesRelacion.filter(
    (config) =>
      config.claveOrigen === entidad?.clave || config.claveDestino === entidad?.clave
  );

  const entidadesDestino = entidades.filter((e) => e.clave !== entidad?.clave); // R1

  // Feature 38 (R2, R3): busca, en cualquier dirección, una
  // ConfiguracionRelacion activa ya existente entre `entidad` y
  // `entidadDestino`. Distinto de resolverCoincidencias de
  // ModalVincularContacto.jsx (que compara contra tipoEntidadEsperado, un
  // campo resuelto por backend que no existe en configuracionesRelacion) —
  // ver design.md §2.
  const buscarConfiguracionExistente = (claves, entidadDestino) =>
    claves.find(
      (config) =>
        (config.claveOrigen === entidad?.clave &&
          config.claveDestino === entidadDestino.clave) ||
        (config.claveOrigen === entidadDestino.clave &&
          config.claveDestino === entidad?.clave)
    );

  // Feature 38 (R2-R5, design.md §2): orquestación local, no compartida con
  // handleElegirEntidadDestino de ModalVincularContacto.jsx (fuente de
  // datos, criterio de matching y qué hacer al resolver son distintos allá).
  const crearOReusarRelacionConEntidad = async (entidadDestino) => {
    setErrorMensaje("");

    const existente = buscarConfiguracionExistente(
      configuracionesRelacion,
      entidadDestino,
    );
    if (existente) return; // R3: ya existe, se trata como disponible de inmediato

    setEntidadEnProceso(entidadDestino.clave);
    try {
      await crearConfiguracionRelacion({
        clave: generarClaveAutoGenerada(entidad.clave, entidadDestino.clave),
        claveOrigen: entidad.clave,
        claveDestino: entidadDestino.clave,
        nombreDirecto: entidadDestino.nombre,
        nombreInverso: entidad.nombre,
        cardinalidad: "MUCHOS_A_MUCHOS",
      }); // R2 — la invalidación de ["configuracion-relaciones"] ya la hace
      // useConfiguracionRelaciones (R12), sin lógica de refresco adicional.
    } catch (error) {
      if (esConflictoDeClaveDuplicada(error)) {
        // R4: condición de carrera — refrescar (invalidación de la query
        // ["configuracion-relaciones"] ya provista por
        // useConfiguracionRelaciones, sin lógica de refresco nueva) y
        // tratar la relación como ya creada, sin mostrar error.
        await queryClient.invalidateQueries({
          queryKey: ["configuracion-relaciones"],
        });
        return;
      }
      // R5
      setErrorMensaje(
        error?.response?.data?.message ||
          "No se pudo crear la relación. Intente nuevamente.",
      );
    } finally {
      setEntidadEnProceso(null);
    }
  };

  // Feature 38 (R7-R8): confirmar y ejecutar la baja.
  const handleConfirmarEliminar = async () => {
    if (!relacionAEliminar) return;
    try {
      setEliminando(true);
      await eliminarConfiguracionRelacion(relacionAEliminar.codigo); // R8
      setRelacionAEliminar(null);
    } catch (error) {
      setErrorMensaje(
        error?.response?.data?.message ||
          "No se pudo eliminar la relación. Intente nuevamente.",
      );
      setRelacionAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-[var(--surface)] rounded-[16px] shadow-2xl border border-[var(--border-subtle)] flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--fill-secondary)]/30">
          <div>
            <h3 className="text-[13px] font-black uppercase text-[var(--text-primary)] tracking-widest flex items-center gap-2">
              <Eye size={16} className="text-[var(--primary)]" />
              Relaciones de {entidad?.nombre || "la entidad"}
            </h3>
            <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
              Vínculos configurados con otras entidades
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {errorMensaje && (
            <div className="p-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[12px] font-bold text-rose-700">
              {errorMensaje}
            </div>
          )}

          <div className="space-y-2.5">
            {cargandoConfiguracionesRelacion ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-[var(--fill-secondary)]/50 rounded-md animate-pulse"
                />
              ))
            ) : relacionesDeEntidad.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)]">
                <Link2 size={32} className="mb-2 opacity-20" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Sin relaciones configuradas
                </span>
              </div>
            ) : (
              relacionesDeEntidad.map((config) => {
                const esOrigen = entidad?.clave === config.claveOrigen;
                const nombreRelacion = esOrigen
                  ? config.nombreDirecto
                  : config.nombreInverso;
                const otraClave = esOrigen ? config.claveDestino : config.claveOrigen;

                return (
                  <div
                    key={config.codigo}
                    className="flex items-center justify-between px-4 py-3 bg-[var(--surface-hover)] rounded-[10px] border border-[var(--border-subtle)] shadow-sm"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-wide">
                        {nombreRelacion}
                      </span>
                      <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5 flex items-center gap-1">
                        <ArrowRight size={11} className="opacity-50" />
                        {nombreEntidad(otraClave)}
                      </span>
                    </div>
                    {/* R6: acción de eliminar por relación listada. Sin
                        gateo de permiso nuevo (R11). */}
                    <button
                      type="button"
                      onClick={() => setRelacionAEliminar(config)}
                      title="Eliminar relación"
                      className="p-2 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 rounded-[8px] transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Selector de "otra entidad" para crear-o-reusar (R1-R5). Sin
              gateo de permiso nuevo (R11). */}
          <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
              Vincular con otra entidad
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {entidadesDestino.map((ent) => {
                const yaConfigurada = Boolean(
                  buscarConfiguracionExistente(configuracionesRelacion, ent),
                );
                return (
                  <button
                    key={ent.clave}
                    type="button"
                    disabled={Boolean(entidadEnProceso)}
                    onClick={() => crearOReusarRelacionConEntidad(ent)}
                    className="flex flex-col items-start px-3 py-2 rounded-[10px] border border-[var(--border-subtle)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary-subtle)] transition-all text-left cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase">
                      {ent.nombre}
                      {entidadEnProceso === ent.clave && "…"}
                    </span>
                    {yaConfigurada && (
                      <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider opacity-70">
                        Ya configurada
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* R7: confirmación genérica antes de eliminar, sin cantidad de
          ContactoRelacion afectados — mismo patrón visual que
          PanelRelacionesContacto.jsx. */}
      {relacionAEliminar && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white border border-[var(--color-neutral-border)] rounded-[16px] max-w-md w-full p-8 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-[12px] bg-rose-50 flex items-center justify-center text-rose-600 mb-2 border border-rose-100 shadow-sm">
                <AdvertenciaIcono size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold uppercase tracking-tighter text-[var(--color-neutral-text-main)]">
                  ¿Eliminar esta relación?
                </h3>
                <p className="text-[13px] text-[var(--color-neutral-text-muted)] font-medium leading-relaxed tracking-wide">
                  ¿Estás seguro? Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-6">
                <button
                  onClick={() => setRelacionAEliminar(null)}
                  disabled={eliminando}
                  className="flex-1 py-3 rounded-[8px] bg-white border border-[var(--color-neutral-border)] text-[13px] font-bold text-[var(--color-neutral-text-main)] hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarEliminar}
                  disabled={eliminando}
                  className="flex-1 py-3 rounded-[8px] bg-rose-600 text-white text-[13px] font-bold hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  {eliminando ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <BorrarIcono size={14} />
                  )}
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

/**
 * Fila expandible de un contacto (acordeón): al hacer click, despliega
 * PanelRelacionesContacto.jsx debajo con sus vínculos actuales (R9, R10).
 */
const FilaContactoRelaciones = ({ contacto, expandido, onToggle }) => {
  const avatarInitial = contacto.nombre
    ? contacto.nombre.charAt(0)
    : contacto.razonSocial
      ? contacto.razonSocial.charAt(0)
      : "?";

  return (
    <div>
      <div
        onClick={onToggle}
        className={`flex items-center gap-4 p-4 rounded-[12px] cursor-pointer transition-all group border bg-[var(--surface)] ${
          expandido
            ? "bg-[#F1FAF5] border-[#1FAE6D]/30 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
            : "hover:bg-[#F5F7F6] border-transparent hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-white border border-[#E9EDEC] flex items-center justify-center text-[#1FAE6D] font-black text-lg shrink-0 uppercase shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          {avatarInitial}
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`text-[14px] font-semibold truncate ${expandido ? "text-[#178F58]" : "text-[#1A1D1C]"}`}
          >
            {nombreContacto(contacto)}
          </h4>
          <p className="text-[12px] text-[#6B7472] font-medium truncate mt-0.5">
            {contacto.tipoEntidad || "Contacto"}
          </p>
        </div>
        <div className="text-[var(--text-muted)] shrink-0">
          {expandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {expandido && <PanelRelacionesContacto contacto={contacto} />}
    </div>
  );
};

/**
 * Tab "Relaciones" de DashboardContactos.jsx (Feature 36,
 * contactos-relaciones-agrupadas-por-contacto, design.md §3). Reemplaza por
 * completo la tabla plana cross-contacto de la feature 35: lista TODOS los
 * contactos de la entidad seleccionada en el sidebar (mismo mecanismo que el
 * tab "Contactos", useContactos({tipoEntidad})), con buscador local propio,
 * y cada fila es expandible a un panel inline con sus vínculos actuales.
 */
const ListaRelacionesContactos = ({ entidad }) => {
  const [pagina, setPagina] = useState(1);
  const [limite] = useState(10);
  const [busquedaLocal, setBusquedaLocal] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [codigoExpandido, setCodigoExpandido] = useState(null); // R9, R10: acordeón
  const [mostrarModalRelaciones, setMostrarModalRelaciones] = useState(false);

  // R6, R8: mismo patrón de debounce 500ms ya usado en el módulo.
  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounced(busquedaLocal);
      setPagina(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaLocal]);

  // R5: al cambiar de entidad (sidebar), resetea página y colapsa el panel.
  useEffect(() => {
    setPagina(1);
    setCodigoExpandido(null);
  }, [entidad?.clave]);

  const { contactos, total, paginas, cargandoContactos } = useContactos({
    tipoEntidad: entidad?.clave, // R1
    pagina,
    limite,
    busqueda: busquedaDebounced, // R6
  }); // R2: mismo hook ya existente, ningún endpoint nuevo

  const toggleExpandido = (codigo) => {
    setCodigoExpandido((actual) => (actual === codigo ? null : codigo)); // R9, R10
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[16px] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--fill-secondary)]/30 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-[13px] font-black uppercase text-[var(--text-primary)] tracking-widest flex items-center gap-2">
          <Link2 size={16} />
          Relaciones entre Contactos
        </h2>

        <div className="flex items-center gap-3 flex-wrap">
          {/* R6: buscador local, independiente del buscador global (R7) */}
          <div className="flex items-center bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-3 py-1 shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all">
            <Search size={14} className="text-[var(--text-muted)]" />
            <input
              type="text"
              value={busquedaLocal}
              onChange={(e) => setBusquedaLocal(e.target.value)}
              placeholder="Buscar por nombre o documento..."
              className="bg-transparent border-none outline-none text-[12px] font-medium py-1.5 px-2 w-56 text-[var(--text-primary)]"
            />
            {busquedaLocal && (
              <button
                onClick={() => setBusquedaLocal("")}
                className="text-[var(--text-muted)] hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Ajuste 2026-07-19: el botón global deja de ser un buscador de
              contactos y pasa a ser puramente informativo — muestra qué
              relaciones tiene configuradas la entidad seleccionada y con qué
              otras entidades puede vincularse. La creación real de un
              vínculo entre dos contactos puntuales sigue existiendo, sin
              cambios, desde PanelRelacionesContacto.jsx (botón "Añadir
              relación" por contacto, que abre ModalVincularContacto con
              contactoOrigenInicial ya fijado). */}
          <button
            onClick={() => setMostrarModalRelaciones(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest rounded-[10px] shadow-sm hover:brightness-110 transition-all cursor-pointer"
          >
            <Eye size={14} />
            Ver Relaciones Disponibles
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
        {cargandoContactos ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-[var(--fill-secondary)]/50 rounded-md animate-pulse mb-1"
            />
          ))
        ) : contactos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] pb-10">
            <Package size={40} className="mb-3 opacity-20" />
            <span className="text-[12px] font-black uppercase tracking-widest">
              {busquedaDebounced
                ? "Sin resultados para la búsqueda"
                : "No se encontraron contactos"}
            </span>
          </div>
        ) : (
          contactos.map((contacto) => (
            <FilaContactoRelaciones
              key={contacto.codigo}
              contacto={contacto}
              expandido={codigoExpandido === contacto.codigo}
              onToggle={() => toggleExpandido(contacto.codigo)}
            />
          ))
        )}
      </div>

      {/* Controles de paginación local */}
      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--fill-secondary)]/20 flex items-center justify-between">
        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hidden sm:block">
          Total: {total}
        </span>
        <div className="flex items-center gap-3">
          <button
            disabled={pagina <= 1}
            onClick={() => setPagina((p) => p - 1)}
            className="text-[10px] px-3 py-1.5 font-black uppercase tracking-widest bg-[var(--surface)] border border-[var(--border-subtle)] rounded hover:bg-[var(--fill-secondary)] disabled:opacity-30 cursor-pointer shadow-sm transition-all"
          >
            Ant
          </button>
          <span className="text-[11px] font-black px-2">
            {pagina} / {paginas || 1}
          </span>
          <button
            disabled={pagina >= paginas}
            onClick={() => setPagina((p) => p + 1)}
            className="text-[10px] px-3 py-1.5 font-black uppercase tracking-widest bg-[var(--surface)] border border-[var(--border-subtle)] rounded hover:bg-[var(--fill-secondary)] disabled:opacity-30 cursor-pointer shadow-sm transition-all"
          >
            Sig
          </button>
        </div>
      </div>

      {/* Ajuste 2026-07-19 + Feature 38: sin buscador de contactos ni acción
          de vinculación por contacto puntual (ver comentario junto al
          botón); gana alta/baja de ConfiguracionRelacion (ver
          ModalRelacionesDisponibles más arriba). */}
      <ModalRelacionesDisponibles
        open={mostrarModalRelaciones}
        onClose={() => setMostrarModalRelaciones(false)}
        entidad={entidad}
      />
    </div>
  );
};

export default ListaRelacionesContactos;
