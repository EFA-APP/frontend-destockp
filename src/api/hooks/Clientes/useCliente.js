import { useState } from "react";

export const useClientes = () => {
  const [clientes, setClientes] = useState([
    {
      id: 1,
      codigo: "V001",
      tipo: "VENTA",
      nombre: "Juan Pérez",
      documento: "30123456",
      email: "juan@gmail.com",
      telefono: "3815551234",
      direccion: "San Martín 123",
      condicionIVA: "Consumidor Final",
    },
    {
      id: 2,
      codigo: "A001",
      tipo: "ALUMNO",
      nombre: "Lucía Gómez",
      documento: "45123456",
      email: "lucia@gmail.com",
      telefono: "3815558888",
      direccion: "Belgrano 456",
      curso: "5° A",
      cuotaMensual: 15000,
      tieneDeuda: true,
    },
  ]);

  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS"); // TODOS | VENTA | ALUMNO

  const clientesFiltrados = clientes.filter((c) => {
    const coincideBusqueda =
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.documento.includes(busqueda);

    const coincideTipo = tipoFiltro === "TODOS" || c.tipo === tipoFiltro;

    return coincideBusqueda && coincideTipo;
  });

  const manejarAgregar = (tipo) => {
    const nuevo = {
      id: clientes.length + 1,
      codigo:
        tipo === "ALUMNO"
          ? `A${String(clientes.length + 1).padStart(3, "0")}`
          : `V${String(clientes.length + 1).padStart(3, "0")}`,
      tipo,
      nombre: "Nuevo Cliente",
      documento: "",
      email: "",
      telefono: "",
      direccion: "",
      ...(tipo === "ALUMNO" && {
        curso: "",
        cuotaMensual: 0,
        tieneDeuda: false,
      }),
      ...(tipo === "VENTA" && {
        condicionIVA: "Consumidor Final",
      }),
    };

    setClientes((prev) => [...prev, nuevo]);
  };

  const manejarEditar = (cliente) => {
    console.log("Editando:", cliente);
  };

  const manejarEliminar = (id) => {
    if (window.confirm("¿Eliminar cliente?")) {
      setClientes((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return {
    clientes: clientesFiltrados,
    busqueda,
    setBusqueda,
    tipoFiltro,
    setTipoFiltro,
    manejarAgregar,
    manejarEditar,
    manejarEliminar,
  };
};
