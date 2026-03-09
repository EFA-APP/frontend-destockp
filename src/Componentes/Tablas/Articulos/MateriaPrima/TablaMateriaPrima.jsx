import { useState } from "react";
import { useMateriaPrimaUI } from "../../../../Backend/Articulos/hooks/MateriaPrima/useMateriaPrimaUI";
import materiaPrimaConfig from "../../../Modales/Articulos/ConfigMateriaPrima";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import DataTable from "../../../UI/DataTable/DataTable";
import { accionesMateriaPrimas } from "./AccionesMateriaPrima";
import { columnasMateriaPrima } from "./ColumnaMateriaPrima";

import { BorrarIcono, HistorialIcono } from "../../../../assets/Icons";
import ListaMovimientos from "../../../UI/ListaMovimientos/ListaMovimientos";
import ModalMovimiento from "../../../Modales/Articulos/ModalMovimiento";
import ModalDetalleBase from "../../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../../UI/ModalDetalleBase/ModalDetalle";

const TablaMateriaPrima = () => {
  const {
    materiasPrimas,
    busqueda,
    setBusqueda,
    actualizarMateriaPrima,
    eliminarMateriaPrima,
    cargando,
    estaEliminando
  } = useMateriaPrimaUI();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalMovimientoAbierto, setModalMovimientoAbierto] = useState(false);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [materiaPrimaSeleccionada, setMateriaPrimaSeleccionada] = useState(null);
  const [modoModal, setModoModal] = useState("view");
  
  // Estado para la confirmación de eliminación
  const [confirmarEliminar, setConfirmarEliminar] = useState({
    open: false,
    codigoSecuencial: null,
    nombre: "",
  });

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

  const handleMovimiento = (materiaPrima) => {
    setMateriaPrimaSeleccionada(materiaPrima);
    setModalMovimientoAbierto(true);
  };

  const handleVerHistorial = (materiaPrima) => {
    setMateriaPrimaSeleccionada(materiaPrima);
    setModalHistorialAbierto(true);
  };

  const handleEliminarClick = (codigoSecuencial, nombre) => {
    console.log(codigoSecuencial, nombre)
    setConfirmarEliminar({
      open: true,
      codigoSecuencial,
      nombre: nombre,
    });
  };

  const confirmarEliminacion = async () => {
    try {
      await eliminarMateriaPrima(confirmarEliminar.codigoSecuencial);
      setConfirmarEliminar({ open: false, id: null });
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="space-y-6">
      <ModalDetalleGenerico
        mode={modoModal}
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={async (dataEditada) => {
          const { 
            codigoSecuencial, 
            codigoEmpresa, 
            createdAt, 
            updatedAt, 
            id,
            ...payload 
          } = dataEditada;

          if (payload.stock !== undefined) payload.stock = parseFloat(payload.stock) || 0;
          if (payload.cantidadPorPaquete !== undefined) {
             payload.cantidadPorPaquete = payload.cantidadPorPaquete ? parseFloat(payload.cantidadPorPaquete) : null;
          }

          await actualizarMateriaPrima(materiaPrimaSeleccionada.codigoSecuencial, payload);
          setModalAbierto(false);
        }}
        data={materiaPrimaSeleccionada}
        {...materiaPrimaConfig}
      />
        

      {/* Modal de Confirmación de Eliminación Premium */}
      <ModalConfirmacion
        open={confirmarEliminar.open}
        onClose={() => setConfirmarEliminar({ open: false, id: null })}
        onConfirm={confirmarEliminacion}
        titulo="Archivar Materia Prima"
        mensaje={`¿Estás seguro de que deseas eliminar? El ítem ya no aparecerá en el listado activo.`}
        textoConfirmar={estaEliminando ? "Eliminando..." : "Confirmar"}
        textoCancelar="Cancelar"
        icono={<BorrarIcono size={40} className="text-red-500" />}
        colorConfirmar="bg-red-600!"
      />

      <ModalMovimiento 
        open={modalMovimientoAbierto}
        onClose={() => setModalMovimientoAbierto(false)}
        articulo={materiaPrimaSeleccionada}
        tipo="MATERIA_PRIMA"
      />

      <ModalDetalleBase 
        open={modalHistorialAbierto} 
        onClose={() => setModalHistorialAbierto(false)} 
      >
        <ModalDetalle 
          title={`Historial: ${materiaPrimaSeleccionada?.nombre}`} 
          icon={<HistorialIcono size={20} />} 
          onClose={() => setModalHistorialAbierto(false)}
        >
          <ListaMovimientos 
            codigoArticulo={materiaPrimaSeleccionada?.codigoSecuencial} 
            tipoArticulo="MATERIA_PRIMA" 
          />
        </ModalDetalle>
      </ModalDetalleBase>

      <DataTable
        columnas={columnasMateriaPrima}
        datos={materiasPrimas}
        loading={cargando}
        mostrarAcciones={true}
        acciones={accionesMateriaPrimas({
          handleEliminarClick,
          handleVerDetalle,
          handleEditar,
          handleMovimiento,
          handleVerHistorial,
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
