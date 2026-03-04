import { accionesReutilizables } from "../../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesRolesPermisos = ({
    handleEditar,
    manejarEliminar,
}) => [
        {
            ...accionesReutilizables.editar,
            onClick: handleEditar,
        },
        {
            ...accionesReutilizables.eliminar,
            onClick: manejarEliminar,
        },
    ];
