import React from "react";
import DataTable from "../../../../UI/DataTable/DataTable";
import { accionesRolesPermisos } from "./AccionesRolesPermisos";
import { useNavigate } from "react-router-dom";
import { useRolesUI } from "../../../../../Backend/Autenticacion/hooks/Rol/useRolesUI";
import { columnasRoles } from "./ColumnaRoles";

const TablaRoles = () => {
    const navigate = useNavigate();
    const { roles, cargandoRol } = useRolesUI();



    return (
        <div className="animate-in fade-in duration-300">
            <DataTable
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
                    manejarEliminar: (rol) => {
                        if (window.confirm(`¿Está seguro de que desea eliminar el rol "${rol.nombre}"?`)) {
                            // Logic to delete role
                        }
                    }
                })}
            />
        </div>
    );
};

export default TablaRoles;
