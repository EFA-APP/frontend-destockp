import { useState } from "react";
import { AgregarIcono } from "../../../../assets/Icons";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearOrdenDeVentas = () => {
  const [numeroComprobante] = useState({
    puntoVenta: "00001",
    numero: "00000123",
  });

  // Funciones de cálculo
  const calcularSubtotal = (item) => {
    return item.cantidad * item.precioUnitario;
  };

  const calcularTotalOrden = (items) => {
    return items.reduce((sum, item) => sum + calcularSubtotal(item), 0);
  };

  const camposOrdenVenta = [
    // =========================
    // DATOS DE LA ORDEN
    // =========================
    {
      name: "numeroOrden",
      label: "Número de Orden",
      type: "text",
      required: true,
      defaultValue: "OV-00012",
      readOnly: true,
      section: "Orden de Venta",
    },
    {
      name: "fecha",
      label: "Fecha",
      type: "date",
      required: true,
      section: "Orden de Venta",
    },
    {
      name: "estado",
      label: "Estado",
      type: "select",
      required: true,
      defaultValue: "confirmada",
      options: [
        { value: "pendiente", label: "Pendiente" },
        { value: "confirmada", label: "Confirmada" },
        { value: "cancelada", label: "Cancelada" },
      ],
      section: "Orden de Venta",
    },

    // =========================
    // CLIENTE
    // =========================
    {
      name: "cliente",
      label: "Cliente",
      type: "select",
      required: true,
      section: "Cliente",
      options: [
        {
          value: "Distribuidora San Martín",
          label: "Distribuidora San Martín",
        },
        { value: "Kiosco Don Pepe", label: "Kiosco Don Pepe" },
        { value: "Consumidor Final", label: "Consumidor Final" },
      ],
    },

    // =========================
    // ITEMS
    // =========================
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
          colSpan: "col-span-5",
        },
        {
          name: "cantidad",
          label: "Cantidad",
          placeholder: "001",
          type: "number",
          required: true,
          min: 1,
          colSpan: "col-span-3",
        },
        {
          name: "precioUnitario",
          label: "Precio Unitario",
          placeholder: "$3.000",
          type: "number",
          required: true,
          min: 0,
          colSpan: "col-span-3",
        },
      ],

      itemLayout: "grid-cols-12",

      tableColumns: [
        { key: "descripcion", label: "Producto" },
        { key: "cantidad", label: "Cant.", align: "text-right" },
        {
          key: "precioUnitario",
          label: "Precio",
          align: "text-right",
          render: (item) => `$${item.precioUnitario.toFixed(2)}`,
        },
        {
          key: "subtotal",
          label: "Subtotal",
          align: "text-right",
          render: (item) => `$${calcularSubtotal(item).toFixed(2)}`,
        },
      ],

      renderTotals: (items) => {
        const total = calcularTotalOrden(items);

        return (
          <div className="flex justify-end">
            <div className="text-white text-xl font-bold">
              TOTAL: ${total.toFixed(2)}
            </div>
          </div>
        );
      },
    },
  ];

  const handleSubmit = (data) => {
    const total = calcularTotalOrden(data.items);

    const ordenVenta = {
      id: Date.now(), // o generado por backend
      numeroOrden: data.numeroOrden,
      fecha: data.fecha,
      cliente: data.cliente,
      estado: data.estado,
      total,
      facturada: false,
      items: data.items.map((item) => ({
        producto: item.producto,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: calcularSubtotal(item),
      })),
    };

    console.log("ORDEN DE VENTA:", ordenVenta);

    alert(
      `Orden ${
        ordenVenta.numeroOrden
      } creada\nTotal: $${ordenVenta.total.toFixed(2)}`
    );
  };

  return (
    <div className="px-3 py-4">
      {/* Encabezado */}
      <div className="card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md mb-4">
        <EncabezadoSeccion
          ruta={"Crear Orden de venta"}
          icono={<AgregarIcono />}
          volver={true}
          redireccionAnterior={"/panel/ventas/orden-ventas"}
        />
      </div>

      {/* Formulario Único con todo integrado */}
      <FormularioDinamico
        titulo="Nueva Orden de Venta"
        subtitulo="Complete los datos de la orden"
        campos={camposOrdenVenta}
        onSubmit={handleSubmit}
        submitLabel="Crear Orden"
      />
    </div>
  );
};

export default CrearOrdenDeVentas;
