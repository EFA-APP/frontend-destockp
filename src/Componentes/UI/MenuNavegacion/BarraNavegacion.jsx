import { useState } from "react";
import {
  NotificacionesIcono,
  RefrescarIcono,
  CerrarSesionIcono,
  ConsolaIcono,
} from "../../../assets/Icons";
import { useArcaStore } from "../../../store/useArcaStore";
import { useEffect } from "react";

import { Link } from "react-router-dom";
// import MenuNotificacion from "../MenuNotificacion/MenuNotificacion";
import { cerrarSesion } from "../../../Backend/Autenticacion/store/cerrarSesion";
import BotonConfiguracion from "../BotonConfiguracion/BotonConfiguracion";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";

const BarraNavegacion = () => {
  const [menuAbiertoNotificacion, setMenuAbiertoNotificacion] = useState(false);
  const usuario = useAuthStore((state) => state.usuario);
  const { conectado, verificarSesion, cargando } = useArcaStore();

  // Verificación automática de sesión ARCA (AFIP)
  useEffect(() => {
    if (usuario && !conectado && !cargando) {
      verificarSesion(usuario);
    }
  }, [usuario, conectado, cargando, verificarSesion]);

  // const toggleNotificacion = () => {
  //   setMenuAbiertoNotificacion(!menuAbiertoNotificacion);
  // };

  return (
    <header className="sticky top-0 z-[50]">
      <nav className="px-5 bg-[var(--surface)] border-b border-[var(--border-subtle)] shadow-sm h-14 flex items-center justify-between transition-all duration-300">
        <div className="flex-1 flex items-center md:hidden">
          <Link to="/" className="relative group/logo-mobile">
            <div className="absolute -inset-1 bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-subtle)] rounded-full blur opacity-25" />
            {usuario?.configuracionVisual?.logoUrl ? (
              <img
                alt="logo"
                className="relative w-8 h-8 rounded-full border-2 border-white shadow-sm object-contain bg-white"
                src={usuario?.configuracionVisual?.logoUrl}
              />
            ) : (
              <ConsolaIcono size={18} color="var(--primary)" />
            )}
          </Link>
        </div>

        <div></div>

        <div className="flex items-center gap-3">
          {/* ARCA STATUS */}
          {(usuario?.conexionArca || usuario?.configuracionArca?.activo) && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface-hover)] border border-[var(--border-subtle)] group"
              title={
                conectado
                  ? "Sesión ARCA Activa"
                  : "Sesión ARCA Inactiva / Error"
              }
            >
              <button
                onClick={() => verificarSesion(usuario)}
                disabled={cargando}
                className={`text-[var(--text-muted)] hover:text-[var(--primary)] transition-all duration-300 ${cargando ? "animate-spin" : "group-hover:rotate-180"}`}
              >
                <RefrescarIcono size={14} />
              </button>
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hidden sm:inline">
                ARCA:
              </span>
              <div className="relative flex items-center">
                {conectado && (
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${conectado ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"}`}
                ></span>
              </div>
            </div>
          )}

          {/* NOTIFICACIONES */}
          {/* <div className="relative">
            <button
              onClick={toggleNotificacion}
              className="p-2 rounded-md! text-[var(--text-theme)]! hover:text-[var(--primary)]! hover:bg-[var(--primary-subtle)] transition-all relative cursor-pointer"
            >
              <NotificacionesIcono size={18} />
              <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-[9px] font-bold h-4 w-4 flex items-center justify-center text-white rounded-full border-2 border-[var(--surface)]">
                5
              </span>
            </button>
            {menuAbiertoNotificacion && <MenuNotificacion />}
          </div> */}

          <div className="w-px h-6 bg-[var(--border-subtle)] mx-1" />

          {/* PERFIL */}
          <div className="flex items-center gap-4 ml-2 ">
            <div className="flex-col items-end hidden md:flex">
              <span className="text-[11px] font-bold text-[var(--text-primary)] leading-none">{`${usuario.nombre.toUpperCase()} ${usuario.apellido.toUpperCase()} `} <span className="text-[11px] text-[var(--primary-light)] font-bold uppercase tracking-widest">
                {(!usuario.conexionArca) ? "" : "(" + usuario.condicionIva.toUpperCase() + ")"}
              </span></span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-[var(--secondary)] font-bold uppercase tracking-widest">
                  {usuario.roles
                    ?.map((rol) => rol.nombre.toUpperCase())
                    .join(", ")}
                </span>
              </div>
            </div>

            <button
              onClick={cerrarSesion}
              className="p-2 rounded-md! bg-red-500/5! text-red-500! hover:bg-red-500! hover:text-white! transition-all! duration-300! cursor-pointer! border! border-red-500/20!"
              title="Cerrar Sesión"
            >
              <CerrarSesionIcono size={16} />
            </button>
          </div>

          {/* CONFIGURACION */}
          <div className="flex items-center gap-4 ml-2">
            <BotonConfiguracion />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default BarraNavegacion;
