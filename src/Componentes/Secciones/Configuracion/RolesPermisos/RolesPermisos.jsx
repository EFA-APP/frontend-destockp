import { useState } from "react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import DataTable from "../../../UI/DataTable/DataTable";
import { CandadoIcono } from "../../../../assets/Icons";
import { accionesRolesPermisos } from "./AccionesRolesPermisos";
import CrearRolesPermisos from "./CrearRolesPermisos";
import { Navigate, useNavigate } from "react-router-dom";

const RolesPermisos = () => {
    const [editandoRol, setEditandoRol] = useState(null);

    const navigate = useNavigate();
    // Mock data for roles
    const [roles, setRoles] = useState([
        { id: 1, nombre: "Administrador", descripcion: "Acceso total al sistema", secciones: ["Todos"] },
        { id: 2, nombre: "Vendedor", descripcion: "Gestión de ventas y clientes", secciones: ["Ventas", "Contactos"] },
        { id: 3, nombre: "Contador", descripcion: "Acceso a reportes y contabilidad", secciones: ["Contabilidad"] },
    ]);

    const columnas = [
        { etiqueta: "ID", key: "id" },
        { etiqueta: "Nombre del Rol", key: "nombre" },
        { etiqueta: "Descripción", key: "descripcion" },
        {
            etiqueta: "Secciones Permitidas",
            key: "secciones",
            renderizar: (valor) => (
                <div className="flex flex-wrap gap-1">
                    {valor?.map((sec, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[var(--primary-subtle)] text-[var(--primary)] text-[9px] font-bold rounded-md! uppercase">
                            {sec}
                        </span>
                    ))}
                </div>
            )
        },
    ];

    const manejarGuardar = (datos) => {
        if (editandoRol) {
            setRoles(roles.map(r => r.id === editandoRol.id ? { ...datos, id: r.id } : r));
        } else {
            setRoles([...roles, { ...datos, id: roles.length + 1 }]);
        }
        console.log(datos)
        setMostrarFormulario(false);
        setEditandoRol(null);
    };

    return (
        <div className="w-full py-6 px-6 space-y-6">
            <EncabezadoSeccion
                ruta={"Configuración > Roles y Permisos"}
                icono={<CandadoIcono />}
            />


            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DataTable
                    datos={roles}
                    columnas={columnas}
                    titulo="Gestión de Roles"
                    subtitulo="Define quién puede acceder a qué partes del sistema"
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
                                setRoles(roles.filter(r => r.id !== rol.id));
                            }
                        }
                    })}
                />
            </div>
        </div>
    );
};

export default RolesPermisos;
