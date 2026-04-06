import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useProductoUI } from "../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { AgregarIcono, InventarioIcono, BalanceIcono, ConfiguracionIcono, EditarIcono, ArcaIcono, AdvertenciaIcono } from "../../../../assets/Icons";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";
import { ListarConfiguracionCamposApi } from "../../../../Backend/Articulos/api/Producto/producto.api";

const CrearProductos = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEdit = !!id;

    const { crearProducto, actualizarProducto, productos, estaCreando, estaActualizando, cargando } = useProductoUI();
    const usuario = useAuthStore((state) => state.usuario);
    const tieneArca = usuario?.conexionArca || usuario?.configuracionArca?.activo;

    const [initialData, setInitialData] = useState(() => {
        const prod = location.state?.producto;
        if (!prod) return null;
        return { ...prod, ...(prod.atributos || {}) }; // Aplanar para FormularioDinamico
    });

    // Si estamos editando y no tenemos data inicial (ej: F5), buscamos el producto
    useEffect(() => {
        if (isEdit && !initialData && productos.length > 0) {
            const found = productos.find(p => String(p.codigoSecuencial) === id);
            if (found) {
                setInitialData({ ...found, ...(found.atributos || {}) }); // Aplanar
            }
        }
    }, [isEdit, id, productos, initialData]);

    const [camposDinamicos, setCamposDinamicos] = useState([]);
    const [configCargada, setConfigCargada] = useState(false);

    useEffect(() => {
        const cargarConfigs = async () => {
            try {
                const data = await ListarConfiguracionCamposApi('PRODUCTO');
                if (Array.isArray(data)) {
                    const mapeados = data.map(c => ({
                        name: c.claveCampo,
                        label: c.nombreCampo,
                        type: c.tipoDato === 'TEXTO' ? 'text' :
                            c.tipoDato === 'NUMERO' ? 'number' :
                                c.tipoDato === 'BOOLEANO' ? 'boolean' : 'select',
                        options: c.opciones ? c.opciones.map(o => ({ value: o, label: o })) : [],
                        required: c.requerido,
                        formula: c.formula,
                        section: "Atributos Adicionales",
                        sectionIcon: <ConfiguracionIcono />

                    }));
                    setCamposDinamicos(mapeados);
                }
                setConfigCargada(true);
            } catch (e) {
                console.error("Error cargando configs dinámicas:", e);
                setConfigCargada(true);
            }
        };
        cargarConfigs();
    }, []);

    // Configuración para PRODUCTOS
    const camposProductos = [
        {
            name: "nombre",
            label: "Nombre del Producto",
            type: "text",
            required: true,
            section: "Identificación de Producto",
            sectionIcon: <InventarioIcono />,
        },
        {
            name: "descripcion",
            label: "Descripción Detallada",
            type: "textarea",
            fullWidth: true,
            section: "Identificación de Producto",
        },
        {
            name: "tasaIva",
            label: "Alícuota IVA (%)",
            type: "select",
            options: [
                { value: 0, label: "0% (Exento / No Gravado)" },
                { value: 10.5, label: "10.5% (Reducida)" },
                { value: 21, label: "21% (General)" },
                { value: 27, label: "27% (Especial)" },
            ],
            defaultValue: 0,
            section: "Impuestos y Arca",
            sectionIcon: <ArcaIcono />,
        },
        {
            name: "stock",
            label: "Stock Actual",
            type: "number",
            required: true,
            defaultValue: 0,
            section: "Gestión de Inventario",
            sectionIcon: <BalanceIcono />,
        },
        {
            name: "activo",
            label: "Estado de Disponibilidad",
            type: "select",
            options: [
                { value: true, label: "ACTIVO - Visible para ventas" },
                { value: false, label: "INACTIVO - Oculto" },
            ],
            section: "Parámetros del Sistema",
            sectionIcon: <ConfiguracionIcono />,
            defaultValue: true,
            fullWidth: true,
        }
    ];

    const camposAMostrar = useMemo(() => {
        let base = [...camposProductos];
        if (!tieneArca) {
            base = base.filter(c => c.name !== "tasaIva");
        }
        return [...base, ...camposDinamicos];
    }, [camposDinamicos, camposProductos, tieneArca]);

    const handleSubmit = async (data) => {
        try {
            // 1. Extraer atributos dinámicos para agruparlos
            const atributos = {};
            camposDinamicos.forEach(c => {
                if (data[c.name] !== undefined) {
                    atributos[c.name] = data[c.name];
                }
            });

            // eslint-disable-next-line no-unused-vars
            const {
                unidadMedidaLegend,
                cantidadDePaquetesActuales,
                cantidadDepaquetesActuales,
                cantidadSobrante,
                codigoEmpresa,
                codigoUnidadNegocio,
                createdAt,
                updatedAt,
                id: _,
                codigoSecuencial,
                ...rest
            } = data;

            // 2. NUEVO: Purga explícita de 'rest' para evitar fugas duplicadas al Gateway
            camposDinamicos.forEach(c => {
                delete rest[c.name];
            });

            const payload = {
                ...rest,
                unidadMedida: "FRASCO",
                stock: parseFloat(data.stock) || 0,
                tasaIva: parseFloat(data.tasaIva) || 0,
                activo: data.activo === "true" || data.activo === true,
                atributos
            };

            if (isEdit) {
                await actualizarProducto(id, payload);
            } else {
                await crearProducto(payload);
            }
            navigate("/panel/inventario/productos");
        } catch (error) {
            console.error("Error al procesar producto:", error);
        }
    };

    if (isEdit && cargando && !initialData) {
        return (
            <ContenedorSeccion className="flex items-center justify-center p-20">
                <div className="animate-pulse text-[var(--primary)] font-black uppercase tracking-[0.2em]">Cargando Datos del Producto...</div>
            </ContenedorSeccion>
        );
    }

    if (configCargada && (!Array.isArray(camposDinamicos) || camposDinamicos.length === 0) && !isEdit) {
        return (
            <ContenedorSeccion>
                <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                    <div className="max-w-lg w-full bg-[#1a1a1a] border border-white/5 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden group">
                        {/* Decoración de fondo */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[var(--primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--primary)]/10 transition-all duration-700"></div>

                        <div className="relative z-10">
                            {/* Contenedor del Icono */}
                            <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-[var(--primary)]/20 rotate-3 group-hover:rotate-6 transition-transform duration-500">
                                <AdvertenciaIcono size={40} color="var(--primary)" />
                            </div>

                            {/* Texto Principal */}
                            <h2 className="text-3xl font-black text-white mb-4 tracking-tight leading-tight">
                                ¡Catálogo <br /> <span className="text-[var(--primary)] italic font-medium">Requerido</span>!
                            </h2>

                            <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-[280px] mx-auto font-medium">
                                Es necesario que hables con el administrador del sistema para configurar los campos del producto.
                            </p>

                            {/* Botones de Acción */}
                            <div className="flex justify-center items-center">
                                <button
                                    onClick={() => navigate("/panel/inventario/productos")}
                                    className="px-10 py-4 bg-white/5 text-white/70 font-bold uppercase tracking-[0.15em] text-xs rounded-2xl hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 w-full sm:w-auto"
                                >
                                    Volver Atrás
                                </button>
                            </div>
                        </div>

                        {/* Línea decorativa inferior */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent"></div>
                    </div>
                </div>
            </ContenedorSeccion>
        );
    }

    return (
        <ContenedorSeccion className="px-3 py-4">
            <div className="card no-inset no-ring bg-[var(--surface)] shadow-md rounded-md mb-6">
                <EncabezadoSeccion
                    ruta={isEdit ? `Gestión de Catálogo > Editar Producto` : "Gestión de Catálogo"}
                    icono={isEdit ? <EditarIcono /> : <AgregarIcono />}
                    volver={true}
                    redireccionAnterior={isEdit ? -1 : "/panel/inventario/productos"}
                />
            </div>

            <FormularioDinamico
                titulo={isEdit ? "Edición de Producto" : "Alta de Producto"}
                subtitulo={isEdit ? "Actualice la información técnica y comercial del producto." : "Registre un nuevo producto en el catálogo oficial de la empresa."}
                campos={camposAMostrar}
                initialData={initialData}
                onSubmit={handleSubmit}
                submitLabel={isEdit ? (estaActualizando ? "Guardando..." : "Guardar Cambios") : (estaCreando ? "Procesando..." : "Finalizar Alta de Producto")}
            />
        </ContenedorSeccion>
    );
};

export default CrearProductos;
