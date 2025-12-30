import { AgregarIcono } from "../../../assets/Icons";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../UI/FormularioReutilizable/FormularioDinamico";

const CrearMateriaPrima = () => {
  const materiaPrimaCampos = [
    // ─────────────────────────────
    // INFORMACIÓN BÁSICA
    // ─────────────────────────────
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      required: true,
      placeholder: "Nombre de la materia prima",
      section: "Información Básica",
    },

    // ─────────────────────────────
    // STOCK
    // ─────────────────────────────
    {
      name: "unidad",
      label: "Unidad",
      type: "select",
      required: true,
      options: [
        { value: "kg", label: "Kilogramos (kg)" },
        { value: "g", label: "Gramos (g)" },
        { value: "l", label: "Litros (l)" },
        { value: "unidades", label: "Unidades" },
      ],
      section: "Stock",
    },
    {
      name: "cantidadPorPaquete",
      label: "Cantidad por Paquete",
      type: "number",
      required: true,
      min: 0.01,
      step: "0.01",
      section: "Stock",
      onChangeCalculate: (data) => ({
        ...data,
        stock: data.cantidadPorPaquete * data.paquetes,
        precioTotal:
          data.precioUnitario * data.cantidadPorPaquete * data.paquetes,
      }),
    },
    {
      name: "paquetes",
      label: "Número de Paquetes",
      type: "number",
      required: true,
      min: 1,
      section: "Stock",
      onChangeCalculate: (data) => ({
        ...data,
        stock: data.cantidadPorPaquete * data.paquetes,
        precioTotal:
          data.precioUnitario * data.cantidadPorPaquete * data.paquetes,
      }),
    },
    {
      name: "stock",
      label: "Stock Total",
      type: "number",
      readOnly: true,
      section: "Stock",
      helpText: "Calculado automáticamente",
    },

    // ─────────────────────────────
    // PRECIOS
    // ─────────────────────────────
    {
      name: "precioUnitario",
      label: "Precio Unitario ($)",
      type: "number",
      required: true,
      min: 0,
      step: "0.01",
      section: "Precios",
      onChangeCalculate: (data) => ({
        ...data,
        precioTotal: data.precioUnitario * data.stock,
      }),
    },
    {
      name: "precioTotal",
      label: "Precio Total ($)",
      type: "number",
      readOnly: true,
      section: "Precios",
      helpText: "Calculado automáticamente",
    },
  ];

  const handleSubmit = (data) => {
    console.log(`guardado:`, data);
    alert(`Materia Prima guardado!\nRevisa la consola.`);
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
        titulo="Nuevo Materia Prima"
        subtitulo="Complete los datos."
        campos={materiaPrimaCampos}
        onSubmit={handleSubmit}
        submitLabel="Guardar Materia Prima"
      />
    </div>
  );
};

export default CrearMateriaPrima;
