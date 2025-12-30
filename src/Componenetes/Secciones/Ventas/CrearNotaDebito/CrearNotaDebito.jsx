import { useState } from "react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { AgregarIcono } from "../../../../assets/Icons";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearNotaDebito = () => {
  const [numeroComprobante] = useState({
    puntoVenta: "00001",
    numero: "00000067",
  });

  // === Cálculos (iguales que factura y NC, pero ND es POSITIVA - aumenta la deuda) ===
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

  const camposNotaDebito = [
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
      helpText:
        "Las notas de débito en blanco se envían automáticamente a ARCA/AFIP",
    },

    // ═══════════════════════════════════════
    // COMPROBANTE
    // ═══════════════════════════════════════
    {
      name: "tipoComprobante",
      label: "Tipo de Nota",
      type: "select",
      required: true,
      defaultValue: "ND-B",
      options: [
        { value: "ND-A", label: "Nota de Débito A" },
        { value: "ND-B", label: "Nota de Débito B" },
        { value: "ND-C", label: "Nota de Débito C" },
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
      helpText: "Factura a la que se adiciona un cargo",
    },
    {
      name: "puntoVenta",
      label: "Punto de Venta",
      type: "text",
      // readOnly: true,
      defaultValue: numeroComprobante.puntoVenta,
      section: "Comprobante",
    },
    {
      name: "numeroComprobante",
      label: "Número",
      type: "text",
      // readOnly: true,
      defaultValue: numeroComprobante.numero,
      section: "Comprobante",
      helpText: "Número automático generado por el sistema",
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
        { value: 1, label: "Distribuidora San Martín - CUIT 30-12345678-9" },
        { value: 2, label: "Kiosco Don Pepe - CUIT 20-87654321-5" },
        { value: 3, label: "Consumidor Final" },
      ],
    },
    {
      name: "cuitCliente",
      label: "CUIT/CUIL/DNI",
      type: "text",
      required: true,
      section: "Cliente",
      placeholder: "XX-XXXXXXXX-X",
      helpText: "Obligatorio para notas de débito A y B",
    },
    {
      name: "motivo",
      label: "Motivo de la Nota de Débito",
      type: "textarea",
      required: true,
      section: "Cliente",
      rows: 3,
      placeholder:
        "Ej: Intereses por mora / Gastos adicionales / Recargo por flete / Corrección de precio",
      helpText: "Indique claramente el motivo del cargo adicional",
    },

    // ═══════════════════════════════════════
    // ITEMS (CONCEPTOS A COBRAR)
    // ═══════════════════════════════════════
    {
      name: "items",
      type: "items-table",
      required: true,
      section: "Conceptos a Debitar",
      fullWidth: true,
      errorMessage: "Debe agregar al menos un concepto a debitar",

      itemFields: [
        {
          name: "descripcion",
          label: "Concepto",
          placeholder: "Ej: Intereses por mora del período 11/2024",
          type: "text",
          required: true,
          colSpan: "col-span-4",
        },
        {
          name: "cantidad",
          label: "Cantidad",
          placeholder: "1",
          type: "number",
          defaultValue: 1,
          min: 0,
          step: 0.01,
          colSpan: "col-span-2",
        },
        {
          name: "precioUnitario",
          placeholder: "$5000",
          label: "Precio Unit.",
          type: "number",
          defaultValue: 0,
          min: 0,
          step: 0.01,
          colSpan: "col-span-2",
        },
        {
          name: "descuento",
          label: "Desc %",
          placeholder: "0%",
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
          colSpan: "col-span-1",
        },
      ],

      itemLayout: "grid-cols-12",

      tableColumns: [
        {
          key: "descripcion",
          label: "Concepto",
          align: "text-left",
        },
        {
          key: "cantidad",
          label: "Cant.",
          align: "text-right",
        },
        {
          key: "precioUnitario",
          label: "P. Unit.",
          align: "text-right",
          render: (item) => `$${item.precioUnitario.toFixed(2)}`,
        },
        {
          key: "descuento",
          label: "Desc.",
          align: "text-right",
          render: (item) => `${item.descuento}%`,
        },
        {
          key: "iva",
          label: "IVA",
          align: "text-right",
          render: (item) => `${item.iva}%`,
        },
        {
          key: "subtotal",
          label: "Subtotal",
          align: "text-right",
          render: (item) => `$${calcularSubtotal(item).toFixed(2)}`,
        },
        {
          key: "total",
          label: "Total",
          align: "text-right",
          render: (item) => `$${calcularTotal(item).toFixed(2)}`,
        },
      ],

      renderTotals: (items) => {
        const totales = {
          subtotal: items.reduce((sum, i) => sum + calcularSubtotal(i), 0),
          iva: items.reduce((sum, i) => sum + calcularIVA(i), 0),
          total: items.reduce((sum, i) => sum + calcularTotal(i), 0),
        };

        return (
          <div className="flex justify-end">
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>$${totales.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>IVA:</span>
                <span>$${totales.iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-orange-400 text-xl font-bold border-t border-gray-600 pt-2">
                <span>TOTAL A DEBITAR:</span>
                <span>+${totales.total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 italic mt-2">
                ⚠️ Este monto se SUMA a la deuda del cliente
              </p>
            </div>
          </div>
        );
      },
    },

    // ═══════════════════════════════════════
    // OBSERVACIONES
    // ═══════════════════════════════════════
    {
      name: "observaciones",
      label: "Observaciones adicionales",
      type: "textarea",
      fullWidth: true,
      section: "Observaciones",
      placeholder: "Información adicional sobre la nota de débito...",
      rows: 3,
    },
  ];

  const handleSubmit = (data) => {
    const totales = {
      subtotal: data.items.reduce((sum, i) => sum + calcularSubtotal(i), 0),
      iva: data.items.reduce((sum, i) => sum + calcularIVA(i), 0),
      total: data.items.reduce((sum, i) => sum + calcularTotal(i), 0),
    };

    const notaDebito = {
      ...data,
      totales,
      numeroCompleto: `${data.puntoVenta}-${data.numeroComprobante}`,
    };

    if (data.enBlanco === "si") {
      alert(
        `✓ Nota de Débito registrada en ARCA\n\n` +
          `Comprobante: ${notaDebito.numeroCompleto}\n` +
          `Factura origen: ${data.facturaOrigen}\n` +
          `Total a debitar: +$${totales.total.toFixed(2)}\n\n` +
          `⚠️ Este monto se SUMA a la deuda del cliente\n\n` +
          `Revisa la consola para ver los detalles completos.`
      );
    } else {
      alert(
        `✗ Nota de Débito interna (sin registrar)\n\n` +
          `Comprobante: ${notaDebito.numeroCompleto}\n` +
          `Total: +$${totales.total.toFixed(2)}\n\n` +
          `⚠️ Esta nota NO se envía a ARCA/AFIP`
      );
    }
  };

  return (
    <div className="px-3 py-4">
      {/* Encabezado */}
      <div className="card bg-[var(--fill2)] shadow-md rounded-md mb-4">
        <EncabezadoSeccion
          ruta="Crear Nota de Débito"
          icono={<AgregarIcono />}
          volver
          redireccionAnterior="/panel/ventas/notas-debitos"
        />
      </div>

      {/* Formulario */}
      <FormularioDinamico
        titulo="Nueva Nota de Débito"
        subtitulo="Asociada a una factura existente - Aumenta la deuda del cliente"
        campos={camposNotaDebito}
        onSubmit={handleSubmit}
        submitLabel="Generar Nota de Débito"
      />
    </div>
  );
};

export default CrearNotaDebito;
