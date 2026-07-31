import React, { useRef, useState } from "react";
import { X, FileDown, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import ModalDetalleBase from "../../UI/ModalDetalleBase/ModalDetalleBase";
import { usePlanDeCuentas } from "../../../Backend/hooks/Contabilidad/PlanDeCuenta/usePlanDeCuentas";
import { useAlertas } from "../../../store/useAlertas";

const ModalImportarPlan = ({ isOpen, onClose }) => {
  const { importarPlanBase, isImportando } = usePlanDeCuentas();
  const { agregarAlerta } = useAlertas();
  const fileInputRef = useRef(null);
  const [procesandoExcel, setProcesandoExcel] = useState(false);

  const manejarExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProcesandoExcel(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Detectar si es formato Albor (basado en headers)
        const isAlbor =
          data.length > 0 &&
          data[0]["Código"] !== undefined &&
          data[0]["Nivel"] !== undefined;

        let cuentasFinales = [];

        if (isAlbor) {
          // Ordenar por código para procesar jerarquía correctamente
          const sortedData = [...data].sort((a, b) =>
            String(a.Código).localeCompare(String(b.Código), undefined, {
              numeric: true,
            }),
          );

          const codigoToTipo = {
            1: "ACTIVO",
            2: "PASIVO",
            3: "PATRIMONIO",
            4: "RESULTADO_POSITIVO",
            5: "RESULTADO_NEGATIVO",
            6: "RESULTADO_NEGATIVO",
          };

          const mapaPadres = {};

          cuentasFinales = sortedData.map((row) => {
            const codigo = String(row.Código).trim();
            // Limpiar nombres como "A C T I V O" -> "ACTIVO" o al menos normalizar espacios
            const nombre = String(row.Nombre).replace(/\s+/g, " ").trim();
            const tipoRaw = String(row.Tipo);

            // Mapear tipo (usamos el primer dígito si el tipo no es directo)
            const tipo =
              codigoToTipo[tipoRaw] || codigoToTipo[codigo[0]] || "ACTIVO";
            const imputable = String(row.Imputable)
              .toLowerCase()
              .includes("si");

            // Reconstrucción de Jerarquía: Encontrar padre (prefijo más largo ya registrado)
            let codigoPadreReferencia = null;
            for (let i = codigo.length - 1; i >= 1; i--) {
              const prefix = codigo.substring(0, i);
              if (mapaPadres[prefix]) {
                codigoPadreReferencia = prefix;
                break;
              }
            }

            mapaPadres[codigo] = true;

            return {
              codigo,
              nombre,
              tipo,
              imputable,
              codigoPadreReferencia,
            };
          });
        } else {
          // Mapear datos al DTO del backend (Formato estándar)
          cuentasFinales = data.map((row) => ({
            codigo: String(row.codigo || row.Código || row.CODIGO || ""),
            nombre: String(row.nombre || row.Nombre || row.NOMBRE || ""),
            tipo: String(row.tipo || row.Tipo || row.TIPO || "ACTIVO")
              .toUpperCase()
              .replace(" ", "_"),
            imputable:
              String(row.imputable || row.Imputable || row.IMPUTABLE || "")
                .toLowerCase()
                .includes("s") ||
              row.imputable === true ||
              String(row.imputable).toLowerCase() === "true",
            codigoPadreReferencia:
              row.padre || row.Padre || row.PADRE || row.codigoPadre || null,
          }));
        }

        if (cuentasFinales.length === 0)
          throw new Error(
            "El archivo está vacío o no tiene el formato correcto.",
          );

        // Validar campos obligatorios básicos
        const invalidos = cuentasFinales.filter((c) => !c.codigo || !c.nombre);
        if (invalidos.length > 0) {
          throw new Error(
            "Hay filas que no tienen código o nombre. Verifique el archivo.",
          );
        }

        await importarPlanBase({ cuentas: cuentasFinales });

        agregarAlerta({
          type: "success",
          message: `Se importaron ${cuentasFinales.length} cuentas correctamente.`,
        });
        onClose();
      } catch (error) {
        console.error(error);
        agregarAlerta({
          type: "error",
          message: error.message || "Error al procesar el archivo Excel.",
        });
      } finally {
        setProcesandoExcel(false);
      }
    };

    reader.readAsBinaryString(file);
    // Limpiar input para poder subir el mismo archivo si falla
    e.target.value = null;
  };

  if (!isOpen) return null;

  const isCargando = isImportando || procesandoExcel;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <FileDown size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-gray-800">
                Importar Plan de Cuentas
              </h2>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Subí tu archivo Excel (.xlsx / .csv)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isCargando}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={isCargando}
            className="w-full flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition-all group cursor-pointer"
          >
            <div className="w-16 h-16 bg-blue-100/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={36} className="text-blue-600" />
            </div>
            <span className="font-black text-sm text-gray-800 uppercase tracking-wider">
              Seleccionar Archivo Excel
            </span>
            <span className="text-[11px] text-gray-400 mt-2 text-center font-bold max-w-sm uppercase tracking-widest">
              Soporta estructura Albor o Estándar (.xlsx / .csv)
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={manejarExcel}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
          </button>

          {isCargando && (
            <div className="flex flex-col items-center gap-3 py-2 animate-pulse">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-[loading_1.5s_infinite]"></div>
              </div>
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
                {procesandoExcel
                  ? "Procesando archivo..."
                  : "Importando estructura..."}
              </span>
            </div>
          )}

          <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic text-center">
              Nota: El Excel debe contener las columnas:{" "}
              <span className="font-bold text-gray-700">
                codigo, nombre, tipo, imputable
              </span>{" "}
              y opcionalmente{" "}
              <span className="font-bold text-gray-700">padre</span>.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isCargando}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalImportarPlan;
