import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useProductoUI } from "../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import { useObtenerPlantilla } from "../../../../Backend/Articulos/queries/Formularios/useObtenerPlantilla.query";
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

    // Consultar plantilla dinámica
    const { data: plantilla } = useObtenerPlantilla("PRODUCTO");

    // Si estamos editando y no tenemos data inicial (ej: F5), buscamos el producto
    useEffect(() => {
        if (isEdit && !initialData && productos.length > 0) {
            const found = productos.find(p => String(p.codigoSecuencial) === id);
            if (found) {
                setInitialData(found);
            }
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
            name: "stock",
            label: "Stock Total Disponible",
            type: "number",
            required: true,
            min: 0,
            section: "Gestión de Inventario",
            sectionIcon: <BalanceIcono />,
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

    const camposDinamicos = Array.isArray(plantilla?.campos) ? plantilla.campos.map(c => ({
        name: `caracteristicas_${c.name}`,
        label: c.label,
        type: c.type || "text",
        required: c.required || false,
        placeholder: c.placeholder || "",
        helpText: c.helpText || "",
        section: `Atributos Adicionales`,
        options: c.options || []
    })) : [];

    const camposTotales = [...camposProductos, ...camposDinamicos];

    const handleSubmit = async (data) => {
        try {
            // eslint-disable-next-line no-unused-vars
            const { unidadMedidaLegend, cantidadDePaquetesActuales, id: _, codigoSecuencial, ...rest } = data;

            // Ensamblar Nodo Caracteristicas
            const caracteristicas = {};
            if (initialData?.caracteristicas) {
                Object.assign(caracteristicas, initialData.caracteristicas);
            }
            Object.keys(data).forEach(key => {
                if (key.startsWith("caracteristicas_")) {
                    const cleanKey = key.replace("caracteristicas_", "");
                    caracteristicas[cleanKey] = data[key];
                    delete rest[key]; // 🧹 Limpiar del root para que no pase al Gateway
                }
            });

            const payload = {
                ...rest,
                unidadMedida: "FRASCO", // 🟢 Re-añadido para validación Enum del Gateway
                stock: parseFloat(data.stock) || 0,
                caracteristicas: Object.keys(caracteristicas).length > 0 ? caracteristicas : null
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
                campos={camposTotales}
                initialData={initialData ? {
                    ...initialData,
                    ...Object.keys(initialData.caracteristicas || {}).reduce((acc, key) => {
                        acc[`caracteristicas_${key}`] = initialData.caracteristicas[key];
                        return acc;
                    }, {})
                } : null}
                onSubmit={handleSubmit}
                submitLabel={isEdit ? (estaActualizando ? "Guardando..." : "Guardar Cambios") : (estaCreando ? "Procesando..." : "Finalizar Alta de Producto")}
            />
        </ContenedorSeccion>
    );
};

export default CrearProductos;
