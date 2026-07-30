import { useQuery } from "@tanstack/react-query";
import { obtenerUsuariosHabilitadosApi } from "../../api/Accion/accion.api";

// Complemento de lectura agregado en implementación (R17): precarga el
// whitelist actual de UsuarioAccionHabilitada para una combinación
// Empresa+SubMenu+Acción, antes de que ModalGestionarAcciones.jsx lo
// sobrescriba con actualizarUsuariosHabilitadosPorAccion. Revisión 3
// (R45, R64): codigoSubMenu reemplaza a codigoSeccion.
export const useObtenerUsuariosHabilitados = ({ codigoEmpresa, codigoSubMenu, codigoAccion }) => {
    return useQuery({
        queryKey: ["usuarios-habilitados", codigoEmpresa, codigoSubMenu, codigoAccion],
        queryFn: () => obtenerUsuariosHabilitadosApi({ codigoEmpresa, codigoSubMenu, codigoAccion }),
        enabled: !!codigoEmpresa && !!codigoSubMenu && !!codigoAccion,
        staleTime: 1000 * 60 * 5,
    });
};
