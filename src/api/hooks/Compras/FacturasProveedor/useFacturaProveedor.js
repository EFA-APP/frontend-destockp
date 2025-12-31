import { useState } from "react";

export const useFacturasProveedor = () => {
  const [facturas, setFacturas] = useState([
    {
      id: 1,
      prefijo: "0002",
      numero: "00000120",
      fecha: "2025-03-02",
      proveedor: "Mayorista Alimentos SRL",
      tipo: "A",
      isBlanco: true,
      estado: "pagada",
      total: 102245,
      cuentaContable: "510101 - Compras mercaderías",
      items: [
        {
          producto: "Azúcar 1kg",
          cantidad: 100,
          precioUnitario: 845,
          subtotal: 84500,
        },
      ],
    },
    {
      id: 2,
      prefijo: "0002",
      numero: "00000121",
      fecha: "2025-03-10",
      proveedor: "Distribuidora Norte",
      tipo: "B",
      isBlanco: false,
      estado: "pendiente",
      total: 43200,
      cuentaContable: "510102 - Insumos",
      items: [
        {
          producto: "Harina 000 1kg",
          cantidad: 60,
          precioUnitario: 720,
          subtotal: 43200,
        },
      ],
    },
  ]);

  const [tipoFactura, setTipoFactura] = useState("TODAS");
  const [estadoFactura, setEstadoFactura] = useState("TODAS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [isBlanco, setIsBlanco] = useState("TODAS");

  const facturasFiltradas = facturas.filter((f) => {
    const coincideBusqueda =
      f.numero.includes(busqueda) ||
      f.proveedor.toLowerCase().includes(busqueda.toLowerCase());

    const coincideTipo = tipoFactura === "TODAS" || f.tipo === tipoFactura;
    const coincideEstado =
      estadoFactura === "TODAS" || f.estado === estadoFactura;

    const coincideBlanco =
      isBlanco === "TODAS" ||
      (isBlanco === "BLANCO" && f.isBlanco) ||
      (isBlanco === "NEGRO" && !f.isBlanco);

    const fechaFactura = new Date(f.fecha);
    const desdeValida = !fechaDesde || fechaFactura >= new Date(fechaDesde);
    const hastaValida = !fechaHasta || fechaFactura <= new Date(fechaHasta);

    return (
      coincideBusqueda &&
      coincideTipo &&
      coincideEstado &&
      coincideBlanco &&
      desdeValida &&
      hastaValida
    );
  });

  const manejarDetalle = (id) => {
    console.log(id);
  };

  const manejarEditar = (factura) => {
    console.log("Editando:", factura);
  };

  const manejarEliminar = (id) => {
    if (window.confirm("¿Eliminar?")) {
      setFacturas((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return {
    facturas: facturasFiltradas,
    busqueda,
    setBusqueda,
    tipoFactura,
    setTipoFactura,
    estadoFactura,
    setEstadoFactura,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    isBlanco,
    setIsBlanco,
    manejarDetalle,
    manejarEditar,
    manejarEliminar,
  };
};
