import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

/**
 * Componente reutilizable para formularios de autenticación
 * @param {Object} props
 * @param {string} props.titulo - Título del formulario
 * @param {string} props.descripcion - Descripción del formulario
 * @param {Array} props.campos - Array de objetos con configuración de campos
 * @param {Function} props.onSubmit - Función que se ejecuta al enviar el formulario
 * @param {boolean} props.cargando - Estado de carga
 * @param {Object} props.errores - Objeto con errores de validación
 * @param {Array} props.enlaces - Enlaces adicionales (ej: "¿Olvidaste tu contraseña?")
 * @param {Object} props.boton - Configuración del botón principal
 * @param {Object} props.pieFormulario - Enlaces en el pie del formulario
 */
const FormularioAuth = ({
  titulo,
  descripcion,
  campos,
  onSubmit,
  cargando = false,
  errores = {},
  enlaces = [],
  boton = { texto: "Enviar" },
  pieFormulario = null,
}) => {
  const [valores, setValores] = useState({});

  // Inicializar valores del formulario
  useEffect(() => {
    const valoresIniciales = {};
    campos.forEach((campo) => {
      valoresIniciales[campo.name] = "";
    });
    setValores(valoresIniciales);
  }, []);

  const handleChange = (name, value) => {
    setValores((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(valores);
  };

  return (
    <div className="flex justify-center px-12 items-center min-h-screen">
      <div className="w-[320px]">
        <div>
          <img
            src="/logo.png"
            alt="logo"
            className="rounded-full h-[40px]"
          />
        </div>

        <h3 className="text-md font-semibold text-white mt-3">
          {titulo}
        </h3>
        <p className="text-white/70 text-xs mt-2">{descripcion}</p>

        <form className="mt-3" onSubmit={handleSubmit}>
          {campos.map((campo, index) => (
            <div key={campo.name} className="mb-ifv">
              <label
                className="text-xs text-white!"
                htmlFor={campo.name}
              >
                {campo.label}
              </label>
              <input
                id={campo.name}
                name={campo.name}
                type={campo.type || "text"}
                inputMode={campo.inputMode}
                placeholder={campo.placeholder}
                value={valores[campo.name] || ""}
                onChange={(e) => handleChange(campo.name, e.target.value)}
                maxLength={campo.maxLength}
                className="flex h-10 w-full rounded-md! px-3 py-2 text-xs! border-[0.2px]! border-gray-200/10! text-white! placeholder:text-[var(--primary-light)]/60"
              />
              
              {/* Enlaces después del input (ej: "¿Olvidaste tu email?") */}
              {campo.enlace && (
                <Link
                  className="text-[var(--primary-light)] hover:text-[var(--primary)]! text-xs"
                  to={campo.enlace.to}
                >
                  {campo.enlace.texto}
                </Link>
              )}

              {/* Mostrar error específico del campo */}
              {errores[campo.name] && (
                <p className="text-xs text-red-300 mt-1 text-right">
                  {errores[campo.name]}
                </p>
              )}
            </div>
          ))}

          {/* Enlaces adicionales entre campos y botón */}
          {enlaces.map((enlace, idx) => (
            <Link
              key={idx}
              className="text-[var(--primary-light)] text-xs hover:text-[var(--primary)]! block mb-2"
              to={enlace.to}
            >
              {enlace.texto}
            </Link>
          ))}

          <button
            type="submit"
            disabled={cargando}
            className={`bg-[var(--primary)]! w-full flex justify-center text-white! py-2 rounded-md! hover:bg-[var(--primary)]/80! ${
              cargando ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {cargando ? boton.textoCargando || "Cargando..." : boton.texto}
          </button>

          {/* Pie del formulario (ej: "¿Aún no tienes cuenta? Registrarse") */}
          {pieFormulario && (
            <div className="flex mt-3 gap-4">
              <div className="fle-oca item-gfk gap-w38">
                <p className="text-white text-xs">
                  {pieFormulario.pregunta}
                </p>
                <Link
                  className="text-[var(--primary-light)] text-xs cursor-pointer hover:text-[var(--primary)]!"
                  to={pieFormulario.enlace.to}
                >
                  {pieFormulario.enlace.texto}
                </Link>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FormularioAuth;