import { memo } from "react";
import { CarritoIcono, BorrarIcono } from "../../../../assets/Icons";

const TablaTicket = ({
  items,
  actualizarItem,
  eliminarItem,
  calcularSubtotal,
  inputCodigoRef,
}) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
      <div className="bg-white min-h-full flex flex-col ">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[var(--primary)]/20 sticky top-0 z-10">
            <tr className="text-[10px] font-black text-[var(--primary-text)]/60 uppercase tracking-[0.2em]">
              <th className="px-6 py-4 w-24 text-center">Cant.</th>
              <th className="px-6 py-4">Descripción del Item</th>
              <th className="px-6 py-4 text-right hidden lg:table-cell">
                P. Unitario
              </th>
              <th className="px-6 py-4 text-right">Subtotal</th>
              <th className="px-4 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03]">
            {items.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                      <CarritoIcono size={40} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-black uppercase tracking-widest text-black">
                        Carrito Vacío
                      </span>
                      <span className="text-[11px] font-bold text-black/30 max-w-[200px] mx-auto leading-relaxed">
                        Utilice el buscador para cargar productos al
                        comprobante.
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const subtotalItem = calcularSubtotal(item);
                return (
                  <tr
                    key={index}
                    className="group hover:bg-black/[0.01] transition-colors"
                  >
                    {/* Cantidad Editable */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <input
                          id={`input-cant-${index}`}
                          type="number"
                          value={item.cantidad}
                          onChange={(e) =>
                            actualizarItem(
                              index,
                              "cantidad",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              inputCodigoRef.current?.focus();
                              inputCodigoRef.current?.select();
                            }
                          }}
                          className="w-16 h-9 bg-black/[0.03] text-center font-black text-black text-sm focus:outline-none focus:bg-black focus:text-white rounded-lg transition-all"
                        />
                      </div>
                    </td>

                    {/* Descripción / Nombre Editable */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <input
                          type="text"
                          value={item.nombre}
                          onChange={(e) =>
                            actualizarItem(
                              index,
                              "nombre",
                              e.target.value.toUpperCase(),
                            )
                          }
                          className="bg-transparent text-[13px] font-black text-black focus:outline-none focus:bg-black/5 rounded px-1 -ml-1 w-full border-none transition-all"
                        />
                        <input
                          type="text"
                          value={item.descripcion || ""}
                          placeholder="Sin observaciones..."
                          onChange={(e) =>
                            actualizarItem(index, "descripcion", e.target.value)
                          }
                          className="bg-transparent text-[10px] font-bold text-[var(--primary)]/70 uppercase tracking-widest focus:outline-none focus:bg-black/5 rounded px-1 -ml-1 w-full border-none transition-all placeholder:text-black/10"
                        />
                      </div>
                    </td>

                    {/* Precio Unitario Editable */}
                    <td className="px-6 py-4 text-right hidden lg:table-cell">
                      <div className="relative flex items-center justify-end">
                        <span className="absolute left-0 text-[10px] font-black text-black/20">
                          $
                        </span>
                        <input
                          type="number"
                          value={item.precioUnitario}
                          onChange={(e) =>
                            actualizarItem(
                              index,
                              "precioUnitario",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-24 h-9 bg-transparent text-right font-black text-black text-[14px] focus:outline-none focus:bg-black/5 rounded px-2 transition-all"
                        />
                      </div>
                    </td>

                    {/* Subtotal Total del Item */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-[14px] font-black text-black tracking-tight">
                        $
                        {subtotalItem.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* Acción Borrar */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => eliminarItem(index)}
                        className="p-2 text-red-500 bg-red-500/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Quitar item"
                      >
                        <BorrarIcono size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(TablaTicket);
