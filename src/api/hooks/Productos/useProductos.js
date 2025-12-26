import { useState } from "react";

export const useProductos = () => {
  const [productos, setProductos] = useState([
    {
      id: 1,
      codigo: "PROD001",
      nombre: "Mermelada de Frutilla",
      descripcion: "Mermelada artesanal de frutilla 250g",
      stock: 72, // unidades totales
      cantidadPorPaquete: 6, // frascos por paquete
      paquetes: 12, // cantidad de paquetes
      pesoUnitario: 0.25, // kg por frasco (250g)
      pesoTotal: 18, // kg totales (72 × 0.25)
      unidad: "frascos",
      precioUnitario: 850, // precio por frasco
      precioTotal: 61200, // precio total (72 × 850)
      sabor: "Frutilla",
    },
    {
      id: 2,
      codigo: "PROD002",
      nombre: "Mermelada de Durazno",
      descripcion: "Mermelada artesanal de durazno 250g",
      stock: 48,
      cantidadPorPaquete: 6,
      paquetes: 8,
      pesoUnitario: 0.25,
      pesoTotal: 12,
      unidad: "frascos",
      precioUnitario: 820,
      precioTotal: 39360,
      sabor: "Durazno",
    },
    {
      id: 3,
      codigo: "PROD003",
      nombre: "Mermelada de Arándanos",
      descripcion: "Mermelada artesanal de arándanos 250g",
      stock: 36,
      cantidadPorPaquete: 6,
      paquetes: 6,
      pesoUnitario: 0.25,
      pesoTotal: 9,
      unidad: "frascos",
      precioUnitario: 950,
      precioTotal: 34200,
      sabor: "Arándanos",
    },
    {
      id: 4,
      codigo: "PROD004",
      nombre: "Mermelada de Frambuesa",
      descripcion: "Mermelada artesanal de frambuesa 250g",
      stock: 30,
      cantidadPorPaquete: 6,
      paquetes: 5,
      pesoUnitario: 0.25,
      pesoTotal: 7.5,
      unidad: "frascos",
      precioUnitario: 920,
      precioTotal: 27600,
      sabor: "Frambuesa",
    },
    {
      id: 5,
      codigo: "PROD005",
      nombre: "Mermelada de Naranja",
      descripcion: "Mermelada artesanal de naranja 250g",
      stock: 54,
      cantidadPorPaquete: 6,
      paquetes: 9,
      pesoUnitario: 0.25,
      pesoTotal: 13.5,
      unidad: "frascos",
      precioUnitario: 780,
      precioTotal: 42120,
      sabor: "Naranja",
    },
    {
      id: 6,
      codigo: "PROD006",
      nombre: "Mermelada de Ciruela",
      descripcion: "Mermelada artesanal de ciruela 250g",
      stock: 24,
      cantidadPorPaquete: 6,
      paquetes: 4,
      pesoUnitario: 0.25,
      pesoTotal: 6,
      unidad: "frascos",
      precioUnitario: 800,
      precioTotal: 19200,
      sabor: "Ciruela",
    },
    {
      id: 7,
      codigo: "PROD007",
      nombre: "Mermelada de Frutilla (500g)",
      descripcion: "Mermelada artesanal de frutilla 500g",
      stock: 18,
      cantidadPorPaquete: 6,
      paquetes: 3,
      pesoUnitario: 0.5,
      pesoTotal: 9,
      unidad: "frascos",
      precioUnitario: 1450,
      precioTotal: 26100,
      sabor: "Frutilla",
    },
    {
      id: 8,
      codigo: "PROD008",
      nombre: "Mermelada Mix Berries",
      descripcion: "Mix de frutilla, frambuesa y arándanos 250g",
      stock: 42,
      cantidadPorPaquete: 6,
      paquetes: 7,
      pesoUnitario: 0.25,
      pesoTotal: 10.5,
      unidad: "frascos",
      precioUnitario: 980,
      precioTotal: 41160,
      sabor: "Mix Berries",
    },
    {
      id: 9,
      codigo: "PROD009",
      nombre: "Mermelada de Damasco",
      descripcion: "Mermelada artesanal de damasco 250g",
      stock: 30,
      cantidadPorPaquete: 6,
      paquetes: 5,
      pesoUnitario: 0.25,
      pesoTotal: 7.5,
      unidad: "frascos",
      precioUnitario: 850,
      precioTotal: 25500,
      sabor: "Damasco",
    },
    {
      id: 10,
      codigo: "PROD010",
      nombre: "Mermelada de Membrillo",
      descripcion: "Mermelada artesanal de membrillo 250g",
      stock: 36,
      cantidadPorPaquete: 6,
      paquetes: 6,
      pesoUnitario: 0.25,
      pesoTotal: 9,
      unidad: "frascos",
      precioUnitario: 750,
      precioTotal: 27000,
      sabor: "Membrillo",
    },
    {
      id: 11,
      codigo: "PROD011",
      nombre: "Mermelada de Higo",
      descripcion: "Mermelada artesanal de higo con nuez 250g",
      stock: 24,
      cantidadPorPaquete: 6,
      paquetes: 4,
      pesoUnitario: 0.25,
      pesoTotal: 6,
      unidad: "frascos",
      precioUnitario: 1050,
      precioTotal: 25200,
      sabor: "Higo",
    },
    {
      id: 12,
      codigo: "PROD012",
      nombre: "Mermelada de Durazno (500g)",
      descripcion: "Mermelada artesanal de durazno 500g",
      stock: 12,
      cantidadPorPaquete: 6,
      paquetes: 2,
      pesoUnitario: 0.5,
      pesoTotal: 6,
      unidad: "frascos",
      precioUnitario: 1400,
      precioTotal: 16800,
      sabor: "Durazno",
    },
  ]);

  const [busqueda, setBusqueda] = useState("");

  const productosFiltrados = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.sabor.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const manejarEditar = (fila) => {
    console.log("Editando producto:", fila);
    // Aquí puedes navegar a la página de edición
    // navigate(`/panel/inventario/productos/editar/${fila.id}`);
  };

  const manejarEliminar = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      setProductos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const manejarAgregar = () => {
    const nuevoProducto = {
      id: productos.length + 1,
      codigo: `PROD${String(productos.length + 1).padStart(3, "0")}`,
      nombre: "Nueva Mermelada",
      descripcion: "Mermelada artesanal 250g",
      stock: 0,
      cantidadPorPaquete: 6,
      paquetes: 0,
      pesoUnitario: 0.25,
      pesoTotal: 0,
      unidad: "frascos",
      precioUnitario: 0,
      precioTotal: 0,
      sabor: "",
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
