import { useState } from "react";
import { useClientes } from "../../../../Backend/hooks/Clientes/useClientes";
import clienteConfig from "../../../Modales/Contactos/ConfigClientes";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import DataTable from "../../../UI/DataTable/DataTable";
import { accionesClientes } from "./AccionesClientes";
import { columnasClientes } from "./ColumnaCliente";

const TablaClientes = () => {
  const { clientes, busqueda, setBusqueda, manejarEditar, manejarEliminar } =
    useClientes();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [modoModal, setModoModal] = useState("view");

  const handleVerDetalle = (cliente) => {
    setClienteSeleccionado(cliente);
    setModoModal("vista");
    setModalAbierto(true);
  };

  const handleEditar = (cliente) => {
    setClienteSeleccionado(cliente);
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
        data={clienteSeleccionado}
        {...clienteConfig}
      />
      <DataTable
        columnas={columnasClientes}
        datos={clientes}
        mostrarAcciones={true}
        acciones={accionesClientes({
          manejarEliminar,
          handleEditar,
          handleVerDetalle,
        })}
        botonAgregar={{
          texto: "Agregar cliente",
          ruta: "/panel/contactos/clientes/nuevo",
        }}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Ingrese la persona"
      />
    </>
  );
};

export default TablaClientes;
