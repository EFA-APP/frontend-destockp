import { useNavigate } from "react-router-dom";
import { AgregarIcono, ArcaIcono, BalanceIcono } from "../../../../assets/Icons";
import { useMateriaPrimaUI } from "../../../../Backend/Articulos/hooks/MateriaPrima/useMateriaPrimaUI";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearMateriaPrima = () => {
  const navigate = useNavigate();
  const { crearMateriaPrima, estaCreando } = useMateriaPrimaUI();

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
      <div className="card no-inset no-ring bg-[var(--surface)] shadow-md rounded-md mb-6">
        <EncabezadoSeccion
          ruta={"Registro de Insumos"}
          icono={<AgregarIcono />}
          volver={true}
          redireccionAnterior={"/panel/inventario/materia-prima"}
        />
      </div>

      {/* Formulario */}
      <FormularioDinamico
        titulo="Alta de Materia Prima"
        subtitulo="Registre nuevos componentes para su cadena de producción."
        campos={materiaPrimaCampos}
        onSubmit={handleSubmit}
        submitLabel={estaCreando ? "Registrando..." : "Confirmar Alta de Material"}
        onCancel={() => navigate("/panel/inventario/materia-prima")}
      />
    </div>
  );
};

export default CrearMateriaPrima;
