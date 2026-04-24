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
  Info,
  Loader2,
  X,
} from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useAlertas } from "../../../../store/useAlertas";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { axiosInitial } from "../../../../Backend/Config";

const STEPS = [
  { id: 1, label: "Proveedor" },
  { id: 2, label: "Archivo" },
  { id: 3, label: "Mapeo" },
  { id: 4, label: "Preview" },
  { id: 5, label: "Resultado" },
];

export default function ImportadorPrecios({ onExito, onClose }) {
  const [step, setStep] = useState(1);
  const { usuario } = useAuthStore();
  const { agregarAlerta } = useAlertas();

  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [file, setFile] = useState(null);
  const [rawRows, setRawRows] = useState([]);
  const [headerIndex, setHeaderIndex] = useState(0);
  const [headers, setHeaders] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [mapping, setMapping] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [incluirIva, setIncluirIva] = useState(false);
  const [tasaIva, setTasaIva] = useState(21);
  const [busquedaProv, setBusquedaProv] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busquedaProv), 400);
    return () => clearTimeout(t);
  }, [busquedaProv]);

  const { contactos: proveedores, cargandoContactos: loadingProvs } =
    useContactos({
      tipoEntidad: "PROV",
      busqueda: busquedaDebounced,
      pagina: 1,
      limite: 50,
    });

  const systemFields = [
    { key: "codigoFabrica", label: "Código de Fábrica (ID)", required: true },
    { key: "precioLista", label: "Costo de Lista", required: true },
    { key: "nombre", label: "Nombre / Descripción", required: false },
  ];

  const handleFileUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setRawRows(data.slice(0, 12));
      setFullData(data);
      setStep(2);
    };
    reader.readAsBinaryString(f);
  };

  const autoMap = (hdrs) => {
    const m = {};
    hdrs.forEach((h) => {
      const l = String(h).toLowerCase();
      if (l.includes("cod") || l.includes("ref")) m["codigoFabrica"] = h;
      if (l.includes("precio") || l.includes("costo") || l.includes("lista"))
        m["precioLista"] = h;
      if (l.includes("nom") || l.includes("desc") || l.includes("art"))
        m["nombre"] = h;
    });
    setMapping(m);
  };

  const confirmHeaders = (idx) => {
    setHeaderIndex(idx);
    const hdrs = rawRows[idx];
    setHeaders(hdrs);
    autoMap(hdrs);
    setStep(3);
  };

  const handleImport = async () => {
    if (!proveedorSeleccionado)
      return agregarAlerta({
        type: "error",
        message: "Seleccione un proveedor",
      });
    if (!mapping.codigoFabrica || !mapping.precioLista)
      return agregarAlerta({ type: "error", message: "Mapee Código y Costo" });

    setIsProcessing(true);
    try {
      const clean = (val) => {
        if (typeof val === "number") return parseFloat(val.toFixed(2));
        if (!val) return 0;
        const n = parseFloat(
          String(val)
            .replace(/[$\s]/g, "")
            .replace(/\./g, "")
            .replace(",", "."),
        );
        return isNaN(n) ? 0 : parseFloat(n.toFixed(2));
      };

      const processedData = fullData
        .slice(headerIndex + 1)
        .map((row) => {
          const obj = {};
          Object.keys(mapping).forEach((key) => {
            const idx = headers.indexOf(mapping[key]);
            if (idx !== -1) {
              const raw = row[idx];
              const l = key.toLowerCase();
              if (
                l.includes("precio") ||
                l.includes("margen") ||
                l.includes("costo") ||
                l.includes("lista")
              ) {
                let v = clean(raw);
                if (key === "precioLista" && incluirIva)
                  v = parseFloat((v * (1 + tasaIva / 100)).toFixed(2));
                obj[key] = v;
              } else {
                obj[key] = raw;
              }
            }
          });
          return obj;
        })
        .filter((i) => i["codigoFabrica"]);

      const payload = {
        atributosExtra: {
          codigoProveedor: proveedorSeleccionado.codigoSecuencial,
          nombreProveedor:
            proveedorSeleccionado.razonSocial || proveedorSeleccionado.nombre,
          margenGanancia: Number(
            proveedorSeleccionado.atributos?.margenGanancia || 0,
          ),
        },
        anclaKey: "codigoFabrica",
        productos: processedData,
      };

      const res = await axiosInitial.post(
        "/producto/importar-lista-precios",
        payload,
        { showLoader: false },
      );
      setResults(res.data);
      setStep(5);
      agregarAlerta({ type: "exito", message: "Importación completada" });
    } catch (err) {
      agregarAlerta({
        type: "error",
        message: "Error: " + (err.response?.data?.message || err.message),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ── STEPPER HEADER ─────────────────────────────────────────────
  const StepBar = () => (
    <div className="flex items-center px-5 py-3 border-b border-black/5 bg-[var(--fill)] gap-1">
      {STEPS.map((s, i) => {
        const done = step > s.id;
        const active = step === s.id;
        return (
          <React.Fragment key={s.id}>
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-black uppercase tracking-widest transition-all
              ${active ? "bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30" : done ? "text-emerald-600" : "text-black/50"}`}
            >
              {done ? (
                <CheckCircle2 size={11} />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">
                  {s.id}
                </span>
              )}
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 ${done ? "bg-emerald-500" : "bg-black/10"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // ── PASO 1: PROVEEDOR ──────────────────────────────────────────
  const Paso1 = () => (
    <div className="p-5 space-y-4">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50"
          size={14}
        />
        <input
          autoFocus
          type="text"
          placeholder="Buscar proveedor..."
          className="w-full pl-9 pr-4 py-2.5 bg-[var(--surface-hover)] border border-black/10 rounded-md text-sm text-black focus:border-[var(--primary)] focus:outline-none"
          value={busquedaProv}
          onChange={(e) => setBusquedaProv(e.target.value)}
        />
      </div>

      <div className="space-y-1.5 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
        {loadingProvs ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-black/60" />
          </div>
        ) : proveedores?.length === 0 ? (
          <p className="text-center text-xs text-black/60 py-6">
            Sin resultados
          </p>
        ) : (
          proveedores?.map((p) => {
            const sel =
              proveedorSeleccionado?.codigoSecuencial === p.codigoSecuencial;
            return (
              <button
                key={p.codigoSecuencial}
                onClick={() => {
                  setProveedorSeleccionado(p);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-md border text-left transition-all
                  ${sel ? "bg-[var(--primary)]/10 border-[var(--primary)]/40 text-black" : "bg-[var(--surface)] border-black/5 hover:border-black/20 text-black"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-black shrink-0
                    ${sel ? "bg-[var(--primary)]/20 text-black" : "bg-black/10 text-black/70"}`}
                  >
                    {(p.razonSocial?.[0] || p.nombre?.[0] || "P").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold leading-tight">
                      {p.razonSocial ||
                        `${p.nombre || ""} ${p.apellido || ""}`.trim() ||
                        "SIN NOMBRE"}
                    </p>
                    <p className="text-[11px] text-black/70 font-medium">
                      #{String(p.codigoSecuencial).padStart(4, "0")} · Margen{" "}
                      {p.atributos?.margenGanancia || 0}%
                    </p>
                  </div>
                </div>
                {sel && (
                  <CheckCircle2
                    size={16}
                    className="text-[var(--primary)] shrink-0"
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {proveedorSeleccionado && (
        <button
          onClick={() => setStep(2)}
          className="w-full py-2.5 bg-black text-white font-black text-[12px] uppercase tracking-widest rounded-md flex items-center justify-center gap-2 hover:bg-black/80 transition-colors"
        >
          Siguiente <ChevronRight size={16} />
        </button>
      )}
    </div>
  );

  // ── PASO 2: ARCHIVO ────────────────────────────────────────────
  const Paso2 = () => (
    <div className="p-5 space-y-4">
      {!file ? (
        <label className="cursor-pointer block">
          <div className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-black/15 rounded-md bg-[var(--surface-hover)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 transition-all">
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
            <FileSpreadsheet size={28} className="text-[var(--primary)] mb-2" />
            <span className="text-[12px] font-black uppercase tracking-widest text-black/70">
              Seleccionar Excel (.xlsx / .xls)
            </span>
          </div>
        </label>
      ) : (
        <>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[12px] font-black text-black/80 uppercase tracking-widest">
              Selecciona la fila de cabeceras
            </p>
            <button
              onClick={() => {
                setFile(null);
                setRawRows([]);
              }}
              className="text-[11px] text-red-400 hover:text-red-600 font-bold flex items-center gap-1"
            >
              <X size={12} /> Cambiar archivo
            </button>
          </div>
          <div className="border border-black/10 rounded-md overflow-hidden">
            <table className="w-full text-[11px]">
              <thead className="bg-black/5">
                <tr>
                  <th className="p-2 text-left text-black/70 font-black w-10">
                    #
                  </th>
                  <th className="p-2 text-left text-black/70 font-black">
                    Datos
                  </th>
                  <th className="p-2 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {rawRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`cursor-pointer border-t border-black/5 hover:bg-[var(--primary)]/5 ${headerIndex === idx ? "bg-[var(--primary)]/10" : ""}`}
                    onClick={() => confirmHeaders(idx)}
                  >
                    <td className="p-2 font-mono text-black/30">{idx + 1}</td>
                    <td className="p-2">
                      <div className="flex gap-1.5 overflow-hidden">
                        {row.slice(0, 6).map((cell, ci) => (
                          <span
                            key={ci}
                            className="px-1.5 py-0.5 bg-black/5 rounded text-black/80 whitespace-nowrap text-[10px] font-bold"
                          >
                            {String(cell || "–")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-black uppercase ${headerIndex === idx ? "bg-[var(--primary)] text-black" : "bg-black/5 text-black/60"}`}
                      >
                        {headerIndex === idx ? "✓ Cabecera" : "Usar"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <button
        onClick={() => setStep(1)}
        className="text-[11px] font-bold text-black/60 hover:text-black flex items-center gap-1"
      >
        <ChevronLeft size={13} /> Volver
      </button>
    </div>
  );

  // ── PASO 3: MAPEO ──────────────────────────────────────────────
  const Paso3 = () => (
    <div className="p-5 space-y-4">
      {/* Mapeo de columnas */}
      <div className="space-y-2">
        <p className="text-[11px] font-black text-black/70 uppercase tracking-widest">
          Mapeo de Columnas
        </p>
        {systemFields.map((f) => (
          <div
            key={f.key}
            className="flex items-center gap-3 p-2.5 bg-[var(--surface-hover)] border border-black/5 rounded-md"
          >
            <div className="w-36 shrink-0">
              <p className="text-[11px] font-black text-black leading-tight">
                {f.label}
              </p>
              {f.required && (
                <span className="text-[9px] text-red-400 font-bold">
                  REQUERIDO
                </span>
              )}
            </div>
            <ArrowRight size={12} className="text-black/40 shrink-0" />
            <select
              value={mapping[f.key] || ""}
              onChange={(e) =>
                setMapping((prev) => ({ ...prev, [f.key]: e.target.value }))
              }
              className="flex-1 bg-white border border-black/10 rounded-md px-2 py-1.5 text-[12px] font-bold text-black focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="">-- columna --</option>
              {headers.map((h, i) => (
                <option key={i} value={h}>
                  {h}
                </option>
              ))}
            </select>
            {mapping[f.key] && (
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* IVA toggle */}
      <div className="flex items-center justify-between p-3 bg-[var(--surface-hover)] border border-black/5 rounded-md">
        <div>
          <p className="text-[12px] font-black text-black">
            Incluir IVA al Costo
          </p>
          <p className="text-[10px] text-black/65 font-medium">
            Multiplica el precio de lista por (1 + tasa)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {incluirIva && (
            <div className="relative">
              <input
                type="number"
                value={tasaIva}
                onChange={(e) => setTasaIva(parseFloat(e.target.value) || 0)}
                className="w-14 bg-white border border-black/10 rounded px-2 py-1 text-xs font-black text-black text-center focus:outline-none"
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-black/60">
                %
              </span>
            </div>
          )}
          <button
            onClick={() => setIncluirIva(!incluirIva)}
            className={`w-9 h-5 rounded-full relative transition-colors ${incluirIva ? "bg-emerald-500" : "bg-black/15"}`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${incluirIva ? "left-4" : "left-0.5"}`}
            />
          </button>
        </div>
      </div>

      {/* Info proveedor */}
      {proveedorSeleccionado && (
        <div className="flex items-start gap-2 p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-md">
          <Info size={14} className="text-[var(--primary)] mt-0.5 shrink-0" />
          <p className="text-[11px] text-[var(--primary)]/80 font-medium leading-relaxed">
            <b>
              {proveedorSeleccionado.razonSocial ||
                proveedorSeleccionado.nombre}
            </b>{" "}
            tiene margen del{" "}
            <b>{proveedorSeleccionado.atributos?.margenGanancia || 0}%</b>. Se
            aplica a todos los productos salvo que mapees la columna de margen.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={() => setStep(2)}
          className="text-[11px] font-bold text-black/60 hover:text-black flex items-center gap-1"
        >
          <ChevronLeft size={13} /> Volver
        </button>
        <button
          disabled={!mapping.codigoFabrica || !mapping.precioLista}
          onClick={() => setStep(4)}
          className="px-5 py-2 bg-black text-white text-[12px] font-black uppercase tracking-widest rounded-md disabled:opacity-30 hover:bg-black/80 transition-colors"
        >
          Ver Preview →
        </button>
      </div>
    </div>
  );

  // ── PASO 4: PREVIEW / CONFIRMAR ────────────────────────────────
  const Paso4 = () => (
    <div className="p-5 space-y-4">
      {/* Stats compactas */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Filas",
            value: fullData.length - headerIndex - 1,
            color: "text-black",
          },
          {
            label: "Margen",
            value: `${proveedorSeleccionado?.atributos?.margenGanancia || 0}%`,
            color: "text-[var(--primary)]",
          },
          {
            label: "IVA costo",
            value: incluirIva ? `${tasaIva}%` : "No",
            color: incluirIva ? "text-emerald-600" : "text-black/50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="p-3 bg-[var(--surface-hover)] border border-black/5 rounded-md text-center"
          >
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black text-black/65 uppercase tracking-widest mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Mapeo resumen */}
      <div className="p-3 bg-[var(--surface-hover)] border border-black/5 rounded-md space-y-1.5">
        <p className="text-[10px] font-black text-black/70 uppercase tracking-widest mb-2">
          Mapeo confirmado
        </p>
        {systemFields
          .filter((f) => mapping[f.key])
          .map((f) => (
            <div
              key={f.key}
              className="flex items-center justify-between text-[12px]"
            >
              <span className="text-black/75 font-medium">{f.label}</span>
              <span className="font-black text-black bg-black/5 px-2 py-0.5 rounded">
                {mapping[f.key]}
              </span>
            </div>
          ))}
      </div>

      {/* Aviso */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
        <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-700 font-medium">
          Esta acción actualizará costos y márgenes de los productos existentes.
          Los cambios son permanentes.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(3)}
          className="flex-1 py-2.5 border border-black/15 rounded-md text-[12px] font-black text-black/75 hover:text-black hover:border-black/50 transition-colors"
        >
          Editar Mapeo
        </button>
        <button
          onClick={handleImport}
          disabled={isProcessing}
          className="flex-[2] py-2.5 bg-black text-white rounded-md text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black/80 disabled:opacity-50 transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Procesando...
            </>
          ) : (
            <>
              <Database size={14} /> Confirmar e Importar
            </>
          )}
        </button>
      </div>
    </div>
  );

  // ── PASO 5: RESULTADO ──────────────────────────────────────────
  const Paso5 = () => (
    <div className="p-5 space-y-4">
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-emerald-600" />
        </div>
        <p className="text-lg font-black text-black uppercase tracking-tight">
          ¡Importación Completada!
        </p>
        <p className="text-[12px] text-black/65 font-medium">
          El servidor procesó la lista correctamente.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Actualizados",
            value: results?.stats?.actualizados || 0,
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-200",
          },
          {
            label: "Nuevos",
            value: results?.stats?.creados || 0,
            color: "text-blue-600",
            bg: "bg-blue-50 border-blue-200",
          },
          {
            label: "Errores",
            value: results?.stats?.errores || 0,
            color: "text-red-500",
            bg: "bg-red-50 border-red-200",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`p-3 border rounded-md text-center ${s.bg}`}
          >
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black text-black/70 uppercase tracking-widest">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {results?.erroresDetalle?.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-[11px] font-black text-red-500 uppercase mb-2 flex items-center gap-1">
            <AlertCircle size={12} /> Detalle de Errores
          </p>
          <ul className="space-y-0.5">
            {results.erroresDetalle.slice(0, 8).map((err, i) => (
              <li key={i} className="text-[11px] text-red-600 font-medium">
                • {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => onExito && onExito()}
        className="w-full py-2.5 bg-black text-white text-[12px] font-black uppercase tracking-widest rounded-md hover:bg-black/80 transition-colors"
      >
        Finalizar y Cerrar
      </button>
    </div>
  );

  return (
    <div>
      <StepBar />
      {step === 1 && <Paso1 />}
      {step === 2 && <Paso2 />}
      {step === 3 && <Paso3 />}
      {step === 4 && <Paso4 />}
      {step === 5 && results && <Paso5 />}
    </div>
  );
}
