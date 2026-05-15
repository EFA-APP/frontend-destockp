import {
  RefrescarIcono,
  CerrarSesionIcono,
  ConsolaIcono,
} from "../../../assets/Icons";
import { useArcaStore } from "../../../store/useArcaStore";
import { useEffect } from "react";

import { Link } from "react-router-dom";
import BotonConfiguracion from "../BotonConfiguracion/BotonConfiguracion";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { cerrarSesion } from "../../../Backend/Autenticacion/store/cerrarSesion";
const BarraNavegacion = () => {
  const { usuario } = useAuthStore();
  const { conectado, verificarSesion, cargando } = useArcaStore();

  // Verificación automática de sesión ARCA (AFIP)
  useEffect(() => {
    if (usuario) {
      verificarSesion(usuario);
    }
  }, [usuario, verificarSesion]);

  return (
    <header className="sticky top-0 z-[50]">
      <nav className="px-5 bg-white border-b border-[var(--border-subtle)] h-14 flex items-center justify-between">
        <Link
          to="/"
          className=" flex relative group/logo flex items-center gap-3 md:hidden"
        >
          {usuario?.configuracionVisual?.logoUrl ? (
            <img
              alt="logo"
              className="w-10 h-10 rounded-full border border-[var(--border-subtle)] shadow-md object-contain bg-[var(--surface)] p-1 group-hover/logo:scale-105 transition-transform"
              src={usuario?.configuracionVisual?.logoUrl}
            />
          ) : (
            <div className="flex items-center justify-center w-12 h-12 rounded-full border border-[var(--primary)]/20 shadow-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-emphasis)] text-white group-hover/logo:scale-105 transition-transform">
              <ConsolaIcono size={22} color="white" />
            </div>
          )}
        </Link>

        <div className="flex-1"></div>

        <div className="flex items-center gap-3">
          {/* ARCA STATUS */}
          {(usuario?.conexionArca || usuario?.configuracionArca?.activo) && (
            <div
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface-hover)] border border-[var(--border-subtle)] group"
              title={
                conectado
                  ? "Sesión ARCA Activa"
                  : "Sesión ARCA Inactiva / Error"
              }
            >
              <button
                onClick={() => verificarSesion(usuario)}
                disabled={cargando}
                className={`text-[var(--text-muted)] hover:text-[var(--primary)]   ${cargando ? "" : "group-hover:rotate-180"}`}
              >
                <RefrescarIcono size={14} />
              </button>
              <span className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest hidden sm:inline">
                ARCA{" "}
                <span className="opacity-50 text-[10px]">
                  ({usuario?.datosFiscales?.esProduccion ? "PROD" : "HOMO"})
                </span>
                :
              </span>
              <div className="relative flex items-center">
                {conectado && (
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75 "></span>
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${conectado ? "bg-emerald-700 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-700"}`}
                ></span>
              </div>
            </div>
          )}

          <div className="w-px h-6 bg-[var(--border-subtle)] mx-1" />

          {/* PERFIL */}
          <div className="flex items-center gap-4 ml-2 ">
            <div className="flex-col items-end flex">
              <span className="text-[13px] font-bold text-[var(--text-primary)] leading-none">
                {`${usuario.nombre.toUpperCase()} ${usuario.apellido.toUpperCase()} `}{" "}
                <span className="hidden sm:inline text-[13px] text-[var(--primary-light)] font-bold uppercase tracking-widest">
                  {!usuario.conexionArca
                    ? ""
                    : "(" +
                      usuario.datosFiscales?.condicionIva?.toUpperCase() +
                      ")"}
                </span>
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-[var(--secondary)] font-bold uppercase tracking-widest">
                  {usuario.roles
                    ?.map((rol) => rol.nombre.toUpperCase())
                    .join(", ")}
                </span>
              </div>
            </div>
          </div>

          {/* CONFIGURACION */}
          <div className="flex items-center gap-4 ml-2">
            <BotonConfiguracion />
          </div>

          {/* CERRAR SESION */}
          <div
            onClick={async () => {
              await cerrarSesion();
            }}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-red-500/20 border border-red-500/50 group md:hidden "
          >
            <CerrarSesionIcono size={18} color="rgb(239 68 68)" />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default BarraNavegacion;
