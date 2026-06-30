import { useState, useMemo } from "react";
import { usePlanDeCuentas } from "../../../../Backend/hooks/Contabilidad/PlanDeCuenta/usePlanDeCuentas";
import Select from "../../../UI/Select/Select";
import DataTable from "../../../UI/DataTable/DataTable";
import { getColumnasPlanDeCuentas } from "./columnaPlanDeCuentas";
import ModalImportarPlan from "../../../Modales/Contabilidad/ModalImportarPlan";
import { FileDown, Plus } from "lucide-react";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import { useEmpresas } from "../../../../Backend/Autenticacion/queries/Empresa/useEmpresas.query";

const TablaPlanDeCuentas = () => {
  const {
    cuentas,
    isLoading,
    busqueda,
    setBusqueda,
    tipo,
    setTipo,
    manejarEditar,
    manejarEliminar,
  } = usePlanDeCuentas();

  const [isModalImportarOpen, setIsModalImportarOpen] = useState(false);
  const { data: empresas = [] } = useEmpresas();

  const empresasMap = useMemo(() => {
    const map = new Map();
    (empresas || []).forEach((emp) => {
      map.set(emp.codigo, emp.razonSocial || emp.nombre);
    });
    return map;
  }, [empresas]);

  const columnas = useMemo(
    () => getColumnasPlanDeCuentas(empresasMap),
    [empresasMap]
  );

  return (
    <>
      <DataTable
        id_tabla="plandecuentas"
        columnas={columnas}
        mostrarAcciones={false}
        datos={cuentas}
        loading={isLoading}
        /* 🔑 CLAVE PARA EL DESPLIEGUE */
        getChildren={(fila) => [{ key: "children", data: fila.children || [] }]}
        mostrarBuscador
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        onEditar={manejarEditar}
        onEliminar={manejarEliminar}
        placeholderBuscador="Buscar por código o cuenta..."
        mostrarFiltros={false}
        botonAgregar={{
          texto: "Crear",
          ruta: "/panel/contabilidad/cuentas/nueva",
          tieneAccion: "CREAR_PLAN_DE_CUENTA",
        }}
        elementosSuperior={
          <TieneAccion accion="IMPORTAR_PLAN_DE_CUENTA">
            <button
              onClick={() => setIsModalImportarOpen(true)}
              className="flex items-center gap-2 px-4 h-10 bg-black/40 border border-black/10 rounded-md text-[13px] font-black uppercase tracking-wider text-black hover:bg-black/10 transition-all active:scale-95"
            >
              <FileDown size={16} strokeWidth={2.5} />
              Importar Plan
            </button>
          </TieneAccion>
        }
        filtrosElementos={
          <div className="flex items-center gap-3">
            <Select
              label="Tipo"
              valor={tipo}
              setValor={setTipo}
              options={[
                { valor: "TODOS", texto: "Todos" },
                { valor: "ACTIVO", texto: "Activo" },
                { valor: "PASIVO", texto: "Pasivo" },
                { valor: "RESULTADO", texto: "Resultado" },
                { valor: "PATRIMONIO", texto: "Patrimonio" },
              ]}
            />
          </div>
        }
      />

      <ModalImportarPlan
        isOpen={isModalImportarOpen}
        onClose={() => setIsModalImportarOpen(false)}
      />
    </>
  );
};

export default TablaPlanDeCuentas;
