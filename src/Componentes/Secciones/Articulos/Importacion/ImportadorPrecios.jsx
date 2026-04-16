import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Search,
  Database,
  FileSpreadsheet,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useAlertas } from "../../../../store/useAlertas";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { axiosInitial } from "../../../../Backend/Config";

const STEPS = [
  { id: 1, title: "Proveedor", icon: Search },
  { id: 2, title: "Archivo", icon: Upload },
  { id: 3, title: "Mapeo", icon: Database },
  { id: 4, title: "Preview", icon: FileSpreadsheet },
  { id: 5, title: "Resultado", icon: CheckCircle2 },
];

export default function ImportadorPrecios({ onExito }) {
  const [step, setStep] = useState(1);
  const { usuario, unidadActiva } = useAuthStore();
  const { agregarAlerta } = useAlertas();

  // Estado de Datos
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [file, setFile] = useState(null);
  const [rawRows, setRawRows] = useState([]); // Primeras 20 filas para detectar cabecera
  const [headerIndex, setHeaderIndex] = useState(0);
  const [headers, setHeaders] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [mapping, setMapping] = useState({}); // { systemKey: excelHeader }
  const [anchorKey, setAnchorKey] = useState("codigofabrica");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  // Filtros de Proveedor con Debounce
  const [busquedaProv, setBusquedaProv] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounced(busquedaProv);
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaProv]);

  const { contactos: proveedores, cargandoContactos: loadingProvs } =
    useContactos({
      tipoEntidad: "PROV",
      busqueda: busquedaDebounced,
      pagina: 1,
      limite: 50,
    });

  // Campos del sistema disponibles para mapear (Deben coincidir EXACTAMENTE con tu tabla de configuración)
  const systemFields = [
    { key: "codigoFabrica", label: "Código de Fábrica (ID)", required: true },
    { key: "listaPrecio", label: "Costo de Lista", required: true },
    {
      key: "margenGanancia",
      label: "Margen de Ganancia (Opcional)",
      required: false,
    },
    { key: "nombre", label: "Nombre / Descripción", required: false },
  ];

  // --- LÓGICA DE ARCHIVO ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      setRawRows(data.slice(0, 15)); // Solo para preview de cabecera
      setFullData(data);
      setStep(2);
    };
    reader.readAsBinaryString(file);
  };

  // Auto-mapeo inicial al seleccionar archivo
  const performAutoMapping = (selectedHeaders) => {
    const initialMapping = {};
    selectedHeaders.forEach((h) => {
      const lowerH = String(h).toLowerCase();
      if (lowerH.includes("cod") || lowerH.includes("ref"))
        initialMapping["codigoFabrica"] = h;
      if (
        lowerH.includes("precio") ||
        lowerH.includes("costo") ||
        lowerH.includes("lista")
      )
        initialMapping["listaPrecio"] = h;
      if (lowerH.includes("margen") || lowerH.includes("ganancia"))
        initialMapping["margenGanancia"] = h;
      if (
        lowerH.includes("nom") ||
        lowerH.includes("desc") ||
        lowerH.includes("art")
      )
        initialMapping["nombre"] = h;
    });
    setMapping(initialMapping);
  };

  const confirmHeaders = (index) => {
    setHeaderIndex(index);
    const selectedHeaders = rawRows[index];
    setHeaders(selectedHeaders);
    performAutoMapping(selectedHeaders);
    setStep(3);
  };

  const handleImport = async () => {
    if (!proveedorSeleccionado)
      return agregarAlerta({
        type: "error",
        message: "Seleccione un proveedor",
      });
    if (!mapping.codigoFabrica || !mapping.listaPrecio)
      return agregarAlerta({
        type: "error",
        message: "Debe mapear al menos el Código y el Costo",
      });

    setIsProcessing(true);
    try {
      // Usamos CamelCase exacto de la base de datos
      const anchorKeySystem = "codigoFabrica";

      // Función para limpiar números
      const cleanNumber = (val) => {
        if (typeof val === "number") return parseFloat(val.toFixed(2));
        if (!val) return 0;
        // Quitar $, espacios, y puntos de miles, cambiar coma por punto
        const cleaned = String(val)
          .replace(/[$\s]/g, "")
          .replace(/\./g, "")
          .replace(",", ".");
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parseFloat(parsed.toFixed(2));
      };

      // Procesar datos según mapeo
      const processedData = fullData
        .slice(headerIndex + 1)
        .map((row) => {
          const obj = {};
          Object.keys(mapping).forEach((sysKey) => {
            const excelColIndex = headers.indexOf(mapping[sysKey]);
            if (excelColIndex !== -1) {
              const rawVal = row[excelColIndex];
              // Si la clave sugiere un número (precio, margen, costo, lista), lo limpiamos
              const lowerKey = sysKey.toLowerCase();
              if (
                lowerKey.includes("precio") ||
                lowerKey.includes("margen") ||
                lowerKey.includes("costo") ||
                lowerKey.includes("lista")
              ) {
                obj[sysKey] = cleanNumber(rawVal);
              } else {
                obj[sysKey] = rawVal;
              }
            }
          });
          return obj;
        })
        .filter((item) => item[anchorKeySystem]);

      // Atributos de contexto
      const atributosExtra = {
        codigoProveedor: proveedorSeleccionado.codigoSecuencial,
        nombreProveedor:
          proveedorSeleccionado.razonSocial || proveedorSeleccionado.nombre,
        margenGanancia: Number(
          proveedorSeleccionado.atributos?.margenGanancia || 0,
        ),
      };

      const payload = {
        atributosExtra,
        anclaKey: anchorKeySystem,
        productos: processedData,
      };

      const config = {
        params: {
          codigoEmpresa: usuario.codigoEmpresa,
        },
      };

      const res = await axiosInitial.post(
        "/producto/importar-lista-precios",
        payload,
        {
          showLoader: false,
        },
        config,
      );
      setResults(res.data);
      setStep(5);
      agregarAlerta({ type: "exito", message: "Importación completada" });
    } catch (error) {
      console.error(error);
      agregarAlerta({
        type: "error",
        message:
          "Error en la importación: " +
          (error.response?.data?.message || error.message),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
            Importador de Precios{" "}
            <span className="text-[var(--primary)] text-sm font-bold bg-[var(--primary-subtle)] px-2 py-0.5 rounded ml-2">
              PRO
            </span>
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Sincronización masiva de costos y márgenes de proveedores
          </p>
        </div>
        <div className="flex items-center gap-2">
          {proveedorSeleccionado && (
            <div className="flex items-center gap-3 bg-[var(--surface-hover)] border border-[var(--border-subtle)] px-4 py-2 rounded-md">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold">
                {(
                  proveedorSeleccionado.razonSocial?.[0] ||
                  proveedorSeleccionado.nombre?.[0] ||
                  "P"
                ).toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                  Proveedor Activo
                </p>
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  {proveedorSeleccionado.nombre}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STEPS INDICATOR */}
      <div className="flex items-center justify-between mb-12 bg-[var(--surface)] p-2 rounded-md border border-[var(--border-subtle)] shadow-sm">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <React.Fragment key={s.id}>
              <div
                className={`flex flex-col items-center gap-2 px-6 py-3 rounded-md transition-all duration-300 ${isActive ? "bg-[var(--primary-light)] text-white shadow-lg shadow-[var(--primary)]/20 scale-105" : "text-[var(--text-muted)]"}`}
              >
                <div
                  className={`p-2 rounded-md ${isActive ? "bg-white/20" : isDone ? "bg-[var(--primary-subtle)] text-[var(--primary)]" : "bg-[var(--surface-hover)]"}`}
                >
                  {isDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {s.title}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-2 ${isDone ? "bg-[var(--primary)]" : "bg-[var(--border-subtle)]"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* STEP CONTENT */}
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md p-8 shadow-xl shadow-black/5 min-h-[400px]">
        {/* PASO 1: SELECCIONAR PROVEEDOR */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-8">
              <div className="w-16 h-16 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-md flex items-center justify-center mx-auto mb-4">
                <Search size={32} />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                ¿A qué proveedor pertenece esta lista?
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Traeremos su margen de ganancia configurado para vincular los
                productos.
              </p>
            </div>

            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar proveedor por nombre o código..."
                className="w-full pl-12 pr-4 py-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-theme)]! focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all outline-none placeholder:text-[var(--text-theme)]/50"
                value={busquedaProv}
                onChange={(e) => setBusquedaProv(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {loadingProvs ? (
                <div className="py-10 text-center text-sm text-[var(--text-muted)] flex items-center justify-center">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : (
                proveedores?.map((p) => (
                  <button
                    key={p.codigoSecuencial}
                    onClick={() => {
                      setProveedorSeleccionado(p);
                      agregarAlerta({
                        type: "info",
                        message: `Margen detectado: ${p.atributos?.margenGanancia || 0}%`,
                      });
                    }}
                    className={`flex items-center justify-between p-4 rounded-md border transition-all ${proveedorSeleccionado?.codigoSecuencial === p.codigoSecuencial ? "bg-[var(--primary-subtle)] border-[var(--primary)] text-white shadow-lg" : "bg-[var(--surface)] border-[var(--border-subtle)] hover:border-[var(--primary)]/50 text-[var(--text-primary)]"}`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div
                        className={`w-10 h-10 rounded-md flex items-center justify-center font-bold ${proveedorSeleccionado?.codigoSecuencial === p.codigoSecuencial ? "bg-white/20" : "bg-[var(--primary-subtle)] text-[var(--primary)]"}`}
                      >
                        {(
                          p.razonSocial?.[0] ||
                          p.nombre?.[0] ||
                          "P"
                        ).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">
                          {p.razonSocial ||
                            `${p.nombre || ""} ${p.apellido || ""}`.trim() ||
                            "SIN NOMBRE"}
                        </p>
                        <p
                          className={`text-[10px] ${proveedorSeleccionado?.codigoSecuencial === p.codigoSecuencial ? "text-white/70" : "text-[var(--text-muted)]"}`}
                        >
                          ID: {p.codigoSecuencial.toString().padStart(4, "0")} •
                          Margen: {p.atributos?.margenGanancia || 0}%
                        </p>
                      </div>
                    </div>
                    {proveedorSeleccionado?.codigoSecuencial ===
                      p.codigoSecuencial && <CheckCircle2 size={20} />}
                  </button>
                ))
              )}
            </div>

            {proveedorSeleccionado && (
              <button
                onClick={() => setStep(2)}
                className="w-full py-4 mt-8 bg-[var(--primary-light)] text-white font-bold rounded-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20 cursor-pointer"
              >
                Siguiente Paso <ChevronRight size={20} />
              </button>
            )}
          </div>
        )}

        {/* PASO 2: SUBIR ARCHIVO Y DETECTAR CABECERA */}
        {step === 2 && (
          <div className="space-y-6">
            {!file ? (
              <div className="max-w-xl mx-auto py-12">
                <div className="text-center space-y-4 mb-8">
                  <div className="w-20 h-20 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-dashed border-[var(--primary)]/30 animate-pulse">
                    <Upload size={40} />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    Subir Lista de Precios
                  </h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Arrastrá tu archivo Excel (.xlsx o .xls) aquí o hacé clic
                    para buscar.
                  </p>
                </div>

                <label className="relative group cursor-pointer block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--surface-hover)] group-hover:border-[var(--primary)]/50 transition-all">
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx, .xls"
                      onChange={handleFileUpload}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <FileSpreadsheet
                        className="text-[var(--primary)]"
                        size={32}
                      />
                      <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                        Seleccionar Archivo
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <>
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    Detección de Archivo
                  </h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Haga clic en la fila que contiene los nombres de las
                    columnas (títulos).
                  </p>
                </div>

                <div className="border border-[var(--border-subtle)] rounded-md overflow-hidden shadow-inner bg-black/5">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--primary-subtle)]/30 text-[var(--text-theme)]!">
                        <th className="p-3 border-b border-[var(--border-subtle)] w-12">
                          Fila
                        </th>
                        <th className="p-3 border-b border-[var(--border-subtle)]">
                          Previsualización de Datos
                        </th>
                        <th className="p-3 border-b border-[var(--border-subtle)] text-right">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rawRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`group hover:bg-[var(--primary-subtle)]/10 transition-colors cursor-pointer ${headerIndex === idx ? "bg-[var(--primary-subtle)]/20" : ""}`}
                          onClick={() => confirmHeaders(idx)}
                        >
                          <td className="p-3 border-b border-[var(--border-subtle)] font-mono text-[var(--text-muted)]">
                            {idx + 1}
                          </td>
                          <td className="p-3 border-b border-[var(--border-subtle)]">
                            <div className="flex gap-2 overflow-hidden max-w-[800px]">
                              {row.slice(0, 8).map((cell, cidx) => (
                                <span
                                  key={cidx}
                                  className="px-2 py-1 bg-white/5 border border-[var(--border-subtle)] rounded text-[var(--text-primary)] whitespace-nowrap opacity-80 group-hover:opacity-100 uppercase text-[9px] font-bold"
                                >
                                  {String(cell || "-")}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 border-b border-[var(--border-subtle)] text-right">
                            <button
                              className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${headerIndex === idx ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-hover)] text-[var(--text-muted)] group-hover:bg-[var(--primary)] group-hover:text-white"}`}
                            >
                              {headerIndex === idx
                                ? "Seleccionada"
                                : "Es Cabecera"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ChevronLeft size={18} /> Volver
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: MAPEO Y ANCLA */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Lado Izquierdo: Configuración */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Mapa de Columnas
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Vinculá las columnas de tu Excel con los campos del sistema.
                  </p>
                </div>

                <div className="space-y-4">
                  {systemFields.map((field) => (
                    <div
                      key={field.key}
                      className="p-5 bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-md space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-[var(--text-theme)] uppercase tracking-widest flex items-center gap-2">
                          {field.label}
                          {field.required && (
                            <span className="text-red-400 font-black">*</span>
                          )}
                        </label>
                        {field.key === "codigoFabrica" && (
                          <div className="flex items-center gap-1.5 bg-[var(--primary)] text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase shadow-md shadow-[var(--primary)]/20 animate-pulse">
                            <Database size={10} /> Identificador Ancla
                          </div>
                        )}
                      </div>
                      <select
                        value={mapping[field.key] || ""}
                        onChange={(e) =>
                          setMapping((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className="w-full p-3 bg-white/20 border border-[var(--border-subtle)] rounded-md text-sm font-bold outline-none focus:border-[var(--primary)] transition-all text-[var(--text-theme)]"
                      >
                        <option
                          value=""
                          className="bg-[var(--surface)] text-[var(--text-theme)]"
                        >
                          -- Seleccionar Columna --
                        </option>
                        {headers.map((h, i) => (
                          <option
                            key={i}
                            value={h}
                            className="bg-[var(--surface)] text-[var(--text-theme)]"
                          >
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lado Derecho: Info y Ayuda */}
              <div className="space-y-6">
                <div className="p-6 bg-[var(--primary-subtle)] border border-[var(--primary)]/20 rounded-md space-y-4">
                  <div className="flex items-center gap-3 text-[var(--primary)]">
                    <Info size={24} />
                    <h4 className="font-bold">Información de Sincronización</h4>
                  </div>
                  <p className="text-sm text-[var(--primary)]/80 leading-relaxed">
                    Hemos detectado que el proveedor{" "}
                    <b>{proveedorSeleccionado.nombre}</b> tiene un margen del{" "}
                    <b>
                      {proveedorSeleccionado.atributos?.margenGanancia || 0}%
                    </b>
                    . Este valor se aplicará a todos los productos de la lista
                    durante el recálculo, a menos que mapees una columna
                    específica de ganancia.
                  </p>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] opacity-70">
                      <ArrowRight size={14} /> Los productos existentes se
                      actualizarán.
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] opacity-70">
                      <ArrowRight size={14} /> No se crearán duplicados (Usamos
                      el Ancla).
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-md">
                  <h4 className="text-xs font-black text-[var(--text-muted)] uppercase mb-4">
                    ¿Todo listo?
                  </h4>
                  <button
                    disabled={!mapping.codigoFabrica || !mapping.listaPrecio}
                    onClick={() => setStep(4)}
                    className="w-full py-4 bg-[var(--primary)]/20 border border-[var(--primary)] hover:bg-[var(--primary)]/30 text-[var(--text-theme)] font-bold rounded-md shadow-xl shadow-[var(--primary)]/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    Ver Vista Previa
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronLeft size={18} /> Volver
            </button>
          </div>
        )}

        {/* PASO 4: PREVIEW */}
        {step === 4 && (
          <div className="space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Vista Previa de Impacto
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Analizando los datos mapeados antes de enviarlos al servidor.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-md text-center space-y-2">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase">
                  Filas totales
                </p>
                <p className="text-3xl font-black text-[var(--text-primary)]">
                  {fullData.length - headerIndex - 1}
                </p>
              </div>
              <div className="p-6 bg-[var(--primary-subtle)]/30 border border-[var(--primary)]/20 rounded-md text-center space-y-2">
                <p className="text-[10px] font-black text-[var(--primary)] uppercase">
                  Margen Aplicar
                </p>
                <p className="text-3xl font-black text-[var(--primary)]">
                  {proveedorSeleccionado.atributos?.margenGanancia || 0}%
                </p>
              </div>
              <div className="p-6 bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-md text-center space-y-2">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase">
                  Clave Ancla
                </p>
                <p className="text-lg font-black text-[var(--text-primary)]">
                  {mapping.codigoFabrica}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-md flex items-center gap-4 max-w-lg">
                <AlertCircle className="text-amber-500 shrink-0" size={24} />
                <p className="text-xs text-amber-500 font-medium">
                  Esta acción buscará productos existentes y actualizará sus
                  costos y márgenes. Los cambios son permanentes una vez
                  ejecutados.
                </p>
              </div>

              <div className="flex gap-4 w-full max-w-md">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 flex justify-center items-center gap-2 py-4 bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold rounded-md border border-[var(--border-subtle)] hover:bg-[var(--surface)] transition-all cursor-pointer"
                >
                  Configurar Mapeo
                </button>
                <button
                  onClick={handleImport}
                  disabled={isProcessing}
                  className="flex-1 flex justify-center items-center gap-2 py-4 bg-[var(--primary)]/20  text-[var(--text-primary)] font-bold rounded-md border border-[var(--border-subtle)] hover:bg-[var(--primary)] transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Database className="animate-spin" size={18} />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Database size={18} />
                      Confirmar e Importar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASO 5: RESULTADO */}
        {step === 5 && results && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500 text-center">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                ¡Importación Completada!
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                El servidor ha terminado de procesar la lista del proveedor.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-6 bg-[var(--surface-hover)] border-2 border-green-500/20 rounded-md space-y-2">
                <TrendingUp className="text-green-500 mx-auto" size={24} />
                <p className="text-3xl font-black text-[var(--text-primary)]">
                  {results.stats?.actualizados || 0}
                </p>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase">
                  Actualizados
                </p>
              </div>
              <div className="p-6 bg-[var(--surface-hover)] border-2 border-blue-500/20 rounded-md space-y-2">
                <CheckCircle2 className="text-blue-500 mx-auto" size={24} />
                <p className="text-3xl font-black text-[var(--text-primary)]">
                  {results.stats?.creados || 0}
                </p>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase">
                  Nuevos Artículos
                </p>
              </div>
              <div className="p-6 bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-md space-y-2 opacity-60">
                <AlertCircle className="text-amber-500 mx-auto" size={24} />
                <p className="text-3xl font-black text-[var(--text-primary)]">
                  {results.stats?.errores || 0}
                </p>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                  Errores
                </p>
              </div>
            </div>

            {results.erroresDetalle?.length > 0 && (
              <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-md text-left">
                <h4 className="text-[11px] font-black text-red-400 uppercase mb-3 flex items-center gap-2">
                  <AlertCircle size={14} /> Detalle de Errores (Primeros 10)
                </h4>
                <ul className="space-y-1">
                  {results.erroresDetalle.map((err, i) => (
                    <li
                      key={i}
                      className="text-[10px] text-red-500/80 font-medium"
                    >
                      • {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => onExito && onExito()}
              className="w-full py-4 bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold rounded-md border border-[var(--border-subtle)] hover:bg-[var(--surface)] transition-all cursor-pointer"
            >
              Finalizar y Salir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
