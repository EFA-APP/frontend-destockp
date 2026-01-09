import { useState } from "react";
import { AgregarIcono } from "../../../../assets/Icons";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearFactura = () => {
  const [numeroComprobante] = useState({
    puntoVenta: "00001",
    numero: "00000123",
  });

  // Funciones de cálculo
  const calcularSubtotal = (item) => {
    const subtotal = item.cantidad * item.precioUnitario;
    const descuento = subtotal * (item.descuento / 100);
    return subtotal - descuento;
  };

  const calcularIVA = (item) => {
    const subtotal = calcularSubtotal(item);
    return subtotal * (item.iva / 100);
  };

  const calcularTotal = (item) => {
    return calcularSubtotal(item) + calcularIVA(item);
  };

  const camposFactura = [
    // ═══════════════════════════════════════
    // CONFIGURACIÓN DEL COMPROBANTE
    // ═══════════════════════════════════════
    {
      name: "enBlanco",
      label: "¿Cargar a ARCA?",
      type: "select",
      required: true,
      defaultValue: "si",
      options: [
        { value: "si", label: "✓ Sí - Factura en blanco 🟢" },
        { value: "no", label: "✗ No - Factura en negro 🔵" },
      ],
      section: "Configuración",
      helpText: "Las facturas en blanco se envían automáticamente a ARCA/AFIP",
    },

    // ═══════════════════════════════════════
    // DATOS DEL COMPROBANTE
    // ═══════════════════════════════════════
    {
      name: "tipoComprobante",
      label: "Tipo de Comprobante",
      type: "select",
      required: true,
      defaultValue: "B",
      options: [
        { value: "A", label: "Factura A" },
        { value: "B", label: "Factura B" },
        { value: "C", label: "Factura C" },
      ],
      section: "Comprobante",
    },
    {
      name: "puntoVenta",
      label: "Punto de Venta",
      type: "text",
      required: true,
      defaultValue: numeroComprobante.puntoVenta,
      readOnly: true,
      section: "Comprobante",
    },
    {
      name: "numeroComprobante",
      label: "Número",
      type: "text",
      required: true,
      defaultValue: numeroComprobante.numero,
      readOnly: true,
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
    {
      name: "fechaVencimiento",
      label: "Fecha de Vencimiento",
      type: "date",
      section: "Comprobante",
      helpText: "Opcional - Para facturas con pago diferido",
    },
    {
      name: "condicionVenta",
      label: "Condición de Venta",
      type: "select",
      required: true,
      defaultValue: "contado",
      options: [
        { value: "contado", label: "Contado" },
        { value: "cuenta_corriente", label: "Cuenta Corriente" },
      ],
      section: "Comprobante",
    },

    // ═══════════════════════════════════════
    // DATOS DEL CLIENTE
    // ═══════════════════════════════════════
    {
      name: "clienteId",
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
      helpText: "Obligatorio para facturas A y B",
    },
    {
      name: "condicionIVA",
      label: "Condición frente al IVA",
      type: "select",
      required: true,
      defaultValue: "consumidor_final",
      options: [
        { value: "responsable_inscripto", label: "Responsable Inscripto" },
        { value: "monotributista", label: "Monotributista" },
        { value: "consumidor_final", label: "Consumidor Final" },
        { value: "exento", label: "Exento" },
        { value: "no_responsable", label: "No Responsable" },
      ],
      section: "Cliente",
    },
    {
      name: "domicilioCliente",
      label: "Domicilio",
      type: "text",
      section: "Cliente",
      placeholder: "Calle 123, Ciudad, Provincia",
    },

    // ═══════════════════════════════════════
    // OBSERVACIONES Y NOTAS
    // ═══════════════════════════════════════
    {
      name: "observaciones",
      label: "Observaciones",
      type: "textarea",
      fullWidth: true,
      section: "Observaciones",
      placeholder: "Información adicional sobre la factura...",
      rows: 3,
    },
    {
      name: "remito",
      label: "Número de Remito (Opcional)",
      type: "text",
      section: "Observaciones",
      placeholder: "R-00001-00000123",
    },
    {
      name: "ordenCompra",
      label: "Orden de Compra (Opcional)",
      type: "text",
      section: "Observaciones",
      placeholder: "OC-2025-001",
    },

    // ═══════════════════════════════════════
    // PRODUCTOS Y SERVICIOS (TABLA DE ITEMS)
    // ═══════════════════════════════════════
    {
      name: "items",
      type: "items-table",
      required: true,
      section: "Productos",
      fullWidth: true,
      errorMessage: "Debe agregar al menos un producto o servicio",

      // Definición de campos para cada item
      itemFields: [
        {
          name: "descripcion",
          label: "Producto",
          type: "text",
          required: true,
          placeholder: "Descripción",
          colSpan: "col-span-4",
        },
        {
          name: "cantidad",
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
          label: "Precio Unit.",
          placeholder: "$1.000",
          type: "number",
          required: true,
          defaultValue: 0,
          min: 0,
          step: 0.01,
          colSpan: "col-span-2",
        },
        {
          name: "descuento",
          label: "Descuento %",
          placeholder: "10%",
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

      // Layout del formulario de items
      itemLayout: "grid-cols-12",

      // Definición de columnas de la tabla
      tableColumns: [
        {
          key: "descripcion",
          label: "Descripción",
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

      // Renderizado de totales
      renderTotals: (items) => {
        const totales = {
          subtotal: items.reduce(
            (sum, item) => sum + calcularSubtotal(item),
            0
          ),
          iva: items.reduce((sum, item) => sum + calcularIVA(item), 0),
          total: items.reduce((sum, item) => sum + calcularTotal(item), 0),
        };

        return (
          <div className="flex justify-end">
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>${totales.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>IVA:</span>
                <span>${totales.iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white text-xl font-bold border-t border-gray-600 pt-2">
                <span>TOTAL:</span>
                <span>${totales.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  const handleSubmit = (data) => {
    // Calcular totales finales
    const totalesFactura = {
      subtotal: data.items.reduce(
        (sum, item) => sum + calcularSubtotal(item),
        0
      ),
      iva: data.items.reduce((sum, item) => sum + calcularIVA(item), 0),
      total: data.items.reduce((sum, item) => sum + calcularTotal(item), 0),
    };

    const facturaCompleta = {
      ...data,
      totales: totalesFactura,
      numeroCompleto: `${data.puntoVenta}-${data.numeroComprobante}`,
    };

    if (data.enBlanco === "si") {
      alert(
        `✓ Factura registrada en ARCA\n\nComprobante: ${
          facturaCompleta.numeroCompleto
        }\nTotal: $${totalesFactura.total.toFixed(
          2
        )}\n\nRevisa la consola para ver los detalles completos.`
      );
    } else {
      alert(
        `✗ Factura en negro (sin registrar)\n\nComprobante: ${
          facturaCompleta.numeroCompleto
        }\nTotal: $${totalesFactura.total.toFixed(
          2
        )}\n\n⚠️ Esta factura NO se envía a ARCA/AFIP`
      );
    }
  };

  return (
    <div className="px-3 py-4">
      {/* Encabezado */}
      <div className="card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md mb-4">
        <EncabezadoSeccion
          ruta={"Crear Factura"}
          icono={<AgregarIcono />}
          volver={true}
          redireccionAnterior={"/panel/ventas/facturas"}
        />
      </div>

      {/* Formulario Único con todo integrado */}
      <FormularioDinamico
        titulo="Nueva Factura"
        subtitulo="Complete los datos del comprobante"
        campos={camposFactura}
        onSubmit={handleSubmit}
        submitLabel="Generar Factura"
      />
    </div>
  );
};

export default CrearFactura;
