import { useNavigate } from "react-router-dom";
import { AgregarIcono } from "../../../../assets/Icons";
import { useMateriaPrimaUI } from "../../../../Backend/Articulos/hooks/MateriaPrima/useMateriaPrimaUI";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearMateriaPrima = () => {
  const navigate = useNavigate();
  const { crearMateriaPrima, estaCreando } = useMateriaPrimaUI();

  const materiaPrimaCampos = [
    // ─────────────────────────────
    // INFORMACIÓN BÁSICA
    // ─────────────────────────────
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      required: true,
      placeholder: "Ej: AZÚCAR, HARINA...",
      section: "Información Básica",
    },
    {
      name: "tipo",
      label: "Tipo de Materia Prima",
      type: "select",
      required: true,
      options: [
        { value: "INSUMO", label: "INSUMO" },
        { value: "FRUTA", label: "FRUTA" },
      ],
      section: "Información Básica",
    },

    // ─────────────────────────────
    // STOCK Y MEDIDAS
    // ─────────────────────────────
    {
      name: "unidadMedida",
      label: "Unidad de Medida",
      type: "select",
      required: true,
      options: [
        { value: "KG", label: "Kilogramos (KG)" },
        { value: "GR", label: "Gramos (GR)" },
        { value: "UND", label: "Unidades (UND)" },
        { value: "LT", label: "Litros (LT)" },
        { value: "ML", label: "Mililitros (ML)" },
      ],
      section: "Stock y Medidas",
    },
    {
      name: "stock",
      label: "Stock Actual",
      type: "number",
      required: false,
      min: 0,
      step: "0.01",
      section: "Stock y Medidas",
      helpText: "Cantidad física disponible actualmente",
    },
    {
      name: "cantidadPorPaquete",
      label: "Cantidad por Paquete (Opcional)",
      type: "number",
      required: false,
      min: 0,
      step: "0.01",
      section: "Stock y Medidas",
      helpText: "Ej: 1 si es por unidad, o el peso del pack",
    },
  ];

  const handleSubmit = async (data) => {
    try {
      // Limpiamos datos opcionales si son 0 o vacíos
      const payload = {
        ...data,
        activo: true,
        stock: parseFloat(data.stock) || 0,
        cantidadPorPaquete: data.cantidadPorPaquete ? parseFloat(data.cantidadPorPaquete) : null
      };
      
      await crearMateriaPrima(payload);
      navigate("/panel/inventario/materia-prima");
    } catch (error) {
      console.error("Error al crear materia prima:", error);
    }
  };

  return (
    <div className="px-3 py-4">
      {/* Encabezado */}
      <div className="card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md mb-4">
        <EncabezadoSeccion
          ruta={"Crear Materia Prima"}
          icono={<AgregarIcono />}
          volver={true}
          redireccionAnterior={"/panel/inventario/materia-prima"}
        />
      </div>

      {/* Formulario */}
      <FormularioDinamico
        titulo="Nueva Materia Prima"
        subtitulo="Defina los parámetros básicos de su insumo."
        campos={materiaPrimaCampos}
        onSubmit={handleSubmit}
        submitLabel={estaCreando ? "Guardando..." : "Guardar Materia Prima"}
        onCancel={() => navigate("/panel/inventario/materia-prima")}
      />
    </div>
  );
};

export default CrearMateriaPrima;
