import { useState, useRef } from "react";

/**
 * Convierte un archivo a su representación base64 (sin el prefijo
 * `data:...;base64,` de `FileReader.readAsDataURL`), que es lo que espera
 * `PrevisualizarImportacionObraSocial.casodeuso.ts` en `archivoBase64`
 * (Bug 1, progress/impl_obra-sociales-importaciones.md): el parseo del
 * Excel (encabezados, filas, fórmulas) es 100% responsabilidad del backend
 * (adaptador NOBIS/SMG); este paso solo sube el archivo tal cual.
 */
const leerArchivoComoBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultado = reader.result || "";
      const base64 = String(resultado).split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error || new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });

const PasoCargaArchivo = ({ obraSocial, onArchivoLeido, onVolver, isIntegrated = false, disabled = false }) => {
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const fileInputRef = useRef(null);

  const procesarArchivo = async (file) => {
    if (disabled || cargando) return;
    setError(null);
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls') {
      setError("El archivo debe ser un Excel (.xlsx o .xls)");
      return;
    }

    setCargando(true);
    try {
      const base64 = await leerArchivoComoBase64(file);
      onArchivoLeido({ base64, rawFile: file });
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al leer el archivo.");
    } finally {
      setCargando(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    if (disabled || cargando) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      procesarArchivo(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {!isIntegrated && (
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-[20px] font-bold text-[var(--color-neutral-text-main)]">2. Cargar Archivo Excel</h2>
          <p className="text-[14px] text-[var(--color-neutral-text-muted)] max-w-2xl">
            Sube el archivo de liquidación correspondiente a <strong className="text-[var(--color-neutral-text-main)]">{obraSocial?.razonSocial || `${obraSocial?.nombre} ${obraSocial?.apellido}`.trim()}</strong>.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-[var(--color-state-error)]/10 border border-[var(--color-state-error)]/20 rounded-[var(--radius-base)]">
          <svg className="w-5 h-5 text-[var(--color-state-error)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-[14px] text-red-800">
            <strong className="font-bold block">Error al procesar el archivo</strong>
            {error}
          </p>
        </div>
      )}

      {disabled ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 bg-gray-50 flex flex-col items-center justify-center gap-4 text-center cursor-not-allowed">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <p className="text-gray-700 font-bold text-base">Carga de Archivo Deshabilitada</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Complete la configuración del Paso 1 (Obra Social, Unidad de Negocio y Período) para poder subir el archivo.
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-6 transition-all duration-200 cursor-pointer
            ${arrastrando ? 'border-[#1FAE6D] bg-[#1FAE6D]/5 scale-[1.01]' : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400'}
          `}
          onDragOver={(e) => { e.preventDefault(); !disabled && setArrastrando(true); }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
            <svg className={`w-8 h-8 transition-colors ${arrastrando ? 'text-[#178F58]' : 'text-[#1FAE6D]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div className="text-center flex flex-col gap-2">
            <p className="text-gray-900 font-black text-lg">
              {cargando ? "Leyendo archivo..." : "Haz clic para subir un archivo"}
            </p>
            <p className="text-gray-500 text-xs font-semibold">
              o arrastrá y soltá aquí el archivo Excel (.xlsx o .xls)
            </p>
            {obraSocial && (
              <p className="text-[11px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md font-bold mt-2 inline-block border border-emerald-200/60 uppercase tracking-wider">
                Liquidación para: {obraSocial.razonSocial || `${obraSocial.nombre} ${obraSocial.apellido}`.trim()}
              </p>
            )}
          </div>

          {cargando && (
            <div className="w-full max-w-xs mt-4">
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#1FAE6D] w-1/3 animate-pulse rounded-full" />
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .xls"
            disabled={cargando || disabled}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                procesarArchivo(e.target.files[0]);
              }
            }}
          />
        </div>
      )}

      {!isIntegrated && (
        <div className="mt-auto pt-8 flex border-t border-[var(--color-neutral-border)] mt-8">
          <button
            onClick={onVolver}
            className="bg-[var(--color-neutral-surface)] border border-[var(--color-neutral-border)] text-[var(--color-neutral-text-main)] px-8 py-3 rounded-[var(--radius-base)] font-bold hover:bg-[var(--color-neutral-bg)] hover:border-[var(--color-neutral-placeholder)] transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
        </div>
      )}
    </div>
  );
};

export default PasoCargaArchivo;
