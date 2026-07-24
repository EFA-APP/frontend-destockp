import { Plus, ArrowLeft, Landmark } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanDeCuentas } from "../../../../Backend/hooks/Contabilidad/PlanDeCuenta/usePlanDeCuentas";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";
import { useAlertas } from "../../../../store/useAlertas";
import { useEmpresas } from "../../../../Backend/Autenticacion/queries/Empresa/useEmpresas.query";

const CrearPlanDeCuenta = () => {
  const navigate = useNavigate();
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
    return [
      { value: "", label: "-- Global (Todas las empresas) --" },
      ...options,
    ];
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
      helpText:
        "Deje vacío (Global) para que la cuenta esté disponible en todas las empresas",
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
        codigoEmpresa: data.codigoEmpresa ? Number(data.codigoEmpresa) : null,
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
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Contabilidad</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Plan de Cuentas</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Landmark color="var(--primary)" size={28} strokeWidth={2.5} />
            Crear Cuenta Contable
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Agregá una nueva cuenta al plan de cuentas contable de la empresa.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/panel/contabilidad/cuentas")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Volver
          </button>
        </div>
      </div>

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
  );
};

export default CrearPlanDeCuenta;
