import { AgregarIcono } from "../../../assets/Icons";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../UI/FormularioReutilizable/FormularioDinamico";

const CrearProveedores = () => {
  // Configuración para PRODUCTOS
  const proveedoresFields = [
    // ─────────────────────────────
    // INFORMACIÓN BÁSICA
    // ─────────────────────────────
    {
      name: "razonSocial",
      label: "Razón Social",
      type: "text",
      required: true,
      placeholder: "Nombre de la empresa o proveedor",
      section: "Información Básica",
    },
    {
      name: "cuit",
      label: "CUIT",
      type: "text",
      required: true,
      placeholder: "30-XXXXXXXX-X",
      section: "Información Básica",
    },

    // ─────────────────────────────
    // CONTACTO
    // ─────────────────────────────
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "contacto@proveedor.com",
      section: "Contacto",
    },
    {
      name: "telefono",
      label: "Teléfono",
      type: "text",
      placeholder: "3815551111",
      section: "Contacto",
    },
    {
      name: "direccion",
      label: "Dirección",
      type: "text",
      fullWidth: true,
      placeholder: "Calle y número",
      section: "Contacto",
    },

    // ─────────────────────────────
    // FACTURACIÓN
    // ─────────────────────────────
    {
      name: "condicionIVA",
      label: "Condición IVA",
      type: "select",
      required: true,
      options: [
        { value: "Responsable Inscripto", label: "Responsable Inscripto" },
        { value: "Monotributo", label: "Monotributo" },
        { value: "Consumidor Final", label: "Consumidor Final" },
        { value: "Exento", label: "Exento" },
      ],
      section: "Facturación",
    },

    // ─────────────────────────────
    // CLASIFICACIÓN
    // ─────────────────────────────
    {
      name: "rubro",
      label: "Rubro",
      type: "select",
      required: true,
      section: "Clasificación",
      options: [
        { value: "alimentos", label: "Alimentos y Bebidas" },
        { value: "insumos", label: "Insumos" },
        { value: "materias_primas", label: "Materias Primas" },
        { value: "limpieza", label: "Limpieza e Higiene" },
        { value: "embalaje", label: "Embalaje" },
        { value: "logistica", label: "Logística y Transporte" },
        { value: "tecnologia", label: "Tecnología / Sistemas" },
        { value: "servicios", label: "Servicios" },
        { value: "mantenimiento", label: "Mantenimiento" },
        { value: "equipamiento", label: "Equipamiento" },
        { value: "construccion", label: "Construcción" },
        { value: "otros", label: "Otros" },
      ],
    },
  ];

  const handleSubmit = (data) => {
    console.log(`guardado:`, data);
    alert(`Cliente guardado!\nRevisa la consola.`);
  };

  return (
    <div className="px-3 py-4">
      {/* Encabezado */}
      <div className="card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md mb-4">
        <EncabezadoSeccion
          ruta={"Crear Proveedor"}
          icono={<AgregarIcono />}
          volver={true}
          redireccionAnterior={"/panel/contactos/proveedores"}
        />
      </div>

      {/* Formulario */}
      <FormularioDinamico
        title="Nuevo Proveedor"
        subtitle="Complete los datos."
        fields={proveedoresFields}
        onSubmit={handleSubmit}
        submitLabel="Guardar Proveedor"
      />
    </div>
  );
};

export default CrearProveedores;
