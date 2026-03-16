import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useProductoUI } from "../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import { AgregarIcono, InventarioIcono, BalanceIcono, ConfiguracionIcono, EditarIcono } from "../../../../assets/Icons";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearProductos = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEdit = !!id;

    const { crearProducto, actualizarProducto, productos, estaCreando, estaActualizando, cargando } = useProductoUI();
    const [initialData, setInitialData] = useState(location.state?.producto || null);

    // Si estamos editando y no tenemos data inicial (ej: F5), buscamos el producto
    useEffect(() => {
        if (isEdit && !initialData && productos.length > 0) {
            const found = productos.find(p => String(p.codigoSecuencial) === id);
            if (found) setInitialData(found);
        }
    }, [isEdit, id, productos, initialData]);

    // Configuración para PRODUCTOS
    const camposProductos = [
        // ─────────────────────────────
        // INFORMACIÓN BÁSICA
        // ─────────────────────────────
        {
            name: "nombre",
            label: "Nombre del Producto",
            type: "text",
            required: true,
            placeholder: "Ej: MERMELADA DE ARÁNDANOS",
            section: "Identificación de Producto",
            sectionIcon: <InventarioIcono />,
        },
        {
            name: "descripcion",
            label: "Descripción Detallada",
            type: "textarea",
            placeholder: "Indique especificaciones o notas del producto...",
            fullWidth: true,
            section: "Identificación de Producto",
        },
        {
            name: "unidadMedidaLegend",
            type: "custom",
            section: "Identificación de Producto",
            fullWidth: true,
            render: () => (
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-700">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                        <InventarioIcono size={20} color="var(--primary)" />
                    </div>
                    <div>
                        <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] mb-0.5">Configuración de Unidad</p>
                        <p className="text-[12px] text-white/60 font-medium">Todos los productos se gestionan por defecto en unidad: <span className="text-amber-500 font-bold">FRASCO</span></p>
                    </div>
                </div>
            )
        },

        // ─────────────────────────────
        // GESTIÓN DE STOCK
        // ─────────────────────────────
        {
            name: "cantidadPorPaquete",
            label: "Unidades por Pack",
            type: "number",
            required: true,
            min: 1,
            section: "Gestión de Inventario",
            sectionIcon: <BalanceIcono />,
            onChangeCalculate: (data) => {
                const cant = parseFloat(data.cantidadPorPaquete) || 0;
                const paq = parseFloat(data.cantidadDePaquetesActuales) || 0;
                const sobrante = parseFloat(data.cantidadSobrante) || 0;
                const stock = (cant * paq) + sobrante;

                return {
                    ...data,
                    stock: stock,
                };
            },
        },
        {
            name: "cantidadDePaquetesActuales",
            label: "Número de Packs",
            type: "number",
            required: true,
            min: 0,
            section: "Gestión de Inventario",
            onChangeCalculate: (data) => {
                const cant = parseFloat(data.cantidadPorPaquete) || 0;
                const paq = parseFloat(data.cantidadDePaquetesActuales) || 0;
                const sobrante = parseFloat(data.cantidadSobrante) || 0;
                const stock = (cant * paq) + sobrante;

                return {
                    ...data,
                    stock: stock,
                };
            },
        },
        {
            name: "cantidadSobrante",
            label: "Unidades Sobrantes",
            type: "number",
            required: true,
            min: 0,
            section: "Gestión de Inventario",
            defaultValue: 0,
            helpText: "Unidades sueltas (no empaquetadas)",
            onChangeCalculate: (data) => {
                const cant = parseFloat(data.cantidadPorPaquete) || 0;
                const paq = parseFloat(data.cantidadDePaquetesActuales) || 0;
                const sobrante = parseFloat(data.cantidadSobrante) || 0;
                const stock = (cant * paq) + sobrante;

                return {
                    ...data,
                    stock: stock,
                };
            },
        },
        {
            name: "stock",
            label: "Stock Total Estimado",
            type: "number",
            readOnly: true,
            section: "Gestión de Inventario",
            helpText: (data) => `Cálculo: (${data.cantidadDePaquetesActuales || 0} packs × ${data.cantidadPorPaquete || 0}) + ${data.cantidadSobrante || 0} sobrantes`,
        },

        // ─────────────────────────────
        // CONFIGURACIÓN
        // ─────────────────────────────
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

    const handleSubmit = async (data) => {
        try {
            // eslint-disable-next-line no-unused-vars
            const { unidadMedidaLegend, cantidadDePaquetesActuales, id: _, codigoSecuencial, ...rest } = data;

            const payload = {
                ...rest,
                unidadMedida: "FRASCO",
                cantidadPorPaquete: parseFloat(data.cantidadPorPaquete) || 0,
                cantidadDepaquetesActuales: parseFloat(data.cantidadDePaquetesActuales) || 0,
                cantidadSobrante: parseFloat(data.cantidadSobrante) || 0,
                stock: parseFloat(data.stock) || 0,
                activo: data.activo === "true" || data.activo === true
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
                <div className="animate-pulse text-amber-500 font-black uppercase tracking-[0.2em]">Cargando Datos del Producto...</div>
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
                campos={camposProductos}
                initialData={initialData}
                onSubmit={handleSubmit}
                submitLabel={isEdit ? (estaActualizando ? "Guardando..." : "Guardar Cambios") : (estaCreando ? "Procesando..." : "Finalizar Alta de Producto")}
            />
        </ContenedorSeccion>
    );
};

export default CrearProductos;
