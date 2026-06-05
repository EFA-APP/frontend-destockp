import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { CrearMateriaPrimaApi } from "../../../Backend/Articulos/api/MateriaPrima/materiaprima.api";
import ModalDetalleBase from "../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../UI/ModalDetalleBase/ModalDetalle";
import { GuardarIcono, CanastaIcono } from "../../../assets/Icons";
import {
  Trash2,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  UploadCloud,
  ChevronRight,
  Info,
  Layers,
  XCircle,
} from "lucide-react";

const ModalCargaMasivaMateriaPrima = ({ open, onClose, onExito }) => {
  const location = useLocation();
  const esEspecie = location.pathname.includes("/inventario/especies");

  const [activeTab, setActiveTab] = useState("paste"); // "paste" | "upload"
  const [pastedText, setPastedText] = useState("");
  const [fileData, setFileData] = useState([]);
  const [defaultUnidad, setDefaultUnidad] = useState("KG");
  const [defaultTipo, setDefaultTipo] = useState("INSUMO");

  // Estados de carga e importación
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 });
  const [erroresCarga, setErroresCarga] = useState([]); // { nombre: string, error: string }
  const [exitosCarga, setExitosCarga] = useState([]); // { nombre: string }
  const [errorGeneral, setErrorGeneral] = useState(null);

  const labelPlural = esEspecie ? "Especies" : "Materias Primas";
  const labelSingular = esEspecie ? "Especie" : "Materia Prima";

  // Re-procesa el texto pegado cuando cambian las opciones por defecto
  useEffect(() => {
    if (activeTab === "paste" && pastedText.trim()) {
      procesarTexto(pastedText);
    }
  }, [defaultUnidad, defaultTipo, pastedText, activeTab]);

  const descargarPlantilla = () => {
    const headers = [
      "Nombre (Obligatorio)",
      "Categoría (INSUMO/FRUTA)",
      "Unidad Medida (KG/GR/UND/LT/ML)",
      "Stock Inicial",
      "Cant. x Envase",
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
    XLSX.writeFile(
      workbook,
      esEspecie
        ? "plantilla_carga_masiva_especies.xlsx"
        : "plantilla_carga_masiva_insumos.xlsx"
    );
  };

  const procesarTexto = (text) => {
    if (!text.trim()) {
      setFileData([]);
      return;
    }

    const lines = text.split("\n");
    const parsed = lines
      .map((line) => {
        if (!line.trim()) return null;

        // Soporta tabulaciones (pasted from Excel) o comas
        let parts = line.split("\t");
        if (parts.length === 1) {
          parts = line.split(",");
        }

        const nombre = parts[0]?.trim();
        if (!nombre) return null;

        const tipoRaw = parts[1]?.trim()?.toUpperCase();
        const unidadRaw = parts[2]?.trim()?.toUpperCase();
        const stockRaw = parseFloat(parts[3]);
        const cantPackRaw = parseFloat(parts[4]);

        return {
          nombre,
          tipo: esEspecie
            ? "INSUMO"
            : tipoRaw === "FRUTA" || tipoRaw === "INSUMO"
            ? tipoRaw
            : defaultTipo,
          unidadMedida: ["KG", "GR", "UND", "LT", "ML"].includes(unidadRaw)
            ? unidadRaw
            : defaultUnidad,
          stock: isNaN(stockRaw) ? 0 : stockRaw,
          cantidadPorPaquete: isNaN(cantPackRaw) ? null : cantPackRaw,
        };
      })
      .filter(Boolean);

    setFileData(parsed);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (data.length <= 1) {
          setErrorGeneral("El archivo está vacío o no tiene encabezados.");
          return;
        }

        const rows = data.slice(1);
        const parsedRows = rows
          .map((row) => {
            const nombre = row[0]?.toString()?.trim();
            if (!nombre) return null;

            const tipoRaw = row[1]?.toString()?.toUpperCase()?.trim();
            const unidadRaw = row[2]?.toString()?.toUpperCase()?.trim();
            const stockRaw = parseFloat(row[3]);
            const cantPackRaw = parseFloat(row[4]);

            return {
              nombre,
              tipo: esEspecie
                ? "INSUMO"
                : tipoRaw === "FRUTA" || tipoRaw === "INSUMO"
                ? tipoRaw
                : defaultTipo,
              unidadMedida: ["KG", "GR", "UND", "LT", "ML"].includes(unidadRaw)
                ? unidadRaw
                : defaultUnidad,
              stock: isNaN(stockRaw) ? 0 : stockRaw,
              cantidadPorPaquete: isNaN(cantPackRaw) ? null : cantPackRaw,
            };
          })
          .filter(Boolean);

        setFileData(parsedRows);
        setErrorGeneral(null);
      } catch (err) {
        console.error(err);
        setErrorGeneral("Error al leer el archivo Excel. Asegúrate de usar el formato correcto.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    if (fileData.length === 0 || cargando) return;

    setCargando(true);
    setErrorGeneral(null);
    setErroresCarga([]);
    setExitosCarga([]);
    setProgreso({ actual: 0, total: fileData.length });

    const items = [...fileData];
    const total = items.length;

    // Función auxiliar para dividir en trozos (chunks)
    const chunkArray = (array, size) => {
      const chunks = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    };

    // Procesamos en paralelo en tandas de 5 para máxima eficiencia ("cargar más rápido")
    const lotesDePeticiones = chunkArray(items, 5);
    let contadorCompletados = 0;

    for (const lote of lotesDePeticiones) {
      await Promise.all(
        lote.map(async (item) => {
          try {
            const payload = {
              nombre: item.nombre,
              tipo: item.tipo,
              unidadMedida: item.unidadMedida,
              stock: item.stock,
              cantidadPorPaquete: item.cantidadPorPaquete,
              activo: true,
            };
            await CrearMateriaPrimaApi(payload);
            setExitosCarga((prev) => [...prev, { nombre: item.nombre }]);
          } catch (err) {
            console.error(`Error al importar ${item.nombre}:`, err);
            // Captura mensaje del servidor de forma robusta
            const rawErrorMsg = err?.response?.data?.message;
            const errorMsg = Array.isArray(rawErrorMsg)
              ? rawErrorMsg.join(", ")
              : typeof rawErrorMsg === "object" && rawErrorMsg !== null
              ? JSON.stringify(rawErrorMsg)
              : rawErrorMsg || err?.message || "Error desconocido";

            setErroresCarga((prev) => [
              ...prev,
              { nombre: item.nombre, error: errorMsg },
            ]);
          } finally {
            contadorCompletados++;
            setProgreso((prev) => ({ ...prev, actual: contadorCompletados }));
          }
        })
      );
    }

    setCargando(false);
    onExito && onExito();
  };

  const handleClose = () => {
    if (cargando) return;
    setFileData([]);
    setPastedText("");
    setErrorGeneral(null);
    setErroresCarga([]);
    setExitosCarga([]);
    setProgreso({ actual: 0, total: 0 });
    onClose();
  };

  const clearPastedText = () => {
    setPastedText("");
    setFileData([]);
  };

  // Contenido de la pestaña de Pegado
  const pasteTabContent = (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-black text-black/50 uppercase tracking-widest flex items-center gap-1.5">
            <ClipboardList size={14} className="text-[var(--primary)]" />
            Pega tu listado de nombres (uno por línea):
          </label>
          {pastedText && (
            <button
              onClick={clearPastedText}
              className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
        <textarea
          placeholder={
            esEspecie
              ? "Soja\nTrigo\nMaíz\nSorgo\nCebada"
              : "Bolsas de Polietileno\nHilo de Coser\nInsecticida Líquido\nPallets de Madera"
          }
          className="w-full h-28 md:h-36 bg-black/10 border border-black/10 rounded-md p-3 text-xs text-black focus:outline-none focus:border-[var(--primary)]/30 font-mono leading-relaxed"
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
        />
        <p className="text-[10px] text-black/30 font-bold uppercase tracking-wider">
          💡 Puedes copiar una columna de nombres de Excel y pegarla aquí directamente. Las pestañas y comas se detectarán automáticamente.
        </p>
      </div>

      {/* Valores por defecto de configuración rápida */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 bg-black/5 p-3 md:p-4 rounded-md border border-black/5 shadow-inner">
        {!esEspecie && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-wider flex items-center gap-1">
              <Layers size={10} /> Categoría por Defecto
            </span>
            <select
              value={defaultTipo}
              onChange={(e) => setDefaultTipo(e.target.value)}
              className="w-full bg-[var(--surface)] border border-black/10 rounded-md p-2 text-xs text-black font-black uppercase focus:outline-none"
            >
              <option value="INSUMO">INSUMO - Materia prima base</option>
              <option value="FRUTA">FRUTA - Insumo fresco/agrícola</option>
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-1">
          <span className="text-[10px] font-black text-black/40 uppercase tracking-wider flex items-center gap-1">
            <Info size={10} /> Unidad de Medida por Defecto
          </span>
          <select
            value={defaultUnidad}
            onChange={(e) => setDefaultUnidad(e.target.value)}
            className="w-full bg-[var(--surface)] border border-black/10 rounded-md p-2 text-xs text-black font-black uppercase focus:outline-none"
          >
            <option value="KG">Masa: Kilogramos (KG)</option>
            <option value="GR">Masa: Gramos (GR)</option>
            <option value="UND">Conteo: Unidades (UND)</option>
            <option value="LT">Volumen: Litros (LT)</option>
            <option value="ML">Volumen: Mililitros (ML)</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Contenido de la pestaña de Subida Excel
  const uploadTabContent = (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 md:gap-4">
        <button
          onClick={descargarPlantilla}
          className="flex-1 flex items-center justify-center gap-2 md:gap-3 px-4 py-3 md:px-6 md:py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-md text-emerald-600 transition-all cursor-pointer group"
        >
          <Download size={20} className="group-hover:-translate-y-0.5 transition-transform" />
          <div className="text-left">
            <div className="text-xs font-black uppercase tracking-wider">
              Descargar Plantilla
            </div>
            <div className="text-[10px] opacity-60 uppercase font-bold tracking-widest">
              Formato Excel (.xlsx)
            </div>
          </div>
        </button>

        <label className="flex-1 flex items-center justify-center gap-2 md:gap-3 px-4 py-3 md:px-6 md:py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-md text-blue-600 transition-all cursor-pointer group">
          <UploadCloud size={20} className="group-hover:scale-105 transition-transform" />
          <div className="text-left">
            <div className="text-xs font-black uppercase tracking-wider">
              Subir Archivo
            </div>
            <div className="text-[10px] opacity-60 uppercase font-bold tracking-widest">
              Seleccionar Excel completado
            </div>
          </div>
          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      <div className="bg-black/5 p-3 md:p-4 rounded-md border border-black/5 text-[11px] font-bold text-black/50 uppercase leading-relaxed space-y-1">
        <p className="flex items-center gap-1.5 text-black/70">
          <Info size={12} className="text-[var(--primary)] shrink-0" />
          ESTRUCTURA DE COLUMNAS DE LA PLANTILLA:
        </p>
        <ol className="list-decimal pl-5 space-y-0.5 mt-2 font-mono">
          <li>Nombre <span className="text-rose-500 font-black">* Obligatorio</span></li>
          <li>Categoría (INSUMO o FRUTA, opcional)</li>
          <li>Unidad Medida (KG/GR/UND/LT/ML, opcional, por defecto {defaultUnidad})</li>
          <li>Stock Inicial (opcional, por defecto 0)</li>
          <li>Cant. x Envase (opcional, peso por envase)</li>
        </ol>
      </div>
    </div>
  );

  const content = (
    <div className="space-y-4 md:space-y-5 py-1">
      {/* Selector de Pestaña */}
      <div className="flex bg-black/10 p-1 border border-black/5 rounded-md self-start shrink-0">
        <button
          onClick={() => {
            setActiveTab("paste");
            setFileData([]);
          }}
          disabled={cargando}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-[11px] font-black uppercase tracking-[0.1em] cursor-pointer transition-all ${
            activeTab === "paste"
              ? "text-[var(--primary)] bg-[var(--surface)] border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
              : "text-black/40 hover:text-black/70"
          }`}
        >
          <ClipboardList size={14} />
          Pegar Lista
        </button>
        <button
          onClick={() => {
            setActiveTab("upload");
            setFileData([]);
          }}
          disabled={cargando}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-[11px] font-black uppercase tracking-[0.1em] cursor-pointer transition-all ${
            activeTab === "upload"
              ? "text-[var(--primary)] bg-[var(--surface)] border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
              : "text-black/40 hover:text-black/70"
          }`}
        >
          <FileSpreadsheet size={14} />
          Subir Excel
        </button>
      </div>

      {/* Renderizado de Pestaña */}
      {activeTab === "paste" ? pasteTabContent : uploadTabContent}

      {/* Alertas de error general */}
      {errorGeneral && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-md p-4 flex items-center gap-3 text-rose-500 text-xs font-bold shadow-inner animate-pulse">
          <AlertCircle size={18} />
          {errorGeneral}
        </div>
      )}

      {/* Panel de progreso de carga en curso */}
      {cargando && (
        <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-md p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-[var(--primary)] uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
              </span>
              Importando registros a la Base de Datos...
            </span>
            <span>
              {progreso.actual} / {progreso.total} ({Math.round((progreso.actual / progreso.total) * 100)}%)
            </span>
          </div>
          {/* Barra de progreso */}
          <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] transition-all duration-300 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
              style={{ width: `${(progreso.actual / progreso.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Resultados e Informes de la Carga Realizada */}
      {(exitosCarga.length > 0 || erroresCarga.length > 0) && !cargando && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Exitos */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-md p-4 space-y-3">
            <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
              <CheckCircle2 size={14} />
              Correctos ({exitosCarga.length})
            </h4>
            <div className="max-h-[150px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {exitosCarga.length === 0 ? (
                <span className="text-[10px] text-black/20 uppercase font-black">Ninguno importado</span>
              ) : (
                exitosCarga.map((ex, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-bold text-black/70 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                    <span className="truncate">{ex.nombre}</span>
                    <span className="text-[9px] bg-emerald-600/15 text-emerald-600 px-1 rounded font-black tracking-widest">OK</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Errores */}
          <div className="bg-rose-500/5 border border-rose-500/15 rounded-md p-4 space-y-3">
            <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-rose-500/10 pb-2">
              <XCircle size={14} />
              Fallidos ({erroresCarga.length})
            </h4>
            <div className="max-h-[150px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {erroresCarga.length === 0 ? (
                <span className="text-[10px] text-black/20 uppercase font-black">Ningún error detectado</span>
              ) : (
                erroresCarga.map((er, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5 text-[11px] font-bold bg-rose-500/5 p-2 rounded border border-rose-500/10">
                    <span className="text-black/80 font-black truncate">{er.nombre}</span>
                    <span className="text-[9px] text-rose-500 uppercase leading-normal tracking-tight font-black">{er.error}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Previsualización antes de importar */}
      {fileData.length > 0 && !cargando && exitosCarga.length === 0 && erroresCarga.length === 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <label className="text-[12px] font-black text-black/50 uppercase tracking-widest">
              Previsualización de Carga ({fileData.length})
            </label>
            <span className="text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-widest">
              Pendientes
            </span>
          </div>

          <div className="space-y-1.5 max-h-[145px] md:max-h-[200px] overflow-y-auto pr-2 custom-scrollbar border border-black/5 p-2 rounded-md bg-black/5 shadow-inner">
            {fileData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-[var(--surface)] p-3 rounded-md border border-black/5 hover:border-black/10 transition-all shadow-sm"
              >
                <div className="w-8 h-8 rounded-md bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <CanastaIcono size={16} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-black truncate uppercase">
                    {item.nombre}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 overflow-hidden text-[10px] font-black text-black/35 uppercase tracking-wide">
                    <span>{item.tipo}</span>
                    <span>•</span>
                    <span className="text-[var(--primary)]">{item.unidadMedida}</span>
                    <span>•</span>
                    <span className="text-emerald-600">Stock Inicial: {item.stock}</span>
                    {item.cantidadPorPaquete && (
                      <>
                        <span>•</span>
                        <span>Envase: {item.cantidadPorPaquete} kg</span>
                      </>
                    )}
                  </div>
                </div>
                <CheckCircle2 size={16} className="text-emerald-500/40 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between w-full">
      <button
        onClick={handleClose}
        disabled={cargando}
        className="px-5 py-2 text-xs font-black text-black/50 hover:text-black uppercase tracking-widest cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {exitosCarga.length > 0 || erroresCarga.length > 0 ? "Listo / Cerrar" : "Cancelar"}
      </button>

      {exitosCarga.length === 0 && erroresCarga.length === 0 && (
        <button
          onClick={handleSubmit}
          disabled={fileData.length === 0 || cargando}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-black rounded-md font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/10 cursor-pointer active:scale-[0.98] transition-all"
        >
          {cargando ? (
            <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <GuardarIcono size={14} />
          )}
          {cargando ? "Importando..." : "Realizar Carga Masiva"}
        </button>
      )}
    </div>
  );

  return (
    <ModalDetalleBase open={open} onClose={handleClose} width="max-w-2xl">
      <ModalDetalle
        title={`Carga Masiva de ${labelPlural}`}
        icon={<ClipboardList size={18} />}
        onClose={handleClose}
        footer={footer}
      >
        {content}
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalCargaMasivaMateriaPrima;
