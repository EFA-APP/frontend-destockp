import { useEffect, useState } from "react";
import { Link2, Package, Trash2 } from "lucide-react";
import { AdvertenciaIcono, BorrarIcono } from "../../../../assets/Icons";
import {
  useContactoQuery,
  useVinculadosRelacionQuery,
  useDesvincularRelacionMutation,
} from "../../../../Backend/Contactos/hooks/useRelacionesContacto";
import ModalVincularContacto from "./ModalVincularContacto";

// Feature 36 (contactos-relaciones-agrupadas-por-contacto, R9-R20,
// design.md §4). Panel inline (embebido bajo la fila de un contacto en
// ListaRelacionesContactos.jsx) que recrea, inline, el mecanismo que tenía
// VisorRelaciones.jsx (eliminado en la feature 35): pestañas por
// relacionesDisponibles + listado paginado de vinculados de la relación
// activa + Desvincular con confirmación + botón "Añadir relación" con el
// origen ya fijado.
const nombreContacto = (c) =>
  c?.razonSocial || `${c?.nombre || ""} ${c?.apellido || ""}`.trim() || "Sin Nombre";

const PanelRelacionesContacto = ({ contacto }) => {
  const [relacionActiva, setRelacionActiva] = useState(null); // idRelacion
  const [pagina, setPagina] = useState(1);
  const limite = 10;
  const [vinculoADesvincular, setVinculoADesvincular] = useState(null);
  const [desvinculando, setDesvinculando] = useState(false);
  const [mostrarModalVincular, setMostrarModalVincular] = useState(false);

  const { data: contactoCompleto } = useContactoQuery(contacto.codigo); // R11
  const relacionesDisponibles = contactoCompleto?.relacionesDisponibles || [];

  // R15: selecciona automáticamente la primera relación disponible.
  useEffect(() => {
    if (!relacionActiva && relacionesDisponibles.length > 0) {
      setRelacionActiva(relacionesDisponibles[0].idRelacion);
    }
  }, [relacionesDisponibles, relacionActiva]);

  const {
    data: dataVinculados = { items: [], total: 0, paginas: 1 },
    isLoading: cargandoVinculados,
  } = useVinculadosRelacionQuery(contacto.codigo, relacionActiva, pagina, limite); // R13

  const { mutateAsync: desvincular } = useDesvincularRelacionMutation();

  const handleConfirmarDesvincular = async () => {
    if (!vinculoADesvincular) return;
    try {
      setDesvinculando(true);
      await desvincular({
        codigo: contacto.codigo, // R18
        idRelacion: relacionActiva,
        codigoContactoRelacionado: vinculoADesvincular.codigo,
      });
      setVinculoADesvincular(null); // R19: refresco sin recargar la página
    } catch (error) {
      console.error("Error al desvincular relación:", error);
    } finally {
      setDesvinculando(false);
    }
  };

  return (
    <div className="ml-14 mr-4 mb-2 p-4 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--fill-secondary)]/20">
      {relacionesDisponibles.length === 0 ? (
        <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase text-center py-4">
          Este contacto no tiene relaciones configuradas disponibles.
        </div>
      ) : (
        <>
          {/* R12: pestañas de relacionesDisponibles */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {relacionesDisponibles.map((rel) => (
              <button
                key={rel.idRelacion}
                type="button"
                onClick={() => {
                  setRelacionActiva(rel.idRelacion);
                  setPagina(1);
                }}
                className={`px-3 py-1.5 rounded-[8px] text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
                  relacionActiva === rel.idRelacion
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                }`}
              >
                {rel.nombre} ({rel.cantidadVinculos})
              </button>
            ))}
            <button
              type="button"
              onClick={() => setMostrarModalVincular(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest rounded-[8px] shadow-sm hover:brightness-110 transition-all cursor-pointer"
            >
              <Link2 size={13} />
              Añadir relación {/* R20 */}
            </button>
          </div>

          {/* R13: listado paginado de vinculados de la relación activa */}
          {cargandoVinculados ? (
            <div className="space-y-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-[var(--fill-secondary)]/50 rounded-[8px] animate-pulse"
                />
              ))}
            </div>
          ) : dataVinculados.items.length === 0 ? ( // R14
            <div className="flex flex-col items-center justify-center text-[var(--text-muted)] py-6">
              <Package size={28} className="mb-2 opacity-20" />
              <span className="text-[11px] font-black uppercase tracking-widest">
                Sin vínculos cargados para esta relación.
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {dataVinculados.items.map((v) => (
                <div
                  key={v.codigo}
                  className="flex items-center justify-between px-3 py-2 rounded-[8px] bg-[var(--surface)] border border-[var(--border-subtle)]"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-bold text-[var(--text-primary)] truncate">
                      {nombreContacto(v)}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                      {v.tipoEntidad} · DNI/CUIT: {v.documento || "S/D"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVinculoADesvincular(v)} // R16
                    title="Desvincular"
                    className="p-2 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 rounded-[8px] transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Paginación local, mismo patrón ya usado en el módulo */}
          {dataVinculados.items.length > 0 && (
            <div className="flex items-center justify-end gap-3 mt-3">
              <button
                disabled={pagina <= 1}
                onClick={() => setPagina((p) => p - 1)}
                className="text-[10px] px-3 py-1.5 font-black uppercase tracking-widest bg-[var(--surface)] border border-[var(--border-subtle)] rounded hover:bg-[var(--fill-secondary)] disabled:opacity-30 cursor-pointer shadow-sm transition-all"
              >
                Ant
              </button>
              <span className="text-[11px] font-black px-2">
                {pagina} / {dataVinculados.paginas || 1}
              </span>
              <button
                disabled={pagina >= dataVinculados.paginas}
                onClick={() => setPagina((p) => p + 1)}
                className="text-[10px] px-3 py-1.5 font-black uppercase tracking-widest bg-[var(--surface)] border border-[var(--border-subtle)] rounded hover:bg-[var(--fill-secondary)] disabled:opacity-30 cursor-pointer shadow-sm transition-all"
              >
                Sig
              </button>
            </div>
          )}
        </>
      )}

      {/* R17: confirmación explícita, mismo bloque visual ya usado en el módulo */}
      {vinculoADesvincular && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white border border-[var(--color-neutral-border)] rounded-[16px] max-w-md w-full p-8 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-[12px] bg-rose-50 flex items-center justify-center text-rose-600 mb-2 border border-rose-100 shadow-sm">
                <AdvertenciaIcono size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold uppercase tracking-tighter text-[var(--color-neutral-text-main)]">
                  ¿Desvincular Contacto?
                </h3>
                <p className="text-[13px] text-[var(--color-neutral-text-muted)] font-medium leading-relaxed tracking-wide">
                  Se eliminará el vínculo entre{" "}
                  <span className="text-[var(--color-neutral-text-main)] font-bold">
                    {nombreContacto(contacto)}
                  </span>{" "}
                  y{" "}
                  <span className="text-[var(--color-neutral-text-main)] font-bold">
                    {nombreContacto(vinculoADesvincular)}
                  </span>
                  .
                </p>
              </div>
              <div className="flex gap-3 w-full mt-6">
                <button
                  onClick={() => setVinculoADesvincular(null)}
                  disabled={desvinculando}
                  className="flex-1 py-3 rounded-[8px] bg-white border border-[var(--color-neutral-border)] text-[13px] font-bold text-[var(--color-neutral-text-main)] hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarDesvincular}
                  disabled={desvinculando}
                  className="flex-1 py-3 rounded-[8px] bg-rose-600 text-white text-[13px] font-bold hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  {desvinculando ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <BorrarIcono size={14} />
                  )}
                  Desvincular
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* R20, R21: origen ya fijado, salta el paso 1 */}
      <ModalVincularContacto
        open={mostrarModalVincular}
        onClose={() => setMostrarModalVincular(false)}
        contactoOrigenInicial={contacto}
      />
    </div>
  );
};

export default PanelRelacionesContacto;
