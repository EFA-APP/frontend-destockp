import InicioKPIs from "./InicioKPIs";
import {
  PagosIcono,
  ContableIcono,
  PersonaIcono,
  InventarioIcono,
  BuscadorIcono,
  InicioIcono,
  ListaIcono,
  ProveedoresIcono,
} from "../../../assets/Icons";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { Link } from "react-router-dom";
import React from "react";

const DashboardCard = ({ children, className = "", title, icon }) => (
  <div
    className={`rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-sm overflow-hidden flex flex-col ${className}`}
  >
    {title && (
      <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--fill-secondary)]/30">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          {title}
        </h2>
        {icon && (
          <div className="text-[var(--text-muted)]">
            {React.isValidElement(icon)
              ? React.cloneElement(icon, { size: 14 })
              : icon}
          </div>
        )}
      </div>
    )}
    <div className="p-5 flex-1">{children}</div>
  </div>
);

const Movimiento = ({ icon, concepto, monto, negativo }) => (
  <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0 group hover:bg-[var(--surface-hover)] transition-all rounded-xl px-2 -mx-2">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[var(--surface-hover)] flex items-center justify-center text-[10px] font-bold text-[var(--primary)] border border-[var(--border-subtle)] group-hover:border-[var(--primary)]/30 transition-colors">
        {React.isValidElement(icon)
          ? React.cloneElement(icon, { size: 14 })
          : icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[13px] font-semibold text-[var(--text-primary)]">
          {concepto}
        </span>
        <span className="text-[9px] text-[var(--primary-light)] uppercase font-bold tracking-wider pt-0.5 opacity-80">
          Referencia de auditoría
        </span>
      </div>
    </div>

    <div
      className={`text-[13px] font-bold tracking-tight ${negativo ? "text-red-500" : "text-[var(--secondary)]"}`}
    >
      {monto}
    </div>
  </div>
);

const QuickAction = ({ icon, label, redirigir }) => (
  <Link
    to={redirigir}
    className="group flex flex-col items-center justify-center p-4 rounded-xl hover:bg-[var(--surface)] border hover:border-[var(--border-subtle)] border-[var(--primary)]/40 bg-[var(--primary-subtle)] transition-all duration-500 gap-2.5 shadow-sm"
  >
    <div className="p-2.5 rounded-md bg-[var(--surface-hover)] group-hover:text-[var(--text-secondary)] text-[var(--primary)] group-hover:scale-105 transition-all duration-300 border border-[var(--border-subtle)]">
      {React.isValidElement(icon)
        ? React.cloneElement(icon, { size: 18 })
        : icon}
    </div>
    <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
      {label}
    </span>
  </Link>
);

import { usePermisosDeUsuario } from "../../../Backend/Autenticacion/hooks/usePermisosDeUsuario";
import { Lock, LogOut } from "lucide-react";

const Inicio = () => {
  const { codigosSeccionPermitidos, usuario } = usePermisosDeUsuario();
  const tienePermisos =
    codigosSeccionPermitidos && codigosSeccionPermitidos.length > 0;

  if (!tienePermisos) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-[80vh] animate-in fade-in duration-500">
        <div className="max-w-md w-full bg-[var(--fill)] border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-[var(--primary)]/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-500 flex items-center justify-center border border-amber-500/20 mb-6 shadow-xl">
            <Lock size={30} strokeWidth={2} />
          </div>

          <h1 className="text-[20px] font-black text-white uppercase tracking-tight">
            ¡Hola, {usuario?.nombre}!
          </h1>
          <p className="text-[12px] text-white/40 font-medium mt-2 leading-relaxed">
            Tu cuenta ha sido registrada con éxito en{" "}
            <span className="text-amber-500 font-black">DeStockP</span>, pero
            actualmente no posees módulos habilitados.
          </p>

          <div className="w-full mt-6 py-4 px-5 rounded-2xl bg-white/5 border border-white/5 text-left flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center border border-[var(--primary)] shrink-0 font-bold">
              ?
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider">
                ¿Qué debes hacer?
              </h4>
              <p className="text-[10px] text-white/40 font-medium mt-1">
                Comunícate con los administradores de tu empresa para que
                configuren los permisos de tu perfil en la Matriz de Accesos.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              window.localStorage.clear();
              window.location.reload();
            }}
            className="flex items-center gap-2 mt-8 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-bold text-white/60 hover:text-white uppercase tracking-wider transition-all border border-white/5 cursor-pointer active:scale-95"
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 min-h-screen text-[var(--text-primary)]">
      {/* TÍTULO */}
      <EncabezadoSeccion ruta={"Inicio"} icono={<InicioIcono size={20} />} />

      {/* KPIs */}
      <InicioKPIs />

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: ACTIVIDAD */}
        <div className="lg:col-span-8 space-y-6">
          <DashboardCard
            title="Actividad Reciente del Sistema"
            icon={<BuscadorIcono size={18} />}
          >
            <div className="space-y-1">
              <Movimiento
                icon="FC"
                concepto="Pago para FC 0001-000023"
                monto="$6.000,00"
              />
              <Movimiento
                icon="FC"
                concepto="FC A 0001-0000123"
                monto="$15.000,00"
              />
              <Movimiento
                icon="FC"
                concepto="FC A 0001-0000124"
                monto="$150.000,00"
              />
              <Movimiento
                icon="ND"
                concepto="ND A 0001-0000034"
                monto="$500,00"
              />
              <Movimiento
                icon="NC"
                concepto="NC B 0001-0000098"
                monto="-$2.500,00"
                negativo
              />
            </div>

            <div className="mt-4 flex justify-center">
              <button className="cursor-pointer text-[12px]! font-bold! px-2.5 py-1.5 rounded-md! bg-[var(--primary-light)]/30! hover:bg-[var(--primary)]/30! text-[var(--primary)]! transition-all border border-[var(--border-subtle)] uppercase tracking-wider">
                ver historial completo
              </button>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Rendimiento Mensual"
            icon={<ListaIcono size={16} />}
          >
            <div className="h-56 mt-1 rounded-xl bg-[var(--fill-secondary)]/20 flex items-center justify-center border border-[var(--border-subtle)] text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-[0.2em] opacity-50">
              Visualización de Datos (Ingresos v Egresos)
            </div>

            <div className="flex gap-10 mt-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-wider">
                  Total Ingresos
                </span>
                <span className="text-xl font-bold text-[var(--secondary)] tracking-tight">
                  $39,100.00
                </span>
              </div>
              <div className="w-px bg-[var(--border-subtle)]" />
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-wider">
                  Total Egresos
                </span>
                <span className="text-xl font-bold text-red-500 tracking-tight">
                  $25,900.00
                </span>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* COLUMNA DERECHA: ACCESOS Y NOTAS */}
        <div className="lg:col-span-4 space-y-6">
          <DashboardCard title="Accesos Operativos">
            <div className="grid grid-cols-2 gap-4">
              <QuickAction
                icon={<PagosIcono />}
                label="Nueva Compra"
                redirigir={"/panel/compras/facturas-proveedores/nueva"}
              />
              <QuickAction
                icon={<ContableIcono />}
                label="Nuevo Asiento"
                redirigir={"/panel/contabilidad/asientos/nuevo"}
              />
              <QuickAction
                icon={<InventarioIcono />}
                label="Productos"
                redirigir={"/panel/inventario/productos"}
              />
              <QuickAction
                icon={<PersonaIcono />}
                label="Nuevo Cliente"
                redirigir={"/panel/contactos/clientes/nuevo"}
              />
              <QuickAction
                icon={<ProveedoresIcono />}
                label="Nuevo Proveedor"
                redirigir={"/panel/contactos/proveedores/nuevo"}
              />
              <QuickAction
                icon={<ContableIcono />}
                label="Plan de Cuentas"
                redirigir={"/panel/contabilidad/cuentas"}
              />
            </div>
          </DashboardCard>

          <DashboardCard title="Notas de Auditoría">
            <div className="space-y-4">
              <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/10">
                <p className="text-xs text-[var(--text-theme)] leading-relaxed">
                  El sistema ha conciliado correctamente todas las transacciones
                  de las últimas 24 horas. No se requieren acciones manuales.
                </p>
              </div>
              <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/10">
                <p className="text-xs text-[var(--text-theme)] leading-relaxed">
                  Hay 3 facturas de proveedores próximas a vencer en los
                  próximos 2 días. Se recomienda revisión.
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
