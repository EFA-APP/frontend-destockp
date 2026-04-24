import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { ImportarProductosApi } from "../../../Backend/Articulos/api/Producto/producto.api";
import { useConfiguracionProducto } from "../../../Backend/Articulos/queries/Producto/useConfiguracionProducto.query";
import ModalDetalleBase from "../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../UI/ModalDetalleBase/ModalDetalle";
import { GuardarIcono, MovimientoIcono } from "../../../assets/Icons";
import { Trash2, Package, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";

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
      headers = [
        "Nombre (Obligatorio)",
        "Descripción",
        "Stock Total"
      ];
    } else {
      // Estructura base completa
      headers = [
        "Nombre (Obligatorio)",
        "Descripción",
        "Unidad Medida (PAQUETE/FRASCO)",
        "Cant. Paquetes",
        "Cant. x Paquete",
        "Sobran",
        "Stock Total"
      ];
    }

    // Agregar campos dinámicos
    configuracion.forEach(c => {
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

      const parsedRows = rows.map((row) => {
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
      }).filter(i => i.nombre);

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
      setError(e.response?.data?.message || "Error al procesar la carga masiva.");
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
          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl text-emerald-400  group"
        >
          <Download size={20} className="group-hover:-translate-y-1 " />
          <div className="text-left">
            <div className="text-xs font-black uppercase tracking-wider">Descargar Plantilla</div>
            <div className="text-[12px] opacity-60">Formato Excel (.xlsx)</div>
          </div>
        </button>

        <label className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-2xl text-blue-400  cursor-pointer group">
          <FileSpreadsheet size={20} className=" " />
          <div className="text-left">
            <div className="text-xs font-black uppercase tracking-wider">Subir Archivo</div>
            <div className="text-[12px] opacity-60">Seleccionar Excel completado</div>
          </div>
          <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-400 text-xs font-bold   ">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Previsualización */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <label className="text-[13px] font-bold text-black/50 uppercase tracking-widest">Previsualización de Datos</label>
          <span className="text-[12px] font-black text-amber-500 uppercase">{fileData.length} productos detectados</span>
        </div>
        
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {fileData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-black/10 border-2 border-dashed border-black/5 rounded-3xl">
              <FileSpreadsheet size={48} strokeWidth={1} className="mb-4 opacity-10" />
              <p className="text-sm font-bold uppercase tracking-widest">No hay datos para mostrar</p>
              <p className="text-[12px] uppercase tracking-[0.2em] mt-1">Sube un archivo para comenzar</p>
            </div>
          ) : (
            fileData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-black/5 p-4 rounded-2xl border border-black/10 hover:bg-white/[0.08]   ">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <Package size={20} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-black truncate">{item.nombre}</div>
                  <div className="flex items-center gap-2 mt-0.5 overflow-hidden">
                    <span className="text-[12px] text-black/40 uppercase font-black">{item.unidadMedida}</span>
                    <span className="text-[12px] text-black/20">•</span>
                    <span className="text-[12px] text-amber-500/70 font-bold whitespace-nowrap">Stock: {item.stock}</span>
                    {Object.keys(item.atributos).length > 0 && (
                        <>
                            <span className="text-[12px] text-black/20">•</span>
                            <span className="text-[12px] text-emerald-500/70 font-bold truncate">+{Object.keys(item.atributos).length} campos</span>
                        </>
                    )}
                  </div>
                </div>
                <CheckCircle2 size={18} className="text-emerald-500/40" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between w-full">
      <button
        onClick={handleClose}
        className="px-6 py-2.5 text-xs font-black text-black/60 hover:text-black uppercase tracking-widest "
      >
        Cancelar
      </button>
      <button
        onClick={handleSubmit}
        disabled={fileData.length === 0 || cargando}
        className="flex items-center gap-3 px-8 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-black rounded-xl font-black text-[13px] uppercase tracking-widest  shadow-xl shadow-amber-500/20 active:scale-95"
      >
        {cargando ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full " />
        ) : (
          <GuardarIcono size={16} />
        )}
        {cargando ? "Importando..." : "Realizar Carga Masiva"}
      </button>
    </div>
  );

  return (
    <ModalDetalleBase open={open} onClose={handleClose}>
      <ModalDetalle
        title="Carga Masiva de Productos"
        icon={<MovimientoIcono size={20} />}
        onClose={handleClose}
        footer={footer}
        width="max-w-2xl"
      >
        {content}
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalCargaMasivaProductos;
