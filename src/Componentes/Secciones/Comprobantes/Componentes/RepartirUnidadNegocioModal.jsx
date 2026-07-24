import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "../../../../utils/formatters";

// Feature "egreso-distribucion-unidad-negocio", design.md §3.8 (Revisión 2
// y 3). Modal de reparto por línea del carrito, EXCLUSIVAMENTE por
// porcentaje (sin toggle %/$, R30/R40): cada fila tiene un input de
// porcentaje y, al lado, un campo de solo lectura con el monto en pesos
// equivalente, recalculado en tiempo real (R32); la última fila de la
// lista siempre muestra, también en tiempo real, el porcentaje/monto que
// le quedarían tras el ajuste automático (R11/R12/R33). Guardar solo
// actualiza el estado en memoria del carrito — la normalización
// autoritativa (recálculo exacto, validación) ocurre en el backend al
// guardar el comprobante completo (R16).
function round2(valor) {
  return Math.round(valor * 100) / 100;
}

/**
 * Calcula, para la lista de filas cargadas en el modal, el porcentaje y
 * monto de PREVIEW de cada una — misma fórmula que aplicará el backend
 * (R10-R12), pero puramente local/derivada, sin ningún request.
 */
function calcularVistaPrevia(filas, subtotalLinea) {
  const n = filas.length;
  if (n === 0) return [];
  if (n === 1) {
    return [{ ...filas[0], porcentajePreview: 100, montoPreview: subtotalLinea, esUltima: true }];
  }
  let acumulado = 0;
  const resultado = [];
  for (let i = 0; i < n - 1; i++) {
    const porcentaje = parseFloat(filas[i].porcentaje) || 0;
    const monto = round2((subtotalLinea * porcentaje) / 100);
    acumulado += monto;
    resultado.push({ ...filas[i], porcentajePreview: porcentaje, montoPreview: monto, esUltima: false });
  }
  const montoUltimo = round2(subtotalLinea - acumulado);
  const porcentajeUltimo = subtotalLinea !== 0 ? round2((montoUltimo / subtotalLinea) * 100) : 0;
  resultado.push({
    ...filas[n - 1],
    porcentajePreview: porcentajeUltimo,
    montoPreview: montoUltimo,
    esUltima: true,
  });
  return resultado;
}

/** Validación de UI (espejo, no autoritativa) para habilitar "Guardar". */
function validarFilas(filas) {
  if (filas.length === 0) return "Agregá al menos una unidad de negocio.";
  const codigos = filas.map((f) => f.codigoUnidadNegocio).filter(Boolean);
  if (codigos.length !== filas.length) {
    return "Elegí una unidad de negocio en cada fila.";
  }
  if (new Set(codigos).size !== codigos.length) {
    return "No repitas la misma unidad de negocio en la misma línea.";
  }
  if (filas.length >= 2) {
    const primeras = filas.slice(0, -1);
    let suma = 0;
    for (const f of primeras) {
      const porcentaje = parseFloat(f.porcentaje) || 0;
      if (porcentaje <= 0) {
        return "El porcentaje de cada unidad (salvo la última) debe ser mayor a 0.";
      }
      suma += porcentaje;
      if (suma >= 100) {
        return "La suma de porcentajes debe ser menor a 100 para dejarle un resto a la última unidad.";
      }
    }
  }
  return null;
}

const RepartirUnidadNegocioModal = ({
  isOpen,
  onClose,
  item,
  unidadesNegocio = [],
  onGuardar,
  onQuitar,
}) => {
  const subtotalLinea = useMemo(() => {
    if (!item) return 0;
    const base = (item.precioUnitario || 0) * (item.cantidad || 1) - (item.descuento || 0);
    return Math.max(0, base);
  }, [item]);

  const [filas, setFilas] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    const existentes = item?.repartoUnidadNegocio;
    if (Array.isArray(existentes) && existentes.length > 0) {
      setFilas(existentes.map((r) => ({ ...r })));
    } else {
      setFilas([{ codigoUnidadNegocio: "", porcentaje: "" }]);
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const vistaPrevia = calcularVistaPrevia(filas, subtotalLinea);
  const error = validarFilas(filas);

  const unidadesDisponiblesPara = (indice) => {
    const usadas = new Set(
      filas
        .map((f, i) => (i === indice ? null : String(f.codigoUnidadNegocio)))
        .filter(Boolean),
    );
    return unidadesNegocio.filter((u) => !usadas.has(String(u.codigo)));
  };

  const actualizarFila = (indice, cambios) => {
    setFilas((prev) => prev.map((f, i) => (i === indice ? { ...f, ...cambios } : f)));
  };

  const agregarFila = () => {
    setFilas((prev) => [...prev, { codigoUnidadNegocio: "", porcentaje: "" }]);
  };

  const quitarFila = (indice) => {
    setFilas((prev) => prev.filter((_, i) => i !== indice));
  };

  const handleGuardar = () => {
    if (error) return;
    const repartos = filas.map((f, i) => ({
      codigoUnidadNegocio: Number(f.codigoUnidadNegocio),
      ...(i < filas.length - 1 ? { porcentaje: parseFloat(f.porcentaje) || 0 } : {}),
    }));
    onGuardar(repartos);
    onClose();
  };

  const handleQuitarReparto = () => {
    onQuitar();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
              Repartir por Unidad de Negocio
            </p>
            <p className="text-[11px] font-bold text-gray-500 truncate max-w-[380px]">
              {item?.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <span>Subtotal de la línea</span>
            <span className="font-mono text-gray-900">{formatPrice(subtotalLinea)}</span>
          </div>

          <div className="flex flex-col gap-2">
            {vistaPrevia.map((fila, indice) => (
              <div
                key={indice}
                className="flex items-end gap-2 p-2.5 border border-gray-200 rounded-md bg-gray-50/50"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Unidad de Negocio
                  </span>
                  <select
                    value={filas[indice]?.codigoUnidadNegocio ?? ""}
                    onChange={(e) =>
                      actualizarFila(indice, { codigoUnidadNegocio: e.target.value })
                    }
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs font-bold text-gray-900 bg-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
                  >
                    <option value="">Elegir...</option>
                    {unidadesDisponiblesPara(indice).map((u) => (
                      <option key={u.codigo} value={u.codigo}>
                        {u.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-20">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    %
                  </span>
                  {fila.esUltima && filas.length > 1 ? (
                    <div className="h-[30px] px-2 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs font-black text-gray-500 bg-gray-100">
                      {fila.porcentajePreview}%
                    </div>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={filas[indice]?.porcentaje ?? ""}
                      onChange={(e) => actualizarFila(indice, { porcentaje: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs font-black text-gray-900 text-center focus:outline-none focus:border-[var(--primary)]"
                    />
                  )}
                </div>

                <div className="w-24 text-right">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Monto
                  </span>
                  <div className="h-[30px] flex items-center justify-end text-xs font-black text-gray-900 font-mono">
                    {formatPrice(fila.montoPreview)}
                  </div>
                </div>

                {filas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => quitarFila(indice)}
                    title="Quitar fila"
                    className="shrink-0 p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={agregarFila}
            className="self-start flex items-center gap-1.5 text-[11px] font-bold text-[var(--primary)] hover:underline cursor-pointer"
          >
            <Plus size={13} /> Agregar unidad
          </button>

          {error && (
            <p className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={handleQuitarReparto}
            className="text-[11px] font-bold text-gray-500 hover:text-red-600 uppercase tracking-wider cursor-pointer"
          >
            Quitar reparto
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={!!error}
              className="px-4 py-2 rounded-md bg-[#1FAE6D] hover:bg-[#178F58] text-white text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Guardar reparto
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default RepartirUnidadNegocioModal;
