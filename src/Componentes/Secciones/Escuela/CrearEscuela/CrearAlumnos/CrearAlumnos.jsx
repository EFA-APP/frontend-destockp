import { AgregarIcono } from "../../../../../assets/Icons";
import EncabezadoSeccion from "../../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../../UI/FormularioReutilizable/FormularioDinamico";


const CrearAlumnos = () => {
  const alumnoCampos = [
    // ─────────────────────────────
    // INFORMACIÓN DEL ALUMNO
    // ─────────────────────────────
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      required: true,
      placeholder: "Nombre",
      section: "Alumno",
    },
    {
      name: "apellido",
      label: "Apellido",
      type: "text",
      required: true,
      placeholder: "Apellido",
      section: "Alumno",
    },
    {
      name: "dni",
      label: "Documento (DNI)",
      type: "number",
      required: true,
      placeholder: "DNI",
      section: "Alumno",
    },
    {
      name: "curso",
      label: "Curso / Año",
      type: "text",
      required: true,
      placeholder: "Ej: 7° A",
      section: "Alumno",
    },
    {
      name: "estado",
      label: "Estado del Alumno",
      type: "select",
      required: true,
      section: "Alumno",
      options: [
        { label: "Activo", value: "activo" },
        { label: "Suspendido", value: "suspendido" },
        { label: "Egresado", value: "egresado" },
      ],
    },

    // ─────────────────────────────
    // RESPONSABLE DE PAGO
    // ─────────────────────────────
    {
      name: "responsableNombre",
      label: "Nombre del Responsable",
      type: "text",
      required: true,
      placeholder: "Nombre y apellido",
      section: "Responsable de Pago",
    },
    {
      name: "responsableDni",
      label: "DNI del Responsable",
      type: "number",
      required: true,
      placeholder: "DNI",
      section: "Responsable de Pago",
    },
    {
      name: "responsableTelefono",
      label: "Teléfono del Responsable",
      type: "text",
      placeholder: "3815551234",
      section: "Responsable de Pago",
    },

    // ─────────────────────────────
    // CONFIGURACIÓN DE CUOTAS
    // ─────────────────────────────
    {
      name: "montoCuota",
      label: "Monto de Cuota Mensual",
      type: "number",
      required: true,
      placeholder: "15000",
      section: "Configuración de Cuotas",
    },
    {
      name: "diaVencimiento",
      label: "Día de Vencimiento",
      type: "number",
      required: true,
      placeholder: "10",
      min: 1,
      max: 31,
      section: "Configuración de Cuotas",
      helperText: "Día del mes en que vence la cuota",
    },
    {
      name: "descuento",
      label: "Descuento (%)",
      type: "number",
      placeholder: "0",
      min: 0,
      max: 100,
      section: "Configuración de Cuotas",
      helperText: "Becas o descuentos especiales",
    },
    {
      name: "aplicarInteres",
      label: "Aplicar Interés por Mora",
      type: "checkbox",
      section: "Configuración de Cuotas",
      defaultValue: true,
    },
    {
      name: "tasaInteres",
      label: "Tasa de Interés Mensual (%)",
      type: "number",
      placeholder: "2",
      section: "Configuración de Cuotas",
      helperText: "Interés que se aplica después del vencimiento",
      dependsOn: "aplicarInteres", // Solo se muestra si aplicarInteres está marcado
    },
    {
      name: "matricula",
      label: "Matrícula (Pago único)",
      type: "number",
      placeholder: "50000",
      section: "Configuración de Cuotas",
      helperText: "Monto de inscripción anual",
    },
    {
      name: "observaciones",
      label: "Observaciones de Pago",
      type: "textarea",
      fullWidth: true,
      placeholder: "Acuerdos especiales, hermanos, becas...",
      section: "Configuración de Cuotas",
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
      label: "Teléfono Alternativo",
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
  ];

  const handleSubmit = (data) => {
    const alumno = {
      id: crypto.randomUUID(),
      ...data,
      fechaIngreso: new Date().toISOString().split("T")[0],
    };

    console.log("Alumno guardado:", alumno);
    alert("Alumno creado correctamente");
  };

  return (
    <div className="px-3 py-4">
      {/* Encabezado */}
      <div className="card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md mb-4">
        <EncabezadoSeccion
          ruta={"Crear Alumno"}
          icono={<AgregarIcono />}
          volver={true}
          redireccionAnterior={"/panel/escuela/alumnos"}
        />
      </div>

      {/* Formulario */}
      <FormularioDinamico
        titulo="Nuevo Alumno"
        subtitulo="Complete los datos del alumno y del responsable de pago."
        campos={alumnoCampos}
        onSubmit={handleSubmit}
        submitLabel="Guardar Alumno"
      />
    </div>
  );
};

export default CrearAlumnos;
