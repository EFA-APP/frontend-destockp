import { useProductos } from "../../../api/hooks/Productos/useProductos";
import TablaReutilizable from "../../UI/TablaReutilizable/TablaReutilizable";
import TarjetaInformacion from "../../UI/TarjetaInformacion/TarjetaInformacion";
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
        <TarjetaInformacion
          titulo={"Total Frascos"}
          color={"text-blue-400"}
          numero={totalPaquetes}
          descripcion={`${totalPaquetes} paquetes`}
        />

        <TarjetaInformacion
          titulo={"Valor Inventario"}
          color={"text-green-400"}
          valorMoneda={true}
          numero={valorTotalInventario}
        />

        <TarjetaInformacion
          titulo={"Stock Bajo"}
          color={"text-red-400"}
          numero={productos.filter((item) => item.stock < 20).length}
          descripcion={"productos"}
        />
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
