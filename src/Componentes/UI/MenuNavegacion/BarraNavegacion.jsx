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
import BotonConfiguracion from "../BotonConfiguracion/BotonConfiguracion";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useSeleccionarUnidad } from "../../../Backend/Autenticacion/queries/Usuario/useSeleccionarUnidad.mutation";
import { ChevronDown, Building2, Factory, School, Store } from "lucide-react";

const BarraNavegacion = () => {
  const [menuAbiertoNotificacion, setMenuAbiertoNotificacion] = useState(false);
  const [menuUnidadesAbierto, setMenuUnidadesAbierto] = useState(false);
  const { usuario, unidadActiva } = useAuthStore();
  const { mutate: seleccionarUnidad } = useSeleccionarUnidad();
  const { conectado, verificarSesion, cargando } = useArcaStore();

  // Verificación automática de sesión ARCA (AFIP)
  useEffect(() => {
    if (usuario) {
      verificarSesion(usuario);
    }
  }, [usuario, verificarSesion]);

  // const toggleNotificacion = () => {
  //   setMenuAbiertoNotificacion(!menuAbiertoNotificacion);
  // };

  return (
    <header className="sticky top-0 z-[50]">
      <nav className="px-5 bg-[var(--fill)] border-b border-[var(--border-subtle)] h-14 flex items-center justify-between">
        <div className="flex-1 flex items-center">{/* Logo Mobile */}</div>

        <div className="flex-1"></div>

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
                <span className="text-[13px] text-[var(--primary-light)] font-bold uppercase tracking-widest">
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
        </div>
      </nav>
    </header>
  );
};

export default BarraNavegacion;
