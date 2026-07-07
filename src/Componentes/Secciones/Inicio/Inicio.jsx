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
import { usePermisosDeUsuario } from "../../../Backend/Autenticacion/hooks/usePermisosDeUsuario";
import { Lock, LogOut } from "lucide-react";

const DashboardCard = ({ children, className = "", title, icon }) => (
  <div
    className={`rounded-[16px] bg-white border border-[var(--color-neutral-border)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col ${className}`}
  >
    {title && (
      <div className="px-6 py-4 border-b border-[var(--color-neutral-border)] flex justify-between items-center bg-white">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-neutral-text-main)]">
          {title}
        </h2>
        {icon && (
          <div className="text-[var(--color-neutral-text-muted)]">
            {React.isValidElement(icon)
              ? React.cloneElement(icon, { size: 16 })
              : icon}
          </div>
        )}
      </div>
    )}
    <div className="p-6 flex-1 bg-[var(--color-neutral-bg)]/20">{children}</div>
  </div>
);

const Movimiento = ({ icon, concepto, monto, negativo }) => (
  <div className="flex items-center justify-between py-3 border-b border-[var(--color-neutral-border)] last:border-0 group hover:bg-gray-50 rounded-[8px] px-3 -mx-3 transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-[10px] bg-[var(--color-brand-soft)] flex items-center justify-center text-[13px] font-bold text-[var(--color-brand-primary)] border border-transparent group-hover:border-[var(--color-brand-primary)]/20 transition-colors">
        {React.isValidElement(icon)
          ? React.cloneElement(icon, { size: 16 })
          : icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[14px] font-medium text-[var(--color-neutral-text-main)]">
          {concepto}
        </span>
        <span className="text-[12px] text-[var(--color-neutral-text-muted)] font-normal pt-0.5">
          Referencia de auditoría
        </span>
      </div>
    </div>

    <div
      className={`text-[15px] font-semibold tracking-tight ${negativo ? "text-red-600" : "text-[var(--color-neutral-text-main)]"}`}
    >
      {monto}
    </div>
  </div>
);

const QuickAction = ({ icon, label, redirigir }) => (
  <Link
    to={redirigir}
    className="group flex flex-col items-center justify-center p-4 rounded-[12px] hover:bg-white border border-[var(--color-neutral-border)] hover:border-[var(--color-brand-primary)]/40 bg-gray-50 gap-3 shadow-sm transition-all"
  >
    <div className="p-2.5 rounded-[10px] bg-white group-hover:bg-[var(--color-brand-soft)] text-[var(--color-neutral-text-muted)] group-hover:text-[var(--color-brand-primary)] border border-[var(--color-neutral-border)] group-hover:border-transparent transition-colors">
      {React.isValidElement(icon)
        ? React.cloneElement(icon, { size: 20 })
        : icon}
    </div>
    <span className="text-[12px] font-medium text-[var(--color-neutral-text-muted)] group-hover:text-[var(--color-brand-primary)] transition-colors">
      {label}
    </span>
  </Link>
);

const Inicio = () => {
  const { codigosSeccionPermitidos, usuario } = usePermisosDeUsuario();
  const tienePermisos =
    codigosSeccionPermitidos && codigosSeccionPermitidos.length > 0;

  if (!tienePermisos) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-[80vh] bg-[var(--color-neutral-bg)]">
        <div className="max-w-md w-full bg-white border border-[var(--color-neutral-border)] rounded-[16px] p-8 flex flex-col items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="w-16 h-16 rounded-[16px] bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
            <Lock size={32} strokeWidth={2} />
          </div>

          <h1 className="text-[22px] font-bold text-[var(--color-neutral-text-main)] tracking-tight">
            ¡Hola, {usuario?.nombre}!
          </h1>
          <p className="text-[15px] text-[var(--color-neutral-text-muted)] font-normal mt-3 leading-relaxed">
            Tu cuenta ha sido registrada con éxito, pero actualmente no posees módulos habilitados.
          </p>

          <div className="w-full mt-8 py-4 px-5 rounded-[12px] bg-gray-50 border border-gray-100 text-left flex items-start gap-4">
            <div className="w-8 h-8 rounded-[8px] bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)] flex items-center justify-center shrink-0 font-bold">
              ?
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-[var(--color-neutral-text-main)] uppercase tracking-wide">
                ¿Qué debes hacer?
              </h4>
              <p className="text-[13px] text-[var(--color-neutral-text-muted)] font-normal mt-1.5 leading-relaxed">
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
            className="flex items-center gap-2 mt-8 px-6 py-2.5 bg-white hover:bg-gray-50 rounded-[10px] text-[13px] font-semibold text-[var(--color-neutral-text-main)] border border-[var(--color-neutral-border)] transition-colors"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 min-h-screen text-[var(--color-neutral-text-main)] bg-[var(--color-neutral-bg)]">
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

            <div className="mt-5 flex justify-center">
              <button className="cursor-pointer text-[13px] font-semibold px-4 py-2 rounded-[8px] bg-white hover:bg-gray-50 text-[var(--color-brand-primary)] border border-[var(--color-neutral-border)] transition-colors">
                Ver historial completo
              </button>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Rendimiento Mensual"
            icon={<ListaIcono size={18} />}
          >
            <div className="h-56 mt-1 rounded-[12px] bg-gray-50 flex items-center justify-center border border-dashed border-[var(--color-neutral-border)] text-[var(--color-neutral-text-muted)] text-[12px] font-medium">
              Visualización de Datos (Ingresos v Egresos)
            </div>

            <div className="flex gap-12 mt-8 px-4">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] text-[var(--color-neutral-text-muted)] uppercase font-semibold tracking-wide">
                  Total Ingresos
                </span>
                <span className="text-2xl font-bold text-[var(--color-neutral-text-main)] tracking-tight">
                  $39,100.00
                </span>
              </div>
              <div className="w-px bg-[var(--color-neutral-border)]" />
              <div className="flex flex-col gap-2">
                <span className="text-[12px] text-[var(--color-neutral-text-muted)] uppercase font-semibold tracking-wide">
                  Total Egresos
                </span>
                <span className="text-2xl font-bold text-red-600 tracking-tight">
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
                redirigir={"/panel/compras/factura-proveedor"}
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
              <div className="p-4 rounded-[12px] bg-emerald-50 border border-emerald-100">
                <p className="text-[13px] text-emerald-800 leading-relaxed font-medium">
                  El sistema ha conciliado correctamente todas las transacciones
                  de las últimas 24 horas. No se requieren acciones manuales.
                </p>
              </div>
              <div className="p-4 rounded-[12px] bg-amber-50 border border-amber-100">
                <p className="text-[13px] text-amber-800 leading-relaxed font-medium">
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
