import { useEffect, useState } from "react";
import { X, Check, Landmark } from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useAlertas } from "../../../../store/useAlertas";
import { useBancosQuery } from "../../../../Backend/Tesoreria/queries/useBancos.query";
import { useObtenerCuentasImputablesQuery } from "../../../../Backend/Contabilidad/queries/useCuentas.query";
import {
  useCrearCuentaBancariaMutation,
  useEditarCuentaBancariaMutation,
} from "../../../../Backend/Tesoreria/queries/useCuentasBancarias.query";
import SearchableSelect from "../../../UI/Select/SearchableSelect";

const FieldLabel = ({ children }) => (
  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">
    {children}
  </span>
);

const InputField = ({ label, ...props }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <input
      {...props}
      onFocus={(e) => {
        if (props.onFocus) props.onFocus(e);
        e.target.select();
      }}
      className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all disabled:bg-gray-50 disabled:text-gray-400"
    />
  </div>
);

const estadoInicial = (cuenta) => ({
  codigoBanco: cuenta?.codigoBanco ? String(cuenta.codigoBanco) : "",
  bancoNombre: cuenta?.banco?.nombre || "",
  tipoCuenta: cuenta?.tipoCuenta || "CUENTA_CORRIENTE",
  numeroCuenta: cuenta?.numeroCuenta || "",
  cbu: cuenta?.cbu || "",
  alias: cuenta?.alias || "",
  sucursal: cuenta?.sucursal || "",
  moneda: cuenta?.moneda || "ARS",
  codigoCuentaContable: cuenta?.codigoCuentaContable ?? null,
  activa: cuenta?.activa ?? true,
});

// Feature "bancos" (T47, R1-R8, R6): alta/edición de CuentaBancaria.
const ModalCuentaBancaria = ({ cuenta, onClose }) => {
  const esEdicion = Boolean(cuenta?.codigo);
  const { usuario, unidadActiva } = useAuthStore();
  const agregarAlerta = useAlertas((s) => s.agregarAlerta);

  const [form, setForm] = useState(estadoInicial(cuenta));
  const [busquedaBanco, setBusquedaBanco] = useState("");
  const [busquedaCuentaContable, setBusquedaCuentaContable] = useState("");
  const [busquedaCuentaContableDebounced, setBusquedaCuentaContableDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setBusquedaCuentaContableDebounced(busquedaCuentaContable), 300);
    return () => clearTimeout(t);
  }, [busquedaCuentaContable]);

  const { data: bancos = [], isLoading: isLoadingBancos } = useBancosQuery(busquedaBanco);
  const opcionesBanco = bancos.map((b) => ({ value: String(b.codigo), label: b.nombre }));

  const { data: cuentasContables = [] } = useObtenerCuentasImputablesQuery(
    "ACTIVO",
    busquedaCuentaContableDebounced || undefined,
    usuario?.codigoEmpresa,
  );
  const opcionesCuentaContable = cuentasContables.map((c) => ({
    value: String(c.codigoSecuencial || c.codigo),
    label: `${c.codigoSecuencial || c.codigo} — ${c.nombre}`,
  }));

  const mCrear = useCrearCuentaBancariaMutation();
  const mEditar = useEditarCuentaBancariaMutation();
  const isPending = mCrear.isPending || mEditar.isPending;

  const handleKeyDownNext = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "BUTTON" && e.target.type !== "submit") {
      e.preventDefault();
      const formEl = e.currentTarget;
      const focusables = Array.from(
        formEl.querySelectorAll("select:not([disabled]), input:not([disabled]), button:not([disabled])")
      );
      const idx = focusables.indexOf(e.target);
      if (idx >= 0 && idx < focusables.length - 1) {
        focusables[idx + 1].focus();
        if (focusables[idx + 1].select) focusables[idx + 1].select();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!esEdicion && !form.codigoBanco) {
      agregarAlerta({ type: "error", message: "Debe seleccionar un banco" });
      return;
    }
    if (!esEdicion && !form.numeroCuenta) {
      agregarAlerta({ type: "error", message: "El número de cuenta es obligatorio" });
      return;
    }

    const contexto = {
      codigoEmpresa: usuario?.codigoEmpresa,
      codigoUnidadNegocio: unidadActiva?.codigo,
    };

    if (esEdicion) {
      mEditar.mutate(
        {
          codigo: cuenta.codigo,
          payload: {
            cbu: form.cbu || undefined,
            alias: form.alias || undefined,
            sucursal: form.sucursal || undefined,
            codigoCuentaContable: form.codigoCuentaContable || undefined,
            activa: form.activa,
          },
          contexto,
        },
        {
          onSuccess: () => {
            agregarAlerta({ type: "success", message: "Cuenta bancaria actualizada" });
            onClose();
          },
          onError: (err) =>
            agregarAlerta({ type: "error", message: err?.response?.data?.message || err.message }),
        },
      );
    } else {
      mCrear.mutate(
        {
          payload: {
            codigoBanco: Number(form.codigoBanco),
            tipoCuenta: form.tipoCuenta,
            numeroCuenta: form.numeroCuenta,
            cbu: form.cbu || undefined,
            alias: form.alias || undefined,
            sucursal: form.sucursal || undefined,
            moneda: form.moneda || undefined,
            codigoCuentaContable: form.codigoCuentaContable || undefined,
          },
          contexto,
        },
        {
          onSuccess: () => {
            agregarAlerta({ type: "success", message: "Cuenta bancaria creada" });
            onClose();
          },
          onError: (err) =>
            agregarAlerta({ type: "error", message: err?.response?.data?.message || err.message }),
        },
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] border border-gray-100 overflow-visible">
        {/* HEADER CORPORATIVO */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-[#1FAE6D] border border-emerald-200/60 flex items-center justify-center font-black">
              <Landmark size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-gray-900">
                {esEdicion ? "Editar Cuenta Bancaria" : "Nueva Cuenta Bancaria"}
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                {esEdicion ? "Modificá datos y vinculación contable" : "Configurá una nueva entidad financiera"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-gray-900 rounded-md transition-all shadow-sm cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form
          id="form-cuenta-bancaria"
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDownNext}
          className="p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Banco</FieldLabel>
              {esEdicion ? (
                <div className="h-11 px-3 flex items-center border border-gray-200 bg-gray-50 rounded-md text-sm font-semibold text-gray-700">
                  {form.bancoNombre}
                </div>
              ) : (
                <SearchableSelect
                  options={opcionesBanco}
                  value={form.codigoBanco}
                  onChange={(e) => setForm((p) => ({ ...p, codigoBanco: e.target.value }))}
                  onSearchChange={setBusquedaBanco}
                  placeholder={isLoadingBancos ? "Cargando bancos..." : "Seleccione un banco"}
                />
              )}
            </div>
            <div>
              <FieldLabel>Tipo de cuenta</FieldLabel>
              <select
                value={form.tipoCuenta}
                disabled={esEdicion}
                onChange={(e) => setForm((p) => ({ ...p, tipoCuenta: e.target.value }))}
                className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="CAJA_AHORRO">Caja de Ahorro</option>
                <option value="CUENTA_CORRIENTE">Cuenta Corriente</option>
                <option value="OTRA">Otra</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Número de cuenta"
              type="text"
              value={form.numeroCuenta}
              disabled={esEdicion}
              onChange={(e) => setForm((p) => ({ ...p, numeroCuenta: e.target.value }))}
            />
            <InputField
              label="CBU"
              type="text"
              value={form.cbu}
              onChange={(e) => setForm((p) => ({ ...p, cbu: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Alias"
              type="text"
              value={form.alias}
              onChange={(e) => setForm((p) => ({ ...p, alias: e.target.value }))}
            />
            <InputField
              label="Sucursal"
              type="text"
              value={form.sucursal}
              onChange={(e) => setForm((p) => ({ ...p, sucursal: e.target.value }))}
            />
          </div>

          <div>
            <FieldLabel>Cuenta contable asociada (opcional)</FieldLabel>
            <SearchableSelect
              options={opcionesCuentaContable}
              value={form.codigoCuentaContable}
              onChange={(e) => setForm((p) => ({ ...p, codigoCuentaContable: e.target.value }))}
              onSearchChange={setBusquedaCuentaContable}
              placeholder="Buscar o seleccionar cuenta del plan de cuentas..."
            />
          </div>

          {esEdicion && (
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.activa}
                onChange={(e) => setForm((p) => ({ ...p, activa: e.target.checked }))}
                className="w-4 h-4 accent-gray-900 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Cuenta activa</span>
            </label>
          )}
        </form>

        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-black uppercase tracking-wider text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md shadow-sm transition-all cursor-pointer"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-cuenta-bancaria"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2 bg-[#1FAE6D] hover:bg-[#178F58] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={16} strokeWidth={3} />
            {isPending ? "Guardando..." : "Guardar Cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCuentaBancaria;
