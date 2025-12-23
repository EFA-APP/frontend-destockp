import { useInventario } from "../../../api/hooks/Inventario/useInventario";
import { AgregarIcono, BuscadorIcono } from "../../../assets/Icons";
import TablaReutilizable from "../../UI/TablaReutilizable/TablaReutilizable";
import { columnasInventario } from "./ColumnaInventario";

const TablaInventario = () => {
  const {
    productos,
    busqueda,
    setBusqueda,
    manejarEditar,
    manejarEliminar,
    manejarAgregar,
  } = useInventario();

  return (
    <div className="px-6 py-4 border-0 card no-inset no-ring bg-[var(--fill)] shadow-md rounded-md">
      {/* BUSCADOR Y AGREGAR PRODUCTO */}
      <div className="flex justify-between items-center mb-4 gap-4">
        {/* AGREGAR ARTICULO */}
        <button
          onClick={manejarAgregar}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md! text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer bg-[var(--primary)]! text-white! hover:bg-[var(--primary)]/80! h-10 px-4 shadow-md"
        >
          <span>
            <AgregarIcono />
          </span>
          Agregar producto
        </button>

        {/* BUSCADOR */}
        <div className="relative w-[220px]">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border-[.5px]! border-gray-100/10! flex h-10 rounded-md! disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-0 border-ld placeholder:text-gray-100/50! focus-visible:ring-0 z-10 w-full pl-8 placeholder:text-xs text-[var(--primary)]! focus:outline-none focus:border-2 focus:border-[var(--primary)]! shadow-md"
            placeholder="Ingrese el producto a buscar"
          />
          <div className="absolute top-2 left-2">
            <BuscadorIcono />
          </div>
        </div>
      </div>

      {/* TABLA PRODUCTOS */}
      <TablaReutilizable
        columnas={columnasInventario}
        datos={productos}
        onEditar={manejarEditar}
        onEliminar={manejarEliminar}
        mostrarAcciones={true}
      />
    </div>
  );
};

export default TablaInventario;
