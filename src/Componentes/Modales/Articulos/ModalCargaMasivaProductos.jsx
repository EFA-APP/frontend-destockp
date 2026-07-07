import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { ImportarProductosApi } from "../../../Backend/Articulos/api/Producto/producto.api";
import { useConfiguracionProducto } from "../../../Backend/Articulos/queries/Producto/useConfiguracionProducto.query";
import ModalDetalleBase from "../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../UI/ModalDetalleBase/ModalDetalle";
import { GuardarIcono, MovimientoIcono } from "../../../assets/Icons";
import {
  Trash2,
  Package,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const ModalCargaMasivaProductos = ({ open, onClose, onExito }) => {
  const [fileData, setFileData] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const { data: configData } = useConfiguracionProducto({ enabled: open });

  const configuracion = useMemo(() => {
    return Array.isArray(configData) ? configData : [];
  }, [configData]);

  const descargarPlantilla = () => {
    let headers = [];
    if (configuracion.length > 0) {
      // Estructura simplificada cuando hay configuración
      headers = ["Nombre (Obligatorio)", "Descripción", "Stock Total"];
    } else {
      // Estructura base completa
      headers = [
        "Nombre (Obligatorio)",
        "Descripción",
        "Unidad Medida (PAQUETE/FRASCO)",
        "Cant. Paquetes",
        "Cant. x Paquete",
        "Sobran",
        "Stock Total",
      ];
    }

    // Agregar campos dinámicos
    configuracion.forEach((c) => {
      headers.push(c.nombreCampo + (c.requerido ? " (Obligatorio)" : ""));
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
    XLSX.writeFile(workbook, "plantilla_carga_masiva_productos.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (data.length <= 1) {
        setError("El archivo está vacío o no tiene encabezados.");
        return;
      }

      const rows = data.slice(1);
      const hayConfig = configuracion.length > 0;

      const parsedRows = rows
        .map((row) => {
          const item = {};

          if (hayConfig) {
            // Mapeo para estructura simplificada
            item.nombre = row[0];
            item.descripcion = row[1];
            item.stock = parseFloat(row[2]) || 0;
            // Valores por defecto para el DTO
            item.unidadMedida = "PAQUETE";
            item.cantidadDepaquetesActuales = 0;
            item.cantidadPorPaquete = 0;
            item.cantidadSobrante = 0;

            // Atributos dinámicos empiezan en columna 3
            item.atributos = {};
            configuracion.forEach((c, index) => {
              const colIndex = 3 + index;
              if (row[colIndex] !== undefined) {
                item.atributos[c.claveCampo] = row[colIndex];
              }
            });
          } else {
            // Mapeo para estructura base
            item.nombre = row[0];
            item.descripcion = row[1];
            item.unidadMedida = row[2] === "FRASCO" ? "FRASCO" : "PAQUETE";
            item.cantidadDepaquetesActuales = parseFloat(row[3]) || 0;
            item.cantidadPorPaquete = parseFloat(row[4]) || 0;
            item.cantidadSobrante = parseFloat(row[5]) || 0;
            item.stock = parseFloat(row[6]) || 0;

            item.atributos = {};
            // En teoría no hay config, pero por si acaso
            configuracion.forEach((c, index) => {
              const colIndex = 7 + index;
              if (row[colIndex] !== undefined) {
                item.atributos[c.claveCampo] = row[colIndex];
              }
            });
          }

          return item;
        })
        .filter((i) => i.nombre);

      setFileData(parsedRows);
      setError(null);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    if (fileData.length === 0 || cargando) return;

    setCargando(true);
    try {
      await ImportarProductosApi(fileData);
      onExito && onExito();
      handleClose();
    } catch (e) {
      console.error("Error en carga masiva:", e);
      setError(
        e.response?.data?.message || "Error al procesar la carga masiva.",
      );
    } finally {
      setCargando(false);
    }
  };

  const handleClose = () => {
    setFileData([]);
    setError(null);
    onClose();
  };

  const content = (
    <div className="space-y-6 py-2">
      {/* Botones de acción principal */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={descargarPlantilla}
          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-emerald-50 border border-[var(--color-neutral-border)] rounded-[12px] text-emerald-600 transition-colors group cursor-pointer shadow-sm"
        >
          <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
          <div className="text-left">
            <div className="text-[13px] font-semibold text-[var(--color-neutral-text-main)]">
              Descargar Plantilla
            </div>
            <div className="text-[12px] text-[var(--color-neutral-text-muted)]">Formato Excel (.xlsx)</div>
          </div>
        </button>

        <label className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-blue-50 border border-[var(--color-neutral-border)] rounded-[12px] text-blue-600 transition-colors cursor-pointer group shadow-sm">
          <FileSpreadsheet size={20} />
          <div className="text-left">
            <div className="text-[13px] font-semibold text-[var(--color-neutral-text-main)]">
              Subir Archivo
            </div>
            <div className="text-[12px] text-[var(--color-neutral-text-muted)]">
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

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-[10px] p-4 flex items-center gap-3 text-rose-700 text-[13px] font-semibold shadow-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Previsualización */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <label className="text-[13px] font-semibold text-[var(--color-neutral-text-main)] uppercase tracking-wide">
            Previsualización de Datos
          </label>
          <span className="text-[12px] font-bold text-[var(--color-brand-primary)] bg-[var(--color-brand-soft)] px-2.5 py-1 rounded-full">
            {fileData.length} productos detectados
          </span>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {fileData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--color-neutral-text-muted)] border-2 border-dashed border-[var(--color-neutral-border)] rounded-[12px] bg-gray-50/50">
              <FileSpreadsheet
                size={48}
                strokeWidth={1.5}
                className="mb-4 opacity-30"
              />
              <p className="text-[14px] font-semibold tracking-wide text-[var(--color-neutral-text-main)]">
                No hay datos para mostrar
              </p>
              <p className="text-[12px] mt-1 text-[var(--color-neutral-text-muted)]">
                Sube un archivo para comenzar
              </p>
            </div>
          ) : (
            fileData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-white p-4 rounded-[12px] border border-[var(--color-neutral-border)] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-[10px] bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                  <Package size={20} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-[var(--color-neutral-text-main)] truncate">
                    {item.nombre}
                  </div>
                  <div className="flex items-center gap-2 mt-1 overflow-hidden">
                    <span className="text-[12px] text-[var(--color-neutral-text-muted)] font-bold">
                      {item.unidadMedida}
                    </span>
                    <span className="text-[12px] text-[var(--color-neutral-text-muted)]">•</span>
                    <span className="text-[12px] text-[var(--color-brand-primary)] font-bold whitespace-nowrap bg-[var(--color-brand-soft)] px-2 rounded-[4px]">
                      Stock: {item.stock}
                    </span>
                    {Object.keys(item.atributos).length > 0 && (
                      <>
                        <span className="text-[12px] text-[var(--color-neutral-text-muted)]">•</span>
                        <span className="text-[12px] text-blue-600 font-bold truncate bg-blue-50 px-2 rounded-[4px]">
                          +{Object.keys(item.atributos).length} campos
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <CheckCircle2 size={20} className="text-[var(--color-brand-primary)]" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full border-t border-[var(--color-neutral-border)] pt-4 mt-2">
      <button
        onClick={handleClose}
        className="px-6 py-2.5 text-[13px] font-semibold text-[var(--color-neutral-text-main)] hover:bg-gray-50 border border-[var(--color-neutral-border)] rounded-[10px] transition-colors"
      >
        Cancelar
      </button>
      <button
        onClick={handleSubmit}
        disabled={fileData.length === 0 || cargando}
        className="flex items-center gap-2 px-8 py-2.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-50 text-white rounded-[10px] font-semibold text-[13px] transition-colors shadow-sm"
      >
        {cargando ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <GuardarIcono size={18} />
        )}
        {cargando ? "Importando..." : "Realizar Carga Masiva"}
      </button>
    </div>
  );

  return (
    <ModalDetalleBase open={open} onClose={handleClose} width="max-w-2xl">
      <ModalDetalle
        title="Carga Masiva de Productos"
        icon={<MovimientoIcono size={20} />}
        onClose={handleClose}
        footer={footer}
      >
        {content}
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalCargaMasivaProductos;
