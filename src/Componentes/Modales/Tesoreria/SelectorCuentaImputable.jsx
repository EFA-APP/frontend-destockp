import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useObtenerCuentasImputablesQuery } from "../../../Backend/Contabilidad/queries/useCuentas.query";

const FieldLabel = ({ children }) => (
  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">
    {children}
  </span>
);

export const SelectorCuentaImputable = ({ tipoOperacion, value, onChange, codigoEmpresa }) => {
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const tipoCuenta =
    tipoOperacion === "EGRESO" ? "RESULTADO_NEGATIVO" : "RESULTADO_POSITIVO";

  const { data: cuentas = [], isFetching } = useObtenerCuentasImputablesQuery(
    tipoCuenta,
    busquedaDebounced || undefined,
    codigoEmpresa,
  );

  const seleccionar = (cuenta) => {
    onChange(cuenta);
    setBusqueda("");
    setBusquedaDebounced("");
    setAbierto(false);
  };

  return (
    <div ref={ref} className="relative">
      <FieldLabel>Cuenta a imputar</FieldLabel>
      {value ? (
        <div className="flex items-center gap-2 px-4 py-2.5 border border-[var(--primary)]/30 bg-[var(--primary)]/5 rounded-xl min-h-[44px] shadow-sm transition-all">
          <span className="flex-1 text-sm font-bold text-slate-800 truncate leading-tight">
            {value.nombre}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setAbierto(true);
            }}
            onFocus={() => setAbierto(true)}
            placeholder="Buscar cuenta contable..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] focus:bg-white placeholder:text-slate-400 transition-all"
          />
          {abierto && busqueda && (
            <div className="absolute z-[200] left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 max-h-56 overflow-y-auto ring-1 ring-black/5">
              {isFetching ? (
                <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  Buscando...
                </div>
              ) : cuentas.length === 0 ? (
                <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  Sin resultados
                </div>
              ) : (
                cuentas.map((c) => (
                  <button
                    key={c.codigo}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      seleccionar(c);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer transition-colors flex flex-col gap-0.5 group"
                  >
                    <div className="font-bold text-slate-700 group-hover:text-[var(--primary)] transition-colors">{c.nombre}</div>
                    <div className="text-xs font-medium text-slate-400">{c.codigo}</div>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
