import EncabezadoSeccion from "../../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../../UI/FormularioReutilizable/FormularioDinamico";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CandadoIcono, UsuarioIcono } from "../../../../../assets/Icons";
import { usePermisosUI } from "../../../../../Backend/Autenticacion/hooks/Permiso/usePermisosUI";
import { useRolesUI } from "../../../../../Backend/Autenticacion/hooks/Rol/useRolesUI";
import React from "react";

const CrearRolesPermisos = ({ editandoRol }) => {
    const { crearRol, creandoRol, actualizarRol, actualizandoRol } = useRolesUI();
    const { permisos: permisosBackend, cargandoPermisos } = usePermisosUI();
    const location = useLocation();
    const navigate = useNavigate();
    const { codigoSecuencial } = useParams();

    // 1. Accedemos al objeto que enviaste por el state
    const rolDesdeEstado = location.state?.rol;

    // Calculamos el data inicial de forma síncrona para que el formulario lo tome en el primer render
    const initialData = React.useMemo(() => {
        const data = rolDesdeEstado || editandoRol;
        if (!data) return null;

        const formattedData = { ...data };
        // Aplanamos 'rolesPermisos' a 'permisos' (array de strings) para los checkboxes
        if (data.rolesPermisos && (!data.permisos || data.permisos.length === 0)) {
            formattedData.permisos = data.rolesPermisos
                .map(rp => rp.permiso?.nombre)
                .filter(Boolean);
        }
        return formattedData;
    }, [rolDesdeEstado, editandoRol]);

    const esEdicion = !!rolDesdeEstado || !!editandoRol || !!codigoSecuencial;

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
            name: "activo",
            label: "Estado del Rol",
            type: "custom",
            section: "Datos Básicos",
            render: (formData, setFormData) => (
                <div className="flex items-center gap-3 mt-1">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent    focus:outline-none ${formData.activo ? 'bg-[var(--primary)]' : 'bg-[var(--surface-active)]'}`}
                    >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[var(--surface)] shadow ring-0 transition   ${formData.activo ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-[13px] font-bold uppercase tracking-wider ${formData.activo ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {formData.activo ? 'ACTIVO (Visible)' : 'INACTIVO (Oculto)'}
                    </span>
                </div>
            )
        },
        {
            name: "secciones_vinculadas",
            label: "Vincular Secciones del Sistema",
            type: "custom",
            section: "Secciones y Permisos",
            sectionIcon: <CandadoIcono />,
            fullWidth: true,
            render: (formData, setFormData) => {
                if (cargandoPermisos) {
                    return <p className="text-[13px] text-[var(--text-muted)] italic py-2">Cargando permisos desde el sistema...</p>;
                }

                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {permisosBackend.map((permiso) => (
                            <label key={permiso.codigoSecuencial || permiso.id} className="group flex items-center gap-3 p-3 bg-[var(--surface-hover)]/20 border border-[var(--border-subtle)] rounded-md! cursor-pointer hover:border-[var(--primary)]/50 hover:bg-[var(--primary-subtle)]/10  ">
                                <div className="flex items-center justify-center w-5 h-5 rounded border border-[var(--border-medium)] bg-[var(--surface)] group-hover:border-[var(--primary)] ">
                                    <input
                                        type="checkbox"
                                        className="peer hidden"
                                        checked={formData.permisos?.includes(permiso.nombre)}
                                        onChange={(e) => {
                                            const current = formData.permisos || [];
                                            const next = e.target.checked
                                                ? [...current, permiso.nombre]
                                                : current.filter(s => s !== permiso.nombre);
                                            setFormData({ ...formData, permisos: next });
                                        }}
                                    />
                                    {formData.permisos?.includes(permiso.nombre) && (
                                        <div className="w-3 h-3 bg-[var(--primary)] rounded-sm   " />
                                    )}
                                </div>
                                <span className={`text-[13px] font-bold uppercase tracking-wider  ${formData.permisos?.includes(permiso.nombre) ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                                    {permiso.nombre}
                                </span>
                            </label>
                        ))}
                    </div>
                );
            }
        }
    ];

    const onGuardar = async (data) => {
        try {
            const payload = { ...data };
            delete payload.rolesPermisos; // Limpiamos info del backend
            delete payload.secciones_vinculadas;
            delete payload.creadoEn;
            delete payload.actualizadoEn;

            // Formateamos permisos para el DTO que espera el backend
            if (payload.permisos && Array.isArray(payload.permisos)) {
                payload.permisos = payload.permisos.map(p => ({ nombre: p }));
            }

            if (esEdicion) {
                const cod = initialData?.codigoSecuencial || initialData?.codigo || codigoSecuencial;
                await actualizarRol({
                    codigo: Number(cod),
                    data: {
                        nombre: payload.nombre,
                        descripcion: payload.descripcion,
                        activo: payload.activo,
                        permisos: payload.permisos
                    }
                });
            } else {
                await crearRol(payload);
            }

            navigate("/panel/configuracion/roles");
        } catch (error) {
            console.error("Error saving role:", error);
        }
    };

    const onCancelar = () => {
        navigate("/panel/configuracion/roles");
    };

    return (
        <div className="w-full py-6 px-6 space-y-6">
            <EncabezadoSeccion
                ruta={esEdicion ? "Configuración > Roles > Editar" : "Configuración > Roles > Nuevo"}
                icono={<CandadoIcono />}
                volver={true}
                redireccionAnterior={"/panel/configuracion/roles/"}
            />

            {esEdicion && initialData && (
                <div className="bg-[var(--surface-hover)]/40 p-5 rounded-md border border-[var(--primary)]/20 border-l-[4px] border-l-[var(--primary)] flex items-center justify-between   ">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--primary-subtle)]/20 flex items-center justify-center border border-[var(--primary)]/10">
                            <UsuarioIcono size={20} color="var(--primary)" />
                        </div>
                        <div>
                            <h3 className="text-[16px] font-bold text-[var(--text-primary)] uppercase tracking-tight">Estas Editando: {initialData.nombre}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[12px] bg-[var(--surface-active)] text-[var(--text-secondary)] px-2 py-0.5 rounded font-mono">CÓDIGO: {initialData.codigoSecuencial || initialData.codigo}</span>
                                <span className="text-[12px] text-[var(--text-muted)] italic">Creado el {new Date(initialData.creadoEn).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <FormularioDinamico
                campos={configuracionFormulario}
                onSubmit={onGuardar}
                onCancel={onCancelar}
                initialData={initialData}
                submitLabel={
                    creandoRol || actualizandoRol
                        ? "Guardando..."
                        : (esEdicion ? "Actualizar Rol" : "Guardar Rol")
                }
                loading={creandoRol || actualizandoRol}
            />
        </div>
    );
};

export default CrearRolesPermisos;
