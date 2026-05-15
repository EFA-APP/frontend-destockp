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
        const isAlbor = data.length > 0 && (data[0]['Código'] !== undefined && data[0]['Nivel'] !== undefined);

        let cuentasFinales = [];

        if (isAlbor) {
          // Ordenar por código para procesar jerarquía correctamente
          const sortedData = [...data].sort((a, b) => String(a.Código).localeCompare(String(b.Código), undefined, { numeric: true }));

          const codigoToTipo = {
            '1': 'ACTIVO',
            '2': 'PASIVO',
            '3': 'PATRIMONIO',
            '4': 'RESULTADO_POSITIVO',
            '5': 'RESULTADO_NEGATIVO',
            '6': 'RESULTADO_NEGATIVO'
          };

          const mapaPadres = {}; 

          cuentasFinales = sortedData.map(row => {
            const codigo = String(row.Código).trim();
            // Limpiar nombres como "A C T I V O" -> "ACTIVO" o al menos normalizar espacios
            const nombre = String(row.Nombre).replace(/\s+/g, ' ').trim();
            const tipoRaw = String(row.Tipo);

            // Mapear tipo (usamos el primer dígito si el tipo no es directo)
            const tipo = codigoToTipo[tipoRaw] || codigoToTipo[codigo[0]] || 'ACTIVO';
            const imputable = String(row.Imputable).toLowerCase().includes('si');

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
              codigoPadreReferencia
            };
          });
        } else {
          // Mapear datos al DTO del backend (Formato estándar)
          cuentasFinales = data.map((row) => ({
            codigo: String(row.codigo || row.Código || row.CODIGO || ""),
            nombre: String(row.nombre || row.Nombre || row.NOMBRE || ""),
            tipo: String(row.tipo || row.Tipo || row.TIPO || "ACTIVO").toUpperCase().replace(" ", "_"),
            imputable: String(row.imputable || row.Imputable || row.IMPUTABLE || "").toLowerCase().includes("s") || row.imputable === true || String(row.imputable).toLowerCase() === "true",
            codigoPadreReferencia: row.padre || row.Padre || row.PADRE || row.codigoPadre || null,
          }));
        }

        if (cuentasFinales.length === 0) throw new Error("El archivo está vacío o no tiene el formato correcto.");

        // Validar campos obligatorios básicos
        const invalidos = cuentasFinales.filter(c => !c.codigo || !c.nombre);
        if (invalidos.length > 0) {
          throw new Error("Hay filas que no tienen código o nombre. Verifique el archivo.");
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
    <ModalDetalleBase open={isOpen} onClose={onClose} width="max-w-3xl">
      <div className="relative w-full bg-[var(--surface)] p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-blue-700/10 text-blue-700 flex items-center justify-center border border-blue-700/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
              <FileDown size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-black uppercase tracking-tight">
                Importar Plan de Cuentas
              </h2>
              <p className="text-[14px] text-black/40 font-medium">
                Suba su propio archivo Excel para cargar la estructura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isCargando}
            className="w-10 h-10 rounded-md flex items-center justify-center text-black/40 hover:text-black hover:bg-black/10 transition-all"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={isCargando}
            className="flex flex-col items-center justify-center p-12 bg-black/40 border-2 border-black/10 rounded-md hover:border-amber-600/50 hover:bg-amber-600/5 transition-all group relative overflow-hidden"
          >
            <div className="w-20 h-20 bg-amber-600/10 rounded-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={48} className="text-amber-600" />
            </div>
            <span className="font-black text-[18px] text-black uppercase tracking-wider">
              Subir Archivo Excel
            </span>
            <span className="text-[12px] text-black/40 mt-4 text-center font-bold leading-relaxed max-w-sm">
              SOPORTA FORMATOS .XLSX / .CSV CON ESTRUCTURA ALBOR O ESTÁNDAR
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={manejarExcel}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
          </button>
        </div>

        {isCargando && (
          <div className="flex flex-col items-center gap-3 py-4 animate-pulse">
            <div className="w-full h-1 bg-black/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-700 animate-[loading_1.5s_infinite]"></div>
            </div>
            <span className="text-[12px] font-black text-blue-700 uppercase tracking-widest">
              {procesandoExcel ? "Procesando archivo..." : "Importando estructura..."}
            </span>
          </div>
        )}

        <div className="bg-black/5 rounded-md p-4 border border-black/5">
          <p className="text-[12px] text-black/40 font-medium leading-relaxed italic text-center">
            Nota: El Excel debe contener las columnas: <span className="font-bold">codigo, nombre, tipo, imputable</span> y opcionalmente <span className="font-bold">padre</span>.
            La importación reemplazará cualquier estructura existente sin movimientos.
          </p>
        </div>
      </div>
    </ModalDetalleBase>
  );
};

export default ModalImportarPlan;
