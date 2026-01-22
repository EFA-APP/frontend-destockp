import { useState } from "react";
import TablaReutilizable from "../../UI/TablaReutilizable/TablaReutilizable";
import TarjetaInformacion from "../../UI/TarjetaInformacion/TarjetaInformacion";
import ModalDetalleGenerico from "../../UI/ModalDetalleBase/ModalDetalleGenerico";
import { columnasMisComprobantesAFIP } from "./ColumnaComprobantesAFIP";
import { useMisComprobantesAFIP } from "../../../api/hooks/MisComprobantesAFIP/useMisComprobantesAFIP";
import { accionesMisComprobantesAFIP } from "./Acciones";
import { useNavigate } from "react-router-dom";
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
        width="w-[420px]"
      />

      {/* Cards AFIP */}
      <div className="grid grid-cols-3 gap-4">
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
      <div className="px-6 py-4 card bg-[var(--fill)] shadow-md rounded-md">
        <TablaReutilizable
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
                className="w-auto h-10 px-2 text-left text-violet-400! rounded-md! bg-violet-500/10! flex items-center gap-2 cursor-pointer hover:bg-violet-500/5!"
                onClick={() =>
                  document.getElementById("importar-excel").click()
                }
              >
                <DescargarIcono />
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
    </div>
  );
};

export default TablaMisComprobantesAFIP;
