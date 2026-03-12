import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMateriaPrimaUI } from "../../../../Backend/Articulos/hooks/MateriaPrima/useMateriaPrimaUI";
import DataTable from "../../../UI/DataTable/DataTable";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import { accionesMateriaPrimas } from "./AccionesMateriaPrima";
import { columnasMateriaPrima } from "./ColumnaMateriaPrima";
import { BorrarIcono } from "../../../../assets/Icons";

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
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Filtrar por ingrediente o código..."
      />
    </div>
  );
};

export default TablaMateriaPrima;
