import { formatPrice, formatDate } from "../../../../utils/formatters";

const tipoColor = {
  VENTAS: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  COMPRAS: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  MANUAL: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

// Helper para resaltar texto coincidente
const Resaltar = ({ texto, busqueda }) => {
  if (!busqueda || !texto) return texto;
  const partes = texto.toString().split(new RegExp(`(${busqueda})`, "gi"));
  return (
    <>
      {partes.map((parte, i) =>
        parte.toLowerCase() === busqueda.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-black px-0.5 rounded-sm">
            {parte}
          </mark>
        ) : (
          parte
        ),
      )}
    </>
  );
};

export const columnasAsientos = [
  {
    key: "fecha",
    etiqueta: "Fecha",
    renderizar: (valor, fila) => (
      <div className="flex flex-col gap-1.5 py-1">
        <span className="text-[13px] font-bold text-black/70 tracking-tight">
          {formatDate(valor)}
        </span>
        <span
          className={`w-fit text-[10px] border rounded-md px-2 py-0.5 font-black uppercase tracking-widest ${
            tipoColor[fila.origen]
          }`}
        >
          {fila.origen}
        </span>
      </div>
    ),
  },
  {
    key: "descripcion",
    etiqueta: "Descripción",
    renderizar: (valor, fila) => (
      <div className="flex flex-col py-1">
        <span className="font-bold text-[14px] text-black/80 leading-tight">
          <Resaltar texto={valor} busqueda={fila._terminoBusqueda} />
        </span>
        {fila.referencia && (
          <span className="text-[11px] text-black/40 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-black/20" />
            Ref:{" "}
            <Resaltar
              texto={fila.referencia}
              busqueda={fila._terminoBusqueda}
            />
          </span>
        )}
      </div>
    ),
  },
  {
    key: "totalDebe",
    etiqueta: "Debe",
    renderizar: (valor) => (
      <span className="font-black text-[14px] text-emerald-600 font-mono">
        {formatPrice(valor)}
      </span>
    ),
  },
  {
    key: "totalHaber",
    etiqueta: "Haber",
    renderizar: (valor) => (
      <span className="font-black text-[14px] text-rose-600 font-mono">
        {formatPrice(valor)}
      </span>
    ),
  },
];
