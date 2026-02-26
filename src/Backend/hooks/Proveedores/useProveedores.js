import { useState } from "react";

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState([
    {
      id: 1,
      codigo: "P001",
      tipo: "PROVEEDOR",
      razonSocial: "Distribuidora Norte SRL",
      cuit: "30-71234567-8",
      email: "contacto@dnorte.com",
      telefono: "3815551111",
      direccion: "Av. Alem 100",
      condicionIVA: "Responsable Inscripto",
      rubro: "alimentos",
      activo: true,
    },
    {
      id: 2,
      codigo: "P002",
      tipo: "PROVEEDOR",
      razonSocial: "Papelería Central",
      cuit: "27-23456789-3",
      email: "ventas@papeleria.com",
      telefono: "3815552222",
      direccion: "San Juan 450",
      condicionIVA: "Monotributo",
      rubro: "equipamiento",
      activo: true,
    },
  ]);

  const [busqueda, setBusqueda] = useState("");

  const proveedoresFiltrados = proveedores.filter((p) => {
    const texto = busqueda.toLowerCase();

    return (
      p.razonSocial.toLowerCase().includes(texto) ||
      p.codigo.toLowerCase().includes(texto) ||
      p.cuit.includes(busqueda)
    );
  });

  const manejarDetalle = (id) => {
    console.log(id);
  };

  // ➕ Agregar proveedor
  const manejarAgregar = () => {
    const nuevo = {
      id: proveedores.length + 1,
      codigo: `P${String(proveedores.length + 1).padStart(3, "0")}`,
      razonSocial: "Nuevo Proveedor",
      cuit: "",
      email: "",
      telefono: "",
      direccion: "",
      condicionIVA: "Responsable Inscripto",
      rubro: "",
      activo: true,
    };

    setProveedores((prev) => [...prev, nuevo]);
  };

  // ✏️ Editar proveedor
  const manejarEditar = (proveedorActualizado) => {
    setProveedores((prev) =>
      prev.map((p) =>
        p.id === proveedorActualizado.id ? proveedorActualizado : p
      )
    );
  };

  // 🗑 Eliminar proveedor
  const manejarEliminar = (id) => {
    if (window.confirm("¿Eliminar proveedor?")) {
      setProveedores((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // 🔄 Activar / desactivar
  const manejarToggleActivo = (id) => {
    setProveedores((prev) =>
      prev.map((p) => (p.id === id ? { ...p, activo: !p.activo } : p))
    );
  };

  return {
    proveedores: proveedoresFiltrados,
    busqueda,
    setBusqueda,
    manejarDetalle,
    manejarAgregar,
    manejarEditar,
    manejarEliminar,
    manejarToggleActivo,
  };
};
