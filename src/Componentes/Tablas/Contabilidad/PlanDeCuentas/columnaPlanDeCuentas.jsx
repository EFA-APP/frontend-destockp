const tipoColor = {
  ACTIVO: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  PASIVO: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  PATRIMONIO: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  RESULTADO_POSITIVO:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  RESULTADO_NEGATIVO: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  // Fallback para tipos antiguos si los hubiera
  RESULTADO: "bg-green-500/10 text-green-600 border-green-500/20",
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

export const columnasPlanDeCuentas = [
  {
    key: "codigo",
    etiqueta: "Código",
    renderizar: (valor, fila) => (
      <span
        className={`font-mono text-[13px] tracking-tight ${
          !fila.imputable ? "font-black text-black" : "text-black/60 font-bold"
        }`}
      >
        <Resaltar texto={valor} busqueda={fila._terminoBusqueda} />
      </span>
    ),
  },
  {
    key: "nombre",
    etiqueta: "Cuenta",
    renderizar: (valor, fila) => {
      const nivel = fila.nivel || 0;
      return (
        <div
          className="relative flex flex-col gap-0.5"
          style={{ paddingLeft: `${nivel * 28}px` }}
        >
          {/* Conectores Visuales "Premium" */}
          {nivel > 0 && (
            <div
              className="absolute top-[-20px] bottom-[14px] border-l-2 border-b-2 border-gray-200 rounded-bl-xl"
              style={{
                left: `${(nivel - 1) * 28 + 12}px`,
                width: "12px",
              }}
            />
          )}

          <div
            className={`flex items-center gap-2 text-[14px] leading-tight ${
              fila.imputable
                ? "font-bold text-black/80"
                : "font-black text-black uppercase tracking-tight"
            }`}
          >
            <Resaltar texto={valor} busqueda={fila._terminoBusqueda} />
          </div>

          {!fila.imputable && (
            <div className="text-[10px] text-[var(--primary)]/50 font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]/20" />
              Grupo de Cuentas
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: "tipo",
    etiqueta: "Tipo",
    renderizar: (valor) => (
      <span
        className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-md border ${tipoColor[valor] || "bg-black/5 text-black/40 border-black/10"}`}
      >
        {valor?.replace("_", " ")}
      </span>
    ),
  },
  {
    key: "imputable",
    etiqueta: "Imputable",
    renderizar: (valor) => (
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${valor ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-black/10"}`}
        />
        <span
          className={`text-[12px] font-bold ${valor ? "text-emerald-600" : "text-black/30"}`}
        >
          {valor ? "SÍ" : "NO"}
        </span>
      </div>
    ),
  },
  {
    key: "activa",
    etiqueta: "Estado",
    renderizar: (valor) => (
      <span
        className={`text-[11px] font-black uppercase tracking-widest ${
          valor !== false ? "text-emerald-600" : "text-rose-600"
        }`}
      >
        {valor !== false ? "ACTIVA" : "INACTIVA"}
      </span>
    ),
  },
];
