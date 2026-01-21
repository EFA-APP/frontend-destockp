import { useState } from "react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { AgregarIcono } from "../../../../assets/Icons";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";
import { useLocation } from "react-router-dom";
import { camposFacturaProveedor } from "./camposFacturaProveedor";

const CrearFacturaProveedor = () => {

  const location = useLocation();

  const comprobante = location.state?.comprobante;
  
  console.log(comprobante)
  // ─────────────────────────────────────
  // FUNCIONES DE CÁLCULO (IGUALES A VENTAS)
  // ─────────────────────────────────────
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

  // ─────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────
  const handleSubmit = (data) => {
    const totales = {
      subtotal: data.items.reduce(
        (sum, item) => sum + calcularSubtotal(item),
        0
      ),
      iva: data.items.reduce((sum, item) => sum + calcularIVA(item), 0),
      total: data.items.reduce((sum, item) => sum + calcularTotal(item), 0),
    };

    const facturaProveedor = {
      ...data,
      totales,
    };

    console.log("Factura proveedor:", facturaProveedor);

    alert(
      `Factura de proveedor registrada correctamente\n\nTotal: $${totales.total.toFixed(
        2
      )}`
    );
  };

  return (
    <div className="px-3 py-4">
      <div className="card bg-[var(--fill2)] shadow-md rounded-md mb-4">
        <EncabezadoSeccion
          ruta={"Registrar factura de proveedor"}
          icono={<AgregarIcono />}
          volver
          redireccionAnterior={"/panel/compras/facturas-proveedores"}
        />
      </div>

      <FormularioDinamico
        titulo="Nueva factura de proveedor"
        subtitulo="Registro de comprobante recibido"
        campos={(camposFacturaProveedor({ comprobante }))}
        context={{ comprobante }} 
        onSubmit={handleSubmit}
        submitLabel="Registrar factura"
        // initialValues={initialValues}
      />
    </div>
  );
};

export default CrearFacturaProveedor;
