import { accionesReutilizables } from "../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesUsuarios = ({
  handleEditarClick,
  handleEliminarClick,
  handleVincularRolUsuarioClick,
  handleVincularUnidadesClick,
}) => [
  {
    ...accionesReutilizables.editar,
    onClick: (fila) => handleEditarClick(fila),
  },
  {
    ...accionesReutilizables.bloquear,
    label: (fila) => (fila.activo ? "Suspender Usuario" : "Activar Usuario"),
    icono: (fila) =>
      fila.activo ? (
        accionesReutilizables.bloquear.icono
      ) : (
        <div className="p-1 rounded-md bg-emerald-700/10 text-emerald-700 hover:bg-emerald-700/20 ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
      ),
    onClick: (fila) => handleEliminarClick(fila),
  },
  {
    ...accionesReutilizables.vincularRolUsuario,
    onClick: (fila) => handleVincularRolUsuarioClick(fila),
  },
  {
    ...accionesReutilizables.unidadesNegocio,
    label: "Vincular Unidades",
    onClick: (fila) => handleVincularUnidadesClick(fila),
  },
];
