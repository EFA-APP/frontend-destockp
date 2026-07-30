import { axiosInitial } from "../../../Config";

// Reemplaza a permiso.api.js (R7, R8, R26): Accion es un catálogo global,
// sin filtro de codigoEmpresa.
export const obtenerAccionesApi = async () => {
    const response = await axiosInitial.get(`/acciones`, { showLoader: false });
    return response.data;
};

export const crearAccionApi = async (data) => {
    const response = await axiosInitial.post(`/acciones/crear`, data, { showLoader: false });
    return response.data;
};

// feature accion-vinculada-a-submenu: edición real de una Accion existente
// (nombre/descripcion/codigoSubMenu).
export const editarAccionApi = async (data) => {
    const response = await axiosInitial.patch(`/acciones/editar`, data, { showLoader: false });
    return response.data;
};

// R5, R15, R16(a), R38: reemplaza el manejo de "permisos" dentro de
// actualizarRol.
export const asignarAccionesARolApi = async ({ codigoEmpresa, ...data }) => {
    const response = await axiosInitial.patch(`/acciones/rol/asignar`, data, {
        params: { codigoEmpresa },
        showLoader: false,
    });
    return response.data;
};

// R16(b), R33-R36: reemplaza actualizarAccionesPermiso para la parte
// per-usuario. Revisión 3 (R45, R66): codigoSubMenu reemplaza a
// codigoSeccion de punta a punta, sin alias de compatibilidad.
export const actualizarUsuariosHabilitadosApi = async ({ codigoEmpresa, ...data }) => {
    const response = await axiosInitial.patch(`/acciones/usuarios-habilitados`, data, {
        params: { codigoEmpresa },
        showLoader: false,
    });
    return response.data;
};

export const obtenerUsuariosHabilitadosApi = async ({ codigoEmpresa, codigoSubMenu, codigoAccion }) => {
    const response = await axiosInitial.get(`/acciones/usuarios-habilitados`, {
        params: { codigoEmpresa, codigoSubMenu, codigoAccion },
        showLoader: false,
    });
    return response.data;
};

// AMPLIACIÓN feature accion-vinculada-a-submenu (2026-07-29), punto 1:
// borrado FÍSICO real de una Accion (no lógico, a diferencia de Seccion/Rol).
export const eliminarAccionApi = async ({ codigo }) => {
    const response = await axiosInitial.delete(`/acciones/eliminar`, {
        params: { codigo },
        showLoader: false,
    });
    return response.data;
};
