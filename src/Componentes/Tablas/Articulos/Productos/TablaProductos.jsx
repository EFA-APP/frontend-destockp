import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductoUI } from "../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import DataTable from "../../../UI/DataTable/DataTable";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import { columnasProductos } from "./ColumnaProductos";
import { accionesProductos } from "./AccionesProductos";
import { BorrarIcono, MovimientoIcono, HistorialIcono, ProduccionIcono, EditarIcono } from "../../../../assets/Icons";
// import ModalCargaMasivaMovimientos from "../../../Modales/Articulos/ModalCargaMasivaMovimientos";


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

  // const [modalMasivoOpen, setModalMasivoOpen] = useState(false);


  const handleGestionar = (producto) => {
    navigate(`/panel/inventario/productos/${producto.codigoSecuencial}/acciones`, {
      state: { producto, initialTab: "info" }
    });
  };

  const handleProduccion = (producto) => {
    navigate(`/panel/inventario/produccion/${producto.codigoSecuencial}`);
  };

  const handleHistorial = (producto) => {
    navigate(`/panel/inventario/productos/${producto.codigoSecuencial}/acciones`, {
      state: { producto, initialTab: "historial" }
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
          handleProduccion,
          handleHistorial,
        })}
        botonAgregar={{
          texto: "Nuevo Producto",
          ruta: "/panel/inventario/productos/nuevo",
        }}
        elementosSuperior={(
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/panel/inventario/ajuste-stock/PRODUCTO")}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[11px] font-bold text-white uppercase tracking-wider transition-all cursor-pointer"
            >
              <MovimientoIcono size={14} />
              Ajuste de Stock
            </button>
            <button
              onClick={() => navigate("/panel/inventario/editar/productos")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-md text-[11px] font-bold text-blue-400 uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-500/5 group"
            >
              <EditarIcono size={14} className="group-hover:rotate-12 transition-transform" />
              Editar Artículo
            </button>
            <button
              onClick={() => navigate("/panel/inventario/historial-stock/PRODUCTO")}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 rounded-md text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/5 group"
            >
              <HistorialIcono size={14} className="group-hover:scale-110 transition-transform" />
              Historial
            </button>
            <button
              onClick={() => navigate("/panel/inventario/produccion/nueva")}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 rounded-md text-[11px] font-bold text-purple-400 uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-500/5 group"
            >
              <ProduccionIcono size={14} className="group-hover:rotate-12 transition-transform" />
              Producción
            </button>
          </div>
        )}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Filtrar por mermelada, código o sabor..."
      />

      {/* <ModalCargaMasivaMovimientos
        open={modalMasivoOpen}
        onClose={() => setModalMasivoOpen(false)}
        tipo="PRODUCTO"
      /> */}
    </div>

  );
};

export default TablaProductos;
