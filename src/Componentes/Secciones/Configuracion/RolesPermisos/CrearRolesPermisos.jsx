import { UsuarioIcono, CandadoIcono } from "../../../../assets/Icons";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";
import { useRolesUI } from "../../../../Backend/Autenticacion/queries/Rol/useRolesUI";
import { useNavigate } from "react-router-dom";

const CrearRolesPermisos = ({ editandoRol }) => {
    const { crearRol, creandoRol } = useRolesUI();
    const navigate = useNavigate();

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
                                    checked={formData.permisos?.includes(sec.label)}
                                    onChange={(e) => {
                                        const current = formData.permisos || [];
                                        const next = e.target.checked
                                            ? [...current, sec.label]
                                            : current.filter(s => s !== sec.label);
                                        setFormData({ ...formData, permisos: next });
                                    }}
                                />
                                {formData.permisos?.includes(sec.label) && (
                                    <div className="w-3 h-3 bg-[var(--primary)] rounded-sm animate-in zoom-in-50 duration-200" />
                                )}
                            </div>
                            <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${formData.permisos?.includes(sec.label) ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                                {sec.label}
                            </span>
                        </label>
                    ))}
                </div>
            )
        }
    ];

    const onGuardar = async (data) => {
        try {
            // Eliminar propiedades no deseadas antes de enviar
            const payload = { ...data };
            delete payload.secciones;
            delete payload.secciones_vinculadas;

            if (payload.permisos && Array.isArray(payload.permisos)) {
                payload.permisos = payload.permisos.map(p => ({ nombre: p }));
            }

            await crearRol(payload);
            navigate("/panel/configuracion/roles");
        } catch (error) {
            console.error("Error creating role:", error);
        }
    };

    const onCancelar = () => {
        navigate("/panel/configuracion/roles");
    };

    return (
        <div className="w-full py-6 px-6 space-y-6">
            <EncabezadoSeccion
                ruta={"Configuración > Roles y Permisos"}
                icono={<CandadoIcono />}
                volver={true}
                redireccionAnterior={"/panel/configuracion/roles/"}
            />
            <FormularioDinamico
                campos={configuracionFormulario}
                onSubmit={onGuardar}
                onCancel={onCancelar}
                datosIniciales={editandoRol}
                submitLabel={creandoRol ? "Guardando..." : (editandoRol ? "Actualizar Rol" : "Guardar Rol")}
                loading={creandoRol}
            />
        </div>
    );
};

export default CrearRolesPermisos;
