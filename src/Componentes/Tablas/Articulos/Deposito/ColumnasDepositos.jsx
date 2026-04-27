import { MapPin, Building2, User, Phone } from "lucide-react";

export const columnasDepositos = [
  {
    key: "nombre",
    etiqueta: "Depósito",
    renderizar: (valor, fila) => (
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${fila.principal ? 'bg-emerald-700/10 border-emerald-700/20 text-emerald-600' : 'bg-amber-700/10 border-amber-700/20 text-amber-600'}`}>
          <Building2 size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-[16px] font-black text-[var(--text-primary)] uppercase tracking-tight leading-tight">
            {valor}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
             <div className={`w-1.5 h-1.5 rounded-full ${fila.principal ? 'bg-emerald-600' : 'bg-amber-600'}`} />
             <span className="text-[11px] font-bold text-black/40 uppercase tracking-widest">
                {fila.principal ? "Nodo Central" : "Sucursal Activa"}
             </span>
          </div>
        </div>
      </div>
    )
  },
  {
    key: "responsable",
    etiqueta: "Responsable",
    renderizar: (valor) => (
      <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-[14px]">
        <User size={14} className="text-[var(--primary)] opacity-40" />
        {valor || "Sin responsable"}
      </div>
    )
  },
  {
    key: "direccion",
    etiqueta: "Ubicación",
    renderizar: (valor, fila) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-[14px]">
          <MapPin size={14} className="text-[var(--primary)] opacity-40" />
          {fila.ciudad || "S/D"}
        </div>
        <span className="text-[12px] text-black/40 font-medium ml-5 truncate max-w-[200px]">
          {valor || "Sin dirección"}
        </span>
      </div>
    )
  },
  {
      key: "telefono",
      etiqueta: "Contacto",
      renderizar: (valor) => (
        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-[14px]">
          <Phone size={14} className="text-[var(--primary)] opacity-40" />
          {valor || "Sin teléfono"}
        </div>
      )
  }
];
