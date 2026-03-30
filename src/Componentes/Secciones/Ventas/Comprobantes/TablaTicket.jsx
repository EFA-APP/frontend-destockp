import { CarritoIcono, BorrarIcono } from "../../../../assets/Icons";

const TablaTicket = ({
  items,
  actualizarItem,
  eliminarItem,
  calcularSubtotal,
}) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
      <div className="bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] shadow-sm overflow-hidden min-h-full flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#151515] sticky top-0 border-b border-white/5 shadow-sm">
            <tr className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
              <th className="px-4 py-3 w-12 text-center">Cant</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3 text-right hidden lg:table-cell">
                P. Unit
              </th>
              <th className="px-4 py-3 text-right">Subtotal</th>
              <th className="px-2 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {items.length === 0 ? (
              <tr>
                <td colSpan="5" className="h-[30vh] text-center">
                  <div className="flex flex-col items-center justify-center opacity-30 text-[var(--text-primary)] gap-3">
                    <CarritoIcono size={48} />
                    <span className="text-sm font-bold uppercase tracking-widest">
                      Ticket Vacío
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const subtotalItem = calcularSubtotal(item);
                return (
                  <tr
                    key={index}
                    className={`hover:bg-[var(--surface-hover)] transition-colors group`}
                  >
                    {/* Cantidad Editable */}
                    <td className="px-2 py-2 w-20 text-center relative border-r border-[var(--border-subtle)]/50">
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) =>
                          actualizarItem(
                            index,
                            "cantidad",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full bg-transparent text-center font-black text-[var(--text-primary)] text-sm focus:outline-none focus:bg-[var(--fill)] rounded py-1"
                      />
                    </td>

                    {/* Descripción / Nombre Editable */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
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
                          className="bg-transparent text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:bg-[var(--fill)] rounded w-full border-none p-0 transition-colors"
                        />
                        <input
                          type="text"
                          value={item.descripcion || ""}
                          placeholder="Agregar detalle..."
                          onChange={(e) =>
                            actualizarItem(index, "descripcion", e.target.value)
                          }
                          className="bg-transparent text-[10px] font-medium text-[var(--primary-light)] uppercase tracking-widest focus:outline-none focus:bg-[var(--fill)] rounded w-full border-none p-0"
                        />
                      </div>
                    </td>

                    {/* Precio Unitario Editable */}
                    <td className="px-3 py-2 text-right w-28 hidden lg:table-cell">
                      <div className="relative flex items-center justify-end">
                        <span className="absolute left-2 text-[10px] text-[var(--text-muted)]">
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
                          className="w-full bg-transparent text-right font-bold text-[var(--text-primary)] focus:outline-none focus:bg-[var(--fill)] rounded pl-4 pr-1 py-1"
                        />
                      </div>
                    </td>

                    {/* Subtotal Total del Item */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-black text-[var(--text-primary)]">
                        $
                        {subtotalItem.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* Acción Borrar */}
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => eliminarItem(index)}
                        className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        title="Quitar item"
                      >
                        <BorrarIcono size={16} />
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

export default TablaTicket;
