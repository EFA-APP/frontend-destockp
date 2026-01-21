// ─────────────────────────────────────
// CAMPOS DEL FORMULARIO
// ─────────────────────────────────────
export const camposFacturaProveedor = ({ comprobante }) => [
  // ═══════════════════════════════════════
  // DATOS DEL COMPROBANTE RECIBIDO
  // ═══════════════════════════════════════
  {
    name: "tipoComprobante",
    label: "Tipo de comprobante",
    type: "select",
    required: true,
    section: "Comprobante",
    options: [
      { value: "FA", label: "Factura A" },
      { value: "FB", label: "Factura B" },
      { value: "FC", label: "Factura C" },
      { value: "NC", label: "Nota de credito C" },
    ],
    defaultValue: comprobante?.tipo
  },
  {
    name: "puntoVenta",
    label: "Punto de Venta",
    type: "text",
    required: true,
    section: "Comprobante",
    placeholder: "0000",
    defaultValue: comprobante?.puntoVenta
  },
  {
    name: "numeroComprobante",
    label: "Número del comprobante",
    type: "text",
    required: true,
    section: "Comprobante",
    placeholder: "0002-00000123",
    helpText: "Número informado por el proveedor",
    defaultValue: comprobante?.numero
  },
  {
    name: "cae",
    label: "CAE",
    type: "text",
    required: true,
    section: "Comprobante",
    placeholder: "71345678901234",
    helpText: "Numero informado por ARCA",
    defaultValue: comprobante?.cae
  },
  {
    name: "fechaEmision",
    label: "Fecha de emisión",
    type: "date",
    required: true,
    section: "Comprobante",
    defaultValue: comprobante?.fechaEmission
  },
  {
    name: "fechaVencimiento",
    label: "Fecha de vencimiento",
    type: "date",
    section: "Comprobante",
    helpText: "Opcional",
    defaultValue: comprobante?.fechaVencimiento
  },
  {
    name: "archivoComprobante",
    label: "Seleccionar archivo",
    section: "Adjuntar factura (PDF / Imagen)",
    type: "file",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png",
    helpText: "Archivo original recibido del proveedor",
  },

  // ═══════════════════════════════════════
  // DATOS DEL PROVEEDOR
  // ═══════════════════════════════════════
  {
    name: "proveedorId",
    label: "Proveedor",
    type: "input",
    placeholder: "Nombre/Código Proveedor",
    required: true,
    section: "Proveedor",
    defaultValue: comprobante?.razonSocial
  },
  {
    name: "condicionIVAProveedor",
    label: "Condición frente al IVA",
    type: "select",
    required: true,
    section: "Proveedor",
    options: [
      { value: "responsable_inscripto", label: "Responsable Inscripto" },
      { value: "monotributista", label: "Monotributista" },
      { value: "exento", label: "Exento" },
    ],
  },

  // ═══════════════════════════════════════
  // CONTABILIDAD
  // ═══════════════════════════════════════
  {
    name: "cuentaContableId",
    label: "Cuenta contable",
    type: "select",
    required: true,
    section: "Contabilidad",
    options: [
      { value: 510101, label: "510101 - Compras de mercaderías" },
      { value: 510102, label: "510102 - Insumos" },
      { value: 520101, label: "520101 - Gastos de servicios" },
      { value: 130101, label: "130101 - Bienes de uso" },
    ],
    helpText: "Define el impacto contable de esta factura",
  },

  // ═══════════════════════════════════════
  // OBSERVACIONES
  // ═══════════════════════════════════════
  {
    name: "observaciones",
    label: "Observaciones",
    type: "textarea",
    section: "Observaciones",
    fullWidth: true,
    rows: 3,
    placeholder: "Notas internas, aclaraciones, etc.",
    defaultValue: comprobante?.observaciones

  },

  // ═══════════════════════════════════════
  // ITEMS (PRODUCTOS / SERVICIOS)
  // ═══════════════════════════════════════
  {
    name: "items",
    type: "items-table",
    required: true,
    section: "Detalle",
    fullWidth: true,
    errorMessage: "Debe agregar al menos un ítem",

    itemFields: [
      {
        name: "descripcion",
        placeholder: "Producto",
        label: "Descripción",
        type: "text",
        required: true,
        colSpan: "col-span-2",
      },
      {
        name: "cantidad",
        placeholder: "10",
        label: "Cantidad",
        type: "number",
        required: true,
        defaultValue: 1,
        min: 0,
        step: 0.01,
        colSpan: "col-span-2",
      },
      {
        name: "precioUnitario",
        placeholder: "$3.000",
        label: "Precio Unit.",
        type: "number",
        required: true,
        defaultValue: 0,
        min: 0,
        step: 0.01,
        colSpan: "col-span-2",
      },
      {
        name: "descuento",
        placeholder: "10%",
        label: "Desc. %",
        type: "number",
        defaultValue: 0,
        min: 0,
        max: 100,
        colSpan: "col-span-2",
      },
      {
        name: "iva",
        label: "IVA %",
        type: "select",
        defaultValue: 21,
        options: [
          { value: 0, label: "0%" },
          { value: 10.5, label: "10.5%" },
          { value: 21, label: "21%" },
          { value: 27, label: "27%" },
        ],
        colSpan: "col-span-2",
      },
    ],

    itemLayout: "grid-cols-12",

    tableColumns: [
      { key: "descripcion", label: "Descripción" },
      { key: "cantidad", label: "Cant." },
      {
        key: "precioUnitario",
        label: "P. Unit.",
        render: (item) => `$${item.precioUnitario.toFixed(2)}`,
      },
      {
        key: "descuento",
        label: "Desc.",
        render: (item) => `${item.descuento}%`,
      },
      {
        key: "iva",
        label: "IVA",
        render: (item) => `${item.iva}%`,
      },
      {
        key: "subtotal",
        label: "Subtotal",
        render: (item) => `$${calcularSubtotal(item).toFixed(2)}`,
      },
      {
        key: "total",
        label: "Total",
        render: (item) => `$${calcularTotal(item).toFixed(2)}`,
      },
    ],

    renderTotals: (items) => {
      const subtotal = items.reduce(
        (sum, item) => sum + calcularSubtotal(item),
        0
      );
      const iva = items.reduce((sum, item) => sum + calcularIVA(item), 0);
      const total = items.reduce((sum, item) => sum + calcularTotal(item), 0);

      return (
        <div className="flex justify-end">
          <div className="w-full md:w-1/3 space-y-2">
            <div className="flex justify-between text-white/85">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/85">
              <span>IVA:</span>
              <span>${iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2 text-white">
              <span>TOTAL:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      );
    },
  },
];