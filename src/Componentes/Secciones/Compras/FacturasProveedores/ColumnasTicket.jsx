import { BorrarIcono } from "../../../../assets/Icons";
import { formatPrice } from "../../../../utils/formatters";

export const ColumnasTicket = ({
  actualizarItem,
  eliminarItem,
  calcularSubtotal,
  inputCodigoRef,
}) => [
  {
    key: "cantidad",
    etiqueta: "Cant.",
    renderizar: (valor, fila) => {
      // En DataTable, 'fila' es el objeto del array.
      // Para actualizar, necesitamos saber el índice.
      // Pero useVentaCart.actualizarItem(index, campo, valor) espera el índice.
      // Vamos a tener que manejar esto.
      return (
        <div className="w-full flex justify-end md:justify-center">
          <input
            type="number"
            value={valor}
            onChange={(e) => {
              const index = fila._pos; // Si le agregamos la posición a la fila antes de pasarla
              actualizarItem(
                index,
                "cantidad",
                parseFloat(e.target.value) || 0,
              );
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                inputCodigoRef.current?.focus();
                inputCodigoRef.current?.select();
              }
            }}
            className="w-16 h-9 bg-black/[0.03] text-end md:text-center font-black text-black text-sm focus:outline-none focus:bg-black focus:text-white rounded-md transition-all"
          />
        </div>
      );
    },
  },
  {
    key: "nombre",
    etiqueta: "Descripción del Item",
    renderizar: (valor, fila) => (
      <div className="flex flex-col gap-0.5">
        <input
          type="text"
          value={valor}
          onChange={(e) =>
            actualizarItem(fila._pos, "nombre", e.target.value.toUpperCase())
          }
          className="bg-transparent text-[13px] font-black text-black focus:outline-none focus:bg-black/5 rounded px-1 -ml-1 w-full border-none transition-all"
        />
        <input
          type="text"
          value={fila.descripcion || ""}
          placeholder="Sin observaciones..."
          onChange={(e) =>
            actualizarItem(fila._pos, "descripcion", e.target.value)
          }
          className="bg-transparent text-[10px] font-bold text-[var(--primary)]/70 uppercase tracking-widest focus:outline-none focus:bg-black/5 rounded px-1 -ml-1 w-full border-none transition-all placeholder:text-black/10"
        />
      </div>
    ),
  },
  {
    key: "precioUnitario",
    etiqueta: "P. Unitario",
    renderizar: (valor, fila) => (
      <div className="relative flex items-center justify-end">
        <span className="absolute left-0 text-[10px] font-black text-black/20">
          $
        </span>
        <input
          id={`price-input-${fila._pos}`}
          type="number"
          value={valor}
          onChange={(e) =>
            actualizarItem(
              fila._pos,
              "precioUnitario",
              parseFloat(e.target.value) || 0,
            )
          }
          className="w-24 h-9 bg-transparent text-right font-black text-black text-[14px] focus:outline-none focus:bg-black/5 rounded px-2 transition-all"
        />
      </div>
    ),
  },
  {
    key: "subtotal",
    etiqueta: "Subtotal",
    renderizar: (_, fila) => {
      const subtotal = calcularSubtotal(fila);
      return (
        <span className="text-[14px] font-black text-black tracking-tight">
          {formatPrice(subtotal)}
        </span>
      );
    },
  },
  {
    key: "acciones",
    etiqueta: "",
    renderizar: (_, fila) => (
      <div className="flex justify-center">
        <button
          onClick={() => eliminarItem(fila._pos)}
          className="p-2 text-red-500 bg-red-500/20 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
          title="Quitar item"
        >
          <BorrarIcono size={18} />
        </button>
      </div>
    ),
  },
];
