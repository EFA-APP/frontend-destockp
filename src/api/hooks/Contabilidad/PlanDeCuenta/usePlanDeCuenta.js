import { useState } from "react";

export const usePlanDeCuentas = () => {
  const [cuentas, setCuentas] = useState([
    // ============ 1. ACTIVO ============
    {
      id: 1,
      codigo: "1",
      nombre: "ACTIVO",
      tipo: "ACTIVO",
      nivel: 1,
      imputable: false,
      activa: true,
    },
    {
      id: 2,
      codigo: "1.1",
      nombre: "Activo Corriente",
      tipo: "ACTIVO",
      nivel: 2,
      padreId: 1,
      imputable: false,
      activa: true,
    },
    {
      id: 3,
      codigo: "1.1.01",
      nombre: "Caja",
      tipo: "ACTIVO",
      subtipo: "DISPONIBILIDAD",
      nivel: 3,
      padreId: 2,
      imputable: true,
      activa: true,
    },
    {
      id: 4,
      codigo: "1.1.02",
      nombre: "Banco Cuenta Corriente",
      tipo: "ACTIVO",
      subtipo: "DISPONIBILIDAD",
      nivel: 3,
      padreId: 2,
      imputable: true,
      activa: true,
    },
    {
      id: 5,
      codigo: "1.1.03",
      nombre: "Deudores por Cuotas",
      tipo: "ACTIVO",
      subtipo: "CREDITO",
      nivel: 3,
      padreId: 2,
      imputable: true,
      activa: true,
    },
    {
      id: 6,
      codigo: "1.1.04",
      nombre: "IVA Crédito Fiscal",
      tipo: "ACTIVO",
      subtipo: "CREDITO",
      nivel: 3,
      padreId: 2,
      imputable: true,
      activa: true,
    },
    {
      id: 7,
      codigo: "1.1.05",
      nombre: "Stock de Mermeladas",
      tipo: "ACTIVO",
      subtipo: "BIENES DE CAMBIO",
      nivel: 3,
      padreId: 2,
      imputable: true,
      activa: true,
    },
    {
      id: 8,
      codigo: "1.1.06",
      nombre: "Materias Primas",
      tipo: "ACTIVO",
      subtipo: "BIENES DE CAMBIO",
      nivel: 3,
      padreId: 2,
      imputable: true,
      activa: true,
    },

    // ============ 2. PASIVO ============
    {
      id: 9,
      codigo: "2",
      nombre: "PASIVO",
      tipo: "PASIVO",
      nivel: 1,
      imputable: false,
      activa: true,
    },
    {
      id: 10,
      codigo: "2.1",
      nombre: "Pasivo Corriente",
      tipo: "PASIVO",
      nivel: 2,
      padreId: 9,
      imputable: false,
      activa: true,
    },
    {
      id: 11,
      codigo: "2.1.01",
      nombre: "Proveedores",
      tipo: "PASIVO",
      subtipo: "DEUDA COMERCIAL",
      nivel: 3,
      padreId: 10,
      imputable: true,
      activa: true,
    },
    {
      id: 12,
      codigo: "2.1.02",
      nombre: "Sueldos a Pagar",
      tipo: "PASIVO",
      subtipo: "REMUNERACIONES",
      nivel: 3,
      padreId: 10,
      imputable: true,
      activa: true,
    },
    {
      id: 13,
      codigo: "2.1.03",
      nombre: "Cargas Sociales a Pagar",
      tipo: "PASIVO",
      subtipo: "REMUNERACIONES",
      nivel: 3,
      padreId: 10,
      imputable: true,
      activa: true,
    },
    {
      id: 14,
      codigo: "2.1.04",
      nombre: "IVA Débito Fiscal",
      tipo: "PASIVO",
      subtipo: "IMPUESTOS",
      nivel: 3,
      padreId: 10,
      imputable: true,
      activa: true,
    },

    // ============ 3. PATRIMONIO NETO ============
    {
      id: 15,
      codigo: "3",
      nombre: "PATRIMONIO NETO",
      tipo: "PATRIMONIO",
      nivel: 1,
      imputable: false,
      activa: true,
    },
    {
      id: 16,
      codigo: "3.1",
      nombre: "Capital",
      tipo: "PATRIMONIO",
      nivel: 2,
      padreId: 15,
      imputable: true,
      activa: true,
    },
    {
      id: 17,
      codigo: "3.2",
      nombre: "Resultados Acumulados",
      tipo: "PATRIMONIO",
      nivel: 2,
      padreId: 15,
      imputable: true,
      activa: true,
    },

    // ============ 4. INGRESOS ============
    {
      id: 18,
      codigo: "4",
      nombre: "INGRESOS",
      tipo: "RESULTADO",
      subtipo: "INGRESO",
      nivel: 1,
      imputable: false,
      activa: true,
    },
    {
      id: 19,
      codigo: "4.1",
      nombre: "Ingresos por Educación",
      tipo: "RESULTADO",
      subtipo: "INGRESO",
      nivel: 2,
      padreId: 18,
      imputable: false,
      activa: true,
    },
    {
      id: 20,
      codigo: "4.1.01",
      nombre: "Cuotas Escolares Nivel Inicial",
      tipo: "RESULTADO",
      subtipo: "INGRESO",
      nivel: 3,
      padreId: 19,
      imputable: true,
      activa: true,
    },
    {
      id: 21,
      codigo: "4.1.02",
      nombre: "Cuotas Escolares Nivel Primario",
      tipo: "RESULTADO",
      subtipo: "INGRESO",
      nivel: 3,
      padreId: 19,
      imputable: true,
      activa: true,
    },
    {
      id: 22,
      codigo: "4.1.03",
      nombre: "Cuotas Escolares Nivel Secundario",
      tipo: "RESULTADO",
      subtipo: "INGRESO",
      nivel: 3,
      padreId: 19,
      imputable: true,
      activa: true,
    },
    {
      id: 23,
      codigo: "4.1.04",
      nombre: "Matrícula",
      tipo: "RESULTADO",
      subtipo: "INGRESO",
      nivel: 3,
      padreId: 19,
      imputable: true,
      activa: true,
    },
    {
      id: 24,
      codigo: "4.2",
      nombre: "Ingresos por Ventas",
      tipo: "RESULTADO",
      subtipo: "INGRESO",
      nivel: 2,
      padreId: 18,
      imputable: false,
      activa: true,
    },
    {
      id: 25,
      codigo: "4.2.01",
      nombre: "Venta de Mermeladas",
      tipo: "RESULTADO",
      subtipo: "INGRESO",
      nivel: 3,
      padreId: 24,
      imputable: true,
      activa: true,
    },

    // ============ 5. EGRESOS ============
    {
      id: 26,
      codigo: "5",
      nombre: "EGRESOS",
      tipo: "RESULTADO",
      subtipo: "EGRESO",
      nivel: 1,
      imputable: false,
      activa: true,
    },
    {
      id: 27,
      codigo: "5.1",
      nombre: "Costos de Producción",
      tipo: "RESULTADO",
      subtipo: "COSTO",
      nivel: 2,
      padreId: 26,
      imputable: false,
      activa: true,
    },
    {
      id: 28,
      codigo: "5.1.01",
      nombre: "Compra de Frutas",
      tipo: "RESULTADO",
      subtipo: "COSTO",
      nivel: 3,
      padreId: 27,
      imputable: true,
      activa: true,
    },
    {
      id: 29,
      codigo: "5.1.02",
      nombre: "Compra de Azúcar",
      tipo: "RESULTADO",
      subtipo: "COSTO",
      nivel: 3,
      padreId: 27,
      imputable: true,
      activa: true,
    },
    {
      id: 30,
      codigo: "5.1.03",
      nombre: "Compra de Envases",
      tipo: "RESULTADO",
      subtipo: "COSTO",
      nivel: 3,
      padreId: 27,
      imputable: true,
      activa: true,
    },
    {
      id: 31,
      codigo: "5.2",
      nombre: "Gastos Administrativos",
      tipo: "RESULTADO",
      subtipo: "GASTO",
      nivel: 2,
      padreId: 26,
      imputable: false,
      activa: true,
    },
    {
      id: 32,
      codigo: "5.2.01",
      nombre: "Sueldos Docentes",
      tipo: "RESULTADO",
      subtipo: "GASTO",
      nivel: 3,
      padreId: 31,
      imputable: true,
      activa: true,
    },
    {
      id: 33,
      codigo: "5.2.02",
      nombre: "Sueldos Administrativos",
      tipo: "RESULTADO",
      subtipo: "GASTO",
      nivel: 3,
      padreId: 31,
      imputable: true,
      activa: true,
    },
    {
      id: 34,
      codigo: "5.2.03",
      nombre: "Cargas Sociales",
      tipo: "RESULTADO",
      subtipo: "GASTO",
      nivel: 3,
      padreId: 31,
      imputable: true,
      activa: true,
    },
    {
      id: 35,
      codigo: "5.2.04",
      nombre: "Alquiler",
      tipo: "RESULTADO",
      subtipo: "GASTO",
      nivel: 3,
      padreId: 31,
      imputable: true,
      activa: true,
    },
    {
      id: 36,
      codigo: "5.2.05",
      nombre: "Servicios",
      tipo: "RESULTADO",
      subtipo: "GASTO",
      nivel: 3,
      padreId: 31,
      imputable: true,
      activa: true,
    },
    {
      id: 37,
      codigo: "5.2.06",
      nombre: "Material Didáctico",
      tipo: "RESULTADO",
      subtipo: "GASTO",
      nivel: 3,
      padreId: 31,
      imputable: true,
      activa: true,
    },
  ]);

  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("TODOS");

  const cuentasFiltradas = cuentas.filter((c) => {
    const coincideBusqueda =
      c.codigo.includes(busqueda) ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase());

    const coincideTipo = tipo === "TODOS" || c.tipo === tipo;

    return coincideBusqueda && coincideTipo;
  });

  const manejarEditar = (cuenta) => {
    console.log("Editar cuenta:", cuenta);
    // Aquí irías a un formulario de edición
  };

  const manejarEliminar = (id) => {
    // Verificar si tiene movimientos asociados antes de desactivar
    const cuenta = cuentas.find((c) => c.id === id);

    if (!cuenta.imputable) {
      alert(
        "No puedes desactivar una cuenta padre. Desactiva primero sus subcuentas."
      );
      return;
    }

    if (
      window.confirm(`¿Desactivar cuenta ${cuenta.codigo} - ${cuenta.nombre}?`)
    ) {
      setCuentas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, activa: false } : c))
      );
    }
  };

  const agregarCuenta = (nuevaCuenta) => {
    const cuentaConId = {
      ...nuevaCuenta,
      id: Math.max(...cuentas.map((c) => c.id)) + 1,
    };
    setCuentas([...cuentas, cuentaConId]);
  };

  return {
    cuentas: cuentasFiltradas,
    busqueda,
    setBusqueda,
    tipo,
    setTipo,
    manejarEditar,
    manejarEliminar,
    agregarCuenta,
  };
};
