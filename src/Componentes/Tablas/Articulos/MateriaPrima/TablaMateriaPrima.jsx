import { useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable from "../../../UI/DataTable/DataTable";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import { accionesMateriaPrimas } from "./AccionesMateriaPrima";
import { columnasMateriaPrima } from "./ColumnaMateriaPrima";
import { BorrarIcono, HistorialIcono } from "../../../../assets/Icons";
import { FileSpreadsheet } from "lucide-react";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import DrawerActualizarStock from "../../../Modales/Articulos/ModalActualizarStock";
import ModalCargaMasivaMateriaPrima from "../../../Modales/Articulos/ModalCargaMasivaMateriaPrima";

const TablaMateriaPrima = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const esEspecie = location.pathname.includes("/inventario/especies");
  const baseRoute = esEspecie
    ? "/panel/inventario/especies"
    : "/panel/inventario/materia-prima";
  const labelPlural = esEspecie ? "Especies" : "Materias Primas";
  const labelSingular = esEspecie ? "Especie" : "Materia Prima";

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
    refetch,
  } = useDepositoUI(filtros);

  const [confirmarEliminar, setConfirmarEliminar] = useState({
    open: false,
    codigo: null,
    nombre: "",
  });

  const [modalMasivoOpen, setModalMasivoOpen] = useState(false);

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
    navigate(`${baseRoute}/${materiaPrima.codigo}/editar`, {
      state: { materiaPrima },
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
        titulo={`Archivar ${labelSingular}`}
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
          texto: "Crear",
          ruta: `${baseRoute}/nuevo`,
          tieneAccion: "CREAR_MATERIA_PRIMA",
        }}
        elementosSuperior={
          <div className="flex flex-wrap items-center gap-3">
            <TieneAccion accion="HISTORIAL_MATERIA_PRIMA">
              <button
                onClick={() =>
                  navigate("/panel/inventario/historial-stock/MATERIA_PRIMA")
                }
                className="flex items-center justify-center gap-2 h-9 px-4 bg-white hover:bg-gray-50 border border-[var(--color-neutral-border)] rounded-[8px] text-[13px] font-semibold text-[var(--color-neutral-text-main)] transition-colors cursor-pointer shadow-sm group"
              >
                <HistorialIcono
                  size={16}
                  className="text-[var(--color-neutral-text-muted)] group-hover:text-[var(--color-neutral-text-main)] transition-colors"
                />
                Historial
              </button>
            </TieneAccion>

            <TieneAccion accion="CARGA_MASIVA_MATERIA_PRIMA">
              <button
                onClick={() => setModalMasivoOpen(true)}
                className="flex items-center justify-center gap-2 h-9 px-4 bg-white hover:bg-gray-50 border border-[var(--color-neutral-border)] rounded-[8px] text-[13px] font-semibold text-[var(--color-neutral-text-main)] transition-colors cursor-pointer shadow-sm group"
              >
                <FileSpreadsheet
                  size={16}
                  className="text-[var(--color-neutral-text-muted)] group-hover:text-[var(--color-neutral-text-main)] transition-colors"
                />
                Carga Masiva
              </button>
            </TieneAccion>
          </div>
        }
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador={
          esEspecie
            ? "Filtrar por especie o código..."
            : "Filtrar por ingrediente o código..."
        }
      />

      <ModalCargaMasivaMateriaPrima
        open={modalMasivoOpen}
        onClose={() => setModalMasivoOpen(false)}
        onExito={() => {
          refetch();
        }}
      />

      <TieneAccion accion="EDITAR_STOCK_MANUAL">
        <DrawerActualizarStock
          isOpen={drawerData.isOpen}
          onClose={cerrarDrawer}
          fila={drawerData.fila}
          depositosRaw={dataDepositosRaw}
          tipoArticulo="MATERIA_PRIMA"
        />
      </TieneAccion>
    </div>
  );
};

export default TablaMateriaPrima;
