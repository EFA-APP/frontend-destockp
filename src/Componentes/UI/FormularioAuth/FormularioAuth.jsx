import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CandadoIcono, ConfirmarContrasenaIcono, ConsolaIcono, DocumentoIcono, EmailIcono, PersonaIcono } from "../../../assets/Icons";

const iconosPorCampo = {
  email: <EmailIcono color="var(--primary-light)" />,
  contrasena: <CandadoIcono color="var(--primary-light)" size={20} />,
  usuario: <PersonaIcono color="var(--primary-light)" size={20} />,
  cuit: <DocumentoIcono color="var(--primary-light)" size={20} />,
  confirmarContrasena: <ConfirmarContrasenaIcono color="var(--primary-light)" size={20} />,

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
    <div className="min-h-screen flex bg-[#090b0d] text-white overflow-hidden font-[Inter]">
      
      {/* PANEL IZQUIERDO: VISUAL / BRANDING */}
      <div className="hidden md:flex flex-1 relative flex-col justify-between p-16 bg-gradient-to-br from-[#040506] via-[#0d1014] to-[var(--primary)]/10 overflow-hidden border-r border-white/[0.03]">
        {/* Glows decorativos */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--primary)]/15 rounded-full blur-[120px] pointer-events-none animation-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--primary-light)]/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Logo superior */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-light)] p-0.5 shadow-lg">
            <div className="w-full h-full bg-[#0d1014] rounded-[10px] flex items-center justify-center">
              <ConsolaIcono size={28} color="var(--primary-light)" />
            </div>
          </div>
          <span className="text-lg font-black tracking-wider bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            SISTEMA
          </span>
        </div>

        {/* Contenido Central */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-black tracking-tight leading-[1.1] text-white">
            Optimiza tu gestión, <br />
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
              potencia tu negocio.
            </span>
          </h1>
          <p className="mt-4 text-sm text-gray-400 font-medium max-w-sm leading-relaxed">
            Accede a tu panel de control para gestionar inventario, ventas y métricas en tiempo real de forma inteligente.
          </p>

          {/* Micro-elementos decorativos (Features) */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
              <div className="text-[var(--primary)] font-black text-xl mb-1">99.9%</div>
              <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Disponibilidad</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
              <div className="text-[var(--primary-light)] font-black text-xl mb-1">Rápido</div>
              <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Acceso Seguro</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[10px] text-gray-500 font-medium">
          © 2026 Todos los derechos reservados. | v1.0.4
        </div>
      </div>

      {/* PANEL DERECHO: FORMULARIO */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-[#06080a]">
        
        {/* Glow decorativo de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--primary)]/90! rounded-full blur-[100px] pointer-events-none md:hidden" />

        {/* Card Contenedora */}
        <div className="
          w-full max-w-sm 
          bg-[var(--surface)] backdrop-blur-xl 
          border border-white/[0.10] 
          rounded-3xl 
          shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] 
          p-8 md:p-10
          animate-in fade-in slide-in-from-bottom-4 duration-500
        ">
          {/* Header del Formulario */}
          <div className="mb-8 text-center md:text-left">
            <div className="md:hidden flex justify-center mb-4">
              <ConsolaIcono size={40} color="var(--primary-light)" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {titulo}
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              {descripcion || "Ingresa tus credenciales para continuar"}
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {campos.map((campo) => (
            <div key={campo.name} className="relative group">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 transition-colors group-focus-within:text-[var(--primary-light)]">
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
                    w-full h-11
                    rounded-xl
                    bg-black/20
                    border border-white/10
                    text-sm text-white
                    focus:outline-none
                    focus:border-[var(--primary-light)]
                    focus:ring-1
                    focus:ring-[var(--primary-light)]
                    focus:bg-black/40
                    placeholder:text-gray-500
                    transition-all duration-300
                    px-10
                    shadow-inner
                  "
                />

                {/* Ícono */}
                {iconosPorCampo[campo.name] && (
                  <span className="absolute top-1/2 -translate-y-1/2 left-3.5 opacity-60 group-focus-within:opacity-100 transition-opacity duration-300">
                    {iconosPorCampo[campo.name]}
                  </span>
                )}

                {/* Custom slot, like password toggle - not currently managed in this generic mapping but keep styling flexible */}
              </div>

              {/* Error */}
              {errores[campo.name] && (
                <p className="text-xs text-red-400 mt-1.5 font-medium flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {errores[campo.name]}
                </p>
              )}

              {/* Enlace por campo */}
              {campo.enlace && (
                <div className="flex justify-end mt-2">
                  <Link
                    to={campo.enlace.to}
                    className="text-xs font-medium text-[var(--primary-light)] hover:text-white transition-colors"
                  >
                    {campo.enlace.texto}
                  </Link>
                </div>
              )}
            </div>
          ))}

          {/* Enlaces extra */}
          {enlaces.length > 0 && (
            <div className="flex flex-col items-end gap-1.5">
              {enlaces.map((enlace, i) => (
                <Link
                  key={i}
                  to={enlace.to}
                  className="block text-xs font-medium text-[var(--primary-light)] hover:text-white transition-colors"
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
              w-full h-11 mt-2
              flex items-center justify-center
              rounded-xl
              bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]
              text-white text-sm font-semibold tracking-wide
              hover:shadow-[0_0_20px_rgba(209,112,16,0.4)]
              hover:-translate-y-0.5
              active:translate-y-0
              active:scale-[0.98]
              transition-all duration-200
              disabled:opacity-60 disabled:hover:shadow-none disabled:hover:-translate-y-0 disabled:active:scale-100
              cursor-pointer
            "
          >
            {cargando ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {boton.textoCargando}
              </span>
            ) : (
              boton.texto
            )}
          </button>

          {/* Pie */}
          {pieFormulario && (
            <div className="flex justify-center gap-1.5 text-gray-400 text-xs mt-6 font-medium">
              {pieFormulario.pregunta}
              <Link
                to={pieFormulario.enlace.to}
                className="text-[var(--primary-light)] hover:text-white transition-colors font-semibold"
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
