import { useState } from "react";

export const useAsientos = () => {
  const [asientos, setAsientos] = useState([
    // ========== ASIENTO 1: Cobro de cuota escolar ==========
    {
      id: 1,
      fecha: "2025-01-10",
      descripcion: "Cobro cuota enero - Alumno Juan Pérez - 1° Primaria",
      origen: "VENTA",
      referencia: "CUO-001",
      totalDebe: 50000,
      totalHaber: 50000,
      movimientos: [
        {
          id: 1,
          cuenta: "1.1.01",
          nombreCuenta: "Caja",
          debe: 50000,
          haber: 0,
        },
        {
          id: 2,
          cuenta: "4.1.02",
          nombreCuenta: "Cuotas Escolares Nivel Primario",
          debe: 0,
          haber: 50000,
        },
      ],
    },

    // ========== ASIENTO 2: Venta de mermelada con IVA ==========
    {
      id: 2,
      fecha: "2025-01-12",
      descripcion: "Factura B 0001-00000123 - Venta mermelada x10 unidades",
      origen: "VENTA",
      referencia: "FAC-123",
      totalDebe: 1210,
      totalHaber: 1210,
      movimientos: [
        {
          id: 3,
          cuenta: "1.1.01",
          nombreCuenta: "Caja",
          debe: 1210,
          haber: 0,
        },
        {
          id: 4,
          cuenta: "4.2.01",
          nombreCuenta: "Venta de Mermeladas",
          debe: 0,
          haber: 1000,
        },
        {
          id: 5,
          cuenta: "2.1.04",
          nombreCuenta: "IVA Débito Fiscal",
          debe: 0,
          haber: 210,
        },
      ],
    },

    // ========== ASIENTO 3: Compra de frutas para producción ==========
    {
      id: 3,
      fecha: "2025-01-15",
      descripcion: "Compra frutillas 50kg - Proveedor Don José",
      origen: "COMPRA",
      referencia: "COM-456",
      totalDebe: 6050,
      totalHaber: 6050,
      movimientos: [
        {
          id: 6,
          cuenta: "5.1.01",
          nombreCuenta: "Compra de Frutas",
          debe: 5000,
          haber: 0,
        },
        {
          id: 7,
          cuenta: "1.1.04",
          nombreCuenta: "IVA Crédito Fiscal",
          debe: 1050,
          haber: 0,
        },
        {
          id: 8,
          cuenta: "2.1.01",
          nombreCuenta: "Proveedores",
          debe: 0,
          haber: 6050,
        },
      ],
    },

    // ========== ASIENTO 4: Alumno debe cuota (venta a crédito) ==========
    {
      id: 4,
      fecha: "2025-01-20",
      descripcion:
        "Cuota enero - Alumno María López - 3° Secundaria (A crédito)",
      origen: "VENTA",
      referencia: "CUO-002",
      totalDebe: 60000,
      totalHaber: 60000,
      movimientos: [
        {
          id: 9,
          cuenta: "1.1.03",
          nombreCuenta: "Deudores por Cuotas",
          debe: 60000,
          haber: 0,
        },
        {
          id: 10,
          cuenta: "4.1.03",
          nombreCuenta: "Cuotas Escolares Nivel Secundario",
          debe: 0,
          haber: 60000,
        },
      ],
    },

    // ========== ASIENTO 5: Cobro de deuda de alumno ==========
    {
      id: 5,
      fecha: "2025-01-22",
      descripcion: "Cobro cuota atrasada - Alumna María López",
      origen: "VENTA",
      referencia: "COB-001",
      totalDebe: 60000,
      totalHaber: 60000,
      movimientos: [
        {
          id: 11,
          cuenta: "1.1.01",
          nombreCuenta: "Caja",
          debe: 60000,
          haber: 0,
        },
        {
          id: 12,
          cuenta: "1.1.03",
          nombreCuenta: "Deudores por Cuotas",
          debe: 0,
          haber: 60000,
        },
      ],
    },

    // ========== ASIENTO 6: Pago de sueldos docentes ==========
    {
      id: 6,
      fecha: "2025-01-25",
      descripcion: "Pago sueldos docentes enero (5 profesores)",
      origen: "MANUAL",
      referencia: "SUE-001",
      totalDebe: 250000,
      totalHaber: 250000,
      movimientos: [
        {
          id: 13,
          cuenta: "5.2.01",
          nombreCuenta: "Sueldos Docentes",
          debe: 200000,
          haber: 0,
        },
        {
          id: 14,
          cuenta: "5.2.03",
          nombreCuenta: "Cargas Sociales",
          debe: 50000,
          haber: 0,
        },
        {
          id: 15,
          cuenta: "1.1.02",
          nombreCuenta: "Banco Cuenta Corriente",
          debe: 0,
          haber: 250000,
        },
      ],
    },

    // ========== ASIENTO 7: Compra de material didáctico ==========
    {
      id: 7,
      fecha: "2025-01-28",
      descripcion: "Compra material didáctico - Librería El Saber",
      origen: "COMPRA",
      referencia: "COM-789",
      totalDebe: 15000,
      totalHaber: 15000,
      movimientos: [
        {
          id: 16,
          cuenta: "5.2.06",
          nombreCuenta: "Material Didáctico",
          debe: 15000,
          haber: 0,
        },
        {
          id: 17,
          cuenta: "1.1.01",
          nombreCuenta: "Caja",
          debe: 0,
          haber: 15000,
        },
      ],
    },

    // ========== ASIENTO 8: Pago de servicios ==========
    {
      id: 8,
      fecha: "2025-01-30",
      descripcion: "Pago servicios enero (luz, agua, gas, internet)",
      origen: "MANUAL",
      referencia: "PAG-002",
      totalDebe: 25000,
      totalHaber: 25000,
      movimientos: [
        {
          id: 18,
          cuenta: "5.2.05",
          nombreCuenta: "Servicios",
          debe: 25000,
          haber: 0,
        },
        {
          id: 19,
          cuenta: "1.1.02",
          nombreCuenta: "Banco Cuenta Corriente",
          debe: 0,
          haber: 25000,
        },
      ],
    },
  ]);

  const [busqueda, setBusqueda] = useState("");
  const [origen, setOrigen] = useState("TODOS");

  const asientosFiltrados = asientos.filter((a) => {
    const coincideBusqueda =
      a.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.referencia?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideOrigen = origen === "TODOS" || a.origen === origen;

    return coincideBusqueda && coincideOrigen;
  });

  const verDetalle = (asiento) => {
    console.log("Ver asiento:", asiento);
    // Aquí podrías abrir un modal o navegar a una página de detalle
  };

  const validarAsiento = (movimientos) => {
    // Validar que esté balanceado
    const totalDebe = movimientos.reduce((sum, m) => sum + m.debe, 0);
    const totalHaber = movimientos.reduce((sum, m) => sum + m.haber, 0);

    if (totalDebe !== totalHaber) {
      throw new Error(
        `Asiento desbalanceado: Debe $${totalDebe} ≠ Haber $${totalHaber}`
      );
    }

    // Validar que tenga al menos 2 movimientos
    if (movimientos.length < 2) {
      throw new Error("Un asiento debe tener al menos 2 movimientos");
    }

    return true;
  };

  const agregarAsiento = (nuevoAsiento) => {
    try {
      // Validar antes de agregar
      validarAsiento(nuevoAsiento.movimientos);

      // Calcular totales
      const totalDebe = nuevoAsiento.movimientos.reduce(
        (sum, m) => sum + m.debe,
        0
      );
      const totalHaber = nuevoAsiento.movimientos.reduce(
        (sum, m) => sum + m.haber,
        0
      );

      const asientoCompleto = {
        ...nuevoAsiento,
        id: Math.max(...asientos.map((a) => a.id), 0) + 1,
        totalDebe,
        totalHaber,
      };

      setAsientos([...asientos, asientoCompleto]);
      return { success: true, asiento: asientoCompleto };
    } catch (error) {
      console.error("Error al agregar asiento:", error);
      return { success: false, error: error.message };
    }
  };

  const editarAsiento = (id, asientoActualizado) => {
    try {
      validarAsiento(asientoActualizado.movimientos);

      // Recalcular totales
      const totalDebe = asientoActualizado.movimientos.reduce(
        (sum, m) => sum + m.debe,
        0
      );
      const totalHaber = asientoActualizado.movimientos.reduce(
        (sum, m) => sum + m.haber,
        0
      );

      setAsientos(
        asientos.map((a) =>
          a.id === id
            ? { ...a, ...asientoActualizado, totalDebe, totalHaber }
            : a
        )
      );

      return { success: true };
    } catch (error) {
      console.error("Error al editar asiento:", error);
      return { success: false, error: error.message };
    }
  };

  const eliminarAsiento = (id) => {
    if (
      window.confirm(
        "¿Estás seguro de eliminar este asiento? Esta acción no se puede deshacer."
      )
    ) {
      setAsientos(asientos.filter((a) => a.id !== id));
      return true;
    }
    return false;
  };

  return {
    asientos: asientosFiltrados,
    busqueda,
    setBusqueda,
    origen,
    setOrigen,
    verDetalle,
    agregarAsiento,
    editarAsiento,
    eliminarAsiento,
  };
};
