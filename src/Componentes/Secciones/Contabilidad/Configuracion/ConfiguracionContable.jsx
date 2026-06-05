import React, { useEffect, useState, useMemo } from "react";
import { useConfiguracionContable } from "../../../../Backend/hooks/Contabilidad/Configuracion/useConfiguracionContable";
import { usePlanDeCuentas } from "../../../../Backend/hooks/Contabilidad/PlanDeCuenta/usePlanDeCuentas";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
  Settings,
  Save,
  Filter,
  Info,
  Plus,
  Eye,
  ArrowRight,
  ChevronRight,
  Hash,
  Database,
  Briefcase,
  Layers,
  FileText,
  Users,
  CreditCard,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Trash2,
  Copy,
} from "lucide-react";
import { ListarEntidadesApi } from "../../../../Backend/Contactos/api/contactos.api";
import SearchableSelect from "../../../UI/Select/SearchableSelect";
import MultiSearchableSelect from "../../../UI/Select/MultiSearchableSelect";
import { ObtenerTiposComprobanteApi } from "../../../../Backend/Arca/api/arca.api";
import { obtenerTodasLasEmpresasApi } from "../../../../Backend/Autenticacion/api/Empresa/empresa.api";

const TIPOS_PERSONALIZADOS = [
  { id: 991, label: "📄 Comprobante Interno" },
  { id: 992, label: "🧾 Recibo de Cobro Interno" },
  { id: 993, label: "🔄 Nota de Crédito Interna" },
];

const METODOS_PAGO = [
  {
    id: "EFECTIVO",
    label: "💵 Contado (Efectivo)",
    icon: <Briefcase size={14} />,
  },
  {
    id: "CUENTA_CORRIENTE",
    label: "💳 Cuenta Corriente",
    icon: <Layers size={14} />,
  },
  {
    id: "TRANSFERENCIA",
    label: "🏦 Transferencia Bancaria",
    icon: <Database size={14} />,
  },
  {
    id: "TARJETA_CREDITO",
    label: "💳 Tarjeta de Crédito",
    icon: <CreditCard size={14} />,
  },
  {
    id: "TARJETA_DEBITO",
    label: "💳 Tarjeta de Débito",
    icon: <CreditCard size={14} />,
  },
];

const ConfiguracionContable = () => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;

  const [filtroModulo, setFiltroModulo] = useState("VENTAS");
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' o 'listado'
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(
    codigoEmpresa || "",
  );

  const CONCEPTOS = useMemo(() => {
    if (filtroModulo === "VENTAS") {
      return [
        {
          id: "NETO",
          label: "Ventas / Ingresos (Neto)",
          side: "HABER",
          color: "rose",
        },
        { id: "IVA", label: "IVA Débito Fiscal", side: "HABER", color: "rose" },
        {
          id: "INTERES",
          label: "Intereses por Mora (Ganancia)",
          side: "HABER",
          color: "rose",
        },
        {
          id: "CLIENTES",
          label: "Deudores / Cuenta Corriente",
          side: "DEBE",
          color: "emerald",
        },
        {
          id: "CAJA",
          label: "Caja / Disponibilidades / Banco",
          side: "DEBE",
          color: "emerald",
        },
        {
          id: "STOCK",
          label: "Costo de Mercadería (CMV)",
          side: "DEBE",
          color: "emerald",
        },
      ];
    } else {
      return [
        {
          id: "NETO",
          label: "Compras / Gastos (Neto)",
          side: "DEBE",
          color: "emerald",
        },
        {
          id: "IVA",
          label: "IVA Crédito Fiscal",
          side: "DEBE",
          color: "emerald",
        },
        {
          id: "CLIENTES",
          label: "Proveedores / Cuenta Corriente",
          side: "HABER",
          color: "rose",
        },
        {
          id: "CAJA",
          label: "Caja / Salida de Dinero",
          side: "HABER",
          color: "rose",
        },
        {
          id: "STOCK",
          label: "Ingreso de Mercadería",
          side: "DEBE",
          color: "emerald",
        },
      ];
    }
  }, [filtroModulo]);

  const { mapeos, loading, cargarMapeos, guardarMapeo, eliminarMapeo } =
    useConfiguracionContable();
  const { cuentasImputables, isLoading: isLoadingCuentas } = usePlanDeCuentas();

  const [reglaSeleccionada, setReglaSeleccionada] = useState({
    accion: filtroModulo === "VENTAS" ? "FACTURACION" : "COMPRA",
    tiposComprobante: [],
    metodoPago: "EFECTIVO",
    tipoEntidad: null,
  });

  const [conceptosEditando, setConceptosEditando] = useState({});
  const [tiposComprobanteArca, setTiposComprobanteArca] = useState([]);
  const [cargandoDesdeLista, setCargandoDesdeLista] = useState(false);
  const [entidadesOptions, setEntidadesOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataArca = await ObtenerTiposComprobanteApi();
        const listaTipos = Array.isArray(dataArca)
          ? dataArca
          : dataArca?.data || [];
        if (Array.isArray(listaTipos)) {
          setTiposComprobanteArca(
            listaTipos.map((t) => ({ id: t.Id, label: t.Desc })),
          );
        }
      } catch (e) {
        console.error("Error al cargar tipos de comprobante ARCA:", e);
      }

      try {
        const dataEntidades = await ListarEntidadesApi();
        if (Array.isArray(dataEntidades)) {
          setEntidadesOptions([
            { value: "", label: "-- Todas las Entidades --" },
            ...dataEntidades.map((e) => ({
              value: e.clave,
              label: e.descripcion || e.nombre || e.clave,
            })),
          ]);
        }
      } catch (e) {
        console.error("Error al cargar entidades auxiliares:", e);
      }

      try {
        const dataEmpresas = await obtenerTodasLasEmpresasApi();
        const listaEmpresas = Array.isArray(dataEmpresas)
          ? dataEmpresas
          : dataEmpresas?.data || [];
        if (Array.isArray(listaEmpresas)) {
          setEmpresas(listaEmpresas);
        }
      } catch (e) {
        console.error("Error al cargar lista de empresas:", e);
      }
    };
    fetchData();
  }, []);

  const allTiposComprobante = useMemo(() => {
    const combined = [...tiposComprobanteArca];
    TIPOS_PERSONALIZADOS.forEach((pers) => {
      if (!combined.find((comp) => comp.id === pers.id)) combined.push(pers);
    });
    return combined.sort((a, b) => a.id - b.id);
  }, [tiposComprobanteArca]);

  useEffect(() => {
    cargarMapeos(empresaSeleccionada || null, filtroModulo);
  }, [cargarMapeos, empresaSeleccionada, filtroModulo]);

  const reglasAgrupadas = useMemo(() => {
    const grupos = {};
    mapeos.forEach((mapItem) => {
      const key = `${mapItem.accion}-${mapItem.tipoComprobante}-${mapItem.metodoPago}-${mapItem.tipoEntidad}`;
      if (!grupos[key]) {
        grupos[key] = {
          accion: mapItem.accion,
          tipoComprobante: mapItem.tipoComprobante,
          metodoPago: mapItem.metodoPago,
          tipoEntidad: mapItem.tipoEntidad,
          conceptos: {},
          codigoEmpresa: mapItem.codigoEmpresa,
        };
      }
      grupos[key].conceptos[mapItem.concepto] = mapItem.codigoCuentaContable;
    });
    return Object.values(grupos);
  }, [mapeos]);

  const optionsEmpresa = useMemo(() => {
    return [
      { value: "", label: "🌐 Reglas Globales (Todas las Empresas)" },
      ...empresas.map((emp) => ({
        value: emp.codigo,
        label: `🏢 ${emp.nombre || emp.razonSocial || `Empresa #${emp.codigo}`}`,
      })),
    ];
  }, [empresas]);

  const handleEmpresaChange = (val) => {
    const code = val ? Number(val) : "";
    setEmpresaSeleccionada(code);
  };

  const getNombreEmpresa = (code) => {
    if (!code) return "🌐 Regla Global";
    const emp = empresas.find((e) => e.codigo === code);
    return emp ? `🏢 ${emp.nombre || emp.razonSocial}` : `🏢 Empresa #${code}`;
  };

  const reglaExistente = useMemo(() => {
    const primerTipo = reglaSeleccionada.tiposComprobante[0];
    return reglasAgrupadas.find(
      (item) =>
        item.accion === reglaSeleccionada.accion &&
        item.tipoComprobante == primerTipo &&
        item.metodoPago == reglaSeleccionada.metodoPago &&
        item.tipoEntidad == reglaSeleccionada.tipoEntidad,
    );
  }, [reglaSeleccionada, reglasAgrupadas]);

  useEffect(() => {
    if (cargandoDesdeLista)
      setConceptosEditando(reglaExistente?.conceptos || {});
  }, [reglaExistente, cargandoDesdeLista]);

  const handleLimpiarSeleccion = () => {
    setCargandoDesdeLista(false);
    setReglaSeleccionada({
      accion: filtroModulo === "VENTAS" ? "FACTURACION" : "COMPRA",
      tiposComprobante: [],
      metodoPago: null,
      tipoEntidad: null,
    });
    setConceptosEditando({});
  };

  const handleGuardarRegla = async () => {
    const targetEmpresa = empresaSeleccionada || null;
    const items = Object.entries(conceptosEditando)
      .map(([concepto, codigo]) => ({
        concepto,
        codigoCuentaContable: parseInt(codigo, 10),
      }))
      .filter(
        (item) =>
          !isNaN(item.codigoCuentaContable) && item.codigoCuentaContable > 0,
      );
    const tipos =
      reglaSeleccionada.tiposComprobante.length > 0
        ? reglaSeleccionada.tiposComprobante
        : [null];
    for (const tipo of tipos) {
      await guardarMapeo(
        targetEmpresa,
        filtroModulo,
        reglaSeleccionada.accion,
        items,
        {
          tipoComprobante: tipo,
          metodoPago: reglaSeleccionada.metodoPago,
          tipoEntidad: reglaSeleccionada.tipoEntidad,
        },
      );
    }
  };

  const AsientoModelo = useMemo(() => {
    const entryItems = [];
    const totalSim = 12100;
    const netoSim = 10000;
    const ivaSim = 2100;

    CONCEPTOS.forEach((conc) => {
      const cuentaId = conceptosEditando[conc.id];
      if (cuentaId) {
        const cuentaObj = cuentasImputables.find((cu) => cu.id == cuentaId);
        const valor =
          conc.id === "NETO" ? netoSim : conc.id === "IVA" ? ivaSim : totalSim;
        entryItems.push({
          cuenta: cuentaObj?.label || `Cuenta #${cuentaId}`,
          concepto: conc.label,
          debe: conc.side === "DEBE" ? valor : 0,
          haber: conc.side === "HABER" ? valor : 0,
          side: conc.side,
        });
      }
    });
    return entryItems.sort((a, b) => b.debe - a.debe);
  }, [conceptosEditando, CONCEPTOS, cuentasImputables]);

  const isRuleComplete =
    CONCEPTOS.length > 0 && CONCEPTOS.every((c) => conceptosEditando[c.id]);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      {/* 1. CABECERA PREMIUM */}
      <div className="border-b border-slate-200/60 px-8 py-4 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-md flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 rotate-3 transition-transform hover:rotate-0">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
              Motor de Asientos Automáticos
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-[var(--primary)]/70 font-black uppercase tracking-widest">
                Configuración Inteligente de Reglas Contables
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-100 rounded-md mr-4">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "editor" ? "bg-white text-indigo-600 shadow-sm" : "text-[var(--primary)]/70 hover:text-slate-600"}`}
            >
              Configurador
            </button>
            <button
              onClick={() => setActiveTab("listado")}
              className={`px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "listado" ? "bg-white text-indigo-600 shadow-sm" : "text-[var(--primary)]/70 hover:text-slate-600"}`}
            >
              Reglas Activas ({reglasAgrupadas.length})
            </button>
          </div>

          <button
            onClick={handleGuardarRegla}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-3 rounded-md text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-indigo-600 text-white shadow-indigo-600/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
          >
            <Save size={18} />
            {loading ? "Sincronizando..." : "Aplicar Cambios"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. PANEL IZQUIERDO: CRITERIOS (SIDEBAR) */}
        <aside className="w-[380px] border-r border-slate-200/60 flex flex-col p-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-10">
            {/* SELECTOR DE MÓDULO */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-[var(--primary)]/70 uppercase tracking-[0.2em] flex items-center gap-2">
                <Layers size={14} className="text-indigo-500" />
                Módulo de Origen
              </h3>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-md border border-slate-200/50">
                <button
                  onClick={() => {
                    setFiltroModulo("VENTAS");
                    handleLimpiarSeleccion();
                  }}
                  className={`py-3 rounded-md text-[10px] font-black uppercase transition-all ${filtroModulo === "VENTAS" ? "bg-white text-slate-900 shadow-md" : "text-[var(--primary)]/70 hover:text-slate-600"}`}
                >
                  Ventas
                </button>
                <button
                  onClick={() => {
                    setFiltroModulo("COMPRAS");
                    handleLimpiarSeleccion();
                  }}
                  className={`py-3 rounded-md text-[10px] font-black uppercase transition-all ${filtroModulo === "COMPRAS" ? "bg-white text-slate-900 shadow-md" : "text-[var(--primary)]/70 hover:text-slate-600"}`}
                >
                  Compras
                </button>
              </div>
            </div>

            {/* CONTEXTO DE EMPRESA */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-[var(--primary)]/70 uppercase tracking-[0.2em] flex items-center gap-2">
                <Briefcase size={14} className="text-indigo-500" />
                Contexto de Empresa
              </h3>
              <SearchableSelect
                value={empresaSeleccionada}
                onChange={(e) => handleEmpresaChange(e.target.value)}
                options={optionsEmpresa}
                placeholder="Seleccionar Empresa..."
              />
              <p className="text-[9px] text-[var(--primary)]/50 font-medium leading-relaxed italic ml-1">
                {empresaSeleccionada
                  ? "Configurando reglas exclusivas para la empresa seleccionada."
                  : "Configurando reglas globales del sistema aplicables a todos los comprobantes."}
              </p>
            </div>

            {/* CRITERIOS DINÁMICOS */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-[var(--primary)]/70 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Filter size={14} className="text-indigo-500" />
                  Condiciones de Regla
                </h3>
                <button
                  onClick={handleLimpiarSeleccion}
                  className="p-2 hover:bg-rose-50 text-rose-500 rounded-md transition-colors"
                  title="Nueva Regla"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="space-y-6">
                {/* ACCIÓN */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[var(--primary)]/70 uppercase tracking-widest ml-1">
                    Acción / Evento
                  </label>
                  <SearchableSelect
                    value={reglaSeleccionada.accion}
                    onChange={(e) => {
                      setCargandoDesdeLista(false);
                      setReglaSeleccionada({
                        ...reglaSeleccionada,
                        accion: e.target.value,
                      });
                    }}
                    options={
                      filtroModulo === "VENTAS"
                        ? [
                            {
                              value: "FACTURACION",
                              label: "📄 Facturación de Venta",
                            },
                            { value: "RECIBO", label: "🧾 Cobranza de Cuotas" },
                            { value: "NC", label: "🔄 Nota de Crédito" },
                          ]
                        : [
                            { value: "COMPRA", label: "📥 Compra / Gasto" },
                            { value: "PAGO", label: "📤 Pago a Proveedor" },
                            { value: "NC", label: "🔄 Nota de Crédito" },
                          ]
                    }
                  />
                </div>

                {/* COMPROBANTE */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[var(--primary)]/70 uppercase tracking-widest ml-1">
                    Tipos de Comprobante
                  </label>
                  <MultiSearchableSelect
                    value={reglaSeleccionada.tiposComprobante}
                    onChange={(e) => {
                      setCargandoDesdeLista(false);
                      setReglaSeleccionada({
                        ...reglaSeleccionada,
                        tiposComprobante: e.target.value,
                      });
                    }}
                    options={allTiposComprobante.map((tipo) => ({
                      value: tipo.id,
                      label: tipo.label,
                    }))}
                    placeholder="-- Aplica a Todos --"
                  />
                </div>

                {/* PAGO */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[var(--primary)]/70 uppercase tracking-widest ml-1">
                    Método de Pago
                  </label>
                  <SearchableSelect
                    value={reglaSeleccionada.metodoPago || ""}
                    onChange={(e) => {
                      setCargandoDesdeLista(false);
                      setReglaSeleccionada({
                        ...reglaSeleccionada,
                        metodoPago: e.target.value || null,
                      });
                    }}
                    options={[
                      { value: "", label: "-- Cualquier Medio de Pago --" },
                      ...METODOS_PAGO.map((met) => ({
                        value: met.id,
                        label: met.label,
                      })),
                    ]}
                  />
                </div>

                {/* ENTIDAD */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[var(--primary)]/70 uppercase tracking-widest ml-1">
                    Tipo de Entidad
                  </label>
                  <SearchableSelect
                    value={reglaSeleccionada.tipoEntidad || ""}
                    onChange={(e) => {
                      setCargandoDesdeLista(false);
                      setReglaSeleccionada({
                        ...reglaSeleccionada,
                        tipoEntidad: e.target.value || null,
                      });
                    }}
                    options={
                      entidadesOptions.length > 0
                        ? entidadesOptions
                        : [{ value: "", label: "-- Todas las Entidades --" }]
                    }
                  />
                </div>
              </div>
            </div>

            {/* INFO BOX */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-md p-5">
              <div className="flex gap-3">
                <Sparkles size={16} className="text-indigo-600 shrink-0" />
                <p className="text-[9px] font-bold text-indigo-700 uppercase leading-relaxed">
                  Las reglas se aplican por jerarquía. El sistema prioriza las
                  reglas específicas y recurre a las globales en caso de
                  ausencia.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. ÁREA DE TRABAJO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === "editor" ? (
              <>
                {/* VISTA PREVIA DEL ASIENTO (DIGITAL TWIN) */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                      <Eye size={16} className="text-indigo-600" />
                      Vista Previa de Asiento Automático
                    </h3>
                    {isRuleComplete ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                        <CheckCircle2 size={12} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">
                          Configuración Completa
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                        <AlertCircle size={12} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">
                          Configuración Incompleta
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-md shadow-2xl shadow-slate-200/60 border border-slate-200/50 overflow-hidden">
                    <div className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                          Minuta Contable Automática
                        </div>
                        <h4 className="text-lg font-black tracking-tight uppercase">
                          Simulación de Registro
                        </h4>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-black text-[var(--primary)]/70 uppercase tracking-widest mb-1">
                          Total Asiento
                        </div>
                        <div className="text-2xl font-black tabular-nums text-emerald-400">
                          $ 12.100,00
                        </div>
                      </div>
                    </div>

                    <div className="p-1">
                      <table className="w-full border-separate border-spacing-0">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-8 py-5 text-[10px] font-black text-[var(--primary)]/70 uppercase tracking-widest text-left">
                              Cuenta Contable / Imputación
                            </th>
                            <th className="px-8 py-5 text-[10px] font-black text-[var(--primary)]/70 uppercase tracking-widest text-right w-40">
                              Debe
                            </th>
                            <th className="px-8 py-5 text-[10px] font-black text-[var(--primary)]/70 uppercase tracking-widest text-right w-40">
                              Haber
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {AsientoModelo.length > 0 ? (
                            AsientoModelo.map((item, i) => (
                              <tr
                                key={i}
                                className="group hover:bg-slate-50 transition-colors"
                              >
                                <td className="px-8 py-6">
                                  <div
                                    className={`flex flex-col ${item.side === "HABER" ? "ml-12" : ""}`}
                                  >
                                    <div className="flex items-center gap-3 mb-1">
                                      <div
                                        className={`w-1.5 h-1.5 rounded-full ${item.side === "DEBE" ? "bg-emerald-500" : "bg-rose-500"}`}
                                      />
                                      <span className="text-sm font-black text-slate-800">
                                        {item.cuenta}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-[var(--primary)]/70 uppercase tracking-tight">
                                      {item.concepto}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-8 py-6 text-right font-black tabular-nums text-slate-700">
                                  {item.debe > 0
                                    ? `$ ${item.debe.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
                                    : "-"}
                                </td>
                                <td className="px-8 py-6 text-right font-black tabular-nums text-slate-700">
                                  {item.haber > 0
                                    ? `$ ${item.haber.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
                                    : "-"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="3"
                                className="px-8 py-20 text-center"
                              >
                                <div className="flex flex-col items-center gap-6">
                                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                                    <AlertCircle
                                      size={32}
                                      className="text-amber-500 animate-pulse"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                      Faltan cuentas obligatorias
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                      {CONCEPTOS.filter(
                                        (c) => !conceptosEditando[c.id],
                                      ).map((c) => (
                                        <span
                                          key={c.id}
                                          className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black uppercase rounded border border-rose-100"
                                        >
                                          {c.label}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="bg-slate-50/80">
                          <tr>
                            <td className="px-8 py-5 text-[11px] font-black text-slate-800 uppercase tracking-widest">
                              Totales de Control
                            </td>
                            <td className="px-8 py-5 text-right font-black text-emerald-600 tabular-nums border-t-2 border-emerald-500/20">
                              $ 12.100,00
                            </td>
                            <td className="px-8 py-5 text-right font-black text-rose-600 tabular-nums border-t-2 border-rose-500/20">
                              $ 12.100,00
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </section>

                {/* EDITOR DE CUENTAS */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                      <Hash size={16} className="text-indigo-600" />
                      Mapeo de Conceptos Contables
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* DEBE */}
                    <div className="bg-white rounded-md border border-slate-200/60 p-8 shadow-sm space-y-8">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-500 text-white rounded-md flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/20">
                            D
                          </div>
                          <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                            Imputaciones al DEBE
                          </span>
                        </div>
                      </div>
                      <div className="space-y-8">
                        {CONCEPTOS.filter((c) => c.side === "DEBE").map(
                          (conc) => (
                            <div key={conc.id} className="group space-y-3">
                              <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-[var(--primary)]/70 uppercase tracking-widest transition-colors group-focus-within:text-indigo-600">
                                  {conc.label}
                                </label>
                                {!conceptosEditando[conc.id] && (
                                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 animate-pulse">
                                    Pendiente
                                  </span>
                                )}
                              </div>
                              <SearchableSelect
                                value={conceptosEditando[conc.id] || ""}
                                onChange={(ev) =>
                                  setConceptosEditando({
                                    ...conceptosEditando,
                                    [conc.id]: ev.target.value,
                                  })
                                }
                                options={[
                                  {
                                    value: "",
                                    label: "-- Seleccionar Cuenta Imputable --",
                                  },
                                  ...cuentasImputables,
                                ]}
                              />
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* HABER */}
                    <div className="bg-white rounded-md border border-slate-200/60 p-8 shadow-sm space-y-8">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-rose-500 text-white rounded-md flex items-center justify-center font-black text-xs shadow-lg shadow-rose-500/20">
                            H
                          </div>
                          <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                            Imputaciones al HABER
                          </span>
                        </div>
                      </div>
                      <div className="space-y-8">
                        {CONCEPTOS.filter((c) => c.side === "HABER").map(
                          (conc) => (
                            <div key={conc.id} className="group space-y-3">
                              <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-[var(--primary)]/70 uppercase tracking-widest transition-colors group-focus-within:text-indigo-600">
                                  {conc.label}
                                </label>
                                {!conceptosEditando[conc.id] && (
                                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 animate-pulse">
                                    Pendiente
                                  </span>
                                )}
                              </div>
                              <SearchableSelect
                                value={conceptosEditando[conc.id] || ""}
                                onChange={(ev) =>
                                  setConceptosEditando({
                                    ...conceptosEditando,
                                    [conc.id]: ev.target.value,
                                  })
                                }
                                options={[
                                  {
                                    value: "",
                                    label: "-- Seleccionar Cuenta Imputable --",
                                  },
                                  ...cuentasImputables,
                                ]}
                              />
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              /* LISTADO DE REGLAS (MODO PREMIUM TABLE) */
              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                    <Database size={16} className="text-indigo-600" />
                    Reglas de Negocio Configuradas ({filtroModulo})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {reglasAgrupadas.length > 0 ? (
                    reglasAgrupadas.map((regla, idx) => (
                      <div
                        key={idx}
                        className="group bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          setCargandoDesdeLista(true);
                          setEmpresaSeleccionada(regla.codigoEmpresa || "");
                          setReglaSeleccionada({
                            ...regla,
                            tiposComprobante: [regla.tipoComprobante],
                          });
                          setActiveTab("editor");
                        }}
                      >
                        <div className="flex items-center gap-8">
                          <div
                            className={`w-16 h-16 rounded-md flex items-center justify-center text-xl shadow-inner ${regla.accion === "FACTURACION" || regla.accion === "COMPRA" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                          >
                            {regla.accion === "FACTURACION" ? (
                              <FileText />
                            ) : regla.accion === "COMPRA" ? (
                              <ArrowRight />
                            ) : (
                              <Layers />
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                {allTiposComprobante.find(
                                  (t) => t.id == regla.tipoComprobante,
                                )?.label || "Cualquier Comprobante"}
                              </span>
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                              <span
                                className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${!regla.codigoEmpresa ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}
                              >
                                {getNombreEmpresa(regla.codigoEmpresa)}
                              </span>
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                              <div className="px-3 py-1 bg-slate-100 rounded-md flex items-center gap-2">
                                <CreditCard
                                  size={12}
                                  className="text-slate-400"
                                />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                  {regla.metodoPago || "Cualquier Pago"}
                                </span>
                              </div>
                              {regla.tipoEntidad && (
                                <div className="px-3 py-1 bg-slate-100 rounded-md flex items-center gap-2">
                                  <Users size={12} className="text-slate-400" />
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                    {entidadesOptions.find(
                                      (e) => e.value === regla.tipoEntidad,
                                    )?.label || regla.tipoEntidad}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-4">
                              {Object.entries(regla.conceptos)
                                .slice(0, 3)
                                .map(([c, cod]) => (
                                  <div
                                    key={c}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="text-[8px] font-black text-[var(--primary)]/70 uppercase tracking-widest">
                                      {c}:
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-600">
                                      {cuentasImputables
                                        .find((cu) => cu.id == cod)
                                        ?.label?.split(" - ")[0] || cod}
                                    </span>
                                  </div>
                                ))}
                              {Object.keys(regla.conceptos).length > 3 && (
                                <span className="text-[9px] font-black text-indigo-500">
                                  +{Object.keys(regla.conceptos).length - 3} más
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            className="w-10 h-10 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                            title="Eliminar Regla"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  "¿Estás seguro de eliminar esta regla de configuración contable?",
                                )
                              ) {
                                eliminarMapeo(
                                  regla.codigoEmpresa || null,
                                  filtroModulo,
                                  {
                                    accion: regla.accion,
                                    tipoComprobante: regla.tipoComprobante,
                                    metodoPago: regla.metodoPago,
                                    tipoEntidad: regla.tipoEntidad,
                                  },
                                );
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                          <ChevronRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-md p-24 text-center">
                      <div className="max-w-xs mx-auto space-y-6 opacity-40">
                        <Database
                          size={48}
                          className="mx-auto text-slate-400"
                        />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                          No hay configuraciones activas para este módulo
                        </p>
                        <button
                          onClick={() => setActiveTab("editor")}
                          className="px-8 py-3 bg-indigo-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                        >
                          Crear Primera Regla
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConfiguracionContable;
