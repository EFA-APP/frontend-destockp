import { Link } from "react-router-dom";
import {
  Landmark,
  Wallet,
  ArrowLeftRight,
  HandCoins,
  Settings2,
  ArrowRight,
  Building2,
  TrendingUp,
  Search,
} from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useCuentasBancariasQuery } from "../../../../Backend/Tesoreria/queries/useCuentasBancarias.query";
import { formatPrice } from "../../../../utils/formatters";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const Dashboard = () => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;

  const { data: cuentas = [], isLoading } = useCuentasBancariasQuery({
    codigoEmpresa,
    activa: true,
  });

  const saldoTotal = cuentas.reduce((acc, c) => acc + (c.saldo || 0), 0);

  const accesos = [
    {
      to: "/panel/tesoreria/bancos/cuentas",
      label: "Cuentas",
      desc: "Gestión de saldos",
      icon: Landmark,
    },
    {
      to: "/panel/tesoreria/bancos/transferencias",
      label: "Transferir",
      desc: "Entre cuentas propias",
      icon: ArrowLeftRight,
    },
    {
      to: "/panel/tesoreria/bancos/depositos",
      label: "Depósitos",
      desc: "Efectivo y Valores",
      icon: HandCoins,
    },
    {
      to: "/panel/tesoreria/cheques-propios",
      label: "Cheques Propios",
      desc: "Cartera y emisión",
      icon: Settings2,
    },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Tesorería</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Dashboard</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Building2 color="var(--primary)" size={28} strokeWidth={2.5} />
            Centro Financiero
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Resumen consolidado de tu posición bancaria y accesos rápidos a la
            operatoria diaria.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA (Principal) */}
        <div className="lg:col-span-8 space-y-8">
          {/* KPI PRINCIPAL */}
          <div className="bg-gray-900 rounded-md p-8 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
              <Wallet size={200} />
            </div>

            <div className="relative z-10">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Posición Global Consolidada
              </p>
              <div className="flex items-baseline gap-4">
                <p className="text-5xl font-black text-white tracking-tight">
                  {formatPrice(saldoTotal)}
                </p>
                <p className="text-sm font-bold text-[#1FAE6D] flex items-center gap-1 bg-[#1FAE6D]/10 px-3 py-1 rounded-md">
                  <TrendingUp size={14} strokeWidth={3} />
                  En cuentas activas
                </p>
              </div>
            </div>
          </div>

          {/* ACCESOS RÁPIDOS */}
          <div>
            <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
              Operatoria Diaria
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {accesos.map(({ to, label, desc, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex flex-col items-start gap-4 bg-white border border-gray-200 rounded-md p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-gray-900 hover:shadow-lg transition-all"
                >
                  <div className="p-3 rounded-md bg-gray-900 text-white group-hover:bg-black transition-colors">
                    <Icon size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{label}</h3>
                    <p className="text-[11px] font-medium text-gray-500 mt-1">
                      {desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (Mini Libro / Cuentas) */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-gray-200 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Landmark size={16} className="text-gray-400" />
                Cuentas Bancarias
              </span>
              <Link
                to="/panel/tesoreria/bancos/cuentas"
                className="text-[10px] font-black text-[#1FAE6D] uppercase tracking-wider hover:text-[#178F58] flex items-center gap-1 transition-colors"
              >
                Ver Todas <ArrowRight size={12} strokeWidth={3} />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                  <p className="font-bold text-[10px] tracking-widest uppercase">
                    Cargando...
                  </p>
                </div>
              ) : cuentas.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Landmark size={24} className="text-gray-300" />
                  <p className="font-bold text-[11px] uppercase tracking-widest">
                    Sin cuentas
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {cuentas.map((c) => (
                    <Link
                      key={c.codigo}
                      to={`/panel/tesoreria/bancos/cuentas/${c.codigo}`}
                      className="group flex flex-col gap-2 p-4 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-[#1FAE6D] transition-colors">
                          {c.banco?.nombre}
                        </span>
                        <span className="text-sm font-black text-gray-900">
                          {formatPrice(c.saldo)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-semibold">
                          {c.alias || "Sin alias"}
                        </span>
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          {c.numeroCuenta}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
