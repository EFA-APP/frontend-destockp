import { useState } from "react";
import { useMateriaPrima } from "../../../api/hooks/MateriaPrima/useMateriaPrima";
import materiaPrimaConfig from "../../Modales/Articulos/ConfigMateriaPrima";
import ModalDetalleGenerico from "../../UI/ModalDetalleBase/ModalDetalleGenerico";
import TablaReutilizable from "../../UI/TablaReutilizable/TablaReutilizable";
import TarjetaInformacion from "../../UI/TarjetaInformacion/TarjetaInformacion";
import { accionesMateriaPrimas } from "./Acciones";
import { columnasMateriaPrima } from "./ColumnaMateriaPrima";

const TablaMateriaPrima = () => {
  const {
    materiaPrima,
    busqueda,
    setBusqueda,
    manejarEditar,
    manejarEliminar,
  } = useMateriaPrima();


    const [modalAbierto, setModalAbierto] = useState(false);
    const [materiaPrimaSeleccionada, setMateriaPrimaSeleccionada] = useState(null);
    const [modoModal, setModoModal] = useState("view");
  
    const handleVerDetalle = (materiaPrima) => {
      setMateriaPrimaSeleccionada(materiaPrima);
      setModoModal("vista");
      setModalAbierto(true);
    };
  
    const handleEditar = (materiaPrima) => {
      setMateriaPrimaSeleccionada(materiaPrima);
      setModoModal("editar");
      setModalAbierto(true);
    };

  return (
    <div className="space-y-4">
      <ModalDetalleGenerico
        mode={modoModal}
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={(dataEditada) => {
          manejarEditar(dataEditada);
          setModalAbierto(false);
        }}
        data={materiaPrimaSeleccionada}
        {...materiaPrimaConfig}
        width="w-[420px]"

      />
      {/* Card con información del inventario */}
      <div className="grid grid-cols-2 gap-4">
        <TarjetaInformacion
          titulo={"Items en Stock"}
          numero={materiaPrima.length}
          color={"text-green-400"}
        />
        <TarjetaInformacion
          titulo={"Stock Bajo"}
          numero={
            materiaPrima.filter(
              (item) =>
                (item.unidad === "kg" && item.stock < 20) ||
                (item.unidad === "unidades" && item.stock < 100)
            ).length
          }
          color={"text-red-400"}
        />
      </div>

      {/* Tabla principal */}
      <div className="px-6 py-4 border-0 card no-inset no-ring bg-[var(--fill)] shadow-md rounded-md">
        <TablaReutilizable
          columnas={columnasMateriaPrima}
          datos={materiaPrima}
          mostrarAcciones={true}
          acciones={accionesMateriaPrimas({manejarEliminar, handleVerDetalle,  handleEditar})}
          botonAgregar={{
            texto: "Agregar materia prima",
            ruta: "/panel/inventario/materia-prima/nuevo",
          }}
          mostrarBuscador={true}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          placeholderBuscador="Buscar ingrediente o código..."
        />
      </div>
    </div>
  );
};

export default TablaMateriaPrima;
