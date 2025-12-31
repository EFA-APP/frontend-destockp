import { useState } from "react";

export const useMateriaPrima = () => {
  const [materiaPrima, setMateriaPrima] = useState([
    {
      id: 1,
      codigo: "MP001",
      nombre: "Azúcar",
      descripcion: "Azúcar blanca refinada",
      stock: 150, // kg totales
      cantidadPorPaquete: 25, // kg por paquete
      paquetes: 6, // cantidad de paquetes
      unidad: "kg",
      precioUnitario: 85.5, // precio por kg
      precioTotal: 12825, // precio total (150 kg * 85.50)
    },
    {
      id: 2,
      codigo: "MP002",
      nombre: "Frutillas",
      descripcion: "Frutillas frescas de temporada",
      stock: 80,
      cantidadPorPaquete: 10,
      paquetes: 8,
      unidad: "kg",
      precioUnitario: 320,
      precioTotal: 25600,
    },
    {
      id: 3,
      codigo: "MP003",
      nombre: "Duraznos",
      descripcion: "Duraznos pelados en mitades",
      stock: 60,
      cantidadPorPaquete: 10,
      paquetes: 6,
      unidad: "kg",
      precioUnitario: 280,
      precioTotal: 16800,
    },
    {
      id: 4,
      codigo: "MP004",
      nombre: "Pectina",
      descripcion: "Pectina cítrica para gelificante",
      stock: 5,
      cantidadPorPaquete: 1,
      paquetes: 5,
      unidad: "kg",
      precioUnitario: 1850,
      precioTotal: 9250,
    },
    {
      id: 5,
      codigo: "MP005",
      nombre: "Ácido Cítrico",
      descripcion: "Ácido cítrico alimentario E330",
      stock: 3,
      cantidadPorPaquete: 0.5,
      paquetes: 6,
      unidad: "kg",
      precioUnitario: 950,
      precioTotal: 2850,
    },
    {
      id: 6,
      codigo: "MP006",
      nombre: "Arándanos",
      descripcion: "Arándanos congelados",
      stock: 45,
      cantidadPorPaquete: 5,
      paquetes: 9,
      unidad: "kg",
      precioUnitario: 580,
      precioTotal: 26100,
    },
    {
      id: 7,
      codigo: "MP007",
      nombre: "Frambuesas",
      descripcion: "Frambuesas congeladas",
      stock: 35,
      cantidadPorPaquete: 5,
      paquetes: 7,
      unidad: "kg",
      precioUnitario: 650,
      precioTotal: 22750,
    },
    {
      id: 8,
      codigo: "MP008",
      nombre: "Limones",
      descripcion: "Limones frescos para jugo",
      stock: 25,
      cantidadPorPaquete: 5,
      paquetes: 5,
      unidad: "kg",
      precioUnitario: 120,
      precioTotal: 3000,
    },
    {
      id: 9,
      codigo: "MP009",
      nombre: "Conservante Sorbato",
      descripcion: "Sorbato de potasio E202",
      stock: 2,
      cantidadPorPaquete: 0.5,
      paquetes: 4,
      unidad: "kg",
      precioUnitario: 1200,
      precioTotal: 2400,
    },
    {
      id: 10,
      codigo: "MP010",
      nombre: "Frascos 250ml",
      descripcion: "Frascos de vidrio con tapa",
      stock: 500,
      cantidadPorPaquete: 50,
      paquetes: 10,
      unidad: "unidades",
      precioUnitario: 18,
      precioTotal: 9000,
    },
    {
      id: 11,
      codigo: "MP011",
      nombre: "Etiquetas",
      descripcion: "Etiquetas adhesivas personalizadas",
      stock: 1000,
      cantidadPorPaquete: 100,
      paquetes: 10,
      unidad: "unidades",
      precioUnitario: 2.5,
      precioTotal: 2500,
    },
    {
      id: 12,
      codigo: "MP012",
      nombre: "Canela en Rama",
      descripcion: "Canela en rama premium",
      stock: 1.5,
      cantidadPorPaquete: 0.5,
      paquetes: 3,
      unidad: "kg",
      precioUnitario: 3500,
      precioTotal: 5250,
    },
  ]);

  const [busqueda, setBusqueda] = useState("");

  const materiaPrimaFiltrada = materiaPrima.filter(
    (item) =>
      item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const manejarDetalle = (id) => {
    console.log(id);
  };

  const manejarEditar = (fila) => {
    console.log("Editando materia prima:", fila);
    // Aquí puedes navegar a la página de edición
    // navigate(`/panel/inventario/materia-prima/editar/${fila.id}`);
  };

  const manejarEliminar = (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta materia prima?")) {
      setMateriaPrima((prev) => prev.filter((mp) => mp.id !== id));
    }
  };

  const manejarAgregar = () => {
    const nuevaMateriaPrima = {
      id: materiaPrima.length + 1,
      codigo: `MP${String(materiaPrima.length + 1).padStart(3, "0")}`,
      nombre: "Nueva Materia Prima",
      descripcion: "",
      stock: 0,
      cantidadPorPaquete: 0,
      paquetes: 0,
      unidad: "kg",
      precioUnitario: 0,
      precioTotal: 0,
    };

    setMateriaPrima((prev) => [...prev, nuevaMateriaPrima]);
  };

  return {
    materiaPrima: materiaPrimaFiltrada,
    busqueda,
    setBusqueda,
    manejarEditar,
    manejarEliminar,
    manejarAgregar,
    manejarDetalle,
  };
};
