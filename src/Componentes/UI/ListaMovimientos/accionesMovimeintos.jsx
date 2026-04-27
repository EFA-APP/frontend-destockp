import { accionesReutilizables } from "../AccionesReutilizables/accionesReutilizables";

export const accionesMovimientos = ({ onAnular }) => [
    {
        ...accionesReutilizables.eliminar,
        onClick: (fila) => onAnular(fila),
    },
];
