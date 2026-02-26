import { useState } from "react";
import { useMateriaPrima } from "../../../../Backend/hooks/MateriaPrima/useMateriaPrima";
import materiaPrimaConfig from "../../../Modales/Articulos/ConfigMateriaPrima";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import DataTable from "../../../UI/DataTable/DataTable";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import { accionesMateriaPrimas } from "./AccionesMateriaPrima";
import { columnasMateriaPrima } from "./ColumnaMateriaPrima";

import { InventarioIcono, AdvertenciaIcono } from "../../../../assets/Icons";

const TablaMateriaPrima = () => {
  const {
    materiaPrima,
    busqueda,
    setBusqueda,
    manejarEditar,
    manejarEliminar,
  } = useMateriaPrima();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [materiaPrimaSeleccionada, setMateriaPrimaSeleccionada] =
    useState(null);
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

  const stockBajoCount = materiaPrima.filter(
    (item) =>
      (item.unidad === "kg" && item.stock < 20) ||
      (item.unidad === "unidades" && item.stock < 100),
  ).length;

  return (
    <div className="space-y-6">
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

      {/* Cards con información del inventario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TarjetaInformacion
          titulo="Total Insumos"
          numero={materiaPrima.length}
          color="text-[var(--primary)]"
          descripcion="Categorías de materia prima registradas"
          icono={<InventarioIcono size={20} />}
        />
        <TarjetaInformacion
          titulo="Alertas de Stock"
          numero={stockBajoCount}
          color={stockBajoCount > 0 ? "text-red-500" : "text-[var(--text-muted)]"}
          descripcion="Insumos por debajo del stock de seguridad"
          icono={<AdvertenciaIcono size={20} />}
        />
      </div>

      {/* Tabla principal */}
      <DataTable
        columnas={columnasMateriaPrima}
        datos={materiaPrima}
        mostrarAcciones={true}
        acciones={accionesMateriaPrimas({
          manejarEliminar,
          handleVerDetalle,
          handleEditar,
        })}
        botonAgregar={{
          texto: "Nueva Materia Prima",
          ruta: "/panel/inventario/materia-prima/nuevo",
        }}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Filtrar por ingrediente o código..."
      />
    </div>
  );
};

export default TablaMateriaPrima;
