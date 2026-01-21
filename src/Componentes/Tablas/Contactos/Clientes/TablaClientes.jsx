import { useState } from "react";
import { useClientes } from "../../../../api/hooks/clientes/useClientes";
import clienteConfig from "../../../Modales/Contactos/ConfigClientes";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import TablaReutilizable from "../../../UI/TablaReutilizable/TablaReutilizable";
import { accionesClientes } from "./Acciones";
import { columnasClientes } from "./ColumnaCliente";

const TablaClientes = () => {
  const {
    clientes,
    busqueda,
    setBusqueda,
    manejarEditar,
    manejarEliminar,
  } = useClientes();

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
    <div className="px-6 py-4 border-0 card no-inset no-ring bg-[var(--fill)] shadow-md rounded-md">
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
        width="w-[420px]"

      />
      <TablaReutilizable
        columnas={columnasClientes}
        datos={clientes}
        mostrarAcciones={true}
        acciones={accionesClientes({manejarEliminar, handleEditar, handleVerDetalle})}
        botonAgregar={{
          texto: "Agregar cliente",
          ruta: "/panel/contactos/clientes/nuevo",
        }}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Ingrese la persona"
      />
    </div>
  );
};

export default TablaClientes;
