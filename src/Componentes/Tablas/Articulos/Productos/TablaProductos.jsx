import { useState } from "react";
import { useProductos } from "../../../../api/hooks/Productos/useProductos";
import DataTable from "../../../UI/DataTable/DataTable";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import productoConfig from "../../../Modales/Articulos/ConfigProducto";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import { columnasProductos } from "./ColumnaProductos";
import { accionesProductos } from "./AccionesProductos";
import { AdvertenciaIcono, ArcaIcono, CanastaIcono } from "../../../../assets/Icons";

const TablaProductos = () => {
  const { productos, busqueda, setBusqueda, manejarEditar, manejarEliminar } =
    useProductos();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modoModal, setModoModal] = useState("view");

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

  // Calcular estadísticas
  const valorTotalInventario = productos.reduce(
    (total, item) => total + item.precioTotal,
    0,
  );

  const totalFrascos = productos.reduce((total, item) => total + item.stock, 0);
  const totalPaquetes = productos.reduce((total, item) => total + item.paquetes, 0);
  const stockBajoCount = productos.filter((item) => item.stock < 20).length;

  return (
    <div className="space-y-6">
      {/* Modal Producto */}
      <ModalDetalleGenerico
        mode={modoModal}
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={(dataEditada) => {
          manejarEditar(dataEditada);
          setModalAbierto(false);
        }}
        data={productoSeleccionado}
        {...productoConfig}
        width="w-[420px]"
      />

      {/* Cards con información del inventario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TarjetaInformacion
          titulo="Total Stock"
          color="text-[var(--primary)]"
          numero={totalFrascos}
          descripcion={`${totalPaquetes} paquetes cerrados`}
          icono={<CanastaIcono size={20} />}
        />

        <TarjetaInformacion
          titulo="Valor Estimado"
          color="text-green-500"
          valorMoneda={true}
          numero={valorTotalInventario}
          descripcion="Precio de lista acumulado"
          icono={<ArcaIcono size={20} />}
        />

        <TarjetaInformacion
          titulo="Puntos Críticos"
          color={stockBajoCount > 0 ? "text-red-500" : "text-[var(--text-muted)]"}
          numero={stockBajoCount}
          descripcion="Productos bajo stock mínimo"
          icono={<AdvertenciaIcono size={20} />}
        />
      </div>

      {/* Tabla principal */}
      <DataTable
        columnas={columnasProductos}
        datos={productos}
        mostrarAcciones={true}
        acciones={accionesProductos({
          manejarEliminar,
          handleVerDetalle,
          handleEditar,
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
