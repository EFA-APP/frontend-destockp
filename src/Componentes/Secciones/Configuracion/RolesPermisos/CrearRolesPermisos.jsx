import { UsuarioIcono, CandadoIcono } from "../../../../assets/Icons";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearRolesPermisos = ({ editandoRol, onGuardar, onCancelar }) => {
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

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <FormularioDinamico
                campos={configuracionFormulario}
                onSubmit={onGuardar}
                onCancel={onCancelar}
                datosIniciales={editandoRol}
                submitLabel={editandoRol ? "Actualizar Rol" : "Guardar Rol"}
            />
        </div>
    );
};

export default CrearRolesPermisos;
