import { AgregarIcono } from "../../../../../assets/Icons";
import EncabezadoSeccion from "../../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearAsiento = () => {
  /* =========================
     CÁLCULOS
  ========================== */
  const calcularTotalDebe = (items) =>
    items.reduce((sum, item) => sum + Number(item.debe || 0), 0);

  const calcularTotalHaber = (items) =>
    items.reduce((sum, item) => sum + Number(item.haber || 0), 0);

  /* =========================
     CAMPOS DEL FORMULARIO
  ========================== */
  const camposAsiento = [
    // ═══════════════════════════════════════
    // DATOS DEL ASIENTO
    // ═══════════════════════════════════════
    {
      name: "fecha",
      label: "Fecha",
      type: "date",
      required: true,
      section: "Asiento",
    },
    {
      name: "descripcion",
      label: "Descripción",
      type: "text",
      required: true,
      placeholder: "Ej: Pago de alquiler",
      section: "Asiento",
    },
    {
      name: "origen",
      label: "Origen",
      type: "select",
      required: true,
      defaultValue: "MANUAL",
      options: [
        { value: "MANUAL", label: "Manual" },
        { value: "VENTA", label: "Venta" },
        { value: "COMPRA", label: "Compra" },
      ],
      section: "Asiento",
    },
    {
      name: "comprobante",
      label: "Comprobante / Referencia",
      type: "text",
      section: "Asiento",
      placeholder: "FC A 0001-00001234",
    },

    // ═══════════════════════════════════════
    // MOVIMIENTOS CONTABLES (TABLA)
    // ═══════════════════════════════════════
    {
      name: "movimientos",
      type: "items-table",
      required: true,
      section: "Movimientos",
      fullWidth: true,
      errorMessage: "Debe ingresar al menos un movimiento",

      itemFields: [
        {
          name: "cuenta",
          label: "Cuenta Contable",
          type: "text",
          required: true,
          placeholder: "1.1.01",
          colSpan: "col-span-4",
        },
        {
          name: "nombreCuenta",
          label: "Nombre",
          type: "text",
          placeholder: "Caja",
          colSpan: "col-span-2",
          readOnly: true,
        },
        {
          name: "debe",
          label: "Debe",
          type: "number",
          defaultValue: 0,
          min: 0,
          step: 0.01,
          colSpan: "col-span-2",
        },
        {
          name: "haber",
          label: "Haber",
          type: "number",
          defaultValue: 0,
          min: 0,
          step: 0.01,
          colSpan: "col-span-2",
        },
      ],

      itemLayout: "grid-cols-12",

      tableColumns: [
        { key: "cuenta", label: "Cuenta", align: "text-left" },
        { key: "nombreCuenta", label: "Nombre", align: "text-left" },
        {
          key: "debe",
          label: "Debe",
          align: "text-right",
          render: (item) => (item.debe > 0 ? `$${item.debe.toFixed(2)}` : ""),
        },
        {
          key: "haber",
          label: "Haber",
          align: "text-right",
          render: (item) => (item.haber > 0 ? `$${item.haber.toFixed(2)}` : ""),
        },
      ],

      renderTotals: (items) => {
        const totalDebe = calcularTotalDebe(items);
        const totalHaber = calcularTotalHaber(items);

        const balanceado = totalDebe === totalHaber;

        return (
          <div className="flex justify-end">
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between text-green-400">
                <span>Total Debe:</span>
                <span>${totalDebe.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-blue-400">
                <span>Total Haber:</span>
                <span>${totalHaber.toFixed(2)}</span>
              </div>

              <div
                className={`flex justify-between font-semibold border-t pt-2 ${
                  balanceado ? "text-green-400" : "text-red-400"
                }`}
              >
                <span>Estado:</span>
                <span>
                  {balanceado ? "Asiento Balanceado" : "NO Balanceado"}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = (data) => {
    const totalDebe = calcularTotalDebe(data.movimientos);
    const totalHaber = calcularTotalHaber(data.movimientos);

    if (totalDebe !== totalHaber) {
      alert("❌ El asiento no está balanceado");
      return;
    }

    const payload = {
      fecha: data.fecha,
      descripcion: data.descripcion,
      origen: data.origen,
      comprobante: data.comprobante || null,
      movimientos: data.movimientos,
      totalDebe,
      totalHaber,
    };

    console.log("Asiento creado:", payload);
    alert("✅ Asiento contable guardado correctamente");
  };

  return (
    <div className="px-3 py-4">
      {/* Encabezado */}
      <div className="card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md mb-4">
        <EncabezadoSeccion
          ruta="Crear Asiento Contable"
          icono={<AgregarIcono />}
          volver
          redireccionAnterior="/panel/contabilidad/asientos"
        />
      </div>

      <FormularioDinamico
        titulo="Nuevo Asiento Contable"
        subtitulo="Ingrese los datos del asiento"
        campos={camposAsiento}
        onSubmit={handleSubmit}
        submitLabel="Guardar Asiento"
      />
    </div>
  );
};

export default CrearAsiento;
