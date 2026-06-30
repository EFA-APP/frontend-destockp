import { Plus } from "lucide-react";
import { useMemo } from "react";
import { usePlanDeCuentas } from "../../../../Backend/hooks/Contabilidad/PlanDeCuenta/usePlanDeCuentas";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";
import { useAlertas } from "../../../../store/useAlertas";
import { useEmpresas } from "../../../../Backend/Autenticacion/queries/Empresa/useEmpresas.query";

const CrearPlanDeCuenta = () => {
  const {
    agregarCuenta,
    rawCuentasNoImputables,
    rawCuentas,
    isCreando,
    isLoadingNoImputables,
  } = usePlanDeCuentas();
  const { agregarAlerta } = useAlertas();
  const { data: empresas = [] } = useEmpresas();

  const empresasOptions = useMemo(() => {
    const options = (empresas || []).map((emp) => ({
      value: emp.codigo,
      label: emp.razonSocial || emp.nombre || `Empresa ${emp.codigo}`,
    }));
    return [{ value: "", label: "-- Global (Todas las empresas) --" }, ...options];
  }, [empresas]);

  // Opciones para el selector de cuenta padre (solo no imputables)
  const cuentasPadreOptions = useMemo(() => {
    const options = (rawCuentasNoImputables || []).map((node) => ({
      value: node.codigoSecuencial,
      label: `${node.codigo} - ${node.nombre}`,
    }));

    return [{ value: null, label: "-- Sin cuenta padre --" }, ...options];
  }, [rawCuentasNoImputables]);

  // Pre-computar códigos existentes para validación rápida
  const codigosExistentes = useMemo(() => {
    const codigos = new Set();
    const recorrer = (nodos) => {
      if (!nodos) return;
      nodos.forEach((nodo) => {
        if (nodo.codigo) codigos.add(nodo.codigo);
        if (nodo.subCuentas) recorrer(nodo.subCuentas);
        if (nodo.children) recorrer(nodo.children);
      });
    };
    recorrer(rawCuentas);
    return codigos;
  }, [rawCuentas]);

  const camposCuenta = [
    {
      name: "codigo",
      label: "Código de Cuenta",
      type: "text",
      required: true,
      section: "Estructura",
      placeholder: "1.1.01",
      helpText: (formData) => {
        if (!formData.codigo) return "Ej: 1.1.01 para Caja";
        const existe = codigosExistentes.has(formData.codigo.trim());
        if (existe) {
          return (
            <span className="text-red-600 font-bold">
              ⚠️ Este código ya existe en el plan de cuentas.
            </span>
          );
        }
        return (
          <span className="text-green-600 font-bold">
            ✅ Código disponible.
          </span>
        );
      },
      validate: (value) => {
        if (value && codigosExistentes.has(value.trim())) {
          return "El código de cuenta ya existe.";
        }
        return null;
      },
    },
    {
      name: "nombre",
      label: "Nombre de la Cuenta",
      type: "text",
      required: true,
      section: "Estructura",
      placeholder: "Ej: Caja Central",
    },
    {
      name: "tipo",
      label: "Tipo de Cuenta",
      type: "select",
      required: true,
      section: "Clasificación",
      options: [
        { value: "ACTIVO", label: "Activo" },
        { value: "PASIVO", label: "Pasivo" },
        { value: "PATRIMONIO", label: "Patrimonio" },
        { value: "RESULTADO_POSITIVO", label: "Resultado Positivo (Ingresos)" },
        { value: "RESULTADO_NEGATIVO", label: "Resultado Negativo (Egresos)" },
      ],
    },
    {
      name: "codigoEmpresa",
      label: "Empresa Asociada (Opcional)",
      type: "select",
      section: "Clasificación",
      options: empresasOptions,
      helpText: "Deje vacío (Global) para que la cuenta esté disponible en todas las empresas",
    },
    {
      name: "codigoCuentaPadre",
      label: "Cuenta Padre",
      type: "search-select",
      section: "Jerarquía",
      options: cuentasPadreOptions,
      placeholder: "Escriba para buscar una cuenta padre...",
      helpText:
        "Seleccione la cuenta agrupadora bajo la cual colgará esta cuenta",
    },
    {
      name: "imputable",
      label: "¿Permite Movimientos?",
      type: "select",
      section: "Configuración",
      defaultValue: true,
      options: [
        { value: true, label: "SÍ (Cuenta Operativa)" },
        { value: false, label: "NO (Solo Agrupadora)" },
      ],
      helpText: "Las cuentas no imputables se usan para agrupar saldos",
    },
  ];

  const handleSubmit = async (data) => {
    try {
      const payload = {
        codigo: data.codigo,
        nombre: data.nombre,
        tipo: data.tipo,
        imputable: data.imputable === "true" || data.imputable === true,
        codigoCuentaPadre: data.codigoCuentaPadre
          ? Number(data.codigoCuentaPadre)
          : null,
        codigoEmpresa: data.codigoEmpresa
          ? Number(data.codigoEmpresa)
          : null,
      };

      await agregarCuenta(payload);

      agregarAlerta({
        type: "success",
        message: "Cuenta contable creada correctamente.",
      });

      // Redirigir al listado
      window.location.href = "/panel/contabilidad/cuentas";
    } catch (error) {
      agregarAlerta({
        type: "error",
        message: error.message || "Error al crear la cuenta.",
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <EncabezadoSeccion
        ruta="Crear Plan de Cuentas "
        icono={
          <div className="w-10 h-10 bg-black/40 rounded-md flex items-center justify-center text-black shadow-lg">
            <Plus size={20} strokeWidth={2.5} />
          </div>
        }
        volver
        redireccionAnterior="/panel/contabilidad/cuentas"
      />

      <div className="flex-1 px-8 pb-8">
        <div className="p-4">
          <FormularioDinamico
            titulo="Nueva Cuenta"
            subtitulo="Complete los datos de la cuenta"
            campos={camposCuenta}
            onSubmit={handleSubmit}
            submitLabel={isCreando ? "Creando..." : "Crear Cuenta"}
            disabled={isCreando}
          />
        </div>
      </div>
    </div>
  );
};

export default CrearPlanDeCuenta;
