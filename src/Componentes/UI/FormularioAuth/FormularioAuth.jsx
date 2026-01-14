import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CandadoIcono, ConfirmarContrasenaIcono, DocumentoIcono, EmailIcono, PersonaIcono } from "../../../assets/Icons";

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

  useEffect(() => {
    const iniciales = {};
    campos.forEach((c) => (iniciales[c.name] = ""));
    setValores(iniciales);
  }, [campos]);

  const handleChange = (name, value) => {
    setValores((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(valores);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1b1e22]">
      {/* Card */}
      <div
        className="
          w-full max-w-sm
          rounded-2xl
          bg-gradient-to-b from-[var(--fill2)] to-black/20
          border border-gray-300/20
          shadow-[0_25px_70px_rgba(209,112,16,0.11)]
          px-8 py-10
        "
      >
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <img
            src="/efa-logo.png"
            alt="Logo"
            className="w-14 rounded-full"
          />
        </div>

        <h2 className="text-xl font-semibold text-white text-center">
          {titulo}
        </h2>

        {descripcion && (
          <p className="text-sm text-white/60 text-center mt-1">
            {descripcion}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          {campos.map((campo) => (
            <div key={campo.name} className="relative">
              <label className="block text-xs text-white/70 mb-1">
                {campo.label}
              </label>

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
                  w-full h-10
                  rounded-md!
                  bg-black/20!
                  border border-white/10
                  text-sm text-white!
                  focus:outline-none
                  focus:border-[var(--primary)]
                  placeholder:text-gray-300/40!
                  px-10
                "
              />

              {/* Ícono */}
              {iconosPorCampo[campo.name] && (
                <span className="absolute top-7 left-3">
                  {iconosPorCampo[campo.name]}
                </span>
              )}

              {/* Error */}
              {errores[campo.name] && (
                <p className="text-xs text-red-400 mt-1">
                  {errores[campo.name]}
                </p>
              )}

              {/* Enlace por campo */}
              {campo.enlace && (
                <div className="flex justify-end mt-2">
                  <Link
                    to={campo.enlace.to}
                    className="text-xs text-[var(--primary-light)] hover:underline"
                  >
                    {campo.enlace.texto}
                  </Link>
                </div>
              )}
            </div>
          ))}

          {/* Enlaces extra */}
          {enlaces.map((enlace, i) => (
            <Link
              key={i}
              to={enlace.to}
              className="block text-xs text-[var(--primary-light)] hover:underline text-right"
            >
              {enlace.texto}
            </Link>
          ))}

          {/* Botón */}
          <button
            type="submit"
            disabled={cargando}
            className="
              w-full h-11
              flex items-center justify-center
              rounded-md!
              bg-[var(--primary)]!
              text-white! text-sm
              hover:brightness-110!
              transition
              disabled:opacity-60
              cursor-pointer
            "
          >
            {cargando ? boton.textoCargando : boton.texto}
          </button>

          {/* Pie */}
          {pieFormulario && (
            <div className="flex justify-center gap-1 text-white text-xs">
              {pieFormulario.pregunta}
              <Link
                to={pieFormulario.enlace.to}
                className="text-[var(--primary-light)] hover:underline"
              >
                {pieFormulario.enlace.texto}
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FormularioAuth;
