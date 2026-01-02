import { useMateriaPrima } from "../../../api/hooks/MateriaPrima/useMateriaPrima";
import TablaReutilizable from "../../UI/TablaReutilizable/TablaReutilizable";
import TarjetaInformacion from "../../UI/TarjetaInformacion/TarjetaInformacion";
import { columnasMateriaPrima } from "./ColumnaMateriaPrima";

const TablaMateriaPrima = () => {
  const {
    materiaPrima,
    busqueda,
    setBusqueda,
    manejarDetalle,
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
      <div className="grid grid-cols-2 gap-4">
        <TarjetaInformacion
          titulo={"Items en Stock"}
          numero={materiaPrima.length}
          color={"text-green-400"}
        />
        <TarjetaInformacion
          titulo={"Stock Bajo"}
          numero={
            materiaPrima.filter(
              (item) =>
                (item.unidad === "kg" && item.stock < 20) ||
                (item.unidad === "unidades" && item.stock < 100)
            ).length
          }
          color={"text-red-400"}
        />
      </div>

      {/* Tabla principal */}
      <div className="px-6 py-4 border-0 card no-inset no-ring bg-[var(--fill)] shadow-md rounded-md">
        <TablaReutilizable
          columnas={columnasMateriaPrima}
          datos={materiaPrima}
          onVer={manejarDetalle}
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
