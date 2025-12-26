import { useMateriaPrima } from "../../../api/hooks/MateriaPrima/useMateriaPrima";
import TablaReutilizable from "../../UI/TablaReutilizable/TablaReutilizable";
import { columnasMateriaPrima } from "./ColumnaMateriaPrima";

const TablaMateriaPrima = () => {
  const {
    materiaPrima,
    busqueda,
    setBusqueda,
    manejarEditar,
    manejarEliminar,
  } = useMateriaPrima();

  // Calcular valor total del inventario
  const valorTotalInventario = materiaPrima.reduce(
    (total, item) => total + item.precioTotal,
    0
  );

  return (
    <div className="space-y-4">
      {/* Card con información del inventario */}
      <div className="grid grid-cols-3 gap-4">
        <div className="px-6 py-4 bg-[var(--fill)] shadow-md rounded-md border border-gray-100/10">
          <div className="text-gray-100/50 text-sm">Items en Stock</div>
          <div className="text-2xl font-bold text-white mt-1">
            {materiaPrima.length}
          </div>
        </div>

        <div className="px-6 py-4 bg-[var(--fill)] shadow-md rounded-md border border-gray-100/10">
          <div className="text-gray-100/50 text-sm">Valor Total</div>
          <div className="text-2xl font-bold text-green-400 mt-1">
            $
            {valorTotalInventario.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>

        <div className="px-6 py-4 bg-[var(--fill)] shadow-md rounded-md border border-gray-100/10">
          <div className="text-gray-100/50 text-sm">Stock Bajo</div>
          <div className="text-2xl font-bold text-red-400 mt-1">
            {
              materiaPrima.filter(
                (item) =>
                  (item.unidad === "kg" && item.stock < 20) ||
                  (item.unidad === "unidades" && item.stock < 100)
              ).length
            }
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="px-6 py-4 border-0 card no-inset no-ring bg-[var(--fill)] shadow-md rounded-md">
        <TablaReutilizable
          columnas={columnasMateriaPrima}
          datos={materiaPrima}
          onEditar={manejarEditar}
          onEliminar={manejarEliminar}
          mostrarAcciones={true}
          botonAgregar={{
            texto: "Agregar materia prima",
            ruta: "/panel/inventario/materia-prima/nuevo",
          }}
          mostrarBuscador={true}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          placeholderBuscador="Buscar ingrediente o código..."
        />
      </div>
    </div>
  );
};

export default TablaMateriaPrima;
