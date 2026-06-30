import { useState } from "react";
import { CajaIcono } from "../../../../assets/Icons";
import { getPrecio } from "../../../../Backend/Comprobantes/fiscal.utils";
import SelectorArticuloModal from "./SelectorArticuloModal";
import CarritoDetalle from "./CarritoDetalle";
import DetallePago from "./DetallePago";

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
    quitarItem,
    subtotalSinIva,
    totalIva,
    totalGeneral,
  } = detalle;

  const [isOpen, setIsOpen] = useState(false);
  const precioUnitarioInicial = montoPreCargado > 0 ? montoPreCargado : '';

  const totalRecargo = pagos.reduce((sum, p) => {
    const r = parseFloat(p.datosTarjeta?.recargo) || 0;
    if (r <= 0) return sum;
    return sum + p.monto - p.monto / (1 + r / 100);
  }, 0);

  return (
    <>
      {/* SELECTOR TIPO DETALLE */}
      <div className="flex p-1 px-4 rounded-md border-b border-gray-700/20  w-auto mb-1 gap-2">
        <div className="flex w-full bg-gray-300 rounded-md">
          {tipoOperacion === "EGRESO" && (
            <button
              type="button"
              onClick={() => setTipoDetalle("MATERIA_PRIMA")}
              className={`flex-1 py-2 rounded-md text-md font-semibold uppercase tracking-wider transition-all ${tipoDetalle === "MATERIA_PRIMA" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-850 hover:bg-gray-105/50"}`}
            >
              Materia Prima
            </button>
          )}
          <button
            type="button"
            onClick={() => setTipoDetalle("PRODUCTO")}
            className={`flex-1 py-2 rounded-md text-md font-semibold uppercase tracking-wider transition-all ${tipoDetalle === "PRODUCTO" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-850 hover:bg-gray-105/50"}`}
          >
            Producto
          </button>
          <button
            type="button"
            onClick={() => setTipoDetalle("CUENTA_CONTABLE")}
            className={`flex-1 py-2 rounded-md text-md font-semibold uppercase tracking-wider transition-all ${tipoDetalle === "CUENTA_CONTABLE" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-850 hover:bg-gray-105/50"}`}
          >
            Servicios
          </button>
        </div>
      </div>

      {/* AGREGAR DETALLE */}
      <div className="relative flex justify-center items-center  focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/10 transition h-[50px] items-center justify-between px-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded-md bg-[var(--primary)]/10 bg-[var(--primary)] text-[var(--primary)] hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
          title="Agregar detalle manualmente"
        >
          <CajaIcono className="w-5 h-5" />
          <p className="font-bold">Agregar Detalle</p>
        </button>
      </div>

      {/* CARRITO */}
      <CarritoDetalle
        items={items}
        actualizarCantidadItem={actualizarCantidadItem}
        actualizarPrecioItem={actualizarPrecioItem}
        actualizarTasaIvaItem={actualizarTasaIvaItem}
        actualizarTipoFiscalItem={actualizarTipoFiscalItem}
        quitarItem={quitarItem}
        subtotalSinIva={subtotalSinIva}
        totalIva={totalIva}
        totalGeneral={totalGeneral}
        totalRecargo={totalRecargo}
        codigoTipoComprobante={codigoTipoComprobante}
        otrosTributos={otrosTributos}
        setOtrosTributos={setOtrosTributos}
      />

      {/* PAGO */}
      <DetallePago
        totalComprobante={totalGeneral}
        tipoOperacion={tipoOperacion}
        pagos={pagos}
        setPagos={setPagos}
        vueltos={vueltos}
        setVueltos={setVueltos}
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
    </>
  );
};

export default BuscadorDetalle;
