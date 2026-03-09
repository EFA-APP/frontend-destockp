import { useState } from "react";
import DataTable from "../../UI/DataTable/DataTable";
import TarjetaInformacion from "../../UI/TarjetaInformacion/TarjetaInformacion";
import { columnasMisComprobantesAFIP } from "./ColumnaComprobantesAFIP";
import { accionesMisComprobantesAFIP } from "./AccionesMisComprobantesAFIP";
import { useNavigate } from "react-router-dom";
import { useMisComprobantesAFIP } from "../../../Backend/hooks/MisComprobantesAFIP/useMisComprobantesAFIP";
import ModalDetalleGenerico from "../../UI/ModalDetalleBase/ModalDetalleGenerico";
import { DescargarIcono } from "../../../assets/Icons";

const TablaMisComprobantesAFIP = () => {
  const { comprobantesAFIP, faltantes, cargados } = useMisComprobantesAFIP();

  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState(null);

  const handleVerDetalle = (comprobante) => {
    setComprobanteSeleccionado(comprobante);
    setModalAbierto(true);
  };

  const handleGenerarComprobante = (fila) => {
    navigate("/panel/compras/facturas-proveedores/nueva", {
      state: { comprobante: fila }, // opcional
    });
  };

  // 📊 Métricas
  const totalImporte = comprobantesAFIP.reduce((acc, c) => acc + c.total, 0);

  const totalFaltantes = faltantes.length;
  const totalCargados = cargados.length;

  return (
    <div className="space-y-4">
      {/* Modal Detalle */}
      <ModalDetalleGenerico
        mode="vista"
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        data={comprobanteSeleccionado}
        accentColor="indigo"
      />

      {/* Cards AFIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TarjetaInformacion
          titulo="Comprobantes AFIP"
          color="text-blue-400"
          numero={comprobantesAFIP.length}
        />

        <TarjetaInformacion
          titulo="Faltantes"
          color="text-yellow-400"
          numero={totalFaltantes}
        />

        <TarjetaInformacion
          titulo="Importe Total"
          color="text-green-400"
          valorMoneda
          numero={totalImporte}
        />
      </div>

      {/* Tabla */}
      <DataTable
        columnas={columnasMisComprobantesAFIP}
        datos={comprobantesAFIP}
        mostrarAcciones={true}
        acciones={accionesMisComprobantesAFIP({
          handleVerDetalle,
          handleGenerarComprobante,
        })}
        mostrarBuscador
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Buscar por proveedor, CUIT o comprobante..."
        elementosSuperior={
          <div className="flex items-center justify-center">
            <button
              type="button"
              className="group flex items-center gap-2 px-4 py-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg hover:bg-violet-500/20 transition-all text-[11px] font-bold uppercase tracking-wider cursor-pointer"
              onClick={() =>
                document.getElementById("importar-excel").click()
              }
            >
              <DescargarIcono size={14} />
              Importar Excel / CSV
            </button>

            <input
              id="importar-excel"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  console.log("Archivo seleccionado:", file);
                }
              }}
            />
          </div>
        }
      />
    </div>
  );
};

export default TablaMisComprobantesAFIP;
