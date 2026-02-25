import { useState } from "react";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import DataTable from "../../UI/DataTable/DataTable";
import FormularioDinamico from "../../UI/FormularioReutilizable/FormularioDinamico";
import { UsuarioIcono, CandadoIcono, AgregarIcono } from "../../../assets/Icons";
import { accionesRolesPermisos } from "./accionesRolesPermisos";

const RolesPermisos = () => {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editandoRol, setEditandoRol] = useState(null);

    // Mock data for roles
    const [roles, setRoles] = useState([
        { id: 1, nombre: "Administrador", descripcion: "Acceso total al sistema", secciones: ["Todos"] },
        { id: 2, nombre: "Vendedor", descripcion: "Gestión de ventas y clientes", secciones: ["Ventas", "Contactos"] },
        { id: 3, nombre: "Contador", descripcion: "Acceso a reportes y contabilidad", secciones: ["Contabilidad"] },
    ]);

    const seccionesDelSistema = [
        { id: "inicio", label: "Inicio / Dashboard" },
        { id: "inventario", label: "Inventario (Productos y Materia Prima)" },
        { id: "contactos", label: "Contactos (Clientes y Proveedores)" },
        { id: "ventas", label: "Ventas (Facturas, Notas, Órdenes)" },
        { id: "compras", label: "Compras (Facturas Proveedor)" },
        { id: "escuela", label: "Escuela (Alumnos, Cuotas, Recibos)" },
        { id: "contabilidad", label: "Contabilidad (Asientos, Libros, Balance)" },
        { id: "afip", label: "Mis Comprobantes AFIP" },
    ];

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

    const configuracionFormulario = [
        {
            name: "nombre",
            label: "Nombre del Rol",
            type: "text",
            required: true,
            placeholder: "Ej: Supervisor de Ventas",
            section: "Datos Básicos",
            sectionIcon: <UsuarioIcono />,
        },
        {
            name: "descripcion",
            label: "Descripción",
            type: "textarea",
            required: true,
            placeholder: "Breve descripción de las responsabilidades",
            section: "Datos Básicos",
            fullWidth: true,
        },
        {
            name: "secciones_vinculadas",
            label: "Vincular Secciones del Sistema",
            type: "custom",
            section: "Secciones y Permisos",
            sectionIcon: <CandadoIcono />,
            fullWidth: true,
            render: (formData, setFormData) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {seccionesDelSistema.map((sec) => (
                        <label key={sec.id} className="group flex items-center gap-3 p-3 bg-[var(--surface-hover)]/20 border border-[var(--border-subtle)] rounded-md! cursor-pointer hover:border-[var(--primary)]/50 hover:bg-[var(--primary-subtle)]/10 transition-all duration-300">
                            <div className="flex items-center justify-center w-5 h-5 rounded border border-[var(--border-medium)] bg-[var(--surface)] group-hover:border-[var(--primary)] transition-colors">
                                <input
                                    type="checkbox"
                                    className="peer hidden"
                                    checked={formData.secciones?.includes(sec.label)}
                                    onChange={(e) => {
                                        const current = formData.secciones || [];
                                        const next = e.target.checked
                                            ? [...current, sec.label]
                                            : current.filter(s => s !== sec.label);
                                        setFormData({ ...formData, secciones: next });
                                    }}
                                />
                                {formData.secciones?.includes(sec.label) && (
                                    <div className="w-3 h-3 bg-[var(--primary)] rounded-sm animate-in zoom-in-50 duration-200" />
                                )}
                            </div>
                            <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${formData.secciones?.includes(sec.label) ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                                {sec.label}
                            </span>
                        </label>
                    ))}
                </div>
            )
        }
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

            {!mostrarFormulario ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DataTable
                        datos={roles}
                        columnas={columnas}
                        titulo="Gestión de Roles"
                        subtitulo="Define quién puede acceder a qué partes del sistema"
                        botonAgregar={{
                            texto: "Crear Nuevo Rol",
                            onClick: () => {
                                setEditandoRol(null);
                                setMostrarFormulario(true);
                            }
                        }}
                        acciones={accionesRolesPermisos({
                            handleEditar: (rol) => {
                                setEditandoRol(rol);
                                setMostrarFormulario(true);
                            },
                            manejarEliminar: (rol) => {
                                if (window.confirm(`¿Está seguro de que desea eliminar el rol "${rol.nombre}"?`)) {
                                    setRoles(roles.filter(r => r.id !== rol.id));
                                }
                            }
                        })}
                    />
                </div>
            ) : (
                <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
                    <FormularioDinamico
                        campos={configuracionFormulario}
                        onSubmit={manejarGuardar}
                        onCancel={() => setMostrarFormulario(false)}
                        datosIniciales={editandoRol}
                        submitLabel={editandoRol ? "Actualizar Rol" : "Guardar Rol"}
                    />
                </div>
            )}
        </div>
    );
};

export default RolesPermisos;
