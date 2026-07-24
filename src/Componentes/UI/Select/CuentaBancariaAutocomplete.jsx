import { useState, useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { useCuentasBancariasQuery } from "../../../Backend/Tesoreria/queries/useCuentasBancarias.query";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";

const FieldLabel = ({ children }) => (
  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1 block">
    {children}
  </span>
);

// Feature "bancos" (T48, R70): reemplaza a `BancoAutocomplete`. Antes
// elegía directamente una cuenta del plan de cuentas de `contabilidad-ms`
// (`useObtenerCuentasImputablesQuery`); ahora elige una `CuentaBancaria`
// real de `tesoreria-ms` (`useCuentasBancariasQuery`). El valor entregado a
// `onChange` pasa a ser esa `CuentaBancaria` (con `banco`, `alias`,
// `numeroCuenta`, `codigoCuentaContable`), no una cuenta contable.
//
// Feature "cheques-terceros-integracion-bancos" (R36): extraído desde
// `DetallePago.jsx` (donde se originó, feature "bancos") a este componente
// compartido para reutilizarlo también en `ModalDestinoCheque.jsx`
// (acción COBRAR) y `ModalAccionAvanzadaCheque.jsx` (acción DESCONTAR),
// sin duplicar la lógica de búsqueda/debounce/filtrado en más de un
// archivo. Mismo código/props que tenía inline en `DetallePago.jsx`.
export const CuentaBancariaAutocomplete = ({ value, onChange, label = "Banco destino" }) => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;

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

  // A diferencia del plan de cuentas (potencialmente extenso, con búsqueda
  // server-side), el listado de CuentaBancaria de una empresa es acotado:
  // se trae completo (activas) y se filtra en memoria por lo que el
  // usuario escribe (ListarCuentaBancariaFiltroDto no expone `busqueda`).
  const { data: cuentas = [], isFetching } = useCuentasBancariasQuery({
    codigoEmpresa,
    activa: true,
  });

  const cuentasFiltradas = useMemo(() => {
    if (!busquedaDebounced) return cuentas;
    const q = busquedaDebounced.toLowerCase();
    return cuentas.filter((c) =>
      [c.alias, c.banco?.nombre, c.numeroCuenta, c.cbu]
        .filter(Boolean)
        .some((campo) => String(campo).toLowerCase().includes(q)),
    );
  }, [cuentas, busquedaDebounced]);

  const seleccionar = (cuenta) => {
    onChange(cuenta);
    setBusqueda("");
    setBusquedaDebounced("");
    setAbierto(false);
  };

  return (
    <div ref={ref} className="flex-1 min-w-[180px] relative">
      <FieldLabel>{label}</FieldLabel>
      {value ? (
        <div className="flex items-center gap-1.5 px-2 py-1.5 border border-[var(--primary)]/30 bg-[var(--primary)]/5 rounded-md min-h-[30px]">
          <span className="flex-1 text-md font-bold text-gray-900 truncate leading-tight">
            {value.alias || `${value.banco?.nombre ?? ""} ${value.numeroCuenta ?? ""}`.trim()}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-gray-400 hover:text-red-500 cursor-pointer shrink-0"
          >
            <X size={11} />
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
            placeholder="Escribí para buscar..."
            className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-md font-bold text-gray-900 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 placeholder:font-normal"
          />
          {abierto && busqueda && (
            <div className="absolute z-[200] left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {isFetching ? (
                <div className="px-3 py-2 text-md font-semibold text-gray-400 uppercase tracking-wider">
                  Buscando...
                </div>
              ) : cuentasFiltradas.length === 0 ? (
                <div className="px-3 py-2 text-md font-semibold text-gray-400 uppercase tracking-wider">
                  Sin resultados
                </div>
              ) : (
                cuentasFiltradas.map((c) => (
                  <button
                    key={c.codigo}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      seleccionar(c);
                    }}
                    className="w-full text-left px-3 py-2 text-md hover:bg-[var(--primary)]/10 border-b border-gray-100 last:border-0 cursor-pointer"
                  >
                    <div className="font-bold text-gray-900">{c.alias || c.numeroCuenta}</div>
                    <div className="text-md text-gray-400">{c.banco?.nombre}</div>
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

export default CuentaBancariaAutocomplete;
