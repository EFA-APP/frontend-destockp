import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  ImportarContactosApi,
  ListarConfiguracionCamposApi,
  ListarEntidadesApi,
} from "../../../Backend/Contactos/api/contactos.api";
import ModalDetalleBase from "../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../UI/ModalDetalleBase/ModalDetalle";
import {
  GuardarIcono,
  MovimientoIcono,
  CuentaIcono,
} from "../../../assets/Icons";
import {
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

/**
 * Modal Premium para Carga Masiva de Contactos
 */
const ModalCargaMasivaContactos = ({ open, onClose, onExito }) => {
  const [fileData, setFileData] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [configuraciones, setConfiguraciones] = useState([]);
  const [entidadSeleccionada, setEntidadSeleccionada] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      cargarCatalogos();
    }
  }, [open]);

  const cargarCatalogos = async () => {
    try {
      const [ents, configs] = await Promise.all([
        ListarEntidadesApi(),
        ListarConfiguracionCamposApi(),
      ]);
      setEntidades(ents);
      setConfiguraciones(configs);
    } catch (e) {
      console.error("Error al cargar catálogos:", e);
    }
  };

  const configActual = useMemo(() => {
    if (!entidadSeleccionada) return [];
    return configuraciones.filter(
      (c) => c.entidadClave === entidadSeleccionada,
    );
  }, [entidadSeleccionada, configuraciones]);

  const descargarPlantilla = () => {
    if (!entidadSeleccionada) {
      setError(
        "Por favor, seleccioná primero qué tipo de contacto vas a cargar.",
      );
      return;
    }

    let headers = [
      "Nombre",
      "Apellido",
      "Razón Social",
      "Documento",
      "Condición IVA (CF/RI/MO/EX)",
    ];

    // Agregar campos dinámicos
    configActual.forEach((c) => {
      let label = c.nombreCampo;

      if (
        c.tipoDato === "LISTA" &&
        Array.isArray(c.opciones) &&
        c.opciones.length > 0
      ) {
        label += ` (${c.opciones.join("/")})`;
      } else if (c.tipoDato === "BOOLEANO") {
        label += " (SI/NO)";
      }

      if (c.requerido) {
        label += " (Obligatorio)";
      }

      headers.push(label);
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
    XLSX.writeFile(
      workbook,
      `plantilla_importar_${entidadSeleccionada.toLowerCase()}.xlsx`,
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!entidadSeleccionada) {
      setError("Seleccioná la entidad antes de subir el archivo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (data.length <= 1) {
          setError("El archivo está vacío o no tiene encabezados.");
          return;
        }

        const headers = data[0].map(
          (h) => h?.toString().toLowerCase().trim() || "",
        );
        const rows = data.slice(1);

        const idxMap = {
          nombre: headers.indexOf("nombre"),
          apellido: headers.indexOf("apellido"),
          razonSocial: headers.indexOf("razón social"),
          documento: headers.indexOf("documento"),
          iva: headers.findIndex((h) => h.includes("iva")),
        };
        const parsedRows = rows
          .map((row) => {
            const item = {
              tipoEntidad: entidadSeleccionada,
              nombre: idxMap.nombre !== -1 ? row[idxMap.nombre] || "" : "",
              apellido:
                idxMap.apellido !== -1 ? row[idxMap.apellido] || "" : "",
              razonSocial:
                idxMap.razonSocial !== -1 ? row[idxMap.razonSocial] || "" : "",
              documento:
                idxMap.documento !== -1
                  ? row[idxMap.documento]?.toString() || ""
                  : "",
              condicionIva: idxMap.iva !== -1 ? row[idxMap.iva] || "CF" : "CF",
              atributos: {},
            };

            configActual.forEach((c) => {
              const nombreBusqueda = c.nombreCampo.toLowerCase().trim();
              const colIndex = headers.findIndex((h) =>
                h.includes(nombreBusqueda),
              );

              if (colIndex !== -1 && row[colIndex] !== undefined) {
                item.atributos[c.claveCampo] = row[colIndex];
              }
            });

            return item;
          })
          .filter((i) => i.nombre || i.razonSocial);

        setFileData(parsedRows);
        setError(null);
      } catch (err) {
        setError("Error al procesar el archivo Excel.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    if (fileData.length === 0 || cargando) return;

    setCargando(true);
    try {
      await ImportarContactosApi(fileData);
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
    setEntidadSeleccionada("");
    onClose();
  };

  const content = (
    <div className="space-y-6 py-2">
      {/* Selector de Entidad */}
      <div className="space-y-2">
        <label className="text-[12px] font-black text-black/30 uppercase tracking-[0.2em] ml-1">
          1. Seleccioná el tipo de Contacto
        </label>
        <div className="grid grid-cols-2 gap-2">
          {entidades.map((ent) => (
            <button
              key={ent.clave}
              onClick={() => {
                setEntidadSeleccionada(ent.clave);
                setFileData([]);
                setError(null);
              }}
              className={`p-3 rounded-xl border flex items-center gap-3  ${
                entidadSeleccionada === ent.clave
                  ? "bg-[var(--primary)]/10 border-[var(--primary)] text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                  : "bg-white/[0.02] border-black/5 text-black/40 hover:bg-black/5"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  entidadSeleccionada === ent.clave
                    ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                    : "bg-black/5 text-black/20"
                }`}
              >
                <CuentaIcono size={16} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">
                {ent.nombre}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Botones de acción Excel */}
      {entidadSeleccionada && (
        <div className="flex flex-wrap gap-4    ">
          <button
            onClick={descargarPlantilla}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-emerald-700/10 hover:bg-emerald-700/20 border border-emerald-700/20 rounded-2xl text-emerald-400  group"
          >
            <Download size={20} className="group-hover:-translate-y-1 " />
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider">
                Planilla {entidadSeleccionada}
              </div>
              <div className="text-[12px] opacity-60">
                Descargar Formato .xlsx
              </div>
            </div>
          </button>

          <label className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 rounded-2xl text-[var(--primary)]  cursor-pointer group">
            <FileSpreadsheet size={20} className=" " />
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider">
                Subir Archivo
              </div>
              <div className="text-[12px] opacity-60">
                Seleccionar Excel listo
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
      )}

      {error && (
        <div className="bg-rose-700/10 border border-rose-700/20 rounded-2xl p-4 flex items-center gap-3 text-rose-400 text-xs font-bold   ">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Previsualización */}
      {fileData.length > 0 && (
        <div className="space-y-3   ">
          <div className="flex items-center justify-between px-1">
            <label className="text-[13px] font-bold text-black/50 uppercase tracking-widest">
              Previsualización
            </label>
            <span className="text-[12px] font-black text-[var(--primary)] uppercase">
              {fileData.length} registros detectados
            </span>
          </div>

          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {fileData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-white/[0.03] p-3 rounded-xl border border-black/5 hover:bg-white/[0.06] "
              >
                <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center border border-black/10 shrink-0">
                  <CuentaIcono size={14} className="text-black/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-black truncate">
                    {item.razonSocial || `${item.nombre} ${item.apellido}`}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-black/30 uppercase font-black">
                      {item.documento || "S/D"}
                    </span>
                    <span className="text-[11px] text-black/10">•</span>
                    <span className="text-[11px] text-[var(--primary)]/70 font-bold">
                      {item.condicionIva}
                    </span>
                  </div>
                  {Object.keys(item.atributos).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(item.atributos).map(([key, val]) => (
                        <span
                          key={key}
                          className="px-1.5 py-0.5 rounded bg-black/5 border border-black/10 text-[10px] font-black text-black/40 uppercase"
                        >
                          {key}: {val || "---"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <CheckCircle2 size={16} className="text-emerald-700/40" />
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
        className="px-6 py-2.5 text-xs font-black text-black/40 hover:text-black uppercase tracking-widest "
      >
        Cancelar
      </button>
      <button
        onClick={handleSubmit}
        disabled={fileData.length === 0 || cargando}
        className="flex items-center gap-3 px-8 py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:brightness-110 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-black rounded-xl font-black text-[13px] uppercase tracking-widest  shadow-xl shadow-[var(--primary)]/20 active:scale-95"
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
        title="Carga Masiva de Contactos"
        icon={<MovimientoIcono size={20} />}
        onClose={handleClose}
        footer={footer}
        width="max-w-xl"
      >
        {content}
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalCargaMasivaContactos;
