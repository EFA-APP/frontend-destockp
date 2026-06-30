import { BorrarIcono } from "../../../../assets/Icons";
import { formatPrice } from "../../../../utils/formatters";
import { TASAS_IVA, TIPO_FISCAL_OPTIONS } from "../../../../Backend/Comprobantes/useDetalleComprobante";

const ETIQUETAS_TIPO = {
  PRODUCTO: "Producto",
  MATERIA_PRIMA: "Mat. Prima",
  CUENTA_CONTABLE: "Cuenta",
};

const BADGE_COLOR = {
  PRODUCTO: "text-sky-700 bg-sky-50",
  MATERIA_PRIMA: "text-amber-700 bg-amber-50",
  CUENTA_CONTABLE: "text-violet-700 bg-violet-50",
};

const FieldLabel = ({ children }) => (
  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 block">
    {children}
  </span>
);

const TIPOS_CON_SELECTOR_FISCAL = [1, 6];

const CarritoDetalle = ({
  items = [],
  actualizarCantidadItem,
  actualizarPrecioItem,
  actualizarTasaIvaItem,
  actualizarTipoFiscalItem,
  quitarItem,
  subtotalSinIva,
  totalIva,
  totalGeneral,
  totalRecargo = 0,
  codigoTipoComprobante,
  otrosTributos = 0,
  setOtrosTributos,
}) => {
  const mostrarSelectorFiscal = TIPOS_CON_SELECTOR_FISCAL.includes(Number(codigoTipoComprobante));
  if (!items || items.length === 0) {
    return (
      <div className="mx-4 mb-3 py-10 text-center border-2 border-dashed border-gray-100 rounded-md">
        <p className="text-md font-black uppercase tracking-widest text-gray-300">
          Carrito vacío
        </p>
        <p className="text-[10px] font-semibold uppercase mt-1 text-gray-300">
          Agregá ítems para verlos acá
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 pb-3 gap-3">
      {/* Lista de ítems */}
      <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item) => {
          const esCuentaContable = item.tipoDetalle === "CUENTA_CONTABLE";
          const base =
            item.precioUnitario * item.cantidad - (item.descuento || 0);
          const baseSinIva = Math.max(0, base);
          const ivaLinea = baseSinIva * ((item.tasaIva || 0) / 100);
          const totalLinea = baseSinIva + ivaLinea;

          return (
            <div
              key={item.codigoSecuencial}
              className="bg-white border border-gray-200 rounded-md shadow-sm"
            >
              {/* Nombre + badge + botón eliminar */}
              <div className="flex items-center justify-between px-3 pt-2.5 pb-1 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      BADGE_COLOR[item.tipoDetalle] ||
                      "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {ETIQUETAS_TIPO[item.tipoDetalle] || item.tipoDetalle}
                  </span>
                  <span className="font-extrabold text-md text-gray-900 uppercase truncate">
                    {item.nombre}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => quitarItem(item.codigoSecuencial)}
                  title="Quitar"
                  className="shrink-0 p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                >
                  <BorrarIcono size={14} />
                </button>
              </div>

              {/* Controles editables */}
              <div className="flex items-end flex-wrap gap-x-4 gap-y-2 px-3 pb-3">
                {/* Precio */}
                <div>
                  <FieldLabel>
                    {esCuentaContable ? "Importe" : "P. Unit."}
                  </FieldLabel>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.precioUnitario}
                    onChange={(e) =>
                      actualizarPrecioItem(
                        item.codigoSecuencial,
                        e.target.value,
                      )
                    }
                    className="w-24 px-2 py-1.5 border border-gray-200 rounded-md text-md font-black text-gray-900 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                  />
                </div>

                {/* Cantidad (no aplica a Cuenta Contable) */}
                {!esCuentaContable && (
                  <div>
                    <FieldLabel>Cant.</FieldLabel>
                    <input
                      type="number"
                      min="0"
                      value={item.cantidad}
                      onChange={(e) =>
                        actualizarCantidadItem(
                          item.codigoSecuencial,
                          e.target.value,
                        )
                      }
                      className="w-16 px-2 py-1.5 border border-gray-200 rounded-md text-md font-black text-gray-900 text-center focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                    />
                  </div>
                )}

                {/* IVA */}
                {(() => {
                  const sinIvaGravado =
                    mostrarSelectorFiscal &&
                    (item.tasaIva || 0) === 0 &&
                    (!item.tipoFiscal || item.tipoFiscal === "GRAVADO");
                  return (
                    <div>
                      <FieldLabel>
                        IVA{sinIvaGravado && (
                          <span className="ml-1 text-amber-500 animate-pulse">
                            ¡requerido!
                          </span>
                        )}
                      </FieldLabel>
                      <select
                        value={item.tasaIva || 0}
                        onChange={(e) => {
                          const nuevaTasa = e.target.value;
                          actualizarTasaIvaItem(item.codigoSecuencial, nuevaTasa);
                          if (parseFloat(nuevaTasa) !== 0) {
                            actualizarTipoFiscalItem(item.codigoSecuencial, "GRAVADO");
                          }
                        }}
                        className={`h-[30px] px-2 rounded-md text-md font-bold bg-white focus:outline-none cursor-pointer transition-all ${
                          sinIvaGravado
                            ? "border-2 border-amber-400 animate-pulse text-amber-700 focus:border-amber-500"
                            : "border border-gray-200 text-gray-700 focus:border-[var(--primary)]"
                        }`}
                      >
                        {TASAS_IVA.map((tasa) => (
                          <option key={tasa} value={tasa}>
                            {tasa === 0 ? "Sin IVA" : `${tasa}%`}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })()}

                {/* Tipo Fiscal — solo para FA/FB cuando tasaIva === 0 */}
                {mostrarSelectorFiscal && (item.tasaIva || 0) === 0 && (
                  <div>
                    <FieldLabel>Tipo Fiscal</FieldLabel>
                    <select
                      value={item.tipoFiscal || "GRAVADO"}
                      onChange={(e) =>
                        actualizarTipoFiscalItem(item.codigoSecuencial, e.target.value)
                      }
                      className="h-[30px] px-2 border border-gray-200 rounded-md text-md font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
                    >
                      {Object.entries(TIPO_FISCAL_OPTIONS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Total de línea */}
                <div className="ml-auto text-right">
                  <FieldLabel>Total c/IVA</FieldLabel>
                  <span className="text-md font-black text-gray-900">
                    {formatPrice(totalLinea)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totales */}
      <div className="border border-gray-100 rounded-md bg-white shadow-sm">
        <div className="px-4 py-3 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Subtotal sin IVA
            </span>
            <span className="text-md font-bold text-gray-700">
              {formatPrice(subtotalSinIva)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              IVA
            </span>
            <span className="text-md font-bold text-gray-700">
              {formatPrice(totalIva)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Otros Tributos
            </span>
            <input
              type="number"
              value={otrosTributos}
              onChange={(e) => setOtrosTributos && setOtrosTributos(parseFloat(e.target.value) || 0)}
              min={0}
              step="0.01"
              className="w-24 px-2 py-1 border border-gray-200 rounded-md text-sm font-bold text-gray-700 text-right focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          {totalRecargo > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                Recargo tarjeta
              </span>
              <span className="text-md font-bold text-orange-500">
                +{formatPrice(totalRecargo)}
              </span>
            </div>
          )}
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between items-center">
            <span className="text-md font-black text-gray-900 uppercase tracking-wider">
              Total General
            </span>
            <span className="text-base font-black text-[var(--primary)]">
              {formatPrice(subtotalSinIva + totalIva + (otrosTributos || 0) + totalRecargo)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarritoDetalle;
