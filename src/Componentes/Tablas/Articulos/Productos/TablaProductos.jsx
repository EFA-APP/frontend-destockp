import { useState } from "react";
import { useProductoUI } from "../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import DataTable from "../../../UI/DataTable/DataTable";
import productoConfig from "../../../Modales/Articulos/ConfigProducto";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import ModalMovimiento from "../../../Modales/Articulos/ModalMovimiento";
import ModalProduccion from "../../../Modales/Articulos/ModalProduccion";
import { columnasProductos } from "./ColumnaProductos";
import { accionesProductos } from "./AccionesProductos";
import { BorrarIcono, HistorialIcono } from "../../../../assets/Icons";
import ModalDetalleBase from "../../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../../UI/ModalDetalleBase/ModalDetalle";
import ListaMovimientos from "../../../UI/ListaMovimientos/ListaMovimientos";

const TablaProductos = () => {
  const {
    productos,
    busqueda,
    setBusqueda, 
    actualizarProducto, 
    eliminarProducto,
    cargando,
    estaEliminando
  } = useProductoUI();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalMovimientoAbierto, setModalMovimientoAbierto] = useState(false);
  const [modalProduccionAbierto, setModalProduccionAbierto] = useState(false);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modoModal, setModoModal] = useState("view");

  const [confirmarEliminar, setConfirmarEliminar] = useState({
    open: false,
    codigo: null,
    nombre: "",
  });

  const handleVerDetalle = (producto) => {
    setProductoSeleccionado(producto);
    setModoModal("vista");
    setModalAbierto(true);
  };

  const handleEditar = (producto) => {
    setProductoSeleccionado(producto);
    setModoModal("editar");
    setModalAbierto(true);
  };

  const handleMovimiento = (producto) => {
    setProductoSeleccionado(producto);
    setModalMovimientoAbierto(true);
  };

  const handleProduccion = (producto) => {
    setProductoSeleccionado(producto);
    setModalProduccionAbierto(true);
  };

  const handleVerHistorial = (producto) => {
    setProductoSeleccionado(producto);
    setModalHistorialAbierto(true);
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
      <ModalDetalleGenerico
        mode={modoModal}
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={async (dataEditada) => {
          const { 
            codigoSecuencial, 
            codigoEmpresa, 
            createdAt, 
            updatedAt, 
            id,
            ...payload 
          } = dataEditada;

          // Aseguramos tipos numéricos
          if (payload.stock !== undefined) payload.stock = parseFloat(payload.stock) || 0;
          if (payload.cantidadPorPaquete !== undefined) payload.cantidadPorPaquete = parseFloat(payload.cantidadPorPaquete) || 0;
          if (payload.cantidadDePaquetesActuales !== undefined) payload.cantidadDePaquetesActuales = parseFloat(payload.cantidadDePaquetesActuales) || 0;

          await actualizarProducto(productoSeleccionado.codigoSecuencial, payload);
          setModalAbierto(false);
        }}
        data={productoSeleccionado}
        {...productoConfig}
      />

      <ModalConfirmacion
        open={confirmarEliminar.open}
        onClose={() => setConfirmarEliminar({ open: false, codigo: null, nombre: "" })}
        onConfirm={confirmarEliminacion}
        titulo="Eliminar Producto"
        mensaje={`¿Estás seguro de que deseas eliminar "${confirmarEliminar.nombre}"? No aparecerá en el listado activo.`}
        textoConfirmar={estaEliminando ? "Eliminando..." : "Eliminar"}
        textoCancelar="Cancelar"
        icono={<BorrarIcono size={40} className="text-red-500" />}
        colorConfirmar="bg-red-600!"
      />

      <ModalMovimiento 
        open={modalMovimientoAbierto}
        onClose={() => setModalMovimientoAbierto(false)}
        articulo={productoSeleccionado}
        tipo="PRODUCTO"
      />

      <ModalProduccion
        open={modalProduccionAbierto}
        onClose={() => setModalProduccionAbierto(false)}
        articulo={productoSeleccionado}
      />

      <ModalDetalleBase 
        open={modalHistorialAbierto} 
        onClose={() => setModalHistorialAbierto(false)} 
      >
        <ModalDetalle 
          title={`Historial: ${productoSeleccionado?.nombre}`} 
          icon={<HistorialIcono size={20} />} 
          onClose={() => setModalHistorialAbierto(false)}
        >
          <ListaMovimientos 
            codigoArticulo={productoSeleccionado?.codigoSecuencial} 
            tipoArticulo="PRODUCTO" 
          />
        </ModalDetalle>
      </ModalDetalleBase>

      <DataTable
        columnas={columnasProductos}
        datos={productos}
        loading={cargando}
        mostrarAcciones={true}
        acciones={accionesProductos({
          handleEliminarClick,
          handleVerDetalle,
          handleEditar,
          handleMovimiento,
          handleProduccion,
          handleVerHistorial,
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
