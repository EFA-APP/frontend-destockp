import { useState } from "react";
import { useProveedores } from "../../../../api/hooks/Proveedores/useProveedores";
import proveedorConfig from "../../../Modales/Contactos/ConfigProveedores";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import TablaReutilizable from "../../../UI/TablaReutilizable/TablaReutilizable";
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
    <div className="px-6 py-4 border-0 card no-inset no-ring bg-[var(--fill)]! shadow-md rounded-md">
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
        width="w-[420px]"
      />
      <TablaReutilizable
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
    </div>
  );
};

export default TablaProveedores;
