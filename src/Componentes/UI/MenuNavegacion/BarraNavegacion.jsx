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
          {/* Logo Mobile */}
        </div>

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

          {/* SELECTOR DE UNIDAD DE NEGOCIO (Destaque Premium) */}
          <div className="relative hidden md:block group">
            <button
              onClick={() => setMenuUnidadesAbierto(!menuUnidadesAbierto)}
              className="flex items-center gap-3 px-4 py-1.5 rounded-md text-white hover:shadow-[0_8px_20px_rgba(var(--p-h),var(--p-s),var(--p-l),0.3)] transition-all duration-300 cursor-pointer border border-white/20 active:scale-95"
            >
              <div className="bg-[var(--primary-light)] p-1.5 rounded-md">
                <Building2 size={16} className="text-white" />
              </div>
              <div className="flex flex-col items-start leading-none pr-1 pb-1">
                <span className="text-[8px] uppercase font-black text-white/70">Unidad negocio</span>
                <span className="text-[12px] font-black tracking-tight">
                  {unidadActiva?.nombre?.toUpperCase() || "SIN SELECCIÓN"}
                </span>
              </div>
              <ChevronDown size={14} className={`text-white transition-transform duration-300 ${menuUnidadesAbierto ? "rotate-180" : ""}`} />
            </button>

            {menuUnidadesAbierto && (
              <div className="absolute top-12 right-0 w-72 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4">
                <div className="p-4 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-subtle)] text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-80">Cambiar Contexto</span>
                  <p className="text-[11px] font-medium leading-tight">Elegí la unidad de negocio donde deseas trabajar ahora.</p>
                </div>
                <div className="max-h-80 overflow-y-auto px-2 py-2 bg-[var(--surface)]">
                  {usuario?.unidadesNegocio?.map((un) => (
                    <button
                      key={un.codigoSecuencial}
                      onClick={() => {
                        seleccionarUnidad({
                          codigoUsuarioSecuencial: usuario.codigoSecuencial,
                          codigoUnidadNegocioSecuencial: un.codigoSecuencial
                        });
                        setMenuUnidadesAbierto(false);
                      }}
                      className={`w-full flex items-center gap-4 px-3 py-3 rounded-md text-left transition-all mb-1 last:mb-0 ${unidadActiva?.codigoSecuencial === un.codigoSecuencial ? "bg-[var(--primary-container)] ring-2 ring-[var(--primary)]" : "hover:bg-[var(--surface-hover)]"}`}
                    >
                      <div className={`p-2 rounded-md ${unidadActiva?.codigoSecuencial === un.codigoSecuencial ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-hover)] text-[var(--text-muted)] border border-[var(--border-subtle)]"}`}>
                        <Building2 size={18} />
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-black ${unidadActiva?.codigoSecuencial === un.codigoSecuencial ? "text-[var(--primary)]" : "text-[var(--text-primary)]"}`}>
                          {un.nombre}
                        </div>
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Gestión de {un.nombre}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

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
                {(!usuario.conexionArca) ? "" : "(" + usuario.datosFiscales?.condicionIva?.toUpperCase() + ")"}
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
