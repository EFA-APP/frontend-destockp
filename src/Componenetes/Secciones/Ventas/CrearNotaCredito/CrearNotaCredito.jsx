import { useState } from "react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { AgregarIcono } from "../../../../assets/Icons";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearNotaCredito = () => {
  const [numeroComprobante] = useState({
    puntoVenta: "00001",
    numero: "00000045",
  });

  // === Cálculos (mismos que factura, pero NC es NEGATIVA) ===
  const calcularSubtotal = (item) => {
    const subtotal = item.cantidad * item.precioUnitario;
    const descuento = subtotal * (item.descuento / 100);
    return subtotal - descuento;
  };

  const calcularIVA = (item) => {
    const subtotal = calcularSubtotal(item);
    return subtotal * (item.iva / 100);
  };

  const calcularTotal = (item) => calcularSubtotal(item) + calcularIVA(item);

  const camposNotaCredito = [
    // ═══════════════════════════════════════
    // CONFIGURACIÓN
    // ═══════════════════════════════════════
    {
      name: "enBlanco",
      label: "¿Cargar a ARCA?",
      type: "select",
      required: true,
      defaultValue: "si",
      options: [
        { value: "si", label: "✓ Sí - Nota registrada en ARCA" },
        { value: "no", label: "✗ No - Nota interna" },
      ],
      section: "Configuración",
    },

    // ═══════════════════════════════════════
    // COMPROBANTE
    // ═══════════════════════════════════════
    {
      name: "tipoComprobante",
      label: "Tipo de Nota",
      type: "select",
      required: true,
      defaultValue: "NC-B",
      options: [
        { value: "NC-A", label: "Nota de Crédito A" },
        { value: "NC-B", label: "Nota de Crédito B" },
        { value: "NC-C", label: "Nota de Crédito C" },
      ],
      section: "Comprobante",
    },
    {
      name: "facturaOrigen",
      label: "Factura asociada",
      type: "text",
      required: true,
      section: "Comprobante",
      placeholder: "FC-00001-00001234",
      helpText: "Factura que se anula o ajusta",
    },
    {
      name: "puntoVenta",
      label: "Punto de Venta",
      type: "text",
      readOnly: true,
      defaultValue: numeroComprobante.puntoVenta,
      section: "Comprobante",
    },
    {
      name: "numeroComprobante",
      label: "Número",
      type: "text",
      readOnly: true,
      defaultValue: numeroComprobante.numero,
      section: "Comprobante",
    },
    {
      name: "fecha",
      label: "Fecha de Emisión",
      type: "date",
      required: true,
      section: "Comprobante",
    },

    // ═══════════════════════════════════════
    // CLIENTE
    // ═══════════════════════════════════════
    {
      name: "cliente",
      label: "Cliente",
      type: "select",
      required: true,
      section: "Cliente",
      options: [
        { value: "", label: "-- Seleccionar Cliente --" },
        { value: 1, label: "Distribuidora San Martín" },
        { value: 2, label: "Kiosco Don Pepe" },
      ],
    },
    {
      name: "motivo",
      label: "Motivo de la Nota",
      type: "textarea",
      required: true,
      section: "Cliente",
      rows: 3,
      placeholder: "Devolución / Error de facturación / Descuento",
    },

    // ═══════════════════════════════════════
    // ITEMS
    // ═══════════════════════════════════════
    {
      name: "items",
      type: "items-table",
      required: true,
      section: "Productos",
      fullWidth: true,

      itemFields: [
        {
          name: "descripcion",
          label: "Producto",
          placeholder: "Descripción",
          type: "text",
          required: true,
          colSpan: "col-span-2",
        },
        {
          name: "cantidad",
          label: "Cantidad",
          placeholder: "001",
          type: "number",
          defaultValue: 1,
          min: 0,
          colSpan: "col-span-2",
        },
        {
          name: "precioUnitario",
          placeholder: "$3.000",
          label: "Precio Unit.",
          type: "number",
          defaultValue: 0,
          min: 0,
          colSpan: "col-span-2",
        },
        {
          name: "descuento",
          label: "Desc %",
          placeholder: "10%",
          type: "number",
          defaultValue: 0,
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
          ],
          colSpan: "col-span-2",
        },
      ],

      itemLayout: "grid-cols-12",

      tableColumns: [
        { key: "descripcion", label: "Descripción" },
        { key: "cantidad", label: "Cant." },
        {
          key: "total",
          label: "Total",
          align: "text-right",
          render: (item) => `-$${calcularTotal(item).toFixed(2)}`,
        },
      ],

      renderTotals: (items) => {
        const total = items.reduce((sum, i) => sum + calcularTotal(i), 0);

        return (
          <div className="flex justify-end">
            <div className="text-red-400 text-xl font-bold">
              TOTAL A ACREDITAR: -${total.toFixed(2)}
            </div>
          </div>
        );
      },
    },
  ];

  const handleSubmit = (data) => {
    const total = data.items.reduce((sum, i) => sum + calcularTotal(i), 0);

    const notaCredito = {
      ...data,
      total: -total,
      numeroCompleto: `${data.puntoVenta}-${data.numeroComprobante}`,
    };

    alert(
      `Nota de crédito generada\n\nComprobante: ${
        notaCredito.numeroCompleto
      }\nTotal: -$${total.toFixed(2)}`
    );
  };

  return (
    <div className="px-3 py-4">
      <div className="card bg-[var(--fill2)] shadow-md rounded-md mb-4">
        <EncabezadoSeccion
          ruta="Crear Nota de Crédito"
          icono={<AgregarIcono />}
          volver
          redireccionAnterior="/panel/ventas/notas-creditos"
        />
      </div>

      <FormularioDinamico
        titulo="Nueva Nota de Crédito"
        subtitulo="Asociada a una factura existente"
        campos={camposNotaCredito}
        onSubmit={handleSubmit}
        submitLabel="Generar Nota de Crédito"
      />
    </div>
  );
};

export default CrearNotaCredito;
