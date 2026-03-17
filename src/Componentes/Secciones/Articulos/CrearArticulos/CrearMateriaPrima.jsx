import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AgregarIcono, ArcaIcono, BalanceIcono, EditarIcono } from "../../../../assets/Icons";
import { useMateriaPrimaUI } from "../../../../Backend/Articulos/hooks/MateriaPrima/useMateriaPrimaUI";
import { useObtenerPlantilla } from "../../../../Backend/Articulos/queries/Formularios/useObtenerPlantilla.query";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearMateriaPrima = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEdit = !!id;

    const { crearMateriaPrima, actualizarMateriaPrima, materiasPrimas, estaCreando, estaActualizando, cargando } = useMateriaPrimaUI();
    const [initialData, setInitialData] = useState(location.state?.materiaPrima || null);

    // Consultar plantilla dinámica
    const { data: plantilla } = useObtenerPlantilla("MATERIA_PRIMA");

    // Si estamos editando y no tenemos data inicial (ej: F5), buscamos la materia prima
    useEffect(() => {
        if (isEdit && !initialData && materiasPrimas.length > 0) {
            const found = materiasPrimas.find(m => String(m.codigoSecuencial) === id);
            if (found) {
                setInitialData(found);
            }
        }
    }, [isEdit, id, materiasPrimas, initialData]);

    const materiaPrimaCampos = [
        // ─────────────────────────────
        // CATEGORIZACIÓN E IDENTIFICACIÓN
        // ─────────────────────────────
        {
            name: "nombre",
            label: "Nombre del Insumo",
            type: "text",
            required: true,
            placeholder: "Ej: AZÚCAR REFINADA, HARINA 0000...",
            section: "Identificación de Insumo",
            sectionIcon: <ArcaIcono />,
        },
        {
            name: "tipo",
            label: "Categoría de Material",
            type: "select",
            required: true,
            options: [
                { value: "INSUMO", label: "INSUMO - Materia prima base" },
                { value: "FRUTA", label: "FRUTA - Insumo fresco/agrícola" },
            ],
            section: "Identificación de Insumo",
        },

        // ─────────────────────────────
        // GESTIÓN DE EXISTENCIAS
        // ─────────────────────────────
        {
            name: "unidadMedida",
            label: "Tipo de Magnitud (Unidad)",
            type: "select",
            required: true,
            options: [
                { value: "KG", label: "Masa: Kilogramos (KG)" },
                { value: "GR", label: "Masa: Gramos (GR)" },
                { value: "UND", label: "Conteo: Unidades (UND)" },
                { value: "LT", label: "Volumen: Litros (LT)" },
                { value: "ML", label: "Volumen: Mililitros (ML)" },
            ],
            section: "Control de Stock",
            sectionIcon: <BalanceIcono />,
        },
        {
            name: "stock",
            label: "Existencia Inicial Física",
            type: "number",
            required: false,
            min: 0,
            step: "0.01",
            section: "Control de Stock",
            helpText: "Cantidad real disponible en depósito al momento de creación",
        },
        {
            name: "cantidadPorPaquete",
            label: "Contenido por Envase (Pack)",
            type: "number",
            required: false,
            min: 0,
            step: "0.01",
            section: "Control de Stock",
            helpText: "Peso o cantidad neta por cada bulto/pack (Opcional)",
        },
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

    const materiaPrimaCamposTotales = [...materiaPrimaCampos, ...camposDinamicos];

    const handleSubmit = async (data) => {
        try {
            // eslint-disable-next-line no-unused-vars
            const { id: _, codigoSecuencial, ...rest } = data;

            // Ensamblar Nodo Caracteristicas
            const caracteristicas = {};
            if (initialData?.caracteristicas) {
                Object.assign(caracteristicas, initialData.caracteristicas);
            }
            Object.keys(data).forEach(key => {
                if (key.startsWith("caracteristicas_")) {
                    const cleanKey = key.replace("caracteristicas_", "");
                    caracteristicas[cleanKey] = data[key];
                    delete rest[key]; // 🧹 Limpiar del root
                }
            });

            const payload = {
                ...rest,
                activo: true,
                stock: parseFloat(data.stock) || 0,
                caracteristicas: Object.keys(caracteristicas).length > 0 ? caracteristicas : null
            };

            if (isEdit) {
                await actualizarMateriaPrima(id, payload);
            } else {
                await crearMateriaPrima(payload);
            }
            navigate("/panel/inventario/materia-prima");
        } catch (error) {
            console.error("Error al procesar materia prima:", error);
        }
    };

    if (isEdit && cargando && !initialData) {
        return (
            <div className="flex items-center justify-center p-20 animate-pulse text-emerald-500 font-black uppercase tracking-[0.2em]">
                Cargando Datos del Insumo...
            </div>
        );
    }

    return (
        <div className="px-3 py-4">
            {/* Encabezado */}
            <div className="card no-inset no-ring bg-[var(--surface)] shadow-md rounded-md mb-6">
                <EncabezadoSeccion
                    ruta={isEdit ? "Registro de Insumos > Editar" : "Registro de Insumos"}
                    icono={isEdit ? <EditarIcono /> : <AgregarIcono />}
                    volver={true}
                    redireccionAnterior={isEdit ? -1 : "/panel/inventario/materia-prima"}
                />
            </div>

            {/* Formulario */}
            <FormularioDinamico
                titulo={isEdit ? "Edición de Materia Prima" : "Alta de Materia Prima"}
                subtitulo={isEdit ? "Modifique los parámetros del insumo en el sistema." : "Registre nuevos componentes para su cadena de producción."}
                campos={materiaPrimaCamposTotales}
                initialData={initialData ? {
                    ...initialData,
                    ...Object.keys(initialData.caracteristicas || {}).reduce((acc, key) => {
                        acc[`caracteristicas_${key}`] = initialData.caracteristicas[key];
                        return acc;
                    }, {})
                } : null}
                onSubmit={handleSubmit}
                submitLabel={isEdit ? (estaActualizando ? "Guardando..." : "Guardar Cambios") : (estaCreando ? "Registrando..." : "Confirmar Alta de Material")}
                onCancel={() => navigate("/panel/inventario/materia-prima")}
            />
        </div>
    );
};

export default CrearMateriaPrima;
