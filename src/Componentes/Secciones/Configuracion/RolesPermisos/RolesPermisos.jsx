import { useState } from "react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import DataTable from "../../../UI/DataTable/DataTable";
import { CandadoIcono } from "../../../../assets/Icons";
import { accionesRolesPermisos } from "./AccionesRolesPermisos";
import { useNavigate } from "react-router-dom";
import { useRolesUI } from "../../../../Backend/Autenticacion/queries/Rol/useRolesUI";
import { useObtenerUsuarios } from "../../../../Backend/Autenticacion/queries/Usuario/useObtenerUsuarios.query";
import ModalAsignarRolUsuario from "./ModalAsignarRolUsuario";

const RolesPermisos = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'usuarios'
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { roles, cargandoRol } = useRolesUI();

    // Obtener usuarios para la tabla de usuarios
    const { data: usuariosResponse, isLoading: cargandoUsuarios } = useObtenerUsuarios();
    const usuarios = Array.isArray(usuariosResponse) ? usuariosResponse : (usuariosResponse?.usuarios || []);

    const columnasRoles = [
        { etiqueta: "ID", key: "id" },
        { etiqueta: "Nombre del Rol", key: "nombre" },
        { etiqueta: "Descripción", key: "descripcion" },
        {
            etiqueta: "Secciones Permitidas",
            key: "permisos",
            renderizar: (valor) => (
                <div className="flex flex-wrap gap-1">
                    {valor?.map((sec, idx) => (
                        <span key={idx} className="px-2 py-1 bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-[10px] font-medium rounded-md shadow-sm flex items-center gap-1.5 transition-all hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)]/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                            {sec}
                        </span>
                    ))}
                </div>
            )
        },
    ];

    const columnasUsuarios = [
        { etiqueta: "ID", key: "id" },
        { etiqueta: "Nombre", key: "nombre", renderizar: (valor, fila) => `${fila.nombre} ${fila.apellido}` },
        { etiqueta: "Correo", key: "correoElectronico" },
        {
            etiqueta: "Rol Asignado",
            key: "rol",
            renderizar: (valor) => valor ? (
                <span className="px-2 py-1 bg-[var(--primary-subtle)] border border-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-bold rounded-md uppercase">
                    {valor.nombre || valor}
                </span>
            ) : (
                <span className="text-[var(--text-secondary)] italic text-xs">Sin asignar</span>
            )
        },
    ];

    return (
        <div className="w-full py-6 px-6 space-y-6">
            <EncabezadoSeccion
                ruta={"Configuración > Roles y Permisos"}
                icono={<CandadoIcono />}
            />

            {/* Sistema de Tabs (Segmented Control Aesthetic) */}
            <div className="flex bg-[var(--surface-hover)] p-1 rounded-xl w-fit border border-[var(--border-subtle)] mb-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm relative">
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`relative z-10 px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === 'roles' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)]'}`}
                >
                    Gestión de Roles
                </button>
                <button
                    onClick={() => setActiveTab('usuarios')}
                    className={`relative z-10 px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === 'usuarios' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)]'}`}
                >
                    Gestión de Usuarios
                </button>

                {/* Animated active background map */}
                <div
                    className="absolute top-1 bottom-1 w-[140px] bg-[var(--surface-active)] border border-[var(--primary)]/30 rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                        transform: `translateX(${activeTab === 'roles' ? '0px' : '142px'})`,
                    }}
                />
            </div>

            {/* Contenido según la tab activa */}
            {activeTab === 'roles' ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <DataTable
                        datos={roles || []}
                        columnas={columnasRoles}
                        titulo="Roles y Permisos"
                        subtitulo="Define los roles del sistema y sus permisos"
                        cargando={cargandoRol}
                        botonAgregar={{
                            texto: "Crear Nuevo Rol",
                            onClick: () => {
                                navigate("/panel/configuracion/roles/nuevo")
                            }
                        }}
                        acciones={accionesRolesPermisos({
                            handleEditar: (rol) => {
                                navigate(`/panel/configuracion/roles/editar/${rol.id}`)
                            },
                            manejarEliminar: (rol) => {
                                if (window.confirm(`¿Está seguro de que desea eliminar el rol "${rol.nombre}"?`)) {
                                    // Logic to delete role
                                    console.log("Delete role", rol.id);
                                }
                            }
                        })}
                    />
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-semibold rounded-lg transition-colors shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" /></svg>
                            Opciones de Usuario
                        </button>
                    </div>

                    <DataTable
                        datos={usuarios}
                        columnas={columnasUsuarios}
                        titulo="Lista de Usuarios"
                        subtitulo="Usuarios registrados y sus roles correspondientes en el sistema"
                        cargando={cargandoUsuarios}
                    />
                </div>
            )}

            <ModalAsignarRolUsuario
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default RolesPermisos;
