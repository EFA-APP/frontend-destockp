import { useState } from "react";

export const useInventario = () => {
  const [productos, setProductos] = useState([
    {
      id: 1,
      codigo: "001",
      nombre: "Laptop Dell XPS 15",
      categoria: "Electrónica",
      stock: 15,
      precio: 1200,
    },
    {
      id: 2,
      codigo: "002",
      nombre: "Mouse Logitech",
      categoria: "Electrónica",
      stock: 1,
      precio: 25,
    },
    {
      id: 3,
      codigo: "003",
      nombre: "Mouse Logitech",
      categoria: "Electrónica",
      stock: 1,
      precio: 25,
    },
    {
      id: 4,
      codigo: "004",
      nombre: "Mouse Logitech",
      categoria: "Electrónica",
      stock: 1,
      precio: 25,
    },
  ]);

  const [busqueda, setBusqueda] = useState("");

  const productosFiltrados = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const manejarEditar = (fila) => {
    console.log("Editando producto:", fila);
    alert(`Editando: ${fila.nombre}`);
  };

  const manejarEliminar = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      setProductos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const manejarAgregar = () => {
    const nuevoProducto = {
      id: productos.length + 1,
      codigo: `${String(productos.length + 1).padStart(3, "0")}`,
      nombre: "Nuevo Producto",
      categoria: "General",
      stock: 10,
      precio: 100,
    };

    setProductos((prev) => [...prev, nuevoProducto]);
  };

  return {
    productos: productosFiltrados,
    busqueda,
    setBusqueda,
    manejarEditar,
    manejarEliminar,
    manejarAgregar,
  };
};
