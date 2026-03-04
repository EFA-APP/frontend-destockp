import { accionesReutilizables } from "../../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesUsuarios = ({
    handleAsignarRol,
}) => [
        {
            ...accionesReutilizables.asignarRol,
            onClick: handleAsignarRol,
        },
    ];
