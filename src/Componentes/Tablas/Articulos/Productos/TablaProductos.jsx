import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductoUI } from "../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import DataTable from "../../../UI/DataTable/DataTable";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import { columnasProductos } from "./ColumnaProductos";
import { accionesProductos } from "./AccionesProductos";
import { BorrarIcono } from "../../../../assets/Icons";

const TablaProductos = () => {
  const navigate = useNavigate();
  const {
    productos,
    busqueda,
    setBusqueda,
    eliminarProducto,
    cargando,
    estaEliminando
  } = useProductoUI();

  const [confirmarEliminar, setConfirmarEliminar] = useState({
    open: false,
    codigo: null,
    nombre: "",
  });

  const handleGestionar = (producto) => {
    navigate(`/panel/inventario/productos/${producto.codigoSecuencial}/acciones`, {
      state: { producto, initialTab: "info" }
    });
  };

  const handleEliminarClick = (codigo, nombre) => {
    setConfirmarEliminar({
      open: true,
      codigo,
      nombre,
    });
  };

  const confirmarEliminacion = async () => {
    try {
      await eliminarProducto(confirmarEliminar.codigo);
      setConfirmarEliminar({ open: false, codigo: null, nombre: "" });
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="space-y-6">
      <ModalConfirmacion
        open={confirmarEliminar.open}
        onClose={() => setConfirmarEliminar({ open: false, codigo: null, nombre: "" })}
        onConfirm={confirmarEliminacion}
        titulo="Eliminar Producto"
        mensaje={`¿Estás seguro de que deseas eliminar "${confirmarEliminar.nombre}"? No aparecerá en el listado activo.`}
        textoConfirmar={estaEliminando ? "Eliminando..." : "Eliminar"}
        textoCancelar="Cancelar"
        icono={<BorrarIcono size={40} color="text-red-500" />}
        colorConfirmar="bg-red-600!"
      />

      <DataTable
        columnas={columnasProductos}
        datos={productos}
        loading={cargando}
        mostrarAcciones={true}
        acciones={accionesProductos({
          handleEliminarClick,
          handleGestionar,
        })}
        botonAgregar={{
          texto: "Nuevo Producto",
          ruta: "/panel/inventario/productos/nuevo",
        }}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Filtrar por mermelada, código o sabor..."
      />
    </div>
  );
};

export default TablaProductos;
