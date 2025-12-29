import { useState } from "react";
import { AgregarIcono } from "../../../assets/Icons";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../UI/FormularioReutilizable/FormularioDinamico";

const CrearProductos = () => {
  // Configuración para PRODUCTOS
  const productFields = [
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      required: true,
      placeholder: "Nombre del producto",
      section: "Información Básica",
    },
    {
      name: "descripcion",
      label: "Descripción",
      type: "textarea",
      placeholder: "Descripción detallada",
      fullWidth: true,
      section: "Información Básica",
    },
    {
      name: "sabor",
      label: "Sabor",
      type: "text",
      placeholder: "Ej: Durazno",
      section: "Información Básica",
    },
    {
      name: "unidad",
      label: "Unidad",
      type: "select",
      options: [
        { value: "frascos", label: "Frascos" },
        { value: "unidades", label: "Unidades" },
        { value: "cajas", label: "Cajas" },
        { value: "bolsas", label: "Bolsas" },
      ],
      section: "Información Básica",
    },
    {
      name: "cantidadPorPaquete",
      label: "Cantidad por Paquete",
      type: "number",
      required: true,
      min: 1,
      section: "Stock",
      onChangeCalculate: (data) => ({
        ...data,
        stock: data.cantidadPorPaquete * data.paquetes,
        pesoTotal:
          data.pesoUnitario * (data.cantidadPorPaquete * data.paquetes),
        precioTotal:
          data.precioUnitario * (data.cantidadPorPaquete * data.paquetes),
      }),
    },
    {
      name: "paquetes",
      label: "Número de Paquetes",
      type: "number",
      required: true,
      min: 1,
      section: "Stock",
      onChangeCalculate: (data) => ({
        ...data,
        stock: data.cantidadPorPaquete * data.paquetes,
        pesoTotal:
          data.pesoUnitario * (data.cantidadPorPaquete * data.paquetes),
        precioTotal:
          data.precioUnitario * (data.cantidadPorPaquete * data.paquetes),
      }),
    },
    {
      name: "stock",
      label: "Stock Total",
      type: "number",
      readOnly: true,
      section: "Stock",
      helpText: "Calculado automáticamente",
    },
    {
      name: "pesoUnitario",
      label: "Peso Unitario (kg)",
      type: "number",
      step: "0.01",
      section: "Peso",
      onChangeCalculate: (data) => ({
        ...data,
        pesoTotal: data.pesoUnitario * data.stock,
      }),
    },
    {
      name: "pesoTotal",
      label: "Peso Total (kg)",
      type: "number",
      readOnly: true,
      section: "Peso",
      helpText: "Calculado automáticamente",
    },
    {
      name: "precioUnitario",
      label: "Precio Unitario ($)",
      type: "number",
      required: true,
      min: 0,
      step: "0.01",
      section: "Precios",
      onChangeCalculate: (data) => ({
        ...data,
        precioTotal: data.precioUnitario * data.stock,
      }),
    },
    {
      name: "precioTotal",
      label: "Precio Total ($)",
      type: "number",
      readOnly: true,
      section: "Precios",
      helpText: "Calculado automáticamente",
    },
  ];

  const handleSubmit = (data) => {
    console.log(`guardado:`, data);
    alert(`Productos guardado!\nRevisa la consola.`);
  };

  return (
    <div className="px-3 py-4">
      {/* Encabezado */}
      <div className="card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md mb-4">
        <EncabezadoSeccion
          ruta={"Crear Producto"}
          icono={<AgregarIcono />}
          volver={true}
          redireccionAnterior={"/panel/inventario/productos"}
        />
      </div>

      {/* Formulario */}
      <FormularioDinamico
        title="Nuevo Producto"
        subtitle="Complete los datos del producto"
        fields={productFields}
        onSubmit={handleSubmit}
        submitLabel="Guardar Producto"
      />
    </div>
  );
};

export default CrearProductos;
