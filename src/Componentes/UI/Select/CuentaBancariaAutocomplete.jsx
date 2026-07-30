import { useCuentasBancariasQuery } from "../../../Backend/Tesoreria/queries/useCuentasBancarias.query";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";

const FieldLabel = ({ children }) => (
  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1 block">
    {children}
  </span>
);

export const CuentaBancariaAutocomplete = ({ value, onChange, label = "Banco destino" }) => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;

  const { data: cuentas = [], isFetching } = useCuentasBancariasQuery({
    codigoEmpresa,
    activa: true,
  });

  return (
    <div className="flex-1 min-w-[180px] relative">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value?.codigo || ""}
        onChange={(e) => {
          if (!e.target.value) {
            onChange(null);
            return;
          }
          const c = cuentas.find((cuenta) => cuenta.codigo === Number(e.target.value));
          onChange(c || null);
        }}
        disabled={isFetching}
        className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 cursor-pointer shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">— Seleccioná Banco —</option>
        {cuentas.map((c) => (
          <option key={c.codigo} value={c.codigo}>
            {c.alias || c.numeroCuenta} - {c.banco?.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CuentaBancariaAutocomplete;
