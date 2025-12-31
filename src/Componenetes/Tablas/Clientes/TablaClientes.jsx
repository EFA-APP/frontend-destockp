import { useClientes } from "../../../api/hooks/clientes/useClientes";
import Select from "../../UI/Select/Select";
import TablaReutilizable from "../../UI/TablaReutilizable/TablaReutilizable";
import { columnasClientes } from "./ColumnaCliente";

const TablaClientes = () => {
  const {
    clientes,
    busqueda,
    setBusqueda,
    manejarDetalle,
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
        onVer={manejarDetalle}
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
        mostrarFiltros={true}
        textoFiltros="Filtros avanzados"
        filtrosAbiertosInicial={true}
        filtrosElementos={
          <Select
            valor={tipoFiltro}
            label={"Tipo:"}
            setValor={setTipoFiltro}
            options={[
              {
                valor: "TODOS",
                texto: "Todos",
              },
              {
                valor: "COMPRADOR",
                texto: "Compradores",
              },
              {
                valor: "ALUMNO",
                texto: "Alumnos",
              },
            ]}
          />
        }
      />
    </div>
  );
};

export default TablaClientes;
