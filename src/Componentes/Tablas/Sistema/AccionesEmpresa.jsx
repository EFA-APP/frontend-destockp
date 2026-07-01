import { accionesReutilizables } from "../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesEmpresas = ({
  handleEditarClick,
  handleEliminarClick,
  handleDuplicarClick,
  handleUsuariosClick,
  handleUnidadesClick,
  handleRolesClick,
  handleConfigurarCamposClick,
  handlePuntosVentaClick,
  tieneAccion,
}) => [
  ...(tieneAccion("VER_USUARIOS_EMPRESA")
    ? [
        {
          ...accionesReutilizables.usuarios,
          onClick: (fila) => handleUsuariosClick(fila),
        },
      ]
    : []),
  ...(tieneAccion("VER_UNIDADES_EMPRESA")
    ? [
        {
          ...accionesReutilizables.unidadesNegocio,
          onClick: (fila) => handleUnidadesClick(fila),
        },
      ]
    : []),
  ...(handlePuntosVentaClick
    ? [
        {
          label: "Puntos de Venta",
          icono: (
            <div className="p-1 rounded-md bg-violet-700/10 text-violet-700 hover:bg-violet-700/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          ),
          onClick: (fila) => handlePuntosVentaClick(fila),
        },
      ]
    : []),
  ...(tieneAccion("VER_ROLES_EMPRESA")
    ? [
        {
          ...accionesReutilizables.roles,
          onClick: (fila) => handleRolesClick(fila),
        },
      ]
    : []),
  ...(tieneAccion("CONFIGURAR_CAMPOS_EMPRESA")
    ? [
        {
          ...accionesReutilizables.configurarCampos,
          onClick: (fila) => handleConfigurarCamposClick(fila),
        },
      ]
    : []),
  ...(tieneAccion("EDITAR_EMPRESA")
    ? [
        {
          ...accionesReutilizables.editar,
          onClick: (fila) => handleEditarClick(fila),
        },
      ]
    : []),
  ...(tieneAccion("ELIMINAR_EMPRESA")
    ? [
        {
          ...accionesReutilizables.bloquear,
          label: (fila) => fila.activo ? "Suspender Empresa" : "Activar Empresa",
          icono: (fila) => fila.activo ? (
            accionesReutilizables.bloquear.icono
          ) : (
            <div className="p-1 rounded-md bg-emerald-700/10 text-emerald-700 hover:bg-emerald-700/20 ">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          ),
          onClick: (fila) => handleEliminarClick(fila),
        },
      ]
    : []),
];
