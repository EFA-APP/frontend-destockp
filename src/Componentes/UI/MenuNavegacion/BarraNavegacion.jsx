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
      <nav className="px-5 bg-white border-b border-[var(--color-neutral-border)] h-14 flex items-center justify-between">
        <Link
          to="/"
          className=" flex relative group/logo flex items-center gap-3 md:hidden"
        >
          {usuario?.configuracionVisual?.logoUrl ? (
            <img
              alt="logo"
              className="w-10 h-10 rounded-[10px] border border-[var(--color-neutral-border)] shadow-sm object-contain bg-white p-1 group-hover/logo:scale-105 transition-transform"
              src={usuario?.configuracionVisual?.logoUrl}
            />
          ) : (
            <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-[var(--color-brand-primary)] text-white group-hover/logo:scale-105 transition-transform shadow-sm">
              <ConsolaIcono size={20} color="white" />
            </div>
          )}
        </Link>

        <div className="flex-1"></div>

        <div className="flex items-center gap-3">
          {/* ARCA STATUS */}
          {(usuario?.conexionArca || usuario?.configuracionArca?.activo) && (
            <div
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[var(--color-neutral-bg)] group"
              title={
                conectado
                  ? "Sesión ARCA Activa"
                  : "Sesión ARCA Inactiva / Error"
              }
            >
              <button
                onClick={() => verificarSesion(usuario)}
                disabled={cargando}
                className={`text-[var(--color-neutral-text-muted)] hover:text-[var(--color-brand-primary)] transition-colors cursor-pointer ${cargando ? "" : "group-hover:rotate-180"}`}
              >
                <RefrescarIcono size={14} />
              </button>
              <span className="text-[11px] font-bold text-[var(--color-neutral-text-muted)] uppercase tracking-wider hidden sm:inline">
                ARCA{" "}
                <span className="opacity-70 font-medium">
                  ({usuario?.datosFiscales?.esProduccion ? "PROD" : "HOMO"})
                </span>
                :
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

          <div className="w-px h-5 bg-[var(--color-neutral-border)] mx-1" />

          {/* PERFIL */}
          <div className="flex items-center gap-4 ml-1">
            <div className="flex-col items-end flex">
              <span className="text-[13px] font-bold text-[var(--color-neutral-text-main)] leading-none">
                {`${usuario.nombre} ${usuario.apellido}`}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-[var(--color-neutral-text-muted)] font-medium tracking-wide">
                  {usuario.roles
                    ?.map((rol) => rol.nombre)
                    .join(", ")}
                </span>
              </div>
            </div>
          </div>

          {/* CONFIGURACION */}
          <div className="flex items-center gap-2 ml-2">
            <BotonConfiguracion />
          </div>

          {/* CERRAR SESION MOBILE */}
          <div
            onClick={async () => {
              await cerrarSesion();
            }}
            className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-red-50 text-red-500 hover:bg-red-100 transition-colors md:hidden cursor-pointer"
          >
            <CerrarSesionIcono size={18} />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default BarraNavegacion;
