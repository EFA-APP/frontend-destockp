import React from "react";
import DataTable from "../../../UI/DataTable/DataTable";
import { CargandoIcono } from "../../../../assets/Icons";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import { generarColumnasStock } from "./ColumnasDepositoStock";
import { Package, Search, Database, ChevronRight } from "lucide-react";
import SkeletonFilaTabla from "../../../UI/Skeletons/SkeletonFilaTabla.jsx";

import DrawerActualizarStock from "../../../Modales/Articulos/ModalActualizarStock";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
/**
 * Componente TablaDepositoStock: Visualización de la matriz de stock global.
 */
const TablaDepositoStock = ({ tipoArticulo = "PRODUCTO", titulo }) => {
  const [filtros, setFiltros] = React.useState({ pagina: 1, limite: 10 });
  const [busquedaInput, setBusquedaInput] = React.useState("");
  const [busquedaClave, setBusquedaClave] = React.useState("nombre"); // 'nombre' o 'codigo'

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros((prev) => {
        const nuevos = { ...prev, pagina: 1 }; // Resetear página con nueva búsqueda
        delete nuevos.buscarPorNombre;
        delete nuevos.buscarPorCodigo;

        if (busquedaInput) {
          if (busquedaClave === "nombre") {
            nuevos.buscarPorNombre = busquedaInput;
          }
          if (busquedaClave === "codigo") {
            const num = Number(busquedaInput);
            if (!isNaN(num)) nuevos.buscarPorCodigo = num;
          }
        }
        return nuevos;
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaInput, busquedaClave]);

  const { matrizStock, dataDepositosRaw, cargandoStock, meta } = useDepositoUI({
    ...filtros,
    tipoArticulo,
  });

  const [drawerData, setDrawerData] = React.useState({
    isOpen: false,
    fila: null,
    depositoInicial: null,
  });

  const handleAbrirDrawer = (fila, depositoId = null) => {
    setDrawerData({ isOpen: true, fila, depositoInicial: depositoId });
  };

  const cerrarDrawer = () => {
    setDrawerData({ isOpen: false, fila: null, depositoInicial: null });
  };

  const matrizConAcciones = React.useMemo(
    () =>
      matrizStock.map((fila) => ({
        ...fila,
        onActualizarStock: handleAbrirDrawer,
      })),
    [matrizStock],
  );

  const columnasStock = React.useMemo(
    () => generarColumnasStock(dataDepositosRaw, busquedaInput),
    [dataDepositosRaw, busquedaInput],
  );

  return (
    <React.Fragment>
      <div className="bg-white border border-[var(--color-neutral-border)] rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Table Header */}
        <div className="px-4 pb-0 md:px-6 pt-5 border-b border-[var(--color-neutral-border)] bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[var(--color-brand-soft)] rounded-[10px] border border-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)]">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[var(--color-neutral-text-main)] leading-tight uppercase tracking-wide">
                {titulo ||
                  `${tipoArticulo === "MATERIA_PRIMA" ? "Materia Prima" : "Productos"}`}
              </h2>
            </div>
          </div>

          {/* Buscador integrado en DataTable */}
        </div>

        <div className="p-2">
          {/* Desktop View: DataTable */}
          <div className="block">
            <DataTable
              id_tabla={`stock_deposito_${tipoArticulo.toLowerCase()}`}
              columnas={columnasStock}
              datos={matrizConAcciones}
              mostrarBuscador={true}
              busqueda={busquedaInput}
              setBusqueda={setBusquedaInput}
              opcionesBusqueda={[
                { label: "Por Nombre", value: "nombre" },
                { label: "Por Código", value: "codigo" },
              ]}
              busquedaClave={busquedaClave}
              setBusquedaClave={setBusquedaClave}
              placeholderBuscador="Escribe para buscar..."
              mostrarAcciones={false}
              className="border-none shadow-none"
              loading={cargandoStock}
              meta={meta}
              onPageChange={(p) =>
                setFiltros((prev) => ({ ...prev, pagina: p }))
              }
              onLimitChange={(l) =>
                setFiltros((prev) => ({ ...prev, limite: l, pagina: 1 }))
              }
              todasExpandidas={!!busquedaInput}
            />
          </div>
        </div>
      </div>

      <TieneAccion accion="EDITAR_STOCK_MANUAL">
        <DrawerActualizarStock
          isOpen={drawerData.isOpen}
          onClose={cerrarDrawer}
          fila={drawerData.fila}
          depositosRaw={dataDepositosRaw}
          depositoInicial={drawerData.depositoInicial}
          tipoArticulo={tipoArticulo}
        />
      </TieneAccion>
    </React.Fragment>
  );
};

export default TablaDepositoStock;
