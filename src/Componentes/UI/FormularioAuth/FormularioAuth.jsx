import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CandadoIcono,
  ConfirmarContrasenaIcono,
  ConsolaIcono,
  DocumentoIcono,
  EmailIcono,
  PersonaIcono,
} from "../../../assets/Icons";

const iconosPorCampo = {
  email: <EmailIcono color="#FF007F" />,
  contrasena: <CandadoIcono color="#FF007F" size={20} />,
  usuario: <PersonaIcono color="#FF007F" size={20} />,
  cuit: <DocumentoIcono color="#FF007F" size={20} />,
  confirmarContrasena: <ConfirmarContrasenaIcono color="#FF007F" size={20} />,
};

const FormularioAuth = ({
  titulo,
  descripcion,
  campos,
  onSubmit,
  cargando = false,
  errores = {},
  enlaces = [],
  boton = { texto: "Enviar", textoCargando: "Cargando..." },
  pieFormulario = null,
}) => {
  const [valores, setValores] = useState({});

  const handleChange = (name, value) => {
    setValores((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(valores);
  };

  return (
    <div className="min-h-screen flex bg-[var(--primary)] text-black overflow-hidden font-[Inter]">
      {/* PANEL IZQUIERDO: VISUAL / BRANDING */}
      <div className="hidden md:flex flex-1 relative flex-col justify-between p-16 bg-[var(--surface-active)] border-r border-[var(--border-subtle)] to-[#FF007F]/10 overflow-hidden border-r border-[var(--border-subtle)]">
        {/* Glows decorativos */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF007F]/15 rounded-full blur-[120px] pointer-events-none animation-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#FF007F]/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Logo superior */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-[#FF007F] to-[#FF007F] p-0.5 shadow-lg">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <ConsolaIcono size={28} color="#FF007F" />
            </div>
          </div>
          <span className="text-lg font-black tracking-wider text-[var(--text-primary)]">
            SISTEMA
          </span>
        </div>

        {/* Contenido Central */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-black tracking-tight leading-[1.1] text-black">
            Optimiza tu gestión, <br />
            <span className="bg-gradient-to-r from-[#FF007F] to-[#FF007F] bg-clip-text text-transparent">
              potencia tu negocio.
            </span>
          </h1>
          <p className="mt-4 text-sm text-[var(--text-muted)] font-medium max-w-sm leading-relaxed">
            Accede a tu panel de control para gestionar inventario, ventas y
            métricas en tiempo real de forma inteligente.
          </p>

          {/* Micro-elementos decorativos (Features) */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-md bg-[var(--surface-active)] shadow-sm border border-[var(--border-subtle)] backdrop-blur-md">
              <div className="text-[#FF007F] font-black text-xl mb-1">
                99.9%
              </div>
              <div className="text-[12px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Disponibilidad
              </div>
            </div>
            <div className="p-4 rounded-md bg-[var(--surface-active)] shadow-sm border border-[var(--border-subtle)] backdrop-blur-md">
              <div className="text-[#FF007F] font-black text-xl mb-1">
                Rápido
              </div>
              <div className="text-[12px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Acceso Seguro
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[12px] text-[var(--text-muted)] font-medium">
          © 2026 Todos los derechos reservados. | v1.0.4
        </div>
      </div>
      {/* PANEL DERECHO: FORMULARIO */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-20 relative bg-[var(--surface-active)]">
        {/* Glow decorativo de fondo dinámico */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF007F]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--primary)]/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-t from-transparent to-[var(--primary)]/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-t from-[#FF007F]/50 to-[var(--primary)]/30 rounded-full blur-[100px] pointer-events-none" />

        {/* Card Contenedora */}
        <div
          className="
          w-full max-w-md 
          bg-[var(--surface)]/90 backdrop-blur-xl
          border border-[var(--border-subtle)] 
          rounded-[32px] 
          shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12),0_0_20px_rgba(255,0,127,0.02)] 
          p-10 md:p-14
          relative z-10
          transition-all duration-500
          hover:border-[var(--primary)]/20
        "
        >
          {/* Header del Formulario (Iconic Style) */}
          <div className="mb-12 flex flex-col items-center">
            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-2 bg-[#FF007F]/10 px-3 py-1.5 rounded-full mb-3 border border-[#FF007F]/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF007F] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FF007F]">
                  Acceso Segúro
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {campos.map((campo) => (
              <div key={campo.name} className="relative group">
                <label className="block text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2.5 group-focus-within:text-[#FF007F] transition-colors ml-1">
                  {campo.label}
                </label>

                <div className="relative">
                  <input
                    type={campo.type || "text"}
                    value={valores[campo.name] || ""}
                    onChange={(e) => handleChange(campo.name, e.target.value)}
                    placeholder={campo.placeholder}
                    inputMode={campo.inputMode}
                    maxLength={campo.maxLength}
                    className="
                    w-full h-14
                    rounded-md
                    bg-[var(--surface-active)]
                    border border-[var(--border-medium)]
                    text-[15px] text-[var(--text-primary)]
                    outline-none
                    border-[#FF007F]
                    ring-2
                    ring-[#FF007F]/20
                    bg-white
                    placeholder:text-[var(--text-muted)]/40
                    transition-all duration-300
                    px-12
                    shadow-sm
                  "
                  />

                  {/* Ícono */}
                  {iconosPorCampo[campo.name] && (
                    <span className="absolute top-1/2 -translate-y-1/2 left-4 opacity-60 group-focus-within:opacity-100 transition-opacity scale-110">
                      {iconosPorCampo[campo.name]}
                    </span>
                  )}
                </div>

                {/* Error */}
                {errores[campo.name] && (
                  <p className="text-[11px] text-red-500 mt-2 font-bold flex items-center gap-1.5 ml-1">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {errores[campo.name]}
                  </p>
                )}

                {/* Enlace por campo */}
                {campo.enlace && (
                  <div className="flex justify-end mt-2.5">
                    <Link
                      to={campo.enlace.to}
                      className="text-[11px] font-black uppercase tracking-wider text-[#FF007F] hover:text-black transition-colors"
                    >
                      {campo.enlace.texto}
                    </Link>
                  </div>
                )}
              </div>
            ))}

            {/* Enlaces extra */}
            {enlaces.length > 0 && (
              <div className="flex flex-col items-end gap-2">
                {enlaces.map((enlace, i) => (
                  <Link
                    key={i}
                    to={enlace.to}
                    className="block text-[11px] font-black uppercase tracking-wider text-[#FF007F] hover:text-black transition-colors"
                  >
                    {enlace.texto}
                  </Link>
                ))}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={cargando}
              className="
              w-full h-14 mt-6
              flex items-center justify-center
              rounded-2xl
              bg-gradient-to-r from-[#FF007F] to-[#FF007F]
              text-white text-[13px] font-black tracking-[0.2em] uppercase
              shadow-[0_12px_24px_-8px_rgba(255,0,127,0.5)]
              hover:shadow-[0_20px_32px_-8px_rgba(255,0,127,0.6)]
              hover:-translate-y-1
              active:translate-y-0
              active:scale-[0.98]
              transition-all duration-300
              disabled:opacity-50 disabled:hover:shadow-none disabled:hover:-translate-y-0 disabled:active:scale-100
              cursor-pointer
            "
            >
              {cargando ? (
                <span className="flex items-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {boton.textoCargando}
                </span>
              ) : (
                boton.texto
              )}
            </button>

            {/* Pie */}
            {pieFormulario && (
              <div className="flex justify-center gap-2 text-[var(--text-muted)] text-[11px] mt-10 font-bold uppercase tracking-wider">
                {pieFormulario.pregunta}
                <Link
                  to={pieFormulario.enlace.to}
                  className="text-[#FF007F] hover:text-black font-black transition-colors"
                >
                  {pieFormulario.enlace.texto}
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioAuth;
