import { useState } from "react";
import { CajaIcono } from "../../../../assets/Icons";
import { getPrecio } from "../../../../Backend/Comprobantes/fiscal.utils";
import SelectorArticuloModal from "./SelectorArticuloModal";
import CarritoDetalle from "./CarritoDetalle";
import DetallePago from "./DetallePago";

const CODIGOS_NOTA_CREDITO = [3, 8, 13, 994];

const BuscadorDetalle = ({
  tipoOperacion,
  detalle,
  pagos,
  setPagos,
  vueltos,
  setVueltos,
  codigoTipoComprobante,
  montoPreCargado = null,
  montosSugeridos = [],
  otrosTributos = 0,
  setOtrosTributos,
  highlightStock = 0,
  condicionComprobante = null,
  // Feature "egreso-distribucion-unidad-negocio" (R29, R41): calculadas en
  // Egresos.jsx (elegibilidad R2 + `cabecera.unidadesNegocio.length > 1`),
  // sin valor útil en cualquier otra pestaña (Ingreso, etc. — quedan en su
  // default `false`/`[]`, no rompe nada existente).
  permiteRepartoUnidadNegocio = false,
  unidadesNegocio = [],
}) => {
  const {
    tipoDetalle,
    setTipoDetalle,
    codigoBusqueda,
    setCodigoBusqueda,
    resultadosBusqueda,
    cargandoBusqueda,
    columnaPrecioSeleccionada,
    items,
    agregarItem,
    actualizarCantidadItem,
    actualizarPrecioItem,
    actualizarTasaIvaItem,
    actualizarTipoFiscalItem,
    actualizarDevolverAStockItem,
    actualizarRepartoItem,
    quitarRepartoItem,
    quitarItem,
    subtotalSinIva,
    totalIva,
    totalGeneral,
  } = detalle;

  const [isOpen, setIsOpen] = useState(false);
  const precioUnitarioInicial = montoPreCargado > 0 ? montoPreCargado : "";
  const esNotaCredito = CODIGOS_NOTA_CREDITO.includes(
    Number(codigoTipoComprobante),
  );

  const totalRecargo = pagos.reduce((sum, p) => {
    const r = parseFloat(p.datosTarjeta?.recargo) || 0;
    if (r <= 0) return sum;
    return sum + p.monto - p.monto / (1 + r / 100);
  }, 0);

  return (
    <div className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* SELECTOR TIPO DETALLE */}
      <div className="flex w-full sm:w-fit bg-white p-1 rounded-md border border-gray-200 shadow-sm gap-1 mb-2">
        {tipoOperacion === "EGRESO" && (
          <button
            type="button"
            onClick={() => setTipoDetalle("MATERIA_PRIMA")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${tipoDetalle === "MATERIA_PRIMA" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
          >
            Materia Prima
          </button>
        )}
        <button
          type="button"
          onClick={() => setTipoDetalle("PRODUCTO")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${tipoDetalle === "PRODUCTO" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
        >
          Producto
        </button>
        <button
          type="button"
          onClick={() => setTipoDetalle("CUENTA_CONTABLE")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${tipoDetalle === "CUENTA_CONTABLE" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
        >
          Servicios
        </button>
      </div>

      {/* AGREGAR DETALLE */}
      <div className="relative flex items-center mb-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 rounded-md bg-[#1FAE6D] hover:bg-[#178F58] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm uppercase tracking-wider text-xs font-bold"
          title="Agregar detalle manualmente"
        >
          <CajaIcono className="w-5 h-5 text-white" />
          <span>Agregar Detalle</span>
        </button>
      </div>

      {/* CARRITO */}
      <CarritoDetalle
        items={items}
        actualizarCantidadItem={actualizarCantidadItem}
        actualizarPrecioItem={actualizarPrecioItem}
        actualizarTasaIvaItem={actualizarTasaIvaItem}
        actualizarTipoFiscalItem={actualizarTipoFiscalItem}
        actualizarDevolverAStockItem={actualizarDevolverAStockItem}
        highlightStock={highlightStock}
        quitarItem={quitarItem}
        subtotalSinIva={subtotalSinIva}
        totalIva={totalIva}
        totalGeneral={totalGeneral}
        totalRecargo={totalRecargo}
        codigoTipoComprobante={codigoTipoComprobante}
        esNotaCredito={esNotaCredito}
        otrosTributos={otrosTributos}
        setOtrosTributos={setOtrosTributos}
        permiteRepartoUnidadNegocio={permiteRepartoUnidadNegocio}
        unidadesNegocio={unidadesNegocio}
        actualizarRepartoItem={actualizarRepartoItem}
        quitarRepartoItem={quitarRepartoItem}
      />

      {/* PAGO */}
      <DetallePago
        totalComprobante={totalGeneral + (otrosTributos || 0)}
        tipoOperacion={tipoOperacion}
        pagos={pagos}
        setPagos={setPagos}
        vueltos={vueltos}
        setVueltos={setVueltos}
        condicionComprobante={condicionComprobante}
      />

      {/* MODAL */}
      <SelectorArticuloModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tipoDetalle={tipoDetalle}
        articulos={resultadosBusqueda}
        cargando={cargandoBusqueda}
        codigoBusqueda={codigoBusqueda}
        setCodigoBusqueda={setCodigoBusqueda}
        agregarItem={agregarItem}
        getPrecio={getPrecio}
        columnaPrecioSeleccionada={columnaPrecioSeleccionada}
        montoPreCargado={precioUnitarioInicial}
        montosSugeridos={montosSugeridos}
      />
    </div>
  );
};

export default BuscadorDetalle;
