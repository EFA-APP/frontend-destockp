import { useState } from "react";
import { useProveedores } from "../../../../Backend/hooks/Proveedores/useProveedores";
import proveedorConfig from "../../../Modales/Contactos/ConfigProveedores";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import DataTable from "../../../UI/DataTable/DataTable";
import { accionesProveedor } from "./AccionesProveedores";
import { columnasProveedores } from "./ColumnaProveedores";

const TablaProveedores = () => {
  const {
    proveedores,
    manejarDetalle,
    manejarEditar,
    manejarEliminar,
    busqueda,
    setBusqueda,
  } = useProveedores();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [modoModal, setModoModal] = useState("view");

  const handleVerDetalle = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModoModal("vista");
    setModalAbierto(true);
  };

  const handleEditar = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModoModal("editar");
    setModalAbierto(true);
  };
  return (
    <>
      <ModalDetalleGenerico
        mode={modoModal}
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={(dataEditada) => {
          manejarEditar(dataEditada);
          setModalAbierto(false);
        }}
        data={proveedorSeleccionado}
        {...proveedorConfig}
      />
      <DataTable
        columnas={columnasProveedores}
        datos={proveedores}
        acciones={accionesProveedor({
          manejarEliminar,
          handleEditar,
          handleVerDetalle,
        })}
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
    </>
  );
};

export default TablaProveedores;
