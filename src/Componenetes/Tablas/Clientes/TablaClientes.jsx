import { useClientes } from "../../../api/hooks/clientes/useClientes";
import TablaReutilizable from "../../UI/TablaReutilizable/TablaReutilizable";
import { columnasClientes } from "./ColumnaCliente";

const TablaClientes = () => {
  const {
    clientes,
    busqueda,
    setBusqueda,
    manejarEditar,
    manejarEliminar,
    tipoFiltro,
    setTipoFiltro,
  } = useClientes();

  return (
    <div className="px-6 py-4 border-0 card no-inset no-ring bg-[var(--fill)] shadow-md rounded-md">
      <TablaReutilizable
        columnas={columnasClientes}
        datos={clientes}
        onEditar={manejarEditar}
        onEliminar={manejarEliminar}
        mostrarAcciones
        botonAgregar={{
          texto: "Agregar cliente",
          ruta: "/panel/contactos/clientes/nuevo",
        }}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Ingrese la persona"
        elementosSuperior={
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="w-auto px-3 h-10 rounded-md text-sm bg-[var(--fill)] border border-[var(--primary)] text-[var(--primary)] shadow-md focus:border-[var(--primary)]"
          >
            <option value="TODOS">Todos</option>
            <option value="COMPRADOR">Compradores</option>
            <option value="ALUMNO">Alumnos</option>
          </select>
        }
      />
    </div>
  );
};

export default TablaClientes;
