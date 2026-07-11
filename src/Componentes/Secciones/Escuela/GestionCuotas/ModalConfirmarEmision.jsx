/**
 * Paso de confirmación explícito, compartido por `ModalEmitirLote.jsx` y
 * `ModalEmitirIndividual.jsx`, que muestra la Unidad de Negocio destino
 * antes de disparar la emisión real. Se evaluó reutilizar
 * `Componentes/UI/ModalConfirmacion/ModalConfirmacion.jsx` (único
 * componente de confirmación genérico existente en el repo) pero su
 * estilo está fijo para acciones destructivas (icono/fondo/botón rojos,
 * sin variante de color configurable) — semánticamente incorrecto para
 * confirmar una emisión (no destructiva). Este componente sigue en cambio
 * el mismo patrón visual ya usado en esta carpeta (`ModalEmitirLote.jsx`,
 * `ModalReglasCuota.jsx`): tarjeta blanca, `--border-subtle`, botón
 * primario `--primary`.
 */
const ModalConfirmarEmision = ({
  nombreUnidad,
  emitiendo = false,
  error = null,
  onConfirmar,
  onCancelar,
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white border border-[var(--border-subtle)] rounded-md max-w-md w-full p-7 shadow-2xl flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black tracking-tight text-gray-800">
          Confirmar emisión
        </h2>
        <p className="text-sm font-semibold text-gray-600">
          ¿Seguro que querés emitir en la unidad:{" "}
          <span className="text-[var(--primary)] font-black">
            {nombreUnidad || "sin unidad asignada"}
          </span>
          ?
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-md p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancelar}
          disabled={emitiendo}
          className="flex-1 py-3 rounded-md bg-white border border-[var(--border-subtle)] text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
        >
          Volver
        </button>
        <button
          onClick={onConfirmar}
          disabled={emitiendo}
          className="flex-1 py-3 rounded-md bg-[var(--primary)] text-white text-xs font-bold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[var(--primary)]/20"
        >
          {emitiendo ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Sí, emitir"
          )}
        </button>
      </div>
    </div>
  </div>
);

export default ModalConfirmarEmision;
