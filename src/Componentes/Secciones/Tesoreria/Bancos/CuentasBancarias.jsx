import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Landmark,
  Plus,
  ArrowRight,
  Pencil,
  Building2,
  CreditCard,
  ChevronRight,
  Activity,
} from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useCuentasBancariasQuery } from "../../../../Backend/Tesoreria/queries/useCuentasBancarias.query";
import { formatPrice } from "../../../../utils/formatters";
import ModalCuentaBancaria from "./ModalCuentaBancaria";

// Feature "bancos" (T47, R1-R8, R71, R72): ABM de Cuentas Bancarias
const CuentasBancarias = () => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;

  const [soloActivas, setSoloActivas] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, cuenta: null });

  const { data: cuentas = [], isLoading } = useCuentasBancariasQuery({
    codigoEmpresa,
    ...(soloActivas ? { activa: true } : {}),
  });

  // Cálculo de KPIs rápidos
  const totalSaldo = cuentas.reduce(
    (acc, c) => acc + (c.activa ? Number(c.saldo || 0) : 0),
    0,
  );
  const cuentasActivas = cuentas.filter((c) => c.activa).length;

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Tesorería</span>
            <ChevronRight size={12} />
            <span>Bancos</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Landmark className="text-[#1FAE6D]" size={28} strokeWidth={2.5} />
            Cuentas Bancarias
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Gestión centralizada de cuentas, saldos y conciliación bancaria.
          </p>
        </div>

        <button
          onClick={() => setModal({ isOpen: true, cuenta: null })}
          className="flex items-center gap-2.5 px-6 py-2.5 rounded-md bg-gray-900 hover:bg-black text-white text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          Nueva Cuenta
        </button>
      </div>

      {/* KPIs (Impacto Visual) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-md p-6 border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-35 transition-opacity">
            <Landmark size={80} color="var(--primary)" />
          </div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            Posición Consolidada
          </p>
          <p className="text-3xl font-black text-gray-900">
            {formatPrice(totalSaldo)}
          </p>
          <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
            <Activity size={14} /> Saldo total en cuentas activas
          </p>
        </div>

        <div className="bg-white rounded-md p-6 border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            Cuentas Operativas
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-gray-900">
              {cuentasActivas}
            </p>
            <p className="text-sm font-bold text-gray-400">
              / {cuentas.length} registradas
            </p>
          </div>
        </div>
      </div>

      {/* MAIN DATA TABLE */}
      <div className="bg-white border border-gray-200 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden">
        {/* TOOLBAR */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-gray-900">
              Listado de Cuentas
            </h2>
            <div className="h-4 w-px bg-gray-300"></div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={soloActivas}
                onChange={(e) => setSoloActivas(e.target.checked)}
                className="w-4 h-4 accent-gray-900 cursor-pointer rounded-sm border-gray-300"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 group-hover:text-gray-900 transition-colors">
                Ocultar inactivas
              </span>
            </label>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                {[
                  "Institución / Alias",
                  "Tipo",
                  "CBU / N° Cuenta",
                  "Imputación Contable",
                  "Saldo Disponible",
                  "Estado",
                  "",
                ].map((col, i) => (
                  <th
                    key={i}
                    className={`px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap bg-gray-50/30 ${i === 4 ? "text-right" : ""} ${i === 6 ? "text-right" : ""}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                      <p className="font-bold text-sm tracking-wide text-gray-500">
                        CARGANDO INFORMACIÓN...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : cuentas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                      <Building2
                        size={40}
                        strokeWidth={1}
                        className="text-gray-300 mb-2"
                      />
                      <p className="font-bold text-gray-600">Registro vacío</p>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto">
                        Aún no se han configurado cuentas bancarias.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                cuentas.map((c) => (
                  <tr
                    key={c.codigo}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          <Building2 size={18} className="text-gray-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">
                            {c.banco?.nombre}
                          </span>
                          <span className="text-[12px] font-semibold text-gray-500 mt-0.5">
                            {c.alias || "Sin alias"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="text-[12px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200/60">
                        {c.tipoCuenta?.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-gray-800 font-mono tracking-tight">
                          {c.cbu || "—"}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500 font-mono flex items-center gap-1.5 mt-1">
                          <CreditCard size={12} />
                          N° {c.numeroCuenta}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      {c.codigoCuentaContable ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-sm bg-[#1FAE6D]" />
                          <span className="text-[12px] font-bold text-gray-700 font-mono">
                            {c.codigoCuentaContable}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md border border-rose-100 uppercase tracking-wider">
                          Sin Asignar
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <span className="text-lg font-black text-gray-900 tracking-tight">
                        {formatPrice(c.saldo)}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                          c.activa
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${c.activa ? "bg-emerald-500" : "bg-gray-400"}`}
                        />
                        {c.activa ? "Activa" : "Inactiva"}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModal({ isOpen: true, cuenta: c })}
                          title="Configuración"
                          className="p-2 rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-300 shadow-sm transition-all"
                        >
                          <Pencil size={14} strokeWidth={2.5} />
                        </button>

                        <Link
                          to={`/panel/tesoreria/bancos/cuentas/${c.codigo}`}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-900 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm hover:bg-black transition-all"
                        >
                          Libro Banco
                          <ArrowRight size={14} strokeWidth={2.5} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.isOpen && (
        <ModalCuentaBancaria
          cuenta={modal.cuenta}
          onClose={() => setModal({ isOpen: false, cuenta: null })}
        />
      )}
    </div>
  );
};

export default CuentasBancarias;
