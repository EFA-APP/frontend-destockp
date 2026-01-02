import { useAlumnos } from "../../../../api/hooks/Escuela/Alumnos/useAlumnos";
import TablaReutilizable from "../../../UI/TablaReutilizable/TablaReutilizable";
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
    <div className="px-6 py-4 border-0 card no-inset no-ring bg-[var(--fill)] shadow-md rounded-md">
      <TablaReutilizable
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
    </div>
  );
};

export default TablaAlumnos;
