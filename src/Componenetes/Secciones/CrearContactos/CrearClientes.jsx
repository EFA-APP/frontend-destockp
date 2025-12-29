import { AgregarIcono } from "../../../assets/Icons";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../UI/FormularioReutilizable/FormularioDinamico";

const CrearClientes = () => {
  // Configuración para PRODUCTOS
  const clientesFields = [
    // ─────────────────────────────
    // INFORMACIÓN BÁSICA
    // ─────────────────────────────
    {
      name: "tipo",
      label: "Tipo de Cliente",
      type: "select",
      required: true,
      options: [
        { value: "COMPRADOR", label: "Comprador" },
        { value: "ALUMNO", label: "Alumno" },
      ],
      section: "Información Básica",
    },
    {
      name: "nombre",
      label: "Nombre y Apellido",
      type: "text",
      required: true,
      placeholder: "Nombre completo",
      section: "Información Básica",
    },
    {
      name: "documento",
      label: "Documento (DNI)",
      type: "number",
      required: true,
      placeholder: "DNI",
      section: "Información Básica",
    },

    // ─────────────────────────────
    // CONTACTO
    // ─────────────────────────────
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "correo@ejemplo.com",
      section: "Contacto",
    },
    {
      name: "telefono",
      label: "Teléfono",
      type: "text",
      placeholder: "3815551234",
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
      options: [
        { value: "Consumidor Final", label: "Consumidor Final" },
        { value: "Monotributo", label: "Monotributo" },
        { value: "Responsable Inscripto", label: "Responsable Inscripto" },
        { value: "Exento", label: "Exento" },
      ],
      section: "Facturación",
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
          ruta={"Crear Cliente"}
          icono={<AgregarIcono />}
          volver={true}
          redireccionAnterior={"/panel/contactos/clientes"}
        />
      </div>

      {/* Formulario */}
      <FormularioDinamico
        title="Nuevo Cliente"
        subtitle="Complete los datos."
        fields={clientesFields}
        onSubmit={handleSubmit}
        submitLabel="Guardar Cliente"
      />
    </div>
  );
};

export default CrearClientes;
