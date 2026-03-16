import React from "react";
import { accionesReutilizables } from "../../../../UI/AccionesReutilizables/accionesReutilizables";
import { Lock, Unlock, Trash } from "lucide-react";

export const accionesUsuarios = ({
    handleAsignarRol,
    handleToggleEstado,
    handleEliminar,
    isPendingEstado,
    variablesEstado,
    isPendingEliminar,
    variablesEliminar
}) => [
        {
            ...accionesReutilizables.asignarRol,
            onClick: (fila) => handleAsignarRol(fila),
        },
        {
            ...accionesReutilizables.bloquear,
            onClick: (fila) => handleToggleEstado(fila),
            isLoading: (fila) => isPendingEstado && variablesEstado?.codigoSecuencial === fila.codigoSecuencial
        },
        {
            ...accionesReutilizables.eliminar,
            onClick: (fila) => handleEliminar(fila),
            isLoading: (fila) => isPendingEliminar && variablesEliminar === fila.codigoSecuencial
        }
    ];
