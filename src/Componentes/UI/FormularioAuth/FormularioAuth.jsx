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
  email: <EmailIcono color="var(--primary)" />,
  contrasena: <CandadoIcono color="var(--primary)" size={20} />,
  usuario: <PersonaIcono color="var(--primary)" size={20} />,
  cuit: <DocumentoIcono color="var(--primary)" size={20} />,
  confirmarContrasena: (
    <ConfirmarContrasenaIcono color="var(--primary)" size={20} />
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
    <div className="min-h-screen flex bg-[var(--primary)] text-black overflow-hidden ">
      {/* PANEL IZQUIERDO: VISUAL / BRANDING */}
      <div className="hidden md:flex flex-1 relative flex-col justify-between p-16 bg-[var(--surface-active)] border-r border-[var(--border-subtle)] to-[hsl(var(--p-h),var(--p-s),var(--p-l),0.1)] overflow-hidden border-r border-[var(--border-subtle)]">
        {/* Glows decorativos */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[hsl(var(--p-h),var(--p-s),var(--p-l),0.15)] rounded-full blur-[120px] pointer-events-none animation-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[hsl(var(--p-h),var(--p-s),var(--p-l),0.1)] rounded-full blur-[150px] pointer-events-none" />

        {/* Logo superior */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-[var(--primary)] to-[var(--primary)] p-0.5 shadow-lg">
            <div className="w-full h-full bg-white rounded-md flex items-center justify-center">
              <ConsolaIcono size={28} color="var(--primary)" />
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
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] bg-clip-text text-transparent">
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
              <div className="text-[var(--primary)] font-black text-xl mb-1">
                99.9%
              </div>
              <div className="text-[12px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Disponibilidad
              </div>
            </div>
            <div className="p-4 rounded-md bg-[var(--surface-active)] shadow-sm border border-[var(--border-subtle)] backdrop-blur-md">
              <div className="text-[var(--primary)] font-black text-xl mb-1">
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
      <div className="flex-1 flex items-center justify-center p-1 md:p-20 relative bg-[var(--surface-active)]">
        {/* Glow decorativo de fondo dinámico */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[hsl(var(--p-h),var(--p-s),var(--p-l),0.2)] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--primary)]/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-t from-transparent to-[var(--primary)]/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-t from-[hsl(var(--p-h),var(--p-s),var(--p-l),0.5)] to-[var(--primary)]/30 rounded-full blur-[100px] pointer-events-none" />

        {/* Card Contenedora */}
        <div
          className={`
          w-full max-w-md 
          bg-[var(--surface)]/90 backdrop-blur-xl
          border ${usuarioBloqueado ? "border-red-500/40" : "border-[var(--border-subtle)]"} 
          rounded-md 
          shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12),0_0_20px_rgba(255,0,127,0.02)] 
          p-6 md:p-8
          relative z-10
          transition-all duration-500
          hover:border-[var(--primary)]/20
        `}
        >
          {usuarioBloqueado ? (
            <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-red-600/10 flex items-center justify-center mb-6 border border-red-600/20 shadow-[0_0_40px_rgba(220,38,38,0.2)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  <line x1="12" y1="15" x2="12" y2="15.01" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-black mb-2 tracking-tight text-center">
                Acceso Restringido
              </h2>
              <p className="text-[13px] font-bold text-[var(--text-muted)] text-center max-w-[280px] leading-relaxed mb-8">
                Tu usuario ha sido suspendido temporalmente por el administrador
                del sistema. No tienes permiso para ingresar.
              </p>

              <button
                onClick={() => window.location.reload()}
                className="w-full h-12 bg-black rounded-md text-white text-[12px] font-black uppercase tracking-widest shadow-md hover:bg-black/80 hover:-translate-y-0.5 transition-all"
              >
                Volver a intentar
              </button>
            </div>
          ) : (
            <>
              {/* Header del Formulario (Iconic Style) */}
              <div className="mb-2 flex flex-col items-center">
                <div className="text-center mt-2">
                  <div className="inline-flex items-center gap-2 bg-[hsl(var(--p-h),var(--p-s),var(--p-l),0.1)] px-3 py-1.5 rounded-full mb-3 border border-[hsl(var(--p-h),var(--p-s),var(--p-l),0.1)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--primary)]">
                      Acceso Segúro
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {campos.map((campo) => (
                  <div key={campo.name} className="relative group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-[var(--text-theme)]/75 mb-2.5 group-focus-within:text-[var(--primary)] transition-colors ml-2">
                      {campo.label}
                    </label>

                    <div className="relative">
                      <input
                        type={campo.type || "text"}
                        value={valores[campo.name] || ""}
                        onChange={(e) =>
                          handleChange(campo.name, e.target.value)
                        }
                        placeholder={campo.placeholder}
                        inputMode={campo.inputMode}
                        maxLength={campo.maxLength}
                        className="
                    w-full h-12
                    rounded-md
                    bg-[var(--surface-active)]
                    border border-[var(--border-medium)]
                    text-[15px] text-[var(--text-primary)]
                    outline-none
                    border-[var(--primary)]
                    ring-2
                    ring-[hsl(var(--p-h),var(--p-s),var(--p-l),0.2)]
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
                          className="text-[11px] font-black uppercase tracking-wider text-[var(--primary)] hover:text-black transition-colors"
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
                        className="block text-[11px] font-black uppercase tracking-wider text-[var(--primary)] hover:text-black transition-colors"
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
              rounded-md
              bg-[var(--fucsia)]/20
              border border-[var(--fucsia)]/50 
              text-[var(--fucsia)] text-[13px] font-bold tracking-[0.2em] uppercase
              shadow-[0_12px_24px_-8px_rgba(255,0,127,0.3)]
              hover:shadow-[0_20px_32px_-8px_rgba(255,0,127,0.4)]
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
                        className="animate-spin h-5 w-5 text-[var(--fucsia)]"
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
                      className="text-[var(--primary)] hover:text-black font-black transition-colors"
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
