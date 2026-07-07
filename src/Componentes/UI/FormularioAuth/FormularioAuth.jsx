import { useState } from "react";
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
  email: <EmailIcono color="var(--color-neutral-text-muted)" size={18} />,
  contrasena: <CandadoIcono color="var(--color-neutral-text-muted)" size={18} />,
  usuario: <PersonaIcono color="var(--color-neutral-text-muted)" size={18} />,
  cuit: <DocumentoIcono color="var(--color-neutral-text-muted)" size={18} />,
  confirmarContrasena: (
    <ConfirmarContrasenaIcono color="var(--color-neutral-text-muted)" size={18} />
  ),
};

const FormularioAuth = ({
  campos,
  onSubmit,
  cargando = false,
  errores = {},
  enlaces = [],
  boton = { texto: "Enviar", textoCargando: "Cargando..." },
  pieFormulario = null,
  usuarioBloqueado = false,
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
    <div className="min-h-screen flex bg-[var(--color-neutral-bg)] text-[var(--color-neutral-text-main)] overflow-hidden font-sans">
      {/* PANEL IZQUIERDO: VISUAL / BRANDING */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 bg-[#0E1A16] border-r border-black/10 overflow-hidden relative">
        {/* Subtle geometric pattern / glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--color-brand-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--color-brand-primary)]/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Logo superior */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--color-brand-primary)] flex items-center justify-center shadow-sm">
            <ConsolaIcono size={24} color="white" />
          </div>
          <span className="text-lg font-bold tracking-wide text-white">
            SISTEMA
          </span>
        </div>

        {/* Contenido Central */}
        <div className="relative z-10 max-w-lg mt-10">
          <h1 className="text-[44px] font-bold tracking-tight leading-[1.1] text-white">
            Optimiza tu gestión, <br />
            <span className="text-[var(--color-brand-primary)]">
              potencia tu negocio.
            </span>
          </h1>
          <p className="mt-6 text-[16px] text-gray-400 font-normal max-w-sm leading-relaxed">
            Accede a tu panel de control para gestionar inventario, ventas y métricas en tiempo real de forma inteligente.
          </p>

          {/* Micro-elementos decorativos (Features) */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="p-5 rounded-[12px] bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[var(--color-brand-primary)] font-bold text-2xl mb-1">
                99.9%
              </div>
              <div className="text-[12px] uppercase font-bold text-gray-500 tracking-wider">
                Disponibilidad
              </div>
            </div>
            <div className="p-5 rounded-[12px] bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[var(--color-brand-primary)] font-bold text-2xl mb-1">
                Rápido
              </div>
              <div className="text-[12px] uppercase font-bold text-gray-500 tracking-wider">
                Acceso Seguro
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[13px] text-gray-500 font-medium mt-10">
          © 2026 Todos los derechos reservados. | v1.0.4
        </div>
      </div>

      {/* PANEL DERECHO: FORMULARIO */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-[var(--color-neutral-bg)]">
        {/* Card Contenedora */}
        <div
          className={`
          w-full max-w-[420px] 
          bg-white
          border ${usuarioBloqueado ? "border-red-500/40" : "border-[var(--color-neutral-border)]"} 
          rounded-[16px] 
          shadow-[0_8px_30px_rgb(0,0,0,0.04)]
          px-8 py-10
          relative z-10
          transition-all duration-500
        `}
        >
          {usuarioBloqueado ? (
            <div className="flex flex-col items-center justify-center py-4 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5 text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  <line x1="12" y1="15" x2="12" y2="15.01" />
                </svg>
              </div>
              <h2 className="text-[22px] font-bold text-[var(--color-neutral-text-main)] mb-2 tracking-tight text-center">
                Acceso Restringido
              </h2>
              <p className="text-[14px] font-normal text-[var(--color-neutral-text-muted)] text-center max-w-[280px] leading-relaxed mb-8">
                Tu usuario ha sido suspendido temporalmente por el administrador. No tienes permiso para ingresar.
              </p>

              <button
                onClick={() => window.location.reload()}
                className="w-full h-11 bg-[var(--color-neutral-text-main)] rounded-[8px] text-white text-[14px] font-semibold transition-colors hover:bg-black"
              >
                Volver a intentar
              </button>
            </div>
          ) : (
            <>
              {/* Header del Formulario */}
              <div className="mb-8 flex flex-col items-center">
                {/* Logo visible only on mobile inside the card */}
                <div className="lg:hidden w-12 h-12 mb-4 rounded-[10px] bg-[var(--color-brand-primary)] flex items-center justify-center shadow-sm">
                  <ConsolaIcono size={24} color="white" />
                </div>
                <h2 className="text-[26px] font-bold text-[var(--color-neutral-text-main)] tracking-tight">
                  Bienvenido de vuelta
                </h2>
                <p className="text-[14px] text-[var(--color-neutral-text-muted)] mt-1.5">
                  Ingresa tus credenciales para continuar
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {campos.map((campo) => (
                  <div key={campo.name} className="relative group">
                    <label className="block text-[13px] font-semibold text-[var(--color-neutral-text-main)] mb-1.5">
                      {campo.label}
                    </label>

                    <div className="relative">
                      {/* Ícono flotante */}
                      {iconosPorCampo[campo.name] && (
                        <div className="absolute top-1/2 -translate-y-1/2 left-3.5 z-10 pointer-events-none group-focus-within:text-[var(--color-brand-primary)] text-[var(--color-neutral-text-muted)] transition-colors [&>svg]:!stroke-current">
                          {iconosPorCampo[campo.name]}
                        </div>
                      )}
                      
                      <input
                        type={campo.type || "text"}
                        value={valores[campo.name] || ""}
                        onChange={(e) => handleChange(campo.name, e.target.value)}
                        placeholder={campo.placeholder}
                        inputMode={campo.inputMode}
                        maxLength={campo.maxLength}
                        className={`
                          w-full h-11 rounded-[8px] bg-white
                          border border-[var(--color-neutral-border)]
                          text-[14px] text-[var(--color-neutral-text-main)]
                          outline-none transition-all duration-200
                          focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]
                          placeholder:text-[var(--color-neutral-placeholder)]
                          ${iconosPorCampo[campo.name] ? 'pl-11 pr-4' : 'px-4'}
                        `}
                      />
                    </div>

                    {/* Error */}
                    {errores[campo.name] && (
                      <p className="text-[12px] text-red-500 mt-1.5 font-medium flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-red-500" />
                        {errores[campo.name]}
                      </p>
                    )}

                    {/* Enlace por campo */}
                    {campo.enlace && (
                      <div className="flex justify-end mt-1.5">
                        <Link
                          to={campo.enlace.to}
                          className="text-[12px] font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-hover)] transition-colors"
                        >
                          {campo.enlace.texto}
                        </Link>
                      </div>
                    )}
                  </div>
                ))}

                {/* Enlaces extra */}
                {enlaces.length > 0 && (
                  <div className="flex flex-col items-end gap-1.5 mt-2">
                    {enlaces.map((enlace, i) => (
                      <Link
                        key={i}
                        to={enlace.to}
                        className="text-[13px] font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-hover)] transition-colors"
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
                    w-full h-11 mt-8
                    flex items-center justify-center
                    rounded-[8px]
                    bg-[var(--color-brand-primary)]
                    hover:bg-[var(--color-brand-hover)]
                    text-white text-[14px] font-semibold
                    shadow-[0_4px_14px_0_rgba(31,174,109,0.39)] hover:shadow-[0_6px_20px_rgba(31,174,109,0.23)]
                    transition-all duration-200
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none
                  "
                >
                  {cargando ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
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
                  <div className="flex justify-center gap-1.5 text-[var(--color-neutral-text-muted)] text-[13px] mt-8">
                    {pieFormulario.pregunta}
                    <Link
                      to={pieFormulario.enlace.to}
                      className="text-[var(--color-brand-primary)] hover:text-[var(--color-brand-hover)] font-medium transition-colors"
                    >
                      {pieFormulario.enlace.texto}
                    </Link>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormularioAuth;
