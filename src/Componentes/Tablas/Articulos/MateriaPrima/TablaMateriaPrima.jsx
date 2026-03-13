import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMateriaPrimaUI } from "../../../../Backend/Articulos/hooks/MateriaPrima/useMateriaPrimaUI";
import DataTable from "../../../UI/DataTable/DataTable";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import { accionesMateriaPrimas } from "./AccionesMateriaPrima";
import { columnasMateriaPrima } from "./ColumnaMateriaPrima";
import { BorrarIcono, MovimientoIcono, HistorialIcono } from "../../../../assets/Icons";
// import ModalCargaMasivaMovimientos from "../../../Modales/Articulos/ModalCargaMasivaMovimientos";


const TablaMateriaPrima = () => {
  const navigate = useNavigate();
  const {
    materiasPrimas,
    busqueda,
    setBusqueda,
    eliminarMateriaPrima,
    cargando,
    estaEliminando
  } = useMateriaPrimaUI();

  const [confirmarEliminar, setConfirmarEliminar] = useState({
    open: false,
    codigo: null,
    nombre: "",
  });

  // const [modalMasivoOpen, setModalMasivoOpen] = useState(false);


  const handleGestionar = (materiaPrima) => {
    navigate(`/panel/inventario/materia-prima/${materiaPrima.codigoSecuencial}/acciones`, {
      state: { materiaPrima, initialTab: "info" }
    });
  };

  const handleEliminarClick = (codigo, nombre) => {
    setConfirmarEliminar({
      open: true,
      codigo,
      nombre,
    });
  };

  const confirmarEliminacion = async () => {
    try {
      await eliminarMateriaPrima(confirmarEliminar.codigo);
      setConfirmarEliminar({ open: false, codigo: null, nombre: "" });
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="space-y-6">
      <ModalConfirmacion
        open={confirmarEliminar.open}
        onClose={() => setConfirmarEliminar({ open: false, codigo: null, nombre: "" })}
        onConfirm={confirmarEliminacion}
        titulo="Archivar Materia Prima"
        mensaje={`¿Estás seguro de que deseas eliminar "${confirmarEliminar.nombre}"? No aparecerá en el listado activo.`}
        textoConfirmar={estaEliminando ? "Eliminando..." : "Confirmar"}
        textoCancelar="Cancelar"
        icono={<BorrarIcono size={40} className="text-red-500" />}
        colorConfirmar="bg-red-600!"
      />

      <DataTable
        columnas={columnasMateriaPrima}
        datos={materiasPrimas}
        loading={cargando}
        mostrarAcciones={true}
        acciones={accionesMateriaPrimas({
          handleEliminarClick,
          handleGestionar,
        })}
        botonAgregar={{
          texto: "Nueva Materia Prima",
          ruta: "/panel/inventario/materia-prima/nuevo",
        }}
        elementosSuperior={(
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/panel/inventario/ajuste-stock/MATERIA_PRIMA")}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[11px] font-bold text-white uppercase tracking-wider transition-all cursor-pointer"
            >
              <MovimientoIcono size={14} />
              Ajuste de Stock
            </button>
            <button
              onClick={() => navigate("/panel/inventario/historial-stock/MATERIA_PRIMA")}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 rounded-md text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/5 group"
            >
              <HistorialIcono size={14} className="group-hover:scale-110 transition-transform" />
              Historial
            </button>
          </div>
        )}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Filtrar por ingrediente o código..."
      />

      {/* <ModalCargaMasivaMovimientos
        open={modalMasivoOpen}
        onClose={() => setModalMasivoOpen(false)}
        tipo="MATERIA_PRIMA"
      /> */}
    </div>

  );
};

export default TablaMateriaPrima;
