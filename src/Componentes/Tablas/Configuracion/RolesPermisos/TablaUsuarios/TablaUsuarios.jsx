import React, { useState } from "react";
import DataTable from "../../../../UI/DataTable/DataTable";
import { useObtenerUsuarios } from "../../../../../Backend/Autenticacion/queries/Usuario/useObtenerUsuarios.query";
import { useActualizarEstadoUsuario } from "../../../../../Backend/Autenticacion/queries/Usuario/useActualizarEstadoUsuario.mutation";
import { useEliminarUsuario } from "../../../../../Backend/Autenticacion/queries/Usuario/useEliminarUsuario.mutation";
import { accionesUsuarios } from "./AccionesUsuarios";
import { columnasUsuarios } from "./ColumnaUsuarios";
import ModalCrearUsuario from "./ModalCrearUsuario";
import ModalConfirmacion from "../../../../UI/ModalConfirmacion/ModalConfirmacion";
import { UserPlus } from "lucide-react";

/**
 * Tabla de Usuarios con Gestión de Estados y Eliminación.
 */
const TablaUsuarios = ({ onAsignarRol }) => {
    const { data: usuariosResponse, isLoading: cargandoUsuarios, refetch } = useObtenerUsuarios();
    const usuarios = Array.isArray(usuariosResponse) ? usuariosResponse : (usuariosResponse?.usuarios || []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmData, setConfirmData] = useState({ open: false, titulo: '', mensaje: '', onConfirm: null, colorConfirmar: 'bg-red-600!' });

    // Mutations
    const { mutate: actualizarEstado, isPending: isPendingEstado, variables: variablesEstado } = useActualizarEstadoUsuario();
    const { mutate: eliminarUsuario, isPending: isPendingEliminar, variables: variablesEliminar } = useEliminarUsuario();

    const cerrarConfirm = () => setConfirmData(prev => ({ ...prev, open: false }));

    const handleToggleEstado = (fila) => {
        const accion = fila.activo ? "bloquear" : "activar";
        setConfirmData({
            open: true,
            titulo: `${accion === "bloquear" ? "Bloquear" : "Activar"} Usuario`,
            mensaje: `¿Estás seguro de que deseas ${accion} al usuario "${fila.nombre} ${fila.apellido}"?`,
            colorConfirmar: accion === "bloquear" ? "bg-amber-600!" : "bg-emerald-600!",
            onConfirm: () => {
                actualizarEstado(
                    { codigoSecuencial: fila.codigoSecuencial, activo: !fila.activo },
                    { onSuccess: cerrarConfirm }
                );
            }
        });
    };

    const handleEliminar = (fila) => {
        setConfirmData({
            open: true,
            titulo: "Eliminar Usuario",
            mensaje: `¿Estás seguro de que deseas ELIMINAR al usuario "${fila.nombre} ${fila.apellido}"? Esta acción es irreversible.`,
            colorConfirmar: "bg-red-600!",
            onConfirm: () => {
                eliminarUsuario(fila.codigoSecuencial, { onSuccess: cerrarConfirm });
            }
        });
    };

    return (
        <React.Fragment>
            <div className="space-y-4 animate-in fade-in duration-300">
                <DataTable
                    datos={usuarios}
                    columnas={columnasUsuarios}
                    titulo="Lista de Usuarios"
                    subtitulo="Usuarios registrados en el sistema"
                    loading={cargandoUsuarios}
                    acciones={accionesUsuarios({
                        handleAsignarRol: onAsignarRol,
                        handleToggleEstado,
                        handleEliminar,
                        isPendingEstado,
                        variablesEstado,
                        isPendingEliminar,
                        variablesEliminar
                    })}
                    elementosSuperior={(
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:to-amber-400 border border-amber-500/20 rounded-md text-[11px] font-bold text-white uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/5 group active:scale-95"
                        >
                            <UserPlus size={14} className="group-hover:rotate-12 transition-transform" />
                            Agregar Usuario
                        </button>
                    )}
                    mobileFab={{ 
                        onClick: () => setIsModalOpen(true), 
                        icono: <UserPlus size={24} /> 
                    }}
                    onRefresh={refetch}
                />
            </div>

            <ModalCrearUsuario 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <ModalConfirmacion 
                open={confirmData.open}
                onClose={cerrarConfirm}
                onConfirm={confirmData.onConfirm}
                titulo={confirmData.titulo}
                mensaje={confirmData.mensaje}
                colorConfirmar={confirmData.colorConfirmar}
                isPending={isPendingEstado || isPendingEliminar}
            />
        </React.Fragment>
    );
};

export default TablaUsuarios;
