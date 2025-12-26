import { useProveedores } from "../../../api/hooks/Proveedores/useProveedores";
import TablaReutilizable from "../../UI/TablaReutilizable/TablaReutilizable";
import { columnasProveedores } from "./ColumnaProveedores";

const TablaProveedores = () => {
  const { proveedores, manejarEditar, manejarEliminar, busqueda, setBusqueda } =
    useProveedores();
  return (
    <div className="px-6 py-4 border-0 card no-inset no-ring bg-[var(--fill)]! shadow-md rounded-md">
      <TablaReutilizable
        columnas={columnasProveedores}
        datos={proveedores}
        onEditar={manejarEditar}
        onEliminar={manejarEliminar}
        mostrarAcciones
        botonAgregar={{
          texto: "Agregar Proveedores",
          ruta: "/panel/contactos/proveedores/nuevo",
        }}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Ingrese un proveedor"
      />
    </div>
  );
};

export default TablaProveedores;
