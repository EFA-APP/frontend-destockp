import { useState } from "react";

export const usePlanDeCuentas = () => {
  const [cuentas, setCuentas] = useState([
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
      codigo: "11",
      nombre: "Activo Corriente",
      tipo: "ACTIVO",
      nivel: 2,
      padreId: 1,
      imputable: false,
      activa: true,
    },
    {
      id: 3,
      codigo: "1101",
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
      codigo: "5101",
      nombre: "Compras de mercaderías",
      tipo: "RESULTADO",
      subtipo: "COSTO",
      nivel: 3,
      imputable: true,
      activa: true,
    },
    {
      id: 5,
      codigo: "4101",
      nombre: "Ventas",
      tipo: "RESULTADO",
      subtipo: "INGRESO",
      nivel: 3,
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
  };

  const manejarEliminar = (id) => {
    if (window.confirm("¿Desactivar cuenta?")) {
      setCuentas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, activa: false } : c))
      );
    }
  };

  return {
    cuentas: cuentasFiltradas,
    busqueda,
    setBusqueda,
    tipo,
    setTipo,
    manejarEditar,
    manejarEliminar,
  };
};
