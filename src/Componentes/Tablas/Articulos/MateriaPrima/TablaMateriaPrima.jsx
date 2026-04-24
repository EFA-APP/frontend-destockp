import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../../UI/DataTable/DataTable";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import { accionesMateriaPrimas } from "./AccionesMateriaPrima";
import { columnasMateriaPrima } from "./ColumnaMateriaPrima";
import { BorrarIcono, HistorialIcono } from "../../../../assets/Icons";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import DrawerActualizarStock from "../../../Modales/Articulos/ModalActualizarStock";

const TablaMateriaPrima = () => {
  const navigate = useNavigate();

  // Estados para filtros API y paginación
  const [filtros, setFiltros] = useState({
    pagina: 1,
    limite: 10,
    tipoArticulo: "MATERIA_PRIMA",
  });

  const {
    matrizStock: materiasPrimas,
    busqueda,
    setBusqueda,
    eliminarMateriaPrima,
    cargandoStock: cargando,
    estaEliminando,
    meta,
    dataDepositosRaw,
  } = useDepositoUI(filtros);

  const [confirmarEliminar, setConfirmarEliminar] = useState({
    open: false,
    codigo: null,
    nombre: "",
  });

  const [drawerData, setDrawerData] = useState({
    isOpen: false,
    fila: null,
  });

  const handleAbrirDrawer = useCallback((fila) => {
    setDrawerData({ isOpen: true, fila });
  }, []);

  const cerrarDrawer = useCallback(() => {
    setDrawerData({ isOpen: false, fila: null });
  }, []);

  const handleEditarClick = (materiaPrima) => {
    navigate(
      `/panel/inventario/materia-prima/${materiaPrima.codigoSecuencial}/editar`,
      {
        state: { materiaPrima },
      },
    );
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

  const columnasAMostrar = useMemo(
    () => columnasMateriaPrima(handleAbrirDrawer),
    [handleAbrirDrawer],
  );

  return (
    <div className="space-y-6">
      <ModalConfirmacion
        open={confirmarEliminar.open}
        onClose={() =>
          setConfirmarEliminar({ open: false, codigo: null, nombre: "" })
        }
        onConfirm={confirmarEliminacion}
        titulo="Archivar Materia Prima"
        mensaje={`¿Estás seguro de que deseas eliminar "${confirmarEliminar.nombre}"? No aparecerá en el listado activo.`}
        textoConfirmar={estaEliminando ? "Eliminando..." : "Confirmar"}
        textoCancelar="Cancelar"
        icono={<BorrarIcono size={40} className="text-red-700" />}
        colorConfirmar="bg-red-600!"
      />

      <DataTable
        id_tabla="materiaprima"
        llaveTituloMobile="nombre"
        columnas={columnasAMostrar}
        datos={materiasPrimas}
        loading={cargando}
        meta={meta}
        onPageChange={(pagina) => setFiltros((prev) => ({ ...prev, pagina }))}
        onLimitChange={(limite) =>
          setFiltros((prev) => ({ ...prev, limite, pagina: 1 }))
        }
        mostrarAcciones={true}
        acciones={accionesMateriaPrimas({
          handleEliminarClick,
          handleEditarClick,
        })}
        botonAgregar={{
          texto: "Nueva Materia Prima",
          ruta: "/panel/inventario/materia-prima/nuevo",
          tieneAccion: "CREAR_MATERIAPRIMA",
        }}
        elementosSuperior={
          <div className="flex items-center gap-2">
            <TieneAccion accion="HISTORIAL_MATERIAPRIMA">
              <button
                onClick={() =>
                  navigate("/panel/inventario/historial-stock/MATERIA_PRIMA")
                }
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 rounded-md text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-700/5 group"
              >
                <HistorialIcono
                  size={14}
                  className="group-hover:scale-110 transition-transform"
                />
                Historial
              </button>
            </TieneAccion>
          </div>
        }
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Filtrar por ingrediente o código..."
      />

      <DrawerActualizarStock
        isOpen={drawerData.isOpen}
        onClose={cerrarDrawer}
        fila={drawerData.fila}
        depositosRaw={dataDepositosRaw}
      />
    </div>
  );
};

export default TablaMateriaPrima;
