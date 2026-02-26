import { useState } from "react";

export const useClientes = () => {
  const [clientes, setClientes] = useState([
    {
      id: 1,
      codigo: "V001",
      tipo: "COMPRADOR",
      nombre: "Juan Pérez",
      documento: "30123456",
      email: "juan@gmail.com",
      telefono: "3815551234",
      direccion: "San Martín 123",
      condicionIVA: "Consumidor Final",
    },
    {
      id: 2,
      codigo: "V002",
      tipo: "COMPRADOR",
      nombre: "María Lopez",
      documento: "30123456",
      email: "maria@gmail.com",
      telefono: "3815551232",
      direccion: "San Martín 123",
      condicionIVA: "Consumidor Final",
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
      ...(tipo === "COMPRADOR" && {
        condicionIVA: "Consumidor Final",
      }),
    };

    setClientes((prev) => [...prev, nuevo]);
  };

  const manejarDetalle = (id) => {
    console.log(id);
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
    manejarDetalle,
    manejarEditar,
    manejarEliminar,
  };
};
