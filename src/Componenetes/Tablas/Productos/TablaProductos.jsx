import { useProductos } from "../../../api/hooks/Productos/useProductos";
import TablaReutilizable from "../../UI/TablaReutilizable/TablaReutilizable";
import { columnasProductos } from "./ColumnaProductos";

const TablaProductos = () => {
  const { productos, busqueda, setBusqueda, manejarEditar, manejarEliminar } =
    useProductos();

  // Calcular estadísticas
  const valorTotalInventario = productos.reduce(
    (total, item) => total + item.precioTotal,
    0
  );

  const totalFrascos = productos.reduce((total, item) => total + item.stock, 0);

  const totalPaquetes = productos.reduce(
    (total, item) => total + item.paquetes,
    0
  );

  const pesoTotalKg = productos.reduce(
    (total, item) => total + item.pesoTotal,
    0
  );

  return (
    <div className="space-y-4">
      {/* Cards con información del inventario */}
      <div className="grid grid-cols-3 gap-4">
        <div className="px-6 py-4 bg-[var(--fill)] shadow-md rounded-md border border-gray-100/10">
          <div className="text-gray-100/50 text-sm">Total Frascos</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            {totalFrascos}
          </div>
          <div className="text-xs text-gray-100/50 mt-1">
            {totalPaquetes} paquetes
          </div>
        </div>

        <div className="px-6 py-4 bg-[var(--fill)] shadow-md rounded-md border border-gray-100/10">
          <div className="text-gray-100/50 text-sm">Valor Inventario</div>
          <div className="text-2xl font-bold text-green-400 mt-1">
            ${valorTotalInventario.toLocaleString("es-AR")}
          </div>
        </div>

        <div className="px-6 py-4 bg-[var(--fill)] shadow-md rounded-md border border-gray-100/10">
          <div className="text-gray-100/50 text-sm">Stock Bajo</div>
          <div className="text-2xl font-bold text-red-400 mt-1">
            {productos.filter((item) => item.stock < 20).length}
          </div>
          <div className="text-xs text-gray-100/50 mt-1">productos</div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="px-6 py-4 border-0 card no-inset no-ring bg-[var(--fill)] shadow-md rounded-md">
        <TablaReutilizable
          columnas={columnasProductos}
          datos={productos}
          onEditar={manejarEditar}
          onEliminar={manejarEliminar}
          mostrarAcciones={true}
          botonAgregar={{
            texto: "Agregar producto",
            ruta: "/panel/inventario/productos/nuevo",
          }}
          mostrarBuscador={true}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          placeholderBuscador="Buscar mermelada, código o sabor..."
        />
      </div>
    </div>
  );
};

export default TablaProductos;
