import { LogOut, UserCheck, ShieldCheck } from "lucide-react";
import { usePermisosDeUsuario } from "../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";

const Bienvenida = () => {
  const { usuario } = usePermisosDeUsuario();

  return (
    <div className="p-4 lg:p-8 flex items-center justify-center min-h-[85vh]    relative">
      {/* Fondos Decorativos Glow */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-3xl p-8 md:p-12 flex flex-col items-center text-center shadow-xl relative overflow-hidden backdrop-blur-md">
        {/* Icono Principal */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 text-[var(--primary)] flex items-center justify-center border border-[var(--primary)]/20 mb-6 shadow-xl -slow">
          <ShieldCheck size={40} strokeWidth={1.5} />
        </div>

        {/* Textos de Bienvenida */}
        <h1 className="text-2xl md:text-4xl font-black text-black px-2">
          ¡Hola,{" "}
          <span className="bg-gradient-to-r from-[var(--primary)] to-amber-700 bg-clip-text text-transparent">{`${usuario?.nombre.toUpperCase()} ${usuario?.apellido.toUpperCase()}`}</span>
          !
        </h1>
        <p className="text-[14px] md:text-sm text-[var(--text-secondary)] font-medium mt-3 max-w-md leading-relaxed">
          Bienvenido de vuelta al{" "}
          <span className="text-[var(--primary)] font-black">SISTEMA</span>.
          ¿Qué operación deseas realizar hoy en el sistema?
        </p>

        {/* Información de Sesión */}
        <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-bold mt-8 flex items-center gap-1.5">
          <UserCheck size={12} className="text-[var(--primary)]" /> Rol Activo:{" "}
          {usuario?.roles?.map((rol) => rol.nombre).join(", ") || "Operador"}
        </p>

        {/* Botón Salir */}
        <button
          onClick={() => {
            window.localStorage.clear();
            window.location.reload();
          }}
          className="flex items-center gap-2 mt-4 px-5 py-2 rounded-xl text-[12px] font-bold text-[var(--text-muted)] hover:text-black uppercase tracking-wider  hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-subtle)] cursor-pointer active:scale-95"
        >
          <LogOut size={12} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Bienvenida;
