import { useObtenerPermisos } from "../../queries/Permiso/useObtenerPermisos.query";

export const usePermisosUI = () => {
    const { data: permisosResponse, isLoading: cargandoPermisos, error } = useObtenerPermisos();

    // El backend puede devolver un array directo o un objeto con la propiedad 'permisos'
    const permisos = Array.isArray(permisosResponse) ? permisosResponse : (permisosResponse?.permisos || []);

    return {
        permisos,
        cargandoPermisos,
        error
    };
};
