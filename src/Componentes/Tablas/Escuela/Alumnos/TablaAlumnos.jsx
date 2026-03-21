import { useAlumnos } from "../../../../Backend/hooks/Escuela/Alumnos/useAlumnos";
import DataTable from "../../../UI/DataTable/DataTable";
import { columnasAlumnos } from "./ColumnaAlumnos";

const TablaAlumnos = () => {
  const {
    alumnos,
    busqueda,
    setBusqueda,
    manejarDetalle,
    manejarEditar,
    manejarEliminar,
  } = useAlumnos();

  return (
    <>
      <DataTable id_tabla="alumnos"
        columnas={columnasAlumnos}
        datos={alumnos}
        onVer={manejarDetalle}
        onEditar={manejarEditar}
        onEliminar={manejarEliminar}
        mostrarAcciones
        botonAgregar={{
          texto: "Agregar alumno",
          ruta: "/panel/escuela/alumnos/nuevo",
        }}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Ingrese el alumno"
      />
    </>
  );
};

export default TablaAlumnos;
