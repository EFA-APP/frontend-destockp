import React from "react";
import DataTable from "../../../../UI/DataTable/DataTable";
import { accionesRolesPermisos } from "./AccionesRolesPermisos";
import { useNavigate } from "react-router-dom";
import { useRolesUI } from "../../../../../Backend/Autenticacion/hooks/Rol/useRolesUI";
import { columnasRoles } from "./ColumnaRoles";

const TablaRoles = () => {
    const navigate = useNavigate();
    const { roles, cargandoRol, eliminarRol } = useRolesUI();

    return (
        <div className="  ">
            <DataTable id_tabla="roles"
                datos={roles || []}
                columnas={columnasRoles}
                titulo="Roles y Permisos"
                subtitulo="Define los roles del sistema y sus permisos"
                loading={cargandoRol}
                botonAgregar={{
                    texto: "Crear Nuevo Rol",
                    onClick: () => {
                        navigate("/panel/configuracion/roles/nuevo")
                    }
                }}
                acciones={accionesRolesPermisos({
                    handleEditar: (rol) => {
                        navigate(`/panel/configuracion/roles/editar`, { state: { rol } })
                    },
                    manejarEliminar: async (rol) => {
                        if (window.confirm(`¿Está seguro de que desea eliminar el rol "${rol.nombre}"?`)) {
                            try {
                                await eliminarRol({ codigo: rol.codigoSecuencial });
                            } catch (error) {
                                // Error handled by mutation
                            }
                        }
                    }
                })}
            />
        </div>
    );
};

export default TablaRoles;
