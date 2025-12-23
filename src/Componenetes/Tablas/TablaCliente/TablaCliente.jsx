import { useClientes } from "../../../api/hooks/clientes/useCliente";
import { AgregarIcono, BuscadorIcono } from "../../../assets/Icons";
import TablaReutilizable from "../../UI/TablaReutilizable/TablaReutilizable";
import { columnasClientes } from "./ColumnaCliente";

const TablaClientes = () => {
  const {
    clientes,
    busqueda,
    setBusqueda,
    tipoFiltro,
    setTipoFiltro,
    manejarAgregar,
    manejarEditar,
    manejarEliminar,
  } = useClientes();

  return (
    <div className="px-6 py-4 border-0 card no-inset no-ring bg-[var(--fill)] shadow-md rounded-md">
      {/* BUSCADOR Y AGREGAR CLIENTE */}
      <div className="flex justify-between items-center mb-4 gap-4">
        {/* AGREGAR CLIENTE */}
        <button
          onClick={() => manejarAgregar("VENTA")}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md! text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer bg-[var(--primary)]! text-white! hover:bg-[var(--primary)]/80! h-10 px-4 shadow-md"
        >
          <AgregarIcono />
          Agregar cliente
        </button>

        <div className="flex items-center gap-3">
          {/* FILTRO TIPO */}
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="h-10 rounded-md text-sm bg-transparent border border-gray-100/10 text-[var(--primary)] shadow-md focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="TODOS">Todos</option>
            <option value="VENTA">Ventas</option>
            <option value="ALUMNO">Alumnos</option>
          </select>

          {/* BUSCADOR */}
          <div className="relative w-[220px]">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="border-[.5px]! border-gray-100/10! flex h-10 rounded-md! disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-0 placeholder:text-gray-100/50! focus-visible:ring-0 z-10 w-full pl-8 placeholder:text-xs text-[var(--primary)]! focus:outline-none focus:border-2 focus:border-[var(--primary)]! shadow-md"
              placeholder="Buscar cliente"
            />
            <div className="absolute top-2 left-2">
              <BuscadorIcono />
            </div>
          </div>
        </div>
      </div>

      {/* TABLA CLIENTES */}
      <TablaReutilizable
        columnas={columnasClientes}
        datos={clientes}
        onEditar={manejarEditar}
        onEliminar={manejarEliminar}
        mostrarAcciones
      />
    </div>
  );
};

export default TablaClientes;
