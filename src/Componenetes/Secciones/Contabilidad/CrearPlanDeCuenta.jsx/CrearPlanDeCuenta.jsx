import { AgregarIcono } from "../../../../assets/Icons";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearPlanDeCuenta = () => {
  const camposCuenta = [
    {
      name: "codigo",
      label: "Código de Cuenta",
      type: "text",
      required: true,
      section: "Cuenta",
      placeholder: "1.1.01",
      helpText: "Código contable jerárquico",
    },
    {
      name: "nombre",
      label: "Nombre de la Cuenta",
      type: "text",
      required: true,
      section: "Cuenta",
      placeholder: "Caja",
    },
    {
      name: "tipo",
      label: "Tipo de Cuenta",
      type: "select",
      required: true,
      section: "Clasificación",
      options: [
        { value: "ACTIVO", label: "Activo" },
        { value: "PASIVO", label: "Pasivo" },
        { value: "PATRIMONIO", label: "Patrimonio" },
        { value: "RESULTADO", label: "Resultado" },
      ],
    },
    {
      name: "subtipo",
      label: "Subtipo",
      type: "select",
      section: "Clasificación",
      options: [
        { value: "INGRESO", label: "Ingreso" },
        { value: "GASTO", label: "Gasto" },
        { value: "COSTO", label: "Costo" },
        { value: "BIEN_USO", label: "Bien de Uso" },
      ],
      helpText: "Solo para cuentas de resultado o activo",
    },
    {
      name: "cuentaPadre",
      label: "Cuenta Padre",
      type: "select",
      section: "Estructura",
      options: [
        { value: "", label: "-- Sin cuenta padre --" },
        { value: 1, label: "1 - Activo" },
        { value: 11, label: "1.1 - Activo Corriente" },
      ],
    },
    {
      name: "permiteMovimientos",
      label: "¿Permite Movimientos?",
      type: "select",
      section: "Configuración",
      defaultValue: "si",
      options: [
        { value: "si", label: "Sí" },
        { value: "no", label: "No (solo agrupadora)" },
      ],
    },
    {
      name: "descripcion",
      label: "Descripción",
      type: "textarea",
      section: "Observaciones",
      fullWidth: true,
      rows: 3,
    },
  ];

  const handleSubmit = (data) => {
    console.log("Cuenta contable creada:", data);
  };

  return (
    <div className="px-3 py-4">
      {/* Encabezado */}
      <div className="card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md mb-4">
        <EncabezadoSeccion
          ruta={"Crear Factura"}
          icono={<AgregarIcono />}
          volver={true}
          redireccionAnterior={"/panel/contabilidad/cuentas"}
        />
      </div>

      <FormularioDinamico
        titulo="Nueva Cuenta Contable"
        subtitulo="Defina la cuenta del plan contable"
        campos={camposCuenta}
        onSubmit={handleSubmit}
        submitLabel="Crear Cuenta"
      />
    </div>
  );
};

export default CrearPlanDeCuenta;
