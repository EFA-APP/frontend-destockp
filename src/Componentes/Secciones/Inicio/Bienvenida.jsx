import { LogOut, ShieldCheck } from "lucide-react";
import { usePermisosDeUsuario } from "../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";
import { UsuarioIcono } from "../../../assets/Icons";
import { cerrarSesion } from "../../../Backend/Autenticacion/store/cerrarSesion";

const Bienvenida = () => {
  const { usuario } = usePermisosDeUsuario();

  return (
    <div className="p-4 lg:p-8 flex items-center justify-center min-h-[85vh] relative bg-[var(--color-neutral-bg)]">
      {/* Contenedor Principal */}
      <div className="max-w-2xl w-full bg-white border border-[var(--color-neutral-border)] rounded-[16px] p-8 md:p-12 flex flex-col items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative overflow-hidden">
        {/* Icono Principal */}
        <div className="w-20 h-20 rounded-[16px] bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)] flex items-center justify-center mb-6">
          <ShieldCheck size={40} strokeWidth={1.5} />
        </div>

        {/* Textos de Bienvenida */}
        <h1 className="text-[28px] md:text-[36px] font-bold text-[var(--color-neutral-text-main)] px-2 tracking-tight">
          ¡Hola,{" "}
          <span className="text-[var(--color-brand-primary)]">{`${usuario?.nombre} ${usuario?.apellido}`}</span>
          !
        </h1>
        <p className="text-[15px] md:text-[16px] text-[var(--color-neutral-text-muted)] mt-4 max-w-md leading-relaxed">
          Bienvenido de vuelta al{" "}
          <span className="text-[var(--color-neutral-text-main)] font-semibold">SISTEMA</span>.
          ¿Qué operación deseas realizar hoy?
        </p>

        {/* Información de Sesión */}
        <div className="mt-8 py-3 px-6 bg-gray-50 rounded-[12px] border border-gray-100 flex items-center gap-2">
          <UsuarioIcono size={18} color={"var(--color-neutral-text-muted)"} />
          <span className="text-[13px] text-[var(--color-neutral-text-muted)] font-medium">
            Rol Activo: <span className="font-semibold text-[var(--color-neutral-text-main)]">{usuario?.roles?.map((rol) => rol.nombre).join(", ") || "Operador"}</span>
          </span>
        </div>

        {/* Botón Salir */}
        <button
          onClick={async () => {
            await cerrarSesion();
          }}
          className="flex items-center gap-2 mt-8 px-6 py-2.5 rounded-[10px] text-[13px] font-semibold bg-white text-[var(--color-neutral-text-main)] hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-[var(--color-neutral-border)] transition-colors"
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Bienvenida;
