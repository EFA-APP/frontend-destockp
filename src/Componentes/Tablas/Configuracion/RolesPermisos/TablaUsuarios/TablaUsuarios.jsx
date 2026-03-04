import React from "react";
import DataTable from "../../../../UI/DataTable/DataTable";
import { useObtenerUsuarios } from "../../../../../Backend/Autenticacion/queries/Usuario/useObtenerUsuarios.query";
import { accionesUsuarios } from "./AccionesUsuarios";
import { columnasUsuarios } from "./ColumnaUsuarios";

const TablaUsuarios = ({ onAsignarRol }) => {
    const { data: usuariosResponse, isLoading: cargandoUsuarios } = useObtenerUsuarios();
    const usuarios = Array.isArray(usuariosResponse) ? usuariosResponse : (usuariosResponse?.usuarios || []);



    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <DataTable
                datos={usuarios}
                columnas={columnasUsuarios}
                titulo="Lista de Usuarios"
                subtitulo="Usuarios registrados en el sistema"
                loading={cargandoUsuarios}
                acciones={accionesUsuarios({
                    handleAsignarRol: onAsignarRol
                })}
            />
        </div>
    );
};

export default TablaUsuarios;
