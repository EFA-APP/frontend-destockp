import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductoUI } from "../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import DataTable from "../../../UI/DataTable/DataTable";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import { columnasProductos } from "./ColumnaProductos";
import { accionesProductos } from "./AccionesProductos";
import { BorrarIcono, MovimientoIcono } from "../../../../assets/Icons";
import ModalCargaMasivaMovimientos from "../../../Modales/Articulos/ModalCargaMasivaMovimientos";


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

  const [modalMasivoOpen, setModalMasivoOpen] = useState(false);


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
        elementosSuperior={(
          <button
            onClick={() => setModalMasivoOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[11px] font-bold text-white uppercase tracking-wider transition-all cursor-pointer"
          >
            <MovimientoIcono size={14} />
            Ajuste de Stock
          </button>
        )}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Filtrar por mermelada, código o sabor..."
      />

      <ModalCargaMasivaMovimientos
        open={modalMasivoOpen}
        onClose={() => setModalMasivoOpen(false)}
        tipo="PRODUCTO"
      />
    </div>

  );
};

export default TablaProductos;
